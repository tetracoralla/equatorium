import * as rruleNamespace from "rrule";
import type {
  AdapterDescriptor,
  DetectionCandidate,
  JsonObject,
} from "../contracts.js";
import type {
  AdapterInput,
  AdapterInterpretation,
  ExpressionAdapter,
} from "../core/adapter.js";
import { SeiError } from "../core/errors.js";
import { packageVersion } from "../core/provenance.js";
import { HARD_LIMITS } from "../core/request.js";

const rrulePackage = ((rruleNamespace as unknown as {
  default?: typeof rruleNamespace;
}).default ?? rruleNamespace);
const { RRule } = rrulePackage;

const FREQUENCIES = [
  "YEARLY",
  "MONTHLY",
  "WEEKLY",
  "DAILY",
  "HOURLY",
  "MINUTELY",
  "SECONDLY",
] as const;
const WEEKDAYS = ["MO", "TU", "WE", "TH", "FR", "SA", "SU"] as const;
const CANONICAL_FIELD_ORDER = [
  "FREQ",
  "INTERVAL",
  "COUNT",
  "UNTIL",
  "WKST",
  "BYSECOND",
  "BYMINUTE",
  "BYHOUR",
  "BYDAY",
  "BYMONTHDAY",
  "BYYEARDAY",
  "BYWEEKNO",
  "BYMONTH",
  "BYSETPOS",
] as const;
const ALLOWED_FIELDS = new Set<string>(CANONICAL_FIELD_ORDER);

interface RruleDay extends JsonObject {
  weekday: (typeof WEEKDAYS)[number];
  ordinal?: number;
}

interface ParsedRrule {
  normalized: string;
  value: JsonObject;
  semantics: JsonObject;
}

function invalid(message: string): never {
  throw new SeiError("E_RRULE_PARSE", message);
}

function parsePositiveInteger(value: string, field: string): number {
  if (!/^\d+$/.test(value)) invalid(`${field} must be a positive integer.`);
  const parsed = Number(value);
  if (!Number.isSafeInteger(parsed) || parsed < 1 || parsed > 2_147_483_647) {
    throw new SeiError(
      "E_RRULE_VALUE_RANGE",
      `${field} must be between 1 and 2147483647.`,
    );
  }
  return parsed;
}

function parseIntegerList(
  value: string,
  field: string,
  minimum: number,
  maximum: number,
  allowZero: boolean,
  input: AdapterInput,
): number[] {
  const tokens = value.split(",");
  if (
    tokens.length === 0 ||
    tokens.length > input.limits.max_output_items ||
    tokens.some((token) => token.length === 0)
  ) {
    throw new SeiError(
      "E_RRULE_LIST_LIMIT",
      `${field} must contain between 1 and max_output_items=${input.limits.max_output_items} values.`,
    );
  }
  const numbers = tokens.map((token) => {
    if (!/^[+-]?\d+$/.test(token)) invalid(`${field} contains a non-integer value.`);
    const parsed = Number(token);
    if (
      !Number.isSafeInteger(parsed) ||
      parsed < minimum ||
      parsed > maximum ||
      (!allowZero && parsed === 0)
    ) {
      throw new SeiError(
        "E_RRULE_VALUE_RANGE",
        `${field} values must be between ${minimum} and ${maximum}${allowZero ? "" : " and cannot be zero"}.`,
      );
    }
    return parsed;
  });
  if (new Set(numbers).size !== numbers.length) {
    throw new SeiError(
      "E_RRULE_DUPLICATE_VALUE",
      `${field} must not contain duplicate values.`,
    );
  }
  return numbers;
}

function parseByDay(value: string, input: AdapterInput): RruleDay[] {
  const tokens = value.split(",");
  if (
    tokens.length === 0 ||
    tokens.length > input.limits.max_output_items ||
    tokens.some((token) => token.length === 0)
  ) {
    throw new SeiError(
      "E_RRULE_LIST_LIMIT",
      `BYDAY must contain between 1 and max_output_items=${input.limits.max_output_items} values.`,
    );
  }
  const days = tokens.map((raw) => {
    const match = /^(?<ordinal>[+-]?\d{1,2})?(?<weekday>MO|TU|WE|TH|FR|SA|SU)$/i.exec(raw);
    if (match?.groups === undefined) invalid("BYDAY contains an invalid weekday value.");
    const weekday = match.groups.weekday?.toUpperCase() as RruleDay["weekday"];
    const ordinalToken = match.groups.ordinal;
    if (ordinalToken === undefined) return { weekday };
    const ordinal = Number(ordinalToken);
    if (!Number.isInteger(ordinal) || ordinal === 0 || ordinal < -53 || ordinal > 53) {
      throw new SeiError(
        "E_RRULE_VALUE_RANGE",
        "BYDAY ordinals must be between -53 and 53 and cannot be zero.",
      );
    }
    return { weekday, ordinal };
  });
  const canonical = days.map((day) => `${day.ordinal ?? ""}${day.weekday}`);
  if (new Set(canonical).size !== canonical.length) {
    throw new SeiError("E_RRULE_DUPLICATE_VALUE", "BYDAY must not contain duplicate values.");
  }
  return days;
}

