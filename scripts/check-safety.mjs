import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";

async function sourceFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(
    entries.map((entry) => {
      const path = join(directory, entry.name);
      return entry.isDirectory()
        ? sourceFiles(path)
        : /\.(?:ts|mjs)$/.test(entry.name)
          ? [path]
          : [];
    }),
  );
  return nested.flat();
}

const forbidden = [
  { label: "direct eval", pattern: /\beval\s*\(/ },
  { label: "Function constructor", pattern: /\bnew\s+Function\s*\(/ },
  { label: "dynamic Function call", pattern: /\bFunction\s*\(/ },
];

const failures = [];
for (const path of await sourceFiles("src")) {
  const source = await readFile(path, "utf8");
  for (const rule of forbidden) {
    if (rule.pattern.test(source)) failures.push(`${path}: forbidden ${rule.label}`);
  }
}

if (failures.length > 0) {
  process.stderr.write(`${failures.join("\n")}\n`);
  process.exitCode = 1;
} else {
  process.stdout.write("Safety source guard passed.\n");
}
