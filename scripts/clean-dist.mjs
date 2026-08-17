import { lstat, readFile, rm } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const packagePath = resolve(repositoryRoot, "package.json");
const target = resolve(repositoryRoot, "dist");
const packageJson = JSON.parse(await readFile(packagePath, "utf8"));

if (packageJson.name !== "@openadam/equatorium") {
  throw new Error("Refusing to clean build output outside the Equatorium repository.");
}
if (dirname(target) !== repositoryRoot || target !== resolve(repositoryRoot, "dist")) {
  throw new Error("Refusing to clean an unexpected build output path.");
}

try {
  const metadata = await lstat(target);
  if (metadata.isSymbolicLink()) {
    throw new Error("Refusing to clean a symbolic-link build output path.");
  }
  if (!metadata.isDirectory()) {
    throw new Error("Refusing to clean a build output path that is not a directory.");
  }
  await rm(target, { recursive: true });
} catch (error) {
  if (!(error instanceof Error && "code" in error && error.code === "ENOENT")) throw error;
}
