import "./set-cli-mode.mjs";
import { chmod, copyFile, mkdir, readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { build } from "esbuild";
import { writeThirdPartyNotices } from "./generate-third-party-notices.mjs";

const repositoryRoot = fileURLToPath(new URL("../", import.meta.url));
const runtimeDirectory = new URL("../plugins/equatorium/runtime/", import.meta.url);
await mkdir(runtimeDirectory, { recursive: true });

const enginePackages = [
  "content-type",
  "cron-parser",
  "ipaddr.js",
  "iso8601-duration",
  "semver",
  "uri-js",
];
const packageLock = JSON.parse(
  await readFile(new URL("../package-lock.json", import.meta.url), "utf8"),
);
const bundledEngineVersions = Object.fromEntries(enginePackages.map((packageName) => {
  const version = packageLock.packages?.[`node_modules/${packageName}`]?.version;
  if (typeof version !== "string") {
    throw new Error(`Cannot bundle provenance: ${packageName} is missing from package-lock.json.`);
  }
  return [packageName, version];
}));

const commonBuildOptions = {
  bundle: true,
  platform: "node",
  format: "esm",
  target: "node22",
  sourcemap: false,
  legalComments: "external",
  metafile: true,
  define: {
    __SEI_BUNDLED_ENGINE_VERSIONS__: JSON.stringify(bundledEngineVersions),
  },
};

const buildResults = await Promise.all([
  build({
    ...commonBuildOptions,
    entryPoints: [fileURLToPath(new URL("../src/mcp-bin.ts", import.meta.url))],
    outfile: fileURLToPath(new URL("equatorium-mcp.mjs", runtimeDirectory)),
  }),
  build({
    ...commonBuildOptions,
    entryPoints: [fileURLToPath(new URL("../src/core/worker.ts", import.meta.url))],
    outfile: fileURLToPath(new URL("worker.js", runtimeDirectory)),
  }),
]);

await writeThirdPartyNotices({
  repositoryRoot,
  bundledInputs: buildResults.flatMap((result) => Object.keys(result.metafile.inputs)),
  outputPaths: [
    fileURLToPath(new URL("../THIRD_PARTY_NOTICES.md", import.meta.url)),
    fileURLToPath(new URL("../plugins/equatorium/THIRD_PARTY_NOTICES.md", import.meta.url)),
  ],
});

await Promise.all([
  copyFile(
    new URL("../LICENSE", import.meta.url),
    new URL("../plugins/equatorium/LICENSE", import.meta.url),
  ),
  copyFile(
    new URL("../NOTICE", import.meta.url),
    new URL("../plugins/equatorium/NOTICE", import.meta.url),
  ),
]);

await chmod(new URL("equatorium-mcp.mjs", runtimeDirectory), 0o755);
