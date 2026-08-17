import { parentPort, workerData } from "node:worker_threads";
import { defaultRegistry } from "../default-registry.js";
import { interpret } from "./interpreter.js";
import { createWorkerResultEnvelope } from "./worker-protocol.js";

if (parentPort === null) {
  throw new Error("SEI worker must run inside a worker thread.");
}

parentPort.postMessage(
  createWorkerResultEnvelope(workerData, interpret(workerData, defaultRegistry)),
);
