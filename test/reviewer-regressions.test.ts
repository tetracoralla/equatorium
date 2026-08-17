import { Ajv2020 } from "ajv/dist/2020.js";
import { describe, expect, expectTypeOf, it } from "vitest";
import {
  createDefaultRegistry,
  createRequestSchema,
  createResultSchema,
  defaultRegistry,
  ExpressionRegistry,
  interpret,
  interpretBatch,
  interpretBounded,
  type JsonObject,
  type ExpressionAdapter,
  type SemverMatchesResult,
  type SeiResult,
} from "../src/index.js";
import {
  interpretBatchBoundedInWorkers,
  interpretBoundedInWorker,
  WORKER_ADMISSION_LIMITS,
  workerAdmissionState,
} from "../src/core/bounded.js";

function expectFailure(result: SeiResult, code: string): void {
  expect(result.ok).toBe(false);
  expect(result.diagnostics[0]?.code).toBe(code);
}

function expectSuccess(result: SeiResult): Extract<SeiResult, { ok: true }> {
  expect(result.ok).toBe(true);
  if (!result.ok) throw new Error(result.diagnostics[0]?.message ?? "Expected success");
  return result;
}

describe("reviewer regressions: semantic preservation", () => {
  it.each(["*", "x", "*.*.*", ">=0.0.0"])(
    "serializes npm any-range %s without an undefined comparator",
    async (expression) => {
      const direct = expectSuccess(
        interpret({ op: "interpret", kind: "semver_range", expression }, defaultRegistry),
      );
      expect(direct.normalized).toBe("*");
      expect(direct.value).toEqual({ comparator_sets: [[]] });

      const bounded = await interpretBounded({
        op: "normalize",
        kind: "semver_range",
        expression,
      });
      expectSuccess(bounded);
      expect(bounded.normalized).toBe("*");
    },
  );

  it.each(["0127.0.0.1/8", "2130706433/8"])(
    "rejects non-decimal-four-part IPv4 CIDR %s",
    (expression) => {
      expectFailure(
        interpret({ op: "interpret", kind: "cidr", expression }, defaultRegistry),
        "E_CIDR_PARSE",
      );
    },
  );

  it("uses the same strict address grammar for CIDR queries", () => {
    expectFailure(
      interpret(
        {
          op: "query",
          kind: "cidr",
          expression: "127.0.0.0/8",
          query: { name: "contains", arguments: { address: "2130706433" } },
        },
        defaultRegistry,
      ),
      "E_QUERY_INVALID",
    );
    expectFailure(
      interpret(
        {
          op: "query",
          kind: "cidr",
          expression: "127.0.0.0/8",
          query: { name: "overlaps", arguments: { cidr: "0127.0.0.1/8" } },
        },
        defaultRegistry,
      ),
      "E_QUERY_INVALID",
    );
  });

  it("preserves duration integers and decimals beyond IEEE-754 precision", () => {
    const integer = expectSuccess(
      interpret(
        { op: "interpret", kind: "iso_duration", expression: "P9007199254740993D" },
        defaultRegistry,
      ),
    );
    expect(integer.normalized).toBe("P9007199254740993D");
    expect(integer.value).toMatchObject({ days: "9007199254740993" });

    const decimal = expectSuccess(
      interpret(
        {
          op: "interpret",
          kind: "iso_duration",
          expression: "PT0.123456789012345678900S",
        },
        defaultRegistry,
      ),
    );
    expect(decimal.normalized).toBe("PT0.1234567890123456789S");
    expect(decimal.value).toMatchObject({ seconds: "0.1234567890123456789" });
  });

  it("rejects a duration fraction before a smaller present unit", () => {
    expectFailure(
      interpret(
        { op: "interpret", kind: "iso_duration", expression: "PT1.5H30M" },
        defaultRegistry,
      ),
      "E_DURATION_FRACTION_POSITION",
    );
  });

  it("rejects duplicate Content-Type parameters case-insensitively", () => {
    expectFailure(
      interpret(
        {
          op: "interpret",
          kind: "content_type",
          expression: 'text/html; note="a;b"; NOTE=c',
        },
        defaultRegistry,
      ),
      "E_CONTENT_TYPE_DUPLICATE_PARAMETER",
    );
  });

  it("canonicalizes Content-Type parameter order with locale-independent ASCII ordering", () => {
    const result = expectSuccess(
      interpret(
        {
          op: "normalize",
          kind: "content_type",
          expression: "text/plain; z=1; A=2; a-b=3; a_b=4",
        },
        defaultRegistry,
      ),
    );
    expect(result.normalized).toBe("text/plain; a=2; a-b=3; a_b=4; z=1");
  });

  it("reports invalid SemVer candidates instead of changing them into false", () => {
    expectFailure(
      interpret(
        {
          op: "query",
          kind: "semver_range",
          expression: "^3.2.0",
          query: { name: "matches", arguments: { candidate: "not-a-version" } },
        },
        defaultRegistry,
      ),
      "E_QUERY_INVALID",
    );
  });
});

