import { parentPort, workerData } from "node:worker_threads";
import { workerEnvelope } from "./worker-fixture-protocol.mjs";

parentPort.postMessage(workerEnvelope(workerData, {
  schema_version: "sei.result.v1",
  ok: false,
  operation: "interpret",
  input: "x".repeat(70_000),
  diagnostics: [{ code: "E_FIXTURE", severity: "error", message: "oversized fixture" }],
}));
