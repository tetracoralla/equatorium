import { Client, InMemoryTransport } from "@modelcontextprotocol/client";
import { describe, expect, it } from "vitest";
import { createAgentRequestSchema, createAgentResultSchema, defaultRegistry } from "../src/index.js";
import { createSeiMcpServer } from "../src/mcp.js";

async function connectedMcp(): Promise<{
  client: Client;
  close: () => Promise<void>;
}> {
  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
  const server = createSeiMcpServer();
  const client = new Client(
    { name: "sei-test-client", version: "1" },
    { versionNegotiation: { mode: "legacy" } },
  );
  await Promise.all([server.connect(serverTransport), client.connect(clientTransport)]);
  return {
    client,
    close: async () => {
      await client.close();
      await server.close();
    },
  };
}

describe("MCP Agent surface", () => {
  it("exposes one read-only tool with compact, typed input and output catalogs", async () => {
    const mcp = await connectedMcp();
    try {
      const { tools } = await mcp.client.listTools();
      expect(tools.map((tool) => tool.name)).toEqual(["sei_run"]);
      const run = tools.find((tool) => tool.name === "sei_run");
      expect(run?.annotations).toMatchObject({
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false,
      });
      expect(run?.description).toContain("query: { name, arguments }");
      expect(run?.description).toContain("do not list MCP resources or templates");
      expect(run?.description).toContain("detect with only op and expression");
      expect(run?.description).toContain("fall back to model reasoning");
      expect(run?.description).toContain("arguments.candidate");
      expect(run?.description).toContain("Content-Type");
      expect(run?.description).toContain("解释 Unix 权限模式 4755");
      expect(run?.description).toContain("cidr/cidr");
      expect(run?.description).toContain("unix_permission/posix-mode");
      expect(run?.description).toContain("rrule/rfc5545");
      expect(run?.description).toContain("completed structured result is final");
      expect(run?.inputSchema).toEqual(createAgentRequestSchema(defaultRegistry));
      expect(run?.outputSchema).toEqual(createAgentResultSchema(defaultRegistry));
      expect(JSON.stringify(run?.inputSchema)).not.toContain('"oneOf"');
      expect(run?.outputSchema).toMatchObject({
        required: ["schema_version", "ok", "operation", "input", "diagnostics"],
        additionalProperties: false,
        properties: {
          ok: { type: "boolean" },
          operation: { enum: expect.arrayContaining(["interpret", "query", "detect"]) },
          diagnostics: { type: "array" },
          query_name: { enum: expect.arrayContaining(["matches", "next_occurrences"]) },
        },
      });
      expect(Buffer.byteLength(JSON.stringify(run?.outputSchema), "utf8")).toBeLessThan(8_192);
      expect(run?.inputSchema).toMatchObject({
        description: expect.stringContaining("detect accepts only op and expression"),
        properties: {
          op: { description: expect.stringContaining("Detection returns unresolved candidates") },
          kind: { enum: expect.arrayContaining(["cron", "semver_range"]) },
          context: { description: expect.stringContaining("Never supply when op=detect") },
          query: {
            properties: {
              name: { enum: expect.arrayContaining(["matches", "next_occurrences"]) },
              arguments: {
                properties: {
                  candidate: { type: "string" },
                  count: { type: "integer" },
                  address: { type: "string" },
                },
              },
            },
          },
          derive: {
            description: expect.stringContaining("cron"),
          },
          convert: {
            required: ["target_representation"],
          },
        },
      });
      const inputSchema = run?.inputSchema as {
        properties?: { query?: { properties?: { arguments?: { properties?: Record<string, unknown> } } } };
      };
      expect(inputSchema.properties?.query?.properties?.arguments?.properties).toMatchObject({
        candidate: { description: expect.stringContaining("semver_range/matches") },
        reference: { description: expect.stringContaining("uri query name resolve") },
      });
    } finally {
      await mcp.close();
    }
  });

  it("runs a deterministic request and returns structured content", async () => {
    const mcp = await connectedMcp();
    try {
      const response = await mcp.client.callTool({
        name: "sei_run",
        arguments: {
          op: "query",
          kind: "semver_range",
          expression: "^3.2.0",
          query: { name: "matches", arguments: { candidate: "3.7.4" } },
        },
      });
      expect(response.isError).not.toBe(true);
      expect(response.structuredContent).toMatchObject({
        ok: true,
        operation: "query",
        kind: "semver_range",
        query_name: "matches",
        query_result: { candidate: "3.7.4", matches: true },
      });
      const text = response.content[0];
      expect(text?.type).toBe("text");
      if (text?.type === "text") {
        expect(text.text).toContain("Equatorium query result");
        expect(text.text).toContain('"query_result":{"candidate":"3.7.4","matches":true}');
        expect(text.text).not.toContain("do not call Equatorium again");
        expect(Buffer.byteLength(text.text, "utf8")).toBeLessThan(1_536);
      }
    } finally {
      await mcp.close();
    }
  });

  it("keeps Cron platform detection separate from timezone and other ambiguity", async () => {
    const mcp = await connectedMcp();
    try {
      const cron = await mcp.client.callTool({
        name: "sei_run",
        arguments: { op: "detect", expression: "0 9 * * 1-5" },
      });
      const cronText = cron.content[0];
      expect(cronText?.type).toBe("text");
      if (cronText?.type === "text") {
        expect(cronText.text).toContain("Unix cron or GitHub Actions");
        expect(cronText.text).toContain("Unix cron uses the scheduler's configured timezone");
        expect(cronText.text).toContain("does not choose a timezone or calculate occurrences");
      }

      const permission = await mcp.client.callTool({
        name: "sei_run",
        arguments: { op: "detect", expression: "4755" },
      });
      const permissionText = permission.content[0];
      expect(permissionText?.type).toBe("text");
      if (permissionText?.type === "text") {
        expect(permissionText.text).toContain("Ask which interpretation applies");
        expect(permissionText.text).not.toContain("which platform");
      }
    } finally {
      await mcp.close();
    }
  });

  it("rejects detect-only fields at the core boundary behind the flat Agent schema", async () => {
    const mcp = await connectedMcp();
    try {
      const response = await mcp.client.callTool({
        name: "sei_run",
        arguments: {
          op: "detect",
          expression: "0 9 * * 1-5",
          context: { timezone: "Asia/Shanghai" },
          derive: ["next_occurrences"],
        },
      });
      expect(response.isError).not.toBe(true);
      expect(response.structuredContent).toMatchObject({
        ok: false,
        operation: "detect",
        diagnostics: [{ code: "E_REQUEST_INVALID" }],
      });
      const text = response.content[0];
      expect(text?.type).toBe("text");
      if (text?.type === "text") {
        expect(text.text).toContain("Detect requests accept only op, expression");
      }
    } finally {
      await mcp.close();
    }
  });

  it("returns domain validation failures as completed structured results", async () => {
    const mcp = await connectedMcp();
    try {
      const response = await mcp.client.callTool({
        name: "sei_run",
        arguments: {
          op: "validate",
          kind: "cron",
          dialect: "github-actions",
          expression: "*/1 * * * *",
        },
      });
      expect(response.isError).not.toBe(true);
      expect(response.structuredContent).toMatchObject({
        ok: false,
        operation: "validate",
        kind: "cron",
        dialect: "github-actions",
        diagnostics: [{ code: "E_CRON_GITHUB_MIN_INTERVAL" }],
      });
      const text = response.content[0];
      expect(text?.type).toBe("text");
      if (text?.type === "text") {
        expect(text.text).toContain("E_CRON_GITHUB_MIN_INTERVAL");
      }
    } finally {
      await mcp.close();
    }
  });

  it("does not present an invalid SemVer candidate as a negative match", async () => {
    const mcp = await connectedMcp();
    try {
      const response = await mcp.client.callTool({
        name: "sei_run",
        arguments: {
          op: "query",
          kind: "semver_range",
          dialect: "npm",
          expression: "^3.2.0",
          query: { name: "matches", arguments: { candidate: "not-a-version" } },
        },
      });
      expect(response.structuredContent).toMatchObject({
        ok: false,
        diagnostics: [{ code: "E_QUERY_INVALID" }],
      });
      const text = response.content[0];
      expect(text?.type).toBe("text");
      if (text?.type === "text") {
        expect(text.text).toContain("cannot be evaluated");
        expect(text.text).toContain("not a non-match or false result");
      }
    } finally {
      await mcp.close();
    }
  });

  it("rejects a misspelled nested argument before semantic execution", async () => {
    const mcp = await connectedMcp();
    try {
      const response = await mcp.client.callTool({
        name: "sei_run",
        arguments: {
          op: "query",
          kind: "semver_range",
          expression: "^3.2.0",
          query: {
            name: "matches",
            arguments: { candidate: "3.7.4", candiate: "3.7.4" },
          },
        },
      });
      expect(response.isError).toBe(true);
      const text = response.content[0];
      expect(text?.type).toBe("text");
      if (text?.type === "text") {
        expect(text.text).toContain("Input validation error");
        expect(text.text).toContain("unknown property 'candiate'");
        expect(text.text).not.toContain("address");
        expect(text.text).not.toContain("cidr");
        expect(Buffer.byteLength(text.text, "utf8")).toBeLessThan(1_024);
      }
    } finally {
      await mcp.close();
    }
  });

  it("accepts a typed Cron count request through the compatibility schema", async () => {
    const mcp = await connectedMcp();
    try {
      const response = await mcp.client.callTool({
        name: "sei_run",
        arguments: {
          op: "query",
          kind: "cron",
          dialect: "github-actions",
          expression: "0 9 * * 1-5",
          context: { reference_time: "2026-08-14T00:00:00Z", timezone: "UTC" },
          query: { name: "next_occurrences", arguments: { count: 2 } },
        },
      });
      expect(response.isError).not.toBe(true);
      expect(response.structuredContent).toMatchObject({
        ok: true,
        operation: "query",
        kind: "cron",
        query_name: "next_occurrences",
      });
    } finally {
      await mcp.close();
    }
  });
});
