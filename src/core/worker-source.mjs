import { parentPort, workerData } from "node:worker_threads";
import { tsImport } from "tsx/esm/api";

if (parentPort === null) {
  throw new Error("SEI source worker must run inside a worker thread.");
}

const { createWorkerResultEnvelope, defaultRegistry, interpret } = await tsImport(
  "./worker-entry.ts",
  import.meta.url,
);

parentPort.postMessage(
  createWorkerResultEnvelope(workerData, interpret(workerData, defaultRegistry)),
);
