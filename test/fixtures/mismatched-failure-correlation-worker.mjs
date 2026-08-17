import { parentPort, workerData } from "node:worker_threads";
import { correlationDigest, workerEnvelope } from "./worker-fixture-protocol.mjs";

if (parentPort === null) throw new Error("Fixture must run in a worker thread.");

const otherRequest = workerData.op === "query"
  ? { ...workerData, query: { ...workerData.query, name: "intersects" } }
  : {
      ...workerData,
      convert: { ...workerData.convert, target_representation: "octal" },
    };
const result = {
  schema_version: "sei.result.v1",
  ok: false,
  operation: workerData.op,
  input: workerData.expression,
  kind: workerData.kind,
  diagnostics: [
    {
      code: "E_FIXTURE",
      severity: "error",
      message: "Failure belongs to a different logical request.",
    },
  ],
};

parentPort.postMessage(workerEnvelope(workerData, result, correlationDigest(otherRequest)));
