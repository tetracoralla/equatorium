import { EXAMPLES, KIND_LABELS } from "./catalog.js";
import { element, renderPayload } from "./result-view.js";
import { createRequestLifecycle } from "./request-lifecycle.js";

const form = document.querySelector("#expression-form");
const expressionInput = document.querySelector("#expression");
const formError = document.querySelector("#form-error");
const submitButton = document.querySelector("#submit-button");
const resultArea = document.querySelector("#result-area");
const resultHeading = document.querySelector("#result-heading");
const resultTitle = document.querySelector("#result-title");
const resultContent = document.querySelector("#result-content");

const resultRefs = {
  area: resultArea,
  heading: resultHeading,
  title: resultTitle,
  content: resultContent,
};

let descriptors = [];
const requestLifecycle = createRequestLifecycle();

function showError(target, message) {
  target.textContent = message;
  target.hidden = false;
}

function clearError(target) {
  target.textContent = "";
  target.hidden = true;
}

async function evaluate(request, run) {
  const response = await fetch("/api/evaluate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ request }),
  });
  const payload = await response.json();
  if (!response.ok) throw new Error(payload.error ?? "运行失败。");
  return requestLifecycle.isCurrent(run, expressionInput.value) ? payload : null;
}

function defaultDialect(kind) {
  const item = descriptors.find((descriptor) => descriptor.kind === kind);
  return item?.default_dialect ?? item?.dialects?.[0];
}

function interpretationRequest(expression, candidate) {
  const dialect = candidate.dialect ?? defaultDialect(candidate.kind);
  return {
    op: "interpret",
    expression,
    kind: candidate.kind,
    ...(dialect ? { dialect } : {}),
  };
}

async function interpretCandidate(run, candidate) {
  const payload = await evaluate(interpretationRequest(run.expression, candidate), run);
  if (payload === null) return;
  renderPayload(payload, resultRefs);
}

function expandDialectChoices(candidates) {
  return candidates.flatMap((candidate) => {
    if (candidate.dialect !== undefined) return [candidate];
    const descriptor = descriptors.find((item) => item.kind === candidate.kind);
    if ((descriptor?.dialects?.length ?? 0) <= 1) return [candidate];
    return descriptor.dialects.map((dialect) => ({ ...candidate, dialect }));
  });
}

function showAmbiguity(run, candidates, includesUnsupported = false) {
  resultArea.hidden = false;
  resultHeading.hidden = false;
  resultContent.hidden = false;
  resultTitle.textContent = "请确认表达式类型";
  const chooser = element("div", "ambiguity");
  chooser.append(element(
    "p",
    "",
    includesUnsupported
      ? "它也可能是暂不支持的普通值。请确认你想表达的类型："
      : "请选择你想表达的类型：",
  ));
  const actions = element("div", "ambiguity-actions");
  const kindCounts = new Map();
  for (const candidate of candidates) {
    kindCounts.set(candidate.kind, (kindCounts.get(candidate.kind) ?? 0) + 1);
  }
  for (const candidate of candidates) {
    const kindLabel = KIND_LABELS[candidate.kind] ?? candidate.kind;
    const label = kindCounts.get(candidate.kind) > 1 && candidate.dialect
      ? `${kindLabel}（${candidate.dialect}）`
      : kindLabel;
    const button = element("button", "ambiguity-button", label);
    button.type = "button";
    button.addEventListener("click", async () => {
      button.disabled = true;
      const choiceRun = requestLifecycle.begin(run.expression);
      try {
        await interpretCandidate(choiceRun, candidate);
      } catch (error) {
        if (requestLifecycle.isCurrent(choiceRun, expressionInput.value)) {
          showError(formError, error.message);
        }
      } finally {
        button.disabled = false;
      }
    });
    actions.append(button);
  }
  chooser.append(actions);
  resultContent.replaceChildren(chooser);
}

function showUnrecognized() {
  resultArea.hidden = false;
  resultHeading.hidden = false;
  resultContent.hidden = false;
  resultTitle.textContent = "暂时读不懂这个表达式";
  const supported = descriptors.map((item) => KIND_LABELS[item.kind] ?? item.kind).join("、");
  resultContent.replaceChildren(element("p", "unrecognized", `目前支持：${supported}。`));
}

async function detectAndInterpret(run) {
  const payload = await evaluate({ op: "detect", expression: run.expression }, run);
  if (payload === null) return;
  if (!payload.result.ok) {
    renderPayload(payload, resultRefs);
    return;
  }
  const allCandidates = payload.result.candidates ?? [];
  const candidates = expandDialectChoices(allCandidates.filter((candidate) => candidate.supported));
  const unique = [...new Map(candidates.map((candidate) => [
    `${candidate.kind}:${candidate.dialect ?? ""}`,
    candidate,
  ])).values()];
  if (unique.length === 0) {
    showUnrecognized();
  } else if (unique.length === 1 && allCandidates.every((candidate) => candidate.supported)) {
    await interpretCandidate(run, unique[0]);
  } else {
    showAmbiguity(run, unique, allCandidates.some((candidate) => !candidate.supported));
  }
}

function resetResult() {
  resultArea.hidden = true;
  resultHeading.hidden = true;
  resultContent.hidden = true;
  resultContent.replaceChildren();
  resultTitle.textContent = "";
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  clearError(formError);
  expressionInput.value = expressionInput.value.trim();
  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }
  resetResult();
  const run = requestLifecycle.begin(expressionInput.value);
  submitButton.disabled = true;
  submitButton.querySelector("span").textContent = "识别中…";
  try {
    await detectAndInterpret(run);
    if (
      requestLifecycle.isCurrent(run, expressionInput.value) &&
      matchMedia("(max-width: 760px)").matches
    ) {
      resultArea.scrollIntoView({ behavior: "smooth" });
    }
  } catch (error) {
    if (requestLifecycle.isCurrent(run, expressionInput.value)) {
      showError(formError, error.message);
    }
  } finally {
    submitButton.disabled = false;
    submitButton.querySelector("span").textContent = "解释";
  }
});

expressionInput.addEventListener("input", () => {
  requestLifecycle.invalidate();
  resetResult();
});
for (const button of document.querySelectorAll("[data-example]")) {
  button.addEventListener("click", () => {
    requestLifecycle.invalidate();
    expressionInput.value = EXAMPLES[button.dataset.example].expression;
    resetResult();
    expressionInput.focus();
  });
}

try {
  const response = await fetch("/api/registry");
  if (!response.ok) throw new Error("无法读取表达式目录。");
  descriptors = (await response.json()).adapters;
} catch (error) {
  showError(formError, error.message);
  submitButton.disabled = true;
}
