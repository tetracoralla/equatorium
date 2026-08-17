import { parentPort, workerData } from "node:worker_threads";
import { correlationDigest, workerEnvelope } from "./worker-fixture-protocol.mjs";

if (parentPort === null) throw new Error("Fixture must run in a worker thread.");

const otherRequest = workerData.query !== undefined
  ? {
      ...workerData,
      query: {
        ...workerData.query,
        arguments: { ...workerData.query.arguments, range: ">=1.5.0" },
      },
    }
  : {
      ...workerData,
      context: {
        ...workerData.context,
        reference_time: "2026-08-15T00:00:00Z",
      },
    };

const result = {
  schema_version: "sei.result.v1",
  ok: false,
  operation: workerData.op,
  input: workerData.expression,
  kind: workerData.kind,
  dialect: workerData.dialect,
  diagnostics: [
    {
      code: "E_FIXTURE",
      severity: "error",
      message: "Failure belongs to a request with different semantic inputs.",
    },
  ],
};

parentPort.postMessage(workerEnvelope(workerData, result, correlationDigest(otherRequest)));
