import { describe, expect, it } from "vitest";
import {
  defaultRegistry,
  interpret,
  interpretBatch,
  type SeiResult,
} from "../src/index.js";

function expectSuccess(result: SeiResult): asserts result is Extract<SeiResult, { ok: true }> {
  expect(result.ok).toBe(true);
  if (!result.ok) throw new Error(result.diagnostics[0]?.message ?? "Expected success");
}

describe("registry and core envelope", () => {
  it("registers the eight expression kinds", () => {
    expect(defaultRegistry.list().map((item) => item.kind)).toEqual([
      "cidr",
      "content_type",
      "cron",
      "iso_duration",
      "rrule",
      "semver_range",
      "unix_permission",
      "uri",
    ]);
    expect(defaultRegistry.list().every((item) => item.provenance.engine_version !== "unknown")).toBe(true);
  });

  it("never resolves ambiguous detection", () => {
    const result = interpret({ op: "detect", expression: "755" }, defaultRegistry);
    expectSuccess(result);
    expect(result.resolved).toBe(false);
    expect(result.candidates?.map((item) => item.kind)).toEqual(["unix_permission", "integer"]);
  });

  it("requires cron dialect while defaulting single-dialect adapters", () => {
    const cron = interpret({ op: "interpret", kind: "cron", expression: "0 9 * * 1-5" }, defaultRegistry);
    expect(cron.ok).toBe(false);
    expect(cron.diagnostics[0]?.code).toBe("E_DIALECT_REQUIRED");

    const semver = interpret(
      { op: "interpret", kind: "semver_range", expression: "^1.2.3" },
      defaultRegistry,
    );
    expectSuccess(semver);
    expect(semver.dialect).toBe("npm");
  });

  it("rejects unknown request fields and hard-limit expansion", () => {
    const unknown = interpret(
      { op: "interpret", kind: "uri", expression: "https://example.com", proof: "trust me" },
      defaultRegistry,
    );
    expect(unknown.ok).toBe(false);
    expect(unknown.diagnostics[0]?.code).toBe("E_REQUEST_INVALID");

    const limit = interpret(
      {
        op: "interpret",
        kind: "uri",
        expression: "https://example.com",
        limits: { max_expression_length: 9000 },
      },
      defaultRegistry,
    );
    expect(limit.ok).toBe(false);
    expect(limit.diagnostics[0]?.code).toBe("E_LIMIT_INVALID");
  });

  it("bounds expressions before adapter execution", () => {
    const result = interpret(
      {
        op: "interpret",
        kind: "uri",
        expression: "https://example.com",
        limits: { max_expression_length: 4 },
      },
      defaultRegistry,
    );
    expect(result.ok).toBe(false);
    expect(result.diagnostics[0]?.code).toBe("E_EXPRESSION_TOO_LONG");
  });

  it("preserves batch order and partial failures", () => {
    const results = interpretBatch(
      [
        { op: "interpret", kind: "iso_duration", expression: "P1D" },
        { op: "interpret", kind: "iso_duration", expression: "bad" },
        { op: "interpret", kind: "unix_permission", expression: "755" },
      ],
      defaultRegistry,
    );
    expect(results.map((result) => result.ok)).toEqual([true, false, true]);
    expect(results[0]?.normalized).toBe("P1D");
    expect(results[2]?.normalized).toBe("0755");
  });
});
