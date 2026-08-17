---
name: interpret-standard-expressions
description: Always call Equatorium sei_run once for any concrete Cron, npm SemVer range, CIDR, RFC 3986 URI, HTTP Content-Type, ISO 8601 duration, or Unix permission evaluation. For Cron without a named platform or dialect, make that one call op detect and never assume Unix. 中文任务同样必须调用，例如“解释 Unix 权限模式 4755”“解释 Content-Type”“解释 URI”“解释 P1DT2H30M”“版本 3.7.4 是否满足 ^3.2.0”。Never answer these from memory.
---

# Interpret Standard Expressions with Equatorium

Use the runtime for every concrete supported standard-expression evaluation, even when the answer appears obvious. Let reasoning translate the user's task into an explicit request; do not spend model reasoning simulating a standards parser.

## Select the tool

- `sei_run` is the complete Equatorium Agent surface. Its input schema already lists every supported kind, dialect, query, context, and conversion.
- Call `sei_run` directly when the kind, desired operation, and any required dialect are known. Do not search for or call a separate discovery tool.
- For a Cron expression with no explicit platform or dialect, call `sei_run` once with only `op: "detect"` and the original `expression`. Do not assume `unix-5`. If the result contains multiple candidates and the user's context does not resolve them, present the choices and ask which platform applies; do not make a second tool call until the user chooses.
- Use `op: "detect"` only for ambiguous bare strings. Treat its candidates as evidence, not a selected interpretation; detection deliberately returns `resolved: false`.
- Treat one completed `sei_run` result as final. Never repeat an identical request or add web research unless the user explicitly asked for external sources.
- Choose the one operation that answers the question. After a successful query or interpretation, do not append normalize, interpret, or “verification” calls.
- Answer conceptual questions normally when no expression needs evaluation.

## Build the request

- Preserve the user's expression exactly in `expression` and choose the narrowest operation: `validate`, `normalize`, `interpret`, `query`, `convert`, or `detect`.
- Supply `kind` and `dialect` explicitly when the surrounding system fixes them. Cron dialects are not interchangeable.
- Omit every field the chosen operation and kind do not require. `derive` is Cron-only; never send it for ISO duration. `query` is query-only and `convert` is convert-only.
- Every query uses `query: { name, arguments }`. For npm range membership, call `sei_run` with `op: "query"`, `kind: "semver_range"`, `dialect: "npm"`, the range in `expression`, and `query: { name: "matches", arguments: { candidate: <version> } }`.
- Supply all context that changes meaning, especially Cron `reference_time` and `timezone`. Do not invent missing context.
- Use the request `limits` only to make an already bounded call smaller. Never present a truncated or failed response as a complete interpretation.

## Present the result

- Preserve returned normalization, semantics, exact string values, warnings, query tags, and conversion targets when they affect the answer.
- When the user asks for a canonical or “规范写法” form, quote `normalized` exactly. “规范写法”就是该字段的原样值，不得删除参数后另给所谓“更推荐写法”。Add separate domain-policy advice only when the user explicitly asks for policy or external standards research.
- Keep provenance and protocol fields secondary unless the user asks for reproducibility details.
- On a structured error, correct the request or ask for the missing semantic choice. Do not fall back to a mental interpretation of the same expression.
- Do not add unsupported dialect behavior. Use the published `sei_run` schema and report a capability gap plainly.
