const providerProvenanceFields = new Set([
  'engine',
  'engine_version',
  'runtime',
  'runtime_version',
  'timezone_engine',
  'icu_version',
])

function clone(value) {
  return structuredClone(value)
}

function removeResultCarrierFields(schema) {
  if (Array.isArray(schema)) {
    for (const item of schema) removeResultCarrierFields(item)
    return
  }
  if (schema === null || typeof schema !== 'object') return

  if (schema.properties !== undefined) {
    delete schema.properties.schema_version
    const provenance = schema.properties.provenance
    if (provenance?.properties !== undefined) {
      for (const field of providerProvenanceFields) delete provenance.properties[field]
      if (Array.isArray(provenance.required)) {
        provenance.required = provenance.required.filter(
          (field) => !providerProvenanceFields.has(field),
        )
      }
    }
  }
  if (Array.isArray(schema.required)) {
    schema.required = schema.required.filter((field) => field !== 'schema_version')
  }
  for (const value of Object.values(schema)) removeResultCarrierFields(value)
}

export function createCanonicalCapabilityRequestSchema(providerSchema) {
  const schema = clone(providerSchema)
  schema.$id = 'urn:openadam:capability:standard-expression.run:input:v0.1'
  schema.title = 'Canonical standard-expression request'
  delete schema.properties.schema_version
  delete schema.properties.limits
  return schema
}

export function createCanonicalCapabilityResultSchema(providerSchema) {
  const schema = clone(providerSchema)
  schema.$id = 'urn:openadam:capability:standard-expression.run:output:v0.1'
  schema.title = 'Canonical standard-expression result'
  removeResultCarrierFields(schema)
  return schema
}

export function createCanonicalCapabilityResult(providerResult) {
  const result = clone(providerResult)
  delete result.schema_version
  if (result.provenance !== undefined) {
    for (const field of providerProvenanceFields) delete result.provenance[field]
  }
  return result
}
