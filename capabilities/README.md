# Capability provider boundary

Equatorium implements the experimental
`org.openadam.standard-expression.run@0.2.0` Capability Profile. The central
catalog retains `0.1.0` as a superseded identity; active conformance uses
`0.2.0`, whose stable semantic error list excludes carrier and provider faults.

- `schemas/` contains the canonical capability projection: request-level execution limits, result carrier version, and provider engine/runtime identities are excluded;
- the complete provider product schemas remain generated from the live registry in `../schemas/`;
- the MCP transport intentionally advertises a smaller host-compatible input projection while the semantic core enforces the complete registry-derived contract;
- `provider.json` v0.3 binds the complete resolved Profile, canonical schemas,
  semantics-derived annotations, adapter operation, and current live MCP
  input-schema digest;
- `node --import tsx scripts/exportCapabilityProvider.mjs --check` rejects registry, published-schema, MCP-projection, or manifest drift;
- the JSONL adapter invokes the packaged MCP runtime, so shared conformance cases exercise the provider boundary rather than a duplicate interpreter.

The adapter translates the richer provider result into the canonical profile while retaining semantic `spec`, `compatibility_mode`, and time-zone data context. The standard repository does not own Equatorium's adapter registry, parser implementations, execution limits, UI, or release lifecycle.
