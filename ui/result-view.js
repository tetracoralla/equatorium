import { DIAGNOSTIC_MESSAGES, FIELD_LABELS, VALUE_LABELS } from "./catalog.js";

export function element(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function objectSummary(value) {
  return Object.entries(value)
    .map(([key, item]) => `${FIELD_LABELS[key] ?? key}：${displayValue(item, key)}`)
    .join("；");
}

function comparatorSummary(sets) {
  return sets
    .map((set) => set.length === 0
      ? "任意版本"
      : set.map((item) => `${item.operator === "=" ? "" : item.operator}${item.version}`).join(" 且 "))
    .join("；或 ");
}

export function displayValue(value, key = "") {
  if (value === true) return "是";
  if (value === false) return "否";
  if (value === null) return "无";
  if (Array.isArray(value)) {
    if (key === "comparator_sets") return comparatorSummary(value);
    return value.map((item) => typeof item === "object" && item !== null
      ? objectSummary(item)
      : displayValue(item)).join("；");
  }
  if (typeof value === "object") {
    if (value.type === "any") return "任意";
    if (value.type === "set") return value.values.join(", ");
    if (value.type === "range") return `${value.from} – ${value.to}`;
    return objectSummary(value);
  }
  const label = VALUE_LABELS[key]?.[String(value)];
  if (label !== undefined) return label;
  return String(value);
}

function entriesFor(value) {
  return Array.isArray(value)
    ? value.map((item, index) => [String(index + 1), item])
    : typeof value === "object" && value !== null
      ? Object.entries(value)
      : [["value", value]];
}

export function meaningEntries(result) {
  const primary = result.query_result ?? result.converted ?? result.candidates ?? result.value ?? result.derived;
  if (primary === undefined) return [];
  let entries = entriesFor(primary);
  if (result.kind === "iso_duration") {
    const nonzero = entries.filter(([, value]) => value !== "0");
    entries = nonzero.length === 0 ? [["days", "0"]] : nonzero;
  }
  if (result.kind === "rrule") {
    entries = entries.filter(([, value]) =>
      value !== null && (!Array.isArray(value) || value.length > 0)
    );
  }
  if (typeof result.semantics === "object" && result.semantics !== null) {
    const existing = new Set(entries.map(([key]) => key));
    entries = entries.concat(
      Object.entries(result.semantics).filter(([key]) => !existing.has(key)),
    );
  }
  return entries;
}

export function diagnosticMessage(diagnostic) {
  return DIAGNOSTIC_MESSAGES[diagnostic.code] ?? diagnostic.message;
}

function renderData(entries) {
  const section = element("section", "result-data");
  section.append(element("h3", "", "含义"));
  const list = element("dl", "data-list");
  for (const [key, item] of entries) {
    const row = element("div", "data-row");
    row.append(element("dt", "data-key", FIELD_LABELS[key] ?? key));
    row.append(element("dd", "data-value", displayValue(item, key)));
    list.append(row);
  }
  section.append(list);
  return section;
}

async function copyText(value) {
  try {
    await navigator.clipboard.writeText(value);
    return true;
  } catch {
    const fallback = document.createElement("textarea");
    fallback.value = value;
    fallback.setAttribute("readonly", "");
    fallback.style.position = "fixed";
    fallback.style.opacity = "0";
    document.body.append(fallback);
    fallback.select();
    const copied = document.execCommand("copy");
    fallback.remove();
    return copied;
  }
}

function copyButton(value) {
  const button = element("button", "copy-button", "复制");
  button.type = "button";
  button.addEventListener("click", async () => {
    button.textContent = await copyText(value) ? "已复制" : "复制失败";
    setTimeout(() => { button.textContent = "复制"; }, 1200);
  });
  return button;
}

export function renderPayload(payload, refs) {
  const result = payload.result;
  refs.area.hidden = false;
  refs.content.hidden = false;
  refs.content.replaceChildren();
  const needsHeading = !result.ok || result.operation === "detect";
  refs.heading.hidden = !needsHeading;
  refs.title.textContent = result.ok ? "请选择表达式类型" : "需要修正";

  if (result.normalized !== undefined) {
    const section = element("section", "normalized");
    section.append(element("h3", "", "标准写法"));
    const box = element("div", "normalized-box");
    box.append(element("code", "", result.normalized), copyButton(result.normalized));
    section.append(box);
    refs.content.append(section);
  }
  const entries = meaningEntries(result);
  if (entries.length > 0) refs.content.append(renderData(entries));
  if (result.diagnostics?.length > 0) {
    const section = element("section", "diagnostics");
    section.append(element("h3", "", "提示"));
    const list = element("ul", "diagnostic-list");
    for (const diagnostic of result.diagnostics) {
      list.append(element("li", "", diagnosticMessage(diagnostic)));
    }
    section.append(list);
    refs.content.append(section);
  }
}
