# Equatorium v0.1 product model

Equatorium is the product identity. SEI v1 is its stable Standard Expression Interpreter protocol: `sei_run` and `sei.*` schema names remain compatible even as product-facing surfaces use Equatorium.

## Users and tasks

- A developer uses the CLI to inspect, validate, normalize, and query a compact standard expression before storing it in configuration.
- A human user uses a small local web interface only to understand an expression and copy its canonical form.
- An Agent uses the same deterministic core to stop spending model reasoning on specification-dense strings such as cron schedules, npm ranges, CIDRs, URIs, content types, durations, and Unix modes.

## Related flows

- Human flow: one expression -> automatic candidate detection -> direct interpretation when unique, or one plain-language choice when genuinely ambiguous -> copy the canonical form or act on a diagnostic.
- Agent flow: one typed request -> stable result envelope -> use typed semantics or a query result in the next workflow step.
- Detection flow: unknown string -> ranked candidates only -> caller chooses the kind; detection never silently resolves ambiguous input.
- Extension flow: adapter descriptor -> registered implementation -> common limits, diagnostics, provenance, and result envelope.

## Reuse inventory

| Kind | Engine | SEI-owned behavior |
| --- | --- | --- |
| cron | `cron-parser` | platform-specific lexical gate, five-field dialects, explicit time context, typed fields |
| semver range | `semver` | npm dialect, comparator IR, query contract |
| CIDR | `ipaddr.js` | strict four-octet IPv4 front door shared by expressions and queries, canonical network, address-count strings |
| URI | RFC 3986 lexical/component gate plus `uri-js` | strict scheme-qualified/reference validation before normalization, component IR |
| content type | `content-type` | case-insensitive duplicate rejection before parsing, canonical parameter ordering, media-type IR |
| ISO duration | `iso8601-duration` plus exact lexical wrapper | strict supported grammar, unrounded decimal-string components, canonical component form |
| Unix permission | local bounded parser | octal/symbolic equivalence and permission query |

RRULE, regex, glob, and a general-purpose expression language are not part of v0.1. The Agent-facing addition remains a thin stdio MCP transport plus one concise Skill; neither owns semantics or a parallel request shape.

## Human interface contract

The v0.1 interface is a single local page for the expression currently being examined. Its default operation is intentionally only “interpret this expression”. It calls `detect` first, automatically interprets a unique supported candidate, and discloses a small plain-language chooser only when detection remains ambiguous. Kind, dialect, context, query, conversion, and limit controls stay in the CLI and MCP surfaces instead of becoming human-facing form fields.

The complete surface contains one expression field, one action, compact examples, the current result, and copy where a canonical form exists. Before a request produces a current result, the result region is absent rather than narrating its empty state. It does not expose Agent verification, raw protocol output, query, conversion, registry, engine, or limit controls. The interface has no account, history, persistence, mutation, remote request, or independent parsing path.

Persistent visible copy is admitted only when it labels required input, action, or output; presents a current actionable state, error, or choice; or communicates a safety, legal, or privacy fact that changes the user's current decision. Product self-description, duplicate instructions, obvious empty-state narration, and non-actionable implementation assurances are not default UI. New teaching copy needs an explicit product requirement, an observed usability failure, or a safety/accessibility obligation; otherwise the initial surface stays silent.

## Shared deterministic core

`ExpressionRegistry` owns adapter registration and discovery, including exact input and output schemas. Those contracts generate the complete published request schema, a host-compatible flat Agent projection, and a result tagged union, while public TypeScript types expose the same current domain shapes. The flat projection avoids conditional-schema degradation in Agent hosts; it does not replace the operation-specific core validation. The in-process `interpret()` owns deterministic validation and dispatch for trusted callers. `interpretBounded()` adds worker isolation, V8 memory ceilings, and hard termination; CLI, MCP, and the local UI server all use this bounded route. The single `sei_run` tool carries the full Agent request schema; CLI discovery and the UI's automatic detection read the same sealed registry. Every surface remains a transport around one semantic core.

## Agent route budget

- Known supported expression: one `interpret` request with explicit `kind` and `dialect`.
- Semantic query: one `query` request when the kind is known.
- Unknown input: one `detect` request, then one interpretation after the caller makes any required choice.
- Invalid input: one stable failure; no speculative retries or silent repair.

The weakest intended Agent only needs to supply JSON, choose a listed kind/dialect, and inspect `ok`, `diagnostics`, `normalized`, and `query_result`.
