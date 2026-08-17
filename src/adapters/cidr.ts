import ipaddr from "ipaddr.js";
import type {
  AdapterDescriptor,
  DetectionCandidate,
  Diagnostic,
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

type Address = ipaddr.IPv4 | ipaddr.IPv6;

interface CidrState {
  network: Address;
  prefix: number;
  bitLength: number;
}

interface ParsedCidr {
  address: Address;
  prefix: number;
  bitLength: number;
}

function isStrictIpv4(value: string): boolean {
  const parts = value.split(".");
  return (
    parts.length === 4 &&
    parts.every(
      (part) =>
        /^(?:0|[1-9]\d{0,2})$/.test(part) &&
        Number.parseInt(part, 10) <= 255,
    )
  );
}

function parseStrictAddress(value: string, errorCode = "E_CIDR_PARSE"): Address {
  try {
    if (value.includes(":")) {
      if (value.includes("%") || !ipaddr.IPv6.isValid(value)) {
        throw new Error("Invalid strict IPv6 address.");
      }
      const embeddedIpv4 = value.match(/(?:^|:)([^:]+\.[^:]+)$/)?.[1];
      if (embeddedIpv4 !== undefined && !isStrictIpv4(embeddedIpv4)) {
        throw new Error("Embedded IPv4 must use four-part decimal notation.");
      }
      return ipaddr.IPv6.parse(value);
    }
    if (!isStrictIpv4(value)) {
      throw new Error("IPv4 must use four decimal octets without leading zeros.");
    }
    return ipaddr.IPv4.parse(value);
  } catch (error) {
    throw new SeiError(
      errorCode,
      error instanceof Error ? error.message : "Invalid strict IP address.",
    );
  }
}

function parseStrictCidr(value: string, errorCode = "E_CIDR_PARSE"): ParsedCidr {
  const slash = value.indexOf("/");
  if (slash <= 0 || slash !== value.lastIndexOf("/")) {
    throw new SeiError(errorCode, "CIDR must contain exactly one address/prefix separator.");
  }
  const addressText = value.slice(0, slash);
  const prefixText = value.slice(slash + 1);
  if (!/^(?:0|[1-9]\d{0,2})$/.test(prefixText)) {
    throw new SeiError(errorCode, "CIDR prefix must be an unsigned decimal integer.");
  }
  const address = parseStrictAddress(addressText, errorCode);
  const bitLength = address.kind() === "ipv4" ? 32 : 128;
  const prefix = Number.parseInt(prefixText, 10);
  if (prefix > bitLength) {
    throw new SeiError(errorCode, `CIDR prefix cannot exceed ${bitLength} for ${address.kind()}.`);
  }
  return { address, prefix, bitLength };
}

function addressString(address: Address): string {
  return address.kind() === "ipv6"
    ? (address as ipaddr.IPv6).toRFC5952String()
    : address.toString();
}

function networkParts(address: Address, prefix: number): {
  network: Address;
  last: Address;
  mask: Address;
} {
  const bytes = address.toByteArray();
  const maskBytes = bytes.map((_, index) => {
    const remaining = prefix - index * 8;
    if (remaining >= 8) return 255;
    if (remaining <= 0) return 0;
    return (0xff << (8 - remaining)) & 0xff;
  });
  const networkBytes = bytes.map((byte, index) => byte & (maskBytes[index] ?? 0));
  const lastBytes = networkBytes.map((byte, index) => byte | (0xff ^ (maskBytes[index] ?? 0)));
  return {
    network: ipaddr.fromByteArray(networkBytes),
    last: ipaddr.fromByteArray(lastBytes),
    mask: ipaddr.fromByteArray(maskBytes),
  };
}

function parseCidr(value: string, errorCode = "E_CIDR_PARSE"): CidrState {
  const { address, prefix, bitLength } = parseStrictCidr(value, errorCode);
  const { network } = networkParts(address, prefix);
  return { network, prefix, bitLength };
}

export class CidrAdapter implements ExpressionAdapter {
  readonly descriptor: AdapterDescriptor = {
    kind: "cidr",
    title: "IP network in CIDR notation",
    summary: "Interpret IPv4 and IPv6 networks and query containment or overlap.",
    dialects: ["cidr"],
    default_dialect: "cidr",
    capabilities: ["interpret", "validate", "normalize", "query.contains", "query.overlaps"],
    interpretation_contract: {
      value_schema: {
        type: "object",
        properties: {
          family: { enum: ["ipv4", "ipv6"] },
          network: { type: "string" },
          prefix: { type: "integer", minimum: 0, maximum: 128 },
          netmask: { type: "string" },
          first_address: { type: "string" },
          last_address: { type: "string" },
          address_count: { type: "string", pattern: "^[1-9]\\d*$" },
        },
        required: [
          "family", "network", "prefix", "netmask", "first_address", "last_address", "address_count",
        ],
        additionalProperties: false,
      },
    },
    query_contracts: [
      {
        name: "contains",
        summary: "Test whether one strict IPv4 or IPv6 address belongs to the network.",
        arguments: {
          type: "object",
          properties: {
            address: {
              type: "string",
              description: "Four-part decimal IPv4 or canonical-compatible IPv6 address.",
              min_length: 2,
              max_length: 45,
            },
          },
          required: ["address"],
          additional_properties: false,
        },
        result_schema: {
          type: "object",
          properties: { address: { type: "string" }, contains: { type: "boolean" } },
          required: ["address", "contains"],
          additionalProperties: false,
        },
      },
      {
        name: "overlaps",
        summary: "Test whether another strict CIDR overlaps this network.",
        arguments: {
          type: "object",
          properties: {
            cidr: {
              type: "string",
              description: "Strict IPv4 or IPv6 CIDR.",
              min_length: 4,
              max_length: 49,
            },
          },
          required: ["cidr"],
          additional_properties: false,
        },
        result_schema: {
          type: "object",
          properties: { cidr: { type: "string" }, overlaps: { type: "boolean" } },
          required: ["cidr", "overlaps"],
          additionalProperties: false,
        },
      },
    ],
    provenance: {
      spec: "RFC4632/RFC4291",
      engine: "ipaddr.js",
      engine_version: packageVersion("ipaddr.js"),
      compatibility_mode: "strict-cidr",
    },
  };

  interpret(input: AdapterInput): AdapterInterpretation {
    try {
      const { address, prefix, bitLength } = parseStrictCidr(input.expression);
      const { network, last, mask } = networkParts(address, prefix);
      const normalized = `${addressString(network)}/${prefix}`;
      const diagnostics: Diagnostic[] = [];
      if (addressString(address) !== addressString(network)) {
        diagnostics.push({
          code: "W_CIDR_HOST_BITS_CLEARED",
          severity: "warning",
          message: `Host bits were cleared in canonical network '${normalized}'.`,
        });
      }
      return {
        normalized,
        value: {
          family: address.kind(),
          network: addressString(network),
          prefix,
          netmask: addressString(mask),
          first_address: addressString(network),
          last_address: addressString(last),
          address_count: (1n << BigInt(bitLength - prefix)).toString(),
        },
        diagnostics,
        state: { network, prefix, bitLength } satisfies CidrState,
      };
    } catch (error) {
      if (error instanceof SeiError) {
        throw new SeiError(error.diagnostic.code, error.message, {
          span: { start: 0, end: input.expression.length },
        });
      }
      throw new SeiError(
        "E_CIDR_PARSE",
        error instanceof Error ? error.message : "Invalid CIDR expression.",
        { span: { start: 0, end: input.expression.length } },
      );
    }
  }

  query(
    interpretation: AdapterInterpretation,
    query: SeiQuery,
    _input: AdapterInput,
  ): JsonValue {
    const state = interpretation.state as CidrState;
    const argumentsValue = query.arguments ?? {};
    if (query.name === "contains") {
      const candidate = argumentsValue.address;
      if (typeof candidate !== "string") {
        throw new SeiError(
          "E_QUERY_INVALID",
          "CIDR query 'contains' requires arguments.address as an IP address.",
        );
      }
      try {
        const address = parseStrictAddress(candidate, "E_QUERY_INVALID");
        return {
          address: candidate,
          contains:
            address.kind() === state.network.kind() &&
            address.match([state.network, state.prefix]),
        };
      } catch (error) {
        if (error instanceof SeiError) throw error;
        throw new SeiError("E_QUERY_INVALID", `'${candidate}' is not a valid strict IP address.`);
      }
    }
    if (query.name === "overlaps") {
      const candidate = argumentsValue.cidr;
      if (typeof candidate !== "string") {
        throw new SeiError(
          "E_QUERY_INVALID",
          "CIDR query 'overlaps' requires arguments.cidr as a CIDR string.",
        );
      }
      const other = parseCidr(candidate, "E_QUERY_INVALID");
      const overlaps =
        other.network.kind() === state.network.kind() &&
        (state.network.match([other.network, other.prefix]) ||
          other.network.match([state.network, state.prefix]));
      return { cidr: candidate, overlaps };
    }
    throw new SeiError("E_QUERY_UNSUPPORTED", `CIDR query '${query.name}' is not supported.`, {
      expected: { queries: ["contains", "overlaps"] },
    });
  }

  detect(expression: string): DetectionCandidate | null {
    if (!/^[^/\s]+\/\d{1,3}$/.test(expression)) return null;
    try {
      parseStrictCidr(expression);
      return {
        kind: "cidr",
        dialect: "cidr",
        confidence: 0.99,
        reason: "The input is a valid IPv4 or IPv6 address with a prefix length.",
        supported: true,
      };
    } catch {
      return null;
    }
  }
}
