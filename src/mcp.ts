import { McpServer, type CallToolResult } from "@modelcontextprotocol/server";
import { serveStdio, StdioServerTransport } from "@modelcontextprotocol/server/stdio";
import { defaultRegistry } from "./default-registry.js";
import { interpretBounded } from "./core/bounded.js";
import type { SeiRequest, SeiResult } from "./contracts.js";
import { createAgentRequestSchema } from "./schema/request-schema.js";
import { createAgentResultSchema } from "./schema/agent-result-schema.js";
import { standardJsonSchema } from "./schema/standard-json-schema.js";
import { HARD_LIMITS } from "./core/request.js";

// Includes the JSON-RPC envelope and MCP request metadata around one 32 KiB SEI request.
export const MCP_STDIO_MAX_MESSAGE_BYTES = HARD_LIMITS.max_request_bytes + 16_384;

const requestSchema = standardJsonSchema<SeiRequest>(createAgentRequestSchema(defaultRegistry));
const resultSchema = standardJsonSchema<SeiResult>(createAgentResultSchema(defaultRegistry));

function toolSummary(value: SeiResult): string {
  if (!value.ok) {
    const diagnostic = value.diagnostics[0];
    if (
      value.kind === "semver_range" &&
      value.operation === "query" &&
      diagnostic?.code === "E_QUERY_INVALID"
    ) {
      return `Equatorium SemVer query is invalid and cannot be evaluated; this is not a non-match or false result: ${diagnostic.message}`.slice(0, 384);
    }
    return diagnostic === undefined
      ? `Equatorium ${value.operation} failed.`
      : `Equatorium ${value.operation} failed: ${diagnostic.code} — ${diagnostic.message}`.slice(0, 384);
  }
  if (value.operation === "detect") {
    const candidates = value.candidates ?? [];
    const guidance = candidates.some((candidate) => candidate.kind === "cron")
      ? "Ask whether the schedule is Unix cron or GitHub Actions. GitHub Actions schedules use UTC; Unix cron uses the scheduler's configured timezone. Detection does not choose a timezone or calculate occurrences."
      : "Ask which interpretation applies; do not silently choose a supported candidate.";
    return `Equatorium detect is unresolved: ${JSON.stringify(candidates)}. ${guidance}`.slice(0, 1_024);
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
        "Call sei_run directly and exactly once for every concrete supported expression, including Chinese requests; never answer from memory. Do not list MCP resources or templates because Equatorium exposes none. For Cron without a platform, call detect with only op and expression, then ask the user to choose; never add context, derive, query, or convert; never assume Unix, infer the Unix scheduler timezone, compute occurrences, or fall back to model reasoning. RRULE accepts one RRULE: property for structural interpretation only; never send calendar containers or ask Equatorium to expand occurrences. GitHub Actions schedules use UTC; Unix cron uses its scheduler's configured timezone. Make one operation-specific request, omit unrelated fields, and treat its structured result as final. A structured error is not a negative match; invalid SemVer cannot be evaluated and must never be reported as false or not contained.",
    },
  );

  server.registerTool(
    "sei_run",
    {
      title: "Interpret Cron, SemVer, CIDR, URI, Content-Type, ISO duration, RRULE, or Unix permission",
      description:
        "The only Equatorium tool. Call it directly; do not list MCP resources or templates because this server exposes none. MUST call exactly once instead of using model memory for any concrete Cron, npm SemVer range, CIDR, URI, HTTP Content-Type, ISO 8601 duration, RFC 5545 RRULE, or Unix permission evaluation—including Chinese requests like 解释 Unix 权限模式 4755. For Cron without an explicit platform or dialect, call detect with only op and expression, then ask the user to choose; never add context, derive, query, or convert; never assume Unix, infer the Unix scheduler timezone, compute occurrences, or fall back to model reasoning. RRULE accepts one RRULE: property for structural interpret/validate/normalize only; never send calendar containers, context, query, convert, or derive, and never expand occurrences. GitHub Actions schedules use UTC; Unix cron uses its scheduler's configured timezone. Exact non-Cron pairs: semver_range/npm, cidr/cidr, uri/rfc3986, content_type/http, iso_duration/iso8601-1, rrule/rfc5545, unix_permission/posix-mode. Choose one op and omit unrelated fields. Query shape: query: { name, arguments }; npm membership uses arguments.candidate. A completed structured result is final—answer directly without repeated calls or web research unless explicitly requested. A structured error is not a negative match; invalid SemVer cannot be evaluated and must never be reported as false or not contained.",
      inputSchema: requestSchema,
      outputSchema: resultSchema,
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
