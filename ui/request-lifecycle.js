export function createRequestLifecycle() {
  let generation = 0;

  return {
    begin(expression) {
      generation += 1;
      return Object.freeze({ generation, expression });
    },
    invalidate() {
      generation += 1;
    },
    isCurrent(run, expression) {
      return run.generation === generation && run.expression === expression;
    },
  };
}
