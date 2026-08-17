import { parentPort, workerData } from "node:worker_threads";
import { workerEnvelope } from "./worker-fixture-protocol.mjs";

const provenance = {
  spec: "fixture",
  engine: "fixture",
  engine_version: "1",
  compatibility_mode: "fixture",
};

if (workerData.op === "query") {
  parentPort.postMessage(workerEnvelope(workerData, {
    schema_version: "sei.result.v1",
    ok: true,
    operation: "query",
    input: workerData.expression,
    kind: "semver_range",
    dialect: "npm",
    normalized: ">=1.0.0 <2.0.0-0",
    capabilities: ["interpret", "query.intersects"],
    diagnostics: [],
    provenance,
    query_name: "intersects",
    query_result: { range: ">=1.5.0", intersects: true },
  }));
} else if (workerData.op === "convert") {
  parentPort.postMessage(workerEnvelope(workerData, {
    schema_version: "sei.result.v1",
    ok: true,
    operation: "convert",
    input: workerData.expression,
    kind: "unix_permission",
    dialect: "posix-mode",
    normalized: "0755",
    capabilities: ["interpret", "convert"],
    diagnostics: [],
    provenance,
    conversion_target: "octal",
    converted: { representation: "octal", expression: "0755" },
  }));
} else if (workerData.expression === "^2") {
  parentPort.postMessage(workerEnvelope(workerData, {
    schema_version: "sei.result.v1",
    ok: true,
    operation: "interpret",
    input: workerData.expression,
    kind: "uri",
    dialect: "rfc3986",
    normalized: "https://example.com/",
    capabilities: ["interpret"],
    diagnostics: [],
    provenance,
    value: { scheme: "https", path: "/" },
  }));
} else if (workerData.expression === "^3") {
  parentPort.postMessage(workerEnvelope(workerData, {
    schema_version: "sei.result.v1",
    ok: true,
    operation: "normalize",
    input: workerData.expression,
    kind: "semver_range",
    dialect: "npm",
    normalized: ">=3.0.0 <4.0.0-0",
    capabilities: ["interpret", "normalize"],
    diagnostics: [],
    provenance,
    value: { comparator_sets: [[{ operator: ">=", version: "3.0.0" }]] },
  }));
} else {
  parentPort.postMessage(workerEnvelope(workerData, {
    schema_version: "sei.result.v1",
    ok: true,
    operation: "interpret",
    input: "^9",
    kind: "semver_range",
    dialect: "npm",
    normalized: ">=9.0.0 <10.0.0-0",
    capabilities: ["interpret"],
    diagnostics: [],
    provenance,
    value: { comparator_sets: [[{ operator: ">=", version: "9.0.0" }]] },
  }));
}
