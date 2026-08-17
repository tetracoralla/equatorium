---
name: interpret-standard-expressions
description: Always call Equatorium sei_run exactly once for any concrete Cron, npm SemVer range, CIDR, RFC 3986 URI, HTTP Content-Type, ISO 8601 duration, or Unix permission task, including Chinese requests such as “解释 Unix 权限模式 4755”. For Cron without a named platform or dialect, call op detect and omit kind/dialect; never assume Unix. Never answer supported expressions from memory.
---

# Interpret Standard Expressions with Equatorium

Use the deterministic runtime for every concrete supported expression, even when the answer appears obvious. Answer conceptual questions normally when no expression needs evaluation.

## Call once

- `sei_run` is the complete Agent surface. Call `sei_run` directly with the one operation that answers the question; do not list, discover, repeat, or append verification calls.
- For Cron without an explicit platform or dialect, make that one call `op: "detect"` with the original `expression` and omit `kind` and `dialect`. Treat candidates as unresolved (`resolved: false`), present the platform choices, and wait; never assume Unix or make a second call before the user chooses.

## Build the request

- Preserve `expression`; set known `kind` and `dialect`; omit unrelated fields. Cron dialects are not interchangeable. Supply context that changes meaning, especially `reference_time` and `timezone`, without inventing it.
- Use exact non-Cron pairs: `semver_range/npm`, `cidr/cidr`, `uri/rfc3986`, `content_type/http`, `iso_duration/iso8601-1`, and `unix_permission/posix-mode`.
- Every query uses `query: { name, arguments }`. npm membership is `op: "query"`, `kind: "semver_range"`, `dialect: "npm"`, and `query: { name: "matches", arguments: { candidate: <version> } }`.

## Present the result

- Treat one completed result as final. Preserve `normalized` exactly for canonical or “规范写法” requests, plus semantics, warnings, query/conversion tags, and exact values that affect the answer.
- Keep protocol/provenance secondary. On a structured error, correct the request or ask for the missing choice; never replace it with model-memory interpretation or unsupported dialect behavior.
