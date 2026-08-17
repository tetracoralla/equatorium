import { McpServer, type CallToolResult } from "@modelcontextprotocol/server";
import { serveStdio, StdioServerTransport } from "@modelcontextprotocol/server/stdio";
import { defaultRegistry } from "./default-registry.js";
import { interpretBounded } from "./core/bounded.js";
import type { SeiRequest, SeiResult } from "./contracts.js";
import { createAgentRequestSchema } from "./schema/request-schema.js";
import { standardJsonSchema } from "./schema/standard-json-schema.js";
import { HARD_LIMITS } from "./core/request.js";

// Includes the JSON-RPC envelope and MCP request metadata around one 32 KiB SEI request.
export const MCP_STDIO_MAX_MESSAGE_BYTES = HARD_LIMITS.max_request_bytes + 16_384;

const requestSchema = standardJsonSchema<SeiRequest>(createAgentRequestSchema(defaultRegistry));

function toolSummary(value: SeiResult): string {
  if (!value.ok) {
    const diagnostic = value.diagnostics[0];
    return diagnostic === undefined
      ? `Equatorium ${value.operation} failed.`
      : `Equatorium ${value.operation} failed: ${diagnostic.code} — ${diagnostic.message}`.slice(0, 384);
  }
  if (value.operation === "detect") {
    const candidates = value.candidates ?? [];
    return `Equatorium detect is unresolved: ${JSON.stringify(candidates)}. Ask which platform applies; never assume Unix.`.slice(0, 768);
  }
  const record = value as unknown as Record<string, unknown>;
  const details = Object.fromEntries([
    "normalized",
    "value",
    "semantics",
    "derived",
    "query_name",
    "query_result",
    "conversion_target",
    "converted",
  ].flatMap((key) => record[key] === undefined ? [] : [[key, record[key]]]));
  const serialized = JSON.stringify(details);
  const boundedDetails = Buffer.byteLength(serialized, "utf8") <= 1_200
    ? serialized
    : JSON.stringify({ normalized: record.normalized });
  return `Equatorium ${value.operation} result: ${boundedDetails}`;
}

function toolResult(value: SeiResult): CallToolResult {
  return {
    content: [{ type: "text", text: toolSummary(value) }],
    structuredContent: { ...value },
  };
}

export function createSeiMcpServer(): McpServer {
  const server = new McpServer(
    { name: "equatorium", version: "0.1.0" },
    {
      instructions:
        "Call sei_run exactly once for every concrete supported expression, including Chinese requests; never answer from memory. For Cron without a platform, use op detect, omit kind/dialect, and never assume Unix. Make one operation-specific request, omit unrelated fields, and treat its structured result as final.",
    },
  );

  server.registerTool(
    "sei_run",
    {
      title: "Interpret Cron, SemVer, CIDR, URI, Content-Type, ISO duration, or Unix permission",
      description:
        "The only Equatorium tool. MUST call exactly once instead of using model memory for any concrete Cron, npm SemVer range, CIDR, URI, HTTP Content-Type, ISO 8601 duration, or Unix permission evaluation—including Chinese requests like 解释 Unix 权限模式 4755. For Cron without an explicit platform or dialect, use op detect and omit kind/dialect; never assume Unix. Exact non-Cron pairs: semver_range/npm, cidr/cidr, uri/rfc3986, content_type/http, iso_duration/iso8601-1, unix_permission/posix-mode. Choose one op and omit unrelated fields. Query shape: query: { name, arguments }; npm membership uses arguments.candidate. A completed structured result is final—answer directly without repeated calls or web research unless explicitly requested.",
      inputSchema: requestSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false,
      },
    },
    async (request) => toolResult(await interpretBounded(request)),
  );

  return server;
}

export function runSeiMcpStdio(): void {
  serveStdio(() => createSeiMcpServer(), {
    transport: new StdioServerTransport(process.stdin, process.stdout, {
      maxBufferSize: MCP_STDIO_MAX_MESSAGE_BYTES,
    }),
    onerror(error) {
      process.stderr.write(`Equatorium MCP transport error: ${error.message}\n`);
    },
  });
}
