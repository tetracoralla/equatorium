import { parentPort, workerData } from "node:worker_threads";
import { workerEnvelope } from "./worker-fixture-protocol.mjs";

if (parentPort === null) throw new Error("Fixture must run in a worker thread.");

parentPort.postMessage(workerEnvelope(workerData, {
  schema_version: "sei.result.v1",
  ok: false,
  operation: "interpret",
  input: "x".repeat(64),
  kind: "uri",
  diagnostics: [
    {
      code: "E_URI_PARSE",
      severity: "error",
      message: "Result belongs to a different request with the same prefix.",
      details: {
        input_truncated: true,
        kind_omitted: false,
        dialect_omitted: false,
      },
    },
  ],
}, "0".repeat(64)));
