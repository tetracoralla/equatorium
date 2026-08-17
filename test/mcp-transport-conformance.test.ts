import { readFile } from "node:fs/promises";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { Client } from "@modelcontextprotocol/client";
import { StdioClientTransport } from "@modelcontextprotocol/client/stdio";
import { describe, expect, it } from "vitest";
import type { JsonObject, SeiRequest } from "../src/contracts.js";

interface ConformanceTask {
  id: string;
  user_task: string;
  tool: "sei_run";
  request: SeiRequest;
  expected: JsonObject;
}

interface ConformanceFixture {
  schema_version: "sei.mcp-transport-conformance.v0.1";
  tasks: ConformanceTask[];
}

const repositoryRoot = dirname(dirname(fileURLToPath(import.meta.url)));

async function loadConformanceFixture(): Promise<ConformanceFixture> {
  const value: unknown = JSON.parse(
    await readFile(
      new URL("../fixtures/mcp-transport-conformance-v0.1.json", import.meta.url),
      "utf8",
    ),
  );
  if (
    typeof value !== "object" ||
    value === null ||
    !("schema_version" in value) ||
    (value as { schema_version?: unknown }).schema_version !==
      "sei.mcp-transport-conformance.v0.1" ||
    !("tasks" in value) ||
    !Array.isArray((value as { tasks?: unknown }).tasks)
  ) {
    throw new Error(
      "MCP transport fixture does not match sei.mcp-transport-conformance.v0.1.",
    );
  }
  return value as ConformanceFixture;
}

describe("seven-category MCP transport conformance over stdio", () => {
  it("executes every known task through the single sei_run tool", async () => {
    const fixture = await loadConformanceFixture();
    expect(fixture.tasks).toHaveLength(7);
    expect(new Set(fixture.tasks.map((task) => task.request.kind))).toEqual(
      new Set([
        "cron",
        "semver_range",
        "cidr",
        "uri",
        "content_type",
        "iso_duration",
        "unix_permission",
      ]),
    );

    const transport = new StdioClientTransport({
      command: process.execPath,
      args: ["--import", "tsx", fileURLToPath(new URL("../src/mcp-bin.ts", import.meta.url))],
      cwd: repositoryRoot,
      stderr: "pipe",
    });
    const client = new Client(
      { name: "sei-mcp-transport-conformance", version: "1" },
      { versionNegotiation: { mode: "legacy" } },
    );
    await client.connect(transport);
    try {
      const listed = await client.listTools();
      expect(listed.tools.map((tool) => tool.name)).toEqual(["sei_run"]);
      for (const task of fixture.tasks) {
        expect(task.tool, task.user_task).toBe("sei_run");
        const response = await client.callTool({ name: task.tool, arguments: { ...task.request } });
        expect(response.isError, task.user_task).not.toBe(true);
        expect(response.structuredContent, task.user_task).toMatchObject(task.expected);
      }
    } finally {
      await client.close();
    }
  }, 20_000);
});
