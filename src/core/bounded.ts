import { Worker } from "node:worker_threads";
import { Ajv2020, type ValidateFunction } from "ajv/dist/2020.js";
import type { Operation, SeiRequest, SeiResult } from "../contracts.js";
import { defaultRegistry } from "../default-registry.js";
import { createResultSchema } from "../schema/result-schema.js";
import {
  appendBatchResult,
  BATCH_LIMITS,
  effectiveBatchItemLimit,
  enforceBatchRequestBoundary,
  finishBatchWithFailure,
} from "./batch.js";
import { asDiagnostic, SeiError } from "./errors.js";
import {
  enforceRequestBoundary,
  enforceResponseBoundary,
  HARD_LIMITS,
  MINIMUM_LIMITS,
  parseRequest,
  resolveLimits,
} from "./request.js";

interface WorkerExpectation {
  operation: Operation;
  responseLimit: number;
  request?: SeiRequest;
}

const validateResultSchema: ValidateFunction<SeiResult> = new Ajv2020({
  allErrors: false,
  strict: true,
}).compile<SeiResult>(createResultSchema(defaultRegistry));

export const WORKER_RESOURCE_LIMITS: Readonly<{
  maxOldGenerationSizeMb: number;
  maxYoungGenerationSizeMb: number;
  codeRangeSizeMb: number;
  stackSizeMb: number;
}> = {
  maxOldGenerationSizeMb: 96,
  maxYoungGenerationSizeMb: 16,
  codeRangeSizeMb: 16,
  stackSizeMb: 4,
};

function requestOperation(value: unknown): Operation {
  if (typeof value === "object" && value !== null && Object.hasOwn(value, "op")) {
    const operation = (value as { op?: unknown }).op;
    if (
      operation === "interpret" ||
      operation === "validate" ||
      operation === "normalize" ||
      operation === "query" ||
      operation === "convert" ||
      operation === "detect"
    ) {
      return operation;
    }
  }
  return "interpret";
}

function requestedTimeout(value: unknown): number {
  if (typeof value !== "object" || value === null || !("limits" in value)) {
    return HARD_LIMITS.max_execution_ms;
  }
  const limits = (value as { limits?: unknown }).limits;
  if (typeof limits !== "object" || limits === null || !("max_execution_ms" in limits)) {
    return HARD_LIMITS.max_execution_ms;
  }
  const candidate = (limits as { max_execution_ms?: unknown }).max_execution_ms;
  return Number.isSafeInteger(candidate) &&
    (candidate as number) >= 10 &&
    (candidate as number) <= HARD_LIMITS.max_execution_ms
    ? (candidate as number)
    : HARD_LIMITS.max_execution_ms;
}

function requestedResponseLimit(value: unknown): number {
  if (typeof value !== "object" || value === null || !("limits" in value)) {
    return HARD_LIMITS.max_response_bytes;
  }
  const limits = (value as { limits?: unknown }).limits;
  if (typeof limits !== "object" || limits === null || !("max_response_bytes" in limits)) {
    return HARD_LIMITS.max_response_bytes;
  }
  const candidate = (limits as { max_response_bytes?: unknown }).max_response_bytes;
  return Number.isSafeInteger(candidate) &&
    (candidate as number) >= MINIMUM_LIMITS.max_response_bytes &&
    (candidate as number) <= HARD_LIMITS.max_response_bytes
    ? (candidate as number)
    : HARD_LIMITS.max_response_bytes;
}

function workerExpectation(value: unknown): WorkerExpectation {
  const operation = requestOperation(value);
  const responseLimit = requestedResponseLimit(value);
  try {
    const request = parseRequest(value);
    return {
      operation,
      responseLimit: resolveLimits(request.limits).max_response_bytes,
      request,
    };
  } catch {
    return { operation, responseLimit };
  }
}

