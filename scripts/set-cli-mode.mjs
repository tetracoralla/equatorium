import { chmod } from "node:fs/promises";

if (process.platform !== "win32") {
  await Promise.all([
    chmod("dist/cli.js", 0o755),
    chmod("dist/mcp-bin.js", 0o755),
    chmod("dist/ui-bin.js", 0o755),
  ]);
}
