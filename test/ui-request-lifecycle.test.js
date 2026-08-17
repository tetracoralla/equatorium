import { describe, expect, it } from "vitest";
import { createRequestLifecycle } from "../ui/request-lifecycle.js";
import {
  diagnosticMessage,
  displayValue,
  meaningEntries,
} from "../ui/result-view.js";

describe("human UI request lifecycle", () => {
  it("invalidates an in-flight result when the visible expression changes", () => {
    const lifecycle = createRequestLifecycle();
    const first = lifecycle.begin("^3.2.0");

    lifecycle.invalidate();

    expect(lifecycle.isCurrent(first, "192.168.1.0/24")).toBe(false);
    expect(first.signal.aborted).toBe(true);
  });

  it("aborts a previous request when a replacement starts", () => {
    const lifecycle = createRequestLifecycle();
    const first = lifecycle.begin("^3.2.0");
    const second = lifecycle.begin("192.168.1.0/24");

    expect(first.signal.aborted).toBe(true);
    expect(second.signal.aborted).toBe(false);
    expect(lifecycle.finish(second, "192.168.1.0/24")).toBe(true);
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

  it("projects meaning from deterministic values and semantics", () => {
    const cron = meaningEntries({
      kind: "cron",
      value: { minute: { type: "set", values: [0] } },
      semantics: { timezone: "UTC", day_of_month_day_of_week_relation: "or" },
    });
    const duration = meaningEntries({
      kind: "iso_duration",
      value: { years: "0", days: "1", hours: "2", minutes: "30", seconds: "0" },
    });

    expect(cron).toEqual([
      ["minute", { type: "set", values: [0] }],
      ["timezone", "UTC"],
      ["day_of_month_day_of_week_relation", "or"],
    ]);
    expect(duration).toEqual([["days", "1"], ["hours", "2"], ["minutes", "30"]]);
    expect(displayValue("or", "day_of_month_day_of_week_relation")).toBe("任一条件满足即可");
  });

  it("uses deterministic local messages for user-facing diagnostics", () => {
    expect(diagnosticMessage({
      code: "W_DURATION_CALENDAR_CONTEXT",
      message: "English fallback",
    })).toBe("年和月取决于具体日历，不能直接换算成固定秒数。");
  });
});
