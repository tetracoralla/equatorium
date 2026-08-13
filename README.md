# Standard Expression Interpreter

SEI converts specification-dense micro-languages from opaque strings into typed, deterministic JSON. The v0.1 core supports:

- five-field Unix and GitHub Actions cron;
- npm semantic-version ranges;
- IPv4 and IPv6 CIDR;
- absolute RFC 3986 URIs;
- HTTP Content-Type values;
- ISO 8601 durations in the declared strict subset;
- octal and symbolic Unix permission modes.

SEI owns the registry, request/result envelope, limits, diagnostics, canonicalization policy, capability discovery, and Agent-facing CLI. Mature packages own the domain parsing wherever an appropriate engine exists.

## Run

```bash
npm install
npm run check
```

Use JSON over stdin for the stable Agent path:

```bash
printf '%s' '{"op":"query","kind":"semver_range","expression":"^3.2.0","query":{"name":"matches","arguments":{"candidate":"3.7.4"}}}' | npm start
```

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
- Absolute URI expressions and URI query operands share a strict RFC 3986 lexical/component validator. Spaces, malformed IP literals, and invalid percent escapes are errors rather than implicit repairs.
- Request bytes, request nesting/collection/string shape, generated output items, response bytes/shape, and execution time are bounded beneath published hard ceilings.
- Successful query and conversion envelopes carry `query_name` or `conversion_target`, so the published result schema and TypeScript union discriminate exact output shapes.
- The Agent-facing CLI executes each request in a terminable worker with old-generation, young-generation, code-range, and stack ceilings. The parent validates the complete tagged-union result, correlates it with the original operation/input/kind/query or conversion tag, and reapplies the request's actual response-byte ceiling. CLI batches have one cumulative request, response, item, and execution-time budget in addition to per-request ceilings.
- Four-digit Unix modes such as `4755` remain ambiguous with integers during detection, but are now surfaced as supported `unix_permission` candidates instead of being missed.
- CLI batches are independent, ordered, and retain per-item failures.

See [the result contract](docs/CONTRACT.md), [adapter specification](docs/ADAPTER_SPEC.md), and [product model](docs/PRODUCT_MODEL.md).
