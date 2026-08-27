import type { ExpressionRegistry } from "../core/registry.js";

type Schema = Record<string, unknown>;

const jsonObject: Schema = {
  type: "object",
  additionalProperties: true,
};

const diagnosticSchema: Schema = {
  type: "object",
  required: ["code", "severity", "message"],
  properties: {
    code: { type: "string", maxLength: 128 },
    severity: { enum: ["error", "warning"] },
    message: { type: "string", maxLength: 4_096 },
    span: {
      type: "object",
      required: ["start", "end"],
      properties: {
        start: { type: "integer", minimum: 0 },
        end: { type: "integer", minimum: 0 },
      },
      additionalProperties: false,
    },
    expected: jsonObject,
    details: jsonObject,
    repair_candidates: {
      type: "array",
      maxItems: 8,
      items: {
        type: "object",
        required: ["expression"],
        properties: {
          expression: { type: "string" },
          confidence: { type: "number", minimum: 0, maximum: 1 },
          reason: { type: "string" },
        },
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

/**
 * The MCP transport's compact projection of the registry's complete result union.
 *
 * The canonical `sei.result.v1` schema deliberately remains the full semantic
 * contract and validates every bounded worker result. Publishing that 79 KiB tagged
 * union in every MCP tools/list response is counterproductive: hosts have to retain
 * it before one tool has been selected. This projection remains closed at the
 * transport envelope, retains every returned field, and types the stable routing,
 * error, provenance, and collection boundaries. `value`, `semantics`, `derived`,
 * and query payloads stay descriptor-owned objects; their complete schemas are
 * available from the published SEI contract after the caller has selected the tool.
 */
export function createAgentResultSchema(registry: ExpressionRegistry): Schema {
  const descriptors = registry.list();
  const kinds = descriptors.map((descriptor) => descriptor.kind);
  const dialects = [...new Set(descriptors.flatMap((descriptor) => descriptor.dialects))].sort();
  const queryNames = [...new Set(descriptors.flatMap((descriptor) =>
    descriptor.query_contracts?.map((contract) => contract.name) ?? []
  ))].sort();
  const targetRepresentations = [...new Set(descriptors.flatMap((descriptor) =>
    descriptor.conversion_contract?.target_representations ?? []
  ))].sort();

  return {
    $schema: "https://json-schema.org/draft/2020-12/schema",
    $id: "https://openadam.local/schemas/sei.agent-result.v1.schema.json",
    title: "SEI Agent result v1",
    description:
      "Compact closed MCP projection of sei.result.v1. Check ok first. Stable routing and diagnostic fields are typed here; descriptor-owned value, semantics, derived, and query payload objects preserve the complete canonical SEI result without expanding the tools/list catalog.",
    type: "object",
    required: ["schema_version", "ok", "operation", "input", "diagnostics"],
    properties: {
      schema_version: { const: "sei.result.v1" },
      ok: { type: "boolean" },
      operation: { enum: ["interpret", "validate", "normalize", "query", "convert", "detect"] },
      input: { type: "string" },
      kind: { type: "string", enum: kinds },
      dialect: { type: "string", enum: dialects },
      normalized: { type: "string" },
      capabilities: { type: "array", items: { type: "string" }, uniqueItems: true },
      diagnostics: { type: "array", maxItems: 64, items: diagnosticSchema },
      provenance: provenanceSchema,
      value: jsonObject,
      semantics: jsonObject,
      derived: jsonObject,
      query_name: { type: "string", enum: queryNames },
      query_result: {
        oneOf: [
          { type: "array", maxItems: 256, items: jsonObject },
          jsonObject,
          { type: "string" },
        ],
      },
      conversion_target: { type: "string", enum: targetRepresentations },
      converted: {
        type: "object",
        required: ["representation", "expression"],
        properties: {
          representation: { type: "string", enum: targetRepresentations },
          expression: { type: "string" },
        },
        additionalProperties: false,
      },
      candidates: {
        type: "array",
        maxItems: 8,
        items: {
          type: "object",
          required: ["kind", "confidence", "reason", "supported"],
          properties: {
            kind: { type: "string" },
            dialect: { type: "string" },
            confidence: { type: "number", minimum: 0, maximum: 1 },
            reason: { type: "string" },
            supported: { type: "boolean" },
          },
          additionalProperties: false,
        },
      },
      resolved: { const: false },
    },
    additionalProperties: false,
  };
}
