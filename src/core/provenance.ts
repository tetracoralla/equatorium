import { readFileSync } from "node:fs";
import { dirname, join, parse } from "node:path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const versionCache = new Map<string, string>();
declare const __SEI_BUNDLED_ENGINE_VERSIONS__: Readonly<Record<string, string>> | undefined;

const bundledEngineVersions = typeof __SEI_BUNDLED_ENGINE_VERSIONS__ === "undefined"
  ? undefined
  : __SEI_BUNDLED_ENGINE_VERSIONS__;

export function packageVersion(packageName: string): string {
  const cached = versionCache.get(packageName);
  if (cached !== undefined) {
    return cached;
  }

  const bundled = bundledEngineVersions?.[packageName];
  if (bundled !== undefined) {
    versionCache.set(packageName, bundled);
    return bundled;
  }

  try {
    let directory = dirname(require.resolve(packageName));
    const root = parse(directory).root;
    while (directory !== root) {
      try {
        const manifest = JSON.parse(
          readFileSync(join(directory, "package.json"), "utf8"),
        ) as { name?: string; version?: string };
        if (manifest.name === packageName && typeof manifest.version === "string") {
          versionCache.set(packageName, manifest.version);
          return manifest.version;
        }
      } catch {
        // Keep walking until the owning package manifest is found.
      }
      directory = dirname(directory);
    }
  } catch {
    // A missing version must not turn a valid interpretation into a runtime failure.
  }

  versionCache.set(packageName, "unknown");
  return "unknown";
}
