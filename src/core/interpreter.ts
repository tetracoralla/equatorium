import type {
  DetectionCandidate,
  Diagnostic,
  Operation,
  SeiFailure,
  SeiRequest,
  SeiResult,
  SeiSuccess,
} from "../contracts.js";
import type { AdapterInput } from "./adapter.js";
import {
  appendBatchResult,
  BATCH_LIMITS,
  effectiveBatchItemLimit,
  enforceBatchRequestBoundary,
  finishBatchWithFailure,
} from "./batch.js";
import { asDiagnostic, SeiError } from "./errors.js";
import { validateOperationContract } from "./operation-contract.js";
import type { ExpressionRegistry } from "./registry.js";
import {
  enforceRequestBoundary,
  enforceResponseBoundary,
  HARD_LIMITS,
  parseRequest,
  resolveLimits,
} from "./request.js";

function failedResult(
  operation: Operation,
  input: string,
  diagnostic: Diagnostic,
  request?: Pick<SeiRequest, "kind" | "dialect">,
): SeiFailure {
  return {
    schema_version: "sei.result.v1",
    ok: false,
    operation,
    input,
    ...(request?.kind === undefined ? {} : { kind: request.kind }),
    ...(request?.dialect === undefined ? {} : { dialect: request.dialect }),
    diagnostics: [diagnostic],
  };
}

function detect(expression: string, registry: ExpressionRegistry): DetectionCandidate[] {
  const supported = registry
    .adapters()
    .map((adapter) => adapter.detect(expression))
    .filter((candidate): candidate is DetectionCandidate => candidate !== null);

  if (/^[0-9]+$/.test(expression.trim())) {
    supported.push({
      kind: "integer",
      confidence: 0.28,
      reason: "The input is also a plain decimal integer.",
      supported: false,
    });
  }

  return supported.sort((left, right) => right.confidence - left.confidence);
}

function enforceDeadline(startedAt: number, maxExecutionMs: number): void {
  const elapsed = performance.now() - startedAt;
  if (elapsed > maxExecutionMs) {
    throw new SeiError(
      "E_EXECUTION_TIMEOUT",
      `Interpretation exceeded max_execution_ms=${maxExecutionMs}.`,
      { details: { elapsed_ms: Math.ceil(elapsed), limit_ms: maxExecutionMs } },
    );
  }
}

function compactFailure(
  result: SeiFailure,
  limits: typeof HARD_LIMITS,
): SeiFailure | undefined {
  const correlationDetails = {
    input_truncated: result.input.length > 64,
    kind_omitted: result.kind !== undefined && result.kind.length > 64,
    dialect_omitted: result.dialect !== undefined && result.dialect.length > 64,
  };
  const diagnostics = result.diagnostics.map((diagnostic, index) => index === 0
    ? {
        ...diagnostic,
        details: { ...(diagnostic.details ?? {}), ...correlationDetails },
      }
    : diagnostic);
  const base: SeiFailure = {
    schema_version: "sei.result.v1",
    ok: false,
    operation: result.operation,
    input: result.input.slice(0, 64),
    ...(result.kind !== undefined && result.kind.length <= 64 ? { kind: result.kind } : {}),
    ...(result.dialect !== undefined && result.dialect.length <= 64
      ? { dialect: result.dialect }
      : {}),
    diagnostics,
  };
  try {
    enforceResponseBoundary(base, limits);
    return base;
  } catch {
    const compactDiagnostics = result.diagnostics.slice(0, 4).map((diagnostic) => ({
      code: diagnostic.code.slice(0, 128),
      severity: diagnostic.severity,
      message: diagnostic.message.slice(0, 256),
      ...(diagnostic.span === undefined ? {} : { span: diagnostic.span }),
      details: {
        ...correlationDetails,
        diagnostic_truncated:
          result.diagnostics.length > 4 || diagnostic.message.length > 256,
      },
    })) satisfies Diagnostic[];
    const compact = { ...base, diagnostics: compactDiagnostics };
    try {
      enforceResponseBoundary(compact, limits);
      return compact;
    } catch {
      return undefined;
    }
  }
}

