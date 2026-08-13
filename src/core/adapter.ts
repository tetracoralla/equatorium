import type {
  AdapterDescriptor,
  DetectionCandidate,
  Diagnostic,
  JsonObject,
  JsonValue,
  SeiContext,
  SeiConversion,
  SeiLimits,
  SeiQuery,
} from "../contracts.js";

export interface AdapterInput {
  expression: string;
  dialect: string;
  context: SeiContext;
  derive: string[];
  limits: SeiLimits;
}

export interface AdapterInterpretation {
  normalized: string;
  value: JsonValue;
  semantics?: JsonValue;
  derived?: JsonObject;
  diagnostics?: Diagnostic[];
  state?: unknown;
}

export interface ExpressionAdapter {
  readonly descriptor: AdapterDescriptor;
  interpret(input: AdapterInput): AdapterInterpretation;
  query?(
    interpretation: AdapterInterpretation,
    query: SeiQuery,
    input: AdapterInput,
  ): JsonValue;
  convert?(
    interpretation: AdapterInterpretation,
    conversion: SeiConversion,
    input: AdapterInput,
  ): JsonValue;
  detect(expression: string): DetectionCandidate | null;
}
