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

function limitsSchema(): Schema {
  return {
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
  };
}

function mergedFieldSchema(fields: readonly InputFieldSchema[]): Schema {
  const types = [...new Set(fields.map((field) => field.type))];
  if (types.length !== 1) {
    throw new Error(`MCP compatibility field has conflicting types: ${types.join(", ")}.`);
  }
  const descriptions = [...new Set(fields.map((field) => field.description).filter(Boolean))];
  const enumValues = [...new Set(fields.flatMap((field) => field.enum ?? []))];
  const minimums = fields.flatMap((field) => field.minimum === undefined ? [] : [field.minimum]);
  const maximums = fields.flatMap((field) => field.maximum === undefined ? [] : [field.maximum]);
  const minimumLengths = fields.flatMap(
    (field) => field.min_length === undefined ? [] : [field.min_length],
  );
  const maximumLengths = fields.flatMap(
    (field) => field.max_length === undefined ? [] : [field.max_length],
  );
  const patterns = [...new Set(fields.flatMap((field) => field.pattern ?? []))];
  return {
    type: types[0] === "integer" ? "integer" : types[0],
    ...(descriptions.length === 0 ? {} : { description: descriptions.join(" / ") }),
    ...(enumValues.length === 0 ? {} : { enum: enumValues }),
    ...(minimums.length === 0 ? {} : { minimum: Math.min(...minimums) }),
    ...(maximums.length === 0 ? {} : { maximum: Math.max(...maximums) }),
    ...(minimumLengths.length === 0 ? {} : { minLength: Math.min(...minimumLengths) }),
    ...(maximumLengths.length === 0 ? {} : { maxLength: Math.max(...maximumLengths) }),
    ...(patterns.length === 1 ? { pattern: patterns[0] } : {}),
  };
}

function mergedProperties(models: readonly (InputObjectSchema | undefined)[]): Schema {
  const fields = new Map<string, InputFieldSchema[]>();
  for (const model of models) {
    if (model === undefined) continue;
    for (const [name, field] of Object.entries(model.properties)) {
      const existing = fields.get(name) ?? [];
      existing.push(field);
      fields.set(name, existing);
    }
  }
  return Object.fromEntries(
    [...fields.entries()]
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([name, variants]) => [name, mergedFieldSchema(variants)]),
  );
}

const QUERY_ARGUMENT_GUIDANCE: Record<string, string> = {
  candidate: "For semver_range/matches use a SemVer version; for cron/matches use an RFC 3339 timestamp.",
  range: "Required only for semver_range query name intersects; another npm range.",
  count: "Optional only for cron query name next_occurrences; number of instants.",
  address: "Required only for cidr query name contains; one strict IP address.",
  cidr: "Required only for cidr query name overlaps; another strict CIDR.",
  reference: "Required only for uri query name resolve; a URI reference.",
  uri: "Required only for uri query name equals; another URI with a scheme.",
  name: "Required only for content_type query name parameter; parameter name.",
  subject: "Required only for unix_permission query name allows; owner, group, or other.",
  permission: "Required only for unix_permission query name allows; read, write, or execute.",
};

function agentQueryArgumentProperties(descriptors: readonly AdapterDescriptor[]): Schema {
  const properties = mergedProperties(descriptors.flatMap(
    (descriptor) => descriptor.query_contracts ?? [],
  ).map((contract) => contract.arguments));
  return Object.fromEntries(Object.entries(properties).map(([name, schema]) => [
    name,
    typeof schema === "object" && schema !== null && QUERY_ARGUMENT_GUIDANCE[name] !== undefined
      ? { ...schema, description: QUERY_ARGUMENT_GUIDANCE[name] }
      : schema,
  ]));
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
      limits: limitsSchema(),
    },
    additionalProperties: false,
    oneOf: variants,
  };
}

/**
 * A host-compatible projection of the complete request contract.
 *
 * Some Agent hosts collapse large conditional schemas to `unknown`. This projection keeps every
 * public field and argument typed without conditional keywords; interpretBounded() remains the
 * authority for operation-specific combinations and uses the complete registry-derived contract.
 */