function boundedFailure(operation: Operation, error: unknown): SeiResult {
  return {
    schema_version: "sei.result.v1",
    ok: false,
    operation,
    input: "",
    diagnostics: [asDiagnostic(error)],
  };
}

function workerFailure(operation: Operation, error: unknown): SeiResult {
  const code = typeof error === "object" && error !== null && "code" in error
    ? (error as { code?: unknown }).code
    : undefined;
  const message = error instanceof Error ? error.message : String(error);
  if (code === "ERR_WORKER_OUT_OF_MEMORY" || /heap out of memory|memory limit|allocation failed/i.test(message)) {
    return boundedFailure(
      operation,
      new SeiError(
        "E_MEMORY_LIMIT",
        "The isolated interpreter exceeded its memory ceiling and was terminated.",
      ),
    );
  }
  return boundedFailure(operation, error);
}

function validateWorkerResult(
  value: unknown,
  expectation: WorkerExpectation,
): asserts value is SeiResult {
  enforceResponseBoundary(value, {
    ...HARD_LIMITS,
    max_response_bytes: expectation.responseLimit,
  });
  if (!validateResultSchema(value)) {
    throw new SeiError(
      "E_WORKER_PROTOCOL",
      "The isolated interpreter returned a result outside the published tagged-union contract.",
    );
  }

  if (value.operation !== expectation.operation) {
    throw new SeiError("E_WORKER_PROTOCOL", "Worker result operation does not match its request.");
  }
  const request = expectation.request;
  if (request === undefined) return;
  const failureFlag = (name: string): boolean => !value.ok && value.diagnostics.some(
    (diagnostic) => diagnostic.details?.[name] === true,
  );
  if (
    value.input !== request.expression &&
    !(
      failureFlag("input_truncated") &&
      request.expression.length > 64 &&
      value.input === request.expression.slice(0, 64)
    )
  ) {
    throw new SeiError("E_WORKER_PROTOCOL", "Worker result input does not match its request.");
  }
  if (
    request.op !== "detect" &&
    value.kind !== request.kind &&
    !(failureFlag("kind_omitted") && value.kind === undefined && (request.kind?.length ?? 0) > 64)
  ) {
    throw new SeiError("E_WORKER_PROTOCOL", "Worker result kind does not match its request.");
  }
  if (
    request.dialect !== undefined &&
    value.dialect !== request.dialect &&
    !(
      failureFlag("dialect_omitted") &&
      value.dialect === undefined &&
      request.dialect.length > 64
    )
  ) {
    throw new SeiError("E_WORKER_PROTOCOL", "Worker result dialect does not match its request.");
  }
  if (value.ok && request.op === "query" && value.query_name !== request.query?.name) {
    throw new SeiError("E_WORKER_PROTOCOL", "Worker query tag does not match its request.");
  }
  if (
    value.ok &&
    request.op === "convert" &&
    value.conversion_target !== request.convert?.target_representation
  ) {
    throw new SeiError("E_WORKER_PROTOCOL", "Worker conversion tag does not match its request.");
  }
}

export function interpretBounded(request: unknown): Promise<SeiResult> {
  return interpretBoundedInWorker(request);
}

