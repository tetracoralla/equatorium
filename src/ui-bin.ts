#!/usr/bin/env node

import { createUiServer } from "./ui-server.js";

const DEFAULT_PORT = 4319;

function usage(): string {
  return [
    "Usage: equatorium-ui [--port <1-65535>]",
    "",
    "Starts the local Equatorium interface on 127.0.0.1.",
  ].join("\n");
}

function parsePort(arguments_: string[]): number | undefined {
  if (arguments_.includes("--help") || arguments_.includes("-h")) return undefined;
  if (arguments_.length === 0) return DEFAULT_PORT;
  if (arguments_.length !== 2 || arguments_[0] !== "--port") {
    throw new Error(usage());
  }
  const port = Number(arguments_[1]);
  if (!Number.isSafeInteger(port) || port < 1 || port > 65_535) {
    throw new Error("Port must be an integer from 1 to 65535.");
  }
  return port;
}

try {
  const port = parsePort(process.argv.slice(2));
  if (port === undefined) {
    process.stdout.write(`${usage()}\n`);
  } else {
    const server = createUiServer();
    server.listen(port, "127.0.0.1", () => {
      process.stdout.write(`Equatorium is ready at http://127.0.0.1:${port}\n`);
    });
    const close = (): void => {
      server.close(() => process.exit(0));
    };
    process.once("SIGINT", close);
    process.once("SIGTERM", close);
  }
} catch (error) {
  process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
  process.exitCode = 1;
}
