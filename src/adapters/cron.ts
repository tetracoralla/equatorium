import { CronExpressionParser, type CronExpression } from "cron-parser";
import type {
  AdapterDescriptor,
  DetectionCandidate,
  Diagnostic,
  JsonObject,
  JsonValue,
  SeiQuery,
} from "../contracts.js";
import type {
  AdapterInput,
  AdapterInterpretation,
  ExpressionAdapter,
} from "../core/adapter.js";
import { SeiError } from "../core/errors.js";
import { packageVersion } from "../core/provenance.js";

interface CronState {
  expression: CronExpression;
}

const CRON_FIELD_RESULT_SCHEMA: JsonObject = {
  oneOf: [
    {
      type: "object",
      properties: { type: { const: "any" } },
      required: ["type"],
      additionalProperties: false,
    },
    {
      type: "object",
      properties: {
        type: { const: "set" },
        values: {
          type: "array",
          items: { anyOf: [{ type: "integer" }, { type: "string" }] },
        },
      },
      required: ["type", "values"],
      additionalProperties: false,
    },
    {
      type: "object",
      properties: {
        type: { const: "range" },
        from: { type: "integer" },
        to: { type: "integer" },
      },
      required: ["type", "from", "to"],
      additionalProperties: false,
    },
  ],
};

const CRON_OCCURRENCE_RESULT_SCHEMA: JsonObject = {
  type: "object",
  properties: { instant: { type: "string" }, timezone: { type: "string" } },
  required: ["instant", "timezone"],
  additionalProperties: false,
};

const STRICT_RFC3339 = /^(?<year>\d{4})-(?<month>\d{2})-(?<day>\d{2})T(?<hour>\d{2}):(?<minute>\d{2}):(?<second>\d{2})(?:\.(?<fraction>\d{1,3}))?(?<offset>Z|[+-]\d{2}:\d{2})$/;
const STRICT_RFC3339_SOURCE = String.raw`^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?(?:Z|[+-]\d{2}:\d{2})$`;

function isLeapYear(year: number): boolean {
  return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
}

