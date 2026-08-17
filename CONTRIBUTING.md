# Contributing to Equatorium

Equatorium is a deterministic Standard Expression Interpreter for Agents. Contributions should preserve the shared semantic core instead of adding transport-specific interpretation paths.

## Development

Requires Node.js 22 or newer.

```bash
npm ci
npm run check
```

`npm run check` is the required development-regression gate. It verifies types, all tests, generated-schema parity, source safety, the distributable build, MCP behavior, plugin structure, and an isolated plugin runtime.

## Adapter changes

- Reuse a mature parser when a maintained engine already owns the grammar.
- Put dialect and context rules in the adapter contract; never silently guess them.
- Preserve exact values as strings when JavaScript numbers would lose meaning.
- Return structured diagnostics and provenance through the existing SEI result envelope.
- Add negative regressions for invalid syntax, limits, ambiguity, and any fixed failure branch.
- Keep `sei_run` as the complete public MCP tool surface unless a protocol version explicitly changes that contract.

Before proposing a new expression kind, dogfood it against concrete Agent tasks and document the unmet task that the adapter resolves.

## Contribution license

Unless explicitly stated otherwise, contributions submitted for inclusion in
Equatorium are licensed under the Apache License 2.0, consistent with the
repository's [LICENSE](LICENSE).
