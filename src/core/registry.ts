import type { AdapterDescriptor } from "../contracts.js";
import type { ExpressionAdapter } from "./adapter.js";
import { SeiError } from "./errors.js";

function deepFreeze<T>(value: T, seen = new WeakSet<object>()): T {
  if (typeof value !== "object" || value === null || seen.has(value)) return value;
  seen.add(value);
  for (const key of Reflect.ownKeys(value)) {
    deepFreeze((value as Record<PropertyKey, unknown>)[key], seen);
  }
  return Object.freeze(value);
}

function assertUniqueNonEmpty(values: readonly string[], label: string): void {
  if (values.length === 0 || values.some((value) => value.length === 0)) {
    throw new SeiError("E_ADAPTER_INVALID", `${label} must contain non-empty values.`);
  }
  if (new Set(values).size !== values.length) {
    throw new SeiError("E_ADAPTER_INVALID", `${label} must not contain duplicates.`);
  }
}

function validateDeclaredFields(
  required: readonly string[],
  properties: Record<string, unknown>,
  label: string,
): void {
  if (new Set(required).size !== required.length) {
    throw new SeiError("E_ADAPTER_INVALID", `${label} required fields must not contain duplicates.`);
  }
  if (required.some((name) => !Object.hasOwn(properties, name))) {
    throw new SeiError("E_ADAPTER_INVALID", `${label} requires a field it does not declare.`);
  }
}

function validateDescriptor(adapter: ExpressionAdapter, descriptor: AdapterDescriptor): void {
  if (!/^[a-z][a-z0-9_]*$/.test(descriptor.kind)) {
    throw new SeiError(
      "E_ADAPTER_INVALID",
      "Adapter kind must use lower_snake_case and begin with a letter.",
    );
  }
  assertUniqueNonEmpty(descriptor.dialects, "Adapter dialects");
  assertUniqueNonEmpty(descriptor.capabilities, "Adapter capabilities");
  if (
    descriptor.default_dialect !== undefined &&
    !descriptor.dialects.includes(descriptor.default_dialect)
  ) {
    throw new SeiError("E_ADAPTER_INVALID", "Adapter default_dialect must be declared in dialects.");
  }
  if (!descriptor.capabilities.includes("interpret")) {
    throw new SeiError("E_ADAPTER_INVALID", "Every adapter must declare the interpret capability.");
  }
  for (const [name, value] of Object.entries({
    title: descriptor.title,
    summary: descriptor.summary,
    spec: descriptor.provenance.spec,
    engine: descriptor.provenance.engine,
    engine_version: descriptor.provenance.engine_version,
    compatibility_mode: descriptor.provenance.compatibility_mode,
  })) {
    if (value.length === 0) {
      throw new SeiError("E_ADAPTER_INVALID", `Adapter ${name} must not be empty.`);
    }
  }
  if (descriptor.context_contract !== undefined) {
    validateDeclaredFields(
      descriptor.context_contract.required,
      descriptor.context_contract.properties,
      "Adapter context contract",
    );
  }

  const queryNames = (descriptor.query_contracts ?? []).map((contract) => contract.name);
  const deriveNames = (descriptor.derive_contracts ?? []).map((contract) => contract.name);
  if (queryNames.length > 0) assertUniqueNonEmpty(queryNames, "Adapter query contracts");
  if (deriveNames.length > 0) assertUniqueNonEmpty(deriveNames, "Adapter derive contracts");
  for (const contract of descriptor.query_contracts ?? []) {
    validateDeclaredFields(
      contract.arguments.required,
      contract.arguments.properties,
      `Adapter query '${contract.name}' arguments`,
    );
  }
  const expectedDynamicCapabilities = new Set([
    ...queryNames.map((name) => `query.${name}`),
    ...deriveNames.map((name) => `derive.${name}`),
  ]);
  const declaredDynamicCapabilities = descriptor.capabilities.filter(
    (name) => name.startsWith("query.") || name.startsWith("derive."),
  );
  if (
    declaredDynamicCapabilities.some((name) => !expectedDynamicCapabilities.has(name)) ||
    [...expectedDynamicCapabilities].some((name) => !descriptor.capabilities.includes(name))
  ) {
    throw new SeiError(
      "E_ADAPTER_INVALID",
      "Adapter query and derive capabilities must exactly match their descriptor contracts.",
    );
  }
  if ((queryNames.length > 0) !== (adapter.query !== undefined)) {
    throw new SeiError(
      "E_ADAPTER_INVALID",
      "Adapter query implementation and query contracts must either both exist or both be absent.",
    );
  }
  const conversionDeclared = descriptor.capabilities.includes("convert");
  if (
    conversionDeclared !== (descriptor.conversion_contract !== undefined) ||
    conversionDeclared !== (adapter.convert !== undefined)
  ) {
    throw new SeiError(
      "E_ADAPTER_INVALID",
      "Adapter conversion capability, contract, and implementation must agree.",
    );
  }
  if (descriptor.conversion_contract !== undefined) {
    const contract = descriptor.conversion_contract;
    assertUniqueNonEmpty(contract.target_dialects, "Adapter conversion target dialects");
    assertUniqueNonEmpty(
      contract.target_representations,
      "Adapter conversion target representations",
    );
    validateDeclaredFields(
      contract.arguments.required,
      contract.arguments.properties,
      "Adapter conversion arguments",
    );
    if (
      contract.target_representations.some(
        (target) => !Object.hasOwn(contract.result_schemas, target),
      )
    ) {
      throw new SeiError(
        "E_ADAPTER_INVALID",
        "Every conversion target representation must declare a result schema.",
      );
    }
  }
  const contextFields = new Set(Object.keys(descriptor.context_contract?.properties ?? {}));
  for (const contract of [
    ...(descriptor.query_contracts ?? []),
    ...(descriptor.derive_contracts ?? []),
  ]) {
    if ((contract.required_context ?? []).some((name) => !contextFields.has(name))) {
      throw new SeiError(
        "E_ADAPTER_INVALID",
        `Adapter contract '${contract.name}' requires an undeclared context field.`,
      );
    }
  }
}

