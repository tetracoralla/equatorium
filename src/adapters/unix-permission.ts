import type {
  AdapterDescriptor,
  DetectionCandidate,
  JsonValue,
  SeiConversion,
  SeiQuery,
} from "../contracts.js";
import type {
  AdapterInput,
  AdapterInterpretation,
  ExpressionAdapter,
} from "../core/adapter.js";
import { SeiError } from "../core/errors.js";

interface PermissionState {
  mode: number;
  symbolic: string;
}

const CLASSES = ["owner", "group", "other"] as const;
const PERMISSIONS = ["read", "write", "execute"] as const;

function parseSymbolic(value: string): number {
  if (!/^[r-][w-][xSs-][r-][w-][xSs-][r-][w-][xTt-]$/.test(value)) {
    throw new SeiError("E_PERMISSION_PARSE", "Invalid nine-character symbolic Unix mode.");
  }
  let mode = 0;
  for (let group = 0; group < 3; group += 1) {
    const offset = group * 3;
    let digit = 0;
    if (value[offset] === "r") digit += 4;
    if (value[offset + 1] === "w") digit += 2;
    const execute = value[offset + 2];
    if (execute === "x" || execute === "s" || execute === "t") digit += 1;
    mode |= digit << ((2 - group) * 3);
  }
  if (value[2] === "s" || value[2] === "S") mode |= 0o4000;
  if (value[5] === "s" || value[5] === "S") mode |= 0o2000;
  if (value[8] === "t" || value[8] === "T") mode |= 0o1000;
  return mode;
}

function parseMode(expression: string): number {
  const value = expression.trim();
  if (/^(?:0?[0-7]{3}|[0-7]{4})$/.test(value)) {
    return Number.parseInt(value, 8);
  }
  return parseSymbolic(value);
}

function symbolicFor(mode: number): string {
  const output: string[] = [];
  for (let group = 0; group < 3; group += 1) {
    const digit = (mode >> ((2 - group) * 3)) & 0o7;
    output.push(digit & 4 ? "r" : "-", digit & 2 ? "w" : "-");
    const execute = (digit & 1) !== 0;
    const special = group === 0 ? 0o4000 : group === 1 ? 0o2000 : 0o1000;
    if ((mode & special) !== 0) {
      output.push(group === 2 ? (execute ? "t" : "T") : execute ? "s" : "S");
    } else {
      output.push(execute ? "x" : "-");
    }
  }
  return output.join("");
}

function octalFor(mode: number): string {
  return mode.toString(8).padStart(4, "0");
}

export class UnixPermissionAdapter implements ExpressionAdapter {
  readonly descriptor: AdapterDescriptor = {
    kind: "unix_permission",
    title: "Unix permission mode",
    summary: "Interpret octal or nine-character symbolic Unix permission modes.",
    dialects: ["posix-mode"],
    default_dialect: "posix-mode",
    capabilities: ["interpret", "validate", "normalize", "query.allows", "convert"],
    interpretation_contract: {
      value_schema: {
        type: "object",
        properties: {
          octal: { type: "string", pattern: "^[0-7]{4}$" },
          symbolic: { type: "string", minLength: 9, maxLength: 9 },
          special: {
            type: "object",
            properties: {
              setuid: { type: "boolean" },
              setgid: { type: "boolean" },
              sticky: { type: "boolean" },
            },
            required: ["setuid", "setgid", "sticky"],
            additionalProperties: false,
          },
          classes: {
            type: "object",
            properties: Object.fromEntries(
              CLASSES.map((name) => [
                name,
                {
                  type: "object",
                  properties: {
                    read: { type: "boolean" },
                    write: { type: "boolean" },
                    execute: { type: "boolean" },
                  },
                  required: ["read", "write", "execute"],
                  additionalProperties: false,
                },
              ]),
            ),
            required: [...CLASSES],
            additionalProperties: false,
          },
        },
        required: ["octal", "symbolic", "special", "classes"],
        additionalProperties: false,
      },
    },
    query_contracts: [
      {
        name: "allows",
        summary: "Test one owner, group, or other permission bit.",
        arguments: {
          type: "object",
          properties: {
            subject: {
              type: "string",
              description: "Permission class.",
              enum: ["owner", "group", "other"],
            },
            permission: {
              type: "string",
              description: "Permission bit.",
              enum: ["read", "write", "execute"],
            },
          },
          required: ["subject", "permission"],
          additional_properties: false,
        },
        result_schema: {
          type: "object",
          properties: {
            subject: { enum: [...CLASSES] },
            permission: { enum: [...PERMISSIONS] },
            allows: { type: "boolean" },
          },
          required: ["subject", "permission", "allows"],
          additionalProperties: false,
        },
      },
    ],
    conversion_contract: {
      summary: "Convert the same POSIX mode between octal and symbolic representations.",
      target_dialects: ["posix-mode"],
      target_representations: ["octal", "symbolic"],
      arguments: {
        type: "object",
        properties: {},
        required: [],
        additional_properties: false,
      },
      result_schemas: {
        octal: {
          type: "object",
          properties: {
            representation: { const: "octal" },
            expression: { type: "string", pattern: "^[0-7]{4}$" },
          },
          required: ["representation", "expression"],
          additionalProperties: false,
        },
        symbolic: {
          type: "object",
          properties: {
            representation: { const: "symbolic" },
            expression: { type: "string", minLength: 9, maxLength: 9 },
          },
          required: ["representation", "expression"],
          additionalProperties: false,
        },
      },
    },
    provenance: {
      spec: "POSIX-file-mode-bits",
      engine: "sei-bounded-mode-parser",
      engine_version: "0.1.0",
      compatibility_mode: "permission-and-special-bits",
    },
  };

