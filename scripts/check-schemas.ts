import { readFile } from "node:fs/promises";
import { isDeepStrictEqual } from "node:util";
import { Ajv2020 } from "ajv/dist/2020.js";
import {
  createRequestSchema,
  createResultSchema,
  defaultRegistry,
  interpret,
} from "../src/index.js";

const ajv = new Ajv2020({ allErrors: true, strict: true });
const requestSchema = JSON.parse(
  await readFile("schemas/sei.request.v1.schema.json", "utf8"),
) as object;
const resultSchema = JSON.parse(
  await readFile("schemas/sei.result.v1.schema.json", "utf8"),
) as object;
const generatedRequestSchema = createRequestSchema(defaultRegistry);
const generatedResultSchema = createResultSchema(defaultRegistry);
if (!isDeepStrictEqual(requestSchema, generatedRequestSchema)) {
  throw new Error(
    "Published request schema has drifted from the runtime operation contracts; run npm run generate:schemas.",
  );
}
if (!isDeepStrictEqual(resultSchema, generatedResultSchema)) {
  throw new Error(
    "Published result schema has drifted from the adapter output contracts; run npm run generate:schemas.",
  );
}

const validateRequest = ajv.compile(requestSchema);
const validateResult = ajv.compile(resultSchema);
const request = {
  schema_version: "sei.request.v1",
  op: "query",
  kind: "semver_range",
  expression: "^3.2.0",
  query: { name: "matches", arguments: { candidate: "3.7.4" } },
};
if (!validateRequest(request)) {
  throw new Error(`Request schema rejected its smoke request: ${ajv.errorsText(validateRequest.errors)}`);
}
const misspelled = {
  ...request,
  query: { name: "matches", arguments: { candidate: "3.7.4", candiate: "3.7.4" } },
};
if (validateRequest(misspelled)) {
  throw new Error("Request schema accepted an unknown query argument.");
}
if (validateRequest({ ...request, context: { timezone: "UTC" } })) {
  throw new Error("Request schema accepted context for an adapter that does not declare it.");
}
if (validateRequest({
  op: "query",
  kind: "cron",
  dialect: "unix-5",
  expression: "0 9 * * *",
  query: { name: "next_occurrences" },
})) {
  throw new Error("Request schema accepted a replay-sensitive query without reference_time.");
}
const result = interpret(request, defaultRegistry);
if (!validateResult(result)) {
  throw new Error(`Result schema rejected a runtime result: ${ajv.errorsText(validateResult.errors)}`);
}

const resultContractRequests = [
  { op: "interpret", kind: "cron", dialect: "unix-5", expression: "0 9 * * 1-5" },
  {
    op: "interpret",
    kind: "cron",
    dialect: "unix-5",
    expression: "0 9 * * 1-5",
    context: { reference_time: "2026-08-13T00:00:00Z" },
    derive: ["human_description", "next_occurrences"],
  },
  { op: "validate", kind: "cron", dialect: "unix-5", expression: "0 9 * * 1-5" },
  { op: "normalize", kind: "semver_range", expression: "^3.2.0" },
  { op: "interpret", kind: "cidr", expression: "192.168.1.0/24" },
  { op: "interpret", kind: "uri", expression: "https://example.com/path" },
  { op: "interpret", kind: "content_type", expression: "text/html; charset=utf-8" },
  { op: "interpret", kind: "iso_duration", expression: "P1DT3H" },
  { op: "interpret", kind: "rrule", expression: "RRULE:FREQ=WEEKLY;COUNT=10;BYDAY=MO,WE" },
  { op: "interpret", kind: "unix_permission", expression: "755" },
  {
    op: "query",
    kind: "cron",
    dialect: "unix-5",
    expression: "0 9 * * *",
    context: { reference_time: "2026-08-13T00:00:00Z" },
    query: { name: "next_occurrences", arguments: { count: 1 } },
  },
  {
    op: "query",
    kind: "cron",
    dialect: "unix-5",
    expression: "0 9 * * *",
    query: { name: "matches", arguments: { candidate: "2026-08-13T09:00:00Z" } },
  },
  {
    op: "query",
    kind: "semver_range",
    expression: "^3.2.0",
    query: { name: "intersects", arguments: { range: ">=3.5.0 <3.8.0" } },
  },
  {
    op: "query",
    kind: "cidr",
    expression: "192.168.1.0/24",
    query: { name: "contains", arguments: { address: "192.168.1.2" } },
  },
  {
    op: "query",
    kind: "cidr",
    expression: "192.168.1.0/24",
    query: { name: "overlaps", arguments: { cidr: "192.168.1.128/25" } },
  },
  {
    op: "query",
    kind: "uri",
    expression: "https://example.com/a/",
    query: { name: "resolve", arguments: { reference: "../b" } },
  },
  {
    op: "query",
    kind: "uri",
    expression: "https://example.com/a/",
    query: { name: "equals", arguments: { uri: "https://EXAMPLE.com/a/" } },
  },
  {
    op: "query",
    kind: "content_type",
    expression: "text/html; charset=utf-8",
    query: { name: "parameter", arguments: { name: "charset" } },
  },
  {
    op: "query",
    kind: "unix_permission",
    expression: "755",
    query: { name: "allows", arguments: { subject: "owner", permission: "write" } },
  },
  {
    op: "convert",
    kind: "unix_permission",
    expression: "755",
    convert: { target_representation: "symbolic" },
  },
  {
    op: "convert",
    kind: "unix_permission",
    expression: "rwxr-xr-x",
    convert: { target_representation: "octal" },
  },
  { op: "detect", expression: "755" },
] as const;

for (const contractRequest of resultContractRequests) {
  const contractResult = interpret(contractRequest, defaultRegistry);
  if (!validateResult(contractResult)) {
    throw new Error(
      `Result schema rejected ${contractRequest.op}/${"kind" in contractRequest ? contractRequest.kind : "detect"}: ${ajv.errorsText(validateResult.errors)}`,
    );
  }
}

const conversionResult = interpret(
  {
    op: "convert",
    kind: "unix_permission",
    expression: "755",
    convert: { target_representation: "symbolic" },
  },
  defaultRegistry,
);
if (
  validateResult({
    ...conversionResult,
    converted: { representation: "octal", expression: "0755" },
  })
) {
  throw new Error("Result schema accepted a conversion payload that contradicts its target tag.");
}

if (
  validateResult({
    ...result,
    query_result: { candidate: "3.7.4", matches: "not-a-boolean" },
  })
) {
  throw new Error("Result schema accepted a mistyped SemVer query result.");
}
process.stdout.write(
  "Published request/result schemas match runtime contracts and reject unknown or mistyped fields.\n",
);
