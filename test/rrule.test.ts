import { describe, expect, it } from "vitest";
import { defaultRegistry, interpret, type SeiResult } from "../src/index.js";

function success(result: SeiResult): Extract<SeiResult, { ok: true }> {
  expect(result.ok).toBe(true);
  if (!result.ok) throw new Error(result.diagnostics[0]?.message ?? "Expected success");
  return result;
}

function expectFailure(expression: string, code: string, extra: Record<string, unknown> = {}): void {
  const result = interpret(
    { op: "interpret", kind: "rrule", expression, ...extra },
    defaultRegistry,
  );
  expect(result.ok).toBe(false);
  expect(result.diagnostics[0]?.code).toBe(code);
}

describe("RFC 5545 RRULE adapter", () => {
  it("returns typed structural semantics without expanding occurrences", () => {
    const result = success(
      interpret(
        {
          op: "interpret",
          kind: "rrule",
          expression: "RRULE:BYDAY=MO,WE;COUNT=10;FREQ=WEEKLY",
        },
        defaultRegistry,
      ),
    );
    expect(result).toMatchObject({
      operation: "interpret",
      kind: "rrule",
      dialect: "rfc5545",
      normalized: "RRULE:FREQ=WEEKLY;COUNT=10;BYDAY=MO,WE",
      value: {
        frequency: "WEEKLY",
        interval: 1,
        count: 10,
        until: null,
        week_start: "MO",
        by_day: [{ weekday: "MO" }, { weekday: "WE" }],
      },
      semantics: { bounded: true, termination: "count" },
      provenance: {
        spec: "RFC5545-RRULE",
        engine: "rrule",
        engine_version: "2.8.1",
        compatibility_mode: "strict-single-property-no-occurrence-expansion",
      },
    });
    expect(result).not.toHaveProperty("query_result");
    expect(result).not.toHaveProperty("derived");
  });

  it("normalizes case, field order, integers, and BYDAY ordinals idempotently", () => {
    const first = success(
      interpret(
        {
          op: "normalize",
          kind: "rrule",
          expression: "rrule:byday=1mo,-1fr;interval=01;freq=monthly",
        },
        defaultRegistry,
      ),
    );
    expect(first.normalized).toBe("RRULE:FREQ=MONTHLY;INTERVAL=1;BYDAY=+1MO,-1FR");
    const second = success(
      interpret(
        { op: "normalize", kind: "rrule", expression: first.normalized },
        defaultRegistry,
      ),
    );
    expect(second.normalized).toBe(first.normalized);
    expect(second.value).toEqual(first.value);
    expect(second.semantics).toEqual(first.semantics);
  });

  it("keeps an unbounded rule structural and rejects schedule execution", () => {
    const result = success(
      interpret(
        { op: "interpret", kind: "rrule", expression: "RRULE:FREQ=DAILY" },
        defaultRegistry,
      ),
    );
    expect(result.semantics).toEqual({ bounded: false, termination: "unbounded" });

    const query = interpret(
      {
        op: "query",
        kind: "rrule",
        expression: "RRULE:FREQ=DAILY",
        query: { name: "next_occurrences" },
      },
      defaultRegistry,
    );
    expect(query.ok).toBe(false);
    expect(query.diagnostics[0]?.code).toBe("E_QUERY_UNSUPPORTED");
  });

  it("reports an explicit UTC UNTIL boundary without reading the clock", () => {
    const result = success(
      interpret(
        {
          op: "interpret",
          kind: "rrule",
          expression: "RRULE:FREQ=DAILY;UNTIL=20261231T235959Z",
        },
        defaultRegistry,
      ),
    );
    expect(result.normalized).toBe("RRULE:FREQ=DAILY;UNTIL=20261231T235959Z");
    expect(result.value).toMatchObject({ until: "20261231T235959Z" });
    expect(result.semantics).toEqual({ bounded: true, termination: "until" });
  });

  it("accepts only one strict RRULE property and rejects lossy engine inputs", () => {
    expectFailure(
      "BEGIN:VEVENT\nRRULE:FREQ=DAILY\nEND:VEVENT",
      "E_RRULE_PARSE",
    );
    expectFailure("FREQ=DAILY", "E_RRULE_PARSE");
    expectFailure("RRULE:FREQ=DAILY;X-FOO=1", "E_RRULE_FIELD_UNKNOWN");
    expectFailure("RRULE:FREQ=WEEKLY;BYDAY=MO;BYDAY=TU", "E_RRULE_FIELD_DUPLICATE");
    expectFailure("RRULE:FREQ=WEEKLY;BYDAY=MO,MO", "E_RRULE_DUPLICATE_VALUE");
  });

  it("enforces value ranges and semantic field combinations before the engine", () => {
    expectFailure("RRULE:FREQ=YEARLY;BYMONTH=13", "E_RRULE_VALUE_RANGE");
    expectFailure("RRULE:FREQ=DAILY;COUNT=2;UNTIL=20261231T235959Z", "E_RRULE_CONFLICT");
    expectFailure("RRULE:FREQ=DAILY;BYSETPOS=1", "E_RRULE_CONFLICT");
    expectFailure("RRULE:FREQ=WEEKLY;BYDAY=1MO", "E_RRULE_CONFLICT");
    expectFailure("RRULE:FREQ=DAILY;UNTIL=20260230T010203Z", "E_RRULE_VALUE_RANGE");
    expectFailure("RRULE:FREQ=DAILY;UNTIL=00010101T000000Z", "E_RRULE_VALUE_RANGE");
    expectFailure("RRULE:FREQ=DAILY;UNTIL=20261231", "E_RRULE_PARSE");
  });

  it("applies max_output_items cumulatively to BY lists", () => {
    expectFailure(
      "RRULE:FREQ=YEARLY;BYMONTH=1,2;BYMONTHDAY=1,2",
      "E_RRULE_LIST_LIMIT",
      { limits: { max_output_items: 3 } },
    );
  });

  it("detects only an explicit RRULE front door and leaves URI overlap unresolved", () => {
    const detected = success(
      interpret({ op: "detect", expression: "RRULE:FREQ=DAILY" }, defaultRegistry),
    );
    expect(detected.resolved).toBe(false);
    expect(detected.candidates?.[0]).toMatchObject({
      kind: "rrule",
      dialect: "rfc5545",
      confidence: 0.995,
      supported: true,
    });
    expect(detected.candidates?.map((candidate) => candidate.kind)).toContain("uri");

    const invalidButRouted = success(
      interpret(
        { op: "detect", expression: "RRULE:FREQ=WEEKLY;BYDAY=MO;BYDAY=TU" },
        defaultRegistry,
      ),
    );
    expect(invalidButRouted.candidates?.map((candidate) => candidate.kind)).toContain("rrule");

    const cron = success(
      interpret({ op: "detect", expression: "0 9 * * 1-5" }, defaultRegistry),
    );
    expect(cron.candidates?.map((candidate) => candidate.kind)).not.toContain("rrule");
    const uri = success(
      interpret({ op: "detect", expression: "https://example.com/rrule" }, defaultRegistry),
    );
    expect(uri.candidates?.map((candidate) => candidate.kind)).not.toContain("rrule");
  });
});
