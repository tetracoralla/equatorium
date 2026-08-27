# Equatorium review contract

This contract tells a reviewer what must be re-established from the current
source and runtime before Equatorium may be called correct, Agent-friendly,
bounded, or release-ready. It is deliberately specific to Equatorium's eight
standard-expression adapters and SEI v1 carriers. It is not a generic tool
review checklist.

## 1. Claims and evidence lanes

Report these lanes separately. A green result in one lane does not promote the
others.

1. **Development regression** — types, tests, generated schemas, safety
   checks, build, local Capability projection, Agent surface, and fresh-package
   install. The reviewer may report PASS, FAIL, or BLOCKED.
2. **Installed Agent runtime** — the actually installed plugin/MCP runtime is
   discovered and called through its host, including invalid input and restart
   behavior. Source tests and a packaged child process are not this evidence.
3. **Human runtime** — the local web UI is exercised in a real browser through
   detect, unique interpretation, ambiguity choice, correction after failure,
   copy, repeated requests, and reload. DOM tests alone are not this evidence.
4. **Capability conformance** — a named current Capability Profile and runner
   exercise the provider adapter. Digest agreement is not behavioral
   conformance.
5. **Distribution** — a fresh consumer installs the built package and its CLI,
   MCP, UI, schemas, notices, and library exports work without repository-only
   files.
6. **Business and experience acceptance** — the owner decides whether the
   supported languages, meanings, and human task are valuable and clear.

The canonical development command is:

```sh
npm run check
```

It is a broad development veto, not installed-host, live-browser, Capability,
or owner acceptance.

## 2. Owning model and carrier equivalence

The sealed `ExpressionRegistry` and registered adapter descriptors own the
current semantic surface. Review any change across this complete path:

```text
adapter descriptor and implementation
  -> public TypeScript request/result types
  -> generated complete request and tagged-result schemas
  -> host-compatible flat Agent schema
  -> runtime request/result validation
  -> bounded worker protocol
  -> CLI, MCP, UI, and library carriers
  -> plugin Skill and examples
  -> provider-local Capability schemas and manifest
```

For every added kind, dialect, operation, query, conversion, context field,
limit, result field, or diagnostic:

- find each projection above and compare it to the live registry;
- regenerate only with the owning generator, then inspect the diff;
- reject a hand-maintained carrier that admits values the registry rejects or
  loses values the registry returns;
- verify the complete result remains a tagged union by operation and kind;
  queries must also be discriminated by `query_name`, and conversions by
  `conversion_target`;
- confirm the MCP's flatter schema remains only a host compatibility
  projection and does not weaken runtime operation-specific validation;
- run at least one success and one failure through the library, CLI, real MCP
  stdio process, and any affected UI path, then compare meaning rather than
  merely checking that all carriers returned JSON.

`detect` is a separate operation, not an implicit mode of `interpret`. Its
request surface is restricted to detection-owned fields. Ambiguous detection
must return candidates with `resolved: false`; no carrier may silently select a
kind or dialect.

## 3. Request closure and deterministic context

SEI v1 accepts exactly `interpret`, `validate`, `normalize`, `query`,
`convert`, and `detect`.

- `op` and `expression` are always required.
- `kind` is required except for `detect`.
- Cron requires an explicit dialect; no carrier may infer one from syntax.
- Context, query, conversion, and derive fields are accepted only when the
  selected descriptor declares them, with unknown fields rejected.
- Time-relative output requires an explicit supported RFC 3339 reference time.
- The default time zone is UTC. A scheduler-local IANA zone must be supplied
  explicitly.
- GitHub Actions occurrence and match queries remain UTC-only. Do not claim a
  non-UTC DST policy that the engine does not reproduce.
- Replaying the same complete request under the same engine and runtime data
  must produce the same public result bytes except for explicitly documented
  runtime provenance.

The private worker correlation digest covers the complete original JSON
request, including context, derivations, query/conversion arguments, and
limits. The parent must reject a missing, stale, malformed, or mismatched
envelope and must never accept a result solely because its `operation` and
`input` look plausible.

## 4. Normalization, exactness, and stable failures

For each supported adapter, prove on representative and boundary values that:

```text
normalize(normalize(x)) = normalize(x)
meaning(normalize(x)) = meaning(x)
```

Normalization must not silently repair invalid input. Numeric-looking tokens
must retain their contractual precision:

- ISO duration components remain exact decimal strings;
- CIDR address counts remain integer strings;
- explicit timestamps are real calendar values with required offsets;
- Unix special bits survive numeric/symbolic round trips;
- SemVer query candidates that are invalid are errors, not a `false` match.

Public failures use the stable diagnostic codes in `docs/CONTRACT.md`. For
every core code, maintain at least one reachable negative regression on the
carrier where it matters. Domain codes must retain their domain prefix.

Review error output for all of the following:

- no stack, filesystem path, worker internals, unbounded engine message, or
  input echo;
