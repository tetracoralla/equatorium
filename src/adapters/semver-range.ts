import { Range, intersects, satisfies, valid as validVersion } from "semver";
import type {
  AdapterDescriptor,
  DetectionCandidate,
  JsonObject,
  JsonValue,
  SeiQuery,
} from "../contracts.js";
import type {
  AdapterInput,
  AdapterInterpretation,
  ExpressionAdapter,
} from "../core/adapter.js";
import { SeiError } from "../core/errors.js";
import { packageVersion } from "../core/provenance.js";

interface SemverState {
  range: Range;
}

function booleanArgument(argumentsValue: JsonObject, name: string): boolean {
  const value = argumentsValue[name] ?? false;
  if (typeof value !== "boolean") {
    throw new SeiError("E_QUERY_INVALID", `'query.arguments.${name}' must be boolean.`);
  }
  return value;
}

export class SemverRangeAdapter implements ExpressionAdapter {
  readonly descriptor: AdapterDescriptor = {
    kind: "semver_range",
    title: "npm semantic-version range",
    summary: "Interpret npm-compatible semantic-version ranges and test candidates or intersections.",
    dialects: ["npm"],
    default_dialect: "npm",
    capabilities: ["interpret", "validate", "normalize", "query.matches", "query.intersects"],
    interpretation_contract: {
      value_schema: {
        type: "object",
        properties: {
          comparator_sets: {
            type: "array",
            items: {
              type: "array",
              items: {
                type: "object",
                properties: { operator: { type: "string" }, version: { type: "string" } },
                required: ["operator", "version"],
                additionalProperties: false,
              },
            },
          },
        },
        required: ["comparator_sets"],
        additionalProperties: false,
      },
    },
    query_contracts: [
      {
        name: "matches",
        summary: "Test whether one valid semantic version satisfies the range.",
        arguments: {
          type: "object",
          properties: {
            candidate: {
              type: "string",
              description: "Semantic version candidate.",
              min_length: 1,
              max_length: 256,
            },
            include_prerelease: {
              type: "boolean",
              description: "Apply node-semver includePrerelease range semantics.",
            },
          },
          required: ["candidate"],
          additional_properties: false,
        },
        result_schema: {
          type: "object",
          properties: { candidate: { type: "string" }, matches: { type: "boolean" } },
          required: ["candidate", "matches"],
          additionalProperties: false,
        },
      },
      {
        name: "intersects",
        summary: "Test whether another valid npm semantic-version range overlaps this range.",
        arguments: {
          type: "object",
          properties: {
            range: {
              type: "string",
              description: "Second npm semantic-version range.",
              min_length: 1,
              max_length: 8192,
            },
            include_prerelease: {
              type: "boolean",
              description: "Apply node-semver includePrerelease range semantics.",
            },
          },
          required: ["range"],
          additional_properties: false,
        },
        result_schema: {
          type: "object",
          properties: { range: { type: "string" }, intersects: { type: "boolean" } },
          required: ["range", "intersects"],
          additionalProperties: false,
        },
      },
    ],
    provenance: {
      spec: "Semantic-Versioning-2.0.0/npm-range",
      engine: "semver",
      engine_version: packageVersion("semver"),
      compatibility_mode: "npm-strict",
    },
  };

  interpret(input: AdapterInput): AdapterInterpretation {
    let range: Range;
    try {
      range = new Range(input.expression);
    } catch (error) {
      throw new SeiError(
        "E_SEMVER_RANGE_PARSE",
        error instanceof Error ? error.message : "Invalid semantic-version range.",
        { span: { start: 0, end: input.expression.length } },
      );
    }
    const normalized = range.range.length === 0 ? "*" : range.range;
    return {
      normalized,
      value: {
        comparator_sets: range.set.map((set) =>
          set.map((comparator) => ({
            operator: comparator.operator || "=",
            version: comparator.semver.version,
          })),
        ),
      },
      state: { range } satisfies SemverState,
    };
  }

  query(
    interpretation: AdapterInterpretation,
    query: SeiQuery,
    _input: AdapterInput,
  ): JsonValue {
    const state = interpretation.state as SemverState;
    const argumentsValue = query.arguments ?? {};
    const includePrerelease = booleanArgument(argumentsValue, "include_prerelease");

    if (query.name === "matches") {
      const candidate = argumentsValue.candidate;
      if (typeof candidate !== "string") {
        throw new SeiError(
          "E_QUERY_INVALID",
          "SemVer query 'matches' requires arguments.candidate as a version string.",
        );
      }
      const normalizedCandidate = validVersion(candidate);
      if (normalizedCandidate === null) {
        throw new SeiError(
          "E_QUERY_INVALID",
          `SemVer query candidate '${candidate}' is not a valid semantic version.`,
        );
      }
      return {
        candidate: normalizedCandidate,
        matches: satisfies(normalizedCandidate, state.range, { includePrerelease }),
      };
    }
    if (query.name === "intersects") {
      const other = argumentsValue.range;
      if (typeof other !== "string") {
        throw new SeiError(
          "E_QUERY_INVALID",
          "SemVer query 'intersects' requires arguments.range as a range string.",
        );
      }
      try {
        return {
          range: other,
          intersects: intersects(state.range, new Range(other), { includePrerelease }),
        };
      } catch (error) {
        throw new SeiError(
          "E_QUERY_INVALID",
          error instanceof Error ? error.message : "Invalid comparison range.",
        );
      }
    }
    throw new SeiError("E_QUERY_UNSUPPORTED", `SemVer query '${query.name}' is not supported.`, {
      expected: { queries: ["matches", "intersects"] },
    });
  }

  detect(expression: string): DetectionCandidate | null {
    const value = expression.trim();
    const rangeShape = /[~^*xX<>=|]/.test(value) || /^v?\d+\.\d+\.\d+(?:[-+][0-9A-Za-z.-]+)?$/.test(value);
    if (!rangeShape) return null;
    try {
      new Range(value);
      return {
        kind: "semver_range",
        dialect: "npm",
        confidence: 0.91,
        reason: "The input has npm semantic-version range syntax.",
        supported: true,
      };
    } catch {
      return null;
    }
  }
}
