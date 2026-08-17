import { createHash } from "node:crypto";
import type { JsonValue, SeiResult } from "../contracts.js";
import { SeiError } from "./errors.js";

export const WORKER_PROTOCOL_VERSION = "sei.worker.v1" as const;

export interface WorkerResultEnvelope {
  protocol_version: typeof WORKER_PROTOCOL_VERSION;
  request_correlation: string;
  result: SeiResult;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function canonicalJson(value: JsonValue): string {
  if (value === null || typeof value !== "object") return JSON.stringify(value) as string;
  if (Array.isArray(value)) return `[${value.map((item) => canonicalJson(item)).join(",")}]`;
  return `{${Object.keys(value)
    .sort()
    .map((key) => `${JSON.stringify(key)}:${canonicalJson(value[key] as JsonValue)}`)
    .join(",")}}`;
}

export function requestCorrelationDigest(value: unknown): string {
  return createHash("sha256")
    .update(canonicalJson(value as JsonValue))
    .digest("hex");
}

export function createWorkerResultEnvelope(
  request: unknown,
  result: SeiResult,
): WorkerResultEnvelope {
  return {
    protocol_version: WORKER_PROTOCOL_VERSION,
    request_correlation: requestCorrelationDigest(request),
    result,
  };
}

export function readWorkerResultEnvelope(
  value: unknown,
  expectedCorrelation: string,
): SeiResult {
  if (!isRecord(value)) {
    throw new SeiError("E_WORKER_PROTOCOL", "Worker message is not an internal result envelope.");
  }
  const keys = Object.keys(value).sort();
  if (
    keys.length !== 3 ||
    keys[0] !== "protocol_version" ||
    keys[1] !== "request_correlation" ||
    keys[2] !== "result" ||
    value.protocol_version !== WORKER_PROTOCOL_VERSION ||
    typeof value.request_correlation !== "string" ||
    !/^[0-9a-f]{64}$/.test(value.request_correlation)
  ) {
    throw new SeiError("E_WORKER_PROTOCOL", "Worker message violates the internal envelope contract.");
  }
  if (value.request_correlation !== expectedCorrelation) {
    throw new SeiError("E_WORKER_PROTOCOL", "Worker result does not correlate with its request.");
  }
  return value.result as SeiResult;
}
