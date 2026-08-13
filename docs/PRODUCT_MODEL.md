# SEI v0.1 product model

## Users and tasks

- A developer uses the CLI to inspect, validate, normalize, and query a compact standard expression before storing it in configuration.
- An Agent uses the same deterministic core to stop spending model reasoning on specification-dense strings such as cron schedules, npm ranges, CIDRs, URIs, content types, durations, and Unix modes.

## Related flows

- Human flow: expression plus explicit kind and dialect -> structured interpretation -> copy the canonical form or act on a diagnostic.
- Agent flow: one typed request -> stable result envelope -> use typed semantics or a query result in the next workflow step.
- Detection flow: unknown string -> ranked candidates only -> caller chooses the kind; detection never silently resolves ambiguous input.
- Extension flow: adapter descriptor -> registered implementation -> common limits, diagnostics, provenance, and result envelope.

## Reuse inventory

| Kind | Engine | SEI-owned behavior |
| --- | --- | --- |
| cron | `cron-parser` | platform-specific lexical gate, five-field dialects, explicit time context, typed fields |
| semver range | `semver` | npm dialect, comparator IR, query contract |
| CIDR | `ipaddr.js` | strict four-octet IPv4 front door shared by expressions and queries, canonical network, address-count strings |
| URI | RFC 3986 lexical/component gate plus `uri-js` | strict absolute/reference validation before normalization, component IR |
| content type | `content-type` | case-insensitive duplicate rejection before parsing, canonical parameter ordering, media-type IR |
| ISO duration | `iso8601-duration` plus exact lexical wrapper | strict supported grammar, unrounded decimal-string components, canonical component form |
| Unix permission | local bounded parser | octal/symbolic equivalence and permission query |

No human UI, MCP transport, RRULE, regex, glob, or general-purpose expression language is part of v0.1. Those require a validated core contract or additional safety/context work.

## Shared deterministic core

`ExpressionRegistry` owns adapter registration and discovery, including exact input and output schemas. Those contracts generate both the request schema and a result tagged union, while public TypeScript types expose the same current domain shapes. The in-process `interpret()` owns deterministic validation and dispatch for trusted callers. `interpretBounded()` adds worker isolation, V8 memory ceilings, and hard termination; the Agent-facing CLI always uses this bounded route. CLI and future MCP/UI surfaces remain transports around one semantic core.

## Agent route budget

- Known supported expression: one `interpret` request with explicit `kind` and `dialect`.
- Semantic query: one `query` request when the kind is known.
- Unknown input: one `detect` request, then one interpretation after the caller makes any required choice.
- Invalid input: one stable failure; no speculative retries or silent repair.

The weakest intended Agent only needs to supply JSON, choose a listed kind/dialect, and inspect `ok`, `diagnostics`, `normalized`, and `query_result`.