describe("reviewer regressions: deterministic time", () => {
  it.each(["2026-02-30T00:00:00Z", "2026-08-13T00:00:00"])(
    "rejects invalid or offset-free reference time %s",
    (referenceTime) => {
      expectFailure(
        interpret(
          {
            op: "query",
            kind: "cron",
            dialect: "unix-5",
            expression: "0 9 * * *",
            context: { reference_time: referenceTime },
            query: { name: "next_occurrences" },
          },
          defaultRegistry,
        ),
        "E_TIME_INVALID",
      );
    },
  );

  it("applies the strict timestamp contract to match candidates", () => {
    expectFailure(
      interpret(
        {
          op: "query",
          kind: "cron",
          dialect: "unix-5",
          expression: "0 9 * * *",
          query: { name: "matches", arguments: { candidate: "2026-02-30T09:00:00Z" } },
        },
        defaultRegistry,
      ),
      "E_TIME_INVALID",
    );
  });

  it("replays equivalent explicit offsets as the same instant", () => {
    const request = {
      op: "query" as const,
      kind: "cron",
      dialect: "unix-5",
      expression: "0 9 * * *",
      query: { name: "next_occurrences", arguments: { count: 1 } },
    };
    const utc = expectSuccess(
      interpret(
        { ...request, context: { timezone: "Asia/Shanghai", reference_time: "2026-08-13T00:00:00Z" } },
        defaultRegistry,
      ),
    );
    const offset = expectSuccess(
      interpret(
        {
          ...request,
          context: { timezone: "Asia/Shanghai", reference_time: "2026-08-13T08:00:00+08:00" },
        },
        defaultRegistry,
      ),
    );
    expect(offset.query_result).toEqual(utc.query_result);
    expect(offset.provenance).toMatchObject({
      runtime: "node",
      runtime_version: process.versions.node,
      timezone_engine: "Intl",
      timezone_data_version: process.versions.tz,
      icu_version: process.versions.icu,
    });
  });
});