function canonicalDay(day: RruleDay): string {
  if (day.ordinal === undefined) return day.weekday;
  return `${day.ordinal > 0 ? "+" : ""}${day.ordinal}${day.weekday}`;
}

function isLeapYear(year: number): boolean {
  return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
}

function parseUntil(value: string): string {
  const match = /^(?<year>\d{4})(?<month>\d{2})(?<day>\d{2})T(?<hour>\d{2})(?<minute>\d{2})(?<second>\d{2})Z$/.exec(value);
  if (match?.groups === undefined) {
    invalid("UNTIL must use the supported UTC DATE-TIME form YYYYMMDDTHHMMSSZ.");
  }
  const year = Number(match.groups.year);
  const month = Number(match.groups.month);
  const day = Number(match.groups.day);
  const hour = Number(match.groups.hour);
  const minute = Number(match.groups.minute);
  const second = Number(match.groups.second);
  const monthLengths = [31, isLeapYear(year) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  if (
    year < 100 ||
    month < 1 ||
    month > 12 ||
    day < 1 ||
    day > (monthLengths[month - 1] ?? 0) ||
    hour > 23 ||
    minute > 59 ||
    second > 59
  ) {
    throw new SeiError("E_RRULE_VALUE_RANGE", "UNTIL contains an invalid UTC calendar value.");
  }
  return value;
}

function assertSemanticCombinations(fields: Map<string, string>, byDay: RruleDay[]): void {
  const frequency = fields.get("FREQ");
  if (fields.has("COUNT") && fields.has("UNTIL")) {
    throw new SeiError("E_RRULE_CONFLICT", "COUNT and UNTIL cannot appear in the same RRULE.");
  }
  if (fields.has("BYSETPOS") && ![...fields.keys()].some((name) => name.startsWith("BY") && name !== "BYSETPOS")) {
    throw new SeiError("E_RRULE_CONFLICT", "BYSETPOS requires at least one other BY* field.");
  }
  if (fields.has("BYWEEKNO") && frequency !== "YEARLY") {
    throw new SeiError("E_RRULE_CONFLICT", "BYWEEKNO is supported only with FREQ=YEARLY.");
  }
  if (fields.has("BYMONTHDAY") && frequency === "WEEKLY") {
    throw new SeiError("E_RRULE_CONFLICT", "BYMONTHDAY cannot be used with FREQ=WEEKLY.");
  }
  if (fields.has("BYYEARDAY") && ["DAILY", "WEEKLY", "MONTHLY"].includes(frequency ?? "")) {
    throw new SeiError(
      "E_RRULE_CONFLICT",
      "BYYEARDAY cannot be used with DAILY, WEEKLY, or MONTHLY frequency.",
    );
  }
  if (
    byDay.some((day) => day.ordinal !== undefined) &&
    !(
      frequency === "MONTHLY" ||
      (frequency === "YEARLY" && !fields.has("BYWEEKNO"))
    )
  ) {
    throw new SeiError(
      "E_RRULE_CONFLICT",
      "Numeric BYDAY values require MONTHLY, or YEARLY without BYWEEKNO.",
    );
  }
}

function parseRrule(input: AdapterInput): ParsedRrule {
  const expression = input.expression;
  if (/[\r\n]/.test(expression) || !/^RRULE:/i.test(expression)) {
    invalid("RRULE input must be one RRULE: property line without DTSTART, RDATE, EXDATE, or VEVENT data.");
  }
  if (/\s/.test(expression)) invalid("RRULE input cannot contain whitespace.");
  const body = expression.slice(expression.indexOf(":") + 1);
  if (body.length === 0) invalid("RRULE must contain rule fields after RRULE:.");
  const parts = body.split(";");
  if (parts.length > CANONICAL_FIELD_ORDER.length) {
    throw new SeiError("E_RRULE_LIST_LIMIT", "RRULE contains too many fields.");
  }
  const fields = new Map<string, string>();
  for (const part of parts) {
    const match = /^(?<name>[A-Za-z][A-Za-z0-9-]*)=(?<value>[^=;]+)$/.exec(part);
    if (match?.groups === undefined) invalid("Each RRULE field must use NAME=VALUE syntax.");
    const name = match.groups.name?.toUpperCase() ?? "";
    const value = match.groups.value?.toUpperCase() ?? "";
    if (!ALLOWED_FIELDS.has(name)) {
      throw new SeiError("E_RRULE_FIELD_UNKNOWN", `Unsupported RRULE field '${name}'.`);
    }
    if (fields.has(name)) {
      throw new SeiError("E_RRULE_FIELD_DUPLICATE", `RRULE field '${name}' appears more than once.`);
    }
    fields.set(name, value);
  }
  const frequency = fields.get("FREQ");
  if (frequency === undefined) invalid("RRULE requires FREQ.");
  if (!(FREQUENCIES as readonly string[]).includes(frequency)) {
    invalid(`Unsupported FREQ value '${frequency}'.`);
  }

  const interval = fields.has("INTERVAL")
    ? parsePositiveInteger(fields.get("INTERVAL") ?? "", "INTERVAL")
    : 1;
  const count = fields.has("COUNT")
    ? parsePositiveInteger(fields.get("COUNT") ?? "", "COUNT")
    : null;
  const until = fields.has("UNTIL") ? parseUntil(fields.get("UNTIL") ?? "") : null;
  const weekStart = (fields.get("WKST") ?? "MO") as (typeof WEEKDAYS)[number];
  if (!(WEEKDAYS as readonly string[]).includes(weekStart)) invalid("WKST must be a weekday token.");

  const bySecond = fields.has("BYSECOND")
    ? parseIntegerList(fields.get("BYSECOND") ?? "", "BYSECOND", 0, 60, true, input)
    : [];
  const byMinute = fields.has("BYMINUTE")
    ? parseIntegerList(fields.get("BYMINUTE") ?? "", "BYMINUTE", 0, 59, true, input)
    : [];
  const byHour = fields.has("BYHOUR")
    ? parseIntegerList(fields.get("BYHOUR") ?? "", "BYHOUR", 0, 23, true, input)
    : [];
  const byDay = fields.has("BYDAY") ? parseByDay(fields.get("BYDAY") ?? "", input) : [];
  const byMonthDay = fields.has("BYMONTHDAY")
    ? parseIntegerList(fields.get("BYMONTHDAY") ?? "", "BYMONTHDAY", -31, 31, false, input)
    : [];
  const byYearDay = fields.has("BYYEARDAY")
    ? parseIntegerList(fields.get("BYYEARDAY") ?? "", "BYYEARDAY", -366, 366, false, input)
    : [];
  const byWeekNumber = fields.has("BYWEEKNO")
    ? parseIntegerList(fields.get("BYWEEKNO") ?? "", "BYWEEKNO", -53, 53, false, input)
    : [];
  const byMonth = fields.has("BYMONTH")
    ? parseIntegerList(fields.get("BYMONTH") ?? "", "BYMONTH", 1, 12, true, input)
    : [];
  const bySetPosition = fields.has("BYSETPOS")
    ? parseIntegerList(fields.get("BYSETPOS") ?? "", "BYSETPOS", -366, 366, false, input)
    : [];
  const totalListItems = [
    bySecond,
    byMinute,
    byHour,
    byDay,
    byMonthDay,
    byYearDay,
    byWeekNumber,
    byMonth,
    bySetPosition,
  ].reduce((total, values) => total + values.length, 0);
  if (totalListItems > input.limits.max_output_items) {
    throw new SeiError(
      "E_RRULE_LIST_LIMIT",
      `RRULE BY* values exceed cumulative max_output_items=${input.limits.max_output_items}.`,
    );
  }
  assertSemanticCombinations(fields, byDay);

  const canonicalValues = new Map<string, string>([
    ["FREQ", frequency],
    ...(fields.has("INTERVAL") ? [["INTERVAL", String(interval)] as const] : []),
    ...(count === null ? [] : [["COUNT", String(count)] as const]),
    ...(until === null ? [] : [["UNTIL", until] as const]),
    ...(fields.has("WKST") ? [["WKST", weekStart] as const] : []),
    ...(bySecond.length === 0 ? [] : [["BYSECOND", bySecond.join(",")] as const]),
    ...(byMinute.length === 0 ? [] : [["BYMINUTE", byMinute.join(",")] as const]),
    ...(byHour.length === 0 ? [] : [["BYHOUR", byHour.join(",")] as const]),
    ...(byDay.length === 0 ? [] : [["BYDAY", byDay.map(canonicalDay).join(",")] as const]),
    ...(byMonthDay.length === 0 ? [] : [["BYMONTHDAY", byMonthDay.join(",")] as const]),
    ...(byYearDay.length === 0 ? [] : [["BYYEARDAY", byYearDay.join(",")] as const]),
    ...(byWeekNumber.length === 0 ? [] : [["BYWEEKNO", byWeekNumber.join(",")] as const]),
    ...(byMonth.length === 0 ? [] : [["BYMONTH", byMonth.join(",")] as const]),
    ...(bySetPosition.length === 0 ? [] : [["BYSETPOS", bySetPosition.join(",")] as const]),
  ]);
  const normalized = `RRULE:${CANONICAL_FIELD_ORDER.flatMap((name) => {
    const value = canonicalValues.get(name);
    return value === undefined ? [] : [`${name}=${value}`];
  }).join(";")}`;

  try {
    const rule = RRule.fromString(normalized);
    if (rule.toString() !== normalized) {
      throw new Error("engine canonical form differs from the strict adapter form");
    }
  } catch {
    throw new SeiError(
      "E_RRULE_PARSE",
      "RRULE parser rejected the supported strict subset.",
    );
  }

  return {
    normalized,
    value: {
      frequency,
      interval,
      count,
      until,
      week_start: weekStart,
      by_second: bySecond,
      by_minute: byMinute,
      by_hour: byHour,
      by_day: byDay,
      by_month_day: byMonthDay,
      by_year_day: byYearDay,
      by_week_number: byWeekNumber,
      by_month: byMonth,
      by_set_position: bySetPosition,
    },
    semantics: {
      bounded: count !== null || until !== null,
      termination: count !== null ? "count" : until !== null ? "until" : "unbounded",
    },
  };
}

const integerArraySchema = (
  minimum: number,
  maximum: number,
  allowZero = true,
): JsonObject => ({
  type: "array",
  maxItems: HARD_LIMITS.max_output_items,
  items: {
    type: "integer",
    minimum,
    maximum,
    ...(allowZero ? {} : { not: { const: 0 } }),
  },
});

export class RruleAdapter implements ExpressionAdapter {
  readonly descriptor: AdapterDescriptor = {
    kind: "rrule",
    title: "RFC 5545 recurrence rule",
    summary: "Interpret one strict RRULE property without expanding calendar occurrences.",
    dialects: ["rfc5545"],
    default_dialect: "rfc5545",
    capabilities: ["interpret", "validate", "normalize"],
    interpretation_contract: {
      value_schema: {
        type: "object",
        properties: {
          frequency: { enum: [...FREQUENCIES] },
          interval: { type: "integer", minimum: 1, maximum: 2_147_483_647 },
          count: { anyOf: [{ type: "integer", minimum: 1 }, { type: "null" }] },
          until: {
            anyOf: [
              { type: "string", pattern: "^(?:0[1-9]\\d{2}|[1-9]\\d{3})\\d{4}T\\d{6}Z$" },
              { type: "null" },
            ],
          },
          week_start: { enum: [...WEEKDAYS] },
          by_second: integerArraySchema(0, 60),
          by_minute: integerArraySchema(0, 59),
          by_hour: integerArraySchema(0, 23),
          by_day: {
            type: "array",
            maxItems: HARD_LIMITS.max_output_items,
            items: {
              type: "object",
              properties: {
                weekday: { enum: [...WEEKDAYS] },
                ordinal: { type: "integer", minimum: -53, maximum: 53, not: { const: 0 } },
              },
              required: ["weekday"],
              additionalProperties: false,
            },
          },
          by_month_day: integerArraySchema(-31, 31, false),
          by_year_day: integerArraySchema(-366, 366, false),
          by_week_number: integerArraySchema(-53, 53, false),
          by_month: integerArraySchema(1, 12),
          by_set_position: integerArraySchema(-366, 366, false),
        },
        required: [
          "frequency",
          "interval",
          "count",
          "until",
          "week_start",
          "by_second",
          "by_minute",
          "by_hour",
          "by_day",
          "by_month_day",
          "by_year_day",
          "by_week_number",
          "by_month",
          "by_set_position",
        ],
        additionalProperties: false,
      },
      semantics_schema: {
        type: "object",
        properties: {
          bounded: { type: "boolean" },
          termination: { enum: ["count", "until", "unbounded"] },
        },
        required: ["bounded", "termination"],
        additionalProperties: false,
      },
    },
    provenance: {
      spec: "RFC5545-RRULE",
      engine: "rrule",
      engine_version: packageVersion("rrule"),
      compatibility_mode: "strict-single-property-no-occurrence-expansion",
    },
  };

  interpret(input: AdapterInput): AdapterInterpretation {
    return parseRrule(input);
  }

  detect(expression: string): DetectionCandidate | null {
    if (!/^RRULE:/i.test(expression) || /[\r\n]/.test(expression)) return null;
    return {
      kind: "rrule",
      dialect: "rfc5545",
      confidence: 0.995,
      reason: "The input has the explicit RFC 5545 RRULE property front door.",
      supported: true,
    };
  }
}
