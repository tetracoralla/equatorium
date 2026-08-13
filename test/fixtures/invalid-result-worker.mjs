import { parentPort } from "node:worker_threads";

parentPort.postMessage("not-a-result-envelope");
