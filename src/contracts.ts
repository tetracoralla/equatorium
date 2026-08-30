export type JsonPrimitive = string | number | boolean | null;
export type JsonValue = JsonPrimitive | JsonObject | JsonValue[];
export interface JsonObject {
  [key: string]: JsonValue;
}

export const OPERATIONS = [
  "interpret",
  "validate",
  "normalize",
  "query",
  "convert",
  "detect",
] as const;

export type Operation = (typeof OPERATIONS)[number];

export interface SeiContext extends JsonObject {
  timezone?: string;
  reference_time?: string;
}

export interface SeiLimits extends JsonObject {
  max_expression_length: number;
  max_output_items: number;
  max_request_bytes: number;
  max_response_bytes: number;
  max_nesting_depth: number;
  max_collection_entries: number;
  max_string_length: number;
  max_execution_ms: number;
}

export interface SeiQuery {
  name: string;
  arguments?: JsonObject;
}

export interface SeiConversion {
  target_dialect?: string;
  target_representation?: string;
  arguments?: JsonObject;
}

export interface SeiRequest {
  schema_version?: "sei.request.v1";
  op: Operation;
  expression: string;
  kind?: string;
  dialect?: string;
  context?: SeiContext;
  derive?: string[];
  query?: SeiQuery;
  convert?: SeiConversion;
  limits?: Partial<SeiLimits>;
}

export interface SourceSpan extends JsonObject {
  start: number;
  end: number;
}

export interface RepairCandidate extends JsonObject {
  expression: string;
  confidence?: number;
  reason?: string;
}

export interface Diagnostic extends JsonObject {
  code: string;
  severity: "error" | "warning";
  message: string;
  span?: SourceSpan;
  expected?: JsonObject;
  details?: JsonObject;
  repair_candidates?: RepairCandidate[];
}

export interface Provenance extends JsonObject {
  spec: string;
  engine: string;
  engine_version: string;
  compatibility_mode: string;
  runtime?: string;
  runtime_version?: string;
  timezone_engine?: string;
  timezone_data_version?: string;
  icu_version?: string;
}

export interface DetectionCandidate extends JsonObject {
  kind: string;
  dialect?: string;
  confidence: number;
  reason: string;
  supported: boolean;
}

export interface SeiSuccessBase {
  schema_version: "sei.result.v1";
  ok: true;
  operation: Operation;
  input: string;
  kind?: SupportedKind;
  dialect?: string;
  normalized?: string;
  capabilities?: string[];
  diagnostics: Diagnostic[];
  provenance?: Provenance;
  value?: KindValueMap[SupportedKind];
  semantics?: CronSemantics | RruleSemantics;
  derived?: CronDerived;
  query_name?: KnownQueryName;
  query_result?: KnownQueryResult;
  conversion_target?: "octal" | "symbolic";
  converted?: UnixPermissionConversionResult;
  candidates?: DetectionCandidate[];
  resolved?: false;
}

export interface SeiFailure {
  schema_version: "sei.result.v1";
  ok: false;
  operation: Operation;
  input: string;
  kind?: string;
  dialect?: string;
  normalized?: undefined;
  diagnostics: Diagnostic[];
}

export type SupportedKind =
  | "cron"
  | "semver_range"
  | "cidr"
  | "uri"
  | "content_type"
  | "iso_duration"
  | "rrule"
  | "unix_permission";

export interface CronAnyField extends JsonObject {
  type: "any";
}

export interface CronSetField extends JsonObject {
  type: "set";
  values: Array<number | string>;
}

export interface CronRangeField extends JsonObject {
  type: "range";
  from: number;
  to: number;
}

export type CronFieldValue = CronAnyField | CronSetField | CronRangeField;

export interface CronValue extends JsonObject {
  minute: CronFieldValue;
  hour: CronFieldValue;
  day_of_month: CronFieldValue;
  month: CronFieldValue;
  day_of_week: CronFieldValue;
}

export interface CronSemantics extends JsonObject {
  timezone: string;
  day_of_month_day_of_week_relation: "or";
}

export interface CronOccurrence extends JsonObject {
  instant: string;
  timezone: string;
}

export interface CronDerived extends JsonObject {
  human_description?: string;
  next_occurrences?: CronOccurrence[];
}

export interface SemverComparator extends JsonObject {
  operator: string;
  version: string;
}

export interface SemverRangeValue extends JsonObject {
  comparator_sets: SemverComparator[][];
}

export interface CidrValue extends JsonObject {
  family: "ipv4" | "ipv6";
  network: string;
  prefix: number;
  netmask: string;
  first_address: string;
  last_address: string;
  address_count: string;
}

export interface UriValue extends JsonObject {
  scheme: string;
  userinfo?: string;
  host?: string;
  port?: string;
  path: string;
  query?: string;
  fragment?: string;
}

export interface StringDictionary extends JsonObject {
  [name: string]: string;
}

