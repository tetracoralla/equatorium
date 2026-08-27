import assert from 'node:assert/strict'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { createRequestSchema, createResultSchema, defaultRegistry } from '../src/index.js'
import { createAgentRequestSchema } from '../src/schema/request-schema.js'
import {
  canonicalJson,
  connectEquatoriumClient,
  readSeiRunTool,
  repositoryRoot,
  schemaDigest,
} from './equatoriumCapabilityProvider.mjs'
import {
  createCanonicalCapabilityRequestSchema,
  createCanonicalCapabilityResultSchema,
} from './capabilityCanonicalSchemas.mjs'

const mode = process.argv[2]
if (mode !== '--write' && mode !== '--check') {
  throw new Error(
    'Use --write to refresh capabilities/provider.json or --check to verify the current manifest',
  )
}

const capabilityRoot = resolve(repositoryRoot, 'capabilities')
const manifestPath = resolve(capabilityRoot, 'provider.json')
const providerInput = JSON.parse(
  await readFile(resolve(repositoryRoot, 'schemas/sei.request.v1.schema.json'), 'utf8'),
)
const providerOutput = JSON.parse(
  await readFile(resolve(repositoryRoot, 'schemas/sei.result.v1.schema.json'), 'utf8'),
)
const capabilitySchemaRoot = resolve(capabilityRoot, 'schemas')
const contractInputPath = resolve(
  capabilitySchemaRoot,
  'standard-expression.run.input.schema.json',
)
const contractOutputPath = resolve(
  capabilitySchemaRoot,
  'standard-expression.run.output.schema.json',
)
assert.equal(
  canonicalJson(providerInput),
  canonicalJson(createRequestSchema(defaultRegistry)),
  'published request schema differs from the live registry contract',
)
assert.equal(
  canonicalJson(providerOutput),
  canonicalJson(createResultSchema(defaultRegistry)),
  'published result schema differs from the live registry contract',
)
const canonicalInput = createCanonicalCapabilityRequestSchema(providerInput)
const canonicalOutput = createCanonicalCapabilityResultSchema(providerOutput)

if (mode === '--write') {
  await mkdir(capabilitySchemaRoot, { recursive: true })
  await Promise.all([
    writeFile(contractInputPath, `${JSON.stringify(canonicalInput, null, 2)}\n`, 'utf8'),
    writeFile(contractOutputPath, `${JSON.stringify(canonicalOutput, null, 2)}\n`, 'utf8'),
  ])
}
const contractInput = JSON.parse(await readFile(contractInputPath, 'utf8'))
const contractOutput = JSON.parse(await readFile(contractOutputPath, 'utf8'))
assert.equal(
  canonicalJson(contractInput),
  canonicalJson(canonicalInput),
  'canonical capability input schema is stale',
)
assert.equal(
  canonicalJson(contractOutput),
  canonicalJson(canonicalOutput),
  'canonical capability output schema is stale',
)

const client = await connectEquatoriumClient('equatorium-capability-export')
try {
  const tool = await readSeiRunTool(client)
  const liveTransportInput = tool.inputSchema
  assert.equal(
    canonicalJson(liveTransportInput),
    canonicalJson(createAgentRequestSchema(defaultRegistry)),
    'sei_run advertised input schema differs from the live Agent schema projection',
  )

  const manifest = {
    schemaVersion: 'openadam.provider-manifest.v0.3',
    provider: {
      id: 'org.openadam.equatorium',
      name: 'Equatorium',
      version: '0.1.0',
    },
    implementations: [
      {
        capabilityId: 'org.openadam.standard-expression.run',
        capabilityVersion: '0.2.0',
        profileDigest: 'sha256:880f631de0921b5093fe8357b0138fd8e6459ca80a44a2894e15d3db2159b2b5',
        adapter: {
          protocol: 'openadam.capability-jsonl.v0.1',
          command: 'node',
          args: ['scripts/runCapabilityAdapter.mjs'],
        },
        adapterBindings: [
          {
            operationId: 'run',
            target: 'scripts/runCapabilityAdapter.mjs#run',
          },
        ],
        bindings: [
          {
            operationId: 'run',
            transport: 'mcp-tool',
            target: 'sei_run',
            contractSchemaDigests: {
              input: schemaDigest(contractInput),
              output: schemaDigest(contractOutput),
            },
            transportSchemaDigests: {
              input: schemaDigest(liveTransportInput),
            },
            annotations: tool.annotations ?? {},
          },
        ],
      },
    ],
  }
  const serialized = `${JSON.stringify(manifest, null, 2)}\n`
  if (mode === '--write') {
    await mkdir(capabilityRoot, { recursive: true })
    await writeFile(manifestPath, serialized, 'utf8')
  } else {
    assert.equal(
      await readFile(manifestPath, 'utf8'),
      serialized,
      'capabilities/provider.json is stale; rerun the exporter with --write',
    )
  }
  console.log(`PASS Equatorium provider manifest ${mode.slice(2)}`)
} finally {
  await client.close()
}
