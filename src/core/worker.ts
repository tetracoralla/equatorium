import { parentPort, workerData } from "node:worker_threads";
import { defaultRegistry } from "../default-registry.js";
import { interpret } from "./interpreter.js";

if (parentPort === null) {
  throw new Error("SEI worker must run inside a worker thread.");
}

parentPort.postMessage(interpret(workerData, defaultRegistry));