/** @internal Exported for boundary verification; ordinary callers use interpretBounded. */
export function interpretBoundedInWorker(
  request: unknown,
  workerUrlOverride?: URL,
  batchDeadlineMs?: number,
): Promise<SeiResult> {
  const expectation = workerExpectation(request);
  const { operation } = expectation;
  try {
    enforceRequestBoundary(request, HARD_LIMITS);
  } catch (error) {
    return Promise.resolve(boundedFailure(operation, error));
  }
  const requestTimeoutMs = requestedTimeout(request);
  const timeoutMs = batchDeadlineMs === undefined
    ? requestTimeoutMs
    : Math.max(1, Math.min(requestTimeoutMs, batchDeadlineMs));
  const timeoutCode = batchDeadlineMs !== undefined && batchDeadlineMs <= requestTimeoutMs
    ? "E_BATCH_TIMEOUT"
    : "E_EXECUTION_TIMEOUT";
  const workerUrl = workerUrlOverride ?? new URL(
      import.meta.url.endsWith(".ts") ? "./worker-source.mjs" : "./worker.js",
      import.meta.url,
    );

  return new Promise((resolve) => {
    let settled = false;
    let worker: Worker;
    try {
      worker = new Worker(workerUrl, {
        workerData: request,
        resourceLimits: WORKER_RESOURCE_LIMITS,
        execArgv: process.execArgv.filter((argument) => !argument.startsWith("--input-type")),
      });
    } catch (error) {
      resolve(boundedFailure(operation, error));
      return;
    }
    const timer = setTimeout(() => {
      if (settled) return;
      settled = true;
      void worker.terminate();
      resolve(
        boundedFailure(
          operation,
          new SeiError(
            timeoutCode,
            timeoutCode === "E_BATCH_TIMEOUT"
              ? `The batch execution deadline expired after ${timeoutMs}ms and the active worker was terminated.`
              : `The isolated interpreter exceeded max_execution_ms=${timeoutMs} and was terminated.`,
          ),
        ),
      );
    }, timeoutMs);

    worker.once("message", (message: unknown) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      void worker.terminate();
      try {
        validateWorkerResult(message, expectation);
        resolve(message);
      } catch (error) {
        resolve(boundedFailure(operation, error));
      }
    });
    worker.once("error", (error) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      void worker.terminate();
      resolve(workerFailure(operation, error));
    });
    worker.once("messageerror", (error) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      void worker.terminate();
      resolve(boundedFailure(operation, error));
    });
    worker.once("exit", (exitCode) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      resolve(
        boundedFailure(
          operation,
          new SeiError(
            "E_WORKER_EXIT",
            `The isolated interpreter exited unexpectedly with code ${exitCode}.`,
          ),
        ),
      );
    });
  });
}

export async function interpretBatchBounded(
  requests: readonly unknown[],
  maxItems = 50,
): Promise<SeiResult[]> {
  return interpretBatchBoundedInWorkers(requests, maxItems);
}

/** @internal Exported for cumulative-boundary verification. */
export async function interpretBatchBoundedInWorkers(
  requests: readonly unknown[],
  maxItems: number = BATCH_LIMITS.max_items,
  workerUrlOverride?: URL,
  maxExecutionMs: number = BATCH_LIMITS.max_execution_ms,
): Promise<SeiResult[]> {
  try {
    enforceBatchRequestBoundary(requests);
  } catch (error) {
    return [boundedFailure("interpret", error)];
  }
  const itemLimit = effectiveBatchItemLimit(maxItems);
  if (requests.length > itemLimit) {
    return [
      boundedFailure(
        "interpret",
        new SeiError(
          "E_BATCH_TOO_LARGE",
          `Batch size ${requests.length} exceeds the maximum ${itemLimit}.`,
        ),
      ),
    ];
  }

  const results: SeiResult[] = [];
  const startedAt = performance.now();
  for (const request of requests) {
    const remainingMs = Math.floor(maxExecutionMs - (performance.now() - startedAt));
    if (remainingMs <= 0) {
      return finishBatchWithFailure(
        results,
        "E_BATCH_TIMEOUT",
        `Batch execution exceeded max_execution_ms=${maxExecutionMs}.`,
      );
    }
    const result = await interpretBoundedInWorker(request, workerUrlOverride, remainingMs);
    if (!appendBatchResult(results, result)) {
      return finishBatchWithFailure(
        results,
        "E_BATCH_RESPONSE_LIMIT",
        `Serialized batch response exceeds max_response_bytes=${BATCH_LIMITS.max_response_bytes}.`,
      );
    }
    if (result.diagnostics[0]?.code === "E_BATCH_TIMEOUT") return results;
  }
  return results;
}