export interface ContentTypeValue extends JsonObject {
  media_type: string;
  type: string;
  subtype: string;
  suffix?: string;
  parameters: StringDictionary;
}

export interface IsoDurationValue extends JsonObject {
  years: string;
  months: string;
  weeks: string;
  days: string;
  hours: string;
  minutes: string;
  seconds: string;
}

export interface RruleDay extends JsonObject {
  weekday: "MO" | "TU" | "WE" | "TH" | "FR" | "SA" | "SU";
  ordinal?: number;
}

export interface RruleValue extends JsonObject {
  frequency: "YEARLY" | "MONTHLY" | "WEEKLY" | "DAILY" | "HOURLY" | "MINUTELY" | "SECONDLY";
  interval: number;
  count: number | null;
  until: string | null;
  week_start: "MO" | "TU" | "WE" | "TH" | "FR" | "SA" | "SU";
  by_second: number[];
  by_minute: number[];
  by_hour: number[];
  by_day: RruleDay[];
  by_month_day: number[];
  by_year_day: number[];
  by_week_number: number[];
  by_month: number[];
  by_set_position: number[];
}

export interface RruleSemantics extends JsonObject {
  bounded: boolean;
  termination: "count" | "until" | "unbounded";
}

export interface PermissionBits extends JsonObject {
  read: boolean;
  write: boolean;
  execute: boolean;
}

export interface UnixPermissionValue extends JsonObject {
  octal: string;
  symbolic: string;
  special: JsonObject & { setuid: boolean; setgid: boolean; sticky: boolean };
  classes: JsonObject & {
    owner: PermissionBits;
    group: PermissionBits;
    other: PermissionBits;
  };
}

export interface KindValueMap {
  cron: CronValue;
  semver_range: SemverRangeValue;
  cidr: CidrValue;
  uri: UriValue;
  content_type: ContentTypeValue;
  iso_duration: IsoDurationValue;
  rrule: RruleValue;
  unix_permission: UnixPermissionValue;
}

export interface KindDialectMap {
  cron: "unix-5" | "github-actions";
  semver_range: "npm";
  cidr: "cidr";
  uri: "rfc3986";
  content_type: "http";
  iso_duration: "iso8601-1";
  rrule: "rfc5545";
  unix_permission: "posix-mode";
}

type NonSemanticKind = Exclude<SupportedKind, "cron" | "rrule">;

export type SeiValueSuccess =
  | (SeiSuccessBase & {
      operation: "interpret" | "normalize";
      kind: "cron";
      dialect: "unix-5" | "github-actions";
      normalized: string;
      value: CronValue;
      semantics: CronSemantics;
      derived?: CronDerived;
      capabilities: string[];
      provenance: Provenance;
    })
  | (SeiSuccessBase & {
      operation: "interpret" | "normalize";
      kind: "rrule";
      dialect: "rfc5545";
      normalized: string;
      value: RruleValue;
      semantics: RruleSemantics;
      capabilities: string[];
      provenance: Provenance;
    })
  | {
      [Kind in NonSemanticKind]: SeiSuccessBase & {
        operation: "interpret" | "normalize";
        kind: Kind;
        dialect: KindDialectMap[Kind];
        normalized: string;
        value: KindValueMap[Kind];
        capabilities: string[];
        provenance: Provenance;
      };
    }[NonSemanticKind];

export type SeiValidateSuccess =
  | (SeiSuccessBase & {
      operation: "validate";
      kind: "cron";
      dialect: "unix-5" | "github-actions";
      normalized: string;
      semantics: CronSemantics;
      derived?: CronDerived;
      capabilities: string[];
      provenance: Provenance;
    })
  | (SeiSuccessBase & {
      operation: "validate";
      kind: "rrule";
      dialect: "rfc5545";
      normalized: string;
      semantics: RruleSemantics;
      capabilities: string[];
      provenance: Provenance;
    })
  | {
      [Kind in NonSemanticKind]: SeiSuccessBase & {
        operation: "validate";
        kind: Kind;
        dialect: KindDialectMap[Kind];
        normalized: string;
        capabilities: string[];
        provenance: Provenance;
      };
    }[NonSemanticKind];

export interface CronMatchesResult extends JsonObject {
  matches: boolean;
}

export interface SemverMatchesResult extends JsonObject {
  candidate: string;
  matches: boolean;
}

export interface SemverIntersectsResult extends JsonObject {
  range: string;
  intersects: boolean;
}

export interface CidrContainsResult extends JsonObject {
  address: string;
  contains: boolean;
}

export interface CidrOverlapsResult extends JsonObject {
  cidr: string;
  overlaps: boolean;
}

export interface UriResolveResult extends JsonObject {
  reference: string;
  resolved: string;
}

export interface UriEqualsResult extends JsonObject {
  uri: string;
  equals: boolean;
}

export interface ContentTypeParameterResult extends JsonObject {
  name: string;
  present: boolean;
  value: string | null;
}

export interface PermissionAllowsResult extends JsonObject {
  subject: "owner" | "group" | "other";
  permission: "read" | "write" | "execute";
  allows: boolean;
}

