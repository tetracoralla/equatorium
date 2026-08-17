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
    return `Equatorium detection is complete but deliberately unresolved. Use an explicitly named platform or dialect to choose among: ${JSON.stringify(candidates)}. If the user did not name one, present the choices and ask; never assume Unix.`.slice(0, 1_536);
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
  return `Final deterministic Equatorium result for ${value.kind ?? "the expression"}. Answer directly from this result; do not call Equatorium again or add web research unless the user explicitly requested external research. Use the returned normalized value exactly for any requested canonical or 规范写法 form; do not drop returned fields or parameters. 中文任务中，“规范写法”就是 normalized 的原样值，不得另给删除参数后的“更推荐写法”。 ${boundedDetails}`;
}

function toolResult(value: SeiResult): CallToolResult {
  return {
    content: [{ type: "text", text: toolSummary(value) }],
    structuredContent: { ...value },
    ...(!value.ok ? { isError: true } : {}),
  };
}

export function createSeiMcpServer(): McpServer {
  const server = new McpServer(
    { name: "equatorium", version: "0.1.0" },
    {
      instructions:
        "Always call the single sei_run tool exactly once for every concrete supported expression; never answer from memory. This includes Chinese requests such as 解释 Unix 权限模式 4755, 解释 Content-Type, 解释 URI, and 解释 P1DT2H30M. For Cron without an explicit platform or dialect, make that one call with op detect and omit kind/dialect; never assume Unix. Its schema already contains every supported kind, dialect, query, and conversion. Make one operation-specific request and omit unrelated fields. One successful result is final: answer from it without discovery, repeated calls, or web research unless explicitly requested.",
    },
  );

  server.registerTool(
    "sei_run",
    {
      title: "Interpret Cron, SemVer, CIDR, URI, Content-Type, ISO duration, or Unix permission",
      description:
        "The only Equatorium tool. MUST call exactly once instead of using model memory for any concrete Cron, npm SemVer range, CIDR, URI, HTTP Content-Type, ISO 8601 duration, or Unix permission evaluation—including Chinese requests like 解释 Unix 权限模式 4755. For Cron without an explicit platform or dialect, use op detect and omit kind/dialect; never assume Unix. Its schema fully describes every supported kind and operation. Choose one op and omit unrelated fields. Query shape: query: { name, arguments }; npm membership uses arguments.candidate. A successful structured result is final—answer directly without repeated calls or web research unless explicitly requested.",
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