function finalizeResult(
  result: SeiResult,
  limits: typeof HARD_LIMITS,
): SeiResult {
  try {
    enforceResponseBoundary(result, limits);
    return result;
  } catch (error) {
    if (!result.ok) {
      const compact = compactFailure(result, limits);
      if (compact !== undefined) return compact;
    }
    const diagnostic = asDiagnostic(error);
    return {
      schema_version: "sei.result.v1",
      ok: false,
      operation: result.operation,
      input: result.input.slice(0, 64),
      ...(result.kind !== undefined && result.kind.length <= 64 ? { kind: result.kind } : {}),
      ...(result.dialect !== undefined && result.dialect.length <= 64
        ? { dialect: result.dialect }
        : {}),
      diagnostics: [
        {
          ...diagnostic,
          details: {
            ...(diagnostic.details ?? {}),
            input_truncated: result.input.length > 64,
            kind_omitted: result.kind !== undefined && result.kind.length > 64,
            dialect_omitted: result.dialect !== undefined && result.dialect.length > 64,
          },
        },
      ],
    };
  }
}

export function interpret(requestValue: unknown, registry: ExpressionRegistry): SeiResult {
  const startedAt = performance.now();
  let operation: Operation = "interpret";
  let input = "";
  let request: SeiRequest | undefined;
  let limits = HARD_LIMITS;

  try {
    enforceRequestBoundary(requestValue, HARD_LIMITS);
    request = parseRequest(requestValue);
    operation = request.op;
    input = request.expression;
    limits = resolveLimits(request.limits);
    enforceRequestBoundary(requestValue, limits);
    enforceDeadline(startedAt, limits.max_execution_ms);

    if (
      operation === "detect" &&
      [request.kind, request.dialect, request.context, request.derive, request.query, request.convert]
        .some((value) => value !== undefined)
    ) {
      throw new SeiError(
        "E_REQUEST_INVALID",
        "Detect requests accept only op, expression, schema_version, and limits.",
      );
    }

    if (input.length > limits.max_expression_length) {
      throw new SeiError(
        "E_EXPRESSION_TOO_LONG",
        `Expression length ${input.length} exceeds max_expression_length=${limits.max_expression_length}.`,
        { details: { actual_length: input.length, limit: limits.max_expression_length } },
      );
    }

    if (operation === "detect") {
      const candidates = detect(input, registry);
      if (candidates.length > limits.max_output_items) {
        throw new SeiError(
          "E_RESOURCE_LIMIT",
          `Detection produced ${candidates.length} candidates, exceeding max_output_items=${limits.max_output_items}.`,
        );
      }
      const result: SeiSuccess = {
        schema_version: "sei.result.v1",
        ok: true,
        operation,
        input,
        candidates,
        resolved: false,
        diagnostics: [],
      };
      enforceDeadline(startedAt, limits.max_execution_ms);
      return finalizeResult(result, limits);
    }

    if (request.kind === undefined || request.kind.length === 0) {
      throw new SeiError("E_KIND_REQUIRED", "'kind' is required unless op='detect'.");
    }
    const adapter = registry.require(request.kind);
    const descriptor = registry.describe(request.kind);
    let dialect = request.dialect;
    if (dialect === undefined || dialect.length === 0) {
      dialect = descriptor.default_dialect;
    }
    if (dialect === undefined) {
      throw new SeiError("E_DIALECT_REQUIRED", `'dialect' is required for kind '${request.kind}'.`, {
        expected: { dialects: descriptor.dialects },
      });
    }
    if (!descriptor.dialects.includes(dialect)) {
      throw new SeiError(
        "E_DIALECT_UNSUPPORTED",
        `Dialect '${dialect}' is not supported for kind '${request.kind}'.`,
        { expected: { dialects: descriptor.dialects } },
      );
    }
    validateOperationContract(descriptor, request);
    enforceDeadline(startedAt, limits.max_execution_ms);

    const adapterInput: AdapterInput = {
      expression: request.expression,
      dialect,
      context: request.context ?? {},
      derive: request.derive ?? [],
      limits,
    };
    const interpretation = adapter.interpret(adapterInput);
    enforceDeadline(startedAt, limits.max_execution_ms);
    const base = {
      schema_version: "sei.result.v1",
      ok: true,
      operation,
      input,
      kind: request.kind,
      dialect,
      normalized: interpretation.normalized,
      capabilities: descriptor.capabilities,
      diagnostics: interpretation.diagnostics ?? [],
      provenance: descriptor.provenance,
    };

    if (operation === "query") {
      if (request.query === undefined) throw new SeiError("E_QUERY_REQUIRED", "'query' is required.");
      if (adapter.query === undefined) {
        throw new SeiError(
          "E_QUERY_UNSUPPORTED",
          `Kind '${request.kind}' does not support semantic queries.`,
        );
      }
      const result: SeiSuccess = {
        ...base,
        query_name: request.query.name,
        query_result: adapter.query(interpretation, request.query, adapterInput),
      } as SeiSuccess;
      enforceDeadline(startedAt, limits.max_execution_ms);
      return finalizeResult(result, limits);
    }

    if (operation === "convert") {
      if (request.convert === undefined) throw new SeiError("E_CONVERSION_REQUIRED", "'convert' is required.");
      if (adapter.convert === undefined) {
        throw new SeiError(
          "E_CONVERSION_UNSUPPORTED",
          `Kind '${request.kind}' does not support conversion.`,
        );
      }
      const result: SeiSuccess = {
        ...base,
        conversion_target: request.convert.target_representation,
        converted: adapter.convert(interpretation, request.convert, adapterInput),
      } as SeiSuccess;
      enforceDeadline(startedAt, limits.max_execution_ms);
      return finalizeResult(result, limits);
    }

    const result = {
      ...base,
      ...(operation === "validate" ? {} : { value: interpretation.value }),
      ...(interpretation.semantics === undefined ? {} : { semantics: interpretation.semantics }),
      ...(interpretation.derived === undefined ? {} : { derived: interpretation.derived }),
    } as SeiSuccess;
    enforceDeadline(startedAt, limits.max_execution_ms);
    return finalizeResult(result, limits);
  } catch (error) {
    return finalizeResult(failedResult(operation, input, asDiagnostic(error), request), limits);
  }
}

