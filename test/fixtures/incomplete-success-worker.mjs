import { parentPort, workerData } from "node:worker_threads";

parentPort.postMessage({
  schema_version: "sei.result.v1",
  ok: true,
  operation: "interpret",
  input: workerData.expression,
  kind: "semver_range",
  dialect: "npm",
  normalized: ">=1.0.0 <2.0.0-0",
  capabilities: ["interpret"],
  diagnostics: [],
  provenance: {
    spec: "fixture",
    engine: "fixture",
    engine_version: "1",
    compatibility_mode: "fixture",
  },
});
