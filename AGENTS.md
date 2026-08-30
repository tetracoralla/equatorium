# Equatorium repository contract

Read `docs/PRODUCT_MODEL.md`, `docs/CONTRACT.md`, `docs/ADAPTER_SPEC.md`,
`docs/REVIEW_CONTRACT.md`, and `capabilities/README.md` before changing the
product, registry, schemas, plugin, or capability adapter.

A plain owner request to review, audit, 审核, or 复核 automatically invokes the
complete review contract in read-only mode unless fixes are also requested.
Treat it as the minimum scope, not a ceiling, and finish with `tools-dev
workspace escalations` for shared contracts, installation, or resource risks;
do not ask the owner to supply a separate checklist.

- Use `build-agent-native-utilities` as the owning method for Equatorium. Use
  `build-capability-contracts` only for the canonical Profile, provider
  manifest/adapter, conformance, or a substitution claim.
- Keep the sealed live registry as the semantic source for CLI, MCP, UI,
  published schemas, runtime validation, and generated contracts. A transport
  projection must not become a second semantic model.
- Reuse mature parsers and retain strict lexical gates, explicit dialect and
  time context, typed diagnostics, bounded complete results, terminable worker
  execution, and request/result correlation.
- The active standard-expression Profile is
  `org.openadam.standard-expression.run@0.2.0`; `0.1.0` is retained with its
  original carrier-polluted error boundary. The active Profile is
  provider-seeded experimental. It
  excludes provider execution limits, carrier versions, UI, registry discovery,
  and engine/runtime identity; do not claim cross-provider substitution.
- Keep the human UI to the current understand-and-copy task. Agent schemas,
  query/conversion controls, limits, engines, and protocol details stay behind
  the human surface.
- Keep persistent human-facing copy task-essential. Label required input,
  actions, real results, current errors, and choices; do not add product
  self-description, duplicate instructions, empty-state narration, or
  non-actionable implementation assurances without a current requirement or
  observed usability need. Hide an empty result region instead of explaining
  that a result will appear there.
- Report development regression, installed Agent flow, human UI flow, and owner
  experience acceptance separately.
- Preserve the complete current dirty worktree. Do not commit, push, publish,
  or discard existing changes unless the owner explicitly asks.
