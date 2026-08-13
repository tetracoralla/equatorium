import { parentPort } from "node:worker_threads";

parentPort.postMessage({
  schema_version: "sei.result.v1",
  ok: false,
  operation: "interpret",
  input: "x".repeat(70_000),
  diagnostics: [{ code: "E_FIXTURE", severity: "error", message: "oversized fixture" }],
});
