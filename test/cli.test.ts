import { spawnSync } from "node:child_process";
import { describe, expect, it } from "vitest";

const cli = new URL("../src/cli.ts", import.meta.url).pathname;

describe("CLI runtime", () => {
  it("accepts a JSON request on stdin and emits only a result envelope", () => {
    const child = spawnSync(process.execPath, ["--import", "tsx", cli], {
      cwd: new URL("..", import.meta.url),
      input: JSON.stringify({
        op: "query",
        kind: "semver_range",
        expression: "^3.2.0",
        query: { name: "matches", arguments: { candidate: "3.7.4" } },
      }),
      encoding: "utf8",
    });
    expect(child.status).toBe(0);
    const result = JSON.parse(child.stdout) as { ok: boolean; query_result: { matches: boolean } };
    expect(result.ok).toBe(true);
    expect(result.query_result.matches).toBe(true);
    expect(child.stderr).toBe("");
  });

  it("returns ordered partial failures for a JSON batch", () => {
    const child = spawnSync(process.execPath, ["--import", "tsx", cli], {
      cwd: new URL("..", import.meta.url),
      input: JSON.stringify([
        { op: "normalize", kind: "unix_permission", expression: "755" },
        { op: "normalize", kind: "unix_permission", expression: "999" },
      ]),
      encoding: "utf8",
    });
    expect(child.status).toBe(1);
    const result = JSON.parse(child.stdout) as Array<{ ok: boolean }>;
    expect(result.map((item) => item.ok)).toEqual([true, false]);
  });

  it("stops reading stdin at the cumulative batch boundary", () => {
    const child = spawnSync(process.execPath, ["--import", "tsx", cli], {
      cwd: new URL("..", import.meta.url),
      input: "x".repeat(262_145),
      encoding: "utf8",
    });
    expect(child.status).toBe(1);
    const result = JSON.parse(child.stdout) as {
      ok: boolean;
      diagnostics: Array<{ code: string }>;
    };
    expect(result.ok).toBe(false);
    expect(result.diagnostics[0]?.code).toBe("E_CLI_INPUT");
    expect(Buffer.byteLength(child.stdout, "utf8")).toBeLessThan(1_024);
    expect(child.stderr).toBe("");
  });

  it("publishes per-request and cumulative CLI limits with registry discovery", () => {
    const child = spawnSync(process.execPath, ["--import", "tsx", cli, "registry"], {
      cwd: new URL("..", import.meta.url),
      encoding: "utf8",
    });
    expect(child.status).toBe(0);
    const result = JSON.parse(child.stdout) as {
      limits: {
        per_request: { max_request_bytes: number; max_execution_ms: number };
        response_structure: { max_collection_entries: number };
        cli_batch: { max_items: number; max_stdin_bytes: number; max_execution_ms: number };
      };
      adapters: Array<{ kind: string; query_contracts?: unknown[] }>;
    };
    expect(result.limits.per_request.max_request_bytes).toBe(32_768);
    expect(result.limits.per_request.max_execution_ms).toBe(1_000);
    expect(result.limits.response_structure.max_collection_entries).toBe(4_096);
    expect(result.limits.cli_batch).toMatchObject({
      max_items: 50,
      max_stdin_bytes: 262_144,
      max_execution_ms: 5_000,
    });
    expect(result.adapters.find((adapter) => adapter.kind === "semver_range")?.query_contracts)
      .toBeDefined();
  });

  it("rejects ambiguous expressions and unknown discovery arguments", () => {
    const ambiguous = spawnSync(
      process.execPath,
      ["--import", "tsx", cli, "interpret", "755", "--expression", "644", "--kind", "unix_permission"],
      { cwd: new URL("..", import.meta.url), encoding: "utf8" },
    );
    expect(ambiguous.status).toBe(1);
    expect(JSON.parse(ambiguous.stdout).diagnostics[0]?.code).toBe("E_CLI_INPUT");

    const discovery = spawnSync(
      process.execPath,
      ["--import", "tsx", cli, "registry", "--unknown"],
      { cwd: new URL("..", import.meta.url), encoding: "utf8" },
    );
    expect(discovery.status).toBe(1);
    expect(JSON.parse(discovery.stdout).diagnostics[0]?.code).toBe("E_CLI_INPUT");

    const unknownKind = spawnSync(
      process.execPath,
      ["--import", "tsx", cli, "describe", "not_registered"],
      { cwd: new URL("..", import.meta.url), encoding: "utf8" },
    );
    expect(unknownKind.status).toBe(1);
    expect(JSON.parse(unknownKind.stdout).diagnostics[0]?.code).toBe("E_KIND_UNKNOWN");
  });
});
