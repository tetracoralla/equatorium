import type { SeiFailure, SeiResult } from "../contracts.js";
import { SeiError } from "./errors.js";
import { enforceRequestBoundary, HARD_LIMITS } from "./request.js";

export const BATCH_LIMITS = Object.freeze({
  max_items: 50,
  max_request_bytes: 262_144,
  max_response_bytes: 1_048_576,
  max_collection_entries: 5_000,
  max_execution_ms: 5_000,
});

export function batchFailure(code: string, message: string): SeiFailure {
  return {
    schema_version: "sei.result.v1",
    ok: false,
    operation: "interpret",
    input: "",
    diagnostics: [new SeiError(code, message).diagnostic],
  };
}

export function enforceBatchRequestBoundary(requests: readonly unknown[]): void {
  enforceRequestBoundary(requests, {
    ...HARD_LIMITS,
    max_request_bytes: BATCH_LIMITS.max_request_bytes,
    max_collection_entries: BATCH_LIMITS.max_collection_entries,
    max_nesting_depth: HARD_LIMITS.max_nesting_depth + 1,
  });
}

function responseBytes(results: readonly SeiResult[]): number {
  return Buffer.byteLength(JSON.stringify(results), "utf8");
}

export function appendBatchResult(results: SeiResult[], result: SeiResult): boolean {
  if (responseBytes([...results, result]) > BATCH_LIMITS.max_response_bytes) return false;
  results.push(result);
  return true;
}

export function finishBatchWithFailure(
  results: SeiResult[],
  code: string,
  message: string,
): SeiResult[] {
  const failure = batchFailure(code, message);
  while (
    results.length > 0 &&
    responseBytes([...results, failure]) > BATCH_LIMITS.max_response_bytes
  ) {
    results.pop();
  }
  return [...results, failure];
}

export function effectiveBatchItemLimit(requested: number): number {
  if (!Number.isSafeInteger(requested) || requested < 0) return BATCH_LIMITS.max_items;
  return Math.min(requested, BATCH_LIMITS.max_items);
}