function parseReferenceTime(value: string, location = "context.reference_time"): string {
  const match = STRICT_RFC3339.exec(value);
  if (match?.groups === undefined) {
    throw new SeiError(
      "E_TIME_INVALID",
      `'${location}' must be an RFC 3339 timestamp with seconds and an explicit Z or numeric offset.`,
    );
  }
  const year = Number.parseInt(match.groups.year ?? "", 10);
  const month = Number.parseInt(match.groups.month ?? "", 10);
  const day = Number.parseInt(match.groups.day ?? "", 10);
  const hour = Number.parseInt(match.groups.hour ?? "", 10);
  const minute = Number.parseInt(match.groups.minute ?? "", 10);
  const second = Number.parseInt(match.groups.second ?? "", 10);
  const offset = match.groups.offset ?? "";
  const daysInMonth = [31, isLeapYear(year) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  const offsetHours = offset === "Z" ? 0 : Number.parseInt(offset.slice(1, 3), 10);
  const offsetMinutes = offset === "Z" ? 0 : Number.parseInt(offset.slice(4, 6), 10);
  if (
    month < 1 ||
    month > 12 ||
    day < 1 ||
    day > (daysInMonth[month - 1] ?? 0) ||
    hour > 23 ||
    minute > 59 ||
    second > 59 ||
    offsetHours > 23 ||
    offsetMinutes > 59
  ) {
    throw new SeiError("E_TIME_INVALID", `'${location}' contains an invalid calendar or time value.`);
  }
  const timestamp = Date.parse(value);
  if (!Number.isFinite(timestamp)) {
    throw new SeiError("E_TIME_INVALID", `'${location}' is outside the supported timestamp range.`);
  }
  return new Date(timestamp).toISOString();
}

function timezoneFor(input: AdapterInput): string {
  return input.context.timezone ?? "UTC";
}

const GITHUB_MONTH_NAMES = new Set([
  "JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC",
]);
const GITHUB_WEEKDAY_NAMES = new Set(["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"]);

function assertCronEndpoint(
  endpoint: string,
  fieldIndex: number,
  minimum: number,
  maximum: number,
  code: string,
  dialectLabel: string,
): void {
  if (/^\d+$/.test(endpoint)) {
    const numeric = Number.parseInt(endpoint, 10);
    if (numeric < minimum || numeric > maximum) {
      throw new SeiError(
        code,
        `${dialectLabel} cron field ${fieldIndex + 1} requires values from ${minimum} through ${maximum}.`,
      );
    }
    return;
  }
  const names = fieldIndex === 3
    ? GITHUB_MONTH_NAMES
    : fieldIndex === 4
      ? GITHUB_WEEKDAY_NAMES
      : undefined;
  if (names === undefined || !names.has(endpoint.toUpperCase())) {
    throw new SeiError(
      code,
      `${dialectLabel} cron field ${fieldIndex + 1} contains an unsupported value '${endpoint}'.`,
    );
  }
}

function assertFiveFieldCronSyntax(
  fields: string[],
  options: { code: string; dialectLabel: string; dayOfWeekMaximum: 6 | 7 },
): void {
  const ranges = [
    [0, 59],
    [0, 23],
    [1, 31],
    [1, 12],
    [0, options.dayOfWeekMaximum],
  ] as const;
  fields.forEach((field, fieldIndex) => {
    if (!/^[0-9A-Za-z*,\/-]+$/.test(field)) {
      throw new SeiError(
        options.code,
        `${options.dialectLabel} cron supports only '*', ',', '-', and '/' operators.`,
      );
    }
    for (const item of field.split(",")) {
      const stepParts = item.split("/");
      if (stepParts.length > 2 || stepParts[0] === "") {
        throw new SeiError(options.code, `Invalid ${options.dialectLabel} cron item '${item}'.`);
      }
      const [base = "", step] = stepParts;
      if (step !== undefined && (!/^[1-9]\d*$/.test(step))) {
        throw new SeiError(
          options.code,
          `${options.dialectLabel} cron step '${step}' must be a positive decimal integer.`,
        );
      }
      if (base === "*") continue;
      const endpoints = base.split("-");
      if (endpoints.length > 2 || endpoints.some((endpoint) => endpoint.length === 0)) {
        throw new SeiError(options.code, `Invalid ${options.dialectLabel} cron range '${base}'.`);
      }
      const [minimum, maximum] = ranges[fieldIndex] ?? [0, 0];
      endpoints.forEach((endpoint) =>
        assertCronEndpoint(
          endpoint,
          fieldIndex,
          minimum,
          maximum,
          options.code,
          options.dialectLabel,
        ));
    }
  });
}

function assertGithubCronSyntax(fields: string[]): void {
  assertFiveFieldCronSyntax(fields, {
    code: "E_CRON_GITHUB_SYNTAX",
    dialectLabel: "GitHub Actions",
    dayOfWeekMaximum: 6,
  });
}

function assertUnixCronSyntax(fields: string[]): void {
  assertFiveFieldCronSyntax(fields, {
    code: "E_CRON_UNIX_SYNTAX",
    dialectLabel: "Unix five-field",
    dayOfWeekMaximum: 7,
  });
}

function fieldContains(
  field: { wildcard: boolean; values: Array<number | string> },
  value: number,
): boolean {
  return field.wildcard || field.values.includes(value);
}

function hasConsecutiveMatchingDates(
  fields: ReturnType<CronExpression["fields"]["serialize"]>,
): boolean {
  const matchesDate = (date: Date): boolean => {
    if (!fieldContains(fields.month, date.getUTCMonth() + 1)) return false;
    const dayOfMonth = fieldContains(fields.dayOfMonth, date.getUTCDate());
    const dayOfWeek = fieldContains(fields.dayOfWeek, date.getUTCDay());
    if (fields.dayOfMonth.wildcard) return dayOfWeek;
    if (fields.dayOfWeek.wildcard) return dayOfMonth;
    return dayOfMonth || dayOfWeek;
  };

  const end = Date.UTC(2400, 0, 1);
  for (let timestamp = Date.UTC(2000, 0, 1); timestamp < end; timestamp += 86_400_000) {
    if (
      matchesDate(new Date(timestamp)) &&
      matchesDate(new Date(timestamp + 86_400_000))
    ) {
      return true;
    }
  }
  return false;
}

function enforceGithubMinimumInterval(expression: CronExpression): void {
  const serialized = expression.fields.serialize();
  const minuteValues = serialized.minute.values.filter(
    (value): value is number => typeof value === "number",
  );
  const hourValues = serialized.hour.values.filter(
    (value): value is number => typeof value === "number",
  );
  const times = hourValues
    .flatMap((hour) => minuteValues.map((minute) => hour * 60 + minute))
    .sort((left, right) => left - right);

  for (let index = 1; index < times.length; index += 1) {
    if ((times[index] ?? 0) - (times[index - 1] ?? 0) < 5) {
      throw new SeiError(
        "E_CRON_GITHUB_MIN_INTERVAL",
        "GitHub Actions schedules cannot request runs less than five minutes apart.",
      );
    }
  }
  const crossMidnightGap = times.length === 0
    ? Number.POSITIVE_INFINITY
    : 24 * 60 - (times.at(-1) ?? 0) + (times[0] ?? 0);
  if (crossMidnightGap < 5 && hasConsecutiveMatchingDates(serialized)) {
    throw new SeiError(
      "E_CRON_GITHUB_MIN_INTERVAL",
      "GitHub Actions schedules cannot request runs less than five minutes apart across days.",
    );
  }
}

function enforceGithubTimezoneQueryBoundary(input: AdapterInput): void {
  if (input.dialect === "github-actions" && timezoneFor(input) !== "UTC") {
    throw new SeiError(
      "E_QUERY_UNSUPPORTED",
      "GitHub Actions timezone-aware DST adjustment is not reproduced by the current engine; occurrence and match queries are limited to UTC for this dialect.",
      { expected: { timezone: "UTC" } },
    );
  }
}

function requireQueryArgs(query: SeiQuery): JsonObject {
  return query.arguments ?? {};
}

function describeField(label: string, wildcard: boolean, values: (number | string)[]): string {
  return wildcard ? `${label}=any` : `${label}=${values.join(",")}`;
}

function fieldValue(field: { wildcard: boolean; values: (number | string)[] }): JsonValue {
  if (field.wildcard) return { type: "any" };
  if (
    field.values.length > 1 &&
    field.values.every((value) => typeof value === "number") &&
    field.values.every((value, index, values) => index === 0 || value === (values[index - 1] as number) + 1)
  ) {
    return {
      type: "range",
      from: field.values[0] as number,
      to: field.values.at(-1) as number,
    };
  }
  return { type: "set", values: field.values };
}

export class CronAdapter implements ExpressionAdapter {
  readonly descriptor: AdapterDescriptor = {
    kind: "cron",
    title: "Cron schedule",
    summary: "Interpret five-field Unix and GitHub Actions cron schedules.",
    dialects: ["unix-5", "github-actions"],
    capabilities: [
      "interpret",
      "validate",
      "normalize",
      "query.next_occurrences",
      "query.matches",
      "derive.human_description",
      "derive.next_occurrences",
    ],
    context_contract: {
      type: "object",
      properties: {
        timezone: {
          type: "string",
          description: "IANA timezone name; defaults to UTC.",
          min_length: 1,
          max_length: 255,
        },
        reference_time: {
          type: "string",
          description: "RFC 3339 timestamp with seconds and an explicit Z or numeric offset.",
          min_length: 20,
          max_length: 35,
          pattern: STRICT_RFC3339_SOURCE,
          diagnostic_code: "E_TIME_INVALID",
        },
      },
      required: [],
      additional_properties: false,
    },
    interpretation_contract: {
      value_schema: {
        type: "object",
        properties: {
          minute: CRON_FIELD_RESULT_SCHEMA,
          hour: CRON_FIELD_RESULT_SCHEMA,
          day_of_month: CRON_FIELD_RESULT_SCHEMA,
          month: CRON_FIELD_RESULT_SCHEMA,
          day_of_week: CRON_FIELD_RESULT_SCHEMA,
        },
        required: ["minute", "hour", "day_of_month", "month", "day_of_week"],
        additionalProperties: false,
      },
      semantics_schema: {
        type: "object",
        properties: {
          timezone: { type: "string" },
          day_of_month_day_of_week_relation: { const: "or" },
        },
        required: ["timezone", "day_of_month_day_of_week_relation"],
        additionalProperties: false,
      },
    },
    query_contracts: [
      {
        name: "next_occurrences",
        summary: "Return the next bounded schedule instants after context.reference_time.",
        required_context: ["reference_time"],
        arguments: {
          type: "object",
          properties: {
            count: {
              type: "integer",
              description: "Number of occurrences to return; also constrained by limits.max_output_items.",
              minimum: 1,
              maximum: 100,
            },
          },
          required: [],
          additional_properties: false,
        },
        result_schema: {
          type: "array",
          items: CRON_OCCURRENCE_RESULT_SCHEMA,
          maxItems: 100,
        },
      },
      {
        name: "matches",
        summary: "Test whether one explicit RFC 3339 instant is selected by the schedule.",
        arguments: {
          type: "object",
          properties: {
            candidate: {
              type: "string",
              description: "RFC 3339 timestamp with an explicit Z or numeric offset.",
              min_length: 20,
              max_length: 35,
            },
          },
          required: ["candidate"],
          additional_properties: false,
        },
        result_schema: {
          type: "object",
          properties: { matches: { type: "boolean" } },
          required: ["matches"],
          additionalProperties: false,
        },
      },
    ],
    derive_contracts: [
      {
        name: "human_description",
        summary: "Compact deterministic field description.",
        result_schema: { type: "string" },
      },
      {
        name: "next_occurrences",
        summary: "The next five occurrences; requires context.reference_time.",
        required_context: ["reference_time"],
        result_schema: {
          type: "array",
          items: CRON_OCCURRENCE_RESULT_SCHEMA,
          maxItems: 5,
        },
      },
    ],
    capability_constraints: {
      "github-actions": {
        "query.next_occurrences": { timezones: ["UTC"] },
        "query.matches": { timezones: ["UTC"] },
        "derive.next_occurrences": { timezones: ["UTC"] },
      },
    },
    provenance: {
      spec: "POSIX-cron-family",
      engine: "cron-parser",
      engine_version: packageVersion("cron-parser"),
      compatibility_mode: "explicit-five-field",
      runtime: "node",
      runtime_version: process.versions.node,
      timezone_engine: "Intl",
      timezone_data_version: process.versions.tz ?? "unreported",
      icu_version: process.versions.icu ?? "unreported",
    },
  };

  interpret(input: AdapterInput): AdapterInterpretation {
    const fields = input.expression.trim().split(/\s+/);
    if (fields.length !== 5) {
      throw new SeiError(
        "E_CRON_FIELD_COUNT",
        `${input.dialect} cron requires 5 fields; received ${fields.length}.`,
        {
          expected: { field_count: 5 },
          span: { start: 0, end: input.expression.length },
        },
      );
    }
    if (input.dialect === "github-actions") {
      assertGithubCronSyntax(fields);
    } else {
      assertUnixCronSyntax(fields);
    }

    const timezone = timezoneFor(input);
    const currentDate = input.context.reference_time === undefined
      ? "1970-01-01T00:00:00.000Z"
      : parseReferenceTime(input.context.reference_time);

    let expression: CronExpression;
    try {
      expression = CronExpressionParser.parse(input.expression, {
        currentDate,
        tz: timezone,
      });
    } catch (error) {
      throw new SeiError(
        "E_CRON_PARSE",
        error instanceof Error ? error.message : "Invalid cron expression.",
        { span: { start: 0, end: input.expression.length } },
      );
    }
    if (input.dialect === "github-actions") {
      enforceGithubMinimumInterval(expression);
    }

    const serialized = expression.fields.serialize();
    const normalized = expression.stringify(false);
    const diagnostics: Diagnostic[] = [];
    if (!serialized.dayOfMonth.wildcard && !serialized.dayOfWeek.wildcard) {
      diagnostics.push({
        code: "W_CRON_DOM_DOW_OR",
        severity: "warning",
        message: "Both day-of-month and day-of-week are restricted; Unix cron matches when either field matches.",
      });
    }
    if (input.dialect === "github-actions" && timezone !== "UTC") {
      diagnostics.push({
        code: "W_CRON_PLATFORM_QUERY_LIMITED",
        severity: "warning",
        message: "GitHub Actions timezone syntax is valid, but v0.1 occurrence and match queries for this dialect are limited to UTC.",
      });
    }

    const derived: JsonObject = {};
    for (const name of input.derive) {
      if (name === "human_description") {
        derived.human_description = [
          describeField("minute", serialized.minute.wildcard, serialized.minute.values),
          describeField("hour", serialized.hour.wildcard, serialized.hour.values),
          describeField("day-of-month", serialized.dayOfMonth.wildcard, serialized.dayOfMonth.values),
          describeField("month", serialized.month.wildcard, serialized.month.values),
          describeField("day-of-week", serialized.dayOfWeek.wildcard, serialized.dayOfWeek.values),
          `timezone=${timezone}`,
        ].join("; ");
      } else if (name === "next_occurrences") {
        derived.next_occurrences = this.nextOccurrences(expression, input);
      } else {
        throw new SeiError("E_DERIVE_UNSUPPORTED", `Cron does not support derive '${name}'.`, {
          expected: { derive: ["human_description", "next_occurrences"] },
        });
      }
    }

    return {
      normalized,
      value: {
        minute: fieldValue(serialized.minute),
        hour: fieldValue(serialized.hour),
        day_of_month: fieldValue(serialized.dayOfMonth),
        month: fieldValue(serialized.month),
        day_of_week: fieldValue(serialized.dayOfWeek),
      },
      semantics: {
        timezone,
        day_of_month_day_of_week_relation: "or",
      },
      ...(Object.keys(derived).length === 0 ? {} : { derived }),
      diagnostics,
      state: { expression } satisfies CronState,
    };
  }

  query(
    interpretation: AdapterInterpretation,
    query: SeiQuery,
    input: AdapterInput,
  ): JsonValue {
    const state = interpretation.state as CronState;
    if (query.name === "next_occurrences") {
      return this.nextOccurrences(state.expression, input, requireQueryArgs(query));
    }
    if (query.name === "matches") {
      enforceGithubTimezoneQueryBoundary(input);
      const candidate = requireQueryArgs(query).candidate;
      if (typeof candidate !== "string") {
        throw new SeiError(
          "E_QUERY_INVALID",
          "Cron query 'matches' requires arguments.candidate as an RFC 3339 timestamp.",
        );
      }
      const instant = parseReferenceTime(candidate, "query.arguments.candidate");
      return { matches: state.expression.includesDate(new Date(instant)) };
    }
    throw new SeiError("E_QUERY_UNSUPPORTED", `Cron query '${query.name}' is not supported.`, {
      expected: { queries: ["next_occurrences", "matches"] },
    });
  }

  detect(expression: string): DetectionCandidate | null {
    const value = expression.trim();
    if (value.split(/\s+/).length !== 5) return null;
    try {
      assertUnixCronSyntax(value.split(/\s+/));
      CronExpressionParser.parse(value, {
        currentDate: "1970-01-01T00:00:00.000Z",
        tz: "UTC",
      });
      return {
        kind: "cron",
        dialect: "unix-5",
        confidence: 0.98,
        reason: "The input is a valid five-field cron expression.",
        supported: true,
      };
    } catch {
      return null;
    }
  }

  private nextOccurrences(
    expression: CronExpression,
    input: AdapterInput,
    argumentsValue: JsonObject = {},
  ): JsonValue[] {
    enforceGithubTimezoneQueryBoundary(input);
    if (input.context.reference_time === undefined) {
      throw new SeiError(
        "E_REFERENCE_TIME_REQUIRED",
        "Cron occurrence queries require explicit 'context.reference_time' for deterministic replay.",
      );
    }
    const requestedCount = argumentsValue.count ?? 5;
    if (!Number.isSafeInteger(requestedCount) || (requestedCount as number) < 1) {
      throw new SeiError("E_QUERY_INVALID", "Cron occurrence count must be a positive integer.");
    }
    if ((requestedCount as number) > input.limits.max_output_items) {
      throw new SeiError(
        "E_RESOURCE_LIMIT",
        `Occurrence count ${requestedCount} exceeds max_output_items=${input.limits.max_output_items}.`,
      );
    }

    expression.reset(new Date(parseReferenceTime(input.context.reference_time)));
    return expression.take(requestedCount as number).map((date) => ({
      instant: date.toISOString() ?? new Date(date.getTime()).toISOString(),
      timezone: timezoneFor(input),
    }));
  }
}
