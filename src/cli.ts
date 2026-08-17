#!/usr/bin/env node

import { defaultRegistry } from "./default-registry.js";
import {
  interpretBatchBounded,
  interpretBounded,
  WORKER_ADMISSION_LIMITS,
  WORKER_RESOURCE_LIMITS,
} from "./core/bounded.js";
import { BATCH_LIMITS } from "./core/batch.js";
import { HARD_LIMITS, RESPONSE_STRUCTURAL_LIMITS } from "./core/request.js";
import { SeiError } from "./core/errors.js";
import type { JsonObject, SeiResult } from "./contracts.js";

const MAX_STDIN_BYTES = BATCH_LIMITS.max_request_bytes;
const MAX_CLI_RESPONSE_BYTES = BATCH_LIMITS.max_response_bytes;
const MAX_BATCH_ITEMS = BATCH_LIMITS.max_items;

interface ParsedArgs {
  request: Record<string, unknown>;
  pretty: boolean;
}

function parseJsonObject(value: string, flag: string): JsonObject {
  let parsed: unknown;
  try {
    parsed = JSON.parse(value);
  } catch {
    throw new Error(`${flag} must contain valid JSON.`);
  }
  if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
    throw new Error(`${flag} must contain a JSON object.`);
  }
  return parsed as JsonObject;
}

function requireValue(args: string[], index: number, flag: string): string {
  const value = args[index + 1];
  if (value === undefined || value.startsWith("--")) {
    throw new Error(`${flag} requires a value.`);
  }
  return value;
}

function parseArgs(args: string[]): ParsedArgs {
  const operation = args[0] ?? "interpret";
  const request: Record<string, unknown> = { op: operation };
  let pretty = false;
  const positionals: string[] = [];
  const seenFlags = new Set<string>();
  let contextObject: JsonObject | undefined;
  let timezone: string | undefined;
  let referenceTime: string | undefined;

  for (let index = 1; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === undefined) continue;
    if (!arg.startsWith("--")) {
      positionals.push(arg);
      continue;
    }
    if (seenFlags.has(arg)) throw new Error(`Flag '${arg}' may be provided only once.`);
    seenFlags.add(arg);
    if (arg === "--pretty") {
      pretty = true;
      continue;
    }
    const value = requireValue(args, index, arg);
    index += 1;
    switch (arg) {
      case "--kind":
        request.kind = value;
        break;
      case "--dialect":
        request.dialect = value;
        break;
      case "--expression":
        request.expression = value;
        break;
      case "--context":
        contextObject = parseJsonObject(value, arg);
        break;
      case "--timezone":
        timezone = value;
        break;
      case "--reference-time":
        referenceTime = value;
        break;
      case "--derive":
        request.derive = value.split(",").filter(Boolean);
        break;
      case "--query-name":
        request.query = { ...(request.query as JsonObject | undefined), name: value };
        break;
      case "--query-args":
        request.query = {
          ...(request.query as JsonObject | undefined),
          arguments: parseJsonObject(value, arg),
        };
        break;
      case "--target-dialect":
        request.convert = { ...(request.convert as JsonObject | undefined), target_dialect: value };
        break;
      case "--target-representation":
        request.convert = {
          ...(request.convert as JsonObject | undefined),
          target_representation: value,
        };
        break;
      case "--limits":
        request.limits = parseJsonObject(value, arg);
        break;
      default:
        throw new Error(`Unknown flag '${arg}'.`);
    }
  }

  if (timezone !== undefined && contextObject?.timezone !== undefined) {
    throw new Error("context.timezone may be supplied by either --context or --timezone, not both.");
  }
  if (referenceTime !== undefined && contextObject?.reference_time !== undefined) {
    throw new Error(
      "context.reference_time may be supplied by either --context or --reference-time, not both.",
    );
  }
  if (contextObject !== undefined || timezone !== undefined || referenceTime !== undefined) {
    request.context = {
      ...(contextObject ?? {}),
      ...(timezone === undefined ? {} : { timezone }),
      ...(referenceTime === undefined ? {} : { reference_time: referenceTime }),
    };
  }

  if (request.expression === undefined && positionals.length > 0) {
    request.expression = positionals.join(" ");
  } else if (request.expression !== undefined && positionals.length > 0) {
    throw new Error("Use either --expression or a positional expression, not both.");
  }
  return { request, pretty };
}

