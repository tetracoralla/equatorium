export function createRequestLifecycle() {
  let generation = 0;
  let controller;

  function isCurrent(run, expression) {
    return run.generation === generation && run.expression === expression;
  }

  return {
    begin(expression) {
      controller?.abort();
      generation += 1;
      controller = new AbortController();
      return Object.freeze({ generation, expression, signal: controller.signal });
    },
    invalidate() {
      generation += 1;
      controller?.abort();
      controller = undefined;
    },
    finish(run, expression) {
      if (!isCurrent(run, expression)) return false;
      controller = undefined;
      return true;
    },
    isCurrent,
  };
}
