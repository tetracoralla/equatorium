# Capability provider boundary

Equatorium implements `org.openadam.standard-expression.run@0.1.0` for the neutral Agent Capability Substrate.

- `schemas/` contains the canonical capability projection: request-level execution limits, result carrier version, and provider engine/runtime identities are excluded;
- the complete provider product schemas remain generated from the live registry in `../schemas/`;
- the MCP transport intentionally advertises a smaller host-compatible input projection while the semantic core enforces the complete registry-derived contract;
- `provider.json` records both the canonical profile digests and the current live MCP input-schema digest;
- `node --import tsx scripts/exportCapabilityProvider.mjs --check` rejects registry, published-schema, MCP-projection, or manifest drift;
- the JSONL adapter invokes the packaged MCP runtime, so shared conformance cases exercise the provider boundary rather than a duplicate interpreter.

The adapter translates the richer provider result into the canonical profile while retaining semantic `spec`, `compatibility_mode`, and time-zone data context. The standard repository does not own Equatorium's adapter registry, parser implementations, execution limits, UI, or release lifecycle.
