import { readFileSync } from "node:fs";
import { dirname, join, parse } from "node:path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const versionCache = new Map<string, string>();

export function packageVersion(packageName: string): string {
  const cached = versionCache.get(packageName);
  if (cached !== undefined) {
    return cached;
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
