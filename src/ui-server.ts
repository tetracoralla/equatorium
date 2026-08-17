import { createServer, type IncomingMessage, type Server, type ServerResponse } from "node:http";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { defaultRegistry } from "./default-registry.js";
import { interpretBounded } from "./core/bounded.js";
import { HARD_LIMITS } from "./core/request.js";

export const UI_MAX_BODY_BYTES = 98_304;

const UI_ASSETS = new Map<string, readonly [string, string]>([
  ["/", ["index.html", "text/html; charset=utf-8"]],
  ["/app.js", ["app.js", "text/javascript; charset=utf-8"]],
  ["/catalog.js", ["catalog.js", "text/javascript; charset=utf-8"]],
  ["/result-view.js", ["result-view.js", "text/javascript; charset=utf-8"]],
  ["/request-lifecycle.js", ["request-lifecycle.js", "text/javascript; charset=utf-8"]],
  ["/styles.css", ["styles.css", "text/css; charset=utf-8"]],
  ["/favicon.svg", ["favicon.svg", "image/svg+xml"]],
]);

const SECURITY_HEADERS = {
  "Content-Security-Policy": "default-src 'self'; base-uri 'none'; connect-src 'self'; font-src 'self'; form-action 'self'; frame-ancestors 'none'; img-src 'self' data:; object-src 'none'; script-src 'self'; style-src 'self'",
  "Cross-Origin-Opener-Policy": "same-origin",
  "Referrer-Policy": "no-referrer",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
};

type HumanRequest = {
  request: unknown;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function sendJson(response: ServerResponse, status: number, value: unknown): void {
  const body = JSON.stringify(value);
  response.writeHead(status, {
    ...SECURITY_HEADERS,
    "Cache-Control": "no-store",
    "Content-Type": "application/json; charset=utf-8",
    "Content-Length": Buffer.byteLength(body, "utf8"),
  });
  response.end(body);
}

async function readJsonBody(request: IncomingMessage): Promise<unknown> {
  if (!request.headers["content-type"]?.toLowerCase().startsWith("application/json")) {
    throw new Error("Content-Type must be application/json.");
  }
  const chunks: Buffer[] = [];
  let bytes = 0;
  for await (const chunk of request) {
    const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
    bytes += buffer.length;
    if (bytes > UI_MAX_BODY_BYTES) {
      throw new Error(`Request body exceeds ${UI_MAX_BODY_BYTES} bytes.`);
    }
    chunks.push(buffer);
  }
  if (bytes === 0) throw new Error("Request body is required.");
  return JSON.parse(Buffer.concat(chunks).toString("utf8"));
}

function parseHumanRequest(value: unknown): HumanRequest {
  if (!isRecord(value) || !Object.hasOwn(value, "request")) {
    throw new Error("The request field is required.");
  }
  const unknown = Object.keys(value).filter((key) => key !== "request");
  if (unknown.length > 0) throw new Error(`Unsupported field: ${unknown.join(", ")}.`);
  return { request: value.request };
}

async function handleApi(request: IncomingMessage, response: ServerResponse): Promise<boolean> {
  if (request.method === "GET" && request.url === "/api/registry") {
    sendJson(response, 200, {
      schema_version: "equatorium.ui-registry.v1",
      adapters: defaultRegistry.list(),
      limits: HARD_LIMITS,
    });
    return true;
  }
  if (request.method === "GET" && request.url === "/healthz") {
    sendJson(response, 200, { ok: true });
    return true;
  }
  if (request.method === "POST" && request.url === "/api/evaluate") {
    try {
      const payload = parseHumanRequest(await readJsonBody(request));
      const result = await interpretBounded(payload.request);
      sendJson(response, 200, { result });
    } catch (error) {
      sendJson(response, 400, {
        error: error instanceof Error ? error.message : "Invalid request.",
      });
    }
    return true;
  }
  if (request.url?.startsWith("/api/")) {
    sendJson(response, 404, { error: "Not found." });
    return true;
  }
  return false;
}

export function createUiServer(assetDirectory = fileURLToPath(new URL("../ui/", import.meta.url))): Server {
  return createServer(async (request, response) => {
    try {
      if (await handleApi(request, response)) return;
      if (request.method !== "GET" && request.method !== "HEAD") {
        response.writeHead(405, { ...SECURITY_HEADERS, Allow: "GET, HEAD" });
        response.end();
        return;
      }
      const asset = request.url === undefined ? undefined : UI_ASSETS.get(request.url);
      if (asset === undefined) {
        response.writeHead(404, SECURITY_HEADERS);
        response.end("Not found.");
        return;
      }
      const body = await readFile(resolve(assetDirectory, asset[0]));
      response.writeHead(200, {
        ...SECURITY_HEADERS,
        "Cache-Control": "no-cache",
        "Content-Type": asset[1],
        "Content-Length": body.length,
      });
      response.end(request.method === "HEAD" ? undefined : body);
    } catch {
      if (!response.headersSent) sendJson(response, 500, { error: "The interface could not complete the request." });
      else response.end();
    }
  });
}
