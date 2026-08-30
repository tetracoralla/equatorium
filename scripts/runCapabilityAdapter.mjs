import { once } from 'node:events'
import { connectEquatoriumClient } from './equatoriumCapabilityProvider.mjs'
import { createCanonicalCapabilityResult } from './capabilityCanonicalSchemas.mjs'

const MAX_REQUEST_LINE_BYTES = 64 * 1024
const MAX_RESPONSE_LINE_BYTES = 128 * 1024
const utf8Decoder = new TextDecoder('utf-8', { fatal: true })

async function* readBoundedLines(input) {
  let fragments = []
  let fragmentBytes = 0
  for await (const chunk of input) {
    const bytes = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)
    let offset = 0
    while (offset < bytes.length) {
      const newline = bytes.indexOf(0x0a, offset)
      const end = newline === -1 ? bytes.length : newline
      const fragment = bytes.subarray(offset, end)
      if (fragmentBytes + fragment.length > MAX_REQUEST_LINE_BYTES) {
        throw new Error('request line exceeds the adapter boundary')
      }
      if (fragment.length > 0) fragments.push(Buffer.from(fragment))
      fragmentBytes += fragment.length
      if (newline === -1) break

      let line = Buffer.concat(fragments, fragmentBytes)
      if (line.at(-1) === 0x0d) line = line.subarray(0, -1)
      yield utf8Decoder.decode(line)
      fragments = []
      fragmentBytes = 0
      offset = newline + 1
    }
  }
  if (fragmentBytes > 0) yield utf8Decoder.decode(Buffer.concat(fragments, fragmentBytes))
}

async function writeResponse(value) {
  const line = `${JSON.stringify(value)}\n`
  if (Buffer.byteLength(line, 'utf8') > MAX_RESPONSE_LINE_BYTES) {
    throw new Error('response line exceeds the adapter boundary')
  }
  if (!process.stdout.write(line)) await once(process.stdout, 'drain')
}

let client
let fatalMessage
try {
  client = await connectEquatoriumClient('equatorium-capability-adapter')
  for await (const line of readBoundedLines(process.stdin)) {
    if (line.trim() === '') continue
    let request
    try {
      request = JSON.parse(line)
    } catch {
      fatalMessage = 'request line is not valid JSON'
      break
    }
    if (
      request === null ||
      typeof request !== 'object' ||
      Array.isArray(request) ||
      JSON.stringify(Object.keys(request).sort()) !==
        JSON.stringify(['id', 'input', 'operationId']) ||
      typeof request.id !== 'string' ||
      request.id.length === 0 ||
      request.id.length > 160 ||
      request.operationId !== 'run'
    ) {
      fatalMessage = 'request envelope is outside the Capability JSONL carrier contract'
      break
    }
    const response = await client.callTool({ name: 'sei_run', arguments: request.input })
    if (response.structuredContent === undefined || response.isError === true) {
      fatalMessage = 'provider transport did not return a structured semantic result'
      break
    }
    await writeResponse(
      {
        id: request.id,
        ok: true,
        result: createCanonicalCapabilityResult(response.structuredContent),
      },
    )
  }
} catch (error) {
  fatalMessage ??= error instanceof Error && error.message.includes('adapter boundary')
    ? error.message
    : 'adapter or provider transport failed'
} finally {
  await client?.close().catch(() => {})
}

if (fatalMessage !== undefined) {
  process.stderr.write(`Equatorium Capability carrier failure: ${fatalMessage}\n`)
  process.exitCode = 1
}
