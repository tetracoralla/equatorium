import type { Diagnostic, JsonObject } from "../contracts.js";

export class SeiError extends Error {
  readonly diagnostic: Diagnostic;

  constructor(
    code: string,
    message: string,
    options: {
      expected?: JsonObject;
      details?: JsonObject;
      span?: { start: number; end: number };
    } = {},
  ) {
    super(message);
    this.name = "SeiError";
    this.diagnostic = {
      code,
      severity: "error",
      message,
      ...options,
    };
  }
}

export function asDiagnostic(error: unknown): Diagnostic {
  if (error instanceof SeiError) {
    return error.diagnostic;
  }
  if (
    typeof error === "object" &&
    error !== null &&
    "diagnostic" in error &&
    typeof error.diagnostic === "object" &&
    error.diagnostic !== null &&
    "code" in error.diagnostic &&
    typeof error.diagnostic.code === "string" &&
    "severity" in error.diagnostic &&
    error.diagnostic.severity === "error" &&
    "message" in error.diagnostic &&
    typeof error.diagnostic.message === "string"
  ) {
    return error.diagnostic as Diagnostic;
  }

  return {
    code: "E_RUNTIME",
    severity: "error",
    message: error instanceof Error ? error.message : "Unexpected interpreter failure.",
  };
}