export function createAgentRequestSchema(registry: ExpressionRegistry): Schema {
  const descriptors = registry.list();
  const queryContracts = descriptors.flatMap((descriptor) => descriptor.query_contracts ?? []);
  const conversionContracts = descriptors.flatMap((descriptor) =>
    descriptor.conversion_contract === undefined ? [] : [descriptor.conversion_contract]
  );
  const kinds = descriptors.map((descriptor) => descriptor.kind);
  const dialects = [...new Set(descriptors.flatMap((descriptor) => descriptor.dialects))].sort();
  const deriveNames = [...new Set(descriptors.flatMap((descriptor) =>
    descriptor.derive_contracts?.map((contract) => contract.name) ?? []
  ))].sort();
  const queryNames = [...new Set(queryContracts.map((contract) => contract.name))].sort();
  const targetDialects = [...new Set(conversionContracts.flatMap(
    (contract) => contract.target_dialects,
  ))].sort();
  const targetRepresentations = [...new Set(conversionContracts.flatMap(
    (contract) => contract.target_representations,
  ))].sort();

  return {
    $schema: "https://json-schema.org/draft/2020-12/schema",
    $id: "https://openadam.local/schemas/sei.agent-request.v1.schema.json",
    title: "SEI Agent request v1",
    description:
      "Use one operation only. detect accepts only op and expression, plus optional schema_version or limits; omit kind, dialect, context, derive, query, and convert. Detection never calculates occurrences. interpret/validate/normalize require kind; query additionally requires query; convert additionally requires convert. Omit derive unless kind=cron. A successful structured result is final—do not add normalize or interpret calls.",
    type: "object",
    required: ["op", "expression"],
    properties: {
      schema_version: { const: "sei.request.v1" },
      op: {
        enum: ["interpret", "validate", "normalize", "query", "convert", "detect"],
        description: "Choose one operation. For detect, send only op and expression (plus optional schema_version or limits); never send kind, dialect, context, derive, query, or convert. Detection returns unresolved candidates and does not choose a timezone or calculate occurrences.",
      },
      expression: { type: "string", maxLength: HARD_LIMITS.max_expression_length },
      kind: {
        type: "string",
        enum: kinds,
        description: "Required for every operation except detect. Map Content-Type to content_type, ISO 8601 duration to iso_duration, and one RFC 5545 RRULE property to rrule.",
      },
      dialect: {
        type: "string",
        enum: dialects,
        description: "Use the selected kind's dialect. Cron requires an explicit choice between unix-5 and github-actions.",
      },
      context: {
        type: "object",
        description: "Optional only for operations and kinds that declare context. Never supply when op=detect.",
        properties: mergedProperties(descriptors.map((descriptor) => descriptor.context_contract)),
        additionalProperties: false,
      },
      derive: {
        type: "array",
        items: { type: "string", enum: deriveNames },
        uniqueItems: true,
        maxItems: deriveNames.length,
        description: "Optional only for kind=cron interpret/validate/normalize. Never supply when op=detect or op=query; omit for every non-Cron kind.",
      },
      query: {
        type: "object",
        required: ["name"],
        description:
          "Required only when op=query. Names by kind: cron next_occurrences/matches; semver_range matches/intersects; cidr contains/overlaps; uri resolve/equals; content_type parameter; unix_permission allows.",
        properties: {
          name: { type: "string", enum: queryNames },
          arguments: {
            type: "object",
            description: "Supply only the arguments named for the chosen kind and query.",
            properties: agentQueryArgumentProperties(descriptors),
            additionalProperties: false,
          },
        },
        additionalProperties: false,
      },
      convert: {
        type: "object",
        required: ["target_representation"],
        description: "Required only when op=convert; currently used by unix_permission.",
        properties: {
          target_dialect: { type: "string", enum: targetDialects },
          target_representation: { type: "string", enum: targetRepresentations },
          arguments: {
            type: "object",
            properties: mergedProperties(conversionContracts.map((contract) => contract.arguments)),
            additionalProperties: false,
          },
        },
        additionalProperties: false,
      },
      limits: limitsSchema(),
    },
    additionalProperties: false,
  };
}