describe("reviewer regressions: strict platform and URI semantics", () => {
  it.each(["0 0 * * 7", "0 0 ? * *", "0 0 L * *", "0 0 * * MON#2"])(
    "rejects GitHub Actions cron syntax outside the documented dialect: %s",
    (expression) => {
      expectFailure(
        interpret(
          { op: "interpret", kind: "cron", dialect: "github-actions", expression },
          defaultRegistry,
        ),
        "E_CRON_GITHUB_SYNTAX",
      );
    },
  );

  it("continues to accept documented GitHub lists, ranges, steps, and names", () => {
    expectSuccess(
      interpret(
        {
          op: "interpret",
          kind: "cron",
          dialect: "github-actions",
          expression: "15/15 4-6 * JAN,MAR MON-FRI",
        },
        defaultRegistry,
      ),
    );
  });

  it("checks GitHub's minimum interval across consecutive selected days", () => {
    expectFailure(
      interpret(
        {
          op: "interpret",
          kind: "cron",
          dialect: "github-actions",
          expression: "2,58 0,23 * * MON,TUE",
        },
        defaultRegistry,
      ),
      "E_CRON_GITHUB_MIN_INTERVAL",
    );
    expectSuccess(
      interpret(
        {
          op: "interpret",
          kind: "cron",
          dialect: "github-actions",
          expression: "2,58 0,23 * * MON",
        },
        defaultRegistry,
      ),
    );
  });

  it.each(["0 0 ? * *", "0 0 L * *", "0 0 * * MON#2"])(
    "rejects Quartz-only syntax in the Unix five-field dialect: %s",
    (expression) => {
      expectFailure(
        interpret(
          { op: "interpret", kind: "cron", dialect: "unix-5", expression },
          defaultRegistry,
        ),
        "E_CRON_UNIX_SYNTAX",
      );
    },
  );

  it("continues to accept Sunday as 7 in the Unix five-field dialect", () => {
    expectSuccess(
      interpret(
        { op: "interpret", kind: "cron", dialect: "unix-5", expression: "0 0 * * 7" },
        defaultRegistry,
      ),
    );
  });

  it.each(["http://[invalid", "https://exa mple.com", "https://example.com/%ZZ"])(
    "rejects an invalid scheme-qualified RFC 3986 URI: %s",
    (expression) => {
      expectFailure(
        interpret({ op: "interpret", kind: "uri", expression }, defaultRegistry),
        "E_URI_PARSE",
      );
    },
  );

  it("uses the strict URI grammar for equality and resolution operands", () => {
    expectFailure(
      interpret(
        {
          op: "query",
          kind: "uri",
          expression: "https://example.com/base/",
          query: { name: "equals", arguments: { uri: "https://example.com/%ZZ" } },
        },
        defaultRegistry,
      ),
      "E_QUERY_INVALID",
    );
    expectFailure(
      interpret(
        {
          op: "query",
          kind: "uri",
          expression: "https://example.com/base/",
          query: { name: "resolve", arguments: { reference: "../bad path" } },
        },
        defaultRegistry,
      ),
      "E_QUERY_INVALID",
    );
  });

  it("accepts a strict IPv6 URI and a valid percent escape", () => {
    const result = expectSuccess(
      interpret(
        { op: "interpret", kind: "uri", expression: "https://[2001:db8::1]/a%20b" },
        defaultRegistry,
      ),
    );
    expect(result.normalized).toBe("https://[2001:db8::1]/a%20b");
  });

  it("rejects zero-valued week mixing instead of silently dropping the week token", () => {
    expectFailure(
      interpret(
        { op: "interpret", kind: "iso_duration", expression: "P0W1D" },
        defaultRegistry,
      ),
      "E_DURATION_WEEK_MIXED",
    );
  });

  it("does not classify arbitrary five-word text as a high-confidence cron", () => {
    const result = expectSuccess(
      interpret({ op: "detect", expression: "hello world this is cron" }, defaultRegistry),
    );
    expect(result.candidates).toEqual([]);
  });

  it("detects Cron without silently choosing a platform dialect", () => {
    const result = expectSuccess(
      interpret({ op: "detect", expression: "1,3 * * * *" }, defaultRegistry),
    );
    expect(result.candidates).toContainEqual(expect.objectContaining({
      kind: "cron",
      supported: true,
    }));
    expect(result.candidates?.find((candidate) => candidate.kind === "cron")?.dialect)
      .toBeUndefined();
  });

  it.each([
    ["cidr", " 192.168.1.0/24 "],
    ["iso_duration", " P1D "],
    ["uri", " https://example.com/a "],
  ])("does not report padded %s input as executable", (kind, expression) => {
    const result = expectSuccess(interpret({ op: "detect", expression }, defaultRegistry));
    expect(result.candidates?.some((candidate) => candidate.kind === kind && candidate.supported))
      .toBe(false);
  });

  it("detects every padded Content-Type expression accepted by interpretation", () => {
    const expression = " text/plain; charset=utf-8 ";
    const detected = expectSuccess(interpret({ op: "detect", expression }, defaultRegistry));
    expect(detected.candidates).toContainEqual(expect.objectContaining({
      kind: "content_type",
      dialect: "http",
      supported: true,
    }));
    const interpreted = expectSuccess(interpret({
      op: "interpret",
      kind: "content_type",
      dialect: "http",
      expression,
    }, defaultRegistry));
    expect(interpreted.normalized).toBe("text/plain; charset=utf-8");
  });

  it("uses scheme-required terminology for URI input without a scheme", () => {
    expectFailure(
      interpret({ op: "interpret", kind: "uri", expression: "//example.com/path#frag" }, defaultRegistry),
      "E_URI_SCHEME_REQUIRED",
    );
  });

  it("applies max_output_items to ambiguous detection candidates", () => {
    expectFailure(
      interpret(
        { op: "detect", expression: "755", limits: { max_output_items: 1 } },
        defaultRegistry,
      ),
      "E_RESOURCE_LIMIT",
    );
  });
});

