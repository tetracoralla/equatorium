import { spawn } from "node:child_process";
import { once } from "node:events";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { MCP_STDIO_MAX_MESSAGE_BYTES } from "../src/mcp.js";

describe("MCP stdio ingress boundary", () => {
  it("closes the transport before parsing a message beyond its declared ceiling", async () => {
    const child = spawn(
      process.execPath,
      ["--import", "tsx", fileURLToPath(new URL("../src/mcp-bin.ts", import.meta.url))],
      { stdio: ["pipe", "pipe", "pipe"] },
    );
    const stderr: Buffer[] = [];
    child.stderr.on("data", (chunk: Buffer) => stderr.push(chunk));

    const oversizedMessage = JSON.stringify({
      jsonrpc: "2.0",
      id: 1,
      method: "tools/call",
      params: {
        name: "sei_run",
        arguments: {
          op: "query",
          kind: "semver_range",
          expression: "^3.2.0",
          query: {
            name: "matches",
            arguments: { candidate: "x".repeat(MCP_STDIO_MAX_MESSAGE_BYTES) },
          },
        },
      },
    });
    expect(Buffer.byteLength(oversizedMessage, "utf8")).toBeGreaterThan(
      MCP_STDIO_MAX_MESSAGE_BYTES,
    );
    child.stdin.end(`${oversizedMessage}\n`);

    const [exitCode] = await once(child, "exit") as [number | null];
    expect(exitCode).toBe(0);
    expect(Buffer.concat(stderr).toString("utf8")).toContain(
      `ReadBuffer exceeded maximum size of ${MCP_STDIO_MAX_MESSAGE_BYTES} bytes`,
    );
  }, 10_000);
});
