import { format, parse } from "content-type";
import type {
  AdapterDescriptor,
  DetectionCandidate,
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

function assertUniqueParameters(expression: string): void {
  const segments: string[] = [];
  let current = "";
  let quoted = false;
  let escaped = false;
  for (const character of expression) {
    if (escaped) {
      current += character;
      escaped = false;
    } else if (quoted && character === "\\") {
      current += character;
      escaped = true;
    } else if (character === '"') {
      current += character;
      quoted = !quoted;
    } else if (character === ";" && !quoted) {
      segments.push(current);
      current = "";
    } else {
      current += character;
    }
  }
  segments.push(current);

  const seen = new Set<string>();
  for (const segment of segments.slice(1)) {
    const equals = segment.indexOf("=");
    if (equals < 0) continue;
    const name = segment.slice(0, equals).trim().toLowerCase();
    if (seen.has(name)) {
      throw new SeiError(
        "E_CONTENT_TYPE_DUPLICATE_PARAMETER",
        `Content-Type parameter '${name}' appears more than once; normalization would discard information.`,
      );
    }
    seen.add(name);
  }
}

export class ContentTypeAdapter implements ExpressionAdapter {
  readonly descriptor: AdapterDescriptor = {
    kind: "content_type",
    title: "HTTP Content-Type",
    summary: "Interpret media types and their parameters using HTTP Content-Type syntax.",
    dialects: ["http"],
    default_dialect: "http",
    capabilities: ["interpret", "validate", "normalize", "query.parameter"],
    interpretation_contract: {
      value_schema: {
        type: "object",
        properties: {
          media_type: { type: "string" },
          type: { type: "string" },
          subtype: { type: "string" },
          suffix: { type: "string" },
          parameters: { type: "object", additionalProperties: { type: "string" } },
        },
        required: ["media_type", "type", "subtype", "parameters"],
        additionalProperties: false,
      },
    },
    query_contracts: [
      {
        name: "parameter",
        summary: "Read one case-insensitive Content-Type parameter by name.",
        arguments: {
          type: "object",
          properties: {
            name: {
              type: "string",
              description: "HTTP token parameter name.",
              min_length: 1,
              max_length: 127,
              pattern: "^[!#$%&'*+.^_`|~0-9A-Za-z-]+$",
            },
          },
          required: ["name"],
          additional_properties: false,
        },
        result_schema: {
          type: "object",
          properties: {
            name: { type: "string" },
            present: { type: "boolean" },
            value: { anyOf: [{ type: "string" }, { type: "null" }] },
          },
          required: ["name", "present", "value"],
          additionalProperties: false,
        },
      },
    ],
    provenance: {
      spec: "RFC9110-media-type",
      engine: "content-type",
      engine_version: packageVersion("content-type"),
      compatibility_mode: "strict-header-value",
    },
  };

  interpret(input: AdapterInput): AdapterInterpretation {
    assertUniqueParameters(input.expression);
    let parsed: ReturnType<typeof parse>;
    try {
      parsed = parse(input.expression);
    } catch (error) {
      throw new SeiError(
        "E_CONTENT_TYPE_PARSE",
        error instanceof Error ? error.message : "Invalid Content-Type value.",
        { span: { start: 0, end: input.expression.length } },
      );
    }
    if (!/^[!#$%&'*+.^_`|~0-9A-Za-z-]+\/[!#$%&'*+.^_`|~0-9A-Za-z-]+$/.test(parsed.type)) {
      throw new SeiError(
        "E_CONTENT_TYPE_PARSE",
        "Content-Type must contain a valid type/subtype media type.",
        { span: { start: 0, end: input.expression.length } },
      );
    }
    const mediaType = parsed.type.toLowerCase();
    const parameters = Object.fromEntries(
      Object.entries(parsed.parameters)
        .map(([name, value]) => [name.toLowerCase(), value] as const)
        .sort(([left], [right]) => left < right ? -1 : left > right ? 1 : 0),
    );
    const slash = mediaType.indexOf("/");
    const subtype = mediaType.slice(slash + 1);
    const suffixIndex = subtype.lastIndexOf("+");
    let normalized: string;
    try {
      normalized = format({ type: mediaType, parameters });
    } catch (error) {
      throw new SeiError(
        "E_CONTENT_TYPE_PARSE",
        error instanceof Error ? error.message : "Invalid Content-Type value.",
        { span: { start: 0, end: input.expression.length } },
      );
    }
    return {
      normalized,
      value: {
        media_type: mediaType,
        type: mediaType.slice(0, slash),
        subtype,
        ...(suffixIndex < 0 ? {} : { suffix: subtype.slice(suffixIndex + 1) }),
        parameters,
      },
    };
  }

  query(
    interpretation: AdapterInterpretation,
    query: SeiQuery,
    _input: AdapterInput,
  ): JsonValue {
    if (query.name !== "parameter") {
      throw new SeiError(
        "E_QUERY_UNSUPPORTED",
        `Content-Type query '${query.name}' is not supported.`,
        { expected: { queries: ["parameter"] } },
      );
    }
    const name = query.arguments?.name;
    if (typeof name !== "string") {
      throw new SeiError(
        "E_QUERY_INVALID",
        "Content-Type query 'parameter' requires arguments.name as a string.",
      );
    }
    const value = interpretation.value as { parameters: Record<string, string> };
    return {
      name: name.toLowerCase(),
      present: Object.hasOwn(value.parameters, name.toLowerCase()),
      value: value.parameters[name.toLowerCase()] ?? null,
    };
  }

  detect(expression: string): DetectionCandidate | null {
    if (!/^\s*[!#$%&'*+.^_`|~0-9A-Za-z-]+\/[!#$%&'*+.^_`|~0-9A-Za-z-]+/.test(expression)) {
      return null;
    }
    try {
      assertUniqueParameters(expression.trim());
      parse(expression.trim());
      return {
        kind: "content_type",
        dialect: "http",
        confidence: 0.96,
        reason: "The input is a valid media type with optional Content-Type parameters.",
        supported: true,
      };
    } catch {
      return null;
    }
  }
}
