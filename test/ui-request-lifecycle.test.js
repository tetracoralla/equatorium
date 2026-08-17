import { describe, expect, it } from "vitest";
import { createRequestLifecycle } from "../ui/request-lifecycle.js";
import { displayValue } from "../ui/result-view.js";

describe("human UI request lifecycle", () => {
  it("invalidates an in-flight result when the visible expression changes", () => {
    const lifecycle = createRequestLifecycle();
    const first = lifecycle.begin("^3.2.0");

    lifecycle.invalidate();

    expect(lifecycle.isCurrent(first, "192.168.1.0/24")).toBe(false);
  });

  it("renders nested semantic values without raw protocol JSON", () => {
    const comparatorText = displayValue([
      [
        { operator: ">=", version: "3.2.0" },
        { operator: "<", version: "4.0.0-0" },
      ],
    ], "comparator_sets");
    const permissionText = displayValue({ setuid: true, setgid: false, sticky: false }, "special");

    expect(comparatorText).toBe(">=3.2.0 且 <4.0.0-0");
    expect(permissionText).toContain("Setuid：是");
    expect(comparatorText).not.toContain("{");
    expect(permissionText).not.toContain("{");
  });
});
