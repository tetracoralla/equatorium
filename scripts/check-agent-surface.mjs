import assert from "node:assert/strict";
import { access, cp, mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { Client } from "@modelcontextprotocol/client";
import { StdioClientTransport } from "@modelcontextprotocol/client/stdio";

const repositoryRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const pluginRoot = resolve(repositoryRoot, "plugins/equatorium");
const manifestPath = resolve(pluginRoot, ".codex-plugin/plugin.json");
const mcpPath = resolve(pluginRoot, ".mcp.json");
const skillPath = resolve(pluginRoot, "skills/interpret-standard-expressions/SKILL.md");
const packagePath = resolve(repositoryRoot, "package.json");
const readmePath = resolve(repositoryRoot, "README.md");
const rootLicensePath = resolve(repositoryRoot, "LICENSE");
const rootNoticePath = resolve(repositoryRoot, "NOTICE");
const rootNoticesPath = resolve(repositoryRoot, "THIRD_PARTY_NOTICES.md");
const pluginLicensePath = resolve(pluginRoot, "LICENSE");
const pluginNoticePath = resolve(pluginRoot, "NOTICE");
const pluginNoticesPath = resolve(pluginRoot, "THIRD_PARTY_NOTICES.md");
const buildScriptPath = resolve(repositoryRoot, "scripts/build-plugin.mjs");
const marketplacePath = resolve(repositoryRoot, ".agents/plugins/marketplace.json");
const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
const mcp = JSON.parse(await readFile(mcpPath, "utf8"));
const skill = await readFile(skillPath, "utf8");
const packageJson = JSON.parse(await readFile(packagePath, "utf8"));
const readme = await readFile(readmePath, "utf8");
const rootLicense = await readFile(rootLicensePath, "utf8");
const rootNotice = await readFile(rootNoticePath, "utf8");
const rootNotices = await readFile(rootNoticesPath, "utf8");
const pluginLicense = await readFile(pluginLicensePath, "utf8");
const pluginNotice = await readFile(pluginNoticePath, "utf8");
const pluginNotices = await readFile(pluginNoticesPath, "utf8");
const buildScript = await readFile(buildScriptPath, "utf8");
const marketplace = JSON.parse(await readFile(marketplacePath, "utf8"));
const serverConfig = mcp.mcpServers?.equatorium;

assert.equal(packageJson.name, "@openadam/equatorium");
assert.equal(packageJson.author?.name, "openAdam");
assert.equal(packageJson.license, "Apache-2.0");
assert.deepEqual(packageJson.repository, {
  type: "git",
  url: "https://github.com/tetracoralla/equatorium.git",
});
assert.equal(packageJson.bugs?.url, "https://github.com/tetracoralla/equatorium/issues");
assert.equal(packageJson.homepage, "https://github.com/tetracoralla/equatorium#readme");
assert.equal(packageJson.bin?.equatorium, "./dist/cli.js");
assert.equal(packageJson.bin?.["equatorium-mcp"], "./dist/mcp-bin.js");
assert.equal(packageJson.bin?.["equatorium-ui"], "./dist/ui-bin.js");
assert.equal(packageJson.bin?.sei, "./dist/cli.js", "The stable SEI CLI alias was removed.");
assert.equal(packageJson.bin?.["sei-mcp"], "./dist/mcp-bin.js", "The stable SEI MCP alias was removed.");
assert.match(readme, /^# Equatorium$/m);
assert.match(readme, /Standard Expression Interpreter \(SEI\)/);
assert.match(readme, /Apache License 2\.0/);
assert.equal(manifest.name, "equatorium");
assert.equal(manifest.version.split("+", 1)[0], packageJson.version);
assert.equal(manifest.interface?.displayName, "Equatorium");
assert.equal(manifest.skills, "./skills/");
assert.equal(manifest.mcpServers, "./.mcp.json");
assert.equal(serverConfig?.command, "node");
assert.deepEqual(serverConfig?.args, ["runtime/equatorium-mcp.mjs"]);
assert.equal(serverConfig?.cwd, ".");
assert(!skill.includes("[TODO:"), "Agent skill contains an unfinished placeholder.");
assert.match(skill, /Always call Equatorium sei_run exactly once/);
assert.match(skill, /解释 Unix 权限模式 4755/);
assert(skill.includes("Call `sei_run` directly"));
assert.match(skill, /Cron without a named platform or dialect/);
assert.match(skill, /never assume Unix/);
assert(skill.includes("unresolved (`resolved: false`)"));
assert.match(skill, /`cidr\/cidr`/);
assert.match(skill, /`unix_permission\/posix-mode`/);
assert.equal(rootLicense, pluginLicense, "Root and bundled Apache licenses have drifted.");
assert.equal(rootNotice, pluginNotice, "Root and bundled NOTICE files have drifted.");
assert.match(rootLicense, /Apache License\s+Version 2\.0/);
assert.match(rootLicense, /Copyright 2026 openAdam/);
assert.match(rootNotice, /Copyright 2026 openAdam/);
assert.equal(rootNotices, pluginNotices, "Root and bundled third-party notices have drifted.");
for (const packageName of ["@modelcontextprotocol/server", "ajv", "cron-parser", "semver", "zod"]) {
  assert.match(pluginNotices, new RegExp(`^## ${packageName.replace("/", "\\/")}@`, "m"));
}
assert.match(buildScript, /legalComments: "external"/);
assert.equal(marketplace.name, "equatorium");
assert.equal(marketplace.plugins?.[0]?.source?.path, "./plugins/equatorium");

const runtimePath = resolve(pluginRoot, serverConfig.args[0]);
await access(runtimePath);
await access(resolve(pluginRoot, "runtime/worker.js"));

async function verifyRuntime(command, args, cwd) {
  const transport = new StdioClientTransport({ command, args, cwd, stderr: "inherit" });
  const client = new Client(
    { name: "equatorium-plugin-check", version: "1" },
    { versionNegotiation: { mode: "legacy" } },
  );
  await client.connect(transport);
  try {
    const tools = await client.listTools();
    assert.deepEqual(tools.tools.map((tool) => tool.name), ["sei_run"]);
    assert.match(tools.tools[0].description, /Cron without an explicit platform or dialect/);
    assert.match(tools.tools[0].description, /never assume Unix/);
    const response = await client.callTool({
      name: "sei_run",
      arguments: {
        op: "convert",
        kind: "unix_permission",
        expression: "4755",
        convert: { target_representation: "symbolic" },
      },
    });
    assert.notEqual(response.isError, true);
    assert.equal(response.structuredContent?.operation, "convert");
    assert.equal(response.structuredContent?.input, "4755");
    assert.equal(response.structuredContent?.kind, "unix_permission");
    assert.equal(response.structuredContent?.conversion_target, "symbolic");
    assert.deepEqual(response.structuredContent?.converted, {
      representation: "symbolic",
      expression: "rwsr-xr-x",
    });
    const provenanceRequests = [
      { op: "interpret", kind: "cidr", expression: "192.168.1.0/24" },
      { op: "interpret", kind: "content_type", expression: "text/html; charset=utf-8" },
      { op: "interpret", kind: "cron", dialect: "unix-5", expression: "0 9 * * *" },
      { op: "interpret", kind: "iso_duration", expression: "P1DT3H" },
      { op: "interpret", kind: "semver_range", expression: "^3.2.0" },
      { op: "interpret", kind: "uri", expression: "https://example.com/a" },
    ];
    for (const request of provenanceRequests) {
      const provenanceResponse = await client.callTool({
        name: "sei_run",
        arguments: request,
      });
      assert.notEqual(provenanceResponse.isError, true, `Runtime rejected ${request.kind}.`);
      assert.notEqual(
        provenanceResponse.structuredContent?.provenance?.engine_version,
        "unknown",
        `Isolated plugin lost ${request.kind} engine provenance.`,
      );
      assert.match(
        String(provenanceResponse.structuredContent?.provenance?.engine_version),
        /^\d+\.\d+\.\d+/,
        `Isolated plugin returned a non-version for ${request.kind}.`,
      );
    }
  } finally {
    await client.close();
  }
}

await verifyRuntime(process.execPath, [resolve(repositoryRoot, "dist/mcp-bin.js")], repositoryRoot);

const temporaryRoot = await mkdtemp(join(tmpdir(), "equatorium-plugin-check-"));
const resolvedTemporaryRoot = resolve(temporaryRoot);
assert(
  resolvedTemporaryRoot.startsWith(`${resolve(tmpdir())}${sep}`),
  "Refusing to use a plugin-check directory outside the system temporary directory.",
);
const isolatedPluginRoot = resolve(resolvedTemporaryRoot, "equatorium");
await cp(pluginRoot, isolatedPluginRoot, { recursive: true });
try {
  await verifyRuntime(
    serverConfig.command,
    serverConfig.args,
    isolatedPluginRoot,
  );
} finally {
  await rm(resolvedTemporaryRoot, { recursive: true });
}

process.stdout.write("Agent plugin structure, distribution MCP, and isolated bundle passed.\n");