- a stable `ok: false` result rather than a process crash or transport hang;
- request/response and structural limits still apply to failure paths;
- an unexpected adapter exception narrows to the documented bounded runtime
  diagnostic without creating a new transport-specific error vocabulary.

## 5. Adapter-specific adversarial matrix

A whole-repository green test count is insufficient. Re-run or add focused
cases for the adapter that changed.

### Cron

- all declared five-field dialects and their exact lexical operators;
- names, ranges, steps, Sunday `0`/`7`, and rejection of Quartz-only syntax;
- the GitHub Actions five-minute floor both within a day and across midnight;
- explicit reference time, offset syntax, UTC default, and IANA-zone context;
- DST repeat/gap cases for supported occurrence queries;
- provenance for parser, Node, ICU, and timezone data when it affects replay.

### npm SemVer range

- prerelease inclusion/exclusion, empty/wildcard ranges, unions, hyphen ranges,
  caret/tilde boundaries, and normalization stability;
- exact npm dialect behavior rather than a generic version comparator;
- malformed range and malformed query candidate as distinct typed failures.

### CIDR

- IPv4 requires exactly four decimal octets and rejects integer shorthand,
  leading-zero coercion, out-of-range octets, and trailing material;
- IPv6 compression, embedded IPv4, prefix extremes, canonical network, host
  membership, and exact address-count strings;
- query operands pass through the same strict lexical front door as the
  expression.

### RFC 3986 URI

- absolute and reference forms only where the declared operation permits them;
- authority, user information, port, path, query, fragment, percent escapes,
  dot segments, empty components, and non-ASCII policy;
- normalization does not change meaning or grant `uri-js` a more permissive
  syntax than Equatorium's lexical gate;
- URI query operands use the identical strict route.

### HTTP Content-Type

- media type/subtype token grammar, quoted values and escapes, whitespace,
  parameter canonical ordering, and case behavior;
- duplicate parameter names are rejected case-insensitively before the reused
  parser may collapse them.

### ISO 8601 duration

- supported date/time component combinations, weeks policy, sign policy,
  decimal location and precision, zero values, and unsupported grammar;
- decimals survive as strings without binary rounding or hidden unit
  conversion.

### RFC 5545 RRULE

- exactly one explicit `RRULE:` property; reject multiline ICS, `DTSTART`,
  `RDATE`, `EXDATE`, `VEVENT`, unknown fields, repeated fields, and duplicate
  list values before the reused parser may collapse information;
- exact numeric ranges, cumulative `BY*` list limits, `COUNT`/`UNTIL`
  exclusivity, `BYSETPOS` dependencies, and frequency-specific `BY*`
  combinations;
- only the declared UTC DATE-TIME `UNTIL` subset from year 0100 onward, with
  real calendar-value validation; no ambient time, timezone, locale, or process
  state;
- normalization idempotence and structural boundedness for count-, until-, and
  unbounded rules;
- no occurrence expansion, horizon, DST policy, calendar container, or
  schedule-algebra operation on any carrier.

### Unix permission

- three- and four-digit octal forms, symbolic rendering, setuid, setgid, and
  sticky bits;
- numeric/symbolic equivalence, permission queries, invalid characters,
  missing triplets, and out-of-range values.

## 6. Isolation, bounds, cancellation, and recovery

All untrusted CLI, MCP, and UI semantic requests must use
`interpretBounded()`. A direct in-process shortcut is allowed only for trusted
library callers that consciously accept its different isolation boundary.

Current hard per-request ceilings are part of the product contract and must be
verified from current source rather than copied from an old review:

- expression: 8,192 characters;
- output items: 100;
- serialized request: 32,768 bytes;
- serialized response: 65,536 bytes;
- request depth: 12;
- request collection entries: 256;
- request string length: 8,192;
- execution: 1,000 ms.

Callers may lower these ceilings but never raise them. Result-structure limits
also apply before accepting a worker reply. The CLI batch has separate
cumulative limits: at most 50 requests, 262,144 input bytes, 1 MiB response,
5,000 output items, and 5 seconds total.

The current worker pool admits four active workers and queues at most 32.
Queue time consumes the same deadline. Review these compositions, not only
their individual guards:

- 36 accepted slow requests followed by one rejected request;
- timeout while queued, timeout while executing, and timeout at the boundary;
- malformed worker reply, wrong digest, wrong reflected field, unexpected
  exit, and memory exhaustion;
- repeated timeouts or crashes followed immediately by a valid request;
- caller/transport termination while a worker is active;
- a batch that succeeds early and exhausts a cumulative budget later;
- maximum-size failure diagnostics under the response ceiling.

After every failure storm, assert bounded worker count, queue depth, RSS,
threads, file descriptors, child processes, and latency recovery. A stable
error code without resource recovery is a FAIL.

## 7. Batch and high-frequency economics

Batch behavior is currently a CLI/library concern; the single `sei_run` MCP
tool accepts one semantic request. Do not add a second MCP batch model by
wrapping requests locally. If MCP batching is later productized, define a
shared core contract first, including partial failure, ordering, cumulative
budgets, cancellation, and item count.

