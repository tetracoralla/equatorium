import { createInterface } from 'node:readline'
import { connectEquatoriumClient } from './equatoriumCapabilityProvider.mjs'
import { createCanonicalCapabilityResult } from './capabilityCanonicalSchemas.mjs'

const client = await connectEquatoriumClient('equatorium-capability-adapter')
const lines = createInterface({ input: process.stdin, crlfDelay: Infinity })

function providerError(response) {
  const diagnostic = response.structuredContent?.diagnostics?.[0]
  const message =
    diagnostic?.message ??
    response.content?.find((item) => item.type === 'text')?.text ??
    'Provider error'
  return {
    code: diagnostic?.code ?? 'PROVIDER_ERROR',
    message,
  }
}

try {
  for await (const line of lines) {
    if (line.trim() === '') continue
    let request
    try {
      request = JSON.parse(line)
      if (request.operationId !== 'run') {
        throw new Error(`Unsupported operationId ${request.operationId}`)
      }
      const response = await client.callTool({ name: 'sei_run', arguments: request.input })
      if (response.structuredContent !== undefined) {
        process.stdout.write(
          `${JSON.stringify({
            id: request.id,
            ok: true,
            result: createCanonicalCapabilityResult(response.structuredContent),
          })}\n`,
        )
      } else if (response.isError === true) {
        process.stdout.write(
          `${JSON.stringify({ id: request.id, ok: false, error: providerError(response) })}\n`,
        )
      } else {
        throw new Error('Provider returned neither structured content nor an error')
      }
    } catch (error) {
      process.stdout.write(
        `${JSON.stringify({
          id: request?.id ?? null,
          ok: false,
          error: {
            code: 'ADAPTER_INVALID_REQUEST',
            message: error instanceof Error ? error.message : String(error),
          },
        })}\n`,
      )
    }
  }
} finally {
  await client.close()
}