export type KnownQueryName =
  | "next_occurrences"
  | "matches"
  | "intersects"
  | "contains"
  | "overlaps"
  | "resolve"
  | "equals"
  | "parameter"
  | "allows";

export type KnownQueryResult =
  | CronOccurrence[]
  | CronMatchesResult
  | SemverMatchesResult
  | SemverIntersectsResult
  | CidrContainsResult
  | CidrOverlapsResult
  | UriResolveResult
  | UriEqualsResult
  | ContentTypeParameterResult
  | PermissionAllowsResult;

export type SeiQuerySuccess = SeiSuccessBase & {
  operation: "query";
  normalized: string;
  capabilities: string[];
  provenance: Provenance;
} & (
  | { kind: "cron"; dialect: KindDialectMap["cron"]; query_name: "next_occurrences"; query_result: CronOccurrence[] }
  | { kind: "cron"; dialect: KindDialectMap["cron"]; query_name: "matches"; query_result: CronMatchesResult }
  | { kind: "semver_range"; dialect: KindDialectMap["semver_range"]; query_name: "matches"; query_result: SemverMatchesResult }
  | { kind: "semver_range"; dialect: KindDialectMap["semver_range"]; query_name: "intersects"; query_result: SemverIntersectsResult }
  | { kind: "cidr"; dialect: KindDialectMap["cidr"]; query_name: "contains"; query_result: CidrContainsResult }
  | { kind: "cidr"; dialect: KindDialectMap["cidr"]; query_name: "overlaps"; query_result: CidrOverlapsResult }
  | { kind: "uri"; dialect: KindDialectMap["uri"]; query_name: "resolve"; query_result: UriResolveResult }
  | { kind: "uri"; dialect: KindDialectMap["uri"]; query_name: "equals"; query_result: UriEqualsResult }
  | { kind: "content_type"; dialect: KindDialectMap["content_type"]; query_name: "parameter"; query_result: ContentTypeParameterResult }
  | { kind: "unix_permission"; dialect: KindDialectMap["unix_permission"]; query_name: "allows"; query_result: PermissionAllowsResult }
);

export interface UnixPermissionOctalConversionResult extends JsonObject {
  representation: "octal";
  expression: string;
}

export interface UnixPermissionSymbolicConversionResult extends JsonObject {
  representation: "symbolic";
  expression: string;
}

export type UnixPermissionConversionResult =
  | UnixPermissionOctalConversionResult
  | UnixPermissionSymbolicConversionResult;

export type SeiConversionSuccess = SeiSuccessBase & {
  operation: "convert";
  kind: "unix_permission";
  dialect: KindDialectMap["unix_permission"];
  normalized: string;
  capabilities: string[];
  provenance: Provenance;
} & (
  | { conversion_target: "octal"; converted: UnixPermissionOctalConversionResult }
  | { conversion_target: "symbolic"; converted: UnixPermissionSymbolicConversionResult }
);

export type SeiDetectSuccess = SeiSuccessBase & {
  operation: "detect";
  candidates: DetectionCandidate[];
  resolved: false;
};

export type SeiSuccess =
  | SeiValueSuccess
  | SeiValidateSuccess
  | SeiQuerySuccess
  | SeiConversionSuccess
  | SeiDetectSuccess;

export type SeiResult = SeiSuccess | SeiFailure;

export interface InputFieldSchema extends JsonObject {
  type: "string" | "integer" | "boolean";
  description: string;
  enum?: JsonPrimitive[];
  minimum?: number;
  maximum?: number;
  min_length?: number;
  max_length?: number;
  pattern?: string;
  diagnostic_code?: string;
}

export interface InputObjectSchema extends JsonObject {
  type: "object";
  properties: { [name: string]: InputFieldSchema };
  required: string[];
  additional_properties: false;
}

export interface QueryContract extends JsonObject {
  name: string;
  summary: string;
  arguments: InputObjectSchema;
  required_context?: string[];
  result_schema: JsonObject;
}

export interface DeriveContract extends JsonObject {
  name: string;
  summary: string;
  required_context?: string[];
  result_schema: JsonObject;
}

export interface ConversionContract extends JsonObject {
  summary: string;
  target_dialects: string[];
  target_representations: string[];
  arguments: InputObjectSchema;
  result_schemas: { [targetRepresentation: string]: JsonObject };
}

export interface InterpretationContract extends JsonObject {
  value_schema: JsonObject;
  semantics_schema?: JsonObject;
}

export interface AdapterDescriptor extends JsonObject {
  kind: string;
  title: string;
  summary: string;
  dialects: string[];
  default_dialect?: string;
  capabilities: string[];
  context_contract?: InputObjectSchema;
  capability_constraints?: JsonObject;
  interpretation_contract: InterpretationContract;
  query_contracts?: QueryContract[];
  derive_contracts?: DeriveContract[];
  conversion_contract?: ConversionContract;
  provenance: Provenance;
}
