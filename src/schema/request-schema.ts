import type {
  AdapterDescriptor,
  InputFieldSchema,
  InputObjectSchema,
} from "../contracts.js";
import type { ExpressionRegistry } from "../core/registry.js";
import { HARD_LIMITS, MINIMUM_LIMITS } from "../core/request.js";

type Schema = Record<string, unknown>;

function fieldSchema(field: InputFieldSchema): Schema {
  return {
    type: field.type === "integer" ? "integer" : field.type,
    description: field.description,
    ...(field.enum === undefined ? {} : { enum: field.enum }),
    ...(field.minimum === undefined ? {} : { minimum: field.minimum }),
    ...(field.maximum === undefined ? {} : { maximum: field.maximum }),
    ...(field.min_length === undefined ? {} : { minLength: field.min_length }),
    ...(field.max_length === undefined ? {} : { maxLength: field.max_length }),
    ...(field.pattern === undefined ? {} : { pattern: field.pattern }),
  };
}

function objectSchema(model: InputObjectSchema, required = model.required): Schema {
  return {
    type: "object",
    properties: Object.fromEntries(
      Object.entries(model.properties).map(([name, field]) => [name, fieldSchema(field)]),
    ),
    required,
    additionalProperties: false,
  };
}

function contextSchema(
  descriptor: AdapterDescriptor,
  extraRequired: readonly string[] = [],
): Schema | false {
  const contract = descriptor.context_contract;
  if (contract === undefined) return false;
  return objectSchema(contract, [...new Set([...contract.required, ...extraRequired])]);
}

function adapterProperties(descriptor: AdapterDescriptor): Schema {
  return {
    kind: { const: descriptor.kind },
    dialect: { enum: descriptor.dialects },
  };
}

function adapterRequired(descriptor: AdapterDescriptor): string[] {
  return descriptor.default_dialect === undefined ? ["kind", "dialect"] : ["kind"];
}

function basicVariants(descriptor: AdapterDescriptor): Schema[] {
  const deriveNames = descriptor.derive_contracts?.map((contract) => contract.name) ?? [];
  const derive = deriveNames.length === 0
    ? { type: "array", maxItems: 0 }
    : {
        type: "array",
        items: { enum: deriveNames },
        uniqueItems: true,
        maxItems: deriveNames.length,
      };
  const contextRequirements = (descriptor.derive_contracts ?? [])
    .filter((contract) => (contract.required_context?.length ?? 0) > 0)
    .map((contract) => ({
      if: {
        properties: { derive: { type: "array", contains: { const: contract.name } } },
        required: ["derive"],
      },
      then: {
        properties: {
          context: contextSchema(descriptor, contract.required_context),
        },
        required: ["context"],
      },
    }));
  return ["interpret", "validate", "normalize"]
    .filter((operation) => descriptor.capabilities.includes(operation))
    .map((operation) => ({
    properties: {
      op: { const: operation },
      ...adapterProperties(descriptor),
      context: contextSchema(descriptor),
      derive,
      query: false,
      convert: false,
    },
    required: ["op", ...adapterRequired(descriptor)],
    ...(contextRequirements.length === 0 ? {} : { allOf: contextRequirements }),
    }));
}

function queryVariants(descriptor: AdapterDescriptor): Schema[] {
  return (descriptor.query_contracts ?? []).map((contract) => ({
    properties: {
      op: { const: "query" },
      ...adapterProperties(descriptor),
      context: contextSchema(descriptor, contract.required_context),
      derive: false,
      convert: false,
      query: {
        type: "object",
        properties: {
          name: { const: contract.name },
          arguments: objectSchema(contract.arguments),
        },
        required: [
          "name",
          ...(contract.arguments.required.length === 0 ? [] : ["arguments"]),
        ],
        additionalProperties: false,
      },
    },
    required: [
      "op",
      ...adapterRequired(descriptor),
      ...((contract.required_context?.length ?? 0) === 0 ? [] : ["context"]),
      "query",
    ],
  }));
}

function conversionVariant(descriptor: AdapterDescriptor): Schema[] {
  const contract = descriptor.conversion_contract;
  if (contract === undefined) return [];
  return [
    {
      properties: {
        op: { const: "convert" },
        ...adapterProperties(descriptor),
        context: contextSchema(descriptor),
        derive: false,
        query: false,
        convert: {
          type: "object",
          properties: {
            target_dialect: { enum: contract.target_dialects },
            target_representation: { enum: contract.target_representations },
            arguments: objectSchema(contract.arguments),
          },
          required: ["target_representation"],
          additionalProperties: false,
        },
      },
      required: ["op", ...adapterRequired(descriptor), "convert"],
    },
  ];
}

export function createRequestSchema(registry: ExpressionRegistry): Schema {
  const descriptors = registry.list();
  const variants = descriptors.flatMap((descriptor) => [
    ...basicVariants(descriptor),
    ...queryVariants(descriptor),
    ...conversionVariant(descriptor),
  ]);
  variants.push({
    properties: {
      op: { const: "detect" },
      kind: false,
      dialect: false,
      context: false,
      derive: false,
      query: false,
      convert: false,
    },
    required: ["op"],
  });

  return {
    $schema: "https://json-schema.org/draft/2020-12/schema",
    $id: "https://openadam.local/schemas/sei.request.v1.schema.json",
    title: "SEI request v1",
    type: "object",
    required: ["op", "expression"],
    properties: {
      schema_version: { const: "sei.request.v1" },
      op: { enum: ["interpret", "validate", "normalize", "query", "convert", "detect"] },
      expression: { type: "string", maxLength: HARD_LIMITS.max_expression_length },
      kind: { type: "string", minLength: 1 },
      dialect: { type: "string", minLength: 1 },
      context: {
        type: "object",
        properties: {
          timezone: { type: "string", minLength: 1, maxLength: 255 },
          reference_time: { type: "string", minLength: 20, maxLength: 35 },
        },
        additionalProperties: false,
      },
      derive: { type: "array", items: { type: "string" }, uniqueItems: true },
      query: { type: "object" },
      convert: { type: "object" },
      limits: {
        type: "object",
        properties: {
          max_expression_length: { type: "integer", minimum: MINIMUM_LIMITS.max_expression_length, maximum: HARD_LIMITS.max_expression_length },
          max_output_items: { type: "integer", minimum: MINIMUM_LIMITS.max_output_items, maximum: HARD_LIMITS.max_output_items },
          max_request_bytes: { type: "integer", minimum: MINIMUM_LIMITS.max_request_bytes, maximum: HARD_LIMITS.max_request_bytes },
          max_response_bytes: { type: "integer", minimum: MINIMUM_LIMITS.max_response_bytes, maximum: HARD_LIMITS.max_response_bytes },
          max_nesting_depth: { type: "integer", minimum: MINIMUM_LIMITS.max_nesting_depth, maximum: HARD_LIMITS.max_nesting_depth },
          max_collection_entries: { type: "integer", minimum: MINIMUM_LIMITS.max_collection_entries, maximum: HARD_LIMITS.max_collection_entries },
          max_string_length: { type: "integer", minimum: MINIMUM_LIMITS.max_string_length, maximum: HARD_LIMITS.max_string_length },
          max_execution_ms: { type: "integer", minimum: MINIMUM_LIMITS.max_execution_ms, maximum: HARD_LIMITS.max_execution_ms },
        },
        additionalProperties: false,
      },
    },
    additionalProperties: false,
    oneOf: variants,
  };
}
