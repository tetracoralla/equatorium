---
name: interpret-standard-expressions
description: Call Equatorium sei_run directly and exactly once for any concrete Cron, npm SemVer range, CIDR, RFC 3986 URI, HTTP Content-Type, ISO 8601 duration, RFC 5545 RRULE, or Unix permission task, including Chinese requests such as “解释 Unix 权限模式 4755”. Do not list MCP resources or templates; Equatorium exposes none. For Cron without a named platform or dialect, call op detect with only op and expression, then ask the user to choose; never add context, derive, query, or convert; never assume Unix, infer the Unix scheduler timezone, compute occurrences, or fall back to model reasoning.
---

# Interpret Standard Expressions with Equatorium

Use the deterministic runtime for every concrete supported expression, even when the answer appears obvious. Answer conceptual questions normally when no expression needs evaluation.

## Call once

- Do not call `list_mcp_resources` or `list_mcp_resource_templates`. Equatorium exposes no resources or templates; `sei_run` is already the complete callable surface.
- `sei_run` is the complete Agent surface. Call `sei_run` directly with the one operation that answers the question; do not list, discover, repeat, or append verification calls.
- For Cron without an explicit platform or dialect, make that one call with only `{ op: "detect", expression }` (plus an optional schema version or limits). Omit `kind`, `dialect`, `context`, `derive`, `query`, and `convert`. Detection does not choose a timezone or calculate occurrences: treat candidates as unresolved (`resolved: false`), present Unix cron versus GitHub Actions, and wait. GitHub Actions schedules use UTC; Unix cron uses the scheduler's configured timezone. Never assume Unix, infer the Unix scheduler timezone, fall back to model reasoning, or make a second call before the user chooses.

## Build the request

- Preserve `expression`; set known `kind` and `dialect`; omit unrelated fields. Cron dialects are not interchangeable. Supply context that changes meaning, especially `reference_time` and `timezone`, without inventing it.
- Use exact non-Cron pairs: `semver_range/npm`, `cidr/cidr`, `uri/rfc3986`, `content_type/http`, `iso_duration/iso8601-1`, `rrule/rfc5545`, and `unix_permission/posix-mode`.
- RRULE supports only one explicit `RRULE:` property with structural `interpret`, `validate`, or `normalize`. Do not send `DTSTART`, `RDATE`, `EXDATE`, `VEVENT`, context, query, convert, or derive fields, and do not use Equatorium to expand occurrences.
- Every query uses `query: { name, arguments }`. npm membership is `op: "query"`, `kind: "semver_range"`, `dialect: "npm"`, and `query: { name: "matches", arguments: { candidate: <version> } }`.

## Present the result

- Treat one completed result as final. Preserve `normalized` exactly for canonical or “规范写法” requests, plus semantics, warnings, query/conversion tags, and exact values that affect the answer.
- Keep protocol/provenance secondary. A structured error is not a negative match. In particular, an invalid SemVer candidate cannot be evaluated and must never be reported as `false`, “不包含”, or “不匹配”. Correct the request or ask for the missing choice; never replace an error with model-memory interpretation or unsupported dialect behavior.