  interpret(input: AdapterInput): AdapterInterpretation {
    let mode: number;
    try {
      mode = parseMode(input.expression);
    } catch (error) {
      if (error instanceof SeiError) throw error;
      throw new SeiError("E_PERMISSION_PARSE", "Invalid Unix permission mode.", {
        span: { start: 0, end: input.expression.length },
      });
    }
    const symbolic = symbolicFor(mode);
    const classes = Object.fromEntries(
      CLASSES.map((name, index) => {
        const digit = (mode >> ((2 - index) * 3)) & 0o7;
        return [
          name,
          {
            read: (digit & 4) !== 0,
            write: (digit & 2) !== 0,
            execute: (digit & 1) !== 0,
          },
        ];
      }),
    );
    return {
      normalized: octalFor(mode),
      value: {
        octal: octalFor(mode),
        symbolic,
        special: {
          setuid: (mode & 0o4000) !== 0,
          setgid: (mode & 0o2000) !== 0,
          sticky: (mode & 0o1000) !== 0,
        },
        classes,
      },
      state: { mode, symbolic } satisfies PermissionState,
    };
  }

  query(
    interpretation: AdapterInterpretation,
    query: SeiQuery,
    _input: AdapterInput,
  ): JsonValue {
    if (query.name !== "allows") {
      throw new SeiError(
        "E_QUERY_UNSUPPORTED",
        `Unix permission query '${query.name}' is not supported.`,
        { expected: { queries: ["allows"] } },
      );
    }
    const subject = query.arguments?.subject;
    const permission = query.arguments?.permission;
    if (typeof subject !== "string" || !CLASSES.includes(subject as (typeof CLASSES)[number])) {
      throw new SeiError("E_QUERY_INVALID", "Permission query subject must be owner, group, or other.");
    }
    if (
      typeof permission !== "string" ||
      !PERMISSIONS.includes(permission as (typeof PERMISSIONS)[number])
    ) {
      throw new SeiError("E_QUERY_INVALID", "Permission must be read, write, or execute.");
    }
    const state = interpretation.state as PermissionState;
    const classIndex = CLASSES.indexOf(subject as (typeof CLASSES)[number]);
    const permissionBit = permission === "read" ? 4 : permission === "write" ? 2 : 1;
    const digit = (state.mode >> ((2 - classIndex) * 3)) & 0o7;
    return { subject, permission, allows: (digit & permissionBit) !== 0 };
  }

  convert(
    interpretation: AdapterInterpretation,
    conversion: SeiConversion,
    _input: AdapterInput,
  ): JsonValue {
    const state = interpretation.state as PermissionState;
    if (conversion.target_dialect !== undefined && conversion.target_dialect !== "posix-mode") {
      throw new SeiError("E_CONVERSION_UNSUPPORTED", "Unix modes only support target_dialect 'posix-mode'.");
    }
    if (conversion.target_representation === "octal") {
      return { representation: "octal", expression: octalFor(state.mode) };
    }
    if (conversion.target_representation === "symbolic") {
      return { representation: "symbolic", expression: state.symbolic };
    }
    throw new SeiError(
      "E_CONVERSION_UNSUPPORTED",
      "Unix mode conversion requires target_representation 'octal' or 'symbolic'.",
    );
  }

  detect(expression: string): DetectionCandidate | null {
    const value = expression.trim();
    if (/^0[0-7]{3}$/.test(value) || /^[r-][w-][xSs-][r-][w-][xSs-][r-][w-][xTt-]$/.test(value)) {
      return {
        kind: "unix_permission",
        dialect: "posix-mode",
        confidence: 0.96,
        reason: "The input has an explicit octal prefix or nine-character Unix permission shape.",
        supported: true,
      };
    }
    if (/^[1-7][0-7]{3}$/.test(value)) {
      return {
        kind: "unix_permission",
        dialect: "posix-mode",
        confidence: 0.88,
        reason: "Four octal digits represent Unix special and permission mode bits but may also be an integer.",
        supported: true,
      };
    }
    if (/^[0-7]{3}$/.test(value)) {
      return {
        kind: "unix_permission",
        dialect: "posix-mode",
        confidence: 0.72,
        reason: "Three octal digits commonly represent a Unix permission but may also be an integer.",
        supported: true,
      };
    }
    return null;
  }
}
