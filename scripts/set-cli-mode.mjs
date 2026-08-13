import { chmod } from "node:fs/promises";

if (process.platform !== "win32") {
  await chmod("dist/cli.js", 0o755);
}
