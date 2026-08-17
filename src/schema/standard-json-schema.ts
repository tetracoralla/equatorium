import {
  Ajv2020,
  type ErrorObject,
  type ValidateFunction,
} from "ajv/dist/2020.js";
import type { StandardSchemaWithJSON } from "@modelcontextprotocol/server";

interface StandardIssue {
  message: string;
  path?: ReadonlyArray<PropertyKey | { key: PropertyKey }>;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function relevantVariantIndex(schema: Record<string, unknown>, value: unknown): number | undefined {
  if (!isRecord(value) || !Array.isArray(schema.oneOf)) return undefined;
  const variants = schema.oneOf;
  let bestIndex: number | undefined;
  let bestScore = -1;
  for (const [index, candidate] of variants.entries()) {
    if (!isRecord(candidate) || !isRecord(candidate.properties)) continue;
    const properties = candidate.properties;
    let score = 0;
    let rejected = false;
    for (const [property, weight] of [["op", 16], ["kind", 8]] as const) {
      const contract = properties[property];
      if (!isRecord(contract) || typeof contract.const !== "string") continue;
      if (value[property] !== contract.const) {
        rejected = true;
        break;
      }
      score += weight;
    }
    if (rejected) continue;
    for (const [container, property, weight] of [
      ["query", "name", 4],
      ["convert", "target_representation", 4],
    ] as const) {
      const contractContainer = properties[container];
      const inputContainer = value[container];
      if (!isRecord(contractContainer) || !isRecord(contractContainer.properties)) continue;
      const contract = contractContainer.properties[property];
      if (!isRecord(contract) || typeof contract.const !== "string") continue;
      if (!isRecord(inputContainer) || inputContainer[property] !== contract.const) {
        rejected = true;
        break;
      }
      score += weight;
    }
    if (!rejected && score > bestScore) {
      bestIndex = index;
      bestScore = score;
    }
  }
  return bestIndex;
}

function issueMessage(error: ErrorObject): string {
  if (error.keyword === "additionalProperties") {
    const property = error.params.additionalProperty;
    return typeof property === "string"
      ? `unknown property '${property}'`
      : "contains an unknown property";
  }
  if (error.keyword === "required") {
    const property = error.params.missingProperty;
    return typeof property === "string"
      ? `missing required property '${property}'`
      : "is missing a required property";
  }
  return error.message ?? "Input does not match the published schema.";
}

function dedupeIssues(issues: StandardIssue[]): StandardIssue[] {
  const seen = new Set<string>();
  return issues.filter((issue) => {
    const key = `${JSON.stringify(issue.path ?? [])}:${issue.message}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function standardJsonSchema<T>(
  schema: Record<string, unknown>,
  validator = new Ajv2020({ allErrors: true, strict: true }),
): StandardSchemaWithJSON<T, T> {
  const validate: ValidateFunction<T> = validator.compile<T>(schema);
  return {
    "~standard": {
      version: 1,
      vendor: "@openadam/equatorium",
      validate(value: unknown) {
        if (validate(value)) return { value };
        const variantIndex = relevantVariantIndex(schema, value);
        const variantPrefix = variantIndex === undefined ? undefined : `#/oneOf/${variantIndex}/`;
        const allErrors = validate.errors ?? [];
        const relevantErrors = variantPrefix === undefined
          ? allErrors
          : allErrors.filter((error) => {
              if (error.schemaPath.startsWith(variantPrefix)) return true;
              if (error.schemaPath.startsWith("#/oneOf/")) return false;
              return error.keyword !== "oneOf";
            });
        const issues = dedupeIssues(relevantErrors
          .filter((error) => error.keyword !== "const" && error.keyword !== "oneOf")
          .sort((left, right) => {
            const priority = (error: ErrorObject): number => {
              if (error.keyword === "additionalProperties") return 2;
              if (error.keyword === "required") return 1;
              return 0;
            };
            const priorityDifference = priority(right) - priority(left);
            if (priorityDifference !== 0) return priorityDifference;
            const depth = (path: string): number => path.split("/").length;
            return depth(right.instancePath) - depth(left.instancePath);
          })
          .map((error): StandardIssue => ({
            message: issueMessage(error),
            ...(error.instancePath.length === 0
              ? {}
              : {
                  path: error.instancePath
                    .split("/")
                    .slice(1)
                    .map((segment) => segment.replaceAll("~1", "/").replaceAll("~0", "~")),
                }),
          })));
        return {
          issues: issues.length === 0
            ? [{ message: "Input does not match the published schema." }]
            : issues.slice(0, 4),
        };
      },
      jsonSchema: {
        input: () => schema,
        output: () => schema,
      },
    },
  };
}
