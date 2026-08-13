import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { defaultRegistry, interpret, type SeiRequest } from "../src/index.js";

interface ConformanceCase {
  id: string;
  request: SeiRequest;
  expected: {
    ok: boolean;
    normalized?: string;
    diagnostic_codes?: string[];
  };
}

const cases = JSON.parse(
  readFileSync(new URL("../fixtures/conformance-v0.1.json", import.meta.url), "utf8"),
) as ConformanceCase[];

describe("v0.1 conformance corpus", () => {
  for (const entry of cases) {
    it(entry.id, () => {
      const result = interpret(entry.request, defaultRegistry);
      expect(result.ok).toBe(entry.expected.ok);
      if (entry.expected.normalized !== undefined) {
        expect(result.normalized).toBe(entry.expected.normalized);
      }
      if (entry.expected.diagnostic_codes !== undefined) {
        expect(result.diagnostics.map((diagnostic) => diagnostic.code)).toEqual(
          expect.arrayContaining(entry.expected.diagnostic_codes),
        );
      }
    });
  }
});
