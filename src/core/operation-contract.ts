import type {
  AdapterDescriptor,
  InputFieldSchema,
  InputObjectSchema,
  JsonObject,
  JsonPrimitive,
  SeiRequest,
} from "../contracts.js";
import { SeiError } from "./errors.js";

function requireContextFields(
  request: SeiRequest,
  required: readonly string[] | undefined,
): void {
  for (const name of required ?? []) {
    if (request.context === undefined || !Object.hasOwn(request.context, name)) {
      if (name === "reference_time") {
        throw new SeiError(
          "E_REFERENCE_TIME_REQUIRED",
          "This operation requires explicit 'context.reference_time' for deterministic replay.",
        );
      }
      throw new SeiError(
        "E_CONTEXT_REQUIRED",
        `This operation requires explicit 'context.${name}'.`,
      );
    }
  }
}

function isJsonPrimitive(value: unknown): value is JsonPrimitive {
  return value === null || ["string", "number", "boolean"].includes(typeof value);
}

function validateField(
  value: unknown,
  schema: InputFieldSchema,
  location: string,
): void {
  if (schema.type === "string") {
    if (typeof value !== "string") {
      throw new SeiError("E_REQUEST_INVALID", `${location} must be a string.`);
    }
    if (schema.min_length !== undefined && value.length < schema.min_length) {
      throw new SeiError(
        schema.diagnostic_code ?? "E_REQUEST_INVALID",
        `${location} must contain at least ${schema.min_length} character(s).`,
      );
    }
    if (schema.max_length !== undefined && value.length > schema.max_length) {
      throw new SeiError(
        schema.diagnostic_code ?? "E_REQUEST_INVALID",
        `${location} exceeds its ${schema.max_length}-character limit.`,
      );
    }
    if (schema.pattern !== undefined && !new RegExp(schema.pattern, "u").test(value)) {
      throw new SeiError(
        schema.diagnostic_code ?? "E_REQUEST_INVALID",
        `${location} does not match its declared format.`,
      );
    }
  } else if (schema.type === "integer") {
    if (!Number.isSafeInteger(value)) {
      throw new SeiError("E_REQUEST_INVALID", `${location} must be a safe integer.`);
    }
    if (schema.minimum !== undefined && (value as number) < schema.minimum) {
      throw new SeiError("E_REQUEST_INVALID", `${location} must be at least ${schema.minimum}.`);
    }
    if (schema.maximum !== undefined && (value as number) > schema.maximum) {
      throw new SeiError("E_REQUEST_INVALID", `${location} cannot exceed ${schema.maximum}.`);
    }
  } else if (typeof value !== "boolean") {
    throw new SeiError("E_REQUEST_INVALID", `${location} must be boolean.`);
  }

  if (
    schema.enum !== undefined &&
    (!isJsonPrimitive(value) || !schema.enum.some((candidate) => candidate === value))
  ) {
    throw new SeiError("E_REQUEST_INVALID", `${location} is not an allowed value.`, {
      expected: { values: schema.enum },
    });
  }
}

export function validateObjectContract(
  value: JsonObject | undefined,
  schema: InputObjectSchema,
  location: string,
): void {
  const object = value ?? {};
  const unknown = Object.keys(object).filter(
    (name) => !Object.hasOwn(schema.properties, name),
  );
  if (unknown.length > 0) {
    throw new SeiError(
      "E_REQUEST_INVALID",
      `${location} contains unsupported field${unknown.length === 1 ? "" : "s"}: ${unknown.join(", ")}.`,
    );
  }
  for (const required of schema.required) {
    if (!Object.hasOwn(object, required)) {
      throw new SeiError("E_REQUEST_INVALID", `${location}.${required} is required.`);
    }
  }
  for (const [name, fieldValue] of Object.entries(object)) {
    const fieldSchema = Object.hasOwn(schema.properties, name)
      ? schema.properties[name]
      : undefined;
    if (fieldSchema !== undefined) {
      validateField(fieldValue, fieldSchema, `${location}.${name}`);
    }
  }
}

