// @vitest-environment happy-dom
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const pageHtml = readFileSync(resolve(import.meta.dirname, "../ui/index.html"), "utf8");

const CRON_DESCRIPTOR = {
  kind: "cron",
  dialects: ["unix-5", "github-actions"],
};

function deferred() {
  let resolve;
  const promise = new Promise((res) => { resolve = res; });
  return { promise, resolve };
}

function jsonResponse(body, status = 200) {
  return { ok: status >= 200 && status < 300, status, json: async () => body };
}

function loadPage() {
  const body = pageHtml.match(/<body[^>]*>([\s\S]*)<\/body>/)?.[1];
  document.body.innerHTML = body ?? "";
}

beforeEach(() => {
  vi.resetModules();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("human UI application wiring", () => {
  it("keeps submission locked until the registry resolves, then offers cron platform choices", async () => {
    const registry = deferred();
    const evaluateCalls = [];
    vi.stubGlobal("fetch", vi.fn((input, init) => {
      const url = String(input);
      if (url === "/api/registry") return registry.promise.then((body) => jsonResponse(body));
      if (url === "/api/evaluate") {
        evaluateCalls.push(JSON.parse(init.body));
        return Promise.resolve(jsonResponse({
          result: {
            ok: true,
            candidates: [{
              kind: "cron",
              confidence: 0.98,
              reason: "The input is a valid five-field cron expression; choose unix-5 or github-actions explicitly.",
              supported: true,
            }],
          },
        }));
      }
      throw new Error(`Unexpected fetch: ${url}`);
    }));

    loadPage();
    const submitButton = document.querySelector("#submit-button");
    const expressionInput = document.querySelector("#expression");
    const form = document.querySelector("#expression-form");
    const loaded = import("../ui/app.js");
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(submitButton.disabled).toBe(true);
    expressionInput.value = "*/5 * * * *";
    expressionInput.dispatchEvent(new Event("input", { bubbles: true }));
    expect(submitButton.disabled).toBe(true);

    registry.resolve({ schema_version: "equatorium.ui-registry.v1", adapters: [CRON_DESCRIPTOR] });
    await loaded;
    expect(submitButton.disabled).toBe(false);

    form.dispatchEvent(new Event("submit", { cancelable: true }));
    await vi.waitFor(() => {
      const labels = [...document.querySelectorAll(".ambiguity-button")].map((button) => button.textContent);
      expect(labels).toEqual(["Unix / Linux", "GitHub Actions"]);
    });

    expect(evaluateCalls).toEqual([{ request: { op: "detect", expression: "*/5 * * * *" } }]);
    expect(document.querySelector("#form-error").hidden).toBe(true);
    expect(submitButton.disabled).toBe(false);
  });

  it("keeps the failure reason visible while locked and recovers after reload", async () => {
    vi.stubGlobal("fetch", vi.fn(() => Promise.resolve(jsonResponse({}, 500))));

    loadPage();
    const submitButton = document.querySelector("#submit-button");
    const expressionInput = document.querySelector("#expression");
    const formError = document.querySelector("#form-error");
    await import("../ui/app.js");

    expect(formError.hidden).toBe(false);
    expect(formError.textContent).toBe("无法读取表达式目录，请刷新页面重试。");
    expect(submitButton.disabled).toBe(true);
    expressionInput.value = "*/5 * * * *";
    expressionInput.dispatchEvent(new Event("input", { bubbles: true }));
    expect(formError.hidden).toBe(false);
    expect(formError.textContent).toBe("无法读取表达式目录，请刷新页面重试。");
    expect(submitButton.disabled).toBe(true);

    const registry = deferred();
    vi.stubGlobal("fetch", vi.fn((input) => String(input) === "/api/registry"
      ? registry.promise.then((body) => jsonResponse(body))
      : Promise.reject(new Error(`Unexpected fetch: ${String(input)}`))));
    registry.resolve({ schema_version: "equatorium.ui-registry.v1", adapters: [CRON_DESCRIPTOR] });
    vi.resetModules();
    loadPage();
    await import("../ui/app.js");
    expect(document.querySelector("#submit-button").disabled).toBe(false);
    expect(document.querySelector("#form-error").hidden).toBe(true);
  });
});
