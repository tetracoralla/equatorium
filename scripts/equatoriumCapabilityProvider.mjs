import { createHash } from 'node:crypto'
import { fileURLToPath } from 'node:url'
import { resolve } from 'node:path'
import { Client } from '@modelcontextprotocol/client'
import { StdioClientTransport } from '@modelcontextprotocol/client/stdio'

export const repositoryRoot = fileURLToPath(new URL('../', import.meta.url))

export function canonicalJson(value) {
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(',')}]`
  if (value !== null && typeof value === 'object') {
    return `{${Object.keys(value)
      .sort()
      .map((key) => `${JSON.stringify(key)}:${canonicalJson(value[key])}`)
      .join(',')}}`
  }
  return JSON.stringify(value)
}

export function schemaDigest(schema) {
  return `sha256:${createHash('sha256').update(canonicalJson(schema)).digest('hex')}`
}

export async function connectEquatoriumClient(name) {
  const transport = new StdioClientTransport({
    command: process.execPath,
    args: [resolve(repositoryRoot, 'plugins/equatorium/runtime/equatorium-mcp.mjs')],
    cwd: repositoryRoot,
    stderr: 'pipe',
  })
  const client = new Client(
    { name, version: '0.1.0' },
    { versionNegotiation: { mode: 'legacy' } },
  )
  await client.connect(transport)
  return client
}

export async function readSeiRunTool(client) {
  const listed = await client.listTools()
  const tool = listed.tools.find((candidate) => candidate.name === 'sei_run')
  if (tool === undefined) throw new Error('MCP tool sei_run is missing')
  if (tool.inputSchema === undefined) throw new Error('MCP tool sei_run must advertise an input schema')
  return tool
}