For performance-sensitive changes, publish the command, machine/runtime,
fixture mix, sample count, concurrency, warm-up, and before/after results.
Measure at least:

- cold process plus first bounded request;
- warm serial 1,000-request mixed-adapter run with p50/p95/p99;
- four-way steady state and a burst that fills the queue;
- invalid-input and timeout storms followed by recovery;
- maximum legal request and response shapes;
- CLI batch versus equivalent individual calls;
- MCP startup, `tools/list` bytes, request/response bytes, and one direct call.

Count worker creation, parsing, schema validation, serialization, and repeated
semantic work separately. Do not trade isolation or exactness for a small
constant-factor improvement. A performance claim without a reproducible
before/after or without tail latency and resource residue is UNKNOWN.

## 8. Agent surface and routing

Equatorium exposes one direct tool, `sei_run`. A known supported expression
should take one call; a semantic query should take one call; unknown input may
take detect plus one chosen interpretation. Review that:

- the tool description and flat schema are enough to select the operation,
  kind, and dialect without discovery chatter;
- no normal request requires the Agent to call a hidden registry or preflight
  tool first;
- all complete runtime constraints remain enforced behind the flat schema;
- unsupported ICS, RRULE occurrence expansion, regex, glob, and general expression requests fail
  honestly rather than being approximated;
- the Skill examples use current field names, supported dialects, explicit
  time context, typed outputs, and stable errors;
- the complete `tools/list` payload and plugin instructions stay within the
  actual host budget, measured from the current runtime.

Installed routing must be tested separately by asking the host to handle a
known expression naturally, verifying it chose Equatorium, and then calling
one invalid request. A direct source-level MCP client does not prove host
routing or installed-plugin parity.

## 9. Human UI

The human surface owns only understand-and-copy. It contains one expression
field, one action, compact examples, a current result, copy when a canonical
form exists, and a small chooser only for real ambiguity.

Review in a real browser at narrow and normal widths with keyboard and pointer:

- empty result region is absent rather than narrated;
- unique detection proceeds directly and ambiguity never auto-selects;
- a new request clears or visibly supersedes stale output;
- out-of-order completion cannot replace a newer result;
- a failure is actionable and correction succeeds without reload;
- copy copies the current canonical value and reports only its real state;
- focus order, visible focus, labels, errors, chooser, and result semantics are
  accessible;
- no Agent schema, raw protocol, limits, engine identity, registry, query, or
  conversion controls leak into the primary UI;
- rapid submit, slow request, reload, and server termination do not leave a
  false success or busy state.

The UI must display only bounded-core results. Browser-side parsing or meaning
inference is a second semantic implementation and is a FAIL.

## 10. Capability boundary: current honest status

The active provider-seeded experimental projection is
`org.openadam.standard-expression.run@0.2.0`. The central catalog retains
`0.1.0` unchanged because it exposed carrier-validation and generic provider
failures as stable semantic errors. The corrected `0.2.0` Profile has no
stable error codes: expression failures remain typed canonical results, while
malformed JSONL, invalid envelopes, oversized carrier lines, and provider
transport failure terminate the carrier without publishing a semantic error.

The Provider Manifest binds the complete resolved `0.2.0` Profile and the
central maintainer runner executes its current L0 case through the real JSONL
adapter. A fresh PASS supports only one provider's conformance to this
experimental L0 Profile. It does not establish cross-provider substitution,
installed-host availability, broad expression correctness, or performance.

Review the adapter independently for exact envelope closure, identifier types,
bounded streaming input and output, malformed or invalid UTF-8 input, stderr
discipline, timeout/cancellation, child cleanup, exact operation ID, result
narrowing, backpressure, and clean multi-request shutdown. The local
`check:capabilities` command establishes generated-schema and manifest drift
only; central conformance must be rerun separately.

## 11. Rerunnable review sequence

Use current commands and record their exact output; never quote an inherited
green result.

```sh
npm run check
npm run test:agent
```

Then, when the corresponding claim is required:

1. start the built MCP process and independently exercise discovery, one case
   per adapter family, every operation, invalid shape, response limit,
   timeout, queue overflow, crash recovery, and clean shutdown;
2. install the packed artifact in a clean temporary consumer and repeat CLI,
   MCP, UI, schemas, aliases, and library import checks;
3. run the actually installed Codex plugin through natural-language routing;
4. exercise the human UI in a real browser;
5. if and only if a current central Profile exists, run its named conformance
   runner against the JSONL adapter;
6. run the documented performance/load method for any throughput, latency,
   batch, or cost claim.

Finish with a lane table that states PASS, FAIL, BLOCKED, NOT RUN, or NOT
ENROLLED and names the observable each result actually proves. Do not collapse
development checks, installed runtime, browser experience, Capability
conformance, distribution, and owner acceptance into one “done” claim.