export class ExpressionRegistry {
  readonly #adapters = new Map<string, ExpressionAdapter>();
  readonly #descriptors = new Map<string, AdapterDescriptor>();
  #sealed = false;

  register(adapter: ExpressionAdapter): this {
    if (this.#sealed) {
      throw new SeiError("E_REGISTRY_SEALED", "This expression registry is sealed.");
    }
    const candidate = adapter.descriptor;
    validateDescriptor(adapter, candidate);
    const { kind } = candidate;
    if (this.#adapters.has(kind)) {
      throw new SeiError("E_ADAPTER_DUPLICATE", `Adapter kind '${kind}' is already registered.`);
    }
    const descriptor = deepFreeze(candidate);
    this.#adapters.set(kind, adapter);
    this.#descriptors.set(kind, descriptor);
    return this;
  }

  seal(): this {
    this.#sealed = true;
    return this;
  }

  get sealed(): boolean {
    return this.#sealed;
  }

  get(kind: string): ExpressionAdapter | undefined {
    return this.#adapters.get(kind);
  }

  require(kind: string): ExpressionAdapter {
    const adapter = this.get(kind);
    if (adapter === undefined) {
      throw new SeiError("E_KIND_UNKNOWN", `Unsupported expression kind '${kind}'.`, {
        expected: { kinds: this.list().map((descriptor) => descriptor.kind) },
      });
    }
    return adapter;
  }

  list(): AdapterDescriptor[] {
    return [...this.#descriptors.values()]
      .sort((left, right) => left.kind < right.kind ? -1 : left.kind > right.kind ? 1 : 0);
  }

  describe(kind: string): AdapterDescriptor {
    this.require(kind);
    return this.#descriptors.get(kind) as AdapterDescriptor;
  }

  adapters(): ExpressionAdapter[] {
    return [...this.#adapters.values()];
  }
}
