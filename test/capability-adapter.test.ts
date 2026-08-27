import { spawn } from "node:child_process";
import { once } from "node:events";
import { describe, expect, it } from "vitest";

describe("Capability JSONL carrier boundary", () => {
  it("terminates on malformed carrier input instead of publishing a semantic Capability error", async () => {
    const child = spawn(process.execPath, ["scripts/runCapabilityAdapter.mjs"], {
      cwd: new URL("..", import.meta.url),
      stdio: ["pipe", "pipe", "pipe"],
    });
    const stdout: Buffer[] = [];
    const stderr: Buffer[] = [];
    child.stdout.on("data", (chunk: Buffer) => stdout.push(chunk));
    child.stderr.on("data", (chunk: Buffer) => stderr.push(chunk));
    child.stdin.end("{bad}\n");

    const [exitCode] = await once(child, "exit") as [number | null];
    expect(exitCode).toBe(1);
    expect(Buffer.concat(stdout).toString("utf8")).toBe("");
    expect(Buffer.concat(stderr).toString("utf8")).toBe(
      "Equatorium Capability carrier failure: request line is not valid JSON\n",
    );
  }, 10_000);

  it("rejects an overlong line before it can become an unbounded carrier buffer", async () => {
    const child = spawn(process.execPath, ["scripts/runCapabilityAdapter.mjs"], {
      cwd: new URL("..", import.meta.url),
      stdio: ["pipe", "pipe", "pipe"],
    });
    const stdout: Buffer[] = [];
    const stderr: Buffer[] = [];
    child.stdout.on("data", (chunk: Buffer) => stdout.push(chunk));
    child.stderr.on("data", (chunk: Buffer) => stderr.push(chunk));
    child.stdin.end(`${"x".repeat(65 * 1024)}\n`);

    const [exitCode] = await once(child, "exit") as [number | null];
    expect(exitCode).toBe(1);
    expect(Buffer.concat(stdout).toString("utf8")).toBe("");
    expect(Buffer.concat(stderr).toString("utf8")).toBe(
      "Equatorium Capability carrier failure: request line exceeds the adapter boundary\n",
    );
  }, 10_000);
});
