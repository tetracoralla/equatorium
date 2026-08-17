import { parse } from "iso8601-duration";
import type {
  AdapterDescriptor,
  DetectionCandidate,
  Diagnostic,
} from "../contracts.js";
import type {
  AdapterInput,
  AdapterInterpretation,
  ExpressionAdapter,
} from "../core/adapter.js";
import { SeiError } from "../core/errors.js";
import { packageVersion } from "../core/provenance.js";

const FULL_DURATION = /^P(?=\d|T\d)(?:(?<years>\d+)Y)?(?:(?<months>\d+)M)?(?:(?<weeks>\d+)W)?(?:(?<days>\d+)D)?(?:T(?=\d)(?:(?<hours>\d+(?:[.,]\d+)?)H)?(?:(?<minutes>\d+(?:[.,]\d+)?)M)?(?:(?<seconds>\d+(?:[.,]\d+)?)S)?)?$/;

const UNITS = [
  ["years", "Y", false],
  ["months", "M", false],
  ["weeks", "W", false],
  ["days", "D", false],
  ["hours", "H", true],
  ["minutes", "M", true],
  ["seconds", "S", true],
] as const;

type DurationUnit = (typeof UNITS)[number][0];
type ExactDuration = Record<DurationUnit, string>;

interface ParsedExactDuration {
  duration: ExactDuration;
  present: Set<DurationUnit>;
}

function canonicalDecimal(value: string | undefined): string {
  if (value === undefined) return "0";
  const [integerPart = "0", fractionalPart] = value.replace(",", ".").split(".");
  const integer = integerPart.replace(/^0+(?=\d)/, "");
  const fractional = fractionalPart?.replace(/0+$/, "") ?? "";
  return fractional.length === 0 ? integer : `${integer}.${fractional}`;
}

function exactDuration(expression: string): ParsedExactDuration {
  const match = FULL_DURATION.exec(expression);
  if (match === null) {
    throw new SeiError(
      "E_DURATION_PARSE",
      "Invalid or unsupported ISO 8601 duration syntax.",
      { span: { start: 0, end: expression.length } },
    );
  }
  const groups = match.groups ?? {};
  const fractionalIndices = UNITS.flatMap(([name], index) => {
    const value = groups[name];
    return value !== undefined && /[.,]/.test(value) ? [index] : [];
  });
  if (
    fractionalIndices.length > 1 ||
    (fractionalIndices[0] !== undefined &&
      UNITS.slice(fractionalIndices[0] + 1).some(([name]) => groups[name] !== undefined))
  ) {
    throw new SeiError(
      "E_DURATION_FRACTION_POSITION",
      "A decimal fraction is allowed only on the smallest unit present.",
      { span: { start: 0, end: expression.length } },
    );
  }
  return {
    duration: Object.fromEntries(
      UNITS.map(([name]) => [name, canonicalDecimal(groups[name])]),
    ) as unknown as ExactDuration,
    present: new Set(
      UNITS.flatMap(([name]) => groups[name] === undefined ? [] : [name]),
    ),
  };
}

function normalizeDuration(duration: ExactDuration): string {
  let date = "";
  let time = "";
  for (const [name, suffix, isTime] of UNITS) {
    const value = duration[name];
    if (value === "0") continue;
    if (isTime) time += `${value}${suffix}`;
    else date += `${value}${suffix}`;
  }
  if (date.length === 0 && time.length === 0) return "P0D";
  return `P${date}${time.length === 0 ? "" : `T${time}`}`;
}

export class IsoDurationAdapter implements ExpressionAdapter {
  readonly descriptor: AdapterDescriptor = {
    kind: "iso_duration",
    title: "ISO 8601 duration",
    summary: "Interpret bounded ISO 8601 duration component expressions without assuming calendar length.",
    dialects: ["iso8601-1"],
    default_dialect: "iso8601-1",
    capabilities: ["interpret", "validate", "normalize"],
    interpretation_contract: {
      value_schema: {
        type: "object",
        properties: Object.fromEntries(
          UNITS.map(([name]) => [
            name,
            { type: "string", pattern: "^(?:0|[1-9]\\d*)(?:\\.\\d+)?$" },
          ]),
        ),
        required: UNITS.map(([name]) => name),
        additionalProperties: false,
      },
    },
    provenance: {
      spec: "ISO8601-1-duration",
      engine: "iso8601-duration",
      engine_version: packageVersion("iso8601-duration"),
      compatibility_mode: "strict-exact-lexical-subset",
    },
  };

  interpret(input: AdapterInput): AdapterInterpretation {
    const { duration, present } = exactDuration(input.expression);
    try {
      parse(input.expression);
    } catch (error) {
      throw new SeiError(
        "E_DURATION_PARSE",
        error instanceof Error ? error.message : "Invalid ISO 8601 duration.",
        { span: { start: 0, end: input.expression.length } },
      );
    }
    const hasWeek = present.has("weeks");
    const hasOther = [...present].some((name) => name !== "weeks");
    if (hasWeek && hasOther) {
      throw new SeiError(
        "E_DURATION_WEEK_MIXED",
        "Week-based durations cannot be mixed with other units in the iso8601-1 dialect.",
      );
    }

    const diagnostics: Diagnostic[] = [];
    if (duration.years !== "0" || duration.months !== "0") {
      diagnostics.push({
        code: "W_DURATION_CALENDAR_CONTEXT",
        severity: "warning",
        message: "Years and months are calendar-relative; no fixed seconds value is implied.",
      });
    }
    return {
      normalized: normalizeDuration(duration),
      value: duration,
      diagnostics,
    };
  }

  detect(expression: string): DetectionCandidate | null {
    if (!FULL_DURATION.test(expression)) return null;
    try {
      const { present } = exactDuration(expression);
      if (present.has("weeks") && [...present].some((name) => name !== "weeks")) {
        return null;
      }
      parse(expression);
      return {
        kind: "iso_duration",
        dialect: "iso8601-1",
        confidence: 0.97,
        reason: "The input uses ISO 8601 duration designators beginning with P.",
        supported: true,
      };
    } catch {
      return null;
    }
  }
}
