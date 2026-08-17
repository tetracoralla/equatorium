import { Client, InMemoryTransport } from "@modelcontextprotocol/client";
import { describe, expect, it } from "vitest";
import { createAgentRequestSchema, defaultRegistry } from "../src/index.js";
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
  it("exposes one read-only tool with a host-compatible typed request schema", async () => {
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
      expect(run?.description).toContain("arguments.candidate");
      expect(run?.description).toContain("Content-Type");
      expect(run?.description).toContain("解释 Unix 权限模式 4755");
      expect(run?.description).toContain("successful structured result is final");
      expect(run?.inputSchema).toEqual(createAgentRequestSchema(defaultRegistry));
      expect(JSON.stringify(run?.inputSchema)).not.toContain('"oneOf"');
      expect(run?.inputSchema).toMatchObject({
        properties: {
          kind: { enum: expect.arrayContaining(["cron", "semver_range"]) },
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
        expect(text.text).toContain("Final deterministic Equatorium result");
        expect(text.text).toContain("do not call Equatorium again");
        expect(text.text).toContain("do not drop returned fields or parameters");
        expect(text.text).toContain("不得另给删除参数后的“更推荐写法”");
        expect(text.text).toContain('"query_result":{"candidate":"3.7.4","matches":true}');
        expect(Buffer.byteLength(text.text, "utf8")).toBeLessThan(1_536);
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