export function interpretBatch(
  requests: readonly unknown[],
  registry: ExpressionRegistry,
  maxItems = 50,
): SeiResult[] {
  try {
    enforceBatchRequestBoundary(requests);
  } catch (error) {
    return [failedResult("interpret", "", asDiagnostic(error))];
  }
  const itemLimit = effectiveBatchItemLimit(maxItems);
  if (requests.length > itemLimit) {
    return [
      failedResult(
        "interpret",
        "",
        new SeiError(
          "E_BATCH_TOO_LARGE",
          `Batch size ${requests.length} exceeds the maximum ${itemLimit}.`,
        ).diagnostic,
      ),
    ];
  }
  const startedAt = performance.now();
  const results: SeiResult[] = [];
  for (const request of requests) {
    if (performance.now() - startedAt >= BATCH_LIMITS.max_execution_ms) {
      return finishBatchWithFailure(
        results,
        "E_BATCH_TIMEOUT",
        `Batch execution exceeded max_execution_ms=${BATCH_LIMITS.max_execution_ms}.`,
      );
    }
    const result = interpret(request, registry);
    if (!appendBatchResult(results, result)) {
      return finishBatchWithFailure(
        results,
        "E_BATCH_RESPONSE_LIMIT",
        `Serialized batch response exceeds max_response_bytes=${BATCH_LIMITS.max_response_bytes}.`,
      );
    }
    if (performance.now() - startedAt >= BATCH_LIMITS.max_execution_ms) {
      return finishBatchWithFailure(
        results,
        "E_BATCH_TIMEOUT",
        `Batch execution exceeded max_execution_ms=${BATCH_LIMITS.max_execution_ms}.`,
      );
    }
  }
  return results;
}
