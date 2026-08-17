# Equatorium

Equatorium is a deterministic Standard Expression Interpreter (SEI): it turns specification-dense micro-languages from opaque strings into typed, replayable JSON. The v0.1 core supports:

- five-field Unix and GitHub Actions cron;
- npm semantic-version ranges;
- IPv4 and IPv6 CIDR;
- RFC 3986 URIs with an explicit scheme, including optional fragments;
- HTTP Content-Type values;
- ISO 8601 durations in the declared strict subset;
- octal and symbolic Unix permission modes.

Equatorium owns the registry, request/result envelope, limits, diagnostics, canonicalization policy, capability discovery, and thin Agent transports. Mature packages own the domain parsing wherever an appropriate engine exists.

The product, package, plugin, and primary executables use the **Equatorium** name. The stable technical protocol remains **SEI v1**, including the `sei_run` MCP tool and `sei.*` schema identifiers. The `sei` and `sei-mcp` executable names remain compatibility aliases.

## Run

```bash
npm install
npm run check
```

For the lightweight human interface:

```bash
npm run start:ui
```

Open `http://127.0.0.1:4319`. The page intentionally has one input and one action: it detects the expression type and interprets it, asking for a plain-language choice only when the input is genuinely ambiguous. Advanced kind, dialect, query, conversion, Agent, protocol, and limit surfaces remain in the CLI and MCP paths. The page uses the same live Registry and `interpretBounded()` path as the Agent tools, but does not expose a second human-only operation.

Use JSON over stdin for the stable Agent path:

```bash
printf '%s' '{"op":"query","kind":"semver_range","expression":"^3.2.0","query":{"name":"matches","arguments":{"candidate":"3.7.4"}}}' | npm start
```

After packaging, the primary executable is `equatorium`; `sei` accepts the same request contract for compatibility.

Or use arguments for local inspection:

```bash
npm start -- interpret \
  --kind cron \
  --dialect unix-5 \
  --expression '0 9 * * 1-5' \
  --timezone Asia/Shanghai \
  --reference-time 2026-08-13T00:00:00Z \
  --derive next_occurrences,human_description \
  --pretty
```

Discover the live adapter catalog:

```bash
npm start -- registry --pretty
npm start -- describe cron --pretty
```

Use the same bounded request contract over MCP:

```bash
npm run build
npm run start:mcp
```

The MCP surface intentionally exposes one read-only tool:

- `sei_run` exposes a host-compatible typed projection generated from the same Registry, then calls `interpretBounded()` for the complete operation-specific validation;

Its schema contains every supported kind, dialect, query, context, and conversion so known tasks do not pay for a separate discovery call. CLI `registry` and `describe` remain available for developer inspection.

The repo-local Codex plugin is built at `plugins/equatorium`. Its bundled runtime includes the isolated
worker, so the plugin does not depend on the repository's `node_modules` after `npm run build`.
The accompanying `interpret-standard-expressions` Skill directs Agents to call `sei_run`
for every concrete supported expression evaluation, including apparently simple SemVer
membership checks, and to use discovery only for a genuine contract ambiguity.

### Install the Codex plugin from a clone

Build the self-contained plugin and add this repository's marketplace:

```bash
npm ci
npm run build
codex plugin marketplace add .
codex plugin marketplace list
```

Restart the ChatGPT desktop app, open the Plugins Directory, choose the **Equatorium** source, and install Equatorium. Test it in a new task. After pulling an update, rebuild, run `codex plugin marketplace upgrade equatorium`, restart the app, and test again. To remove the marketplace source, run `codex plugin marketplace remove equatorium`; installed-plugin removal remains available in the Plugins Directory.

The local marketplace file is `.agents/plugins/marketplace.json`. Public universal-directory distribution is a later release action, not implied by this source checkout.

Every descriptor includes exact input and output schemas for interpretation, queries,
derivations, context, and conversions. Registered descriptors are deeply immutable, and
the shared default registry is sealed after startup. Registry output also publishes the hard per-request,
worker-memory, and cumulative CLI limits. The published request and result schemas are
generated from those same live contracts; schema drift or a mistyped result fails
`npm run check:schemas`.

## Contract rules

- Known expressions should use explicit `kind`; cron also requires an explicit dialect.
- The `github-actions` cron dialect accepts only the platform's documented five-field ranges and `* , - /` operators; Quartz-style `?`, `L`, and `#`, plus day-of-week `7`, are rejected before engine parsing.
- The `unix-5` dialect uses the same bounded five-field operator grammar, permits Sunday as `0` or `7`, and rejects Quartz-only operators instead of silently changing dialects.
- `op` is required. Query, conversion, and derive fields are operation-specific, and unknown arguments are rejected rather than ignored.
- Context is adapter-owned. v0.1 accepts it only for cron; supplying ignored context to another kind is an error.
- Any result derived from time requires an explicit RFC 3339 `context.reference_time` with `Z` or a numeric offset. Calendar values are checked before conversion. GitHub Actions syntax accepts its current IANA timezone field, but v0.1 limits platform occurrence/match queries to UTC because its DST gap policy differs from the reused engine.
- `detect` returns candidates and always leaves `resolved` false. It does not silently choose meaning.
- Invalid input is never repaired during normalization. Repairs belong in diagnostics, not hidden mutation.
- Normalization is idempotent and preserves the adapter's declared semantics.
- ISO duration components are JSON decimal strings so values larger or more precise than IEEE-754 numbers remain exact.
- Week notation cannot be mixed with any other explicitly present duration unit, including zero-valued tokens such as `P0W1D`.
- Strict CIDR input and CIDR query operands share one grammar; IPv4 requires four decimal octets without leading zeros.
- Scheme-qualified URI expressions and URI query operands share a strict RFC 3986 lexical/component validator. Spaces, malformed IP literals, and invalid percent escapes are errors rather than implicit repairs.
- Request bytes, request nesting/collection/string shape, generated output items, response bytes/shape, and execution time are bounded beneath published hard ceilings.
- Successful query and conversion envelopes carry `query_name` or `conversion_target`, so the published result schema and TypeScript union discriminate exact output shapes.
- The Agent-facing CLI executes each request in a terminable worker with old-generation, young-generation, code-range, and stack ceilings. A process-wide pool admits four workers and queues at most 32 more requests; queue wait consumes the original deadline, while excess admission returns `E_RESOURCE_LIMIT`. Every worker reply uses a private versioned envelope carrying a canonical digest of the complete original request, including context, derivations, query/conversion arguments, and limits. The parent verifies that envelope, validates the complete public tagged-union result, checks every reflected request field, strips the private correlation data, and reapplies the request's actual response-byte ceiling. CLI batches have one cumulative request, response, item, and execution-time budget in addition to per-request ceilings.
- Four-digit Unix modes such as `4755` remain ambiguous with integers during detection, but are now surfaced as supported `unix_permission` candidates instead of being missed.
- CLI batches are independent, ordered, and retain per-item failures.
- MCP does not add a second semantic path: its flat host-compatible Schema is mechanically projected from the same Registry contracts, while the worker-bounded core applies the complete conditional request contract. Full results live only in `structuredContent`; the text carrier is a bounded summary.
- Seven Chinese request fixtures exercise all current adapters as deterministic MCP transport-conformance tests. They do not claim to prove model tool selection; installed-plugin cold-start routing must be tested separately in a genuinely new Codex task.

See [the result contract](docs/CONTRACT.md), [adapter specification](docs/ADAPTER_SPEC.md), and [product model](docs/PRODUCT_MODEL.md).