describe("reviewer regressions: discoverability and resource boundaries", () => {
  it("rejects undeclared context and publishes replay-required context in the schema", () => {
    expectFailure(
      interpret(
        {
          op: "interpret",
          kind: "semver_range",
          expression: "^3.2.0",
          context: { timezone: "Mars/Olympus" },
        },
        defaultRegistry,
      ),
      "E_REQUEST_INVALID",
    );
    expectFailure(
      interpret(
        {
          op: "query",
          kind: "cron",
          dialect: "unix-5",
          expression: "0 9 * * *",
          query: { name: "next_occurrences" },
        },
        defaultRegistry,
      ),
      "E_REFERENCE_TIME_REQUIRED",
    );

    const ajv = new Ajv2020({ strict: true, allErrors: true });
    const validate = ajv.compile(createRequestSchema(defaultRegistry));
    expect(validate({
      op: "interpret",
      kind: "semver_range",
      expression: "^3.2.0",
      context: { timezone: "Mars/Olympus" },
    })).toBe(false);
    expect(validate({
      op: "query",
      kind: "cron",
      dialect: "unix-5",
      expression: "0 9 * * *",
      query: { name: "next_occurrences" },
    })).toBe(false);
    expect(validate({
      op: "query",
      kind: "cron",
      dialect: "unix-5",
      expression: "0 9 * * *",
      context: { reference_time: "2026-08-13T00:00:00Z" },
      query: { name: "next_occurrences" },
    })).toBe(true);
  });

  it("keeps registered descriptors immutable and the shared registry sealed", () => {
    const descriptor = defaultRegistry.describe("cron");
    expect(defaultRegistry.sealed).toBe(true);
    expect(Object.isFrozen(descriptor)).toBe(true);
    expect(Object.isFrozen(descriptor.dialects)).toBe(true);
    expect(Object.isFrozen(descriptor.query_contracts?.[0]?.arguments)).toBe(true);
    expect(() => descriptor.dialects.push("mutated")).toThrow();
    expect(() => defaultRegistry.register({} as never)).toThrow(/sealed/i);
    expect(createDefaultRegistry().sealed).toBe(false);
  });

  it("rejects adapter descriptors whose capabilities and contracts disagree", () => {
    const source = defaultRegistry.require("semver_range");
    const invalid = {
      descriptor: {
        ...source.descriptor,
        kind: "invalid_adapter",
        capabilities: [...source.descriptor.capabilities, "query.ghost"],
      },
      interpret: source.interpret.bind(source),
      query: source.query?.bind(source),
      detect: source.detect.bind(source),
    } as ExpressionAdapter;
    expect(() => new ExpressionRegistry().register(invalid)).toThrow(/capabilities/i);
  });

  it("publishes exact query contracts in the live registry", () => {
    const descriptor = defaultRegistry.describe("semver_range");
    expect(descriptor.query_contracts).toContainEqual(
      expect.objectContaining({
        name: "matches",
        arguments: expect.objectContaining({
          required: ["candidate"],
          additional_properties: false,
        }),
      }),
    );
    expect(defaultRegistry.describe("cron").capability_constraints).toMatchObject({
      "github-actions": {
        "query.next_occurrences": { timezones: ["UTC"] },
        "query.matches": { timezones: ["UTC"] },
        "derive.next_occurrences": { timezones: ["UTC"] },
      },
    });
  });

  it("rejects unknown operation arguments before adapter execution", () => {
    expectFailure(
      interpret(
        {
          op: "query",
          kind: "semver_range",
          expression: "^3.2.0",
          query: {
            name: "matches",
            arguments: { candidate: "3.7.4", candiate: "3.7.4" },
          },
        },
        defaultRegistry,
      ),
      "E_REQUEST_INVALID",
    );
    expectFailure(
      interpret(
        {
          op: "convert",
          kind: "unix_permission",
          expression: "755",
          convert: { target_representation: "symbolic", arguments: { surprise: true } },
        },
        defaultRegistry,
      ),
      "E_REQUEST_INVALID",
    );
  });

  it.each(["constructor", "toString", "__proto__"])(
    "rejects inherited object key '%s' as an unknown argument",
    (key) => {
      const argumentsValue = JSON.parse(
        `{"candidate":"3.7.4","${key}":true}`,
      ) as JsonObject;
      expectFailure(
        interpret(
          {
            op: "query",
            kind: "semver_range",
            expression: "^3.2.0",
            query: { name: "matches", arguments: argumentsValue },
          },
          defaultRegistry,
        ),
        "E_REQUEST_INVALID",
      );
    },
  );

  it("requires an explicit operation and rejects duplicate derivations", () => {
    expectFailure(
      interpret({ kind: "uri", expression: "https://example.com" }, defaultRegistry),
      "E_REQUEST_INVALID",
    );
    expectFailure(
      interpret(
        {
          op: "interpret",
          kind: "cron",
          dialect: "unix-5",
          expression: "0 9 * * *",
          derive: ["human_description", "human_description"],
        },
        defaultRegistry,
      ),
      "E_REQUEST_INVALID",
    );
  });

  it("bounds nested, wide, and oversized requests before semantic work", () => {
    let nested: Record<string, unknown> = {};
    for (let index = 0; index < 20; index += 1) nested = { nested };
    expectFailure(
      interpret(
        {
          op: "query",
          kind: "semver_range",
          expression: "^3.2.0",
          query: { name: "matches", arguments: { candidate: "3.7.4", nested } },
        },
        defaultRegistry,
      ),
      "E_REQUEST_LIMIT",
    );

    const wide = Object.fromEntries(
      Array.from({ length: 300 }, (_, index) => [`field_${index}`, index]),
    );
    expectFailure(
      interpret(
        {
          op: "query",
          kind: "semver_range",
          expression: "^3.2.0",
          query: { name: "matches", arguments: wide },
        },
        defaultRegistry,
      ),
      "E_REQUEST_LIMIT",
    );

    expectFailure(
      interpret(
        { op: "interpret", kind: "uri", expression: `https://example.com/${"a".repeat(9_000)}` },
        defaultRegistry,
      ),
      "E_REQUEST_LIMIT",
    );
  });

  it("replaces an oversized semantic response with a compact bounded failure", () => {
    const result = interpret(
      {
        op: "interpret",
        kind: "uri",
        expression: `https://example.com/${"a".repeat(900)}`,
        limits: { max_response_bytes: 1_024 },
      },
      defaultRegistry,
    );
    expectFailure(result, "E_RESPONSE_LIMIT");
    expect(Buffer.byteLength(JSON.stringify(result), "utf8")).toBeLessThanOrEqual(1_024);
    expect(result.input.length).toBeLessThanOrEqual(128);
  });

  it("preserves a bounded response-limit diagnostic across the worker boundary", async () => {
    const result = await interpretBounded({
      op: "interpret",
      kind: "uri",
      expression: `https://example.com/${"a".repeat(900)}`,
      limits: { max_response_bytes: 1_024 },
    });
    expectFailure(result, "E_RESPONSE_LIMIT");
    expect(result.kind).toBe("uri");
    expect(Buffer.byteLength(JSON.stringify(result), "utf8")).toBeLessThanOrEqual(1_024);
  });

  it("applies max_output_items to adapter-generated collections", () => {
    expectFailure(
      interpret(
        {
          op: "interpret",
          kind: "content_type",
          expression: "text/plain; a=1; b=2",
          limits: { max_output_items: 1 },
        },
        defaultRegistry,
      ),
      "E_RESOURCE_LIMIT",
    );
    expectFailure(
      interpret(
        {
          op: "interpret",
          kind: "semver_range",
          expression: ">=1.0.0 <2.0.0",
          limits: { max_output_items: 1 },
        },
        defaultRegistry,
      ),
      "E_RESOURCE_LIMIT",
    );
    expectFailure(
      interpret(
        {
          op: "interpret",
          kind: "cron",
          dialect: "unix-5",
          expression: "1,3 * * * *",
          limits: { max_output_items: 1 },
        },
        defaultRegistry,
      ),
      "E_RESOURCE_LIMIT",
    );
  });

  it("preserves the original failure code when only echoed input exceeds the response limit", () => {
    const result = interpret(
      {
        op: "interpret",
        kind: "uri",
        expression: `http://[${"x".repeat(900)}`,
        limits: { max_response_bytes: 1_024 },
      },
      defaultRegistry,
    );
    expectFailure(result, "E_URI_PARSE");
    expect(result.input.length).toBeLessThanOrEqual(64);
    expect(Buffer.byteLength(JSON.stringify(result), "utf8")).toBeLessThanOrEqual(1_024);
  });

  it("rejects unusably small string limits at the contract boundary", () => {
    expectFailure(
      interpret(
        {
          op: "interpret",
          kind: "unix_permission",
          expression: "755",
          limits: { max_string_length: 3 },
        },
        defaultRegistry,
      ),
      "E_LIMIT_INVALID",
    );
    expectSuccess(
      interpret(
        {
          op: "interpret",
          kind: "unix_permission",
          expression: "755",
          limits: { max_string_length: 64 },
        },
        defaultRegistry,
      ),
    );
  });

  it("allows the declared maximum output items when the byte budget permits", () => {
    const result = expectSuccess(
      interpret(
        {
          op: "query",
          kind: "cron",
          dialect: "unix-5",
          expression: "* * * * *",
          context: { reference_time: "2026-08-13T00:00:00Z" },
          query: { name: "next_occurrences", arguments: { count: 100 } },
        },
        defaultRegistry,
      ),
    );
    expect(result.query_result).toHaveLength(100);
  });

  it("does not reflect oversized kind or dialect fields in a bounded failure", () => {
    const result = interpret(
      {
        op: "interpret",
        kind: "k".repeat(900),
        dialect: "d".repeat(900),
        expression: "value",
        limits: { max_response_bytes: 1_024 },
      },
      defaultRegistry,
    );
    expectFailure(result, "E_KIND_UNKNOWN");
    expect(Buffer.byteLength(JSON.stringify(result), "utf8")).toBeLessThanOrEqual(1_024);
    expect(result.kind).toBeUndefined();
    expect(result.dialect).toBeUndefined();
  });

  it("terminates isolated interpretation when its deadline is exhausted", async () => {
    const result = await interpretBounded({
      op: "interpret",
      kind: "semver_range",
      expression: "^3.2.0",
      limits: { max_execution_ms: 10 },
    });
    expectFailure(result, "E_EXECUTION_TIMEOUT");
  });

  it("admits at most the bounded number of workers concurrently", async () => {
    const request = {
      op: "interpret",
      kind: "semver_range",
      expression: "^1.0.0",
      limits: { max_execution_ms: 1_000 },
    };
    const pending = Array.from(
      { length: WORKER_ADMISSION_LIMITS.max_concurrent * 2 },
      () => interpretBoundedInWorker(
        request,
        new URL("./fixtures/delayed-success-worker.mjs", import.meta.url),
      ),
    );
    await new Promise((resolve) => setTimeout(resolve, 40));
    expect(workerAdmissionState()).toEqual({
      active: WORKER_ADMISSION_LIMITS.max_concurrent,
      queued: WORKER_ADMISSION_LIMITS.max_concurrent,
    });

    const results = await Promise.all(pending);
    expect(results.every((result) => result.ok)).toBe(true);
    expect(workerAdmissionState()).toEqual({ active: 0, queued: 0 });
  });

  it("enforces one cumulative deadline across a bounded batch", async () => {
    const startedAt = performance.now();
    const results = await interpretBatchBoundedInWorkers(
      [
        { op: "interpret", kind: "semver_range", expression: "^1" },
        { op: "interpret", kind: "semver_range", expression: "^2" },
      ],
      50,
      new URL("./fixtures/slow-worker.mjs", import.meta.url),
      50,
    );
    expectFailure(results.at(-1) as SeiResult, "E_BATCH_TIMEOUT");
    expect(performance.now() - startedAt).toBeLessThan(500);
  });

  it("does not let a caller raise the hard batch item ceiling", () => {
    const requests = Array.from({ length: 51 }, () => ({
      op: "interpret",
      kind: "unix_permission",
      expression: "755",
    }));
    const results = interpretBatch(requests, defaultRegistry, 1_000);
    expect(results).toHaveLength(1);
    expectFailure(results[0] as SeiResult, "E_BATCH_TOO_LARGE");
  });

  it("terminates a memory-breaching worker and succeeds with a fresh worker", async () => {
    const request = {
      op: "interpret",
      kind: "semver_range",
      expression: "^3.2.0",
      limits: { max_execution_ms: 1_000 },
    };
    const breach = await interpretBoundedInWorker(
      request,
      new URL("./fixtures/memory-pressure-worker.mjs", import.meta.url),
    );
    expectFailure(breach, "E_MEMORY_LIMIT");

    const recovery = await interpretBounded(request);
    expectSuccess(recovery);
    expect(recovery.normalized).toBe(">=3.2.0 <4.0.0-0");
  });

  it("rejects invalid or oversized worker messages at the parent boundary", async () => {
    const request = { op: "interpret", kind: "semver_range", expression: "^3.2.0" };
    const invalid = await interpretBoundedInWorker(
      request,
      new URL("./fixtures/invalid-result-worker.mjs", import.meta.url),
    );
    expectFailure(invalid, "E_WORKER_PROTOCOL");

    const oversized = await interpretBoundedInWorker(
      request,
      new URL("./fixtures/oversized-result-worker.mjs", import.meta.url),
    );
    expectFailure(oversized, "E_RESPONSE_LIMIT");
  });

  it("validates the complete tagged-union worker result", async () => {
    const result = await interpretBoundedInWorker(
      { op: "interpret", kind: "semver_range", expression: "^1" },
      new URL("./fixtures/incomplete-success-worker.mjs", import.meta.url),
    );
    expectFailure(result, "E_WORKER_PROTOCOL");
  });

  it.each([
    { request: { op: "interpret", kind: "semver_range", expression: "^1" }, label: "input" },
    { request: { op: "interpret", kind: "semver_range", expression: "^2" }, label: "kind" },
    { request: { op: "interpret", kind: "semver_range", expression: "^3" }, label: "operation" },
    {
      request: {
        op: "query",
        kind: "semver_range",
        expression: "^1",
        query: { name: "matches", arguments: { candidate: "1.2.3" } },
      },
      label: "query tag",
    },
    {
      request: {
        op: "convert",
        kind: "unix_permission",
        expression: "755",
        convert: { target_representation: "symbolic" },
      },
      label: "conversion tag",
    },
  ] as const)("rejects a worker result with a cross-request $label", async ({ request }) => {
    const result = await interpretBoundedInWorker(
      request,
      new URL("./fixtures/mismatched-result-worker.mjs", import.meta.url),
    );
    expectFailure(result, "E_WORKER_PROTOCOL");
  });

  it("enforces the request's response limit in the parent process", async () => {
    const result = await interpretBoundedInWorker(
      {
        op: "interpret",
        kind: "semver_range",
        expression: "^1",
        limits: { max_response_bytes: 1_024 },
      },
      new URL("./fixtures/request-limit-result-worker.mjs", import.meta.url),
    );
    expectFailure(result, "E_RESPONSE_LIMIT");
  });

  it("preserves compact domain failures while retaining request correlation", async () => {
    const longUri = await interpretBounded({
      op: "interpret",
      kind: "uri",
      expression: `http://[${"x".repeat(900)}`,
      limits: { max_response_bytes: 1_024 },
    });
    expectFailure(longUri, "E_URI_PARSE");

    const longKind = await interpretBounded({
      op: "interpret",
      kind: "k".repeat(900),
      expression: "value",
      limits: { max_response_bytes: 1_024 },
    });
    expectFailure(longKind, "E_KIND_UNKNOWN");
  });

  it("rejects a compacted result from a different request with the same visible prefix", async () => {
    const result = await interpretBoundedInWorker(
      {
        op: "interpret",
        kind: "uri",
        expression: `${"x".repeat(64)}-request-a`,
        limits: { max_response_bytes: 1_024 },
      },
      new URL("./fixtures/mismatched-compacted-worker.mjs", import.meta.url),
    );
    expectFailure(result, "E_WORKER_PROTOCOL");
  });

  it.each([
    {
      op: "query",
      kind: "semver_range",
      expression: "^1",
      query: { name: "matches", arguments: { candidate: "1.2.3" } },
    },
    {
      op: "convert",
      kind: "unix_permission",
      expression: "755",
      convert: { target_representation: "symbolic" },
    },
  ] as const)("rejects an ordinary failure correlated to another $op request", async (request) => {
    const result = await interpretBoundedInWorker(
      request,
      new URL("./fixtures/mismatched-failure-correlation-worker.mjs", import.meta.url),
    );
    expectFailure(result, "E_WORKER_PROTOCOL");
  });

  it.each([
    {
      label: "query arguments",
      request: {
        op: "query",
        kind: "semver_range",
        expression: "^1",
        query: { name: "intersects", arguments: { range: ">=9.0.0" } },
      },
    },
    {
      label: "time context",
      request: {
        op: "query",
        kind: "cron",
        dialect: "unix-5",
        expression: "0 9 * * *",
        context: { timezone: "UTC", reference_time: "2026-08-14T00:00:00Z" },
        query: { name: "next_occurrences", arguments: { count: 1 } },
      },
    },
  ] as const)("rejects a worker result correlated to different $label", async ({ request }) => {
    const result = await interpretBoundedInWorker(
      request,
      new URL("./fixtures/mismatched-full-request-correlation-worker.mjs", import.meta.url),
    );
    expectFailure(result, "E_WORKER_PROTOCOL");
  });

  it("preserves adapter diagnostic codes through the source worker", async () => {
    const result = await interpretBounded({
      op: "interpret",
      kind: "semver_range",
      expression: "not-a-range",
    });
    expectFailure(result, "E_SEMVER_RANGE_PARSE");
  });

  it("detects four-digit Unix modes with special bits without hiding ambiguity", () => {
    const result = expectSuccess(
      interpret({ op: "detect", expression: "4755" }, defaultRegistry),
    );
    expect(result.candidates?.map((candidate) => candidate.kind)).toEqual([
      "unix_permission",
      "integer",
    ]);
    expect(result.resolved).toBe(false);
  });

  it("publishes and enforces typed result unions", () => {
    const result = expectSuccess(
      interpret(
        {
          op: "query",
          kind: "semver_range",
          expression: "^3.2.0",
          query: { name: "matches", arguments: { candidate: "3.7.4" } },
        },
        defaultRegistry,
      ),
    );
    expect(result.query_name).toBe("matches");
    if (
      result.operation === "query" &&
      result.kind === "semver_range" &&
      result.query_name === "matches"
    ) {
      expectTypeOf(result.query_result).toMatchTypeOf<SemverMatchesResult>();
      expectTypeOf(result.dialect).toEqualTypeOf<"npm">();
    }

    const ajv = new Ajv2020({ strict: true, allErrors: true });
    const validate = ajv.compile(createResultSchema(defaultRegistry));
    expect(validate(result)).toBe(true);
    expect(validate({ ...result, query_result: { candidate: "3.7.4", matches: "yes" } }))
      .toBe(false);
  });
});
