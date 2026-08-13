# SEI adapter specification v0.1

An adapter registers one `kind` and implements a deterministic interpretation boundary. It must provide:

1. a descriptor with unique kind, supported dialects, optional default dialect, actual capabilities, exact context/interpretation/query/derive/conversion input and output contracts, and runtime provenance;
2. `interpret(input)` returning a normalized expression, JSON value, optional semantics/derived values/diagnostics, and optional private state;
3. `detect(expression)` returning either one ranked candidate or `null` without selecting the final kind;
4. optional `query` and `convert` functions only when declared by capabilities.

The shared core validates kind, dialect, structural and byte limits, operation-specific fields, descriptor-owned context and argument schemas, deadlines, and result envelopes. Registration rejects capability/contract/implementation disagreement, registered descriptors are deeply immutable, and the shared default registry is sealed after construction. Adapters own domain parsing and domain-specific diagnostics. Private state can hold engine objects but must never appear in JSON output. Generated request and tagged-union result schemas are derived from the same descriptor contracts.

## Invariants

- Never evaluate the expression as host-language source.
- Prefer a maintained domain engine. A local parser needs a small, bounded grammar and a concrete reason, as with POSIX mode bits.
- Parse in the declared dialect; do not guess another dialect after failure.
- Normalize only valid input and preserve meaning.
- Apply the same strict grammar to an expression and to every equivalent query operand; do not let a reused engine coerce alternate spellings on one path.
- Keep integers and decimals as exact lexical values whenever conversion to a JSON number could round, overflow, or become non-finite.
- Reject duplicate or otherwise ambiguous source fields before a library parser can collapse them.
- Require explicit context when a result otherwise depends on wall-clock time, timezone, locale, filesystem, network, or process state.
- Bound every generated collection by `limits.max_output_items`.
- Treat request size, nesting, collection width, string length, response size, and execution time as cumulative core boundaries, not only expression-local checks.
- Return structured facts; human description is a derived view, not the source of meaning.
- Translate library exceptions into stable domain diagnostics.
- Treat the worker response as untrusted: validate the complete result union, reapply the active response limit, and reject any response correlated to a different request.
- Treat ordinary JavaScript object prototype names as unknown fields unless the contract owns them explicitly; schema lookup must use own-property checks.
- Add negative regression coverage for invalid syntax, ambiguity, and every guard.

## Extension checklist

An extension is ready to register only when it has conformance cases for success, invalid input, normalization idempotence, its riskiest semantic boundary, query limits, strict query-operand equivalence, schema/runtime agreement, and detection ambiguity. Adding a descriptor without the runtime adapter and tests is not support.
