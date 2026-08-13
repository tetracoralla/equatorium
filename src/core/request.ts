import {
  OPERATIONS,
  type JsonObject,
  type Operation,
  type SeiContext,
  type SeiConversion,
  type SeiLimits,
  type SeiQuery,
  type SeiRequest,
} from "../contracts.js";
import { SeiError } from "./errors.js";

export const HARD_LIMITS: SeiLimits = {
  max_expression_length: 8_192,
  max_output_items: 100,
  max_request_bytes: 32_768,
  max_response_bytes: 65_536,
  max_nesting_depth: 12,
  max_collection_entries: 256,
  max_string_length: 8_192,
  max_execution_ms: 1_000,
};

export const MINIMUM_LIMITS: SeiLimits = {
  max_expression_length: 1,
  max_output_items: 1,
  max_request_bytes: 1_024,
  max_response_bytes: 1_024,
  max_nesting_depth: 2,
  max_collection_entries: 16,
  max_string_length: 64,
  max_execution_ms: 10,
};

const LIMIT_KEYS = [
  "max_expression_length",
  "max_output_items",
  "max_request_bytes",
  "max_response_bytes",
  "max_nesting_depth",
  "max_collection_entries",
  "max_string_length",
  "max_execution_ms",
] as const;

export const RESPONSE_STRUCTURAL_LIMITS: SeiLimits = {
  ...HARD_LIMITS,
  max_nesting_depth: 24,
  max_collection_entries: 4_096,
  max_string_length: HARD_LIMITS.max_response_bytes,
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function visitJsonBoundary(
  value: unknown,
  limits: SeiLimits,
  seen: WeakSet<object>,
  state: { entries: number },
  depth: number,
  subject: "Request" | "Response",
): void {
  if (depth > limits.max_nesting_depth) {
    throw new SeiError(
      "E_REQUEST_LIMIT",
      `${subject} nesting exceeds max_nesting_depth=${limits.max_nesting_depth}.`,
    );
  }
  if (typeof value === "string") {
    if (value.length > limits.max_string_length) {
      throw new SeiError(
        "E_REQUEST_LIMIT",
        `A ${subject.toLowerCase()} string exceeds max_string_length=${limits.max_string_length}.`,
      );
    }
    return;
  }
  if (typeof value === "number") {
    if (!Number.isFinite(value)) {
      throw new SeiError("E_REQUEST_INVALID", `${subject} numbers must be finite JSON numbers.`);
    }
    return;
  }
  if (value === null || typeof value === "boolean") return;
  if (typeof value !== "object") {
    throw new SeiError("E_REQUEST_INVALID", `${subject} must contain JSON-compatible values only.`);
  }
  if (seen.has(value)) {
    throw new SeiError("E_REQUEST_INVALID", `${subject} must not contain cyclic references.`);
  }
  seen.add(value);

  if (Array.isArray(value)) {
    state.entries += value.length;
    if (state.entries > limits.max_collection_entries) {
      throw new SeiError(
        "E_REQUEST_LIMIT",
        `${subject} collections exceed max_collection_entries=${limits.max_collection_entries}.`,
      );
    }
    for (const item of value) visitJsonBoundary(item, limits, seen, state, depth + 1, subject);
  } else {
    const prototype = Object.getPrototypeOf(value) as object | null;
    if (prototype !== Object.prototype && prototype !== null) {
      throw new SeiError("E_REQUEST_INVALID", `${subject} objects must be plain JSON objects.`);
    }
    const entries = Object.entries(value);
    state.entries += entries.length;
    if (state.entries > limits.max_collection_entries) {
      throw new SeiError(
        "E_REQUEST_LIMIT",
        `${subject} collections exceed max_collection_entries=${limits.max_collection_entries}.`,
      );
    }
    for (const [key, item] of entries) {
      if (key.length > limits.max_string_length) {
        throw new SeiError(
          "E_REQUEST_LIMIT",
          `A ${subject.toLowerCase()} key exceeds max_string_length=${limits.max_string_length}.`,
        );
      }
      visitJsonBoundary(item, limits, seen, state, depth + 1, subject);
    }
  }
  seen.delete(value);
}

export function enforceRequestBoundary(value: unknown, limits: SeiLimits): number {
  visitJsonBoundary(value, limits, new WeakSet(), { entries: 0 }, 0, "Request");
  const serialized = JSON.stringify(value);
  if (serialized === undefined) {
    throw new SeiError("E_REQUEST_INVALID", "Request must be JSON serializable.");
  }
  const bytes = Buffer.byteLength(serialized, "utf8");
  if (bytes > limits.max_request_bytes) {
    throw new SeiError(
      "E_REQUEST_LIMIT",
      `Serialized request size ${bytes} exceeds max_request_bytes=${limits.max_request_bytes}.`,
      { details: { actual_bytes: bytes, limit: limits.max_request_bytes } },
    );
  }
  return bytes;
}

export function enforceResponseBoundary(value: unknown, limits: SeiLimits): number {
  try {
    visitJsonBoundary(
      value,
      RESPONSE_STRUCTURAL_LIMITS,
      new WeakSet(),
      { entries: 0 },
      0,
      "Response",
    );
  } catch (error) {
    throw new SeiError(
      "E_RESPONSE_LIMIT",
      error instanceof Error ? error.message : "Response exceeds its structural boundary.",
    );
  }
  const serialized = JSON.stringify(value);
  if (serialized === undefined) {
    throw new SeiError("E_RESPONSE_LIMIT", "Response is not JSON serializable.");
  }
  const bytes = Buffer.byteLength(serialized, "utf8");
  if (bytes > limits.max_response_bytes) {
    throw new SeiError(
      "E_RESPONSE_LIMIT",
      `Serialized response size ${bytes} exceeds max_response_bytes=${limits.max_response_bytes}.`,
      { details: { actual_bytes: bytes, limit: limits.max_response_bytes } },
    );
  }
  return bytes;
}

function rejectUnknownKeys(
  value: Record<string, unknown>,
  allowed: readonly string[],
  location: string,
): void {
  const unknown = Object.keys(value).filter((key) => !allowed.includes(key));
  if (unknown.length > 0) {
    throw new SeiError(
      "E_REQUEST_INVALID",
      `${location} contains unsupported field${unknown.length === 1 ? "" : "s"}: ${unknown.join(", ")}.`,
    );
  }
}

function optionalString(value: unknown, name: string): string | undefined {
  if (value === undefined) return undefined;
  if (typeof value !== "string") {
    throw new SeiError("E_REQUEST_INVALID", `'${name}' must be a string.`);
  }
  return value;
}

function parseContext(value: unknown): SeiContext | undefined {
  if (value === undefined) return undefined;
  if (!isRecord(value)) {
    throw new SeiError("E_REQUEST_INVALID", "'context' must be an object.");
  }
  rejectUnknownKeys(value, ["timezone", "reference_time"], "'context'");
  for (const key of ["timezone", "reference_time"] as const) {
    if (value[key] !== undefined && typeof value[key] !== "string") {
      throw new SeiError("E_REQUEST_INVALID", `'context.${key}' must be a string.`);
    }
  }
  return value as SeiContext;
}

function parseQuery(value: unknown): SeiQuery | undefined {
  if (value === undefined) return undefined;
  if (!isRecord(value) || typeof value.name !== "string") {
    throw new SeiError("E_REQUEST_INVALID", "'query.name' must be a string.");
  }
  rejectUnknownKeys(value, ["name", "arguments"], "'query'");
  if (value.arguments !== undefined && !isRecord(value.arguments)) {
    throw new SeiError("E_REQUEST_INVALID", "'query.arguments' must be an object.");
  }
  return {
    name: value.name,
    ...(value.arguments === undefined ? {} : { arguments: value.arguments as JsonObject }),
  };
}

function parseConversion(value: unknown): SeiConversion | undefined {
  if (value === undefined) return undefined;
  if (!isRecord(value)) {
    throw new SeiError("E_REQUEST_INVALID", "'convert' must be an object.");
  }
  rejectUnknownKeys(
    value,
    ["target_dialect", "target_representation", "arguments"],
    "'convert'",
  );
  const targetDialect = optionalString(value.target_dialect, "convert.target_dialect");
  const targetRepresentation = optionalString(
    value.target_representation,
    "convert.target_representation",
  );
  if (value.arguments !== undefined && !isRecord(value.arguments)) {
    throw new SeiError("E_REQUEST_INVALID", "'convert.arguments' must be an object.");
  }
  return {
    ...(targetDialect === undefined ? {} : { target_dialect: targetDialect }),
    ...(targetRepresentation === undefined ? {} : { target_representation: targetRepresentation }),
    ...(value.arguments === undefined ? {} : { arguments: value.arguments as JsonObject }),
  };
}

function parseLimits(value: unknown): Partial<SeiLimits> | undefined {
  if (value === undefined) return undefined;
  if (!isRecord(value)) {
    throw new SeiError("E_REQUEST_INVALID", "'limits' must be an object.");
  }
  rejectUnknownKeys(value, LIMIT_KEYS, "'limits'");

  const result: Partial<SeiLimits> = {};
  for (const key of LIMIT_KEYS) {
    const candidate = value[key];
    if (candidate === undefined) continue;
    if (!Number.isSafeInteger(candidate) || (candidate as number) < MINIMUM_LIMITS[key]) {
      throw new SeiError(
        "E_LIMIT_INVALID",
        `'limits.${key}' must be an integer of at least ${MINIMUM_LIMITS[key]}.`,
      );
    }
    if ((candidate as number) > HARD_LIMITS[key]) {
      throw new SeiError(
        "E_LIMIT_INVALID",
        `'limits.${key}' cannot exceed the hard maximum ${HARD_LIMITS[key]}.`,
      );
    }
    result[key] = candidate as number;
  }
  return result;
}

export function parseRequest(value: unknown): SeiRequest {
  if (!isRecord(value)) {
    throw new SeiError("E_REQUEST_INVALID", "Request must be a JSON object.");
  }
  rejectUnknownKeys(
    value,
    [
      "schema_version",
      "op",
      "expression",
      "kind",
      "dialect",
      "context",
      "derive",
      "query",
      "convert",
      "limits",
    ],
    "Request",
  );
  const rawOperation = value.op;
  if (rawOperation === undefined) {
    throw new SeiError("E_REQUEST_INVALID", "'op' is required.");
  }
  if (typeof rawOperation !== "string" || !OPERATIONS.includes(rawOperation as Operation)) {
    throw new SeiError("E_OPERATION_UNKNOWN", `Unsupported operation '${String(rawOperation)}'.`, {
      expected: { operations: [...OPERATIONS] },
    });
  }
  if (typeof value.expression !== "string") {
    throw new SeiError("E_REQUEST_INVALID", "'expression' must be a string.");
  }
  if (value.schema_version !== undefined && value.schema_version !== "sei.request.v1") {
    throw new SeiError("E_SCHEMA_VERSION", "Only schema_version 'sei.request.v1' is supported.");
  }
  if (value.derive !== undefined) {
    if (!Array.isArray(value.derive) || !value.derive.every((item) => typeof item === "string")) {
      throw new SeiError("E_REQUEST_INVALID", "'derive' must be an array of strings.");
    }
    if (new Set(value.derive).size !== value.derive.length) {
      throw new SeiError("E_REQUEST_INVALID", "'derive' must not contain duplicate values.");
    }
  }

  const kind = optionalString(value.kind, "kind");
  const dialect = optionalString(value.dialect, "dialect");
  const context = parseContext(value.context);
  const query = parseQuery(value.query);
  const conversion = parseConversion(value.convert);
  const limits = parseLimits(value.limits);

  return {
    schema_version: "sei.request.v1",
    op: rawOperation as Operation,
    expression: value.expression,
    ...(kind === undefined ? {} : { kind }),
    ...(dialect === undefined ? {} : { dialect }),
    ...(context === undefined ? {} : { context }),
    ...(value.derive === undefined ? {} : { derive: value.derive as string[] }),
    ...(query === undefined ? {} : { query }),
    ...(conversion === undefined ? {} : { convert: conversion }),
    ...(limits === undefined ? {} : { limits }),
  };
}

export function resolveLimits(requested: Partial<SeiLimits> | undefined): SeiLimits {
  return {
    max_expression_length: requested?.max_expression_length ?? HARD_LIMITS.max_expression_length,
    max_output_items: requested?.max_output_items ?? HARD_LIMITS.max_output_items,
    max_request_bytes: requested?.max_request_bytes ?? HARD_LIMITS.max_request_bytes,
    max_response_bytes: requested?.max_response_bytes ?? HARD_LIMITS.max_response_bytes,
    max_nesting_depth: requested?.max_nesting_depth ?? HARD_LIMITS.max_nesting_depth,
    max_collection_entries:
      requested?.max_collection_entries ?? HARD_LIMITS.max_collection_entries,
    max_string_length: requested?.max_string_length ?? HARD_LIMITS.max_string_length,
    max_execution_ms: requested?.max_execution_ms ?? HARD_LIMITS.max_execution_ms,
  };
}
