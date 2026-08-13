import type { AdapterDescriptor, JsonObject } from "../contracts.js";
import type { ExpressionRegistry } from "../core/registry.js";

type Schema = Record<string, unknown>;

const diagnosticSchema: Schema = {
  type: "object",
  required: ["code", "severity", "message"],
  properties: {
    code: { type: "string" },
    severity: { enum: ["error", "warning"] },
    message: { type: "string" },
    span: {
      type: "object",
      properties: { start: { type: "integer" }, end: { type: "integer" } },
      required: ["start", "end"],
      additionalProperties: false,
    },
    expected: { type: "object" },
    details: { type: "object" },
    repair_candidates: {
      type: "array",
      items: {
        type: "object",
        properties: {
          expression: { type: "string" },
          confidence: { type: "number" },
          reason: { type: "string" },
        },
        required: ["expression"],
        additionalProperties: false,
      },
    },
  },
  additionalProperties: false,
};

const provenanceSchema: Schema = {
  type: "object",
  required: ["spec", "engine", "engine_version", "compatibility_mode"],
  properties: {
    spec: { type: "string" },
    engine: { type: "string" },
    engine_version: { type: "string" },
    compatibility_mode: { type: "string" },
    runtime: { type: "string" },
    runtime_version: { type: "string" },
    timezone_engine: { type: "string" },
    timezone_data_version: { type: "string" },
    icu_version: { type: "string" },
  },
  additionalProperties: false,
};

const detectionCandidateSchema: Schema = {
  type: "object",
  properties: {
    kind: { type: "string" },
    dialect: { type: "string" },
    confidence: { type: "number", minimum: 0, maximum: 1 },
    reason: { type: "string" },
    supported: { type: "boolean" },
  },
  required: ["kind", "confidence", "reason", "supported"],
  additionalProperties: false,
};

function successProperties(
  descriptor: AdapterDescriptor,
  operation: string,
): Record<string, unknown> {
  return {
    schema_version: { const: "sei.result.v1" },
    ok: { const: true },
    operation: { const: operation },
    input: { type: "string" },
    kind: { const: descriptor.kind },
    dialect: { enum: descriptor.dialects },
    normalized: { type: "string" },
    capabilities: { type: "array", items: { type: "string" } },
    diagnostics: { type: "array", items: diagnosticSchema },
    provenance: provenanceSchema,
  };
}

const successRequired = [
  "schema_version",
  "ok",
  "operation",
  "input",
  "kind",
  "dialect",
  "normalized",
  "capabilities",
  "diagnostics",
  "provenance",
];

function derivedSchema(descriptor: AdapterDescriptor): JsonObject | undefined {
  const contracts = descriptor.derive_contracts ?? [];
  if (contracts.length === 0) return undefined;
  return {
    type: "object",
    properties: Object.fromEntries(
      contracts.map((contract) => [contract.name, contract.result_schema]),
    ),
    minProperties: 1,
    additionalProperties: false,
  };
}

function basicVariants(descriptor: AdapterDescriptor): Schema[] {
  return ["interpret", "normalize", "validate"]
    .filter((operation) => descriptor.capabilities.includes(operation))
    .map((operation) => {
    const properties = successProperties(descriptor, operation);
    const required = [...successRequired];
    if (operation !== "validate") {
      properties.value = descriptor.interpretation_contract.value_schema;
      required.push("value");
    }
    if (descriptor.interpretation_contract.semantics_schema !== undefined) {
      properties.semantics = descriptor.interpretation_contract.semantics_schema;
      required.push("semantics");
    }
    const derived = derivedSchema(descriptor);
    if (derived !== undefined) properties.derived = derived;
    return { type: "object", properties, required, additionalProperties: false };
    });
}

function queryVariants(descriptor: AdapterDescriptor): Schema[] {
  return (descriptor.query_contracts ?? []).map((contract) => ({
    type: "object",
    properties: {
      ...successProperties(descriptor, "query"),
      query_name: { const: contract.name },
      query_result: contract.result_schema,
    },
    required: [...successRequired, "query_name", "query_result"],
    additionalProperties: false,
  }));
}

function conversionVariants(descriptor: AdapterDescriptor): Schema[] {
  const contract = descriptor.conversion_contract;
  if (contract === undefined) return [];
  return contract.target_representations.map((target) => ({
    type: "object",
    properties: {
      ...successProperties(descriptor, "convert"),
      conversion_target: { const: target },
      converted: contract.result_schemas[target] ?? false,
    },
    required: [...successRequired, "conversion_target", "converted"],
    additionalProperties: false,
  }));
}

function detectVariant(): Schema {
  return {
    type: "object",
    properties: {
      schema_version: { const: "sei.result.v1" },
      ok: { const: true },
      operation: { const: "detect" },
      input: { type: "string" },
      candidates: { type: "array", items: detectionCandidateSchema },
      resolved: { const: false },
      diagnostics: { type: "array", items: diagnosticSchema },
    },
    required: ["schema_version", "ok", "operation", "input", "candidates", "resolved", "diagnostics"],
    additionalProperties: false,
  };
}

function failureVariant(): Schema {
  return {
    type: "object",
    properties: {
      schema_version: { const: "sei.result.v1" },
      ok: { const: false },
      operation: {
        enum: ["interpret", "validate", "normalize", "query", "convert", "detect"],
      },
      input: { type: "string" },
      kind: { type: "string" },
      dialect: { type: "string" },
      diagnostics: {
        type: "array",
        minItems: 1,
        items: diagnosticSchema,
        contains: {
          type: "object",
          properties: { severity: { const: "error" } },
          required: ["severity"],
        },
      },
    },
    required: ["schema_version", "ok", "operation", "input", "diagnostics"],
    additionalProperties: false,
  };
}

export function createResultSchema(registry: ExpressionRegistry): Schema {
  const variants = registry.list().flatMap((descriptor) => [
    ...basicVariants(descriptor),
    ...queryVariants(descriptor),
    ...conversionVariants(descriptor),
  ]);
  return {
    $schema: "https://json-schema.org/draft/2020-12/schema",
    $id: "https://openadam.local/schemas/sei.result.v1.schema.json",
    title: "SEI result v1",
    oneOf: [failureVariant(), detectVariant(), ...variants],
  };
}
