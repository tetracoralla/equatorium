import { writeFile } from "node:fs/promises";
import { createRequestSchema, createResultSchema, defaultRegistry } from "../src/index.js";

await writeFile(
  "schemas/sei.request.v1.schema.json",
  `${JSON.stringify(createRequestSchema(defaultRegistry), null, 2)}\n`,
  "utf8",
);

await writeFile(
  "schemas/sei.result.v1.schema.json",
  `${JSON.stringify(createResultSchema(defaultRegistry), null, 2)}\n`,
  "utf8",
);