async function readStdin(): Promise<string> {
  const chunks: Buffer[] = [];
  let bytes = 0;
  for await (const chunk of process.stdin) {
    const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
    bytes += buffer.byteLength;
    if (bytes > MAX_STDIN_BYTES) {
      throw new Error(`stdin exceeds the ${MAX_STDIN_BYTES}-byte batch boundary.`);
    }
    chunks.push(buffer);
  }
  return Buffer.concat(chunks).toString("utf8");
}

function invalidCliResult(message: string): SeiResult {
  return {
    schema_version: "sei.result.v1",
    ok: false,
    operation: "interpret",
    input: "",
    diagnostics: [{ code: "E_CLI_INPUT", severity: "error", message }],
  };
}

function cliErrorResult(error: unknown): SeiResult {
  if (error instanceof SeiError) {
    return {
      schema_version: "sei.result.v1",
      ok: false,
      operation: "interpret",
      input: "",
      diagnostics: [error.diagnostic],
    };
  }
  return invalidCliResult(error instanceof Error ? error.message : "Invalid CLI input.");
}

function failed(value: unknown): boolean {
  if (Array.isArray(value)) return value.some((item) => failed(item));
  return (
    typeof value === "object" &&
    value !== null &&
    "ok" in value &&
    (value as { ok?: unknown }).ok === false
  );
}

function discoveryLimits(): JsonObject {
  return {
    per_request: HARD_LIMITS,
    response_structure: {
      max_nesting_depth: RESPONSE_STRUCTURAL_LIMITS.max_nesting_depth,
      max_collection_entries: RESPONSE_STRUCTURAL_LIMITS.max_collection_entries,
      max_string_length: RESPONSE_STRUCTURAL_LIMITS.max_string_length,
    },
    worker_memory_mb: WORKER_RESOURCE_LIMITS,
    worker_admission: WORKER_ADMISSION_LIMITS,
    cli_batch: {
      max_items: MAX_BATCH_ITEMS,
      max_stdin_bytes: MAX_STDIN_BYTES,
      max_response_bytes: MAX_CLI_RESPONSE_BYTES,
      max_execution_ms: BATCH_LIMITS.max_execution_ms,
    },
  };
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  let output: unknown;
  let pretty = false;

  try {
    if (args[0] === "registry") {
      if (args.slice(1).some((argument) => argument !== "--pretty")) {
        throw new Error("registry accepts only the optional --pretty flag.");
      }
      if (args.filter((argument) => argument === "--pretty").length > 1) {
        throw new Error("Flag '--pretty' may be provided only once.");
      }
      output = {
        schema_version: "sei.registry.v1",
        request_schema_version: "sei.request.v1",
        result_schema_version: "sei.result.v1",
        limits: discoveryLimits(),
        adapters: defaultRegistry.list(),
      };
      pretty = args.includes("--pretty");
    } else if (args[0] === "describe") {
      const kind = args[1];
      if (kind === undefined) throw new Error("describe requires an expression kind.");
      if (args.slice(2).some((argument) => argument !== "--pretty")) {
        throw new Error("describe accepts one kind and the optional --pretty flag.");
      }
      if (args.filter((argument) => argument === "--pretty").length > 1) {
        throw new Error("Flag '--pretty' may be provided only once.");
      }
      output = {
        schema_version: "sei.registry.v1",
        request_schema_version: "sei.request.v1",
        result_schema_version: "sei.result.v1",
        limits: discoveryLimits(),
        adapter: defaultRegistry.describe(kind),
      };
      pretty = args.includes("--pretty");
    } else if (args.length === 0) {
      const input = await readStdin();
      let parsed: unknown;
      try {
        parsed = JSON.parse(input);
      } catch {
        output = invalidCliResult("stdin must contain one JSON request or an array of requests.");
      }
      if (parsed !== undefined) {
        output = Array.isArray(parsed)
          ? await interpretBatchBounded(parsed, MAX_BATCH_ITEMS)
          : await interpretBounded(parsed);
      }
    } else {
      const parsed = parseArgs(args);
      pretty = parsed.pretty;
      output = await interpretBounded(parsed.request);
    }
  } catch (error) {
    output = cliErrorResult(error);
  }

  let serialized = JSON.stringify(output, null, pretty ? 2 : undefined);
  if (Buffer.byteLength(serialized, "utf8") > MAX_CLI_RESPONSE_BYTES) {
    output = invalidCliResult(
      `Serialized CLI response exceeds the ${MAX_CLI_RESPONSE_BYTES}-byte batch boundary.`,
    );
    serialized = JSON.stringify(output);
  }
  process.stdout.write(`${serialized}\n`);
  if (failed(output)) process.exitCode = 1;
}

await main();
