# SEI v0.1 contract

## Request

`sei.request.v1` accepts `interpret`, `validate`, `normalize`, `query`, `convert`, and `detect`.

- `op` and `expression` are always required.
- `kind` is required except for `detect`.
- `dialect` is required when an adapter has no default. Cron deliberately requires it because platform semantics differ.
- `context.reference_time` is mandatory whenever time-relative results are requested.
- Context fields are adapter-owned and rejected for kinds that do not declare a context contract.
- `query`, `convert`, and `derive` are allowed only on their declared operations. Each adapter descriptor publishes exact argument fields, required fields, scalar types, enums, and bounds. Unknown fields are errors.
- Callers may lower expression, generated-output-item, request-byte, response-byte, request nesting-depth, request collection-entry, request string-length, and execution-time limits; they cannot raise hard ceilings. Registry discovery separately publishes the fixed response-structure ceiling needed to bound the result envelope itself.
- The CLI applies one cumulative stdin, response, item-count, and execution-time ceiling to the whole batch in addition to per-request limits. Each semantic request runs in an isolated worker that is terminated at `max_execution_ms`; parent-side validation applies the full published result union, the request's actual `max_response_bytes`, and request/result correlation for operation, input, kind, dialect, query name, and conversion target.

## Result

Every operation returns `sei.result.v1` with `ok`, `operation`, `input`, and `diagnostics`. A successful interpretation can add:

- `normalized`: canonical expression;
- `value`: typed parsed representation;
- `semantics`: facts that change downstream interpretation;
- `derived`: explicitly requested computed values;
- `query_result` or `converted`;
- `query_name` or `conversion_target`, which discriminates the exact result shape;
- `capabilities`: the adapter's actual surface;
- `provenance`: specification, engine, engine version, and compatibility mode.

Failures use stable diagnostic codes and never return a partially repaired expression as success. Stack traces and engine internals stay out of public results.

## Stable core diagnostics

| Code | Meaning |
| --- | --- |
| `E_REQUEST_INVALID` | Request shape or field type is invalid |
| `E_SCHEMA_VERSION` | Unsupported request schema version |
| `E_OPERATION_UNKNOWN` | Operation is not in the v0.1 contract |
| `E_KIND_REQUIRED` / `E_KIND_UNKNOWN` | Kind is missing or unregistered |
| `E_DIALECT_REQUIRED` / `E_DIALECT_UNSUPPORTED` | Dialect choice is missing or unsupported |
| `E_EXPRESSION_TOO_LONG` | Expression exceeded its active input bound |
| `E_LIMIT_INVALID` / `E_RESOURCE_LIMIT` | Requested or computed work exceeded a domain bound |
| `E_REQUEST_LIMIT` / `E_RESPONSE_LIMIT` | Serialized or structural request/response exceeded a bound |
| `E_EXECUTION_TIMEOUT` | The bounded interpreter exceeded its deadline and was terminated |
| `E_BATCH_TIMEOUT` / `E_BATCH_RESPONSE_LIMIT` | A whole batch exhausted its cumulative time or response budget |
| `E_MEMORY_LIMIT` | The isolated interpreter exceeded a V8 worker memory ceiling and was terminated |
| `E_WORKER_EXIT` | The isolated worker exited unexpectedly before returning a result |
| `E_WORKER_PROTOCOL` | The isolated worker returned an invalid result envelope |
| `E_QUERY_REQUIRED` / `E_QUERY_INVALID` / `E_QUERY_UNSUPPORTED` | Query contract failure |
| `E_CONVERSION_REQUIRED` / `E_CONVERSION_UNSUPPORTED` | Conversion contract failure |
| `E_REFERENCE_TIME_REQUIRED` | A replay-sensitive time result lacks an explicit reference |
| `E_TIME_INVALID` | A timestamp is not in the supported explicit-offset RFC 3339 subset or is not a real calendar value |
| `E_RUNTIME` | Unexpected bounded adapter failure |

Adapters add domain-prefixed diagnostics such as `E_CRON_FIELD_COUNT`, `E_SEMVER_RANGE_PARSE`, and `E_CIDR_PARSE`.

## Determinism and normalization

For any valid expression in a fixed dialect and context:

```text
normalize(normalize(x)) = normalize(x)
meaning(normalize(x)) = meaning(x)
```

Time-relative output is deterministic only with an explicit reference time. Reference times and match candidates require seconds plus `Z` or a numeric offset; v0.1 supports one to three fractional-second digits. Cron provenance reports the Node, ICU, and timezone-data versions in addition to the parser version so another runtime can reproduce the same compatibility boundary.

Numeric-looking standard tokens are not automatically represented as JSON numbers. ISO duration components are exact decimal strings, CIDR address counts are integer strings, and parsing rejects syntax that a reused engine would otherwise coerce or collapse. Content-Type parameters must be unique case-insensitively, and invalid SemVer query candidates are errors rather than a `false` match.

The published result schema is a generated tagged union. Success branches are discriminated by `kind` and `operation`; queries also include `query_name`, and conversions include `conversion_target`. Each branch declares its exact `value`, `semantics`, `derived`, `query_result`, or `converted` shape. The exported TypeScript `SeiResult` mirrors the same domain types instead of exposing these fields as unrestricted `JsonValue`.

GitHub Actions cron input is lexically constrained before `cron-parser`: only the documented five fields, ranges, names, and `* , - /` operators are admitted, and the five-minute floor is checked across midnight as well as within a day. The `unix-5` dialect admits Sunday `7` but rejects Quartz-only operators. URI input is likewise checked against the supported RFC 3986 ASCII/component grammar before `uri-js` may normalize it, and the identical strict route is used for query operands.

The v0.1 time-zone default is UTC. Callers that mean a scheduler-local zone must pass an IANA timezone explicitly. For the `github-actions` dialect, non-UTC syntax is validated, but occurrence and match queries remain UTC-only until SEI has an engine that reproduces GitHub's DST gap policy.
