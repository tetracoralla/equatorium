import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join, resolve, sep } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { Client } from "@modelcontextprotocol/client";
import { StdioClientTransport } from "@modelcontextprotocol/client/stdio";

const repositoryRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const temporaryRoot = await mkdtemp(join(tmpdir(), "equatorium-package-check-"));
const resolvedTemporaryRoot = resolve(temporaryRoot);
const npmCache = resolve(resolvedTemporaryRoot, "npm-cache");

function run(command, arguments_, options = {}) {
  const result = spawnSync(command, arguments_, {
    encoding: "utf8",
    maxBuffer: 4 * 1024 * 1024,
    timeout: 120_000,
    ...options,
  });
  if (result.status !== 0) {
    throw new Error([
      `${command} ${arguments_.join(" ")} failed with status ${result.status}.`,
      result.stdout,
      result.stderr,
    ].filter(Boolean).join("\n"));
  }
  return result;
}

function executable(consumerRoot, name) {
  return resolve(consumerRoot, "node_modules", ".bin", name);
}

async function verifyMcp(command) {
  const transport = new StdioClientTransport({ command, args: [], stderr: "pipe" });
  const client = new Client(
    { name: "equatorium-package-check", version: "1" },
    { versionNegotiation: { mode: "legacy" } },
  );
  await client.connect(transport);
  try {
    const tools = await client.listTools();
    assert.deepEqual(tools.tools.map((tool) => tool.name), ["sei_run"]);
    const result = await client.callTool({
      name: "sei_run",
      arguments: { op: "interpret", kind: "iso_duration", expression: "P1DT3H" },
    });
    assert.notEqual(result.isError, true);
    assert.equal(result.structuredContent?.normalized, "P1DT3H");
  } finally {
    await client.close();
  }
}

assert(
  resolvedTemporaryRoot.startsWith(`${resolve(tmpdir())}${sep}`),
  "Refusing to use a package-check directory outside the system temporary directory.",
);

try {
  const packed = run(
    "npm",
    ["pack", "--json", "--cache", npmCache, "--pack-destination", resolvedTemporaryRoot],
    { cwd: repositoryRoot },
  );
  const packInfo = JSON.parse(packed.stdout)[0];
  assert.equal(typeof packInfo?.filename, "string");
  const packedFiles = new Set(packInfo.files.map((item) => item.path));
  assert(packedFiles.has("dist/mcp-bin.js"));
  assert(packedFiles.has("dist/ui-bin.js"));
  assert(packedFiles.has("ui/index.html"));
  assert(packedFiles.has("THIRD_PARTY_NOTICES.md"));
  assert(
    ![...packedFiles].some((path) => path.startsWith("dist/core/correlation.")),
    "Package contains the removed correlation build artifact.",
  );

  const consumerRoot = resolve(resolvedTemporaryRoot, "consumer");
  await writeFile(
    resolve(resolvedTemporaryRoot, "package.json"),
    JSON.stringify({ name: "equatorium-package-check", private: true }),
    "utf8",
  );
  const tarball = resolve(resolvedTemporaryRoot, packInfo.filename);
  run(
    "npm",
    [
      "install", "--ignore-scripts", "--no-audit", "--no-fund",
      "--cache", npmCache, "--prefix", consumerRoot, tarball,
    ],
    { cwd: resolvedTemporaryRoot },
  );

  const installedPackage = resolve(consumerRoot, "node_modules", "@openadam", "equatorium");
  const packageJson = JSON.parse(await readFile(resolve(installedPackage, "package.json"), "utf8"));
  assert.equal(packageJson.bin["equatorium-mcp"], "./dist/mcp-bin.js");
  assert.equal(packageJson.bin["sei-mcp"], "./dist/mcp-bin.js");

  const library = await import(pathToFileURL(resolve(installedPackage, "dist/index.js")).href);
  const libraryResult = await library.interpretBounded({
    op: "normalize",
    kind: "unix_permission",
    expression: "755",
  });
  assert.equal(libraryResult.ok, true);
  assert.equal(libraryResult.normalized, "0755");

  for (const name of ["equatorium", "sei"]) {
    const result = run(executable(consumerRoot, name), [], {
      cwd: consumerRoot,
      input: JSON.stringify({ op: "interpret", kind: "cidr", expression: "192.168.1.0/24" }),
    });
    assert.equal(JSON.parse(result.stdout).normalized, "192.168.1.0/24");
  }
  const uiHelp = run(executable(consumerRoot, "equatorium-ui"), ["--help"], { cwd: consumerRoot });
  assert.match(uiHelp.stdout, /Usage: equatorium-ui/);
  await verifyMcp(executable(consumerRoot, "equatorium-mcp"));
  await verifyMcp(executable(consumerRoot, "sei-mcp"));
} finally {
  await rm(resolvedTemporaryRoot, { recursive: true });
}

process.stdout.write("Packed library, UI, CLI aliases, and npm MCP bins passed from a fresh install.\n");
