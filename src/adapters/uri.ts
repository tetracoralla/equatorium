import * as URI from "uri-js";
import { isIP } from "node:net";
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

interface StrictUriParts {
  scheme?: string;
  authority?: string;
  path: string;
  query?: string;
  fragment?: string;
}

const URI_STRUCTURE = /^(?:([A-Za-z][A-Za-z0-9+.-]*):)?(?:(\/\/)([^/?#]*))?([^?#]*)(?:\?([^#]*))?(?:#(.*))?$/;
const USERINFO = /^[A-Za-z0-9._~!$&'()*+,;=:%-]*$/;
const REG_NAME = /^[A-Za-z0-9._~!$&'()*+,;=%-]*$/;
const PATH = /^[A-Za-z0-9._~!$&'()*+,;=:@%\/-]*$/;
const QUERY_OR_FRAGMENT = /^[A-Za-z0-9._~!$&'()*+,;=:@%/?-]*$/;
const IPV_FUTURE = /^v[0-9A-Fa-f]+\.[A-Za-z0-9._~!$&'()*+,;=:-]+$/i;

function failUri(code: string, message: string): never {
  throw new SeiError(code, message);
}

function assertAuthority(authority: string, code: string): void {
  const delimiter = authority.lastIndexOf("@");
  if (delimiter !== authority.indexOf("@")) {
    failUri(code, "URI authority contains more than one unescaped userinfo delimiter.");
  }
  if (delimiter >= 0 && !USERINFO.test(authority.slice(0, delimiter))) {
    failUri(code, "URI userinfo contains a character outside the RFC 3986 grammar.");
  }
  const hostPort = authority.slice(delimiter + 1);
  if (hostPort.startsWith("[")) {
    const close = hostPort.indexOf("]");
    if (close < 0 || hostPort.indexOf("[", 1) >= 0 || hostPort.indexOf("]", close + 1) >= 0) {
      failUri(code, "URI IP literal must contain one balanced pair of square brackets.");
    }
    const literal = hostPort.slice(1, close);
    if (isIP(literal) !== 6 && !IPV_FUTURE.test(literal)) {
      failUri(code, "URI square-bracket host must be a valid IPv6 or IPvFuture literal.");
    }
    const suffix = hostPort.slice(close + 1);
    if (suffix !== "" && !/^:\d*$/.test(suffix)) {
      failUri(code, "URI IP literal may be followed only by a decimal port.");
    }
    return;
  }
  if (hostPort.includes("[") || hostPort.includes("]")) {
    failUri(code, "Square brackets are allowed only around a valid IP literal host.");
  }
  const colon = hostPort.lastIndexOf(":");
  if (colon !== hostPort.indexOf(":")) {
    failUri(code, "An IPv6 URI host must use square brackets.");
  }
  const host = colon < 0 ? hostPort : hostPort.slice(0, colon);
  const port = colon < 0 ? undefined : hostPort.slice(colon + 1);
  if (!REG_NAME.test(host)) {
    failUri(code, "URI registered-name host contains a character outside RFC 3986.");
  }
  if (port !== undefined && !/^\d*$/.test(port)) {
    failUri(code, "URI port must contain decimal digits only.");
  }
}

function parseStrictUri(
  value: string,
  options: { requireScheme: boolean; code: string; schemeRequiredCode?: string },
): StrictUriParts {
  if (!/^[\x21-\x7E]*$/.test(value)) {
    failUri(options.code, "URI input must contain visible ASCII characters only; use percent encoding for octets.");
  }
  if (/%(?![0-9A-Fa-f]{2})/.test(value)) {
    failUri(options.code, "Every URI percent escape must contain exactly two hexadecimal digits.");
  }
  const match = URI_STRUCTURE.exec(value);
  if (match === null) failUri(options.code, "Input does not match RFC 3986 URI-reference structure.");
  const [, scheme, authorityMarker, authority, path = "", query, fragment] = match;
  if (options.requireScheme && scheme === undefined) {
    failUri(
      options.schemeRequiredCode ?? options.code,
      "RFC 3986 URI input must include a scheme.",
    );
  }
  if (authorityMarker !== undefined) {
    assertAuthority(authority ?? "", options.code);
    if (path !== "" && !path.startsWith("/")) {
      failUri(options.code, "A URI path following an authority must be empty or begin with '/'.");
    }
  } else if (path.startsWith("//")) {
    failUri(options.code, "A URI path without an authority cannot begin with '//'.");
  }
  if (
    scheme === undefined &&
    authorityMarker === undefined &&
    !path.startsWith("/") &&
    (path.split("/", 1)[0] ?? "").includes(":")
  ) {
    failUri(options.code, "The first segment of a relative path cannot contain ':'.");
  }
  if (!PATH.test(path)) failUri(options.code, "URI path contains a character outside RFC 3986.");
  if (query !== undefined && !QUERY_OR_FRAGMENT.test(query)) {
    failUri(options.code, "URI query contains a character outside RFC 3986.");
  }
  if (fragment !== undefined && !QUERY_OR_FRAGMENT.test(fragment)) {
    failUri(options.code, "URI fragment contains a character outside RFC 3986.");
  }
  return {
    ...(scheme === undefined ? {} : { scheme }),
    ...(authorityMarker === undefined ? {} : { authority: authority ?? "" }),
    path,
    ...(query === undefined ? {} : { query }),
    ...(fragment === undefined ? {} : { fragment }),
  };
}

export class UriAdapter implements ExpressionAdapter {
  readonly descriptor: AdapterDescriptor = {
    kind: "uri",
    title: "RFC 3986 URI with scheme",
    summary: "Interpret and normalize RFC 3986 URI strings that include a scheme, with optional fragments.",
    dialects: ["rfc3986"],
    default_dialect: "rfc3986",
    capabilities: ["interpret", "validate", "normalize", "query.resolve", "query.equals"],
    interpretation_contract: {
      value_schema: {
        type: "object",
        properties: {
          scheme: { type: "string" },
          userinfo: { type: "string" },
          host: { type: "string" },
          port: { type: "string" },
          path: { type: "string" },
          query: { type: "string" },
          fragment: { type: "string" },
        },
        required: ["scheme", "path"],
        additionalProperties: false,
      },
    },
    query_contracts: [
      {
        name: "resolve",
        summary: "Resolve a bounded URI reference against this scheme-qualified URI.",
        arguments: {
          type: "object",
          properties: {
            reference: {
              type: "string",
              description: "URI reference to resolve.",
              max_length: 8192,
            },
          },
          required: ["reference"],
          additional_properties: false,
        },
        result_schema: {
          type: "object",
          properties: { reference: { type: "string" }, resolved: { type: "string" } },
          required: ["reference", "resolved"],
          additionalProperties: false,
        },
      },
      {
        name: "equals",
        summary: "Compare another URI using RFC-aware normalization.",
        arguments: {
          type: "object",
          properties: {
            uri: {
              type: "string",
              description: "URI to compare.",
              min_length: 1,
              max_length: 8192,
            },
          },
          required: ["uri"],
          additional_properties: false,
        },
        result_schema: {
          type: "object",
          properties: { uri: { type: "string" }, equals: { type: "boolean" } },
          required: ["uri", "equals"],
          additionalProperties: false,
        },
      },
    ],
    provenance: {
      spec: "RFC3986",
      engine: "uri-js",
      engine_version: packageVersion("uri-js"),
      compatibility_mode: "scheme-qualified-uri",
    },
  };

  interpret(input: AdapterInput): AdapterInterpretation {
    parseStrictUri(input.expression, {
      requireScheme: true,
      code: "E_URI_PARSE",
      schemeRequiredCode: "E_URI_SCHEME_REQUIRED",
    });
    const parsed = URI.parse(input.expression);
    if (parsed.error !== undefined) {
      throw new SeiError("E_URI_PARSE", parsed.error, {
        span: { start: 0, end: input.expression.length },
      });
    }
    if (parsed.scheme === undefined) {
      throw new SeiError("E_URI_SCHEME_REQUIRED", "RFC 3986 URI input must include a scheme.", {
        expected: { example: "https://example.com/path" },
      });
    }
    const normalized = URI.normalize(input.expression);
    const normalizedParts = URI.parse(normalized);
    if (normalizedParts.error !== undefined) {
      throw new SeiError("E_URI_PARSE", normalizedParts.error);
    }

    const diagnostics: Diagnostic[] = [];
    if (normalizedParts.userinfo !== undefined) {
      diagnostics.push({
        code: "W_URI_USERINFO",
        severity: "warning",
        message: "The URI contains userinfo; avoid embedding credentials in stored or logged URIs.",
      });
    }

    return {
      normalized,
      value: {
        scheme: normalizedParts.scheme ?? "",
        ...(normalizedParts.userinfo === undefined ? {} : { userinfo: normalizedParts.userinfo }),
        ...(normalizedParts.host === undefined ? {} : { host: normalizedParts.host }),
        ...(normalizedParts.port === undefined ? {} : { port: String(normalizedParts.port) }),
        path: normalizedParts.path ?? "",
        ...(normalizedParts.query === undefined ? {} : { query: normalizedParts.query }),
        ...(normalizedParts.fragment === undefined ? {} : { fragment: normalizedParts.fragment }),
      },
      diagnostics,
    };
  }

  query(
    interpretation: AdapterInterpretation,
    query: SeiQuery,
    _input: AdapterInput,
  ): JsonValue {
    const argumentsValue = query.arguments ?? {};
    if (query.name === "resolve") {
      const reference = argumentsValue.reference;
      if (typeof reference !== "string") {
        throw new SeiError(
          "E_QUERY_INVALID",
          "URI query 'resolve' requires arguments.reference as a URI reference string.",
        );
      }
      parseStrictUri(reference, { requireScheme: false, code: "E_QUERY_INVALID" });
      const resolved = URI.resolve(interpretation.normalized, reference);
      parseStrictUri(resolved, { requireScheme: true, code: "E_QUERY_INVALID" });
      const parsed = URI.parse(resolved);
      if (parsed.error !== undefined) {
        throw new SeiError("E_QUERY_INVALID", parsed.error);
      }
      return { reference, resolved };
    }
    if (query.name === "equals") {
      const candidate = argumentsValue.uri;
      if (typeof candidate !== "string") {
        throw new SeiError(
          "E_QUERY_INVALID",
          "URI query 'equals' requires arguments.uri as a URI string.",
        );
      }
      parseStrictUri(candidate, { requireScheme: true, code: "E_QUERY_INVALID" });
      return { uri: candidate, equals: URI.equal(interpretation.normalized, candidate) };
    }
    throw new SeiError("E_QUERY_UNSUPPORTED", `URI query '${query.name}' is not supported.`, {
      expected: { queries: ["resolve", "equals"] },
    });
  }

  detect(expression: string): DetectionCandidate | null {
    if (!/^[A-Za-z][A-Za-z0-9+.-]*:/.test(expression)) return null;
    try {
      parseStrictUri(expression, { requireScheme: true, code: "E_URI_PARSE" });
      const parsed = URI.parse(expression);
      if (parsed.error !== undefined || parsed.scheme === undefined) return null;
      return {
          kind: "uri",
          dialect: "rfc3986",
          confidence: 0.98,
          reason: "The input begins with a valid URI scheme and parses as an RFC 3986 URI.",
          supported: true,
        };
    } catch {
      return null;
    }
  }
}