export function validateOperationContract(
  descriptor: AdapterDescriptor,
  request: SeiRequest,
): void {
  if (
    (request.op === "interpret" || request.op === "validate" || request.op === "normalize") &&
    !descriptor.capabilities.includes(request.op)
  ) {
    throw new SeiError(
      "E_OPERATION_UNSUPPORTED",
      `Kind '${descriptor.kind}' does not support operation '${request.op}'.`,
    );
  }
  if (descriptor.context_contract === undefined) {
    if (request.context !== undefined) {
      throw new SeiError(
        "E_REQUEST_INVALID",
        `Kind '${descriptor.kind}' does not accept context fields.`,
      );
    }
  } else {
    validateObjectContract(request.context, descriptor.context_contract, "context");
  }

  if (request.op === "query") {
    if (request.query === undefined) {
      throw new SeiError("E_QUERY_REQUIRED", "'query' is required for op='query'.");
    }
    const contract = descriptor.query_contracts?.find(
      (candidate) => candidate.name === request.query?.name,
    );
    if (contract === undefined) {
      throw new SeiError(
        "E_QUERY_UNSUPPORTED",
        `Kind '${descriptor.kind}' does not support query '${request.query.name}'.`,
        { expected: { queries: descriptor.query_contracts?.map((item) => item.name) ?? [] } },
      );
    }
    validateObjectContract(request.query.arguments, contract.arguments, "query.arguments");
    requireContextFields(request, contract.required_context);
  } else if (request.query !== undefined) {
    throw new SeiError("E_REQUEST_INVALID", "'query' is only allowed when op='query'.");
  }

  if (request.op === "convert") {
    if (request.convert === undefined) {
      throw new SeiError("E_CONVERSION_REQUIRED", "'convert' is required for op='convert'.");
    }
    const contract = descriptor.conversion_contract;
    if (contract === undefined) {
      throw new SeiError(
        "E_CONVERSION_UNSUPPORTED",
        `Kind '${descriptor.kind}' does not support conversion.`,
      );
    }
    if (
      request.convert.target_dialect !== undefined &&
      !contract.target_dialects.includes(request.convert.target_dialect)
    ) {
      throw new SeiError("E_CONVERSION_UNSUPPORTED", "Unsupported conversion target dialect.", {
        expected: { target_dialects: contract.target_dialects },
      });
    }
    if (
      request.convert.target_representation === undefined ||
      !contract.target_representations.includes(request.convert.target_representation)
    ) {
      throw new SeiError("E_CONVERSION_UNSUPPORTED", "Unsupported conversion representation.", {
        expected: { target_representations: contract.target_representations },
      });
    }
    validateObjectContract(request.convert.arguments, contract.arguments, "convert.arguments");
  } else if (request.convert !== undefined) {
    throw new SeiError("E_REQUEST_INVALID", "'convert' is only allowed when op='convert'.");
  }

  if (request.derive !== undefined) {
    if (!["interpret", "validate", "normalize"].includes(request.op)) {
      throw new SeiError(
        "E_REQUEST_INVALID",
        "'derive' is only allowed for interpret, validate, and normalize operations.",
      );
    }
    if (new Set(request.derive).size !== request.derive.length) {
      throw new SeiError("E_REQUEST_INVALID", "'derive' must not contain duplicate values.");
    }
    const supported = descriptor.derive_contracts?.map((contract) => contract.name) ?? [];
    const unsupported = request.derive.filter((name) => !supported.includes(name));
    if (unsupported.length > 0) {
      throw new SeiError(
        "E_DERIVE_UNSUPPORTED",
        `Kind '${descriptor.kind}' does not support derive value(s): ${unsupported.join(", ")}.`,
        { expected: { derive: supported } },
      );
    }
    for (const name of request.derive) {
      const contract = descriptor.derive_contracts?.find((candidate) => candidate.name === name);
      requireContextFields(request, contract?.required_context);
    }
  }
}
