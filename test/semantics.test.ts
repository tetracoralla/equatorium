import { describe, expect, it } from "vitest";
import { defaultRegistry, interpret, type SeiResult } from "../src/index.js";

function success(result: SeiResult): Extract<SeiResult, { ok: true }> {
  expect(result.ok).toBe(true);
  if (!result.ok) throw new Error(result.diagnostics[0]?.message ?? "Expected success");
  return result;
}

describe("semantic queries and transitions", () => {
  it("computes cron occurrences from explicit time and timezone", () => {
    const result = success(
      interpret(
        {
          op: "query",
          kind: "cron",
          dialect: "unix-5",
          expression: "0 9 * * 1-5",
          context: { timezone: "Asia/Shanghai", reference_time: "2026-08-13T00:00:00Z" },
          query: { name: "next_occurrences", arguments: { count: 3 } },
        },
        defaultRegistry,
      ),
    );
    expect(result.query_result).toEqual([
      { instant: "2026-08-13T01:00:00.000Z", timezone: "Asia/Shanghai" },
      { instant: "2026-08-14T01:00:00.000Z", timezone: "Asia/Shanghai" },
      { instant: "2026-08-17T01:00:00.000Z", timezone: "Asia/Shanghai" },
    ]);
  });

  it("keeps cron wildcard fields compact in the semantic IR", () => {
    const result = success(
      interpret(
        {
          op: "interpret",
          kind: "cron",
          dialect: "unix-5",
          expression: "0 9 * * 1-5",
        },
        defaultRegistry,
      ),
    );
    expect(result.value).toMatchObject({
      minute: { type: "set", values: [0] },
      day_of_month: { type: "any" },
      day_of_week: { type: "range", from: 1, to: 5 },
    });
  });

  it("rejects nondeterministic cron enumeration and GitHub schedules below five minutes", () => {
    const missingReference = interpret(
      {
        op: "query",
        kind: "cron",
        dialect: "unix-5",
        expression: "0 9 * * 1-5",
        query: { name: "next_occurrences" },
      },
      defaultRegistry,
    );
    expect(missingReference.ok).toBe(false);
    expect(missingReference.diagnostics[0]?.code).toBe("E_REFERENCE_TIME_REQUIRED");

    const tooFrequent = interpret(
      {
        op: "interpret",
        kind: "cron",
        dialect: "github-actions",
        expression: "*/2 * * * *",
      },
      defaultRegistry,
    );
    expect(tooFrequent.ok).toBe(false);
    expect(tooFrequent.diagnostics[0]?.code).toBe("E_CRON_GITHUB_MIN_INTERVAL");
  });

  it("accepts GitHub IANA timezones but does not overclaim DST occurrence emulation", () => {
    const syntax = interpret(
      {
        op: "interpret",
        kind: "cron",
        dialect: "github-actions",
        expression: "30 2 * * *",
        context: { timezone: "America/New_York" },
      },
      defaultRegistry,
    );
    expect(syntax.ok).toBe(true);
    expect(syntax.diagnostics[0]?.code).toBe("W_CRON_PLATFORM_QUERY_LIMITED");

    const occurrence = interpret(
      {
        op: "query",
        kind: "cron",
        dialect: "github-actions",
        expression: "30 2 * * *",
        context: {
          timezone: "America/New_York",
          reference_time: "2027-03-13T00:00:00Z",
        },
        query: { name: "next_occurrences" },
      },
      defaultRegistry,
    );
    expect(occurrence.ok).toBe(false);
    expect(occurrence.diagnostics[0]?.code).toBe("E_QUERY_UNSUPPORTED");
  });

  it("queries semver prerelease behavior without guessing", () => {
    const stable = success(
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
    expect(stable.query_result).toMatchObject({ matches: true });

    const prerelease = success(
      interpret(
        {
          op: "query",
          kind: "semver_range",
          expression: "^3.2.0",
          query: { name: "matches", arguments: { candidate: "4.0.0-beta.1" } },
        },
        defaultRegistry,
      ),
    );
    expect(prerelease.query_result).toMatchObject({ matches: false });
  });

  it("normalizes a CIDR then queries the normalized network", () => {
    const result = success(
      interpret(
        {
          op: "query",
          kind: "cidr",
          expression: "192.168.1.51/24",
          query: { name: "contains", arguments: { address: "192.168.1.200" } },
        },
        defaultRegistry,
      ),
    );
    expect(result.normalized).toBe("192.168.1.0/24");
    expect(result.query_result).toEqual({ address: "192.168.1.200", contains: true });
    expect(result.diagnostics.map((item) => item.code)).toContain("W_CIDR_HOST_BITS_CLEARED");
  });

  it("converts permission representation and queries the same parsed state", () => {
    const conversion = success(
      interpret(
        {
          op: "convert",
          kind: "unix_permission",
          expression: "4755",
          convert: { target_representation: "symbolic" },
        },
        defaultRegistry,
      ),
    );
    expect(conversion.converted).toEqual({ representation: "symbolic", expression: "rwsr-xr-x" });

    const query = success(
      interpret(
        {
          op: "query",
          kind: "unix_permission",
          expression: "rwsr-xr-x",
          query: { name: "allows", arguments: { subject: "group", permission: "write" } },
        },
        defaultRegistry,
      ),
    );
    expect(query.query_result).toEqual({ subject: "group", permission: "write", allows: false });
  });
});

describe("normalization contract", () => {
  const samples = [
    { kind: "cron", dialect: "unix-5", expression: "0 9 * * MON-FRI" },
    { kind: "semver_range", expression: "^3.2.0" },
    { kind: "cidr", expression: "2001:db8::1234/64" },
    { kind: "uri", expression: "HTTP://Example.COM:80/a/../b" },
    { kind: "content_type", expression: "Text/HTML; Charset=utf-8" },
    { kind: "iso_duration", expression: "PT1,5S" },
    { kind: "rrule", expression: "rrule:byday=mo,we;count=10;freq=weekly" },
    { kind: "unix_permission", expression: "rwxr-xr-x" },
  ];

  for (const sample of samples) {
    it(`is idempotent for ${sample.kind}`, () => {
      const first = success(interpret({ op: "normalize", ...sample }, defaultRegistry));
      const second = success(
        interpret(
          {
            op: "normalize",
            kind: sample.kind,
            ...(sample.dialect === undefined ? {} : { dialect: sample.dialect }),
            expression: first.normalized,
          },
          defaultRegistry,
        ),
      );
      expect(second.normalized).toBe(first.normalized);
    });
  }
});
