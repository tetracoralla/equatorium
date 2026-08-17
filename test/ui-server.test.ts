import type { AddressInfo } from "node:net";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createUiServer, UI_MAX_BODY_BYTES } from "../src/ui-server.js";

const server = createUiServer();
let baseUrl = "";

beforeAll(async () => {
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  const address = server.address() as AddressInfo;
  baseUrl = `http://127.0.0.1:${address.port}`;
});

afterAll(async () => {
  await new Promise<void>((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
});

describe("local human interface", () => {
  it("serves the page with a locked-down same-origin policy", async () => {
    const response = await fetch(baseUrl);
    expect(response.status).toBe(200);
    expect(response.headers.get("content-security-policy")).toContain("default-src 'self'");
    const html = await response.text();
    expect(html).toContain('id="expression"');
    expect(html).toContain('id="submit-button"');
    expect(html).toContain('id="result-area" hidden');
    expect(html).not.toContain("Equatorium 会识别它");
    expect(html).not.toContain("仅在本机运行");
    expect(html).not.toContain("等待输入");
    expect(html).not.toContain("解释结果会显示在这里");
    expect(html).not.toContain("Agent");
  });

  it("discovers controls from the same sealed Registry", async () => {
    const response = await fetch(`${baseUrl}/api/registry`);
    const body = await response.json() as { adapters: Array<{ kind: string }> };
    expect(body.adapters.map((adapter) => adapter.kind)).toEqual(expect.arrayContaining([
      "cron", "semver_range", "cidr", "uri", "content_type", "iso_duration", "unix_permission",
    ]));
  });

  it("uses the bounded interpreter without adding a second human-only operation", async () => {
    const request = {
      op: "query",
      kind: "semver_range",
      dialect: "npm",
      expression: "^3.2.0",
      query: { name: "matches", arguments: { candidate: "3.7.4" } },
    };
    const response = await fetch(`${baseUrl}/api/evaluate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ request }),
    });
    expect(await response.json()).toMatchObject({
      result: { ok: true, query_result: { matches: true } },
    });

    const extraField = await fetch(`${baseUrl}/api/evaluate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ request, agent_result: {} }),
    });
    expect(extraField.status).toBe(400);
    expect(await extraField.json()).toMatchObject({ error: expect.stringContaining("agent_result") });
  });

  it("rejects bodies beyond the interface ingress ceiling", async () => {
    const response = await fetch(`${baseUrl}/api/evaluate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ request: { op: "detect", expression: "x".repeat(UI_MAX_BODY_BYTES) } }),
    });
    expect(response.status).toBe(400);
    expect(await response.json()).toMatchObject({ error: expect.stringContaining("exceeds") });
  });
});
