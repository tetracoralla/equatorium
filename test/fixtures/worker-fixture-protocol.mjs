import { createHash } from "node:crypto";

function canonicalJson(value) {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map((item) => canonicalJson(item)).join(",")}]`;
  return `{${Object.keys(value)
    .sort()
    .map((key) => `${JSON.stringify(key)}:${canonicalJson(value[key])}`)
    .join(",")}}`;
}

export function correlationDigest(request) {
  return createHash("sha256")
    .update(canonicalJson(request))
    .digest("hex");
}

export function workerEnvelope(request, result, requestCorrelation = correlationDigest(request)) {
  return {
    protocol_version: "sei.worker.v1",
    request_correlation: requestCorrelation,
    result,
  };
}
