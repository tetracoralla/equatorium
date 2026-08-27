var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
  get: (a, b) => (typeof require !== "undefined" ? require : a)[b]
}) : x)(function(x) {
  if (typeof require !== "undefined") return require.apply(this, arguments);
  throw Error('Dynamic require of "' + x + '" is not supported');
});
var __esm = (fn, res, err) => function __init() {
  if (err) throw err[0];
  try {
    return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
  } catch (e) {
    throw err = [e], e;
  }
};
var __commonJS = (cb, mod) => function __require2() {
  try {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  } catch (e) {
    throw mod = 0, e;
  }
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// <define:__SEI_BUNDLED_ENGINE_VERSIONS__>
var define_SEI_BUNDLED_ENGINE_VERSIONS_default;
var init_define_SEI_BUNDLED_ENGINE_VERSIONS = __esm({
  "<define:__SEI_BUNDLED_ENGINE_VERSIONS__>"() {
    define_SEI_BUNDLED_ENGINE_VERSIONS_default = { "content-type": "2.0.0", "cron-parser": "5.8.1", "ipaddr.js": "2.5.0", "iso8601-duration": "2.1.4", rrule: "2.8.1", semver: "7.8.5", "uri-js": "4.4.1" };
  }
});

// node_modules/ipaddr.js/lib/ipaddr.js
var require_ipaddr = __commonJS({
  "node_modules/ipaddr.js/lib/ipaddr.js"(exports, module) {
    init_define_SEI_BUNDLED_ENGINE_VERSIONS();
    (function(root) {
      "use strict";
      const ipv4Part = "(0?\\d+|0x[a-f0-9]+)";
      const ipv4Regexes = {
        fourOctet: new RegExp(`^${ipv4Part}\\.${ipv4Part}\\.${ipv4Part}\\.${ipv4Part}$`, "i"),
        threeOctet: new RegExp(`^${ipv4Part}\\.${ipv4Part}\\.${ipv4Part}$`, "i"),
        twoOctet: new RegExp(`^${ipv4Part}\\.${ipv4Part}$`, "i"),
        longValue: new RegExp(`^${ipv4Part}$`, "i")
      };
      const octalRegex = new RegExp(`^0[0-7]+$`, "i");
      const hexRegex = new RegExp(`^0x[a-f0-9]+$`, "i");
      const zoneIndex = "%[0-9a-z]{1,}";
      const ipv6Part = "(?:[0-9a-f]+::?)+";
      const ipv6Regexes = {
        zoneIndex: new RegExp(zoneIndex, "i"),
        "native": new RegExp(`^(::)?(${ipv6Part})?([0-9a-f]+)?(::)?(${zoneIndex})?$`, "i"),
        deprecatedTransitional: new RegExp(`^(?:::)(${ipv4Part}\\.${ipv4Part}\\.${ipv4Part}\\.${ipv4Part}(${zoneIndex})?)$`, "i"),
        transitional: new RegExp(`^((?:${ipv6Part})|(?:::)(?:${ipv6Part})?)${ipv4Part}\\.${ipv4Part}\\.${ipv4Part}\\.${ipv4Part}(${zoneIndex})?$`, "i")
      };
      function expandIPv6(string, parts) {
        if (string.indexOf("::") !== string.lastIndexOf("::")) {
          return null;
        }
        let colonCount = 0;
        let lastColon = -1;
        let zoneId = (string.match(ipv6Regexes.zoneIndex) || [])[0];
        let replacement, replacementCount;
        if (zoneId) {
          zoneId = zoneId.substring(1);
          string = string.replace(/%.+$/, "");
        }
        while ((lastColon = string.indexOf(":", lastColon + 1)) >= 0) {
          colonCount++;
        }
        if (string.substr(0, 2) === "::") {
          colonCount--;
        }
        if (string.substr(-2, 2) === "::") {
          colonCount--;
        }
        if (colonCount >= parts) {
          return null;
        }
        replacementCount = parts - colonCount;
        replacement = ":";
        while (replacementCount--) {
          replacement += "0:";
        }
        string = string.replace("::", replacement);
        if (string[0] === ":") {
          string = string.slice(1);
        }
        if (string[string.length - 1] === ":") {
          string = string.slice(0, -1);
        }
        parts = (function() {
          const ref = string.split(":");
          const results = [];
          for (let i = 0; i < ref.length; i++) {
            results.push(ref[i].length > 4 ? NaN : parseInt(ref[i], 16));
          }
          return results;
        })();
        return {
          parts,
          zoneId
        };
      }
      function matchCIDR(first, second, partSize, cidrBits) {
        if (first.length !== second.length) {
          throw new Error("ipaddr: cannot match CIDR for objects with different lengths");
        }
        let part = 0;
        let shift;
        while (cidrBits > 0) {
          shift = partSize - cidrBits;
          if (shift < 0) {
            shift = 0;
          }
          if (first[part] >> shift !== second[part] >> shift) {
            return false;
          }
          cidrBits -= partSize;
          part += 1;
        }
        return true;
      }
      function parseIntAuto(string) {
        if (hexRegex.test(string)) {
          return parseInt(string, 16);
        }
        if (string[0] === "0" && !isNaN(parseInt(string[1], 10))) {
          if (octalRegex.test(string)) {
            return parseInt(string, 8);
          }
          throw new Error(`ipaddr: cannot parse ${string} as octal`);
        }
        return parseInt(string, 10);
      }
      function padPart(part, length) {
        while (part.length < length) {
          part = `0${part}`;
        }
        return part;
      }
      const ipaddr2 = {};
      ipaddr2.IPv4 = (function() {
        function IPv4(octets) {
          if (octets.length !== 4) {
            throw new Error("ipaddr: ipv4 octet count should be 4");
          }
          let i, octet;
          for (i = 0; i < octets.length; i++) {
            octet = octets[i];
            if (!(0 <= octet && octet <= 255)) {
              throw new Error("ipaddr: ipv4 octet should fit in 8 bits");
            }
          }
          this.octets = octets;
        }
        IPv4.prototype.SpecialRanges = {
          unspecified: [[new IPv4([0, 0, 0, 0]), 8]],
          broadcast: [[new IPv4([255, 255, 255, 255]), 32]],
          // RFC3171
          multicast: [[new IPv4([224, 0, 0, 0]), 4]],
          // RFC3927
          linkLocal: [[new IPv4([169, 254, 0, 0]), 16]],
          // RFC5735
          loopback: [[new IPv4([127, 0, 0, 0]), 8]],
          // RFC6598
          carrierGradeNat: [[new IPv4([100, 64, 0, 0]), 10]],
          // RFC1918
          "private": [
            [new IPv4([10, 0, 0, 0]), 8],
            [new IPv4([172, 16, 0, 0]), 12],
            [new IPv4([192, 168, 0, 0]), 16]
          ],
          // Reserved and testing-only ranges; RFCs 5735, 5737, 2544, 1700
          reserved: [
            [new IPv4([192, 0, 0, 0]), 24],
            [new IPv4([192, 0, 2, 0]), 24],
            [new IPv4([192, 88, 99, 0]), 24],
            [new IPv4([198, 18, 0, 0]), 15],
            [new IPv4([198, 51, 100, 0]), 24],
            [new IPv4([203, 0, 113, 0]), 24],
            [new IPv4([240, 0, 0, 0]), 4]
          ],
          // RFC7534, RFC7535
          as112: [
            [new IPv4([192, 175, 48, 0]), 24],
            [new IPv4([192, 31, 196, 0]), 24]
          ],
          // RFC7450
          amt: [
            [new IPv4([192, 52, 193, 0]), 24]
          ]
        };
        IPv4.prototype.kind = function() {
          return "ipv4";
        };
        IPv4.prototype.match = function(other, cidrRange) {
          let ref;
          if (cidrRange === void 0) {
            ref = other;
            other = ref[0];
            cidrRange = ref[1];
          }
          if (other.kind() !== "ipv4") {
            throw new Error("ipaddr: cannot match ipv4 address with non-ipv4 one");
          }
          return matchCIDR(this.octets, other.octets, 8, cidrRange);
        };
        IPv4.prototype.prefixLengthFromSubnetMask = function() {
          let cidr = 0;
          let stop = false;
          const zerotable = {
            0: 8,
            128: 7,
            192: 6,
            224: 5,
            240: 4,
            248: 3,
            252: 2,
            254: 1,
            255: 0
          };
          let i, octet, zeros;
          for (i = 3; i >= 0; i -= 1) {
            octet = this.octets[i];
            if (octet in zerotable) {
              zeros = zerotable[octet];
              if (stop && zeros !== 0) {
                return null;
              }
              if (zeros !== 8) {
                stop = true;
              }
              cidr += zeros;
            } else {
              return null;
            }
          }
          return 32 - cidr;
        };
        IPv4.prototype.range = function() {
          return ipaddr2.subnetMatch(this, this.SpecialRanges);
        };
        IPv4.prototype.toByteArray = function() {
          return this.octets.slice(0);
        };
        IPv4.prototype.toIPv4MappedAddress = function() {
          return ipaddr2.IPv6.parse(`::ffff:${this.toString()}`);
        };
        IPv4.prototype.toNormalizedString = function() {
          return this.toString();
        };
        IPv4.prototype.toString = function() {
          return this.octets.join(".");
        };
        return IPv4;
      })();
      ipaddr2.IPv4.broadcastAddressFromCIDR = function(string) {
        try {
          const cidr = this.parseCIDR(string);
          const ipInterfaceOctets = cidr[0].toByteArray();
          const subnetMaskOctets = this.subnetMaskFromPrefixLength(cidr[1]).toByteArray();
          const octets = [];
          let i = 0;
          while (i < 4) {
            octets.push(parseInt(ipInterfaceOctets[i], 10) | parseInt(subnetMaskOctets[i], 10) ^ 255);
            i++;
          }
          return new this(octets);
        } catch (e) {
          throw new Error("ipaddr: the address does not have IPv4 CIDR format", { cause: e });
        }
      };
      ipaddr2.IPv4.isIPv4 = function(string) {
        return this.parser(string) !== null;
      };
      ipaddr2.IPv4.isValid = function(string) {
        try {
          new this(this.parser(string));
          return true;
        } catch {
          return false;
        }
      };
      ipaddr2.IPv4.isValidCIDR = function(string) {
        try {
          this.parseCIDR(string);
          return true;
        } catch {
          return false;
        }
      };
      ipaddr2.IPv4.isValidFourPartDecimal = function(string) {
        if (ipaddr2.IPv4.isValid(string) && string.match(/^(0|[1-9]\d*)(\.(0|[1-9]\d*)){3}$/)) {
          return true;
        } else {
          return false;
        }
      };
      ipaddr2.IPv4.isValidCIDRFourPartDecimal = function(string) {
        const match = string.match(/^(.+)\/(\d+)$/);
        if (!ipaddr2.IPv4.isValidCIDR(string) || !match) {
          return false;
        }
        return ipaddr2.IPv4.isValidFourPartDecimal(match[1]);
      };
      ipaddr2.IPv4.networkAddressFromCIDR = function(string) {
        let cidr, i, ipInterfaceOctets, octets, subnetMaskOctets;
        try {
          cidr = this.parseCIDR(string);
          ipInterfaceOctets = cidr[0].toByteArray();
          subnetMaskOctets = this.subnetMaskFromPrefixLength(cidr[1]).toByteArray();
          octets = [];
          i = 0;
          while (i < 4) {
            octets.push(parseInt(ipInterfaceOctets[i], 10) & parseInt(subnetMaskOctets[i], 10));
            i++;
          }
          return new this(octets);
        } catch (e) {
          throw new Error("ipaddr: the address does not have IPv4 CIDR format", { cause: e });
        }
      };
      ipaddr2.IPv4.parse = function(string) {
        const parts = this.parser(string);
        if (parts === null) {
          throw new Error("ipaddr: string is not formatted like an IPv4 Address");
        }
        return new this(parts);
      };
      ipaddr2.IPv4.parseCIDR = function(string) {
        let match;
        if (match = string.match(/^(.+)\/(\d+)$/)) {
          const maskLength = parseInt(match[2]);
          if (maskLength >= 0 && maskLength <= 32) {
            const parsed = [this.parse(match[1]), maskLength];
            Object.defineProperty(parsed, "toString", {
              value: function() {
                return this.join("/");
              }
            });
            return parsed;
          }
        }
        throw new Error("ipaddr: string is not formatted like an IPv4 CIDR range");
      };
      ipaddr2.IPv4.parser = function(string) {
        let match, part, value;
        if (match = string.match(ipv4Regexes.fourOctet)) {
          return (function() {
            const ref = match.slice(1, 6);
            const results = [];
            for (let i = 0; i < ref.length; i++) {
              part = ref[i];
              results.push(parseIntAuto(part));
            }
            return results;
          })();
        } else if (match = string.match(ipv4Regexes.longValue)) {
          value = parseIntAuto(match[1]);
          if (value > 4294967295 || value < 0) {
            throw new Error("ipaddr: address outside defined range");
          }
          return (function() {
            const results = [];
            let shift;
            for (shift = 0; shift <= 24; shift += 8) {
              results.push(value >> shift & 255);
            }
            return results;
          })().reverse();
        } else if (match = string.match(ipv4Regexes.twoOctet)) {
          return (function() {
            const ref = match.slice(1, 4);
            const results = [];
            value = parseIntAuto(ref[1]);
            if (value > 16777215 || value < 0) {
              throw new Error("ipaddr: address outside defined range");
            }
            results.push(parseIntAuto(ref[0]));
            results.push(value >> 16 & 255);
            results.push(value >> 8 & 255);
            results.push(value & 255);
            return results;
          })();
        } else if (match = string.match(ipv4Regexes.threeOctet)) {
          return (function() {
            const ref = match.slice(1, 5);
            const results = [];
            value = parseIntAuto(ref[2]);
            if (value > 65535 || value < 0) {
              throw new Error("ipaddr: address outside defined range");
            }
            results.push(parseIntAuto(ref[0]));
            results.push(parseIntAuto(ref[1]));
            results.push(value >> 8 & 255);
            results.push(value & 255);
            return results;
          })();
        } else {
          return null;
        }
      };
      ipaddr2.IPv4.subnetMaskFromPrefixLength = function(prefix) {
        prefix = parseInt(prefix);
        if (Number.isNaN(prefix) || prefix < 0 || prefix > 32) {
          throw new Error("ipaddr: invalid IPv4 prefix length");
        }
        const octets = [0, 0, 0, 0];
        let j = 0;
        const filledOctetCount = Math.floor(prefix / 8);
        while (j < filledOctetCount) {
          octets[j] = 255;
          j++;
        }
        if (filledOctetCount < 4) {
          octets[filledOctetCount] = Math.pow(2, prefix % 8) - 1 << 8 - prefix % 8;
        }
        return new this(octets);
      };
      ipaddr2.IPv6 = (function() {
        function IPv6(parts, zoneId) {
          let i, part;
          if (parts.length === 16) {
            this.parts = [];
            for (i = 0; i <= 14; i += 2) {
              this.parts.push(parts[i] << 8 | parts[i + 1]);
            }
          } else if (parts.length === 8) {
            this.parts = parts;
          } else {
            throw new Error("ipaddr: ipv6 part count should be 8 or 16");
          }
          for (i = 0; i < this.parts.length; i++) {
            part = this.parts[i];
            if (!(0 <= part && part <= 65535)) {
              throw new Error("ipaddr: ipv6 part should fit in 16 bits");
            }
          }
          if (zoneId) {
            this.zoneId = zoneId;
          }
        }
        IPv6.prototype.SpecialRanges = {
          // RFC4291, here and after
          unspecified: [new IPv6([0, 0, 0, 0, 0, 0, 0, 0]), 128],
          linkLocal: [new IPv6([65152, 0, 0, 0, 0, 0, 0, 0]), 10],
          multicast: [new IPv6([65280, 0, 0, 0, 0, 0, 0, 0]), 8],
          loopback: [new IPv6([0, 0, 0, 0, 0, 0, 0, 1]), 128],
          uniqueLocal: [new IPv6([64512, 0, 0, 0, 0, 0, 0, 0]), 7],
          ipv4Mapped: [new IPv6([0, 0, 0, 0, 0, 65535, 0, 0]), 96],
          // RFC3879
          deprecatedSiteLocal: [new IPv6([65216, 0, 0, 0, 0, 0, 0, 0]), 10],
          // RFC6666
          discard: [new IPv6([256, 0, 0, 0, 0, 0, 0, 0]), 64],
          // RFC6145
          rfc6145: [new IPv6([0, 0, 0, 0, 65535, 0, 0, 0]), 96],
          rfc6052: [
            // RFC6052
            [new IPv6([100, 65435, 0, 0, 0, 0, 0, 0]), 96],
            // RFC8215
            [new IPv6([100, 65435, 1, 0, 0, 0, 0, 0]), 48]
          ],
          // RFC3056
          "6to4": [new IPv6([8194, 0, 0, 0, 0, 0, 0, 0]), 16],
          // RFC6052, RFC6146
          teredo: [new IPv6([8193, 0, 0, 0, 0, 0, 0, 0]), 32],
          // RFC5180
          benchmarking: [new IPv6([8193, 2, 0, 0, 0, 0, 0, 0]), 48],
          // RFC7450
          amt: [new IPv6([8193, 3, 0, 0, 0, 0, 0, 0]), 32],
          as112v6: [
            // RFC7535
            [new IPv6([8193, 4, 274, 0, 0, 0, 0, 0]), 48],
            // RFC7534
            [new IPv6([9760, 79, 32768, 0, 0, 0, 0, 0]), 48]
          ],
          // RFC4843
          deprecatedOrchid: [new IPv6([8193, 16, 0, 0, 0, 0, 0, 0]), 28],
          // RFC7343
          orchid2: [new IPv6([8193, 32, 0, 0, 0, 0, 0, 0]), 28],
          // RFC9374
          droneRemoteIdProtocolEntityTags: [new IPv6([8193, 48, 0, 0, 0, 0, 0, 0]), 28],
          // RFC9602
          segmentRouting: [new IPv6([24320, 0, 0, 0, 0, 0, 0, 0]), 16],
          reserved: [
            // RFC3849
            [new IPv6([8193, 0, 0, 0, 0, 0, 0, 0]), 23],
            // RFC2928
            [new IPv6([8193, 3512, 0, 0, 0, 0, 0, 0]), 32],
            // RFC9637
            [new IPv6([16383, 0, 0, 0, 0, 0, 0, 0]), 20]
          ]
        };
        IPv6.prototype.isIPv4MappedAddress = function() {
          return this.range() === "ipv4Mapped";
        };
        IPv6.prototype.kind = function() {
          return "ipv6";
        };
        IPv6.prototype.match = function(other, cidrRange) {
          let ref;
          if (cidrRange === void 0) {
            ref = other;
            other = ref[0];
            cidrRange = ref[1];
          }
          if (other.kind() !== "ipv6") {
            throw new Error("ipaddr: cannot match ipv6 address with non-ipv6 one");
          }
          return matchCIDR(this.parts, other.parts, 16, cidrRange);
        };
        IPv6.prototype.prefixLengthFromSubnetMask = function() {
          let cidr = 0;
          let stop = false;
          const zerotable = {
            0: 16,
            32768: 15,
            49152: 14,
            57344: 13,
            61440: 12,
            63488: 11,
            64512: 10,
            65024: 9,
            65280: 8,
            65408: 7,
            65472: 6,
            65504: 5,
            65520: 4,
            65528: 3,
            65532: 2,
            65534: 1,
            65535: 0
          };
          let part, zeros;
          for (let i = 7; i >= 0; i -= 1) {
            part = this.parts[i];
            if (part in zerotable) {
              zeros = zerotable[part];
              if (stop && zeros !== 0) {
                return null;
              }
              if (zeros !== 16) {
                stop = true;
              }
              cidr += zeros;
            } else {
              return null;
            }
          }
          return 128 - cidr;
        };
        IPv6.prototype.range = function() {
          return ipaddr2.subnetMatch(this, this.SpecialRanges);
        };
        IPv6.prototype.toByteArray = function() {
          let part;
          const bytes = [];
          const ref = this.parts;
          for (let i = 0; i < ref.length; i++) {
            part = ref[i];
            bytes.push(part >> 8);
            bytes.push(part & 255);
          }
          return bytes;
        };
        IPv6.prototype.toFixedLengthString = function() {
          const addr = (function() {
            const results = [];
            for (let i = 0; i < this.parts.length; i++) {
              results.push(padPart(this.parts[i].toString(16), 4));
            }
            return results;
          }).call(this).join(":");
          let suffix = "";
          if (this.zoneId) {
            suffix = `%${this.zoneId}`;
          }
          return addr + suffix;
        };
        IPv6.prototype.toIPv4Address = function() {
          if (!this.isIPv4MappedAddress()) {
            throw new Error("ipaddr: trying to convert a generic ipv6 address to ipv4");
          }
          const ref = this.parts.slice(-2);
          const high = ref[0];
          const low = ref[1];
          return new ipaddr2.IPv4([high >> 8, high & 255, low >> 8, low & 255]);
        };
        IPv6.prototype.toNormalizedString = function() {
          const addr = (function() {
            const results = [];
            for (let i = 0; i < this.parts.length; i++) {
              results.push(this.parts[i].toString(16));
            }
            return results;
          }).call(this).join(":");
          let suffix = "";
          if (this.zoneId) {
            suffix = `%${this.zoneId}`;
          }
          return addr + suffix;
        };
        IPv6.prototype.toRFC5952String = function() {
          const regex = /((^|:)(0(:|$)){2,})/g;
          let suffix = "";
          if (this.zoneId) {
            suffix = `%${this.zoneId}`;
          }
          const normalized = this.toNormalizedString();
          const string = normalized.slice(0, normalized.length - suffix.length);
          let bestMatchIndex = 0;
          let bestMatchLength = -1;
          let bestMatchGroups = -1;
          let match;
          while (match = regex.exec(string)) {
            const groups = (match[0].match(/0/g) || []).length;
            if (groups > bestMatchGroups) {
              bestMatchGroups = groups;
              bestMatchIndex = match.index;
              bestMatchLength = match[0].length;
            }
          }
          if (bestMatchLength < 0) {
            return string + suffix;
          }
          return `${string.substring(0, bestMatchIndex)}::${string.substring(bestMatchIndex + bestMatchLength)}${suffix}`;
        };
        IPv6.prototype.toString = function() {
          return this.toRFC5952String();
        };
        return IPv6;
      })();
      ipaddr2.IPv6.broadcastAddressFromCIDR = function(string) {
        try {
          const cidr = this.parseCIDR(string);
          const ipInterfaceOctets = cidr[0].toByteArray();
          const subnetMaskOctets = this.subnetMaskFromPrefixLength(cidr[1]).toByteArray();
          const octets = [];
          let i = 0;
          while (i < 16) {
            octets.push(parseInt(ipInterfaceOctets[i], 10) | parseInt(subnetMaskOctets[i], 10) ^ 255);
            i++;
          }
          return new this(octets);
        } catch (e) {
          throw new Error("ipaddr: the address does not have IPv6 CIDR format", { cause: e });
        }
      };
      ipaddr2.IPv6.isIPv6 = function(string) {
        return this.parser(string) !== null;
      };
      ipaddr2.IPv6.isValid = function(string) {
        if (typeof string === "string" && string.indexOf(":") === -1) {
          return false;
        }
        try {
          const addr = this.parser(string);
          new this(addr.parts, addr.zoneId);
          return true;
        } catch {
          return false;
        }
      };
      ipaddr2.IPv6.isValidCIDR = function(string) {
        if (typeof string === "string" && string.indexOf(":") === -1) {
          return false;
        }
        try {
          this.parseCIDR(string);
          return true;
        } catch {
          return false;
        }
      };
      ipaddr2.IPv6.networkAddressFromCIDR = function(string) {
        let cidr, i, ipInterfaceOctets, octets, subnetMaskOctets;
        try {
          cidr = this.parseCIDR(string);
          ipInterfaceOctets = cidr[0].toByteArray();
          subnetMaskOctets = this.subnetMaskFromPrefixLength(cidr[1]).toByteArray();
          octets = [];
          i = 0;
          while (i < 16) {
            octets.push(parseInt(ipInterfaceOctets[i], 10) & parseInt(subnetMaskOctets[i], 10));
            i++;
          }
          return new this(octets);
        } catch (e) {
          throw new Error("ipaddr: the address does not have IPv6 CIDR format", { cause: e });
        }
      };
      ipaddr2.IPv6.parse = function(string) {
        const addr = this.parser(string);
        if (addr === null) {
          throw new Error("ipaddr: string is not formatted like an IPv6 Address");
        }
        return new this(addr.parts, addr.zoneId);
      };
      ipaddr2.IPv6.parseCIDR = function(string) {
        let maskLength, match, parsed;
        if (match = string.match(/^(.+)\/(\d+)$/)) {
          maskLength = parseInt(match[2]);
          if (maskLength >= 0 && maskLength <= 128) {
            parsed = [this.parse(match[1]), maskLength];
            Object.defineProperty(parsed, "toString", {
              value: function() {
                return this.join("/");
              }
            });
            return parsed;
          }
        }
        throw new Error("ipaddr: string is not formatted like an IPv6 CIDR range");
      };
      ipaddr2.IPv6.parser = function(string) {
        let addr, i, match, octet, octets, zoneId;
        if (match = string.match(ipv6Regexes.deprecatedTransitional)) {
          return this.parser(`::ffff:${match[1]}`);
        }
        if (ipv6Regexes.native.test(string)) {
          return expandIPv6(string, 8);
        }
        if (match = string.match(ipv6Regexes.transitional)) {
          zoneId = match[6] || "";
          addr = match[1];
          if (!match[1].endsWith("::")) {
            addr = addr.slice(0, -1);
          }
          addr = expandIPv6(addr + zoneId, 6);
          if (addr && addr.parts) {
            octets = [
              parseInt(match[2]),
              parseInt(match[3]),
              parseInt(match[4]),
              parseInt(match[5])
            ];
            for (i = 0; i < octets.length; i++) {
              octet = octets[i];
              if (!(0 <= octet && octet <= 255)) {
                return null;
              }
            }
            addr.parts.push(octets[0] << 8 | octets[1]);
            addr.parts.push(octets[2] << 8 | octets[3]);
            return {
              parts: addr.parts,
              zoneId: addr.zoneId
            };
          }
        }
        return null;
      };
      ipaddr2.IPv6.subnetMaskFromPrefixLength = function(prefix) {
        prefix = parseInt(prefix);
        if (Number.isNaN(prefix) || prefix < 0 || prefix > 128) {
          throw new Error("ipaddr: invalid IPv6 prefix length");
        }
        const octets = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        let j = 0;
        const filledOctetCount = Math.floor(prefix / 8);
        while (j < filledOctetCount) {
          octets[j] = 255;
          j++;
        }
        if (filledOctetCount < 16) {
          octets[filledOctetCount] = Math.pow(2, prefix % 8) - 1 << 8 - prefix % 8;
        }
        return new this(octets);
      };
      ipaddr2.fromByteArray = function(bytes) {
        const length = bytes.length;
        if (length === 4) {
          return new ipaddr2.IPv4(bytes);
        } else if (length === 16) {
          return new ipaddr2.IPv6(bytes);
        } else {
          throw new Error("ipaddr: the binary input is neither an IPv6 nor IPv4 address");
        }
      };
      ipaddr2.isValid = function(string) {
        return ipaddr2.IPv6.isValid(string) || ipaddr2.IPv4.isValid(string);
      };
      ipaddr2.isValidCIDR = function(string) {
        return ipaddr2.IPv6.isValidCIDR(string) || ipaddr2.IPv4.isValidCIDR(string);
      };
      ipaddr2.parse = function(string) {
        if (ipaddr2.IPv6.isValid(string)) {
          return ipaddr2.IPv6.parse(string);
        } else if (ipaddr2.IPv4.isValid(string)) {
          return ipaddr2.IPv4.parse(string);
        } else {
          throw new Error("ipaddr: the address has neither IPv6 nor IPv4 format");
        }
      };
      ipaddr2.parseCIDR = function(string) {
        try {
          return ipaddr2.IPv6.parseCIDR(string);
        } catch {
          try {
            return ipaddr2.IPv4.parseCIDR(string);
          } catch (e) {
            throw new Error("ipaddr: the address has neither IPv6 nor IPv4 CIDR format", { cause: e });
          }
        }
      };
      ipaddr2.process = function(string) {
        const addr = this.parse(string);
        if (addr.kind() === "ipv6" && addr.isIPv4MappedAddress()) {
          return addr.toIPv4Address();
        } else {
          return addr;
        }
      };
      ipaddr2.subnetMatch = function(address, rangeList, defaultName) {
        let i, rangeName, rangeSubnets, subnet;
        if (defaultName === void 0 || defaultName === null) {
          defaultName = "unicast";
        }
        for (rangeName in rangeList) {
          if (Object.prototype.hasOwnProperty.call(rangeList, rangeName)) {
            rangeSubnets = rangeList[rangeName];
            if (rangeSubnets[0] && !(rangeSubnets[0] instanceof Array)) {
              rangeSubnets = [rangeSubnets];
            }
            for (i = 0; i < rangeSubnets.length; i++) {
              subnet = rangeSubnets[i];
              if (address.kind() === subnet[0].kind() && address.match.apply(address, subnet)) {
                return rangeName;
              }
            }
          }
        }
        return defaultName;
      };
      if (typeof module !== "undefined" && module.exports) {
        module.exports = ipaddr2;
      } else {
        root.ipaddr = ipaddr2;
      }
    })(exports);
  }
});

// node_modules/content-type/dist/index.js
var require_dist = __commonJS({
  "node_modules/content-type/dist/index.js"(exports) {
    "use strict";
    init_define_SEI_BUNDLED_ENGINE_VERSIONS();
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.format = format2;
    exports.parse = parse5;
    var TEXT_REGEXP = /^[\u0009\u0020-\u007e\u0080-\u00ff]*$/;
    var TOKEN_REGEXP = /^[!#$%&'*+.^_`|~0-9A-Za-z-]+$/;
    var QUOTE_REGEXP = /[\\"]/g;
    var TYPE_REGEXP = /^[!#$%&'*+.^_`|~0-9A-Za-z-]+\/[!#$%&'*+.^_`|~0-9A-Za-z-]+$/;
    var NullObject = /* @__PURE__ */ (() => {
      const C = function() {
      };
      C.prototype = /* @__PURE__ */ Object.create(null);
      return C;
    })();
    function format2(obj) {
      const { type, parameters } = obj;
      if (!type || !TYPE_REGEXP.test(type)) {
        throw new TypeError(`Invalid type: ${type}`);
      }
      let result = type;
      if (parameters) {
        for (const param of Object.keys(parameters)) {
          if (!TOKEN_REGEXP.test(param)) {
            throw new TypeError(`Invalid parameter name: ${param}`);
          }
          result += `; ${param}=${qstring(parameters[param])}`;
        }
      }
      return result;
    }
    function parse5(header, options) {
      const len = header.length;
      let index = skipOWS(header, 0, len);
      const valueStart = index;
      index = skipValue(header, index, len);
      const valueEnd = trailingOWS(header, valueStart, index);
      const type = header.slice(valueStart, valueEnd).toLowerCase();
      const parameters = options?.parameters === false ? new NullObject() : parseParameters(header, index, len);
      return { type, parameters };
    }
    var SP = 32;
    var HTAB = 9;
    var SEMI = 59;
    var EQ = 61;
    var DQUOTE = 34;
    var BSLASH = 92;
    function parseParameters(header, index, len) {
      const parameters = new NullObject();
      parameter: while (index < len) {
        index = skipOWS(header, index + 1, len);
        const keyStart = index;
        while (index < len) {
          const code = header.charCodeAt(index);
          if (code === SEMI)
            continue parameter;
          if (code === EQ) {
            const keyEnd = trailingOWS(header, keyStart, index);
            const key = header.slice(keyStart, keyEnd).toLowerCase();
            index = skipOWS(header, index + 1, len);
            if (index < len && header.charCodeAt(index) === DQUOTE) {
              index++;
              let value = "";
              while (index < len) {
                const code2 = header.charCodeAt(index++);
                if (code2 === DQUOTE) {
                  index = skipValue(header, index, len);
                  if (parameters[key] === void 0)
                    parameters[key] = value;
                  break;
                }
                if (code2 === BSLASH && index < len) {
                  value += header[index++];
                  continue;
                }
                value += String.fromCharCode(code2);
              }
              continue parameter;
            }
            const valueStart = index;
            index = skipValue(header, index, len);
            if (parameters[key] === void 0) {
              const valueEnd = trailingOWS(header, valueStart, index);
              parameters[key] = header.slice(valueStart, valueEnd);
            }
            continue parameter;
          }
          index++;
        }
      }
      return parameters;
    }
    function skipValue(str, index, len) {
      while (index < len) {
        const char = str.charCodeAt(index);
        if (char === SEMI)
          break;
        index++;
      }
      return index;
    }
    function skipOWS(header, index, len) {
      while (index < len) {
        const char = header.charCodeAt(index);
        if (char !== SP && char !== HTAB)
          break;
        index++;
      }
      return index;
    }
    function trailingOWS(header, start, end) {
      while (end > start) {
        const char = header.charCodeAt(end - 1);
        if (char !== SP && char !== HTAB)
          break;
        end--;
      }
      return end;
    }
    function qstring(str) {
      if (TOKEN_REGEXP.test(str))
        return str;
      if (TEXT_REGEXP.test(str))
        return `"${str.replace(QUOTE_REGEXP, "\\$&")}"`;
      throw new TypeError(`Invalid parameter value: ${str}`);
    }
  }
});

// node_modules/cron-parser/dist/fields/types.js
var require_types = __commonJS({
  "node_modules/cron-parser/dist/fields/types.js"(exports) {
    "use strict";
    init_define_SEI_BUNDLED_ENGINE_VERSIONS();
    Object.defineProperty(exports, "__esModule", { value: true });
  }
});

// node_modules/cron-parser/dist/fields/CronField.js
var require_CronField = __commonJS({
  "node_modules/cron-parser/dist/fields/CronField.js"(exports) {
    "use strict";
    init_define_SEI_BUNDLED_ENGINE_VERSIONS();
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.CronField = void 0;
    var CronField = class _CronField {
      #hasLastChar = false;
      #hasQuestionMarkChar = false;
      #wildcard = false;
      #values = [];
      options = { rawValue: "" };
      /**
       * Returns the minimum value allowed for this field.
       */
      /* istanbul ignore next */
      static get min() {
        throw new Error("min must be overridden");
      }
      /**
       * Returns the maximum value allowed for this field.
       */
      /* istanbul ignore next */
      static get max() {
        throw new Error("max must be overridden");
      }
      /**
       * Returns the allowed characters for this field.
       */
      /* istanbul ignore next */
      static get chars() {
        return Object.freeze([]);
      }
      /**
       * Returns the regular expression used to validate this field.
       */
      static get validChars() {
        return /^[?,*\dH/-]+$|^.*H\(\d+-\d+\)\/\d+.*$|^.*H\(\d+-\d+\).*$|^.*H\/\d+.*$/;
      }
      /**
       * Returns the constraints for this field.
       */
      static get constraints() {
        return { min: this.min, max: this.max, chars: this.chars, validChars: this.validChars };
      }
      /**
       * CronField constructor. Initializes the field with the provided values.
       * @param {number[] | string[]} values - Values for this field
       * @param {CronFieldOptions} [options] - Options provided by the parser
       * @throws {TypeError} if the constructor is called directly
       * @throws {Error} if validation fails
       */
      constructor(values, options = { rawValue: "" }) {
        if (!Array.isArray(values)) {
          throw new Error(`${this.constructor.name} Validation error, values is not an array`);
        }
        if (!(values.length > 0)) {
          throw new Error(`${this.constructor.name} Validation error, values contains no values`);
        }
        this.options = {
          ...options,
          rawValue: options.rawValue ?? ""
        };
        this.#values = [...values].sort(_CronField.sorter);
        this.#wildcard = this.options.wildcard !== void 0 ? this.options.wildcard : this.#isWildcardValue();
        this.#hasLastChar = this.options.rawValue.includes("L") || values.includes("L");
        this.#hasQuestionMarkChar = this.options.rawValue.includes("?") || values.includes("?");
      }
      /**
       * Returns the minimum value allowed for this field.
       * @returns {number}
       */
      get min() {
        return this.constructor.min;
      }
      /**
       * Returns the maximum value allowed for this field.
       * @returns {number}
       */
      get max() {
        return this.constructor.max;
      }
      /**
       * Returns an array of allowed special characters for this field.
       * @returns {string[]}
       */
      get chars() {
        return this.constructor.chars;
      }
      /**
       * Indicates whether this field has a "last" character.
       * @returns {boolean}
       */
      get hasLastChar() {
        return this.#hasLastChar;
      }
      /**
       * Indicates whether this field has a "question mark" character.
       * @returns {boolean}
       */
      get hasQuestionMarkChar() {
        return this.#hasQuestionMarkChar;
      }
      /**
       * Indicates whether this field is a wildcard.
       * @returns {boolean}
       */
      get isWildcard() {
        return this.#wildcard;
      }
      /**
       * Returns an array of allowed values for this field.
       * @returns {CronFieldType}
       */
      get values() {
        return this.#values;
      }
      /**
       * Helper function to sort values in ascending order.
       * @param {number | string} a - First value to compare
       * @param {number | string} b - Second value to compare
       * @returns {number} - A negative, zero, or positive value, depending on the sort order
       */
      static sorter(a, b) {
        const aIsNumber = typeof a === "number";
        const bIsNumber = typeof b === "number";
        if (aIsNumber && bIsNumber)
          return a - b;
        if (!aIsNumber && !bIsNumber)
          return a.localeCompare(b);
        return aIsNumber ? (
          /* istanbul ignore next - A will always be a number until L-2 is supported */
          -1
        ) : 1;
      }
      /**
       * Find the next (or previous when `reverse` is true) numeric value in a sorted list.
       * Returns null if there's no value strictly after/before the current one.
       *
       * @param values - Sorted numeric values
       * @param currentValue - Current value to compare against
       * @param reverse - When true, search in reverse for previous smaller value
       */
      static findNearestValueInList(values, currentValue, reverse) {
        if (reverse) {
          for (let i = values.length - 1; i >= 0; i--) {
            if (values[i] < currentValue)
              return values[i];
          }
          return null;
        }
        for (let i = 0; i < values.length; i++) {
          if (values[i] > currentValue)
            return values[i];
        }
        return null;
      }
      /**
       * Instance helper that operates on this field's numeric `values`.
       *
       * @param currentValue - Current value to compare against
       * @param reverse - When true, search in reverse for previous smaller value
       */
      findNearestValue(currentValue, reverse) {
        return this.constructor.findNearestValueInList(this.values, currentValue, reverse);
      }
      /**
       * Serializes the field to an object.
       * @returns {SerializedCronField}
       */
      serialize() {
        return {
          wildcard: this.#wildcard,
          values: this.#values
        };
      }
      /**
       * Validates the field values against the allowed range and special characters.
       * @throws {Error} if validation fails
       */
      validate() {
        let badValue;
        const charsString = this.chars.length > 0 ? ` or chars ${this.chars.join("")}` : "";
        const charTest = (value) => (char) => new RegExp(`^\\d{0,2}${char}$`).test(value);
        const rangeTest = (value) => {
          badValue = value;
          return typeof value === "number" ? value >= this.min && value <= this.max : this.chars.some(charTest(value));
        };
        const isValidRange = this.#values.every(rangeTest);
        if (!isValidRange) {
          throw new Error(`${this.constructor.name} Validation error, got value ${badValue} expected range ${this.min}-${this.max}${charsString}`);
        }
        const duplicate = this.#values.find((value, index) => this.#values.indexOf(value) !== index);
        if (duplicate) {
          throw new Error(`${this.constructor.name} Validation error, duplicate values found: ${duplicate}`);
        }
      }
      /**
       * Determines if the field is a wildcard based on the values.
       * When options.rawValue is not empty, it checks if the raw value is a wildcard, otherwise it checks if all values in the range are included.
       * @returns {boolean}
       */
      #isWildcardValue() {
        if (this.options.rawValue.length > 0) {
          return ["*", "?"].includes(this.options.rawValue);
        }
        return Array.from({ length: this.max - this.min + 1 }, (_, i) => i + this.min).every((value) => this.#values.includes(value));
      }
    };
    exports.CronField = CronField;
  }
});

// node_modules/luxon/build/node/luxon.js
var require_luxon = __commonJS({
  "node_modules/luxon/build/node/luxon.js"(exports) {
    "use strict";
    init_define_SEI_BUNDLED_ENGINE_VERSIONS();
    Object.defineProperty(exports, "__esModule", { value: true });
    var LuxonError = class extends Error {
    };
    var InvalidDateTimeError = class extends LuxonError {
      constructor(reason) {
        super(`Invalid DateTime: ${reason.toMessage()}`);
      }
    };
    var InvalidIntervalError = class extends LuxonError {
      constructor(reason) {
        super(`Invalid Interval: ${reason.toMessage()}`);
      }
    };
    var InvalidDurationError = class extends LuxonError {
      constructor(reason) {
        super(`Invalid Duration: ${reason.toMessage()}`);
      }
    };
    var ConflictingSpecificationError = class extends LuxonError {
    };
    var InvalidUnitError = class extends LuxonError {
      constructor(unit) {
        super(`Invalid unit ${unit}`);
      }
    };
    var InvalidArgumentError = class extends LuxonError {
    };
    var ZoneIsAbstractError = class extends LuxonError {
      constructor() {
        super("Zone is an abstract class");
      }
    };
    var n = "numeric";
    var s = "short";
    var l = "long";
    var DATE_SHORT = {
      year: n,
      month: n,
      day: n
    };
    var DATE_MED = {
      year: n,
      month: s,
      day: n
    };
    var DATE_MED_WITH_WEEKDAY = {
      year: n,
      month: s,
      day: n,
      weekday: s
    };
    var DATE_FULL = {
      year: n,
      month: l,
      day: n
    };
    var DATE_HUGE = {
      year: n,
      month: l,
      day: n,
      weekday: l
    };
    var TIME_SIMPLE = {
      hour: n,
      minute: n
    };
    var TIME_WITH_SECONDS = {
      hour: n,
      minute: n,
      second: n
    };
    var TIME_WITH_SHORT_OFFSET = {
      hour: n,
      minute: n,
      second: n,
      timeZoneName: s
    };
    var TIME_WITH_LONG_OFFSET = {
      hour: n,
      minute: n,
      second: n,
      timeZoneName: l
    };
    var TIME_24_SIMPLE = {
      hour: n,
      minute: n,
      hourCycle: "h23"
    };
    var TIME_24_WITH_SECONDS = {
      hour: n,
      minute: n,
      second: n,
      hourCycle: "h23"
    };
    var TIME_24_WITH_SHORT_OFFSET = {
      hour: n,
      minute: n,
      second: n,
      hourCycle: "h23",
      timeZoneName: s
    };
    var TIME_24_WITH_LONG_OFFSET = {
      hour: n,
      minute: n,
      second: n,
      hourCycle: "h23",
      timeZoneName: l
    };
    var DATETIME_SHORT = {
      year: n,
      month: n,
      day: n,
      hour: n,
      minute: n
    };
    var DATETIME_SHORT_WITH_SECONDS = {
      year: n,
      month: n,
      day: n,
      hour: n,
      minute: n,
      second: n
    };
    var DATETIME_MED = {
      year: n,
      month: s,
      day: n,
      hour: n,
      minute: n
    };
    var DATETIME_MED_WITH_SECONDS = {
      year: n,
      month: s,
      day: n,
      hour: n,
      minute: n,
      second: n
    };
    var DATETIME_MED_WITH_WEEKDAY = {
      year: n,
      month: s,
      day: n,
      weekday: s,
      hour: n,
      minute: n
    };
    var DATETIME_FULL = {
      year: n,
      month: l,
      day: n,
      hour: n,
      minute: n,
      timeZoneName: s
    };
    var DATETIME_FULL_WITH_SECONDS = {
      year: n,
      month: l,
      day: n,
      hour: n,
      minute: n,
      second: n,
      timeZoneName: s
    };
    var DATETIME_HUGE = {
      year: n,
      month: l,
      day: n,
      weekday: l,
      hour: n,
      minute: n,
      timeZoneName: l
    };
    var DATETIME_HUGE_WITH_SECONDS = {
      year: n,
      month: l,
      day: n,
      weekday: l,
      hour: n,
      minute: n,
      second: n,
      timeZoneName: l
    };
    var Zone = class {
      /**
       * The type of zone
       * @abstract
       * @type {string}
       */
      get type() {
        throw new ZoneIsAbstractError();
      }
      /**
       * The name of this zone.
       * @abstract
       * @type {string}
       */
      get name() {
        throw new ZoneIsAbstractError();
      }
      /**
       * The IANA name of this zone.
       * Defaults to `name` if not overwritten by a subclass.
       * @abstract
       * @type {string}
       */
      get ianaName() {
        return this.name;
      }
      /**
       * Returns whether the offset is known to be fixed for the whole year.
       * @abstract
       * @type {boolean}
       */
      get isUniversal() {
        throw new ZoneIsAbstractError();
      }
      /**
       * Returns the offset's common name (such as EST) at the specified timestamp
       * @abstract
       * @param {number} ts - Epoch milliseconds for which to get the name
       * @param {Object} opts - Options to affect the format
       * @param {string} opts.format - What style of offset to return. Accepts 'long' or 'short'.
       * @param {string} opts.locale - What locale to return the offset name in.
       * @return {string}
       */
      offsetName(ts, opts) {
        throw new ZoneIsAbstractError();
      }
      /**
       * Returns the offset's value as a string
       * @abstract
       * @param {number} ts - Epoch milliseconds for which to get the offset
       * @param {string} format - What style of offset to return.
       *                          Accepts 'narrow', 'short', or 'techie'. Returning '+6', '+06:00', or '+0600' respectively
       * @return {string}
       */
      formatOffset(ts, format2) {
        throw new ZoneIsAbstractError();
      }
      /**
       * Return the offset in minutes for this zone at the specified timestamp.
       * @abstract
       * @param {number} ts - Epoch milliseconds for which to compute the offset
       * @return {number}
       */
      offset(ts) {
        throw new ZoneIsAbstractError();
      }
      /**
       * Return whether this Zone is equal to another zone
       * @abstract
       * @param {Zone} otherZone - the zone to compare
       * @return {boolean}
       */
      equals(otherZone) {
        throw new ZoneIsAbstractError();
      }
      /**
       * Return whether this Zone is valid.
       * @abstract
       * @type {boolean}
       */
      get isValid() {
        throw new ZoneIsAbstractError();
      }
    };
    var singleton$1 = null;
    var SystemZone = class _SystemZone extends Zone {
      /**
       * Get a singleton instance of the local zone
       * @return {SystemZone}
       */
      static get instance() {
        if (singleton$1 === null) {
          singleton$1 = new _SystemZone();
        }
        return singleton$1;
      }
      /** @override **/
      get type() {
        return "system";
      }
      /** @override **/
      get name() {
        return new Intl.DateTimeFormat().resolvedOptions().timeZone;
      }
      /** @override **/
      get isUniversal() {
        return false;
      }
      /** @override **/
      offsetName(ts, {
        format: format2,
        locale
      }) {
        return parseZoneInfo(ts, format2, locale);
      }
      /** @override **/
      formatOffset(ts, format2) {
        return formatOffset(this.offset(ts), format2);
      }
      /** @override **/
      offset(ts) {
        return -new Date(ts).getTimezoneOffset();
      }
      /** @override **/
      equals(otherZone) {
        return otherZone.type === "system";
      }
      /** @override **/
      get isValid() {
        return true;
      }
    };
    var dtfCache = /* @__PURE__ */ new Map();
    function makeDTF(zoneName) {
      let dtf = dtfCache.get(zoneName);
      if (dtf === void 0) {
        dtf = new Intl.DateTimeFormat("en-US", {
          hour12: false,
          timeZone: zoneName,
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          era: "short"
        });
        dtfCache.set(zoneName, dtf);
      }
      return dtf;
    }
    var typeToPos = {
      year: 0,
      month: 1,
      day: 2,
      era: 3,
      hour: 4,
      minute: 5,
      second: 6
    };
    function hackyOffset(dtf, date) {
      const formatted = dtf.format(date).replace(/\u200E/g, ""), parsed = /(\d+)\/(\d+)\/(\d+) (AD|BC),? (\d+):(\d+):(\d+)/.exec(formatted), [, fMonth, fDay, fYear, fadOrBc, fHour, fMinute, fSecond] = parsed;
      return [fYear, fMonth, fDay, fadOrBc, fHour, fMinute, fSecond];
    }
    function partsOffset(dtf, date) {
      const formatted = dtf.formatToParts(date);
      const filled = [];
      for (let i = 0; i < formatted.length; i++) {
        const {
          type,
          value
        } = formatted[i];
        const pos = typeToPos[type];
        if (type === "era") {
          filled[pos] = value;
        } else if (!isUndefined(pos)) {
          filled[pos] = parseInt(value, 10);
        }
      }
      return filled;
    }
    var ianaZoneCache = /* @__PURE__ */ new Map();
    var IANAZone = class _IANAZone extends Zone {
      /**
       * @param {string} name - Zone name
       * @return {IANAZone}
       */
      static create(name) {
        let zone = ianaZoneCache.get(name);
        if (zone === void 0) {
          ianaZoneCache.set(name, zone = new _IANAZone(name));
        }
        return zone;
      }
      /**
       * Reset local caches. Should only be necessary in testing scenarios.
       * @return {void}
       */
      static resetCache() {
        ianaZoneCache.clear();
        dtfCache.clear();
      }
      /**
       * Returns whether the provided string is a valid specifier. This only checks the string's format, not that the specifier identifies a known zone; see isValidZone for that.
       * @param {string} s - The string to check validity on
       * @example IANAZone.isValidSpecifier("America/New_York") //=> true
       * @example IANAZone.isValidSpecifier("Sport~~blorp") //=> false
       * @deprecated For backward compatibility, this forwards to isValidZone, better use `isValidZone()` directly instead.
       * @return {boolean}
       */
      static isValidSpecifier(s2) {
        return this.isValidZone(s2);
      }
      /**
       * Returns whether the provided string identifies a real zone
       * @param {string} zone - The string to check
       * @example IANAZone.isValidZone("America/New_York") //=> true
       * @example IANAZone.isValidZone("Fantasia/Castle") //=> false
       * @example IANAZone.isValidZone("Sport~~blorp") //=> false
       * @return {boolean}
       */
      static isValidZone(zone) {
        if (!zone) {
          return false;
        }
        try {
          new Intl.DateTimeFormat("en-US", {
            timeZone: zone
          }).format();
          return true;
        } catch (e) {
          return false;
        }
      }
      constructor(name) {
        super();
        this.zoneName = name;
        this.valid = _IANAZone.isValidZone(name);
      }
      /**
       * The type of zone. `iana` for all instances of `IANAZone`.
       * @override
       * @type {string}
       */
      get type() {
        return "iana";
      }
      /**
       * The name of this zone (i.e. the IANA zone name).
       * @override
       * @type {string}
       */
      get name() {
        return this.zoneName;
      }
      /**
       * Returns whether the offset is known to be fixed for the whole year:
       * Always returns false for all IANA zones.
       * @override
       * @type {boolean}
       */
      get isUniversal() {
        return false;
      }
      /**
       * Returns the offset's common name (such as EST) at the specified timestamp
       * @override
       * @param {number} ts - Epoch milliseconds for which to get the name
       * @param {Object} opts - Options to affect the format
       * @param {string} opts.format - What style of offset to return. Accepts 'long' or 'short'.
       * @param {string} opts.locale - What locale to return the offset name in.
       * @return {string}
       */
      offsetName(ts, {
        format: format2,
        locale
      }) {
        return parseZoneInfo(ts, format2, locale, this.name);
      }
      /**
       * Returns the offset's value as a string
       * @override
       * @param {number} ts - Epoch milliseconds for which to get the offset
       * @param {string} format - What style of offset to return.
       *                          Accepts 'narrow', 'short', or 'techie'. Returning '+6', '+06:00', or '+0600' respectively
       * @return {string}
       */
      formatOffset(ts, format2) {
        return formatOffset(this.offset(ts), format2);
      }
      /**
       * Return the offset in minutes for this zone at the specified timestamp.
       * @override
       * @param {number} ts - Epoch milliseconds for which to compute the offset
       * @return {number}
       */
      offset(ts) {
        if (!this.valid) return NaN;
        const date = new Date(ts);
        if (isNaN(date)) return NaN;
        const dtf = makeDTF(this.name);
        let [year, month, day, adOrBc, hour, minute, second] = dtf.formatToParts ? partsOffset(dtf, date) : hackyOffset(dtf, date);
        if (adOrBc === "BC") {
          year = -Math.abs(year) + 1;
        }
        const adjustedHour = hour === 24 ? 0 : hour;
        const asUTC = objToLocalTS({
          year,
          month,
          day,
          hour: adjustedHour,
          minute,
          second,
          millisecond: 0
        });
        let asTS = +date;
        const over = asTS % 1e3;
        asTS -= over >= 0 ? over : 1e3 + over;
        return (asUTC - asTS) / (60 * 1e3);
      }
      /**
       * Return whether this Zone is equal to another zone
       * @override
       * @param {Zone} otherZone - the zone to compare
       * @return {boolean}
       */
      equals(otherZone) {
        return otherZone.type === "iana" && otherZone.name === this.name;
      }
      /**
       * Return whether this Zone is valid.
       * @override
       * @type {boolean}
       */
      get isValid() {
        return this.valid;
      }
    };
    var intlLFCache = {};
    function getCachedLF(locString, opts = {}) {
      const key = JSON.stringify([locString, opts]);
      let dtf = intlLFCache[key];
      if (!dtf) {
        dtf = new Intl.ListFormat(locString, opts);
        intlLFCache[key] = dtf;
      }
      return dtf;
    }
    var intlDTCache = /* @__PURE__ */ new Map();
    function getCachedDTF(locString, opts = {}) {
      const key = JSON.stringify([locString, opts]);
      let dtf = intlDTCache.get(key);
      if (dtf === void 0) {
        dtf = new Intl.DateTimeFormat(locString, opts);
        intlDTCache.set(key, dtf);
      }
      return dtf;
    }
    var intlNumCache = /* @__PURE__ */ new Map();
    function getCachedINF(locString, opts = {}) {
      const key = JSON.stringify([locString, opts]);
      let inf = intlNumCache.get(key);
      if (inf === void 0) {
        inf = new Intl.NumberFormat(locString, opts);
        intlNumCache.set(key, inf);
      }
      return inf;
    }
    var intlRelCache = /* @__PURE__ */ new Map();
    function getCachedRTF(locString, opts = {}) {
      const {
        base,
        ...cacheKeyOpts
      } = opts;
      const key = JSON.stringify([locString, cacheKeyOpts]);
      let inf = intlRelCache.get(key);
      if (inf === void 0) {
        inf = new Intl.RelativeTimeFormat(locString, opts);
        intlRelCache.set(key, inf);
      }
      return inf;
    }
    var sysLocaleCache = null;
    function systemLocale() {
      if (sysLocaleCache) {
        return sysLocaleCache;
      } else {
        sysLocaleCache = new Intl.DateTimeFormat().resolvedOptions().locale;
        return sysLocaleCache;
      }
    }
    var intlResolvedOptionsCache = /* @__PURE__ */ new Map();
    function getCachedIntResolvedOptions(locString) {
      let opts = intlResolvedOptionsCache.get(locString);
      if (opts === void 0) {
        opts = new Intl.DateTimeFormat(locString).resolvedOptions();
        intlResolvedOptionsCache.set(locString, opts);
      }
      return opts;
    }
    var weekInfoCache = /* @__PURE__ */ new Map();
    function getCachedWeekInfo(locString) {
      let data = weekInfoCache.get(locString);
      if (!data) {
        const locale = new Intl.Locale(locString);
        data = "getWeekInfo" in locale ? locale.getWeekInfo() : locale.weekInfo;
        if (!("minimalDays" in data)) {
          data = {
            ...fallbackWeekSettings,
            ...data
          };
        }
        weekInfoCache.set(locString, data);
      }
      return data;
    }
    function parseLocaleString(localeStr) {
      const xIndex = localeStr.indexOf("-x-");
      if (xIndex !== -1) {
        localeStr = localeStr.substring(0, xIndex);
      }
      const uIndex = localeStr.indexOf("-u-");
      if (uIndex === -1) {
        return [localeStr];
      } else {
        let options;
        let selectedStr;
        try {
          options = getCachedDTF(localeStr).resolvedOptions();
          selectedStr = localeStr;
        } catch (e) {
          const smaller = localeStr.substring(0, uIndex);
          options = getCachedDTF(smaller).resolvedOptions();
          selectedStr = smaller;
        }
        const {
          numberingSystem,
          calendar
        } = options;
        return [selectedStr, numberingSystem, calendar];
      }
    }
    function intlConfigString(localeStr, numberingSystem, outputCalendar) {
      if (outputCalendar || numberingSystem) {
        if (!localeStr.includes("-u-")) {
          localeStr += "-u";
        }
        if (outputCalendar) {
          localeStr += `-ca-${outputCalendar}`;
        }
        if (numberingSystem) {
          localeStr += `-nu-${numberingSystem}`;
        }
        return localeStr;
      } else {
        return localeStr;
      }
    }
    function mapMonths(f) {
      const ms = [];
      for (let i = 1; i <= 12; i++) {
        const dt = DateTime.utc(2009, i, 1);
        ms.push(f(dt));
      }
      return ms;
    }
    function mapWeekdays(f) {
      const ms = [];
      for (let i = 1; i <= 7; i++) {
        const dt = DateTime.utc(2016, 11, 13 + i);
        ms.push(f(dt));
      }
      return ms;
    }
    function listStuff(loc, length, englishFn, intlFn) {
      const mode = loc.listingMode();
      if (mode === "error") {
        return null;
      } else if (mode === "en") {
        return englishFn(length);
      } else {
        return intlFn(length);
      }
    }
    function supportsFastNumbers(loc) {
      if (loc.numberingSystem && loc.numberingSystem !== "latn") {
        return false;
      } else {
        return loc.numberingSystem === "latn" || !loc.locale || loc.locale.startsWith("en") || getCachedIntResolvedOptions(loc.locale).numberingSystem === "latn";
      }
    }
    var PolyNumberFormatter = class {
      constructor(intl, forceSimple, opts) {
        this.padTo = opts.padTo || 0;
        this.floor = opts.floor || false;
        const {
          padTo,
          floor,
          ...otherOpts
        } = opts;
        if (!forceSimple || Object.keys(otherOpts).length > 0) {
          const intlOpts = {
            useGrouping: false,
            ...opts
          };
          if (opts.padTo > 0) intlOpts.minimumIntegerDigits = opts.padTo;
          this.inf = getCachedINF(intl, intlOpts);
        }
      }
      format(i) {
        if (this.inf) {
          const fixed = this.floor ? Math.floor(i) : i;
          return this.inf.format(fixed);
        } else {
          const fixed = this.floor ? Math.floor(i) : roundTo(i, 3);
          return padStart(fixed, this.padTo);
        }
      }
    };
    var PolyDateFormatter = class {
      constructor(dt, intl, opts) {
        this.opts = opts;
        this.originalZone = void 0;
        let z = void 0;
        if (this.opts.timeZone) {
          this.dt = dt;
        } else if (dt.zone.type === "fixed") {
          const gmtOffset = -1 * (dt.offset / 60);
          const offsetZ = gmtOffset >= 0 ? `Etc/GMT+${gmtOffset}` : `Etc/GMT${gmtOffset}`;
          if (dt.offset !== 0 && IANAZone.create(offsetZ).valid) {
            z = offsetZ;
            this.dt = dt;
          } else {
            z = "UTC";
            this.dt = dt.offset === 0 ? dt : dt.setZone("UTC").plus({
              minutes: dt.offset
            });
            this.originalZone = dt.zone;
          }
        } else if (dt.zone.type === "system") {
          this.dt = dt;
        } else if (dt.zone.type === "iana") {
          this.dt = dt;
          z = dt.zone.name;
        } else {
          z = "UTC";
          this.dt = dt.setZone("UTC").plus({
            minutes: dt.offset
          });
          this.originalZone = dt.zone;
        }
        const intlOpts = {
          ...this.opts
        };
        intlOpts.timeZone = intlOpts.timeZone || z;
        this.dtf = getCachedDTF(intl, intlOpts);
      }
      format() {
        if (this.originalZone) {
          return this.formatToParts().map(({
            value
          }) => value).join("");
        }
        return this.dtf.format(this.dt.toJSDate());
      }
      formatToParts() {
        const parts = this.dtf.formatToParts(this.dt.toJSDate());
        if (this.originalZone) {
          return parts.map((part) => {
            if (part.type === "timeZoneName") {
              const offsetName = this.originalZone.offsetName(this.dt.ts, {
                locale: this.dt.locale,
                format: this.opts.timeZoneName
              });
              return {
                ...part,
                value: offsetName
              };
            } else {
              return part;
            }
          });
        }
        return parts;
      }
      resolvedOptions() {
        return this.dtf.resolvedOptions();
      }
    };
    var PolyRelFormatter = class {
      constructor(intl, isEnglish, opts) {
        this.opts = {
          style: "long",
          ...opts
        };
        if (!isEnglish && hasRelative()) {
          this.rtf = getCachedRTF(intl, opts);
        }
      }
      format(count, unit) {
        if (this.rtf) {
          return this.rtf.format(count, unit);
        } else {
          return formatRelativeTime(unit, count, this.opts.numeric, this.opts.style !== "long");
        }
      }
      formatToParts(count, unit) {
        if (this.rtf) {
          return this.rtf.formatToParts(count, unit);
        } else {
          return [];
        }
      }
    };
    var fallbackWeekSettings = {
      firstDay: 1,
      minimalDays: 4,
      weekend: [6, 7]
    };
    var Locale = class _Locale {
      static fromOpts(opts) {
        return _Locale.create(opts.locale, opts.numberingSystem, opts.outputCalendar, opts.weekSettings, opts.defaultToEN);
      }
      static create(locale, numberingSystem, outputCalendar, weekSettings, defaultToEN = false) {
        const specifiedLocale = locale || Settings.defaultLocale;
        const localeR = specifiedLocale || (defaultToEN ? "en-US" : systemLocale());
        const numberingSystemR = numberingSystem || Settings.defaultNumberingSystem;
        const outputCalendarR = outputCalendar || Settings.defaultOutputCalendar;
        const weekSettingsR = validateWeekSettings(weekSettings) || Settings.defaultWeekSettings;
        return new _Locale(localeR, numberingSystemR, outputCalendarR, weekSettingsR, specifiedLocale);
      }
      static resetCache() {
        sysLocaleCache = null;
        intlDTCache.clear();
        intlNumCache.clear();
        intlRelCache.clear();
        intlResolvedOptionsCache.clear();
        weekInfoCache.clear();
      }
      static fromObject({
        locale,
        numberingSystem,
        outputCalendar,
        weekSettings
      } = {}) {
        return _Locale.create(locale, numberingSystem, outputCalendar, weekSettings);
      }
      constructor(locale, numbering, outputCalendar, weekSettings, specifiedLocale) {
        const [parsedLocale, parsedNumberingSystem, parsedOutputCalendar] = parseLocaleString(locale);
        this.locale = parsedLocale;
        this.numberingSystem = numbering || parsedNumberingSystem || null;
        this.outputCalendar = outputCalendar || parsedOutputCalendar || null;
        this.weekSettings = weekSettings;
        this.intl = intlConfigString(this.locale, this.numberingSystem, this.outputCalendar);
        this.weekdaysCache = {
          format: {},
          standalone: {}
        };
        this.monthsCache = {
          format: {},
          standalone: {}
        };
        this.meridiemCache = null;
        this.eraCache = {};
        this.specifiedLocale = specifiedLocale;
        this.fastNumbersCached = null;
      }
      get fastNumbers() {
        if (this.fastNumbersCached == null) {
          this.fastNumbersCached = supportsFastNumbers(this);
        }
        return this.fastNumbersCached;
      }
      listingMode() {
        const isActuallyEn = this.isEnglish();
        const hasNoWeirdness = (this.numberingSystem === null || this.numberingSystem === "latn") && (this.outputCalendar === null || this.outputCalendar === "gregory");
        return isActuallyEn && hasNoWeirdness ? "en" : "intl";
      }
      clone(alts) {
        if (!alts || Object.getOwnPropertyNames(alts).length === 0) {
          return this;
        } else {
          return _Locale.create(alts.locale || this.specifiedLocale, alts.numberingSystem || this.numberingSystem, alts.outputCalendar || this.outputCalendar, validateWeekSettings(alts.weekSettings) || this.weekSettings, alts.defaultToEN || false);
        }
      }
      redefaultToEN(alts = {}) {
        return this.clone({
          ...alts,
          defaultToEN: true
        });
      }
      redefaultToSystem(alts = {}) {
        return this.clone({
          ...alts,
          defaultToEN: false
        });
      }
      months(length, format2 = false) {
        return listStuff(this, length, months, () => {
          const monthSpecialCase = this.intl === "ja" || this.intl.startsWith("ja-");
          format2 &= !monthSpecialCase;
          const intl = format2 ? {
            month: length,
            day: "numeric"
          } : {
            month: length
          }, formatStr = format2 ? "format" : "standalone";
          if (!this.monthsCache[formatStr][length]) {
            const mapper = !monthSpecialCase ? (dt) => this.extract(dt, intl, "month") : (dt) => this.dtFormatter(dt, intl).format();
            this.monthsCache[formatStr][length] = mapMonths(mapper);
          }
          return this.monthsCache[formatStr][length];
        });
      }
      weekdays(length, format2 = false) {
        return listStuff(this, length, weekdays, () => {
          const intl = format2 ? {
            weekday: length,
            year: "numeric",
            month: "long",
            day: "numeric"
          } : {
            weekday: length
          }, formatStr = format2 ? "format" : "standalone";
          if (!this.weekdaysCache[formatStr][length]) {
            this.weekdaysCache[formatStr][length] = mapWeekdays((dt) => this.extract(dt, intl, "weekday"));
          }
          return this.weekdaysCache[formatStr][length];
        });
      }
      meridiems() {
        return listStuff(this, void 0, () => meridiems, () => {
          if (!this.meridiemCache) {
            const intl = {
              hour: "numeric",
              hourCycle: "h12"
            };
            this.meridiemCache = [DateTime.utc(2016, 11, 13, 9), DateTime.utc(2016, 11, 13, 19)].map((dt) => this.extract(dt, intl, "dayperiod"));
          }
          return this.meridiemCache;
        });
      }
      eras(length) {
        return listStuff(this, length, eras, () => {
          const intl = {
            era: length
          };
          if (!this.eraCache[length]) {
            this.eraCache[length] = [DateTime.utc(-40, 1, 1), DateTime.utc(2017, 1, 1)].map((dt) => this.extract(dt, intl, "era"));
          }
          return this.eraCache[length];
        });
      }
      extract(dt, intlOpts, field) {
        const df = this.dtFormatter(dt, intlOpts), results = df.formatToParts(), matching = results.find((m) => m.type.toLowerCase() === field);
        return matching ? matching.value : null;
      }
      numberFormatter(opts = {}) {
        return new PolyNumberFormatter(this.intl, opts.forceSimple || this.fastNumbers, opts);
      }
      dtFormatter(dt, intlOpts = {}) {
        return new PolyDateFormatter(dt, this.intl, intlOpts);
      }
      relFormatter(opts = {}) {
        return new PolyRelFormatter(this.intl, this.isEnglish(), opts);
      }
      listFormatter(opts = {}) {
        return getCachedLF(this.intl, opts);
      }
      isEnglish() {
        return this.locale === "en" || this.locale.toLowerCase() === "en-us" || getCachedIntResolvedOptions(this.intl).locale.startsWith("en-us");
      }
      getWeekSettings() {
        if (this.weekSettings) {
          return this.weekSettings;
        } else if (!hasLocaleWeekInfo()) {
          return fallbackWeekSettings;
        } else {
          return getCachedWeekInfo(this.locale);
        }
      }
      getStartOfWeek() {
        return this.getWeekSettings().firstDay;
      }
      getMinDaysInFirstWeek() {
        return this.getWeekSettings().minimalDays;
      }
      getWeekendDays() {
        return this.getWeekSettings().weekend;
      }
      equals(other) {
        return this.locale === other.locale && this.numberingSystem === other.numberingSystem && this.outputCalendar === other.outputCalendar;
      }
      toString() {
        return `Locale(${this.locale}, ${this.numberingSystem}, ${this.outputCalendar})`;
      }
    };
    var singleton = null;
    var FixedOffsetZone = class _FixedOffsetZone extends Zone {
      /**
       * Get a singleton instance of UTC
       * @return {FixedOffsetZone}
       */
      static get utcInstance() {
        if (singleton === null) {
          singleton = new _FixedOffsetZone(0);
        }
        return singleton;
      }
      /**
       * Get an instance with a specified offset
       * @param {number} offset - The offset in minutes
       * @return {FixedOffsetZone}
       */
      static instance(offset2) {
        return offset2 === 0 ? _FixedOffsetZone.utcInstance : new _FixedOffsetZone(offset2);
      }
      /**
       * Get an instance of FixedOffsetZone from a UTC offset string, like "UTC+6"
       * @param {string} s - The offset string to parse
       * @example FixedOffsetZone.parseSpecifier("UTC+6")
       * @example FixedOffsetZone.parseSpecifier("UTC+06")
       * @example FixedOffsetZone.parseSpecifier("UTC-6:00")
       * @return {FixedOffsetZone}
       */
      static parseSpecifier(s2) {
        if (s2) {
          const r = s2.match(/^utc(?:([+-]\d{1,2})(?::(\d{2}))?)?$/i);
          if (r) {
            return new _FixedOffsetZone(signedOffset(r[1], r[2]));
          }
        }
        return null;
      }
      constructor(offset2) {
        super();
        this.fixed = offset2;
      }
      /**
       * The type of zone. `fixed` for all instances of `FixedOffsetZone`.
       * @override
       * @type {string}
       */
      get type() {
        return "fixed";
      }
      /**
       * The name of this zone.
       * All fixed zones' names always start with "UTC" (plus optional offset)
       * @override
       * @type {string}
       */
      get name() {
        return this.fixed === 0 ? "UTC" : `UTC${formatOffset(this.fixed, "narrow")}`;
      }
      /**
       * The IANA name of this zone, i.e. `Etc/UTC` or `Etc/GMT+/-nn`
       *
       * @override
       * @type {string}
       */
      get ianaName() {
        if (this.fixed === 0) {
          return "Etc/UTC";
        } else {
          return `Etc/GMT${formatOffset(-this.fixed, "narrow")}`;
        }
      }
      /**
       * Returns the offset's common name at the specified timestamp.
       *
       * For fixed offset zones this equals to the zone name.
       * @override
       */
      offsetName() {
        return this.name;
      }
      /**
       * Returns the offset's value as a string
       * @override
       * @param {number} ts - Epoch milliseconds for which to get the offset
       * @param {string} format - What style of offset to return.
       *                          Accepts 'narrow', 'short', or 'techie'. Returning '+6', '+06:00', or '+0600' respectively
       * @return {string}
       */
      formatOffset(ts, format2) {
        return formatOffset(this.fixed, format2);
      }
      /**
       * Returns whether the offset is known to be fixed for the whole year:
       * Always returns true for all fixed offset zones.
       * @override
       * @type {boolean}
       */
      get isUniversal() {
        return true;
      }
      /**
       * Return the offset in minutes for this zone at the specified timestamp.
       *
       * For fixed offset zones, this is constant and does not depend on a timestamp.
       * @override
       * @return {number}
       */
      offset() {
        return this.fixed;
      }
      /**
       * Return whether this Zone is equal to another zone (i.e. also fixed and same offset)
       * @override
       * @param {Zone} otherZone - the zone to compare
       * @return {boolean}
       */
      equals(otherZone) {
        return otherZone.type === "fixed" && otherZone.fixed === this.fixed;
      }
      /**
       * Return whether this Zone is valid:
       * All fixed offset zones are valid.
       * @override
       * @type {boolean}
       */
      get isValid() {
        return true;
      }
    };
    var InvalidZone = class extends Zone {
      constructor(zoneName) {
        super();
        this.zoneName = zoneName;
      }
      /** @override **/
      get type() {
        return "invalid";
      }
      /** @override **/
      get name() {
        return this.zoneName;
      }
      /** @override **/
      get isUniversal() {
        return false;
      }
      /** @override **/
      offsetName() {
        return null;
      }
      /** @override **/
      formatOffset() {
        return "";
      }
      /** @override **/
      offset() {
        return NaN;
      }
      /** @override **/
      equals() {
        return false;
      }
      /** @override **/
      get isValid() {
        return false;
      }
    };
    function normalizeZone(input, defaultZone2) {
      if (isUndefined(input) || input === null) {
        return defaultZone2;
      } else if (input instanceof Zone) {
        return input;
      } else if (isString(input)) {
        const lowered = input.toLowerCase();
        if (lowered === "default") return defaultZone2;
        else if (lowered === "local" || lowered === "system") return SystemZone.instance;
        else if (lowered === "utc" || lowered === "gmt") return FixedOffsetZone.utcInstance;
        else return FixedOffsetZone.parseSpecifier(lowered) || IANAZone.create(input);
      } else if (isNumber(input)) {
        return FixedOffsetZone.instance(input);
      } else if (typeof input === "object" && "offset" in input && typeof input.offset === "function") {
        return input;
      } else {
        return new InvalidZone(input);
      }
    }
    var numberingSystems = {
      arab: "[\u0660-\u0669]",
      arabext: "[\u06F0-\u06F9]",
      bali: "[\u1B50-\u1B59]",
      beng: "[\u09E6-\u09EF]",
      deva: "[\u0966-\u096F]",
      fullwide: "[\uFF10-\uFF19]",
      gujr: "[\u0AE6-\u0AEF]",
      hanidec: "[\u3007|\u4E00|\u4E8C|\u4E09|\u56DB|\u4E94|\u516D|\u4E03|\u516B|\u4E5D]",
      khmr: "[\u17E0-\u17E9]",
      knda: "[\u0CE6-\u0CEF]",
      laoo: "[\u0ED0-\u0ED9]",
      limb: "[\u1946-\u194F]",
      mlym: "[\u0D66-\u0D6F]",
      mong: "[\u1810-\u1819]",
      mymr: "[\u1040-\u1049]",
      orya: "[\u0B66-\u0B6F]",
      tamldec: "[\u0BE6-\u0BEF]",
      telu: "[\u0C66-\u0C6F]",
      thai: "[\u0E50-\u0E59]",
      tibt: "[\u0F20-\u0F29]",
      latn: "\\d"
    };
    var numberingSystemsUTF16 = {
      arab: [1632, 1641],
      arabext: [1776, 1785],
      bali: [6992, 7001],
      beng: [2534, 2543],
      deva: [2406, 2415],
      fullwide: [65296, 65303],
      gujr: [2790, 2799],
      khmr: [6112, 6121],
      knda: [3302, 3311],
      laoo: [3792, 3801],
      limb: [6470, 6479],
      mlym: [3430, 3439],
      mong: [6160, 6169],
      mymr: [4160, 4169],
      orya: [2918, 2927],
      tamldec: [3046, 3055],
      telu: [3174, 3183],
      thai: [3664, 3673],
      tibt: [3872, 3881]
    };
    var hanidecChars = numberingSystems.hanidec.replace(/[\[|\]]/g, "").split("");
    function parseDigits(str) {
      let value = parseInt(str, 10);
      if (isNaN(value)) {
        value = "";
        for (let i = 0; i < str.length; i++) {
          const code = str.charCodeAt(i);
          if (str[i].search(numberingSystems.hanidec) !== -1) {
            value += hanidecChars.indexOf(str[i]);
          } else {
            for (const key in numberingSystemsUTF16) {
              const [min, max] = numberingSystemsUTF16[key];
              if (code >= min && code <= max) {
                value += code - min;
              }
            }
          }
        }
        return parseInt(value, 10);
      } else {
        return value;
      }
    }
    var digitRegexCache = /* @__PURE__ */ new Map();
    function resetDigitRegexCache() {
      digitRegexCache.clear();
    }
    function digitRegex({
      numberingSystem
    }, append = "") {
      const ns = numberingSystem || "latn";
      let appendCache = digitRegexCache.get(ns);
      if (appendCache === void 0) {
        appendCache = /* @__PURE__ */ new Map();
        digitRegexCache.set(ns, appendCache);
      }
      let regex = appendCache.get(append);
      if (regex === void 0) {
        regex = new RegExp(`${numberingSystems[ns]}${append}`);
        appendCache.set(append, regex);
      }
      return regex;
    }
    var now = () => Date.now();
    var defaultZone = "system";
    var defaultLocale = null;
    var defaultNumberingSystem = null;
    var defaultOutputCalendar = null;
    var twoDigitCutoffYear = 60;
    var throwOnInvalid;
    var defaultWeekSettings = null;
    var Settings = class {
      /**
       * Get the callback for returning the current timestamp.
       * @type {function}
       */
      static get now() {
        return now;
      }
      /**
       * Set the callback for returning the current timestamp.
       * The function should return a number, which will be interpreted as an Epoch millisecond count
       * @type {function}
       * @example Settings.now = () => Date.now() + 3000 // pretend it is 3 seconds in the future
       * @example Settings.now = () => 0 // always pretend it's Jan 1, 1970 at midnight in UTC time
       */
      static set now(n2) {
        now = n2;
      }
      /**
       * Set the default time zone to create DateTimes in. Does not affect existing instances.
       * Use the value "system" to reset this value to the system's time zone.
       * @type {string}
       */
      static set defaultZone(zone) {
        defaultZone = zone;
      }
      /**
       * Get the default time zone object currently used to create DateTimes. Does not affect existing instances.
       * The default value is the system's time zone (the one set on the machine that runs this code).
       * @type {Zone}
       */
      static get defaultZone() {
        return normalizeZone(defaultZone, SystemZone.instance);
      }
      /**
       * Get the default locale to create DateTimes with. Does not affect existing instances.
       * @type {string}
       */
      static get defaultLocale() {
        return defaultLocale;
      }
      /**
       * Set the default locale to create DateTimes with. Does not affect existing instances.
       * @type {string}
       */
      static set defaultLocale(locale) {
        defaultLocale = locale;
      }
      /**
       * Get the default numbering system to create DateTimes with. Does not affect existing instances.
       * @type {string}
       */
      static get defaultNumberingSystem() {
        return defaultNumberingSystem;
      }
      /**
       * Set the default numbering system to create DateTimes with. Does not affect existing instances.
       * @type {string}
       */
      static set defaultNumberingSystem(numberingSystem) {
        defaultNumberingSystem = numberingSystem;
      }
      /**
       * Get the default output calendar to create DateTimes with. Does not affect existing instances.
       * @type {string}
       */
      static get defaultOutputCalendar() {
        return defaultOutputCalendar;
      }
      /**
       * Set the default output calendar to create DateTimes with. Does not affect existing instances.
       * @type {string}
       */
      static set defaultOutputCalendar(outputCalendar) {
        defaultOutputCalendar = outputCalendar;
      }
      /**
       * @typedef {Object} WeekSettings
       * @property {number} firstDay
       * @property {number} minimalDays
       * @property {number[]} weekend
       */
      /**
       * @return {WeekSettings|null}
       */
      static get defaultWeekSettings() {
        return defaultWeekSettings;
      }
      /**
       * Allows overriding the default locale week settings, i.e. the start of the week, the weekend and
       * how many days are required in the first week of a year.
       * Does not affect existing instances.
       *
       * @param {WeekSettings|null} weekSettings
       */
      static set defaultWeekSettings(weekSettings) {
        defaultWeekSettings = validateWeekSettings(weekSettings);
      }
      /**
       * Get the cutoff year for whether a 2-digit year string is interpreted in the current or previous century. Numbers higher than the cutoff will be considered to mean 19xx and numbers lower or equal to the cutoff will be considered 20xx.
       * @type {number}
       */
      static get twoDigitCutoffYear() {
        return twoDigitCutoffYear;
      }
      /**
       * Set the cutoff year for whether a 2-digit year string is interpreted in the current or previous century. Numbers higher than the cutoff will be considered to mean 19xx and numbers lower or equal to the cutoff will be considered 20xx.
       * @type {number}
       * @example Settings.twoDigitCutoffYear = 0 // all 'yy' are interpreted as 20th century
       * @example Settings.twoDigitCutoffYear = 99 // all 'yy' are interpreted as 21st century
       * @example Settings.twoDigitCutoffYear = 50 // '49' -> 2049; '50' -> 1950
       * @example Settings.twoDigitCutoffYear = 1950 // interpreted as 50
       * @example Settings.twoDigitCutoffYear = 2050 // ALSO interpreted as 50
       */
      static set twoDigitCutoffYear(cutoffYear) {
        twoDigitCutoffYear = cutoffYear % 100;
      }
      /**
       * Get whether Luxon will throw when it encounters invalid DateTimes, Durations, or Intervals
       * @type {boolean}
       */
      static get throwOnInvalid() {
        return throwOnInvalid;
      }
      /**
       * Set whether Luxon will throw when it encounters invalid DateTimes, Durations, or Intervals
       * @type {boolean}
       */
      static set throwOnInvalid(t) {
        throwOnInvalid = t;
      }
      /**
       * Reset Luxon's global caches. Should only be necessary in testing scenarios.
       * @return {void}
       */
      static resetCaches() {
        Locale.resetCache();
        IANAZone.resetCache();
        DateTime.resetCache();
        resetDigitRegexCache();
      }
    };
    var Invalid = class {
      constructor(reason, explanation) {
        this.reason = reason;
        this.explanation = explanation;
      }
      toMessage() {
        if (this.explanation) {
          return `${this.reason}: ${this.explanation}`;
        } else {
          return this.reason;
        }
      }
    };
    var nonLeapLadder = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
    var leapLadder = [0, 31, 60, 91, 121, 152, 182, 213, 244, 274, 305, 335];
    function unitOutOfRange(unit, value) {
      return new Invalid("unit out of range", `you specified ${value} (of type ${typeof value}) as a ${unit}, which is invalid`);
    }
    function dayOfWeek(year, month, day) {
      const d = new Date(Date.UTC(year, month - 1, day));
      if (year < 100 && year >= 0) {
        d.setUTCFullYear(d.getUTCFullYear() - 1900);
      }
      const js = d.getUTCDay();
      return js === 0 ? 7 : js;
    }
    function computeOrdinal(year, month, day) {
      return day + (isLeapYear3(year) ? leapLadder : nonLeapLadder)[month - 1];
    }
    function uncomputeOrdinal(year, ordinal) {
      const table = isLeapYear3(year) ? leapLadder : nonLeapLadder, month0 = table.findIndex((i) => i < ordinal), day = ordinal - table[month0];
      return {
        month: month0 + 1,
        day
      };
    }
    function isoWeekdayToLocal(isoWeekday, startOfWeek) {
      return (isoWeekday - startOfWeek + 7) % 7 + 1;
    }
    function gregorianToWeek(gregObj, minDaysInFirstWeek = 4, startOfWeek = 1) {
      const {
        year,
        month,
        day
      } = gregObj, ordinal = computeOrdinal(year, month, day), weekday = isoWeekdayToLocal(dayOfWeek(year, month, day), startOfWeek);
      let weekNumber = Math.floor((ordinal - weekday + 14 - minDaysInFirstWeek) / 7), weekYear;
      if (weekNumber < 1) {
        weekYear = year - 1;
        weekNumber = weeksInWeekYear(weekYear, minDaysInFirstWeek, startOfWeek);
      } else if (weekNumber > weeksInWeekYear(year, minDaysInFirstWeek, startOfWeek)) {
        weekYear = year + 1;
        weekNumber = 1;
      } else {
        weekYear = year;
      }
      return {
        weekYear,
        weekNumber,
        weekday,
        ...timeObject(gregObj)
      };
    }
    function weekToGregorian(weekData, minDaysInFirstWeek = 4, startOfWeek = 1) {
      const {
        weekYear,
        weekNumber,
        weekday
      } = weekData, weekdayOfJan4 = isoWeekdayToLocal(dayOfWeek(weekYear, 1, minDaysInFirstWeek), startOfWeek), yearInDays = daysInYear(weekYear);
      let ordinal = weekNumber * 7 + weekday - weekdayOfJan4 - 7 + minDaysInFirstWeek, year;
      if (ordinal < 1) {
        year = weekYear - 1;
        ordinal += daysInYear(year);
      } else if (ordinal > yearInDays) {
        year = weekYear + 1;
        ordinal -= daysInYear(weekYear);
      } else {
        year = weekYear;
      }
      const {
        month,
        day
      } = uncomputeOrdinal(year, ordinal);
      return {
        year,
        month,
        day,
        ...timeObject(weekData)
      };
    }
    function gregorianToOrdinal(gregData) {
      const {
        year,
        month,
        day
      } = gregData;
      const ordinal = computeOrdinal(year, month, day);
      return {
        year,
        ordinal,
        ...timeObject(gregData)
      };
    }
    function ordinalToGregorian(ordinalData) {
      const {
        year,
        ordinal
      } = ordinalData;
      const {
        month,
        day
      } = uncomputeOrdinal(year, ordinal);
      return {
        year,
        month,
        day,
        ...timeObject(ordinalData)
      };
    }
    function usesLocalWeekValues(obj, loc) {
      const hasLocaleWeekData = !isUndefined(obj.localWeekday) || !isUndefined(obj.localWeekNumber) || !isUndefined(obj.localWeekYear);
      if (hasLocaleWeekData) {
        const hasIsoWeekData = !isUndefined(obj.weekday) || !isUndefined(obj.weekNumber) || !isUndefined(obj.weekYear);
        if (hasIsoWeekData) {
          throw new ConflictingSpecificationError("Cannot mix locale-based week fields with ISO-based week fields");
        }
        if (!isUndefined(obj.localWeekday)) obj.weekday = obj.localWeekday;
        if (!isUndefined(obj.localWeekNumber)) obj.weekNumber = obj.localWeekNumber;
        if (!isUndefined(obj.localWeekYear)) obj.weekYear = obj.localWeekYear;
        delete obj.localWeekday;
        delete obj.localWeekNumber;
        delete obj.localWeekYear;
        return {
          minDaysInFirstWeek: loc.getMinDaysInFirstWeek(),
          startOfWeek: loc.getStartOfWeek()
        };
      } else {
        return {
          minDaysInFirstWeek: 4,
          startOfWeek: 1
        };
      }
    }
    function hasInvalidWeekData(obj, minDaysInFirstWeek = 4, startOfWeek = 1) {
      const validYear = isInteger(obj.weekYear), validWeek = integerBetween(obj.weekNumber, 1, weeksInWeekYear(obj.weekYear, minDaysInFirstWeek, startOfWeek)), validWeekday = integerBetween(obj.weekday, 1, 7);
      if (!validYear) {
        return unitOutOfRange("weekYear", obj.weekYear);
      } else if (!validWeek) {
        return unitOutOfRange("week", obj.weekNumber);
      } else if (!validWeekday) {
        return unitOutOfRange("weekday", obj.weekday);
      } else return false;
    }
    function hasInvalidOrdinalData(obj) {
      const validYear = isInteger(obj.year), validOrdinal = integerBetween(obj.ordinal, 1, daysInYear(obj.year));
      if (!validYear) {
        return unitOutOfRange("year", obj.year);
      } else if (!validOrdinal) {
        return unitOutOfRange("ordinal", obj.ordinal);
      } else return false;
    }
    function hasInvalidGregorianData(obj) {
      const validYear = isInteger(obj.year), validMonth = integerBetween(obj.month, 1, 12), validDay = integerBetween(obj.day, 1, daysInMonth(obj.year, obj.month));
      if (!validYear) {
        return unitOutOfRange("year", obj.year);
      } else if (!validMonth) {
        return unitOutOfRange("month", obj.month);
      } else if (!validDay) {
        return unitOutOfRange("day", obj.day);
      } else return false;
    }
    function hasInvalidTimeData(obj) {
      const {
        hour,
        minute,
        second,
        millisecond
      } = obj;
      const validHour = integerBetween(hour, 0, 23) || hour === 24 && minute === 0 && second === 0 && millisecond === 0, validMinute = integerBetween(minute, 0, 59), validSecond = integerBetween(second, 0, 59), validMillisecond = integerBetween(millisecond, 0, 999);
      if (!validHour) {
        return unitOutOfRange("hour", hour);
      } else if (!validMinute) {
        return unitOutOfRange("minute", minute);
      } else if (!validSecond) {
        return unitOutOfRange("second", second);
      } else if (!validMillisecond) {
        return unitOutOfRange("millisecond", millisecond);
      } else return false;
    }
    function isUndefined(o) {
      return typeof o === "undefined";
    }
    function isNumber(o) {
      return typeof o === "number";
    }
    function isInteger(o) {
      return typeof o === "number" && o % 1 === 0;
    }
    function isString(o) {
      return typeof o === "string";
    }
    function isDate(o) {
      return Object.prototype.toString.call(o) === "[object Date]";
    }
    function hasRelative() {
      try {
        return typeof Intl !== "undefined" && !!Intl.RelativeTimeFormat;
      } catch (e) {
        return false;
      }
    }
    function hasLocaleWeekInfo() {
      try {
        return typeof Intl !== "undefined" && !!Intl.Locale && ("weekInfo" in Intl.Locale.prototype || "getWeekInfo" in Intl.Locale.prototype);
      } catch (e) {
        return false;
      }
    }
    function maybeArray(thing) {
      return Array.isArray(thing) ? thing : [thing];
    }
    function bestBy(arr, by, compare) {
      if (arr.length === 0) {
        return void 0;
      }
      return arr.reduce((best, next) => {
        const pair = [by(next), next];
        if (!best) {
          return pair;
        } else if (compare(best[0], pair[0]) === best[0]) {
          return best;
        } else {
          return pair;
        }
      }, null)[1];
    }
    function pick(obj, keys) {
      return keys.reduce((a, k) => {
        a[k] = obj[k];
        return a;
      }, {});
    }
    function hasOwnProperty(obj, prop) {
      return Object.prototype.hasOwnProperty.call(obj, prop);
    }
    function validateWeekSettings(settings) {
      if (settings == null) {
        return null;
      } else if (typeof settings !== "object") {
        throw new InvalidArgumentError("Week settings must be an object");
      } else {
        if (!integerBetween(settings.firstDay, 1, 7) || !integerBetween(settings.minimalDays, 1, 7) || !Array.isArray(settings.weekend) || settings.weekend.some((v) => !integerBetween(v, 1, 7))) {
          throw new InvalidArgumentError("Invalid week settings");
        }
        return {
          firstDay: settings.firstDay,
          minimalDays: settings.minimalDays,
          weekend: Array.from(settings.weekend)
        };
      }
    }
    function integerBetween(thing, bottom, top) {
      return isInteger(thing) && thing >= bottom && thing <= top;
    }
    function floorMod(x, n2) {
      return x - n2 * Math.floor(x / n2);
    }
    function padStart(input, n2 = 2) {
      const isNeg = input < 0;
      let padded;
      if (isNeg) {
        padded = "-" + ("" + -input).padStart(n2, "0");
      } else {
        padded = ("" + input).padStart(n2, "0");
      }
      return padded;
    }
    function parseInteger(string) {
      if (isUndefined(string) || string === null || string === "") {
        return void 0;
      } else {
        return parseInt(string, 10);
      }
    }
    function parseFloating(string) {
      if (isUndefined(string) || string === null || string === "") {
        return void 0;
      } else {
        return parseFloat(string);
      }
    }
    function parseMillis(fraction) {
      if (isUndefined(fraction) || fraction === null || fraction === "") {
        return void 0;
      } else {
        const f = parseFloat("0." + fraction) * 1e3;
        return Math.floor(f);
      }
    }
    function roundTo(number, digits, rounding = "round") {
      const factor = 10 ** digits;
      switch (rounding) {
        case "expand":
          return number > 0 ? Math.ceil(number * factor) / factor : Math.floor(number * factor) / factor;
        case "trunc":
          return Math.trunc(number * factor) / factor;
        case "round":
          return Math.round(number * factor) / factor;
        case "floor":
          return Math.floor(number * factor) / factor;
        case "ceil":
          return Math.ceil(number * factor) / factor;
        default:
          throw new RangeError(`Value rounding ${rounding} is out of range`);
      }
    }
    function isLeapYear3(year) {
      return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
    }
    function daysInYear(year) {
      return isLeapYear3(year) ? 366 : 365;
    }
    function daysInMonth(year, month) {
      const modMonth = floorMod(month - 1, 12) + 1, modYear = year + (month - modMonth) / 12;
      if (modMonth === 2) {
        return isLeapYear3(modYear) ? 29 : 28;
      } else {
        return [31, null, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][modMonth - 1];
      }
    }
    function objToLocalTS(obj) {
      let d = Date.UTC(obj.year, obj.month - 1, obj.day, obj.hour, obj.minute, obj.second, obj.millisecond);
      if (obj.year < 100 && obj.year >= 0) {
        d = new Date(d);
        d.setUTCFullYear(obj.year, obj.month - 1, obj.day);
      }
      return +d;
    }
    function firstWeekOffset(year, minDaysInFirstWeek, startOfWeek) {
      const fwdlw = isoWeekdayToLocal(dayOfWeek(year, 1, minDaysInFirstWeek), startOfWeek);
      return -fwdlw + minDaysInFirstWeek - 1;
    }
    function weeksInWeekYear(weekYear, minDaysInFirstWeek = 4, startOfWeek = 1) {
      const weekOffset = firstWeekOffset(weekYear, minDaysInFirstWeek, startOfWeek);
      const weekOffsetNext = firstWeekOffset(weekYear + 1, minDaysInFirstWeek, startOfWeek);
      return (daysInYear(weekYear) - weekOffset + weekOffsetNext) / 7;
    }
    function untruncateYear(year) {
      if (year > 99) {
        return year;
      } else return year > Settings.twoDigitCutoffYear ? 1900 + year : 2e3 + year;
    }
    function parseZoneInfo(ts, offsetFormat, locale, timeZone = null) {
      const date = new Date(ts), intlOpts = {
        hourCycle: "h23",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit"
      };
      if (timeZone) {
        intlOpts.timeZone = timeZone;
      }
      const modified = {
        timeZoneName: offsetFormat,
        ...intlOpts
      };
      const parsed = new Intl.DateTimeFormat(locale, modified).formatToParts(date).find((m) => m.type.toLowerCase() === "timezonename");
      return parsed ? parsed.value : null;
    }
    function signedOffset(offHourStr, offMinuteStr) {
      let offHour = parseInt(offHourStr, 10);
      if (Number.isNaN(offHour)) {
        offHour = 0;
      }
      const offMin = parseInt(offMinuteStr, 10) || 0, offMinSigned = offHour < 0 || Object.is(offHour, -0) ? -offMin : offMin;
      return offHour * 60 + offMinSigned;
    }
    function asNumber(value) {
      const numericValue = Number(value);
      if (typeof value === "boolean" || value === "" || !Number.isFinite(numericValue)) throw new InvalidArgumentError(`Invalid unit value ${value}`);
      return numericValue;
    }
    function normalizeObject(obj, normalizer) {
      const normalized = {};
      for (const u in obj) {
        if (hasOwnProperty(obj, u)) {
          const v = obj[u];
          if (v === void 0 || v === null) continue;
          normalized[normalizer(u)] = asNumber(v);
        }
      }
      return normalized;
    }
    function formatOffset(offset2, format2) {
      const hours = Math.trunc(Math.abs(offset2 / 60)), minutes = Math.trunc(Math.abs(offset2 % 60)), sign = offset2 >= 0 ? "+" : "-";
      switch (format2) {
        case "short":
          return `${sign}${padStart(hours, 2)}:${padStart(minutes, 2)}`;
        case "narrow":
          return `${sign}${hours}${minutes > 0 ? `:${minutes}` : ""}`;
        case "techie":
          return `${sign}${padStart(hours, 2)}${padStart(minutes, 2)}`;
        default:
          throw new RangeError(`Value format ${format2} is out of range for property format`);
      }
    }
    function timeObject(obj) {
      return pick(obj, ["hour", "minute", "second", "millisecond"]);
    }
    var monthsLong = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    var monthsShort = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    var monthsNarrow = ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"];
    function months(length) {
      switch (length) {
        case "narrow":
          return [...monthsNarrow];
        case "short":
          return [...monthsShort];
        case "long":
          return [...monthsLong];
        case "numeric":
          return ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"];
        case "2-digit":
          return ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"];
        default:
          return null;
      }
    }
    var weekdaysLong = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
    var weekdaysShort = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    var weekdaysNarrow = ["M", "T", "W", "T", "F", "S", "S"];
    function weekdays(length) {
      switch (length) {
        case "narrow":
          return [...weekdaysNarrow];
        case "short":
          return [...weekdaysShort];
        case "long":
          return [...weekdaysLong];
        case "numeric":
          return ["1", "2", "3", "4", "5", "6", "7"];
        default:
          return null;
      }
    }
    var meridiems = ["AM", "PM"];
    var erasLong = ["Before Christ", "Anno Domini"];
    var erasShort = ["BC", "AD"];
    var erasNarrow = ["B", "A"];
    function eras(length) {
      switch (length) {
        case "narrow":
          return [...erasNarrow];
        case "short":
          return [...erasShort];
        case "long":
          return [...erasLong];
        default:
          return null;
      }
    }
    function meridiemForDateTime(dt) {
      return meridiems[dt.hour < 12 ? 0 : 1];
    }
    function weekdayForDateTime(dt, length) {
      return weekdays(length)[dt.weekday - 1];
    }
    function monthForDateTime(dt, length) {
      return months(length)[dt.month - 1];
    }
    function eraForDateTime(dt, length) {
      return eras(length)[dt.year < 0 ? 0 : 1];
    }
    function formatRelativeTime(unit, count, numeric = "always", narrow = false) {
      const units = {
        years: ["year", "yr."],
        quarters: ["quarter", "qtr."],
        months: ["month", "mo."],
        weeks: ["week", "wk."],
        days: ["day", "day", "days"],
        hours: ["hour", "hr."],
        minutes: ["minute", "min."],
        seconds: ["second", "sec."]
      };
      const lastable = ["hours", "minutes", "seconds"].indexOf(unit) === -1;
      if (numeric === "auto" && lastable) {
        const isDay = unit === "days";
        switch (count) {
          case 1:
            return isDay ? "tomorrow" : `next ${units[unit][0]}`;
          case -1:
            return isDay ? "yesterday" : `last ${units[unit][0]}`;
          case 0:
            return isDay ? "today" : `this ${units[unit][0]}`;
        }
      }
      const isInPast = Object.is(count, -0) || count < 0, fmtValue = Math.abs(count), singular = fmtValue === 1, lilUnits = units[unit], fmtUnit = narrow ? singular ? lilUnits[1] : lilUnits[2] || lilUnits[1] : singular ? units[unit][0] : unit;
      return isInPast ? `${fmtValue} ${fmtUnit} ago` : `in ${fmtValue} ${fmtUnit}`;
    }
    function stringifyTokens(splits, tokenToString) {
      let s2 = "";
      for (const token of splits) {
        if (token.literal) {
          s2 += token.val;
        } else {
          s2 += tokenToString(token.val);
        }
      }
      return s2;
    }
    var macroTokenToFormatOpts = {
      D: DATE_SHORT,
      DD: DATE_MED,
      DDD: DATE_FULL,
      DDDD: DATE_HUGE,
      t: TIME_SIMPLE,
      tt: TIME_WITH_SECONDS,
      ttt: TIME_WITH_SHORT_OFFSET,
      tttt: TIME_WITH_LONG_OFFSET,
      T: TIME_24_SIMPLE,
      TT: TIME_24_WITH_SECONDS,
      TTT: TIME_24_WITH_SHORT_OFFSET,
      TTTT: TIME_24_WITH_LONG_OFFSET,
      f: DATETIME_SHORT,
      ff: DATETIME_MED,
      fff: DATETIME_FULL,
      ffff: DATETIME_HUGE,
      F: DATETIME_SHORT_WITH_SECONDS,
      FF: DATETIME_MED_WITH_SECONDS,
      FFF: DATETIME_FULL_WITH_SECONDS,
      FFFF: DATETIME_HUGE_WITH_SECONDS
    };
    var Formatter = class _Formatter {
      static create(locale, opts = {}) {
        return new _Formatter(locale, opts);
      }
      static parseFormat(fmt) {
        let current = null, currentFull = "", bracketed = false;
        const splits = [];
        for (let i = 0; i < fmt.length; i++) {
          const c = fmt.charAt(i);
          if (c === "'") {
            if (currentFull.length > 0 || bracketed) {
              splits.push({
                literal: bracketed || /^\s+$/.test(currentFull),
                val: currentFull === "" ? "'" : currentFull
              });
            }
            current = null;
            currentFull = "";
            bracketed = !bracketed;
          } else if (bracketed) {
            currentFull += c;
          } else if (c === current) {
            currentFull += c;
          } else {
            if (currentFull.length > 0) {
              splits.push({
                literal: /^\s+$/.test(currentFull),
                val: currentFull
              });
            }
            currentFull = c;
            current = c;
          }
        }
        if (currentFull.length > 0) {
          splits.push({
            literal: bracketed || /^\s+$/.test(currentFull),
            val: currentFull
          });
        }
        return splits;
      }
      static macroTokenToFormatOpts(token) {
        return macroTokenToFormatOpts[token];
      }
      constructor(locale, formatOpts) {
        this.opts = formatOpts;
        this.loc = locale;
        this.systemLoc = null;
      }
      formatWithSystemDefault(dt, opts) {
        if (this.systemLoc === null) {
          this.systemLoc = this.loc.redefaultToSystem();
        }
        const df = this.systemLoc.dtFormatter(dt, {
          ...this.opts,
          ...opts
        });
        return df.format();
      }
      dtFormatter(dt, opts = {}) {
        return this.loc.dtFormatter(dt, {
          ...this.opts,
          ...opts
        });
      }
      formatDateTime(dt, opts) {
        return this.dtFormatter(dt, opts).format();
      }
      formatDateTimeParts(dt, opts) {
        return this.dtFormatter(dt, opts).formatToParts();
      }
      formatInterval(interval, opts) {
        const df = this.dtFormatter(interval.start, opts);
        return df.dtf.formatRange(interval.start.toJSDate(), interval.end.toJSDate());
      }
      resolvedOptions(dt, opts) {
        return this.dtFormatter(dt, opts).resolvedOptions();
      }
      num(n2, p = 0, signDisplay = void 0) {
        if (this.opts.forceSimple) {
          return padStart(n2, p);
        }
        const opts = {
          ...this.opts
        };
        if (p > 0) {
          opts.padTo = p;
        }
        if (signDisplay) {
          opts.signDisplay = signDisplay;
        }
        return this.loc.numberFormatter(opts).format(n2);
      }
      formatDateTimeFromString(dt, fmt) {
        const knownEnglish = this.loc.listingMode() === "en", useDateTimeFormatter = this.loc.outputCalendar && this.loc.outputCalendar !== "gregory", string = (opts, extract) => this.loc.extract(dt, opts, extract), formatOffset2 = (opts) => {
          if (dt.isOffsetFixed && dt.offset === 0 && opts.allowZ) {
            return "Z";
          }
          return dt.isValid ? dt.zone.formatOffset(dt.ts, opts.format) : "";
        }, meridiem = () => knownEnglish ? meridiemForDateTime(dt) : string({
          hour: "numeric",
          hourCycle: "h12"
        }, "dayperiod"), month = (length, standalone) => knownEnglish ? monthForDateTime(dt, length) : string(standalone ? {
          month: length
        } : {
          month: length,
          day: "numeric"
        }, "month"), weekday = (length, standalone) => knownEnglish ? weekdayForDateTime(dt, length) : string(standalone ? {
          weekday: length
        } : {
          weekday: length,
          month: "long",
          day: "numeric"
        }, "weekday"), maybeMacro = (token) => {
          const formatOpts = _Formatter.macroTokenToFormatOpts(token);
          if (formatOpts) {
            return this.formatWithSystemDefault(dt, formatOpts);
          } else {
            return token;
          }
        }, era = (length) => knownEnglish ? eraForDateTime(dt, length) : string({
          era: length
        }, "era"), tokenToString = (token) => {
          switch (token) {
            // ms
            case "S":
              return this.num(dt.millisecond);
            case "u":
            // falls through
            case "SSS":
              return this.num(dt.millisecond, 3);
            // seconds
            case "s":
              return this.num(dt.second);
            case "ss":
              return this.num(dt.second, 2);
            // fractional seconds
            case "uu":
              return this.num(Math.floor(dt.millisecond / 10), 2);
            case "uuu":
              return this.num(Math.floor(dt.millisecond / 100));
            // minutes
            case "m":
              return this.num(dt.minute);
            case "mm":
              return this.num(dt.minute, 2);
            // hours
            case "h":
              return this.num(dt.hour % 12 === 0 ? 12 : dt.hour % 12);
            case "hh":
              return this.num(dt.hour % 12 === 0 ? 12 : dt.hour % 12, 2);
            case "H":
              return this.num(dt.hour);
            case "HH":
              return this.num(dt.hour, 2);
            // offset
            case "Z":
              return formatOffset2({
                format: "narrow",
                allowZ: this.opts.allowZ
              });
            case "ZZ":
              return formatOffset2({
                format: "short",
                allowZ: this.opts.allowZ
              });
            case "ZZZ":
              return formatOffset2({
                format: "techie",
                allowZ: this.opts.allowZ
              });
            case "ZZZZ":
              return dt.zone.offsetName(dt.ts, {
                format: "short",
                locale: this.loc.locale
              });
            case "ZZZZZ":
              return dt.zone.offsetName(dt.ts, {
                format: "long",
                locale: this.loc.locale
              });
            // zone
            case "z":
              return dt.zoneName;
            // meridiems
            case "a":
              return meridiem();
            // dates
            case "d":
              return useDateTimeFormatter ? string({
                day: "numeric"
              }, "day") : this.num(dt.day);
            case "dd":
              return useDateTimeFormatter ? string({
                day: "2-digit"
              }, "day") : this.num(dt.day, 2);
            // weekdays - standalone
            case "c":
              return this.num(dt.weekday);
            case "ccc":
              return weekday("short", true);
            case "cccc":
              return weekday("long", true);
            case "ccccc":
              return weekday("narrow", true);
            // weekdays - format
            case "E":
              return this.num(dt.weekday);
            case "EEE":
              return weekday("short", false);
            case "EEEE":
              return weekday("long", false);
            case "EEEEE":
              return weekday("narrow", false);
            // months - standalone
            case "L":
              return useDateTimeFormatter ? string({
                month: "numeric",
                day: "numeric"
              }, "month") : this.num(dt.month);
            case "LL":
              return useDateTimeFormatter ? string({
                month: "2-digit",
                day: "numeric"
              }, "month") : this.num(dt.month, 2);
            case "LLL":
              return month("short", true);
            case "LLLL":
              return month("long", true);
            case "LLLLL":
              return month("narrow", true);
            // months - format
            case "M":
              return useDateTimeFormatter ? string({
                month: "numeric"
              }, "month") : this.num(dt.month);
            case "MM":
              return useDateTimeFormatter ? string({
                month: "2-digit"
              }, "month") : this.num(dt.month, 2);
            case "MMM":
              return month("short", false);
            case "MMMM":
              return month("long", false);
            case "MMMMM":
              return month("narrow", false);
            // years
            case "y":
              return useDateTimeFormatter ? string({
                year: "numeric"
              }, "year") : this.num(dt.year);
            case "yy":
              return useDateTimeFormatter ? string({
                year: "2-digit"
              }, "year") : this.num(dt.year.toString().slice(-2), 2);
            case "yyyy":
              return useDateTimeFormatter ? string({
                year: "numeric"
              }, "year") : this.num(dt.year, 4);
            case "yyyyyy":
              return useDateTimeFormatter ? string({
                year: "numeric"
              }, "year") : this.num(dt.year, 6);
            // eras
            case "G":
              return era("short");
            case "GG":
              return era("long");
            case "GGGGG":
              return era("narrow");
            case "kk":
              return this.num(dt.weekYear.toString().slice(-2), 2);
            case "kkkk":
              return this.num(dt.weekYear, 4);
            case "W":
              return this.num(dt.weekNumber);
            case "WW":
              return this.num(dt.weekNumber, 2);
            case "n":
              return this.num(dt.localWeekNumber);
            case "nn":
              return this.num(dt.localWeekNumber, 2);
            case "ii":
              return this.num(dt.localWeekYear.toString().slice(-2), 2);
            case "iiii":
              return this.num(dt.localWeekYear, 4);
            case "o":
              return this.num(dt.ordinal);
            case "ooo":
              return this.num(dt.ordinal, 3);
            case "q":
              return this.num(dt.quarter);
            case "qq":
              return this.num(dt.quarter, 2);
            case "X":
              return this.num(Math.floor(dt.ts / 1e3));
            case "x":
              return this.num(dt.ts);
            default:
              return maybeMacro(token);
          }
        };
        return stringifyTokens(_Formatter.parseFormat(fmt), tokenToString);
      }
      formatDurationFromString(dur, fmt) {
        const invertLargest = this.opts.signMode === "negativeLargestOnly" ? -1 : 1;
        const tokenToField = (token) => {
          switch (token[0]) {
            case "S":
              return "milliseconds";
            case "s":
              return "seconds";
            case "m":
              return "minutes";
            case "h":
              return "hours";
            case "d":
              return "days";
            case "w":
              return "weeks";
            case "M":
              return "months";
            case "y":
              return "years";
            default:
              return null;
          }
        }, tokenToString = (lildur, info) => (token) => {
          const mapped = tokenToField(token);
          if (mapped) {
            const inversionFactor = info.isNegativeDuration && mapped !== info.largestUnit ? invertLargest : 1;
            let signDisplay;
            if (this.opts.signMode === "negativeLargestOnly" && mapped !== info.largestUnit) {
              signDisplay = "never";
            } else if (this.opts.signMode === "all") {
              signDisplay = "always";
            } else {
              signDisplay = "auto";
            }
            return this.num(lildur.get(mapped) * inversionFactor, token.length, signDisplay);
          } else {
            return token;
          }
        }, tokens = _Formatter.parseFormat(fmt), realTokens = tokens.reduce((found, {
          literal,
          val
        }) => literal ? found : found.concat(val), []), collapsed = dur.shiftTo(...realTokens.map(tokenToField).filter((t) => t)), durationInfo = {
          isNegativeDuration: collapsed < 0,
          // this relies on "collapsed" being based on "shiftTo", which builds up the object
          // in order
          largestUnit: Object.keys(collapsed.values)[0]
        };
        return stringifyTokens(tokens, tokenToString(collapsed, durationInfo));
      }
    };
    var ianaRegex = /[A-Za-z_+-]{1,256}(?::?\/[A-Za-z0-9_+-]{1,256}(?:\/[A-Za-z0-9_+-]{1,256})?)?/;
    function combineRegexes(...regexes) {
      const full = regexes.reduce((f, r) => f + r.source, "");
      return RegExp(`^${full}$`);
    }
    function combineExtractors(...extractors) {
      return (m) => extractors.reduce(([mergedVals, mergedZone, cursor], ex) => {
        const [val, zone, next] = ex(m, cursor);
        return [{
          ...mergedVals,
          ...val
        }, zone || mergedZone, next];
      }, [{}, null, 1]).slice(0, 2);
    }
    function parse5(s2, ...patterns) {
      if (s2 == null) {
        return [null, null];
      }
      for (const [regex, extractor] of patterns) {
        const m = regex.exec(s2);
        if (m) {
          return extractor(m);
        }
      }
      return [null, null];
    }
    function simpleParse(...keys) {
      return (match2, cursor) => {
        const ret = {};
        let i;
        for (i = 0; i < keys.length; i++) {
          ret[keys[i]] = parseInteger(match2[cursor + i]);
        }
        return [ret, null, cursor + i];
      };
    }
    var offsetRegex = /(?:([Zz])|([+-]\d\d)(?::?(\d\d))?)/;
    var isoExtendedZone = `(?:${offsetRegex.source}?(?:\\[(${ianaRegex.source})\\])?)?`;
    var isoTimeBaseRegex = /(\d\d)(?::?(\d\d)(?::?(\d\d)(?:[.,](\d{1,30}))?)?)?/;
    var isoTimeRegex = RegExp(`${isoTimeBaseRegex.source}${isoExtendedZone}`);
    var isoTimeExtensionRegex = RegExp(`(?:[Tt]${isoTimeRegex.source})?`);
    var isoYmdRegex = /([+-]\d{6}|\d{4})(?:-?(\d\d)(?:-?(\d\d))?)?/;
    var isoWeekRegex = /(\d{4})-?W(\d\d)(?:-?(\d))?/;
    var isoOrdinalRegex = /(\d{4})-?(\d{3})/;
    var extractISOWeekData = simpleParse("weekYear", "weekNumber", "weekDay");
    var extractISOOrdinalData = simpleParse("year", "ordinal");
    var sqlYmdRegex = /(\d{4})-(\d\d)-(\d\d)/;
    var sqlTimeRegex = RegExp(`${isoTimeBaseRegex.source} ?(?:${offsetRegex.source}|(${ianaRegex.source}))?`);
    var sqlTimeExtensionRegex = RegExp(`(?: ${sqlTimeRegex.source})?`);
    function int(match2, pos, fallback) {
      const m = match2[pos];
      return isUndefined(m) ? fallback : parseInteger(m);
    }
    function extractISOYmd(match2, cursor) {
      const item = {
        year: int(match2, cursor),
        month: int(match2, cursor + 1, 1),
        day: int(match2, cursor + 2, 1)
      };
      return [item, null, cursor + 3];
    }
    function extractISOTime(match2, cursor) {
      const item = {
        hours: int(match2, cursor, 0),
        minutes: int(match2, cursor + 1, 0),
        seconds: int(match2, cursor + 2, 0),
        milliseconds: parseMillis(match2[cursor + 3])
      };
      return [item, null, cursor + 4];
    }
    function extractISOOffset(match2, cursor) {
      const local = !match2[cursor] && !match2[cursor + 1], fullOffset = signedOffset(match2[cursor + 1], match2[cursor + 2]), zone = local ? null : FixedOffsetZone.instance(fullOffset);
      return [{}, zone, cursor + 3];
    }
    function extractIANAZone(match2, cursor) {
      const zone = match2[cursor] ? IANAZone.create(match2[cursor]) : null;
      return [{}, zone, cursor + 1];
    }
    var isoTimeOnly = RegExp(`^T?${isoTimeBaseRegex.source}$`);
    var isoDuration = /^-?P(?:(?:(-?\d{1,20}(?:\.\d{1,20})?)Y)?(?:(-?\d{1,20}(?:\.\d{1,20})?)M)?(?:(-?\d{1,20}(?:\.\d{1,20})?)W)?(?:(-?\d{1,20}(?:\.\d{1,20})?)D)?(?:T(?:(-?\d{1,20}(?:\.\d{1,20})?)H)?(?:(-?\d{1,20}(?:\.\d{1,20})?)M)?(?:(-?\d{1,20})(?:[.,](-?\d{1,20}))?S)?)?)$/;
    function extractISODuration(match2) {
      const [s2, yearStr, monthStr, weekStr, dayStr, hourStr, minuteStr, secondStr, millisecondsStr] = match2;
      const hasNegativePrefix = s2[0] === "-";
      const negativeSeconds = secondStr && secondStr[0] === "-";
      const maybeNegate = (num, force = false) => num !== void 0 && (force || num && hasNegativePrefix) ? -num : num;
      return [{
        years: maybeNegate(parseFloating(yearStr)),
        months: maybeNegate(parseFloating(monthStr)),
        weeks: maybeNegate(parseFloating(weekStr)),
        days: maybeNegate(parseFloating(dayStr)),
        hours: maybeNegate(parseFloating(hourStr)),
        minutes: maybeNegate(parseFloating(minuteStr)),
        seconds: maybeNegate(parseFloating(secondStr), secondStr === "-0"),
        milliseconds: maybeNegate(parseMillis(millisecondsStr), negativeSeconds)
      }];
    }
    var obsOffsets = {
      GMT: 0,
      EDT: -4 * 60,
      EST: -5 * 60,
      CDT: -5 * 60,
      CST: -6 * 60,
      MDT: -6 * 60,
      MST: -7 * 60,
      PDT: -7 * 60,
      PST: -8 * 60
    };
    function fromStrings(weekdayStr, yearStr, monthStr, dayStr, hourStr, minuteStr, secondStr) {
      const result = {
        year: yearStr.length === 2 ? untruncateYear(parseInteger(yearStr)) : parseInteger(yearStr),
        month: monthsShort.indexOf(monthStr) + 1,
        day: parseInteger(dayStr),
        hour: parseInteger(hourStr),
        minute: parseInteger(minuteStr)
      };
      if (secondStr) result.second = parseInteger(secondStr);
      if (weekdayStr) {
        result.weekday = weekdayStr.length > 3 ? weekdaysLong.indexOf(weekdayStr) + 1 : weekdaysShort.indexOf(weekdayStr) + 1;
      }
      return result;
    }
    var rfc2822 = /^(?:(Mon|Tue|Wed|Thu|Fri|Sat|Sun),\s)?(\d{1,2})\s(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s(\d{2,4})\s(\d\d):(\d\d)(?::(\d\d))?\s(?:(UT|GMT|[ECMP][SD]T)|([Zz])|(?:([+-]\d\d)(\d\d)))$/;
    function extractRFC2822(match2) {
      const [, weekdayStr, dayStr, monthStr, yearStr, hourStr, minuteStr, secondStr, obsOffset, milOffset, offHourStr, offMinuteStr] = match2, result = fromStrings(weekdayStr, yearStr, monthStr, dayStr, hourStr, minuteStr, secondStr);
      let offset2;
      if (obsOffset) {
        offset2 = obsOffsets[obsOffset];
      } else if (milOffset) {
        offset2 = 0;
      } else {
        offset2 = signedOffset(offHourStr, offMinuteStr);
      }
      return [result, new FixedOffsetZone(offset2)];
    }
    function preprocessRFC2822(s2) {
      return s2.replace(/\([^()]*\)|[\n\t]/g, " ").replace(/(\s\s+)/g, " ").trim();
    }
    var rfc1123 = /^(Mon|Tue|Wed|Thu|Fri|Sat|Sun), (\d\d) (Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec) (\d{4}) (\d\d):(\d\d):(\d\d) GMT$/;
    var rfc850 = /^(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday), (\d\d)-(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)-(\d\d) (\d\d):(\d\d):(\d\d) GMT$/;
    var ascii = /^(Mon|Tue|Wed|Thu|Fri|Sat|Sun) (Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec) ( \d|\d\d) (\d\d):(\d\d):(\d\d) (\d{4})$/;
    function extractRFC1123Or850(match2) {
      const [, weekdayStr, dayStr, monthStr, yearStr, hourStr, minuteStr, secondStr] = match2, result = fromStrings(weekdayStr, yearStr, monthStr, dayStr, hourStr, minuteStr, secondStr);
      return [result, FixedOffsetZone.utcInstance];
    }
    function extractASCII(match2) {
      const [, weekdayStr, monthStr, dayStr, hourStr, minuteStr, secondStr, yearStr] = match2, result = fromStrings(weekdayStr, yearStr, monthStr, dayStr, hourStr, minuteStr, secondStr);
      return [result, FixedOffsetZone.utcInstance];
    }
    var isoYmdWithTimeExtensionRegex = combineRegexes(isoYmdRegex, isoTimeExtensionRegex);
    var isoWeekWithTimeExtensionRegex = combineRegexes(isoWeekRegex, isoTimeExtensionRegex);
    var isoOrdinalWithTimeExtensionRegex = combineRegexes(isoOrdinalRegex, isoTimeExtensionRegex);
    var isoTimeCombinedRegex = combineRegexes(isoTimeRegex);
    var extractISOYmdTimeAndOffset = combineExtractors(extractISOYmd, extractISOTime, extractISOOffset, extractIANAZone);
    var extractISOWeekTimeAndOffset = combineExtractors(extractISOWeekData, extractISOTime, extractISOOffset, extractIANAZone);
    var extractISOOrdinalDateAndTime = combineExtractors(extractISOOrdinalData, extractISOTime, extractISOOffset, extractIANAZone);
    var extractISOTimeAndOffset = combineExtractors(extractISOTime, extractISOOffset, extractIANAZone);
    function parseISODate(s2) {
      return parse5(s2, [isoYmdWithTimeExtensionRegex, extractISOYmdTimeAndOffset], [isoWeekWithTimeExtensionRegex, extractISOWeekTimeAndOffset], [isoOrdinalWithTimeExtensionRegex, extractISOOrdinalDateAndTime], [isoTimeCombinedRegex, extractISOTimeAndOffset]);
    }
    function parseRFC2822Date(s2) {
      return parse5(preprocessRFC2822(s2), [rfc2822, extractRFC2822]);
    }
    function parseHTTPDate(s2) {
      return parse5(s2, [rfc1123, extractRFC1123Or850], [rfc850, extractRFC1123Or850], [ascii, extractASCII]);
    }
    function parseISODuration(s2) {
      return parse5(s2, [isoDuration, extractISODuration]);
    }
    var extractISOTimeOnly = combineExtractors(extractISOTime);
    function parseISOTimeOnly(s2) {
      return parse5(s2, [isoTimeOnly, extractISOTimeOnly]);
    }
    var sqlYmdWithTimeExtensionRegex = combineRegexes(sqlYmdRegex, sqlTimeExtensionRegex);
    var sqlTimeCombinedRegex = combineRegexes(sqlTimeRegex);
    var extractISOTimeOffsetAndIANAZone = combineExtractors(extractISOTime, extractISOOffset, extractIANAZone);
    function parseSQL(s2) {
      return parse5(s2, [sqlYmdWithTimeExtensionRegex, extractISOYmdTimeAndOffset], [sqlTimeCombinedRegex, extractISOTimeOffsetAndIANAZone]);
    }
    var INVALID$2 = "Invalid Duration";
    var lowOrderMatrix = {
      weeks: {
        days: 7,
        hours: 7 * 24,
        minutes: 7 * 24 * 60,
        seconds: 7 * 24 * 60 * 60,
        milliseconds: 7 * 24 * 60 * 60 * 1e3
      },
      days: {
        hours: 24,
        minutes: 24 * 60,
        seconds: 24 * 60 * 60,
        milliseconds: 24 * 60 * 60 * 1e3
      },
      hours: {
        minutes: 60,
        seconds: 60 * 60,
        milliseconds: 60 * 60 * 1e3
      },
      minutes: {
        seconds: 60,
        milliseconds: 60 * 1e3
      },
      seconds: {
        milliseconds: 1e3
      }
    };
    var casualMatrix = {
      years: {
        quarters: 4,
        months: 12,
        weeks: 52,
        days: 365,
        hours: 365 * 24,
        minutes: 365 * 24 * 60,
        seconds: 365 * 24 * 60 * 60,
        milliseconds: 365 * 24 * 60 * 60 * 1e3
      },
      quarters: {
        months: 3,
        weeks: 13,
        days: 91,
        hours: 91 * 24,
        minutes: 91 * 24 * 60,
        seconds: 91 * 24 * 60 * 60,
        milliseconds: 91 * 24 * 60 * 60 * 1e3
      },
      months: {
        weeks: 4,
        days: 30,
        hours: 30 * 24,
        minutes: 30 * 24 * 60,
        seconds: 30 * 24 * 60 * 60,
        milliseconds: 30 * 24 * 60 * 60 * 1e3
      },
      ...lowOrderMatrix
    };
    var daysInYearAccurate = 146097 / 400;
    var daysInMonthAccurate = 146097 / 4800;
    var accurateMatrix = {
      years: {
        quarters: 4,
        months: 12,
        weeks: daysInYearAccurate / 7,
        days: daysInYearAccurate,
        hours: daysInYearAccurate * 24,
        minutes: daysInYearAccurate * 24 * 60,
        seconds: daysInYearAccurate * 24 * 60 * 60,
        milliseconds: daysInYearAccurate * 24 * 60 * 60 * 1e3
      },
      quarters: {
        months: 3,
        weeks: daysInYearAccurate / 28,
        days: daysInYearAccurate / 4,
        hours: daysInYearAccurate * 24 / 4,
        minutes: daysInYearAccurate * 24 * 60 / 4,
        seconds: daysInYearAccurate * 24 * 60 * 60 / 4,
        milliseconds: daysInYearAccurate * 24 * 60 * 60 * 1e3 / 4
      },
      months: {
        weeks: daysInMonthAccurate / 7,
        days: daysInMonthAccurate,
        hours: daysInMonthAccurate * 24,
        minutes: daysInMonthAccurate * 24 * 60,
        seconds: daysInMonthAccurate * 24 * 60 * 60,
        milliseconds: daysInMonthAccurate * 24 * 60 * 60 * 1e3
      },
      ...lowOrderMatrix
    };
    var orderedUnits$1 = ["years", "quarters", "months", "weeks", "days", "hours", "minutes", "seconds", "milliseconds"];
    var reverseUnits = orderedUnits$1.slice(0).reverse();
    function clone$1(dur, alts, clear = false) {
      const conf = {
        values: clear ? alts.values : {
          ...dur.values,
          ...alts.values || {}
        },
        loc: dur.loc.clone(alts.loc),
        conversionAccuracy: alts.conversionAccuracy || dur.conversionAccuracy,
        matrix: alts.matrix || dur.matrix
      };
      return new Duration(conf);
    }
    function durationToMillis(matrix, vals) {
      var _vals$milliseconds;
      let sum = (_vals$milliseconds = vals.milliseconds) != null ? _vals$milliseconds : 0;
      for (const unit of reverseUnits.slice(1)) {
        if (vals[unit]) {
          sum += vals[unit] * matrix[unit]["milliseconds"];
        }
      }
      return sum;
    }
    function normalizeValues(matrix, vals) {
      const factor = durationToMillis(matrix, vals) < 0 ? -1 : 1;
      orderedUnits$1.reduceRight((previous, current) => {
        if (!isUndefined(vals[current])) {
          if (previous) {
            const previousVal = vals[previous] * factor;
            const conv = matrix[current][previous];
            const rollUp = Math.floor(previousVal / conv);
            vals[current] += rollUp * factor;
            vals[previous] -= rollUp * conv * factor;
          }
          return current;
        } else {
          return previous;
        }
      }, null);
      orderedUnits$1.reduce((previous, current) => {
        if (!isUndefined(vals[current])) {
          if (previous) {
            const fraction = vals[previous] % 1;
            vals[previous] -= fraction;
            vals[current] += fraction * matrix[previous][current];
          }
          return current;
        } else {
          return previous;
        }
      }, null);
    }
    function removeZeroes(vals) {
      const newVals = {};
      for (const [key, value] of Object.entries(vals)) {
        if (value !== 0) {
          newVals[key] = value;
        }
      }
      return newVals;
    }
    var Duration = class _Duration {
      /**
       * @private
       */
      constructor(config) {
        const accurate = config.conversionAccuracy === "longterm" || false;
        let matrix = accurate ? accurateMatrix : casualMatrix;
        if (config.matrix) {
          matrix = config.matrix;
        }
        this.values = config.values;
        this.loc = config.loc || Locale.create();
        this.conversionAccuracy = accurate ? "longterm" : "casual";
        this.invalid = config.invalid || null;
        this.matrix = matrix;
        this.isLuxonDuration = true;
      }
      /**
       * Create Duration from a number of milliseconds.
       * @param {number} count of milliseconds
       * @param {Object} opts - options for parsing
       * @param {string} [opts.locale='en-US'] - the locale to use
       * @param {string} opts.numberingSystem - the numbering system to use
       * @param {string} [opts.conversionAccuracy='casual'] - the conversion system to use
       * @return {Duration}
       */
      static fromMillis(count, opts) {
        return _Duration.fromObject({
          milliseconds: count
        }, opts);
      }
      /**
       * Create a Duration from a JavaScript object with keys like 'years' and 'hours'.
       * If this object is empty then a zero milliseconds duration is returned.
       * @param {Object} obj - the object to create the DateTime from
       * @param {number} obj.years
       * @param {number} obj.quarters
       * @param {number} obj.months
       * @param {number} obj.weeks
       * @param {number} obj.days
       * @param {number} obj.hours
       * @param {number} obj.minutes
       * @param {number} obj.seconds
       * @param {number} obj.milliseconds
       * @param {Object} [opts=[]] - options for creating this Duration
       * @param {string} [opts.locale='en-US'] - the locale to use
       * @param {string} opts.numberingSystem - the numbering system to use
       * @param {string} [opts.conversionAccuracy='casual'] - the preset conversion system to use
       * @param {string} [opts.matrix=Object] - the custom conversion system to use
       * @return {Duration}
       */
      static fromObject(obj, opts = {}) {
        if (obj == null || typeof obj !== "object") {
          throw new InvalidArgumentError(`Duration.fromObject: argument expected to be an object, got ${obj === null ? "null" : typeof obj}`);
        }
        return new _Duration({
          values: normalizeObject(obj, _Duration.normalizeUnit),
          loc: Locale.fromObject(opts),
          conversionAccuracy: opts.conversionAccuracy,
          matrix: opts.matrix
        });
      }
      /**
       * Create a Duration from DurationLike.
       *
       * @param {Object | number | Duration} durationLike
       * One of:
       * - object with keys like 'years' and 'hours'.
       * - number representing milliseconds
       * - Duration instance
       * @return {Duration}
       */
      static fromDurationLike(durationLike) {
        if (isNumber(durationLike)) {
          return _Duration.fromMillis(durationLike);
        } else if (_Duration.isDuration(durationLike)) {
          return durationLike;
        } else if (typeof durationLike === "object") {
          return _Duration.fromObject(durationLike);
        } else {
          throw new InvalidArgumentError(`Unknown duration argument ${durationLike} of type ${typeof durationLike}`);
        }
      }
      /**
       * Create a Duration from an ISO 8601 duration string.
       * @param {string} text - text to parse
       * @param {Object} opts - options for parsing
       * @param {string} [opts.locale='en-US'] - the locale to use
       * @param {string} opts.numberingSystem - the numbering system to use
       * @param {string} [opts.conversionAccuracy='casual'] - the preset conversion system to use
       * @param {string} [opts.matrix=Object] - the preset conversion system to use
       * @see https://en.wikipedia.org/wiki/ISO_8601#Durations
       * @example Duration.fromISO('P3Y6M1W4DT12H30M5S').toObject() //=> { years: 3, months: 6, weeks: 1, days: 4, hours: 12, minutes: 30, seconds: 5 }
       * @example Duration.fromISO('PT23H').toObject() //=> { hours: 23 }
       * @example Duration.fromISO('P5Y3M').toObject() //=> { years: 5, months: 3 }
       * @return {Duration}
       */
      static fromISO(text, opts) {
        const [parsed] = parseISODuration(text);
        if (parsed) {
          return _Duration.fromObject(parsed, opts);
        } else {
          return _Duration.invalid("unparsable", `the input "${text}" can't be parsed as ISO 8601`);
        }
      }
      /**
       * Create a Duration from an ISO 8601 time string.
       * @param {string} text - text to parse
       * @param {Object} opts - options for parsing
       * @param {string} [opts.locale='en-US'] - the locale to use
       * @param {string} opts.numberingSystem - the numbering system to use
       * @param {string} [opts.conversionAccuracy='casual'] - the preset conversion system to use
       * @param {string} [opts.matrix=Object] - the conversion system to use
       * @see https://en.wikipedia.org/wiki/ISO_8601#Times
       * @example Duration.fromISOTime('11:22:33.444').toObject() //=> { hours: 11, minutes: 22, seconds: 33, milliseconds: 444 }
       * @example Duration.fromISOTime('11:00').toObject() //=> { hours: 11, minutes: 0, seconds: 0 }
       * @example Duration.fromISOTime('T11:00').toObject() //=> { hours: 11, minutes: 0, seconds: 0 }
       * @example Duration.fromISOTime('1100').toObject() //=> { hours: 11, minutes: 0, seconds: 0 }
       * @example Duration.fromISOTime('T1100').toObject() //=> { hours: 11, minutes: 0, seconds: 0 }
       * @return {Duration}
       */
      static fromISOTime(text, opts) {
        const [parsed] = parseISOTimeOnly(text);
        if (parsed) {
          return _Duration.fromObject(parsed, opts);
        } else {
          return _Duration.invalid("unparsable", `the input "${text}" can't be parsed as ISO 8601`);
        }
      }
      /**
       * Create an invalid Duration.
       * @param {string} reason - simple string of why this datetime is invalid. Should not contain parameters or anything else data-dependent
       * @param {string} [explanation=null] - longer explanation, may include parameters and other useful debugging information
       * @return {Duration}
       */
      static invalid(reason, explanation = null) {
        if (!reason) {
          throw new InvalidArgumentError("need to specify a reason the Duration is invalid");
        }
        const invalid2 = reason instanceof Invalid ? reason : new Invalid(reason, explanation);
        if (Settings.throwOnInvalid) {
          throw new InvalidDurationError(invalid2);
        } else {
          return new _Duration({
            invalid: invalid2
          });
        }
      }
      /**
       * @private
       */
      static normalizeUnit(unit) {
        const normalized = {
          year: "years",
          years: "years",
          quarter: "quarters",
          quarters: "quarters",
          month: "months",
          months: "months",
          week: "weeks",
          weeks: "weeks",
          day: "days",
          days: "days",
          hour: "hours",
          hours: "hours",
          minute: "minutes",
          minutes: "minutes",
          second: "seconds",
          seconds: "seconds",
          millisecond: "milliseconds",
          milliseconds: "milliseconds"
        }[unit ? unit.toLowerCase() : unit];
        if (!normalized) throw new InvalidUnitError(unit);
        return normalized;
      }
      /**
       * Check if an object is a Duration. Works across context boundaries
       * @param {object} o
       * @return {boolean}
       */
      static isDuration(o) {
        return o && o.isLuxonDuration || false;
      }
      /**
       * Get  the locale of a Duration, such 'en-GB'
       * @type {string}
       */
      get locale() {
        return this.isValid ? this.loc.locale : null;
      }
      /**
       * Get the numbering system of a Duration, such 'beng'. The numbering system is used when formatting the Duration
       *
       * @type {string}
       */
      get numberingSystem() {
        return this.isValid ? this.loc.numberingSystem : null;
      }
      /**
       * Returns a string representation of this Duration formatted according to the specified format string. You may use these tokens:
       * * `S` for milliseconds
       * * `s` for seconds
       * * `m` for minutes
       * * `h` for hours
       * * `d` for days
       * * `w` for weeks
       * * `M` for months
       * * `y` for years
       * Notes:
       * * Add padding by repeating the token, e.g. "yy" pads the years to two digits, "hhhh" pads the hours out to four digits
       * * Tokens can be escaped by wrapping with single quotes.
       * * The duration will be converted to the set of units in the format string using {@link Duration#shiftTo} and the Durations's conversion accuracy setting.
       * @param {string} fmt - the format string
       * @param {Object} opts - options
       * @param {boolean} [opts.floor=true] - floor numerical values
       * @param {'negative'|'all'|'negativeLargestOnly'} [opts.signMode=negative] - How to handle signs
       * @example Duration.fromObject({ years: 1, days: 6, seconds: 2 }).toFormat("y d s") //=> "1 6 2"
       * @example Duration.fromObject({ years: 1, days: 6, seconds: 2 }).toFormat("yy dd sss") //=> "01 06 002"
       * @example Duration.fromObject({ years: 1, days: 6, seconds: 2 }).toFormat("M S") //=> "12 518402000"
       * @example Duration.fromObject({ days: 6, seconds: 2 }).toFormat("d s", { signMode: "all" }) //=> "+6 +2"
       * @example Duration.fromObject({ days: -6, seconds: -2 }).toFormat("d s", { signMode: "all" }) //=> "-6 -2"
       * @example Duration.fromObject({ days: -6, seconds: -2 }).toFormat("d s", { signMode: "negativeLargestOnly" }) //=> "-6 2"
       * @return {string}
       */
      toFormat(fmt, opts = {}) {
        const fmtOpts = {
          ...opts,
          floor: opts.round !== false && opts.floor !== false
        };
        return this.isValid ? Formatter.create(this.loc, fmtOpts).formatDurationFromString(this, fmt) : INVALID$2;
      }
      /**
       * Returns a string representation of a Duration with all units included.
       * To modify its behavior, use `listStyle` and any Intl.NumberFormat option, though `unitDisplay` is especially relevant.
       * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat/NumberFormat#options
       * @param {Object} opts - Formatting options. Accepts the same keys as the options parameter of the native `Intl.NumberFormat` constructor, as well as `listStyle`.
       * @param {string} [opts.listStyle='narrow'] - How to format the merged list. Corresponds to the `style` property of the options parameter of the native `Intl.ListFormat` constructor.
       * @param {boolean} [opts.showZeros=true] - Show all units previously used by the duration even if they are zero
       * @example
       * ```js
       * var dur = Duration.fromObject({ months: 1, weeks: 0, hours: 5, minutes: 6 })
       * dur.toHuman() //=> '1 month, 0 weeks, 5 hours, 6 minutes'
       * dur.toHuman({ listStyle: "long" }) //=> '1 month, 0 weeks, 5 hours, and 6 minutes'
       * dur.toHuman({ unitDisplay: "short" }) //=> '1 mth, 0 wks, 5 hr, 6 min'
       * dur.toHuman({ showZeros: false }) //=> '1 month, 5 hours, 6 minutes'
       * ```
       */
      toHuman(opts = {}) {
        if (!this.isValid) return INVALID$2;
        const showZeros = opts.showZeros !== false;
        const l2 = orderedUnits$1.map((unit) => {
          const val = this.values[unit];
          if (isUndefined(val) || val === 0 && !showZeros) {
            return null;
          }
          return this.loc.numberFormatter({
            style: "unit",
            unitDisplay: "long",
            ...opts,
            unit: unit.slice(0, -1)
          }).format(val);
        }).filter((n2) => n2);
        return this.loc.listFormatter({
          type: "conjunction",
          style: opts.listStyle || "narrow",
          ...opts
        }).format(l2);
      }
      /**
       * Returns a JavaScript object with this Duration's values.
       * @example Duration.fromObject({ years: 1, days: 6, seconds: 2 }).toObject() //=> { years: 1, days: 6, seconds: 2 }
       * @return {Object}
       */
      toObject() {
        if (!this.isValid) return {};
        return {
          ...this.values
        };
      }
      /**
       * Returns an ISO 8601-compliant string representation of this Duration.
       * @see https://en.wikipedia.org/wiki/ISO_8601#Durations
       * @example Duration.fromObject({ years: 3, seconds: 45 }).toISO() //=> 'P3YT45S'
       * @example Duration.fromObject({ months: 4, seconds: 45 }).toISO() //=> 'P4MT45S'
       * @example Duration.fromObject({ months: 5 }).toISO() //=> 'P5M'
       * @example Duration.fromObject({ minutes: 5 }).toISO() //=> 'PT5M'
       * @example Duration.fromObject({ milliseconds: 6 }).toISO() //=> 'PT0.006S'
       * @return {string}
       */
      toISO() {
        if (!this.isValid) return null;
        let s2 = "P";
        if (this.years !== 0) s2 += this.years + "Y";
        if (this.months !== 0 || this.quarters !== 0) s2 += this.months + this.quarters * 3 + "M";
        if (this.weeks !== 0) s2 += this.weeks + "W";
        if (this.days !== 0) s2 += this.days + "D";
        if (this.hours !== 0 || this.minutes !== 0 || this.seconds !== 0 || this.milliseconds !== 0) s2 += "T";
        if (this.hours !== 0) s2 += this.hours + "H";
        if (this.minutes !== 0) s2 += this.minutes + "M";
        if (this.seconds !== 0 || this.milliseconds !== 0)
          s2 += roundTo(this.seconds + this.milliseconds / 1e3, 3) + "S";
        if (s2 === "P") s2 += "T0S";
        return s2;
      }
      /**
       * Returns an ISO 8601-compliant string representation of this Duration, formatted as a time of day.
       * Note that this will return null if the duration is invalid, negative, or equal to or greater than 24 hours.
       * @see https://en.wikipedia.org/wiki/ISO_8601#Times
       * @param {Object} opts - options
       * @param {boolean} [opts.suppressMilliseconds=false] - exclude milliseconds from the format if they're 0
       * @param {boolean} [opts.suppressSeconds=false] - exclude seconds from the format if they're 0
       * @param {boolean} [opts.includePrefix=false] - include the `T` prefix
       * @param {string} [opts.format='extended'] - choose between the basic and extended format
       * @example Duration.fromObject({ hours: 11 }).toISOTime() //=> '11:00:00.000'
       * @example Duration.fromObject({ hours: 11 }).toISOTime({ suppressMilliseconds: true }) //=> '11:00:00'
       * @example Duration.fromObject({ hours: 11 }).toISOTime({ suppressSeconds: true }) //=> '11:00'
       * @example Duration.fromObject({ hours: 11 }).toISOTime({ includePrefix: true }) //=> 'T11:00:00.000'
       * @example Duration.fromObject({ hours: 11 }).toISOTime({ format: 'basic' }) //=> '110000.000'
       * @return {string}
       */
      toISOTime(opts = {}) {
        if (!this.isValid) return null;
        const millis = this.toMillis();
        if (millis < 0 || millis >= 864e5) return null;
        opts = {
          suppressMilliseconds: false,
          suppressSeconds: false,
          includePrefix: false,
          format: "extended",
          ...opts,
          includeOffset: false
        };
        const dateTime = DateTime.fromMillis(millis, {
          zone: "UTC"
        });
        return dateTime.toISOTime(opts);
      }
      /**
       * Returns an ISO 8601 representation of this Duration appropriate for use in JSON.
       * @return {string}
       */
      toJSON() {
        return this.toISO();
      }
      /**
       * Returns an ISO 8601 representation of this Duration appropriate for use in debugging.
       * @return {string}
       */
      toString() {
        return this.toISO();
      }
      /**
       * Returns a string representation of this Duration appropriate for the REPL.
       * @return {string}
       */
      [/* @__PURE__ */ Symbol.for("nodejs.util.inspect.custom")]() {
        if (this.isValid) {
          return `Duration { values: ${JSON.stringify(this.values)} }`;
        } else {
          return `Duration { Invalid, reason: ${this.invalidReason} }`;
        }
      }
      /**
       * Returns an milliseconds value of this Duration.
       * @return {number}
       */
      toMillis() {
        if (!this.isValid) return NaN;
        return durationToMillis(this.matrix, this.values);
      }
      /**
       * Returns an milliseconds value of this Duration. Alias of {@link toMillis}
       * @return {number}
       */
      valueOf() {
        return this.toMillis();
      }
      /**
       * Make this Duration longer by the specified amount. Return a newly-constructed Duration.
       * @param {Duration|Object|number} duration - The amount to add. Either a Luxon Duration, a number of milliseconds, the object argument to Duration.fromObject()
       * @return {Duration}
       */
      plus(duration) {
        if (!this.isValid) return this;
        const dur = _Duration.fromDurationLike(duration), result = {};
        for (const k of orderedUnits$1) {
          if (hasOwnProperty(dur.values, k) || hasOwnProperty(this.values, k)) {
            result[k] = dur.get(k) + this.get(k);
          }
        }
        return clone$1(this, {
          values: result
        }, true);
      }
      /**
       * Make this Duration shorter by the specified amount. Return a newly-constructed Duration.
       * @param {Duration|Object|number} duration - The amount to subtract. Either a Luxon Duration, a number of milliseconds, the object argument to Duration.fromObject()
       * @return {Duration}
       */
      minus(duration) {
        if (!this.isValid) return this;
        const dur = _Duration.fromDurationLike(duration);
        return this.plus(dur.negate());
      }
      /**
       * Scale this Duration by the specified amount. Return a newly-constructed Duration.
       * @param {function} fn - The function to apply to each unit. Arity is 1 or 2: the value of the unit and, optionally, the unit name. Must return a number.
       * @example Duration.fromObject({ hours: 1, minutes: 30 }).mapUnits(x => x * 2) //=> { hours: 2, minutes: 60 }
       * @example Duration.fromObject({ hours: 1, minutes: 30 }).mapUnits((x, u) => u === "hours" ? x * 2 : x) //=> { hours: 2, minutes: 30 }
       * @return {Duration}
       */
      mapUnits(fn) {
        if (!this.isValid) return this;
        const result = {};
        for (const k of Object.keys(this.values)) {
          result[k] = asNumber(fn(this.values[k], k));
        }
        return clone$1(this, {
          values: result
        }, true);
      }
      /**
       * Get the value of unit.
       * @param {string} unit - a unit such as 'minute' or 'day'
       * @example Duration.fromObject({years: 2, days: 3}).get('years') //=> 2
       * @example Duration.fromObject({years: 2, days: 3}).get('months') //=> 0
       * @example Duration.fromObject({years: 2, days: 3}).get('days') //=> 3
       * @return {number}
       */
      get(unit) {
        return this[_Duration.normalizeUnit(unit)];
      }
      /**
       * "Set" the values of specified units. Return a newly-constructed Duration.
       * @param {Object} values - a mapping of units to numbers
       * @example dur.set({ years: 2017 })
       * @example dur.set({ hours: 8, minutes: 30 })
       * @return {Duration}
       */
      set(values) {
        if (!this.isValid) return this;
        const mixed = {
          ...this.values,
          ...normalizeObject(values, _Duration.normalizeUnit)
        };
        return clone$1(this, {
          values: mixed
        });
      }
      /**
       * "Set" the locale and/or numberingSystem.  Returns a newly-constructed Duration.
       * @example dur.reconfigure({ locale: 'en-GB' })
       * @return {Duration}
       */
      reconfigure({
        locale,
        numberingSystem,
        conversionAccuracy,
        matrix
      } = {}) {
        const loc = this.loc.clone({
          locale,
          numberingSystem
        });
        const opts = {
          loc,
          matrix,
          conversionAccuracy
        };
        return clone$1(this, opts);
      }
      /**
       * Return the length of the duration in the specified unit.
       * @param {string} unit - a unit such as 'minutes' or 'days'
       * @example Duration.fromObject({years: 1}).as('days') //=> 365
       * @example Duration.fromObject({years: 1}).as('months') //=> 12
       * @example Duration.fromObject({hours: 60}).as('days') //=> 2.5
       * @return {number}
       */
      as(unit) {
        return this.isValid ? this.shiftTo(unit).get(unit) : NaN;
      }
      /**
       * Reduce this Duration to its canonical representation in its current units.
       * Assuming the overall value of the Duration is positive, this means:
       * - excessive values for lower-order units are converted to higher-order units (if possible, see first and second example)
       * - negative lower-order units are converted to higher order units (there must be such a higher order unit, otherwise
       *   the overall value would be negative, see third example)
       * - fractional values for higher-order units are converted to lower-order units (if possible, see fourth example)
       *
       * If the overall value is negative, the result of this method is equivalent to `this.negate().normalize().negate()`.
       * @example Duration.fromObject({ years: 2, days: 5000 }).normalize().toObject() //=> { years: 15, days: 255 }
       * @example Duration.fromObject({ days: 5000 }).normalize().toObject() //=> { days: 5000 }
       * @example Duration.fromObject({ hours: 12, minutes: -45 }).normalize().toObject() //=> { hours: 11, minutes: 15 }
       * @example Duration.fromObject({ years: 2.5, days: 0, hours: 0 }).normalize().toObject() //=> { years: 2, days: 182, hours: 12 }
       * @return {Duration}
       */
      normalize() {
        if (!this.isValid) return this;
        const vals = this.toObject();
        normalizeValues(this.matrix, vals);
        return clone$1(this, {
          values: vals
        }, true);
      }
      /**
       * Rescale units to its largest representation
       * @example Duration.fromObject({ milliseconds: 90000 }).rescale().toObject() //=> { minutes: 1, seconds: 30 }
       * @return {Duration}
       */
      rescale() {
        if (!this.isValid) return this;
        const vals = removeZeroes(this.normalize().shiftToAll().toObject());
        return clone$1(this, {
          values: vals
        }, true);
      }
      /**
       * Convert this Duration into its representation in a different set of units.
       * @example Duration.fromObject({ hours: 1, seconds: 30 }).shiftTo('minutes', 'milliseconds').toObject() //=> { minutes: 60, milliseconds: 30000 }
       * @return {Duration}
       */
      shiftTo(...units) {
        if (!this.isValid) return this;
        if (units.length === 0) {
          return this;
        }
        units = units.map((u) => _Duration.normalizeUnit(u));
        const built = {}, accumulated = {}, vals = this.toObject();
        let lastUnit;
        for (const k of orderedUnits$1) {
          if (units.indexOf(k) >= 0) {
            lastUnit = k;
            let own = 0;
            for (const ak in accumulated) {
              own += this.matrix[ak][k] * accumulated[ak];
              accumulated[ak] = 0;
            }
            if (isNumber(vals[k])) {
              own += vals[k];
            }
            const i = Math.trunc(own);
            built[k] = i;
            accumulated[k] = (own * 1e3 - i * 1e3) / 1e3;
          } else if (isNumber(vals[k])) {
            accumulated[k] = vals[k];
          }
        }
        for (const key in accumulated) {
          if (accumulated[key] !== 0) {
            built[lastUnit] += key === lastUnit ? accumulated[key] : accumulated[key] / this.matrix[lastUnit][key];
          }
        }
        normalizeValues(this.matrix, built);
        return clone$1(this, {
          values: built
        }, true);
      }
      /**
       * Shift this Duration to all available units.
       * Same as shiftTo("years", "months", "weeks", "days", "hours", "minutes", "seconds", "milliseconds")
       * @return {Duration}
       */
      shiftToAll() {
        if (!this.isValid) return this;
        return this.shiftTo("years", "months", "weeks", "days", "hours", "minutes", "seconds", "milliseconds");
      }
      /**
       * Return the negative of this Duration.
       * @example Duration.fromObject({ hours: 1, seconds: 30 }).negate().toObject() //=> { hours: -1, seconds: -30 }
       * @return {Duration}
       */
      negate() {
        if (!this.isValid) return this;
        const negated = {};
        for (const k of Object.keys(this.values)) {
          negated[k] = this.values[k] === 0 ? 0 : -this.values[k];
        }
        return clone$1(this, {
          values: negated
        }, true);
      }
      /**
       * Removes all units with values equal to 0 from this Duration.
       * @example Duration.fromObject({ years: 2, days: 0, hours: 0, minutes: 0 }).removeZeros().toObject() //=> { years: 2 }
       * @return {Duration}
       */
      removeZeros() {
        if (!this.isValid) return this;
        const vals = removeZeroes(this.values);
        return clone$1(this, {
          values: vals
        }, true);
      }
      /**
       * Get the years.
       * @type {number}
       */
      get years() {
        return this.isValid ? this.values.years || 0 : NaN;
      }
      /**
       * Get the quarters.
       * @type {number}
       */
      get quarters() {
        return this.isValid ? this.values.quarters || 0 : NaN;
      }
      /**
       * Get the months.
       * @type {number}
       */
      get months() {
        return this.isValid ? this.values.months || 0 : NaN;
      }
      /**
       * Get the weeks
       * @type {number}
       */
      get weeks() {
        return this.isValid ? this.values.weeks || 0 : NaN;
      }
      /**
       * Get the days.
       * @type {number}
       */
      get days() {
        return this.isValid ? this.values.days || 0 : NaN;
      }
      /**
       * Get the hours.
       * @type {number}
       */
      get hours() {
        return this.isValid ? this.values.hours || 0 : NaN;
      }
      /**
       * Get the minutes.
       * @type {number}
       */
      get minutes() {
        return this.isValid ? this.values.minutes || 0 : NaN;
      }
      /**
       * Get the seconds.
       * @return {number}
       */
      get seconds() {
        return this.isValid ? this.values.seconds || 0 : NaN;
      }
      /**
       * Get the milliseconds.
       * @return {number}
       */
      get milliseconds() {
        return this.isValid ? this.values.milliseconds || 0 : NaN;
      }
      /**
       * Returns whether the Duration is invalid. Invalid durations are returned by diff operations
       * on invalid DateTimes or Intervals.
       * @return {boolean}
       */
      get isValid() {
        return this.invalid === null;
      }
      /**
       * Returns an error code if this Duration became invalid, or null if the Duration is valid
       * @return {string}
       */
      get invalidReason() {
        return this.invalid ? this.invalid.reason : null;
      }
      /**
       * Returns an explanation of why this Duration became invalid, or null if the Duration is valid
       * @type {string}
       */
      get invalidExplanation() {
        return this.invalid ? this.invalid.explanation : null;
      }
      /**
       * Equality check
       * Two Durations are equal iff they have the same units and the same values for each unit.
       * @param {Duration} other
       * @return {boolean}
       */
      equals(other) {
        if (!this.isValid || !other.isValid) {
          return false;
        }
        if (!this.loc.equals(other.loc)) {
          return false;
        }
        function eq(v1, v2) {
          if (v1 === void 0 || v1 === 0) return v2 === void 0 || v2 === 0;
          return v1 === v2;
        }
        for (const u of orderedUnits$1) {
          if (!eq(this.values[u], other.values[u])) {
            return false;
          }
        }
        return true;
      }
    };
    var INVALID$1 = "Invalid Interval";
    function validateStartEnd(start, end) {
      if (!start || !start.isValid) {
        return Interval.invalid("missing or invalid start");
      } else if (!end || !end.isValid) {
        return Interval.invalid("missing or invalid end");
      } else if (end < start) {
        return Interval.invalid("end before start", `The end of an interval must be after its start, but you had start=${start.toISO()} and end=${end.toISO()}`);
      } else {
        return null;
      }
    }
    var Interval = class _Interval {
      /**
       * @private
       */
      constructor(config) {
        this.s = config.start;
        this.e = config.end;
        this.invalid = config.invalid || null;
        this.isLuxonInterval = true;
      }
      /**
       * Create an invalid Interval.
       * @param {string} reason - simple string of why this Interval is invalid. Should not contain parameters or anything else data-dependent
       * @param {string} [explanation=null] - longer explanation, may include parameters and other useful debugging information
       * @return {Interval}
       */
      static invalid(reason, explanation = null) {
        if (!reason) {
          throw new InvalidArgumentError("need to specify a reason the Interval is invalid");
        }
        const invalid2 = reason instanceof Invalid ? reason : new Invalid(reason, explanation);
        if (Settings.throwOnInvalid) {
          throw new InvalidIntervalError(invalid2);
        } else {
          return new _Interval({
            invalid: invalid2
          });
        }
      }
      /**
       * Create an Interval from a start DateTime and an end DateTime. Inclusive of the start but not the end.
       * @param {DateTime|Date|Object} start
       * @param {DateTime|Date|Object} end
       * @return {Interval}
       */
      static fromDateTimes(start, end) {
        const builtStart = friendlyDateTime(start), builtEnd = friendlyDateTime(end);
        const validateError = validateStartEnd(builtStart, builtEnd);
        if (validateError == null) {
          return new _Interval({
            start: builtStart,
            end: builtEnd
          });
        } else {
          return validateError;
        }
      }
      /**
       * Create an Interval from a start DateTime and a Duration to extend to.
       * @param {DateTime|Date|Object} start
       * @param {Duration|Object|number} duration - the length of the Interval.
       * @return {Interval}
       */
      static after(start, duration) {
        const dur = Duration.fromDurationLike(duration), dt = friendlyDateTime(start);
        return _Interval.fromDateTimes(dt, dt.plus(dur));
      }
      /**
       * Create an Interval from an end DateTime and a Duration to extend backwards to.
       * @param {DateTime|Date|Object} end
       * @param {Duration|Object|number} duration - the length of the Interval.
       * @return {Interval}
       */
      static before(end, duration) {
        const dur = Duration.fromDurationLike(duration), dt = friendlyDateTime(end);
        return _Interval.fromDateTimes(dt.minus(dur), dt);
      }
      /**
       * Create an Interval from an ISO 8601 string.
       * Accepts `<start>/<end>`, `<start>/<duration>`, and `<duration>/<end>` formats.
       * @param {string} text - the ISO string to parse
       * @param {Object} [opts] - options to pass {@link DateTime#fromISO} and optionally {@link Duration#fromISO}
       * @see https://en.wikipedia.org/wiki/ISO_8601#Time_intervals
       * @return {Interval}
       */
      static fromISO(text, opts) {
        const [s2, e] = (text || "").split("/", 2);
        if (s2 && e) {
          let start, startIsValid;
          try {
            start = DateTime.fromISO(s2, opts);
            startIsValid = start.isValid;
          } catch (e2) {
            startIsValid = false;
          }
          let end, endIsValid;
          try {
            end = DateTime.fromISO(e, opts);
            endIsValid = end.isValid;
          } catch (e2) {
            endIsValid = false;
          }
          if (startIsValid && endIsValid) {
            return _Interval.fromDateTimes(start, end);
          }
          if (startIsValid) {
            const dur = Duration.fromISO(e, opts);
            if (dur.isValid) {
              return _Interval.after(start, dur);
            }
          } else if (endIsValid) {
            const dur = Duration.fromISO(s2, opts);
            if (dur.isValid) {
              return _Interval.before(end, dur);
            }
          }
        }
        return _Interval.invalid("unparsable", `the input "${text}" can't be parsed as ISO 8601`);
      }
      /**
       * Check if an object is an Interval. Works across context boundaries
       * @param {object} o
       * @return {boolean}
       */
      static isInterval(o) {
        return o && o.isLuxonInterval || false;
      }
      /**
       * Returns the start of the Interval
       * @type {DateTime}
       */
      get start() {
        return this.isValid ? this.s : null;
      }
      /**
       * Returns the end of the Interval. This is the first instant which is not part of the interval
       * (Interval is half-open).
       * @type {DateTime}
       */
      get end() {
        return this.isValid ? this.e : null;
      }
      /**
       * Returns the last DateTime included in the interval (since end is not part of the interval)
       * @type {DateTime}
       */
      get lastDateTime() {
        return this.isValid ? this.e ? this.e.minus(1) : null : null;
      }
      /**
       * Returns whether this Interval's end is at least its start, meaning that the Interval isn't 'backwards'.
       * @type {boolean}
       */
      get isValid() {
        return this.invalidReason === null;
      }
      /**
       * Returns an error code if this Interval is invalid, or null if the Interval is valid
       * @type {string}
       */
      get invalidReason() {
        return this.invalid ? this.invalid.reason : null;
      }
      /**
       * Returns an explanation of why this Interval became invalid, or null if the Interval is valid
       * @type {string}
       */
      get invalidExplanation() {
        return this.invalid ? this.invalid.explanation : null;
      }
      /**
       * Returns the length of the Interval in the specified unit.
       * @param {string} unit - the unit (such as 'hours' or 'days') to return the length in.
       * @return {number}
       */
      length(unit = "milliseconds") {
        return this.isValid ? this.toDuration(...[unit]).get(unit) : NaN;
      }
      /**
       * Returns the count of minutes, hours, days, months, or years included in the Interval, even in part.
       * Unlike {@link Interval#length} this counts sections of the calendar, not periods of time, e.g. specifying 'day'
       * asks 'what dates are included in this interval?', not 'how many days long is this interval?'
       * @param {string} [unit='milliseconds'] - the unit of time to count.
       * @param {Object} opts - options
       * @param {boolean} [opts.useLocaleWeeks=false] - If true, use weeks based on the locale, i.e. use the locale-dependent start of the week; this operation will always use the locale of the start DateTime
       * @return {number}
       */
      count(unit = "milliseconds", opts) {
        if (!this.isValid) return NaN;
        const start = this.start.startOf(unit, opts);
        let end;
        if (opts != null && opts.useLocaleWeeks) {
          end = this.end.reconfigure({
            locale: start.locale
          });
        } else {
          end = this.end;
        }
        end = end.startOf(unit, opts);
        return Math.floor(end.diff(start, unit).get(unit)) + (end.valueOf() !== this.end.valueOf());
      }
      /**
       * Returns whether this Interval's start and end are both in the same unit of time
       * @param {string} unit - the unit of time to check sameness on
       * @return {boolean}
       */
      hasSame(unit) {
        return this.isValid ? this.isEmpty() || this.e.minus(1).hasSame(this.s, unit) : false;
      }
      /**
       * Return whether this Interval has the same start and end DateTimes.
       * @return {boolean}
       */
      isEmpty() {
        return this.s.valueOf() === this.e.valueOf();
      }
      /**
       * Return whether this Interval's start is after the specified DateTime.
       * @param {DateTime} dateTime
       * @return {boolean}
       */
      isAfter(dateTime) {
        if (!this.isValid) return false;
        return this.s > dateTime;
      }
      /**
       * Return whether this Interval's end is before the specified DateTime.
       * @param {DateTime} dateTime
       * @return {boolean}
       */
      isBefore(dateTime) {
        if (!this.isValid) return false;
        return this.e <= dateTime;
      }
      /**
       * Return whether this Interval contains the specified DateTime.
       * @param {DateTime} dateTime
       * @return {boolean}
       */
      contains(dateTime) {
        if (!this.isValid) return false;
        return this.s <= dateTime && this.e > dateTime;
      }
      /**
       * "Sets" the start and/or end dates. Returns a newly-constructed Interval.
       * @param {Object} values - the values to set
       * @param {DateTime} values.start - the starting DateTime
       * @param {DateTime} values.end - the ending DateTime
       * @return {Interval}
       */
      set({
        start,
        end
      } = {}) {
        if (!this.isValid) return this;
        return _Interval.fromDateTimes(start || this.s, end || this.e);
      }
      /**
       * Split this Interval at each of the specified DateTimes
       * @param {...DateTime} dateTimes - the unit of time to count.
       * @return {Array}
       */
      splitAt(...dateTimes) {
        if (!this.isValid) return [];
        const sorted = dateTimes.map(friendlyDateTime).filter((d) => this.contains(d)).sort((a, b) => a.toMillis() - b.toMillis()), results = [];
        let {
          s: s2
        } = this, i = 0;
        while (s2 < this.e) {
          const added = sorted[i] || this.e, next = +added > +this.e ? this.e : added;
          results.push(_Interval.fromDateTimes(s2, next));
          s2 = next;
          i += 1;
        }
        return results;
      }
      /**
       * Split this Interval into smaller Intervals, each of the specified length.
       * Left over time is grouped into a smaller interval
       * @param {Duration|Object|number} duration - The length of each resulting interval.
       * @return {Array}
       */
      splitBy(duration) {
        const dur = Duration.fromDurationLike(duration);
        if (!this.isValid || !dur.isValid || dur.as("milliseconds") === 0) {
          return [];
        }
        let {
          s: s2
        } = this, idx = 1, next;
        const results = [];
        while (s2 < this.e) {
          const added = this.start.plus(dur.mapUnits((x) => x * idx));
          next = +added > +this.e ? this.e : added;
          results.push(_Interval.fromDateTimes(s2, next));
          s2 = next;
          idx += 1;
        }
        return results;
      }
      /**
       * Split this Interval into the specified number of smaller intervals.
       * @param {number} numberOfParts - The number of Intervals to divide the Interval into.
       * @return {Array}
       */
      divideEqually(numberOfParts) {
        if (!this.isValid) return [];
        return this.splitBy(this.length() / numberOfParts).slice(0, numberOfParts);
      }
      /**
       * Return whether this Interval overlaps with the specified Interval
       * @param {Interval} other
       * @return {boolean}
       */
      overlaps(other) {
        return this.e > other.s && this.s < other.e;
      }
      /**
       * Return whether this Interval's end is adjacent to the specified Interval's start.
       * @param {Interval} other
       * @return {boolean}
       */
      abutsStart(other) {
        if (!this.isValid) return false;
        return +this.e === +other.s;
      }
      /**
       * Return whether this Interval's start is adjacent to the specified Interval's end.
       * @param {Interval} other
       * @return {boolean}
       */
      abutsEnd(other) {
        if (!this.isValid) return false;
        return +other.e === +this.s;
      }
      /**
       * Returns true if this Interval fully contains the specified Interval, specifically if the intersect (of this Interval and the other Interval) is equal to the other Interval; false otherwise.
       * @param {Interval} other
       * @return {boolean}
       */
      engulfs(other) {
        if (!this.isValid) return false;
        return this.s <= other.s && this.e >= other.e;
      }
      /**
       * Return whether this Interval has the same start and end as the specified Interval.
       * @param {Interval} other
       * @return {boolean}
       */
      equals(other) {
        if (!this.isValid || !other.isValid) {
          return false;
        }
        return this.s.equals(other.s) && this.e.equals(other.e);
      }
      /**
       * Return an Interval representing the intersection of this Interval and the specified Interval.
       * Specifically, the resulting Interval has the maximum start time and the minimum end time of the two Intervals.
       * Returns null if the intersection is empty, meaning, the intervals don't intersect.
       * @param {Interval} other
       * @return {Interval}
       */
      intersection(other) {
        if (!this.isValid) return this;
        const s2 = this.s > other.s ? this.s : other.s, e = this.e < other.e ? this.e : other.e;
        if (s2 >= e) {
          return null;
        } else {
          return _Interval.fromDateTimes(s2, e);
        }
      }
      /**
       * Return an Interval representing the union of this Interval and the specified Interval.
       * Specifically, the resulting Interval has the minimum start time and the maximum end time of the two Intervals.
       * @param {Interval} other
       * @return {Interval}
       */
      union(other) {
        if (!this.isValid) return this;
        const s2 = this.s < other.s ? this.s : other.s, e = this.e > other.e ? this.e : other.e;
        return _Interval.fromDateTimes(s2, e);
      }
      /**
       * Merge an array of Intervals into an equivalent minimal set of Intervals.
       * Combines overlapping and adjacent Intervals.
       * The resulting array will contain the Intervals in ascending order, that is, starting with the earliest Interval
       * and ending with the latest.
       *
       * @param {Array} intervals
       * @return {Array}
       */
      static merge(intervals) {
        const [found, final] = intervals.sort((a, b) => a.s - b.s).reduce(([sofar, current], item) => {
          if (!current) {
            return [sofar, item];
          } else if (current.overlaps(item) || current.abutsStart(item)) {
            return [sofar, current.union(item)];
          } else {
            return [sofar.concat([current]), item];
          }
        }, [[], null]);
        if (final) {
          found.push(final);
        }
        return found;
      }
      /**
       * Return an array of Intervals representing the spans of time that only appear in one of the specified Intervals.
       * @param {Array} intervals
       * @return {Array}
       */
      static xor(intervals) {
        let start = null, currentCount = 0;
        const results = [], ends = intervals.map((i) => [{
          time: i.s,
          type: "s"
        }, {
          time: i.e,
          type: "e"
        }]), flattened = Array.prototype.concat(...ends), arr = flattened.sort((a, b) => a.time - b.time);
        for (const i of arr) {
          currentCount += i.type === "s" ? 1 : -1;
          if (currentCount === 1) {
            start = i.time;
          } else {
            if (start && +start !== +i.time) {
              results.push(_Interval.fromDateTimes(start, i.time));
            }
            start = null;
          }
        }
        return _Interval.merge(results);
      }
      /**
       * Return an Interval representing the span of time in this Interval that doesn't overlap with any of the specified Intervals.
       * @param {...Interval} intervals
       * @return {Array}
       */
      difference(...intervals) {
        return _Interval.xor([this].concat(intervals)).map((i) => this.intersection(i)).filter((i) => i && !i.isEmpty());
      }
      /**
       * Returns a string representation of this Interval appropriate for debugging.
       * @return {string}
       */
      toString() {
        if (!this.isValid) return INVALID$1;
        return `[${this.s.toISO()} \u2013 ${this.e.toISO()})`;
      }
      /**
       * Returns a string representation of this Interval appropriate for the REPL.
       * @return {string}
       */
      [/* @__PURE__ */ Symbol.for("nodejs.util.inspect.custom")]() {
        if (this.isValid) {
          return `Interval { start: ${this.s.toISO()}, end: ${this.e.toISO()} }`;
        } else {
          return `Interval { Invalid, reason: ${this.invalidReason} }`;
        }
      }
      /**
       * Returns a localized string representing this Interval. Accepts the same options as the
       * Intl.DateTimeFormat constructor and any presets defined by Luxon, such as
       * {@link DateTime.DATE_FULL} or {@link DateTime.TIME_SIMPLE}. The exact behavior of this method
       * is browser-specific, but in general it will return an appropriate representation of the
       * Interval in the assigned locale. Defaults to the system's locale if no locale has been
       * specified.
       * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/DateTimeFormat
       * @param {Object} [formatOpts=DateTime.DATE_SHORT] - Either a DateTime preset or
       * Intl.DateTimeFormat constructor options.
       * @param {Object} opts - Options to override the configuration of the start DateTime.
       * @example Interval.fromISO('2022-11-07T09:00Z/2022-11-08T09:00Z').toLocaleString(); //=> 11/7/2022 – 11/8/2022
       * @example Interval.fromISO('2022-11-07T09:00Z/2022-11-08T09:00Z').toLocaleString(DateTime.DATE_FULL); //=> November 7 – 8, 2022
       * @example Interval.fromISO('2022-11-07T09:00Z/2022-11-08T09:00Z').toLocaleString(DateTime.DATE_FULL, { locale: 'fr-FR' }); //=> 7–8 novembre 2022
       * @example Interval.fromISO('2022-11-07T17:00Z/2022-11-07T19:00Z').toLocaleString(DateTime.TIME_SIMPLE); //=> 6:00 – 8:00 PM
       * @example Interval.fromISO('2022-11-07T17:00Z/2022-11-07T19:00Z').toLocaleString({ weekday: 'short', month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit' }); //=> Mon, Nov 07, 6:00 – 8:00 p
       * @return {string}
       */
      toLocaleString(formatOpts = DATE_SHORT, opts = {}) {
        return this.isValid ? Formatter.create(this.s.loc.clone(opts), formatOpts).formatInterval(this) : INVALID$1;
      }
      /**
       * Returns an ISO 8601-compliant string representation of this Interval.
       * @see https://en.wikipedia.org/wiki/ISO_8601#Time_intervals
       * @param {Object} opts - The same options as {@link DateTime#toISO}
       * @return {string}
       */
      toISO(opts) {
        if (!this.isValid) return INVALID$1;
        return `${this.s.toISO(opts)}/${this.e.toISO(opts)}`;
      }
      /**
       * Returns an ISO 8601-compliant string representation of date of this Interval.
       * The time components are ignored.
       * @see https://en.wikipedia.org/wiki/ISO_8601#Time_intervals
       * @return {string}
       */
      toISODate() {
        if (!this.isValid) return INVALID$1;
        return `${this.s.toISODate()}/${this.e.toISODate()}`;
      }
      /**
       * Returns an ISO 8601-compliant string representation of time of this Interval.
       * The date components are ignored.
       * @see https://en.wikipedia.org/wiki/ISO_8601#Time_intervals
       * @param {Object} opts - The same options as {@link DateTime#toISO}
       * @return {string}
       */
      toISOTime(opts) {
        if (!this.isValid) return INVALID$1;
        return `${this.s.toISOTime(opts)}/${this.e.toISOTime(opts)}`;
      }
      /**
       * Returns a string representation of this Interval formatted according to the specified format
       * string. **You may not want this.** See {@link Interval#toLocaleString} for a more flexible
       * formatting tool.
       * @param {string} dateFormat - The format string. This string formats the start and end time.
       * See {@link DateTime#toFormat} for details.
       * @param {Object} opts - Options.
       * @param {string} [opts.separator =  ' – '] - A separator to place between the start and end
       * representations.
       * @return {string}
       */
      toFormat(dateFormat, {
        separator = " \u2013 "
      } = {}) {
        if (!this.isValid) return INVALID$1;
        return `${this.s.toFormat(dateFormat)}${separator}${this.e.toFormat(dateFormat)}`;
      }
      /**
       * Return a Duration representing the time spanned by this interval.
       * @param {string|string[]} [unit=['milliseconds']] - the unit or units (such as 'hours' or 'days') to include in the duration.
       * @param {Object} opts - options that affect the creation of the Duration
       * @param {string} [opts.conversionAccuracy='casual'] - the conversion system to use
       * @example Interval.fromDateTimes(dt1, dt2).toDuration().toObject() //=> { milliseconds: 88489257 }
       * @example Interval.fromDateTimes(dt1, dt2).toDuration('days').toObject() //=> { days: 1.0241812152777778 }
       * @example Interval.fromDateTimes(dt1, dt2).toDuration(['hours', 'minutes']).toObject() //=> { hours: 24, minutes: 34.82095 }
       * @example Interval.fromDateTimes(dt1, dt2).toDuration(['hours', 'minutes', 'seconds']).toObject() //=> { hours: 24, minutes: 34, seconds: 49.257 }
       * @example Interval.fromDateTimes(dt1, dt2).toDuration('seconds').toObject() //=> { seconds: 88489.257 }
       * @return {Duration}
       */
      toDuration(unit, opts) {
        if (!this.isValid) {
          return Duration.invalid(this.invalidReason);
        }
        return this.e.diff(this.s, unit, opts);
      }
      /**
       * Run mapFn on the interval start and end, returning a new Interval from the resulting DateTimes
       * @param {function} mapFn
       * @return {Interval}
       * @example Interval.fromDateTimes(dt1, dt2).mapEndpoints(endpoint => endpoint.toUTC())
       * @example Interval.fromDateTimes(dt1, dt2).mapEndpoints(endpoint => endpoint.plus({ hours: 2 }))
       */
      mapEndpoints(mapFn) {
        return _Interval.fromDateTimes(mapFn(this.s), mapFn(this.e));
      }
    };
    var Info = class {
      /**
       * Return whether the specified zone contains a DST.
       * @param {string|Zone} [zone='local'] - Zone to check. Defaults to the environment's local zone.
       * @return {boolean}
       */
      static hasDST(zone = Settings.defaultZone) {
        const proto = DateTime.now().setZone(zone).set({
          month: 12
        });
        return !zone.isUniversal && proto.offset !== proto.set({
          month: 6
        }).offset;
      }
      /**
       * Return whether the specified zone is a valid IANA specifier.
       * @param {string} zone - Zone to check
       * @return {boolean}
       */
      static isValidIANAZone(zone) {
        return IANAZone.isValidZone(zone);
      }
      /**
       * Converts the input into a {@link Zone} instance.
       *
       * * If `input` is already a Zone instance, it is returned unchanged.
       * * If `input` is a string containing a valid time zone name, a Zone instance
       *   with that name is returned.
       * * If `input` is a string that doesn't refer to a known time zone, a Zone
       *   instance with {@link Zone#isValid} == false is returned.
       * * If `input is a number, a Zone instance with the specified fixed offset
       *   in minutes is returned.
       * * If `input` is `null` or `undefined`, the default zone is returned.
       * @param {string|Zone|number} [input] - the value to be converted
       * @return {Zone}
       */
      static normalizeZone(input) {
        return normalizeZone(input, Settings.defaultZone);
      }
      /**
       * Get the weekday on which the week starts according to the given locale.
       * @param {Object} opts - options
       * @param {string} [opts.locale] - the locale code
       * @param {string} [opts.locObj=null] - an existing locale object to use
       * @returns {number} the start of the week, 1 for Monday through 7 for Sunday
       */
      static getStartOfWeek({
        locale = null,
        locObj = null
      } = {}) {
        return (locObj || Locale.create(locale)).getStartOfWeek();
      }
      /**
       * Get the minimum number of days necessary in a week before it is considered part of the next year according
       * to the given locale.
       * @param {Object} opts - options
       * @param {string} [opts.locale] - the locale code
       * @param {string} [opts.locObj=null] - an existing locale object to use
       * @returns {number}
       */
      static getMinimumDaysInFirstWeek({
        locale = null,
        locObj = null
      } = {}) {
        return (locObj || Locale.create(locale)).getMinDaysInFirstWeek();
      }
      /**
       * Get the weekdays, which are considered the weekend according to the given locale
       * @param {Object} opts - options
       * @param {string} [opts.locale] - the locale code
       * @param {string} [opts.locObj=null] - an existing locale object to use
       * @returns {number[]} an array of weekdays, 1 for Monday through 7 for Sunday
       */
      static getWeekendWeekdays({
        locale = null,
        locObj = null
      } = {}) {
        return (locObj || Locale.create(locale)).getWeekendDays().slice();
      }
      /**
       * Return an array of standalone month names.
       * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/DateTimeFormat
       * @param {string} [length='long'] - the length of the month representation, such as "numeric", "2-digit", "narrow", "short", "long"
       * @param {Object} opts - options
       * @param {string} [opts.locale] - the locale code
       * @param {string} [opts.numberingSystem=null] - the numbering system
       * @param {string} [opts.locObj=null] - an existing locale object to use
       * @param {string} [opts.outputCalendar='gregory'] - the calendar
       * @example Info.months()[0] //=> 'January'
       * @example Info.months('short')[0] //=> 'Jan'
       * @example Info.months('numeric')[0] //=> '1'
       * @example Info.months('short', { locale: 'fr-CA' } )[0] //=> 'janv.'
       * @example Info.months('numeric', { locale: 'ar' })[0] //=> '١'
       * @example Info.months('long', { outputCalendar: 'islamic' })[0] //=> 'Rabiʻ I'
       * @return {Array}
       */
      static months(length = "long", {
        locale = null,
        numberingSystem = null,
        locObj = null,
        outputCalendar = "gregory"
      } = {}) {
        return (locObj || Locale.create(locale, numberingSystem, outputCalendar)).months(length);
      }
      /**
       * Return an array of format month names.
       * Format months differ from standalone months in that they're meant to appear next to the day of the month. In some languages, that
       * changes the string.
       * See {@link Info#months}
       * @param {string} [length='long'] - the length of the month representation, such as "numeric", "2-digit", "narrow", "short", "long"
       * @param {Object} opts - options
       * @param {string} [opts.locale] - the locale code
       * @param {string} [opts.numberingSystem=null] - the numbering system
       * @param {string} [opts.locObj=null] - an existing locale object to use
       * @param {string} [opts.outputCalendar='gregory'] - the calendar
       * @return {Array}
       */
      static monthsFormat(length = "long", {
        locale = null,
        numberingSystem = null,
        locObj = null,
        outputCalendar = "gregory"
      } = {}) {
        return (locObj || Locale.create(locale, numberingSystem, outputCalendar)).months(length, true);
      }
      /**
       * Return an array of standalone week names.
       * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/DateTimeFormat
       * @param {string} [length='long'] - the length of the weekday representation, such as "narrow", "short", "long".
       * @param {Object} opts - options
       * @param {string} [opts.locale] - the locale code
       * @param {string} [opts.numberingSystem=null] - the numbering system
       * @param {string} [opts.locObj=null] - an existing locale object to use
       * @example Info.weekdays()[0] //=> 'Monday'
       * @example Info.weekdays('short')[0] //=> 'Mon'
       * @example Info.weekdays('short', { locale: 'fr-CA' })[0] //=> 'lun.'
       * @example Info.weekdays('short', { locale: 'ar' })[0] //=> 'الاثنين'
       * @return {Array}
       */
      static weekdays(length = "long", {
        locale = null,
        numberingSystem = null,
        locObj = null
      } = {}) {
        return (locObj || Locale.create(locale, numberingSystem, null)).weekdays(length);
      }
      /**
       * Return an array of format week names.
       * Format weekdays differ from standalone weekdays in that they're meant to appear next to more date information. In some languages, that
       * changes the string.
       * See {@link Info#weekdays}
       * @param {string} [length='long'] - the length of the month representation, such as "narrow", "short", "long".
       * @param {Object} opts - options
       * @param {string} [opts.locale=null] - the locale code
       * @param {string} [opts.numberingSystem=null] - the numbering system
       * @param {string} [opts.locObj=null] - an existing locale object to use
       * @return {Array}
       */
      static weekdaysFormat(length = "long", {
        locale = null,
        numberingSystem = null,
        locObj = null
      } = {}) {
        return (locObj || Locale.create(locale, numberingSystem, null)).weekdays(length, true);
      }
      /**
       * Return an array of meridiems.
       * @param {Object} opts - options
       * @param {string} [opts.locale] - the locale code
       * @example Info.meridiems() //=> [ 'AM', 'PM' ]
       * @example Info.meridiems({ locale: 'my' }) //=> [ 'နံနက်', 'ညနေ' ]
       * @return {Array}
       */
      static meridiems({
        locale = null
      } = {}) {
        return Locale.create(locale).meridiems();
      }
      /**
       * Return an array of eras, such as ['BC', 'AD']. The locale can be specified, but the calendar system is always Gregorian.
       * @param {string} [length='short'] - the length of the era representation, such as "short" or "long".
       * @param {Object} opts - options
       * @param {string} [opts.locale] - the locale code
       * @example Info.eras() //=> [ 'BC', 'AD' ]
       * @example Info.eras('long') //=> [ 'Before Christ', 'Anno Domini' ]
       * @example Info.eras('long', { locale: 'fr' }) //=> [ 'avant Jésus-Christ', 'après Jésus-Christ' ]
       * @return {Array}
       */
      static eras(length = "short", {
        locale = null
      } = {}) {
        return Locale.create(locale, null, "gregory").eras(length);
      }
      /**
       * Return the set of available features in this environment.
       * Some features of Luxon are not available in all environments. For example, on older browsers, relative time formatting support is not available. Use this function to figure out if that's the case.
       * Keys:
       * * `relative`: whether this environment supports relative time formatting
       * * `localeWeek`: whether this environment supports different weekdays for the start of the week based on the locale
       * @example Info.features() //=> { relative: false, localeWeek: true }
       * @return {Object}
       */
      static features() {
        return {
          relative: hasRelative(),
          localeWeek: hasLocaleWeekInfo()
        };
      }
    };
    function dayDiff(earlier, later) {
      const utcDayStart = (dt) => dt.toUTC(0, {
        keepLocalTime: true
      }).startOf("day").valueOf(), ms = utcDayStart(later) - utcDayStart(earlier);
      return Math.floor(Duration.fromMillis(ms).as("days"));
    }
    function highOrderDiffs(cursor, later, units) {
      const differs = [["years", (a, b) => b.year - a.year], ["quarters", (a, b) => b.quarter - a.quarter + (b.year - a.year) * 4], ["months", (a, b) => b.month - a.month + (b.year - a.year) * 12], ["weeks", (a, b) => {
        const days = dayDiff(a, b);
        return (days - days % 7) / 7;
      }], ["days", dayDiff]];
      const results = {};
      const earlier = cursor;
      let lowestOrder, highWater;
      for (const [unit, differ] of differs) {
        if (units.indexOf(unit) >= 0) {
          lowestOrder = unit;
          results[unit] = differ(cursor, later);
          highWater = earlier.plus(results);
          if (highWater > later) {
            results[unit]--;
            cursor = earlier.plus(results);
            if (cursor > later) {
              highWater = cursor;
              results[unit]--;
              cursor = earlier.plus(results);
            }
          } else {
            cursor = highWater;
          }
        }
      }
      return [cursor, results, highWater, lowestOrder];
    }
    function diff(earlier, later, units, opts) {
      let [cursor, results, highWater, lowestOrder] = highOrderDiffs(earlier, later, units);
      const remainingMillis = later - cursor;
      const lowerOrderUnits = units.filter((u) => ["hours", "minutes", "seconds", "milliseconds"].indexOf(u) >= 0);
      if (lowerOrderUnits.length === 0) {
        if (highWater < later) {
          highWater = cursor.plus({
            [lowestOrder]: 1
          });
        }
        if (highWater !== cursor) {
          results[lowestOrder] = (results[lowestOrder] || 0) + remainingMillis / (highWater - cursor);
        }
      }
      const duration = Duration.fromObject(results, opts);
      if (lowerOrderUnits.length > 0) {
        return Duration.fromMillis(remainingMillis, opts).shiftTo(...lowerOrderUnits).plus(duration);
      } else {
        return duration;
      }
    }
    var MISSING_FTP = "missing Intl.DateTimeFormat.formatToParts support";
    function intUnit(regex, post = (i) => i) {
      return {
        regex,
        deser: ([s2]) => post(parseDigits(s2))
      };
    }
    var NBSP = String.fromCharCode(160);
    var spaceOrNBSP = `[ ${NBSP}]`;
    var spaceOrNBSPRegExp = new RegExp(spaceOrNBSP, "g");
    function fixListRegex(s2) {
      return s2.replace(/\./g, "\\.?").replace(spaceOrNBSPRegExp, spaceOrNBSP);
    }
    function stripInsensitivities(s2) {
      return s2.replace(/\./g, "").replace(spaceOrNBSPRegExp, " ").toLowerCase();
    }
    function oneOf(strings, startIndex) {
      if (strings === null) {
        return null;
      } else {
        return {
          regex: RegExp(strings.map(fixListRegex).join("|")),
          deser: ([s2]) => strings.findIndex((i) => stripInsensitivities(s2) === stripInsensitivities(i)) + startIndex
        };
      }
    }
    function offset(regex, groups) {
      return {
        regex,
        deser: ([, h, m]) => signedOffset(h, m),
        groups
      };
    }
    function simple(regex) {
      return {
        regex,
        deser: ([s2]) => s2
      };
    }
    function escapeToken(value) {
      return value.replace(/[\-\[\]{}()*+?.,\\\^$|#\s]/g, "\\$&");
    }
    function unitForToken(token, loc) {
      const one = digitRegex(loc), two = digitRegex(loc, "{2}"), three = digitRegex(loc, "{3}"), four = digitRegex(loc, "{4}"), six = digitRegex(loc, "{6}"), oneOrTwo = digitRegex(loc, "{1,2}"), oneToThree = digitRegex(loc, "{1,3}"), oneToSix = digitRegex(loc, "{1,6}"), oneToNine = digitRegex(loc, "{1,9}"), twoToFour = digitRegex(loc, "{2,4}"), fourToSix = digitRegex(loc, "{4,6}"), literal = (t) => ({
        regex: RegExp(escapeToken(t.val)),
        deser: ([s2]) => s2,
        literal: true
      }), unitate = (t) => {
        if (token.literal) {
          return literal(t);
        }
        switch (t.val) {
          // era
          case "G":
            return oneOf(loc.eras("short"), 0);
          case "GG":
            return oneOf(loc.eras("long"), 0);
          // years
          case "y":
            return intUnit(oneToSix);
          case "yy":
            return intUnit(twoToFour, untruncateYear);
          case "yyyy":
            return intUnit(four);
          case "yyyyy":
            return intUnit(fourToSix);
          case "yyyyyy":
            return intUnit(six);
          // months
          case "M":
            return intUnit(oneOrTwo);
          case "MM":
            return intUnit(two);
          case "MMM":
            return oneOf(loc.months("short", true), 1);
          case "MMMM":
            return oneOf(loc.months("long", true), 1);
          case "L":
            return intUnit(oneOrTwo);
          case "LL":
            return intUnit(two);
          case "LLL":
            return oneOf(loc.months("short", false), 1);
          case "LLLL":
            return oneOf(loc.months("long", false), 1);
          // dates
          case "d":
            return intUnit(oneOrTwo);
          case "dd":
            return intUnit(two);
          // ordinals
          case "o":
            return intUnit(oneToThree);
          case "ooo":
            return intUnit(three);
          // time
          case "HH":
            return intUnit(two);
          case "H":
            return intUnit(oneOrTwo);
          case "hh":
            return intUnit(two);
          case "h":
            return intUnit(oneOrTwo);
          case "mm":
            return intUnit(two);
          case "m":
            return intUnit(oneOrTwo);
          case "q":
            return intUnit(oneOrTwo);
          case "qq":
            return intUnit(two);
          case "s":
            return intUnit(oneOrTwo);
          case "ss":
            return intUnit(two);
          case "S":
            return intUnit(oneToThree);
          case "SSS":
            return intUnit(three);
          case "u":
            return simple(oneToNine);
          case "uu":
            return simple(oneOrTwo);
          case "uuu":
            return intUnit(one);
          // meridiem
          case "a":
            return oneOf(loc.meridiems(), 0);
          // weekYear (k)
          case "kkkk":
            return intUnit(four);
          case "kk":
            return intUnit(twoToFour, untruncateYear);
          // weekNumber (W)
          case "W":
            return intUnit(oneOrTwo);
          case "WW":
            return intUnit(two);
          // weekdays
          case "E":
          case "c":
            return intUnit(one);
          case "EEE":
            return oneOf(loc.weekdays("short", false), 1);
          case "EEEE":
            return oneOf(loc.weekdays("long", false), 1);
          case "ccc":
            return oneOf(loc.weekdays("short", true), 1);
          case "cccc":
            return oneOf(loc.weekdays("long", true), 1);
          // offset/zone
          case "Z":
          case "ZZ":
            return offset(new RegExp(`([+-]${oneOrTwo.source})(?::(${two.source}))?`), 2);
          case "ZZZ":
            return offset(new RegExp(`([+-]${oneOrTwo.source})(${two.source})?`), 2);
          // we don't support ZZZZ (PST) or ZZZZZ (Pacific Standard Time) in parsing
          // because we don't have any way to figure out what they are
          case "z":
            return simple(/[a-z_+-/]{1,256}?/i);
          // this special-case "token" represents a place where a macro-token expanded into a white-space literal
          // in this case we accept any non-newline white-space
          case " ":
            return simple(/[^\S\n\r]/);
          default:
            return literal(t);
        }
      };
      const unit = unitate(token) || {
        invalidReason: MISSING_FTP
      };
      unit.token = token;
      return unit;
    }
    var partTypeStyleToTokenVal = {
      year: {
        "2-digit": "yy",
        numeric: "yyyyy"
      },
      month: {
        numeric: "M",
        "2-digit": "MM",
        short: "MMM",
        long: "MMMM"
      },
      day: {
        numeric: "d",
        "2-digit": "dd"
      },
      weekday: {
        short: "EEE",
        long: "EEEE"
      },
      dayperiod: "a",
      dayPeriod: "a",
      hour12: {
        numeric: "h",
        "2-digit": "hh"
      },
      hour24: {
        numeric: "H",
        "2-digit": "HH"
      },
      minute: {
        numeric: "m",
        "2-digit": "mm"
      },
      second: {
        numeric: "s",
        "2-digit": "ss"
      },
      timeZoneName: {
        long: "ZZZZZ",
        short: "ZZZ"
      }
    };
    function tokenForPart(part, formatOpts, resolvedOpts) {
      const {
        type,
        value
      } = part;
      if (type === "literal") {
        const isSpace = /^\s+$/.test(value);
        return {
          literal: !isSpace,
          val: isSpace ? " " : value
        };
      }
      const style = formatOpts[type];
      let actualType = type;
      if (type === "hour") {
        if (formatOpts.hour12 != null) {
          actualType = formatOpts.hour12 ? "hour12" : "hour24";
        } else if (formatOpts.hourCycle != null) {
          if (formatOpts.hourCycle === "h11" || formatOpts.hourCycle === "h12") {
            actualType = "hour12";
          } else {
            actualType = "hour24";
          }
        } else {
          actualType = resolvedOpts.hour12 ? "hour12" : "hour24";
        }
      }
      let val = partTypeStyleToTokenVal[actualType];
      if (typeof val === "object") {
        val = val[style];
      }
      if (val) {
        return {
          literal: false,
          val
        };
      }
      return void 0;
    }
    function buildRegex(units) {
      const re = units.map((u) => u.regex).reduce((f, r) => `${f}(${r.source})`, "");
      return [`^${re}$`, units];
    }
    function match(input, regex, handlers) {
      const matches = input.match(regex);
      if (matches) {
        const all = {};
        let matchIndex = 1;
        for (const i in handlers) {
          if (hasOwnProperty(handlers, i)) {
            const h = handlers[i], groups = h.groups ? h.groups + 1 : 1;
            if (!h.literal && h.token) {
              all[h.token.val[0]] = h.deser(matches.slice(matchIndex, matchIndex + groups));
            }
            matchIndex += groups;
          }
        }
        return [matches, all];
      } else {
        return [matches, {}];
      }
    }
    function dateTimeFromMatches(matches) {
      const toField = (token) => {
        switch (token) {
          case "S":
            return "millisecond";
          case "s":
            return "second";
          case "m":
            return "minute";
          case "h":
          case "H":
            return "hour";
          case "d":
            return "day";
          case "o":
            return "ordinal";
          case "L":
          case "M":
            return "month";
          case "y":
            return "year";
          case "E":
          case "c":
            return "weekday";
          case "W":
            return "weekNumber";
          case "k":
            return "weekYear";
          case "q":
            return "quarter";
          default:
            return null;
        }
      };
      let zone = null;
      let specificOffset;
      if (!isUndefined(matches.z)) {
        zone = IANAZone.create(matches.z);
      }
      if (!isUndefined(matches.Z)) {
        if (!zone) {
          zone = new FixedOffsetZone(matches.Z);
        }
        specificOffset = matches.Z;
      }
      if (!isUndefined(matches.q)) {
        matches.M = (matches.q - 1) * 3 + 1;
      }
      if (!isUndefined(matches.h)) {
        if (matches.h < 12 && matches.a === 1) {
          matches.h += 12;
        } else if (matches.h === 12 && matches.a === 0) {
          matches.h = 0;
        }
      }
      if (matches.G === 0 && matches.y) {
        matches.y = -matches.y;
      }
      if (!isUndefined(matches.u)) {
        matches.S = parseMillis(matches.u);
      }
      const vals = Object.keys(matches).reduce((r, k) => {
        const f = toField(k);
        if (f) {
          r[f] = matches[k];
        }
        return r;
      }, {});
      return [vals, zone, specificOffset];
    }
    var dummyDateTimeCache = null;
    function getDummyDateTime() {
      if (!dummyDateTimeCache) {
        dummyDateTimeCache = DateTime.fromMillis(1555555555555);
      }
      return dummyDateTimeCache;
    }
    function maybeExpandMacroToken(token, locale) {
      if (token.literal) {
        return token;
      }
      const formatOpts = Formatter.macroTokenToFormatOpts(token.val);
      const tokens = formatOptsToTokens(formatOpts, locale);
      if (tokens == null || tokens.includes(void 0)) {
        return token;
      }
      return tokens;
    }
    function expandMacroTokens(tokens, locale) {
      return Array.prototype.concat(...tokens.map((t) => maybeExpandMacroToken(t, locale)));
    }
    var TokenParser = class {
      constructor(locale, format2) {
        this.locale = locale;
        this.format = format2;
        this.tokens = expandMacroTokens(Formatter.parseFormat(format2), locale);
        this.units = this.tokens.map((t) => unitForToken(t, locale));
        this.disqualifyingUnit = this.units.find((t) => t.invalidReason);
        if (!this.disqualifyingUnit) {
          const [regexString, handlers] = buildRegex(this.units);
          this.regex = RegExp(regexString, "i");
          this.handlers = handlers;
        }
      }
      explainFromTokens(input) {
        if (!this.isValid) {
          return {
            input,
            tokens: this.tokens,
            invalidReason: this.invalidReason
          };
        } else {
          const [rawMatches, matches] = match(input, this.regex, this.handlers), [result, zone, specificOffset] = matches ? dateTimeFromMatches(matches) : [null, null, void 0];
          if (hasOwnProperty(matches, "a") && hasOwnProperty(matches, "H")) {
            throw new ConflictingSpecificationError("Can't include meridiem when specifying 24-hour format");
          }
          return {
            input,
            tokens: this.tokens,
            regex: this.regex,
            rawMatches,
            matches,
            result,
            zone,
            specificOffset
          };
        }
      }
      get isValid() {
        return !this.disqualifyingUnit;
      }
      get invalidReason() {
        return this.disqualifyingUnit ? this.disqualifyingUnit.invalidReason : null;
      }
    };
    function explainFromTokens(locale, input, format2) {
      const parser = new TokenParser(locale, format2);
      return parser.explainFromTokens(input);
    }
    function parseFromTokens(locale, input, format2) {
      const {
        result,
        zone,
        specificOffset,
        invalidReason
      } = explainFromTokens(locale, input, format2);
      return [result, zone, specificOffset, invalidReason];
    }
    function formatOptsToTokens(formatOpts, locale) {
      if (!formatOpts) {
        return null;
      }
      const formatter = Formatter.create(locale, formatOpts);
      const df = formatter.dtFormatter(getDummyDateTime());
      const parts = df.formatToParts();
      const resolvedOpts = df.resolvedOptions();
      return parts.map((p) => tokenForPart(p, formatOpts, resolvedOpts));
    }
    var INVALID = "Invalid DateTime";
    var MAX_DATE = 864e13;
    function unsupportedZone(zone) {
      return new Invalid("unsupported zone", `the zone "${zone.name}" is not supported`);
    }
    function possiblyCachedWeekData(dt) {
      if (dt.weekData === null) {
        dt.weekData = gregorianToWeek(dt.c);
      }
      return dt.weekData;
    }
    function possiblyCachedLocalWeekData(dt) {
      if (dt.localWeekData === null) {
        dt.localWeekData = gregorianToWeek(dt.c, dt.loc.getMinDaysInFirstWeek(), dt.loc.getStartOfWeek());
      }
      return dt.localWeekData;
    }
    function clone(inst, alts) {
      const current = {
        ts: inst.ts,
        zone: inst.zone,
        c: inst.c,
        o: inst.o,
        loc: inst.loc,
        invalid: inst.invalid
      };
      return new DateTime({
        ...current,
        ...alts,
        old: current
      });
    }
    function fixOffset(localTS, o, tz) {
      let utcGuess = localTS - o * 60 * 1e3;
      const o2 = tz.offset(utcGuess);
      if (o === o2) {
        return [utcGuess, o];
      }
      utcGuess -= (o2 - o) * 60 * 1e3;
      const o3 = tz.offset(utcGuess);
      if (o2 === o3) {
        return [utcGuess, o2];
      }
      return [localTS - Math.min(o2, o3) * 60 * 1e3, Math.max(o2, o3)];
    }
    function tsToObj(ts, offset2) {
      ts += offset2 * 60 * 1e3;
      const d = new Date(ts);
      return {
        year: d.getUTCFullYear(),
        month: d.getUTCMonth() + 1,
        day: d.getUTCDate(),
        hour: d.getUTCHours(),
        minute: d.getUTCMinutes(),
        second: d.getUTCSeconds(),
        millisecond: d.getUTCMilliseconds()
      };
    }
    function objToTS(obj, offset2, zone) {
      return fixOffset(objToLocalTS(obj), offset2, zone);
    }
    function adjustTime(inst, dur) {
      const oPre = inst.o, year = inst.c.year + Math.trunc(dur.years), month = inst.c.month + Math.trunc(dur.months) + Math.trunc(dur.quarters) * 3, c = {
        ...inst.c,
        year,
        month,
        day: Math.min(inst.c.day, daysInMonth(year, month)) + Math.trunc(dur.days) + Math.trunc(dur.weeks) * 7
      }, millisToAdd = Duration.fromObject({
        years: dur.years - Math.trunc(dur.years),
        quarters: dur.quarters - Math.trunc(dur.quarters),
        months: dur.months - Math.trunc(dur.months),
        weeks: dur.weeks - Math.trunc(dur.weeks),
        days: dur.days - Math.trunc(dur.days),
        hours: dur.hours,
        minutes: dur.minutes,
        seconds: dur.seconds,
        milliseconds: dur.milliseconds
      }).as("milliseconds"), localTS = objToLocalTS(c);
      let [ts, o] = fixOffset(localTS, oPre, inst.zone);
      if (millisToAdd !== 0) {
        ts += millisToAdd;
        o = inst.zone.offset(ts);
      }
      return {
        ts,
        o
      };
    }
    function parseDataToDateTime(parsed, parsedZone, opts, format2, text, specificOffset) {
      const {
        setZone,
        zone
      } = opts;
      if (parsed && Object.keys(parsed).length !== 0 || parsedZone) {
        const interpretationZone = parsedZone || zone, inst = DateTime.fromObject(parsed, {
          ...opts,
          zone: interpretationZone,
          specificOffset
        });
        return setZone ? inst : inst.setZone(zone);
      } else {
        return DateTime.invalid(new Invalid("unparsable", `the input "${text}" can't be parsed as ${format2}`));
      }
    }
    function toTechFormat(dt, format2, allowZ = true) {
      return dt.isValid ? Formatter.create(Locale.create("en-US"), {
        allowZ,
        forceSimple: true
      }).formatDateTimeFromString(dt, format2) : null;
    }
    function toISODate(o, extended, precision) {
      const longFormat = o.c.year > 9999 || o.c.year < 0;
      let c = "";
      if (longFormat && o.c.year >= 0) c += "+";
      c += padStart(o.c.year, longFormat ? 6 : 4);
      if (precision === "year") return c;
      if (extended) {
        c += "-";
        c += padStart(o.c.month);
        if (precision === "month") return c;
        c += "-";
      } else {
        c += padStart(o.c.month);
        if (precision === "month") return c;
      }
      c += padStart(o.c.day);
      return c;
    }
    function toISOTime(o, extended, suppressSeconds, suppressMilliseconds, includeOffset, extendedZone, precision) {
      let showSeconds = !suppressSeconds || o.c.millisecond !== 0 || o.c.second !== 0, c = "";
      switch (precision) {
        case "day":
        case "month":
        case "year":
          break;
        default:
          c += padStart(o.c.hour);
          if (precision === "hour") break;
          if (extended) {
            c += ":";
            c += padStart(o.c.minute);
            if (precision === "minute") break;
            if (showSeconds) {
              c += ":";
              c += padStart(o.c.second);
            }
          } else {
            c += padStart(o.c.minute);
            if (precision === "minute") break;
            if (showSeconds) {
              c += padStart(o.c.second);
            }
          }
          if (precision === "second") break;
          if (showSeconds && (!suppressMilliseconds || o.c.millisecond !== 0)) {
            c += ".";
            c += padStart(o.c.millisecond, 3);
          }
      }
      if (includeOffset) {
        if (o.isOffsetFixed && o.offset === 0 && !extendedZone) {
          c += "Z";
        } else if (o.o < 0) {
          c += "-";
          c += padStart(Math.trunc(-o.o / 60));
          c += ":";
          c += padStart(Math.trunc(-o.o % 60));
        } else {
          c += "+";
          c += padStart(Math.trunc(o.o / 60));
          c += ":";
          c += padStart(Math.trunc(o.o % 60));
        }
      }
      if (extendedZone) {
        c += "[" + o.zone.ianaName + "]";
      }
      return c;
    }
    var defaultUnitValues = {
      month: 1,
      day: 1,
      hour: 0,
      minute: 0,
      second: 0,
      millisecond: 0
    };
    var defaultWeekUnitValues = {
      weekNumber: 1,
      weekday: 1,
      hour: 0,
      minute: 0,
      second: 0,
      millisecond: 0
    };
    var defaultOrdinalUnitValues = {
      ordinal: 1,
      hour: 0,
      minute: 0,
      second: 0,
      millisecond: 0
    };
    var orderedUnits = ["year", "month", "day", "hour", "minute", "second", "millisecond"];
    var orderedWeekUnits = ["weekYear", "weekNumber", "weekday", "hour", "minute", "second", "millisecond"];
    var orderedOrdinalUnits = ["year", "ordinal", "hour", "minute", "second", "millisecond"];
    function normalizeUnit(unit) {
      const normalized = {
        year: "year",
        years: "year",
        month: "month",
        months: "month",
        day: "day",
        days: "day",
        hour: "hour",
        hours: "hour",
        minute: "minute",
        minutes: "minute",
        quarter: "quarter",
        quarters: "quarter",
        second: "second",
        seconds: "second",
        millisecond: "millisecond",
        milliseconds: "millisecond",
        weekday: "weekday",
        weekdays: "weekday",
        weeknumber: "weekNumber",
        weeksnumber: "weekNumber",
        weeknumbers: "weekNumber",
        weekyear: "weekYear",
        weekyears: "weekYear",
        ordinal: "ordinal"
      }[unit.toLowerCase()];
      if (!normalized) throw new InvalidUnitError(unit);
      return normalized;
    }
    function normalizeUnitWithLocalWeeks(unit) {
      switch (unit.toLowerCase()) {
        case "localweekday":
        case "localweekdays":
          return "localWeekday";
        case "localweeknumber":
        case "localweeknumbers":
          return "localWeekNumber";
        case "localweekyear":
        case "localweekyears":
          return "localWeekYear";
        default:
          return normalizeUnit(unit);
      }
    }
    function guessOffsetForZone(zone) {
      if (zoneOffsetTs === void 0) {
        zoneOffsetTs = Settings.now();
      }
      if (zone.type !== "iana") {
        return zone.offset(zoneOffsetTs);
      }
      const zoneName = zone.name;
      let offsetGuess = zoneOffsetGuessCache.get(zoneName);
      if (offsetGuess === void 0) {
        offsetGuess = zone.offset(zoneOffsetTs);
        zoneOffsetGuessCache.set(zoneName, offsetGuess);
      }
      return offsetGuess;
    }
    function quickDT(obj, opts) {
      const zone = normalizeZone(opts.zone, Settings.defaultZone);
      if (!zone.isValid) {
        return DateTime.invalid(unsupportedZone(zone));
      }
      const loc = Locale.fromObject(opts);
      let ts, o;
      if (!isUndefined(obj.year)) {
        for (const u of orderedUnits) {
          if (isUndefined(obj[u])) {
            obj[u] = defaultUnitValues[u];
          }
        }
        const invalid2 = hasInvalidGregorianData(obj) || hasInvalidTimeData(obj);
        if (invalid2) {
          return DateTime.invalid(invalid2);
        }
        const offsetProvis = guessOffsetForZone(zone);
        [ts, o] = objToTS(obj, offsetProvis, zone);
      } else {
        ts = Settings.now();
      }
      return new DateTime({
        ts,
        zone,
        loc,
        o
      });
    }
    function diffRelative(start, end, opts) {
      const round = isUndefined(opts.round) ? true : opts.round, rounding = isUndefined(opts.rounding) ? "trunc" : opts.rounding, format2 = (c, unit) => {
        c = roundTo(c, round || opts.calendary ? 0 : 2, opts.calendary ? "round" : rounding);
        const formatter = end.loc.clone(opts).relFormatter(opts);
        return formatter.format(c, unit);
      }, differ = (unit) => {
        if (opts.calendary) {
          if (!end.hasSame(start, unit)) {
            return end.startOf(unit).diff(start.startOf(unit), unit).get(unit);
          } else return 0;
        } else {
          return end.diff(start, unit).get(unit);
        }
      };
      if (opts.unit) {
        return format2(differ(opts.unit), opts.unit);
      }
      for (const unit of opts.units) {
        const count = differ(unit);
        if (Math.abs(count) >= 1) {
          return format2(count, unit);
        }
      }
      return format2(start > end ? -0 : 0, opts.units[opts.units.length - 1]);
    }
    function lastOpts(argList) {
      let opts = {}, args;
      if (argList.length > 0 && typeof argList[argList.length - 1] === "object") {
        opts = argList[argList.length - 1];
        args = Array.from(argList).slice(0, argList.length - 1);
      } else {
        args = Array.from(argList);
      }
      return [opts, args];
    }
    var zoneOffsetTs;
    var zoneOffsetGuessCache = /* @__PURE__ */ new Map();
    var DateTime = class _DateTime {
      /**
       * @access private
       */
      constructor(config) {
        const zone = config.zone || Settings.defaultZone;
        let invalid2 = config.invalid || (Number.isNaN(config.ts) ? new Invalid("invalid input") : null) || (!zone.isValid ? unsupportedZone(zone) : null);
        this.ts = isUndefined(config.ts) ? Settings.now() : config.ts;
        let c = null, o = null;
        if (!invalid2) {
          const unchanged = config.old && config.old.ts === this.ts && config.old.zone.equals(zone);
          if (unchanged) {
            [c, o] = [config.old.c, config.old.o];
          } else {
            const ot = isNumber(config.o) && !config.old ? config.o : zone.offset(this.ts);
            c = tsToObj(this.ts, ot);
            invalid2 = Number.isNaN(c.year) ? new Invalid("invalid input") : null;
            c = invalid2 ? null : c;
            o = invalid2 ? null : ot;
          }
        }
        this._zone = zone;
        this.loc = config.loc || Locale.create();
        this.invalid = invalid2;
        this.weekData = null;
        this.localWeekData = null;
        this.c = c;
        this.o = o;
        this.isLuxonDateTime = true;
      }
      // CONSTRUCT
      /**
       * Create a DateTime for the current instant, in the system's time zone.
       *
       * Use Settings to override these default values if needed.
       * @example DateTime.now().toISO() //~> now in the ISO format
       * @return {DateTime}
       */
      static now() {
        return new _DateTime({});
      }
      /**
       * Create a local DateTime
       * @param {number} [year] - The calendar year. If omitted (as in, call `local()` with no arguments), the current time will be used
       * @param {number} [month=1] - The month, 1-indexed
       * @param {number} [day=1] - The day of the month, 1-indexed
       * @param {number} [hour=0] - The hour of the day, in 24-hour time
       * @param {number} [minute=0] - The minute of the hour, meaning a number between 0 and 59
       * @param {number} [second=0] - The second of the minute, meaning a number between 0 and 59
       * @param {number} [millisecond=0] - The millisecond of the second, meaning a number between 0 and 999
       * @example DateTime.local()                                  //~> now
       * @example DateTime.local({ zone: "America/New_York" })      //~> now, in US east coast time
       * @example DateTime.local(2017)                              //~> 2017-01-01T00:00:00
       * @example DateTime.local(2017, 3)                           //~> 2017-03-01T00:00:00
       * @example DateTime.local(2017, 3, 12, { locale: "fr" })     //~> 2017-03-12T00:00:00, with a French locale
       * @example DateTime.local(2017, 3, 12, 5)                    //~> 2017-03-12T05:00:00
       * @example DateTime.local(2017, 3, 12, 5, { zone: "utc" })   //~> 2017-03-12T05:00:00, in UTC
       * @example DateTime.local(2017, 3, 12, 5, 45)                //~> 2017-03-12T05:45:00
       * @example DateTime.local(2017, 3, 12, 5, 45, 10)            //~> 2017-03-12T05:45:10
       * @example DateTime.local(2017, 3, 12, 5, 45, 10, 765)       //~> 2017-03-12T05:45:10.765
       * @return {DateTime}
       */
      static local() {
        const [opts, args] = lastOpts(arguments), [year, month, day, hour, minute, second, millisecond] = args;
        return quickDT({
          year,
          month,
          day,
          hour,
          minute,
          second,
          millisecond
        }, opts);
      }
      /**
       * Create a DateTime in UTC
       * @param {number} [year] - The calendar year. If omitted (as in, call `utc()` with no arguments), the current time will be used
       * @param {number} [month=1] - The month, 1-indexed
       * @param {number} [day=1] - The day of the month
       * @param {number} [hour=0] - The hour of the day, in 24-hour time
       * @param {number} [minute=0] - The minute of the hour, meaning a number between 0 and 59
       * @param {number} [second=0] - The second of the minute, meaning a number between 0 and 59
       * @param {number} [millisecond=0] - The millisecond of the second, meaning a number between 0 and 999
       * @param {Object} options - configuration options for the DateTime
       * @param {string} [options.locale] - a locale to set on the resulting DateTime instance
       * @param {string} [options.outputCalendar] - the output calendar to set on the resulting DateTime instance
       * @param {string} [options.numberingSystem] - the numbering system to set on the resulting DateTime instance
       * @param {string} [options.weekSettings] - the week settings to set on the resulting DateTime instance
       * @example DateTime.utc()                                              //~> now
       * @example DateTime.utc(2017)                                          //~> 2017-01-01T00:00:00Z
       * @example DateTime.utc(2017, 3)                                       //~> 2017-03-01T00:00:00Z
       * @example DateTime.utc(2017, 3, 12)                                   //~> 2017-03-12T00:00:00Z
       * @example DateTime.utc(2017, 3, 12, 5)                                //~> 2017-03-12T05:00:00Z
       * @example DateTime.utc(2017, 3, 12, 5, 45)                            //~> 2017-03-12T05:45:00Z
       * @example DateTime.utc(2017, 3, 12, 5, 45, { locale: "fr" })          //~> 2017-03-12T05:45:00Z with a French locale
       * @example DateTime.utc(2017, 3, 12, 5, 45, 10)                        //~> 2017-03-12T05:45:10Z
       * @example DateTime.utc(2017, 3, 12, 5, 45, 10, 765, { locale: "fr" }) //~> 2017-03-12T05:45:10.765Z with a French locale
       * @return {DateTime}
       */
      static utc() {
        const [opts, args] = lastOpts(arguments), [year, month, day, hour, minute, second, millisecond] = args;
        opts.zone = FixedOffsetZone.utcInstance;
        return quickDT({
          year,
          month,
          day,
          hour,
          minute,
          second,
          millisecond
        }, opts);
      }
      /**
       * Create a DateTime from a JavaScript Date object. Uses the default zone.
       * @param {Date} date - a JavaScript Date object
       * @param {Object} options - configuration options for the DateTime
       * @param {string|Zone} [options.zone='local'] - the zone to place the DateTime into
       * @return {DateTime}
       */
      static fromJSDate(date, options = {}) {
        const ts = isDate(date) ? date.valueOf() : NaN;
        if (Number.isNaN(ts)) {
          return _DateTime.invalid("invalid input");
        }
        const zoneToUse = normalizeZone(options.zone, Settings.defaultZone);
        if (!zoneToUse.isValid) {
          return _DateTime.invalid(unsupportedZone(zoneToUse));
        }
        return new _DateTime({
          ts,
          zone: zoneToUse,
          loc: Locale.fromObject(options)
        });
      }
      /**
       * Create a DateTime from a number of milliseconds since the epoch (meaning since 1 January 1970 00:00:00 UTC). Uses the default zone.
       * @param {number} milliseconds - a number of milliseconds since 1970 UTC
       * @param {Object} options - configuration options for the DateTime
       * @param {string|Zone} [options.zone='local'] - the zone to place the DateTime into
       * @param {string} [options.locale] - a locale to set on the resulting DateTime instance
       * @param {string} options.outputCalendar - the output calendar to set on the resulting DateTime instance
       * @param {string} options.numberingSystem - the numbering system to set on the resulting DateTime instance
       * @param {string} options.weekSettings - the week settings to set on the resulting DateTime instance
       * @return {DateTime}
       */
      static fromMillis(milliseconds, options = {}) {
        if (!isNumber(milliseconds)) {
          throw new InvalidArgumentError(`fromMillis requires a numerical input, but received a ${typeof milliseconds} with value ${milliseconds}`);
        } else if (milliseconds < -MAX_DATE || milliseconds > MAX_DATE) {
          return _DateTime.invalid("Timestamp out of range");
        } else {
          return new _DateTime({
            ts: milliseconds,
            zone: normalizeZone(options.zone, Settings.defaultZone),
            loc: Locale.fromObject(options)
          });
        }
      }
      /**
       * Create a DateTime from a number of seconds since the epoch (meaning since 1 January 1970 00:00:00 UTC). Uses the default zone.
       * @param {number} seconds - a number of seconds since 1970 UTC
       * @param {Object} options - configuration options for the DateTime
       * @param {string|Zone} [options.zone='local'] - the zone to place the DateTime into
       * @param {string} [options.locale] - a locale to set on the resulting DateTime instance
       * @param {string} options.outputCalendar - the output calendar to set on the resulting DateTime instance
       * @param {string} options.numberingSystem - the numbering system to set on the resulting DateTime instance
       * @param {string} options.weekSettings - the week settings to set on the resulting DateTime instance
       * @return {DateTime}
       */
      static fromSeconds(seconds, options = {}) {
        if (!isNumber(seconds)) {
          throw new InvalidArgumentError("fromSeconds requires a numerical input");
        } else {
          return new _DateTime({
            ts: seconds * 1e3,
            zone: normalizeZone(options.zone, Settings.defaultZone),
            loc: Locale.fromObject(options)
          });
        }
      }
      /**
       * Create a DateTime from a JavaScript object with keys like 'year' and 'hour' with reasonable defaults.
       * @param {Object} obj - the object to create the DateTime from
       * @param {number} obj.year - a year, such as 1987
       * @param {number} obj.month - a month, 1-12
       * @param {number} obj.day - a day of the month, 1-31, depending on the month
       * @param {number} obj.ordinal - day of the year, 1-365 or 366
       * @param {number} obj.weekYear - an ISO week year
       * @param {number} obj.weekNumber - an ISO week number, between 1 and 52 or 53, depending on the year
       * @param {number} obj.weekday - an ISO weekday, 1-7, where 1 is Monday and 7 is Sunday
       * @param {number} obj.localWeekYear - a week year, according to the locale
       * @param {number} obj.localWeekNumber - a week number, between 1 and 52 or 53, depending on the year, according to the locale
       * @param {number} obj.localWeekday - a weekday, 1-7, where 1 is the first and 7 is the last day of the week, according to the locale
       * @param {number} obj.hour - hour of the day, 0-23
       * @param {number} obj.minute - minute of the hour, 0-59
       * @param {number} obj.second - second of the minute, 0-59
       * @param {number} obj.millisecond - millisecond of the second, 0-999
       * @param {Object} opts - options for creating this DateTime
       * @param {string|Zone} [opts.zone='local'] - interpret the numbers in the context of a particular zone. Can take any value taken as the first argument to setZone()
       * @param {string} [opts.locale='system\'s locale'] - a locale to set on the resulting DateTime instance
       * @param {string} opts.outputCalendar - the output calendar to set on the resulting DateTime instance
       * @param {string} opts.numberingSystem - the numbering system to set on the resulting DateTime instance
       * @param {string} opts.weekSettings - the week settings to set on the resulting DateTime instance
       * @example DateTime.fromObject({ year: 1982, month: 5, day: 25}).toISODate() //=> '1982-05-25'
       * @example DateTime.fromObject({ year: 1982 }).toISODate() //=> '1982-01-01'
       * @example DateTime.fromObject({ hour: 10, minute: 26, second: 6 }) //~> today at 10:26:06
       * @example DateTime.fromObject({ hour: 10, minute: 26, second: 6 }, { zone: 'utc' }),
       * @example DateTime.fromObject({ hour: 10, minute: 26, second: 6 }, { zone: 'local' })
       * @example DateTime.fromObject({ hour: 10, minute: 26, second: 6 }, { zone: 'America/New_York' })
       * @example DateTime.fromObject({ weekYear: 2016, weekNumber: 2, weekday: 3 }).toISODate() //=> '2016-01-13'
       * @example DateTime.fromObject({ localWeekYear: 2022, localWeekNumber: 1, localWeekday: 1 }, { locale: "en-US" }).toISODate() //=> '2021-12-26'
       * @return {DateTime}
       */
      static fromObject(obj, opts = {}) {
        obj = obj || {};
        const zoneToUse = normalizeZone(opts.zone, Settings.defaultZone);
        if (!zoneToUse.isValid) {
          return _DateTime.invalid(unsupportedZone(zoneToUse));
        }
        const loc = Locale.fromObject(opts);
        const normalized = normalizeObject(obj, normalizeUnitWithLocalWeeks);
        const {
          minDaysInFirstWeek,
          startOfWeek
        } = usesLocalWeekValues(normalized, loc);
        const tsNow = Settings.now(), offsetProvis = !isUndefined(opts.specificOffset) ? opts.specificOffset : zoneToUse.offset(tsNow), containsOrdinal = !isUndefined(normalized.ordinal), containsGregorYear = !isUndefined(normalized.year), containsGregorMD = !isUndefined(normalized.month) || !isUndefined(normalized.day), containsGregor = containsGregorYear || containsGregorMD, definiteWeekDef = normalized.weekYear || normalized.weekNumber;
        if ((containsGregor || containsOrdinal) && definiteWeekDef) {
          throw new ConflictingSpecificationError("Can't mix weekYear/weekNumber units with year/month/day or ordinals");
        }
        if (containsGregorMD && containsOrdinal) {
          throw new ConflictingSpecificationError("Can't mix ordinal dates with month/day");
        }
        const useWeekData = definiteWeekDef || normalized.weekday && !containsGregor;
        let units, defaultValues, objNow = tsToObj(tsNow, offsetProvis);
        if (useWeekData) {
          units = orderedWeekUnits;
          defaultValues = defaultWeekUnitValues;
          objNow = gregorianToWeek(objNow, minDaysInFirstWeek, startOfWeek);
        } else if (containsOrdinal) {
          units = orderedOrdinalUnits;
          defaultValues = defaultOrdinalUnitValues;
          objNow = gregorianToOrdinal(objNow);
        } else {
          units = orderedUnits;
          defaultValues = defaultUnitValues;
        }
        let foundFirst = false;
        for (const u of units) {
          const v = normalized[u];
          if (!isUndefined(v)) {
            foundFirst = true;
          } else if (foundFirst) {
            normalized[u] = defaultValues[u];
          } else {
            normalized[u] = objNow[u];
          }
        }
        const higherOrderInvalid = useWeekData ? hasInvalidWeekData(normalized, minDaysInFirstWeek, startOfWeek) : containsOrdinal ? hasInvalidOrdinalData(normalized) : hasInvalidGregorianData(normalized), invalid2 = higherOrderInvalid || hasInvalidTimeData(normalized);
        if (invalid2) {
          return _DateTime.invalid(invalid2);
        }
        const gregorian = useWeekData ? weekToGregorian(normalized, minDaysInFirstWeek, startOfWeek) : containsOrdinal ? ordinalToGregorian(normalized) : normalized, [tsFinal, offsetFinal] = objToTS(gregorian, offsetProvis, zoneToUse), inst = new _DateTime({
          ts: tsFinal,
          zone: zoneToUse,
          o: offsetFinal,
          loc
        });
        if (normalized.weekday && containsGregor && obj.weekday !== inst.weekday) {
          return _DateTime.invalid("mismatched weekday", `you can't specify both a weekday of ${normalized.weekday} and a date of ${inst.toISO()}`);
        }
        if (!inst.isValid) {
          return _DateTime.invalid(inst.invalid);
        }
        return inst;
      }
      /**
       * Create a DateTime from an ISO 8601 string
       * @param {string} text - the ISO string
       * @param {Object} opts - options to affect the creation
       * @param {string|Zone} [opts.zone='local'] - use this zone if no offset is specified in the input string itself. Will also convert the time to this zone
       * @param {boolean} [opts.setZone=false] - override the zone with a fixed-offset zone specified in the string itself, if it specifies one
       * @param {string} [opts.locale='system's locale'] - a locale to set on the resulting DateTime instance
       * @param {string} [opts.outputCalendar] - the output calendar to set on the resulting DateTime instance
       * @param {string} [opts.numberingSystem] - the numbering system to set on the resulting DateTime instance
       * @param {string} [opts.weekSettings] - the week settings to set on the resulting DateTime instance
       * @example DateTime.fromISO('2016-05-25T09:08:34.123')
       * @example DateTime.fromISO('2016-05-25T09:08:34.123+06:00')
       * @example DateTime.fromISO('2016-05-25T09:08:34.123+06:00', {setZone: true})
       * @example DateTime.fromISO('2016-05-25T09:08:34.123', {zone: 'utc'})
       * @example DateTime.fromISO('2016-W05-4')
       * @return {DateTime}
       */
      static fromISO(text, opts = {}) {
        const [vals, parsedZone] = parseISODate(text);
        return parseDataToDateTime(vals, parsedZone, opts, "ISO 8601", text);
      }
      /**
       * Create a DateTime from an RFC 2822 string
       * @param {string} text - the RFC 2822 string
       * @param {Object} opts - options to affect the creation
       * @param {string|Zone} [opts.zone='local'] - convert the time to this zone. Since the offset is always specified in the string itself, this has no effect on the interpretation of string, merely the zone the resulting DateTime is expressed in.
       * @param {boolean} [opts.setZone=false] - override the zone with a fixed-offset zone specified in the string itself, if it specifies one
       * @param {string} [opts.locale='system's locale'] - a locale to set on the resulting DateTime instance
       * @param {string} opts.outputCalendar - the output calendar to set on the resulting DateTime instance
       * @param {string} opts.numberingSystem - the numbering system to set on the resulting DateTime instance
       * @param {string} opts.weekSettings - the week settings to set on the resulting DateTime instance
       * @example DateTime.fromRFC2822('25 Nov 2016 13:23:12 GMT')
       * @example DateTime.fromRFC2822('Fri, 25 Nov 2016 13:23:12 +0600')
       * @example DateTime.fromRFC2822('25 Nov 2016 13:23 Z')
       * @return {DateTime}
       */
      static fromRFC2822(text, opts = {}) {
        const [vals, parsedZone] = parseRFC2822Date(text);
        return parseDataToDateTime(vals, parsedZone, opts, "RFC 2822", text);
      }
      /**
       * Create a DateTime from an HTTP header date
       * @see https://www.w3.org/Protocols/rfc2616/rfc2616-sec3.html#sec3.3.1
       * @param {string} text - the HTTP header date
       * @param {Object} opts - options to affect the creation
       * @param {string|Zone} [opts.zone='local'] - convert the time to this zone. Since HTTP dates are always in UTC, this has no effect on the interpretation of string, merely the zone the resulting DateTime is expressed in.
       * @param {boolean} [opts.setZone=false] - override the zone with the fixed-offset zone specified in the string. For HTTP dates, this is always UTC, so this option is equivalent to setting the `zone` option to 'utc', but this option is included for consistency with similar methods.
       * @param {string} [opts.locale='system's locale'] - a locale to set on the resulting DateTime instance
       * @param {string} opts.outputCalendar - the output calendar to set on the resulting DateTime instance
       * @param {string} opts.numberingSystem - the numbering system to set on the resulting DateTime instance
       * @param {string} opts.weekSettings - the week settings to set on the resulting DateTime instance
       * @example DateTime.fromHTTP('Sun, 06 Nov 1994 08:49:37 GMT')
       * @example DateTime.fromHTTP('Sunday, 06-Nov-94 08:49:37 GMT')
       * @example DateTime.fromHTTP('Sun Nov  6 08:49:37 1994')
       * @return {DateTime}
       */
      static fromHTTP(text, opts = {}) {
        const [vals, parsedZone] = parseHTTPDate(text);
        return parseDataToDateTime(vals, parsedZone, opts, "HTTP", opts);
      }
      /**
       * Create a DateTime from an input string and format string.
       * Defaults to en-US if no locale has been specified, regardless of the system's locale. For a table of tokens and their interpretations, see [here](https://moment.github.io/luxon/#/parsing?id=table-of-tokens).
       * @param {string} text - the string to parse
       * @param {string} fmt - the format the string is expected to be in (see the link below for the formats)
       * @param {Object} opts - options to affect the creation
       * @param {string|Zone} [opts.zone='local'] - use this zone if no offset is specified in the input string itself. Will also convert the DateTime to this zone
       * @param {boolean} [opts.setZone=false] - override the zone with a zone specified in the string itself, if it specifies one
       * @param {string} [opts.locale='en-US'] - a locale string to use when parsing. Will also set the DateTime to this locale
       * @param {string} opts.numberingSystem - the numbering system to use when parsing. Will also set the resulting DateTime to this numbering system
       * @param {string} opts.weekSettings - the week settings to set on the resulting DateTime instance
       * @param {string} opts.outputCalendar - the output calendar to set on the resulting DateTime instance
       * @return {DateTime}
       */
      static fromFormat(text, fmt, opts = {}) {
        if (isUndefined(text) || isUndefined(fmt)) {
          throw new InvalidArgumentError("fromFormat requires an input string and a format");
        }
        const {
          locale = null,
          numberingSystem = null
        } = opts, localeToUse = Locale.fromOpts({
          locale,
          numberingSystem,
          defaultToEN: true
        }), [vals, parsedZone, specificOffset, invalid2] = parseFromTokens(localeToUse, text, fmt);
        if (invalid2) {
          return _DateTime.invalid(invalid2);
        } else {
          return parseDataToDateTime(vals, parsedZone, opts, `format ${fmt}`, text, specificOffset);
        }
      }
      /**
       * @deprecated use fromFormat instead
       */
      static fromString(text, fmt, opts = {}) {
        return _DateTime.fromFormat(text, fmt, opts);
      }
      /**
       * Create a DateTime from a SQL date, time, or datetime
       * Defaults to en-US if no locale has been specified, regardless of the system's locale
       * @param {string} text - the string to parse
       * @param {Object} opts - options to affect the creation
       * @param {string|Zone} [opts.zone='local'] - use this zone if no offset is specified in the input string itself. Will also convert the DateTime to this zone
       * @param {boolean} [opts.setZone=false] - override the zone with a zone specified in the string itself, if it specifies one
       * @param {string} [opts.locale='en-US'] - a locale string to use when parsing. Will also set the DateTime to this locale
       * @param {string} opts.numberingSystem - the numbering system to use when parsing. Will also set the resulting DateTime to this numbering system
       * @param {string} opts.weekSettings - the week settings to set on the resulting DateTime instance
       * @param {string} opts.outputCalendar - the output calendar to set on the resulting DateTime instance
       * @example DateTime.fromSQL('2017-05-15')
       * @example DateTime.fromSQL('2017-05-15 09:12:34')
       * @example DateTime.fromSQL('2017-05-15 09:12:34.342')
       * @example DateTime.fromSQL('2017-05-15 09:12:34.342+06:00')
       * @example DateTime.fromSQL('2017-05-15 09:12:34.342 America/Los_Angeles')
       * @example DateTime.fromSQL('2017-05-15 09:12:34.342 America/Los_Angeles', { setZone: true })
       * @example DateTime.fromSQL('2017-05-15 09:12:34.342', { zone: 'America/Los_Angeles' })
       * @example DateTime.fromSQL('09:12:34.342')
       * @return {DateTime}
       */
      static fromSQL(text, opts = {}) {
        const [vals, parsedZone] = parseSQL(text);
        return parseDataToDateTime(vals, parsedZone, opts, "SQL", text);
      }
      /**
       * Create an invalid DateTime.
       * @param {string} reason - simple string of why this DateTime is invalid. Should not contain parameters or anything else data-dependent.
       * @param {string} [explanation=null] - longer explanation, may include parameters and other useful debugging information
       * @return {DateTime}
       */
      static invalid(reason, explanation = null) {
        if (!reason) {
          throw new InvalidArgumentError("need to specify a reason the DateTime is invalid");
        }
        const invalid2 = reason instanceof Invalid ? reason : new Invalid(reason, explanation);
        if (Settings.throwOnInvalid) {
          throw new InvalidDateTimeError(invalid2);
        } else {
          return new _DateTime({
            invalid: invalid2
          });
        }
      }
      /**
       * Check if an object is an instance of DateTime. Works across context boundaries
       * @param {object} o
       * @return {boolean}
       */
      static isDateTime(o) {
        return o && o.isLuxonDateTime || false;
      }
      /**
       * Produce the format string for a set of options
       * @param formatOpts
       * @param localeOpts
       * @returns {string}
       */
      static parseFormatForOpts(formatOpts, localeOpts = {}) {
        const tokenList = formatOptsToTokens(formatOpts, Locale.fromObject(localeOpts));
        return !tokenList ? null : tokenList.map((t) => t ? t.val : null).join("");
      }
      /**
       * Produce the the fully expanded format token for the locale
       * Does NOT quote characters, so quoted tokens will not round trip correctly
       * @param fmt
       * @param localeOpts
       * @returns {string}
       */
      static expandFormat(fmt, localeOpts = {}) {
        const expanded = expandMacroTokens(Formatter.parseFormat(fmt), Locale.fromObject(localeOpts));
        return expanded.map((t) => t.val).join("");
      }
      static resetCache() {
        zoneOffsetTs = void 0;
        zoneOffsetGuessCache.clear();
      }
      // INFO
      /**
       * Get the value of unit.
       * @param {string} unit - a unit such as 'minute' or 'day'
       * @example DateTime.local(2017, 7, 4).get('month'); //=> 7
       * @example DateTime.local(2017, 7, 4).get('day'); //=> 4
       * @return {number}
       */
      get(unit) {
        return this[unit];
      }
      /**
       * Returns whether the DateTime is valid. Invalid DateTimes occur when:
       * * The DateTime was created from invalid calendar information, such as the 13th month or February 30
       * * The DateTime was created by an operation on another invalid date
       * @type {boolean}
       */
      get isValid() {
        return this.invalid === null;
      }
      /**
       * Returns an error code if this DateTime is invalid, or null if the DateTime is valid
       * @type {string}
       */
      get invalidReason() {
        return this.invalid ? this.invalid.reason : null;
      }
      /**
       * Returns an explanation of why this DateTime became invalid, or null if the DateTime is valid
       * @type {string}
       */
      get invalidExplanation() {
        return this.invalid ? this.invalid.explanation : null;
      }
      /**
       * Get the locale of a DateTime, such 'en-GB'. The locale is used when formatting the DateTime
       *
       * @type {string}
       */
      get locale() {
        return this.isValid ? this.loc.locale : null;
      }
      /**
       * Get the numbering system of a DateTime, such 'beng'. The numbering system is used when formatting the DateTime
       *
       * @type {string}
       */
      get numberingSystem() {
        return this.isValid ? this.loc.numberingSystem : null;
      }
      /**
       * Get the output calendar of a DateTime, such 'islamic'. The output calendar is used when formatting the DateTime
       *
       * @type {string}
       */
      get outputCalendar() {
        return this.isValid ? this.loc.outputCalendar : null;
      }
      /**
       * Get the time zone associated with this DateTime.
       * @type {Zone}
       */
      get zone() {
        return this._zone;
      }
      /**
       * Get the name of the time zone.
       * @type {string}
       */
      get zoneName() {
        return this.isValid ? this.zone.name : null;
      }
      /**
       * Get the year
       * @example DateTime.local(2017, 5, 25).year //=> 2017
       * @type {number}
       */
      get year() {
        return this.isValid ? this.c.year : NaN;
      }
      /**
       * Get the quarter
       * @example DateTime.local(2017, 5, 25).quarter //=> 2
       * @type {number}
       */
      get quarter() {
        return this.isValid ? Math.ceil(this.c.month / 3) : NaN;
      }
      /**
       * Get the month (1-12).
       * @example DateTime.local(2017, 5, 25).month //=> 5
       * @type {number}
       */
      get month() {
        return this.isValid ? this.c.month : NaN;
      }
      /**
       * Get the day of the month (1-30ish).
       * @example DateTime.local(2017, 5, 25).day //=> 25
       * @type {number}
       */
      get day() {
        return this.isValid ? this.c.day : NaN;
      }
      /**
       * Get the hour of the day (0-23).
       * @example DateTime.local(2017, 5, 25, 9).hour //=> 9
       * @type {number}
       */
      get hour() {
        return this.isValid ? this.c.hour : NaN;
      }
      /**
       * Get the minute of the hour (0-59).
       * @example DateTime.local(2017, 5, 25, 9, 30).minute //=> 30
       * @type {number}
       */
      get minute() {
        return this.isValid ? this.c.minute : NaN;
      }
      /**
       * Get the second of the minute (0-59).
       * @example DateTime.local(2017, 5, 25, 9, 30, 52).second //=> 52
       * @type {number}
       */
      get second() {
        return this.isValid ? this.c.second : NaN;
      }
      /**
       * Get the millisecond of the second (0-999).
       * @example DateTime.local(2017, 5, 25, 9, 30, 52, 654).millisecond //=> 654
       * @type {number}
       */
      get millisecond() {
        return this.isValid ? this.c.millisecond : NaN;
      }
      /**
       * Get the week year
       * @see https://en.wikipedia.org/wiki/ISO_week_date
       * @example DateTime.local(2014, 12, 31).weekYear //=> 2015
       * @type {number}
       */
      get weekYear() {
        return this.isValid ? possiblyCachedWeekData(this).weekYear : NaN;
      }
      /**
       * Get the week number of the week year (1-52ish).
       * @see https://en.wikipedia.org/wiki/ISO_week_date
       * @example DateTime.local(2017, 5, 25).weekNumber //=> 21
       * @type {number}
       */
      get weekNumber() {
        return this.isValid ? possiblyCachedWeekData(this).weekNumber : NaN;
      }
      /**
       * Get the day of the week.
       * 1 is Monday and 7 is Sunday
       * @see https://en.wikipedia.org/wiki/ISO_week_date
       * @example DateTime.local(2014, 11, 31).weekday //=> 4
       * @type {number}
       */
      get weekday() {
        return this.isValid ? possiblyCachedWeekData(this).weekday : NaN;
      }
      /**
       * Returns true if this date is on a weekend according to the locale, false otherwise
       * @returns {boolean}
       */
      get isWeekend() {
        return this.isValid && this.loc.getWeekendDays().includes(this.weekday);
      }
      /**
       * Get the day of the week according to the locale.
       * 1 is the first day of the week and 7 is the last day of the week.
       * If the locale assigns Sunday as the first day of the week, then a date which is a Sunday will return 1,
       * @returns {number}
       */
      get localWeekday() {
        return this.isValid ? possiblyCachedLocalWeekData(this).weekday : NaN;
      }
      /**
       * Get the week number of the week year according to the locale. Different locales assign week numbers differently,
       * because the week can start on different days of the week (see localWeekday) and because a different number of days
       * is required for a week to count as the first week of a year.
       * @returns {number}
       */
      get localWeekNumber() {
        return this.isValid ? possiblyCachedLocalWeekData(this).weekNumber : NaN;
      }
      /**
       * Get the week year according to the locale. Different locales assign week numbers (and therefor week years)
       * differently, see localWeekNumber.
       * @returns {number}
       */
      get localWeekYear() {
        return this.isValid ? possiblyCachedLocalWeekData(this).weekYear : NaN;
      }
      /**
       * Get the ordinal (meaning the day of the year)
       * @example DateTime.local(2017, 5, 25).ordinal //=> 145
       * @type {number|DateTime}
       */
      get ordinal() {
        return this.isValid ? gregorianToOrdinal(this.c).ordinal : NaN;
      }
      /**
       * Get the human readable short month name, such as 'Oct'.
       * Defaults to the system's locale if no locale has been specified
       * @example DateTime.local(2017, 10, 30).monthShort //=> Oct
       * @type {string}
       */
      get monthShort() {
        return this.isValid ? Info.months("short", {
          locObj: this.loc
        })[this.month - 1] : null;
      }
      /**
       * Get the human readable long month name, such as 'October'.
       * Defaults to the system's locale if no locale has been specified
       * @example DateTime.local(2017, 10, 30).monthLong //=> October
       * @type {string}
       */
      get monthLong() {
        return this.isValid ? Info.months("long", {
          locObj: this.loc
        })[this.month - 1] : null;
      }
      /**
       * Get the human readable short weekday, such as 'Mon'.
       * Defaults to the system's locale if no locale has been specified
       * @example DateTime.local(2017, 10, 30).weekdayShort //=> Mon
       * @type {string}
       */
      get weekdayShort() {
        return this.isValid ? Info.weekdays("short", {
          locObj: this.loc
        })[this.weekday - 1] : null;
      }
      /**
       * Get the human readable long weekday, such as 'Monday'.
       * Defaults to the system's locale if no locale has been specified
       * @example DateTime.local(2017, 10, 30).weekdayLong //=> Monday
       * @type {string}
       */
      get weekdayLong() {
        return this.isValid ? Info.weekdays("long", {
          locObj: this.loc
        })[this.weekday - 1] : null;
      }
      /**
       * Get the UTC offset of this DateTime in minutes
       * @example DateTime.now().offset //=> -240
       * @example DateTime.utc().offset //=> 0
       * @type {number}
       */
      get offset() {
        return this.isValid ? +this.o : NaN;
      }
      /**
       * Get the short human name for the zone's current offset, for example "EST" or "EDT".
       * Defaults to the system's locale if no locale has been specified
       * @type {string}
       */
      get offsetNameShort() {
        if (this.isValid) {
          return this.zone.offsetName(this.ts, {
            format: "short",
            locale: this.locale
          });
        } else {
          return null;
        }
      }
      /**
       * Get the long human name for the zone's current offset, for example "Eastern Standard Time" or "Eastern Daylight Time".
       * Defaults to the system's locale if no locale has been specified
       * @type {string}
       */
      get offsetNameLong() {
        if (this.isValid) {
          return this.zone.offsetName(this.ts, {
            format: "long",
            locale: this.locale
          });
        } else {
          return null;
        }
      }
      /**
       * Get whether this zone's offset ever changes, as in a DST.
       * @type {boolean}
       */
      get isOffsetFixed() {
        return this.isValid ? this.zone.isUniversal : null;
      }
      /**
       * Get whether the DateTime is in a DST.
       * @type {boolean}
       */
      get isInDST() {
        if (this.isOffsetFixed) {
          return false;
        } else {
          return this.offset > this.set({
            month: 1,
            day: 1
          }).offset || this.offset > this.set({
            month: 5
          }).offset;
        }
      }
      /**
       * Get those DateTimes which have the same local time as this DateTime, but a different offset from UTC
       * in this DateTime's zone. During DST changes local time can be ambiguous, for example
       * `2023-10-29T02:30:00` in `Europe/Berlin` can have offset `+01:00` or `+02:00`.
       * This method will return both possible DateTimes if this DateTime's local time is ambiguous.
       * @returns {DateTime[]}
       */
      getPossibleOffsets() {
        if (!this.isValid || this.isOffsetFixed) {
          return [this];
        }
        const dayMs = 864e5;
        const minuteMs = 6e4;
        const localTS = objToLocalTS(this.c);
        const oEarlier = this.zone.offset(localTS - dayMs);
        const oLater = this.zone.offset(localTS + dayMs);
        const o1 = this.zone.offset(localTS - oEarlier * minuteMs);
        const o2 = this.zone.offset(localTS - oLater * minuteMs);
        if (o1 === o2) {
          return [this];
        }
        const ts1 = localTS - o1 * minuteMs;
        const ts2 = localTS - o2 * minuteMs;
        const c1 = tsToObj(ts1, o1);
        const c2 = tsToObj(ts2, o2);
        if (c1.hour === c2.hour && c1.minute === c2.minute && c1.second === c2.second && c1.millisecond === c2.millisecond) {
          return [clone(this, {
            ts: ts1
          }), clone(this, {
            ts: ts2
          })];
        }
        return [this];
      }
      /**
       * Returns true if this DateTime is in a leap year, false otherwise
       * @example DateTime.local(2016).isInLeapYear //=> true
       * @example DateTime.local(2013).isInLeapYear //=> false
       * @type {boolean}
       */
      get isInLeapYear() {
        return isLeapYear3(this.year);
      }
      /**
       * Returns the number of days in this DateTime's month
       * @example DateTime.local(2016, 2).daysInMonth //=> 29
       * @example DateTime.local(2016, 3).daysInMonth //=> 31
       * @type {number}
       */
      get daysInMonth() {
        return daysInMonth(this.year, this.month);
      }
      /**
       * Returns the number of days in this DateTime's year
       * @example DateTime.local(2016).daysInYear //=> 366
       * @example DateTime.local(2013).daysInYear //=> 365
       * @type {number}
       */
      get daysInYear() {
        return this.isValid ? daysInYear(this.year) : NaN;
      }
      /**
       * Returns the number of weeks in this DateTime's year
       * @see https://en.wikipedia.org/wiki/ISO_week_date
       * @example DateTime.local(2004).weeksInWeekYear //=> 53
       * @example DateTime.local(2013).weeksInWeekYear //=> 52
       * @type {number}
       */
      get weeksInWeekYear() {
        return this.isValid ? weeksInWeekYear(this.weekYear) : NaN;
      }
      /**
       * Returns the number of weeks in this DateTime's local week year
       * @example DateTime.local(2020, 6, {locale: 'en-US'}).weeksInLocalWeekYear //=> 52
       * @example DateTime.local(2020, 6, {locale: 'de-DE'}).weeksInLocalWeekYear //=> 53
       * @type {number}
       */
      get weeksInLocalWeekYear() {
        return this.isValid ? weeksInWeekYear(this.localWeekYear, this.loc.getMinDaysInFirstWeek(), this.loc.getStartOfWeek()) : NaN;
      }
      /**
       * Returns the resolved Intl options for this DateTime.
       * This is useful in understanding the behavior of formatting methods
       * @param {Object} opts - the same options as toLocaleString
       * @return {Object}
       */
      resolvedLocaleOptions(opts = {}) {
        const {
          locale,
          numberingSystem,
          calendar
        } = Formatter.create(this.loc.clone(opts), opts).resolvedOptions(this);
        return {
          locale,
          numberingSystem,
          outputCalendar: calendar
        };
      }
      // TRANSFORM
      /**
       * "Set" the DateTime's zone to UTC. Returns a newly-constructed DateTime.
       *
       * Equivalent to {@link DateTime#setZone}('utc')
       * @param {number} [offset=0] - optionally, an offset from UTC in minutes
       * @param {Object} [opts={}] - options to pass to `setZone()`
       * @return {DateTime}
       */
      toUTC(offset2 = 0, opts = {}) {
        return this.setZone(FixedOffsetZone.instance(offset2), opts);
      }
      /**
       * "Set" the DateTime's zone to the host's local zone. Returns a newly-constructed DateTime.
       *
       * Equivalent to `setZone('local')`
       * @return {DateTime}
       */
      toLocal() {
        return this.setZone(Settings.defaultZone);
      }
      /**
       * "Set" the DateTime's zone to specified zone. Returns a newly-constructed DateTime.
       *
       * By default, the setter keeps the underlying time the same (as in, the same timestamp), but the new instance will report different local times and consider DSTs when making computations, as with {@link DateTime#plus}. You may wish to use {@link DateTime#toLocal} and {@link DateTime#toUTC} which provide simple convenience wrappers for commonly used zones.
       * @param {string|Zone} [zone='local'] - a zone identifier. As a string, that can be any IANA zone supported by the host environment, or a fixed-offset name of the form 'UTC+3', or the strings 'local' or 'utc'. You may also supply an instance of a {@link DateTime#Zone} class.
       * @param {Object} opts - options
       * @param {boolean} [opts.keepLocalTime=false] - If true, adjust the underlying time so that the local time stays the same, but in the target zone. You should rarely need this.
       * @return {DateTime}
       */
      setZone(zone, {
        keepLocalTime = false,
        keepCalendarTime = false
      } = {}) {
        zone = normalizeZone(zone, Settings.defaultZone);
        if (zone.equals(this.zone)) {
          return this;
        } else if (!zone.isValid) {
          return _DateTime.invalid(unsupportedZone(zone));
        } else {
          let newTS = this.ts;
          if (keepLocalTime || keepCalendarTime) {
            const offsetGuess = zone.offset(this.ts);
            const asObj = this.toObject();
            [newTS] = objToTS(asObj, offsetGuess, zone);
          }
          return clone(this, {
            ts: newTS,
            zone
          });
        }
      }
      /**
       * "Set" the locale, numberingSystem, or outputCalendar. Returns a newly-constructed DateTime.
       * @param {Object} properties - the properties to set
       * @example DateTime.local(2017, 5, 25).reconfigure({ locale: 'en-GB' })
       * @return {DateTime}
       */
      reconfigure({
        locale,
        numberingSystem,
        outputCalendar
      } = {}) {
        const loc = this.loc.clone({
          locale,
          numberingSystem,
          outputCalendar
        });
        return clone(this, {
          loc
        });
      }
      /**
       * "Set" the locale. Returns a newly-constructed DateTime.
       * Just a convenient alias for reconfigure({ locale })
       * @example DateTime.local(2017, 5, 25).setLocale('en-GB')
       * @return {DateTime}
       */
      setLocale(locale) {
        return this.reconfigure({
          locale
        });
      }
      /**
       * "Set" the values of specified units. Returns a newly-constructed DateTime.
       * You can only set units with this method; for "setting" metadata, see {@link DateTime#reconfigure} and {@link DateTime#setZone}.
       *
       * This method also supports setting locale-based week units, i.e. `localWeekday`, `localWeekNumber` and `localWeekYear`.
       * They cannot be mixed with ISO-week units like `weekday`.
       * @param {Object} values - a mapping of units to numbers
       * @example dt.set({ year: 2017 })
       * @example dt.set({ hour: 8, minute: 30 })
       * @example dt.set({ weekday: 5 })
       * @example dt.set({ year: 2005, ordinal: 234 })
       * @return {DateTime}
       */
      set(values) {
        if (!this.isValid) return this;
        const normalized = normalizeObject(values, normalizeUnitWithLocalWeeks);
        const {
          minDaysInFirstWeek,
          startOfWeek
        } = usesLocalWeekValues(normalized, this.loc);
        const settingWeekStuff = !isUndefined(normalized.weekYear) || !isUndefined(normalized.weekNumber) || !isUndefined(normalized.weekday), containsOrdinal = !isUndefined(normalized.ordinal), containsGregorYear = !isUndefined(normalized.year), containsGregorMD = !isUndefined(normalized.month) || !isUndefined(normalized.day), containsGregor = containsGregorYear || containsGregorMD, definiteWeekDef = normalized.weekYear || normalized.weekNumber;
        if ((containsGregor || containsOrdinal) && definiteWeekDef) {
          throw new ConflictingSpecificationError("Can't mix weekYear/weekNumber units with year/month/day or ordinals");
        }
        if (containsGregorMD && containsOrdinal) {
          throw new ConflictingSpecificationError("Can't mix ordinal dates with month/day");
        }
        let mixed;
        if (settingWeekStuff) {
          mixed = weekToGregorian({
            ...gregorianToWeek(this.c, minDaysInFirstWeek, startOfWeek),
            ...normalized
          }, minDaysInFirstWeek, startOfWeek);
        } else if (!isUndefined(normalized.ordinal)) {
          mixed = ordinalToGregorian({
            ...gregorianToOrdinal(this.c),
            ...normalized
          });
        } else {
          mixed = {
            ...this.toObject(),
            ...normalized
          };
          if (isUndefined(normalized.day)) {
            mixed.day = Math.min(daysInMonth(mixed.year, mixed.month), mixed.day);
          }
        }
        const [ts, o] = objToTS(mixed, this.o, this.zone);
        return clone(this, {
          ts,
          o
        });
      }
      /**
       * Add a period of time to this DateTime and return the resulting DateTime
       *
       * Adding hours, minutes, seconds, or milliseconds increases the timestamp by the right number of milliseconds. Adding days, months, or years shifts the calendar, accounting for DSTs and leap years along the way. Thus, `dt.plus({ hours: 24 })` may result in a different time than `dt.plus({ days: 1 })` if there's a DST shift in between.
       * @param {Duration|Object|number} duration - The amount to add. Either a Luxon Duration, a number of milliseconds, the object argument to Duration.fromObject()
       * @example DateTime.now().plus(123) //~> in 123 milliseconds
       * @example DateTime.now().plus({ minutes: 15 }) //~> in 15 minutes
       * @example DateTime.now().plus({ days: 1 }) //~> this time tomorrow
       * @example DateTime.now().plus({ days: -1 }) //~> this time yesterday
       * @example DateTime.now().plus({ hours: 3, minutes: 13 }) //~> in 3 hr, 13 min
       * @example DateTime.now().plus(Duration.fromObject({ hours: 3, minutes: 13 })) //~> in 3 hr, 13 min
       * @return {DateTime}
       */
      plus(duration) {
        if (!this.isValid) return this;
        const dur = Duration.fromDurationLike(duration);
        return clone(this, adjustTime(this, dur));
      }
      /**
       * Subtract a period of time to this DateTime and return the resulting DateTime
       * See {@link DateTime#plus}
       * @param {Duration|Object|number} duration - The amount to subtract. Either a Luxon Duration, a number of milliseconds, the object argument to Duration.fromObject()
       @return {DateTime}
       */
      minus(duration) {
        if (!this.isValid) return this;
        const dur = Duration.fromDurationLike(duration).negate();
        return clone(this, adjustTime(this, dur));
      }
      /**
       * "Set" this DateTime to the beginning of a unit of time.
       * @param {string} unit - The unit to go to the beginning of. Can be 'year', 'quarter', 'month', 'week', 'day', 'hour', 'minute', 'second', or 'millisecond'.
       * @param {Object} opts - options
       * @param {boolean} [opts.useLocaleWeeks=false] - If true, use weeks based on the locale, i.e. use the locale-dependent start of the week
       * @example DateTime.local(2014, 3, 3).startOf('month').toISODate(); //=> '2014-03-01'
       * @example DateTime.local(2014, 3, 3).startOf('year').toISODate(); //=> '2014-01-01'
       * @example DateTime.local(2014, 3, 3).startOf('week').toISODate(); //=> '2014-03-03', weeks always start on Mondays
       * @example DateTime.local(2014, 3, 3, 5, 30).startOf('day').toISOTime(); //=> '00:00.000-05:00'
       * @example DateTime.local(2014, 3, 3, 5, 30).startOf('hour').toISOTime(); //=> '05:00:00.000-05:00'
       * @return {DateTime}
       */
      startOf(unit, {
        useLocaleWeeks = false
      } = {}) {
        if (!this.isValid) return this;
        const o = {}, normalizedUnit = Duration.normalizeUnit(unit);
        switch (normalizedUnit) {
          case "years":
            o.month = 1;
          // falls through
          case "quarters":
          case "months":
            o.day = 1;
          // falls through
          case "weeks":
          case "days":
            o.hour = 0;
          // falls through
          case "hours":
            o.minute = 0;
          // falls through
          case "minutes":
            o.second = 0;
          // falls through
          case "seconds":
            o.millisecond = 0;
            break;
        }
        if (normalizedUnit === "weeks") {
          if (useLocaleWeeks) {
            const startOfWeek = this.loc.getStartOfWeek();
            const {
              weekday
            } = this;
            if (weekday < startOfWeek) {
              o.weekNumber = this.weekNumber - 1;
            }
            o.weekday = startOfWeek;
          } else {
            o.weekday = 1;
          }
        }
        if (normalizedUnit === "quarters") {
          const q = Math.ceil(this.month / 3);
          o.month = (q - 1) * 3 + 1;
        }
        return this.set(o);
      }
      /**
       * "Set" this DateTime to the end (meaning the last millisecond) of a unit of time
       * @param {string} unit - The unit to go to the end of. Can be 'year', 'quarter', 'month', 'week', 'day', 'hour', 'minute', 'second', or 'millisecond'.
       * @param {Object} opts - options
       * @param {boolean} [opts.useLocaleWeeks=false] - If true, use weeks based on the locale, i.e. use the locale-dependent start of the week
       * @example DateTime.local(2014, 3, 3).endOf('month').toISO(); //=> '2014-03-31T23:59:59.999-05:00'
       * @example DateTime.local(2014, 3, 3).endOf('year').toISO(); //=> '2014-12-31T23:59:59.999-05:00'
       * @example DateTime.local(2014, 3, 3).endOf('week').toISO(); // => '2014-03-09T23:59:59.999-05:00', weeks start on Mondays
       * @example DateTime.local(2014, 3, 3, 5, 30).endOf('day').toISO(); //=> '2014-03-03T23:59:59.999-05:00'
       * @example DateTime.local(2014, 3, 3, 5, 30).endOf('hour').toISO(); //=> '2014-03-03T05:59:59.999-05:00'
       * @return {DateTime}
       */
      endOf(unit, opts) {
        return this.isValid ? this.plus({
          [unit]: 1
        }).startOf(unit, opts).minus(1) : this;
      }
      // OUTPUT
      /**
       * Returns a string representation of this DateTime formatted according to the specified format string.
       * **You may not want this.** See {@link DateTime#toLocaleString} for a more flexible formatting tool. For a table of tokens and their interpretations, see [here](https://moment.github.io/luxon/#/formatting?id=table-of-tokens).
       * Defaults to en-US if no locale has been specified, regardless of the system's locale.
       * @param {string} fmt - the format string
       * @param {Object} opts - opts to override the configuration options on this DateTime
       * @example DateTime.now().toFormat('yyyy LLL dd') //=> '2017 Apr 22'
       * @example DateTime.now().setLocale('fr').toFormat('yyyy LLL dd') //=> '2017 avr. 22'
       * @example DateTime.now().toFormat('yyyy LLL dd', { locale: "fr" }) //=> '2017 avr. 22'
       * @example DateTime.now().toFormat("HH 'hours and' mm 'minutes'") //=> '20 hours and 55 minutes'
       * @return {string}
       */
      toFormat(fmt, opts = {}) {
        return this.isValid ? Formatter.create(this.loc.redefaultToEN(opts)).formatDateTimeFromString(this, fmt) : INVALID;
      }
      /**
       * Returns a localized string representing this date. Accepts the same options as the Intl.DateTimeFormat constructor and any presets defined by Luxon, such as `DateTime.DATE_FULL` or `DateTime.TIME_SIMPLE`.
       * The exact behavior of this method is browser-specific, but in general it will return an appropriate representation
       * of the DateTime in the assigned locale.
       * Defaults to the system's locale if no locale has been specified
       * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/DateTimeFormat
       * @param formatOpts {Object} - Intl.DateTimeFormat constructor options and configuration options
       * @param {Object} opts - opts to override the configuration options on this DateTime
       * @example DateTime.now().toLocaleString(); //=> 4/20/2017
       * @example DateTime.now().setLocale('en-gb').toLocaleString(); //=> '20/04/2017'
       * @example DateTime.now().toLocaleString(DateTime.DATE_FULL); //=> 'April 20, 2017'
       * @example DateTime.now().toLocaleString(DateTime.DATE_FULL, { locale: 'fr' }); //=> '28 août 2022'
       * @example DateTime.now().toLocaleString(DateTime.TIME_SIMPLE); //=> '11:32 AM'
       * @example DateTime.now().toLocaleString(DateTime.DATETIME_SHORT); //=> '4/20/2017, 11:32 AM'
       * @example DateTime.now().toLocaleString({ weekday: 'long', month: 'long', day: '2-digit' }); //=> 'Thursday, April 20'
       * @example DateTime.now().toLocaleString({ weekday: 'short', month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit' }); //=> 'Thu, Apr 20, 11:27 AM'
       * @example DateTime.now().toLocaleString({ hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }); //=> '11:32'
       * @return {string}
       */
      toLocaleString(formatOpts = DATE_SHORT, opts = {}) {
        return this.isValid ? Formatter.create(this.loc.clone(opts), formatOpts).formatDateTime(this) : INVALID;
      }
      /**
       * Returns an array of format "parts", meaning individual tokens along with metadata. This is allows callers to post-process individual sections of the formatted output.
       * Defaults to the system's locale if no locale has been specified
       * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/DateTimeFormat/formatToParts
       * @param opts {Object} - Intl.DateTimeFormat constructor options, same as `toLocaleString`.
       * @example DateTime.now().toLocaleParts(); //=> [
       *                                   //=>   { type: 'day', value: '25' },
       *                                   //=>   { type: 'literal', value: '/' },
       *                                   //=>   { type: 'month', value: '05' },
       *                                   //=>   { type: 'literal', value: '/' },
       *                                   //=>   { type: 'year', value: '1982' }
       *                                   //=> ]
       */
      toLocaleParts(opts = {}) {
        return this.isValid ? Formatter.create(this.loc.clone(opts), opts).formatDateTimeParts(this) : [];
      }
      /**
       * Returns an ISO 8601-compliant string representation of this DateTime
       * @param {Object} opts - options
       * @param {boolean} [opts.suppressMilliseconds=false] - exclude milliseconds from the format if they're 0
       * @param {boolean} [opts.suppressSeconds=false] - exclude seconds from the format if they're 0
       * @param {boolean} [opts.includeOffset=true] - include the offset, such as 'Z' or '-04:00'
       * @param {boolean} [opts.extendedZone=false] - add the time zone format extension
       * @param {string} [opts.format='extended'] - choose between the basic and extended format
       * @param {string} [opts.precision='milliseconds'] - truncate output to desired presicion: 'years', 'months', 'days', 'hours', 'minutes', 'seconds' or 'milliseconds'. When precision and suppressSeconds or suppressMilliseconds are used together, precision sets the maximum unit shown in the output, however seconds or milliseconds will still be suppressed if they are 0.
       * @example DateTime.utc(1983, 5, 25).toISO() //=> '1982-05-25T00:00:00.000Z'
       * @example DateTime.now().toISO() //=> '2017-04-22T20:47:05.335-04:00'
       * @example DateTime.now().toISO({ includeOffset: false }) //=> '2017-04-22T20:47:05.335'
       * @example DateTime.now().toISO({ format: 'basic' }) //=> '20170422T204705.335-0400'
       * @example DateTime.now().toISO({ precision: 'day' }) //=> '2017-04-22Z'
       * @example DateTime.now().toISO({ precision: 'minute' }) //=> '2017-04-22T20:47Z'
       * @return {string|null}
       */
      toISO({
        format: format2 = "extended",
        suppressSeconds = false,
        suppressMilliseconds = false,
        includeOffset = true,
        extendedZone = false,
        precision = "milliseconds"
      } = {}) {
        if (!this.isValid) {
          return null;
        }
        precision = normalizeUnit(precision);
        const ext = format2 === "extended";
        let c = toISODate(this, ext, precision);
        if (orderedUnits.indexOf(precision) >= 3) c += "T";
        c += toISOTime(this, ext, suppressSeconds, suppressMilliseconds, includeOffset, extendedZone, precision);
        return c;
      }
      /**
       * Returns an ISO 8601-compliant string representation of this DateTime's date component
       * @param {Object} opts - options
       * @param {string} [opts.format='extended'] - choose between the basic and extended format
       * @param {string} [opts.precision='day'] - truncate output to desired precision: 'years', 'months', or 'days'.
       * @example DateTime.utc(1982, 5, 25).toISODate() //=> '1982-05-25'
       * @example DateTime.utc(1982, 5, 25).toISODate({ format: 'basic' }) //=> '19820525'
       * @example DateTime.utc(1982, 5, 25).toISODate({ precision: 'month' }) //=> '1982-05'
       * @return {string|null}
       */
      toISODate({
        format: format2 = "extended",
        precision = "day"
      } = {}) {
        if (!this.isValid) {
          return null;
        }
        return toISODate(this, format2 === "extended", normalizeUnit(precision));
      }
      /**
       * Returns an ISO 8601-compliant string representation of this DateTime's week date
       * @example DateTime.utc(1982, 5, 25).toISOWeekDate() //=> '1982-W21-2'
       * @return {string}
       */
      toISOWeekDate() {
        return toTechFormat(this, "kkkk-'W'WW-c");
      }
      /**
       * Returns an ISO 8601-compliant string representation of this DateTime's time component
       * @param {Object} opts - options
       * @param {boolean} [opts.suppressMilliseconds=false] - exclude milliseconds from the format if they're 0
       * @param {boolean} [opts.suppressSeconds=false] - exclude seconds from the format if they're 0
       * @param {boolean} [opts.includeOffset=true] - include the offset, such as 'Z' or '-04:00'
       * @param {boolean} [opts.extendedZone=true] - add the time zone format extension
       * @param {boolean} [opts.includePrefix=false] - include the `T` prefix
       * @param {string} [opts.format='extended'] - choose between the basic and extended format
       * @param {string} [opts.precision='milliseconds'] - truncate output to desired presicion: 'hours', 'minutes', 'seconds' or 'milliseconds'. When precision and suppressSeconds or suppressMilliseconds are used together, precision sets the maximum unit shown in the output, however seconds or milliseconds will still be suppressed if they are 0.
       * @example DateTime.utc().set({ hour: 7, minute: 34 }).toISOTime() //=> '07:34:19.361Z'
       * @example DateTime.utc().set({ hour: 7, minute: 34, seconds: 0, milliseconds: 0 }).toISOTime({ suppressSeconds: true }) //=> '07:34Z'
       * @example DateTime.utc().set({ hour: 7, minute: 34 }).toISOTime({ format: 'basic' }) //=> '073419.361Z'
       * @example DateTime.utc().set({ hour: 7, minute: 34 }).toISOTime({ includePrefix: true }) //=> 'T07:34:19.361Z'
       * @example DateTime.utc().set({ hour: 7, minute: 34, second: 56 }).toISOTime({ precision: 'minute' }) //=> '07:34Z'
       * @return {string}
       */
      toISOTime({
        suppressMilliseconds = false,
        suppressSeconds = false,
        includeOffset = true,
        includePrefix = false,
        extendedZone = false,
        format: format2 = "extended",
        precision = "milliseconds"
      } = {}) {
        if (!this.isValid) {
          return null;
        }
        precision = normalizeUnit(precision);
        let c = includePrefix && orderedUnits.indexOf(precision) >= 3 ? "T" : "";
        return c + toISOTime(this, format2 === "extended", suppressSeconds, suppressMilliseconds, includeOffset, extendedZone, precision);
      }
      /**
       * Returns an RFC 2822-compatible string representation of this DateTime
       * @example DateTime.utc(2014, 7, 13).toRFC2822() //=> 'Sun, 13 Jul 2014 00:00:00 +0000'
       * @example DateTime.local(2014, 7, 13).toRFC2822() //=> 'Sun, 13 Jul 2014 00:00:00 -0400'
       * @return {string}
       */
      toRFC2822() {
        return toTechFormat(this, "EEE, dd LLL yyyy HH:mm:ss ZZZ", false);
      }
      /**
       * Returns a string representation of this DateTime appropriate for use in HTTP headers. The output is always expressed in GMT.
       * Specifically, the string conforms to RFC 1123.
       * @see https://www.w3.org/Protocols/rfc2616/rfc2616-sec3.html#sec3.3.1
       * @example DateTime.utc(2014, 7, 13).toHTTP() //=> 'Sun, 13 Jul 2014 00:00:00 GMT'
       * @example DateTime.utc(2014, 7, 13, 19).toHTTP() //=> 'Sun, 13 Jul 2014 19:00:00 GMT'
       * @return {string}
       */
      toHTTP() {
        return toTechFormat(this.toUTC(), "EEE, dd LLL yyyy HH:mm:ss 'GMT'");
      }
      /**
       * Returns a string representation of this DateTime appropriate for use in SQL Date
       * @example DateTime.utc(2014, 7, 13).toSQLDate() //=> '2014-07-13'
       * @return {string|null}
       */
      toSQLDate() {
        if (!this.isValid) {
          return null;
        }
        return toISODate(this, true);
      }
      /**
       * Returns a string representation of this DateTime appropriate for use in SQL Time
       * @param {Object} opts - options
       * @param {boolean} [opts.includeZone=false] - include the zone, such as 'America/New_York'. Overrides includeOffset.
       * @param {boolean} [opts.includeOffset=true] - include the offset, such as 'Z' or '-04:00'
       * @param {boolean} [opts.includeOffsetSpace=true] - include the space between the time and the offset, such as '05:15:16.345 -04:00'
       * @example DateTime.utc().toSQL() //=> '05:15:16.345'
       * @example DateTime.now().toSQL() //=> '05:15:16.345 -04:00'
       * @example DateTime.now().toSQL({ includeOffset: false }) //=> '05:15:16.345'
       * @example DateTime.now().toSQL({ includeZone: false }) //=> '05:15:16.345 America/New_York'
       * @return {string}
       */
      toSQLTime({
        includeOffset = true,
        includeZone = false,
        includeOffsetSpace = true
      } = {}) {
        let fmt = "HH:mm:ss.SSS";
        if (includeZone || includeOffset) {
          if (includeOffsetSpace) {
            fmt += " ";
          }
          if (includeZone) {
            fmt += "z";
          } else if (includeOffset) {
            fmt += "ZZ";
          }
        }
        return toTechFormat(this, fmt, true);
      }
      /**
       * Returns a string representation of this DateTime appropriate for use in SQL DateTime
       * @param {Object} opts - options
       * @param {boolean} [opts.includeZone=false] - include the zone, such as 'America/New_York'. Overrides includeOffset.
       * @param {boolean} [opts.includeOffset=true] - include the offset, such as 'Z' or '-04:00'
       * @param {boolean} [opts.includeOffsetSpace=true] - include the space between the time and the offset, such as '05:15:16.345 -04:00'
       * @example DateTime.utc(2014, 7, 13).toSQL() //=> '2014-07-13 00:00:00.000 Z'
       * @example DateTime.local(2014, 7, 13).toSQL() //=> '2014-07-13 00:00:00.000 -04:00'
       * @example DateTime.local(2014, 7, 13).toSQL({ includeOffset: false }) //=> '2014-07-13 00:00:00.000'
       * @example DateTime.local(2014, 7, 13).toSQL({ includeZone: true }) //=> '2014-07-13 00:00:00.000 America/New_York'
       * @return {string}
       */
      toSQL(opts = {}) {
        if (!this.isValid) {
          return null;
        }
        return `${this.toSQLDate()} ${this.toSQLTime(opts)}`;
      }
      /**
       * Returns a string representation of this DateTime appropriate for debugging
       * @return {string}
       */
      toString() {
        return this.isValid ? this.toISO() : INVALID;
      }
      /**
       * Returns a string representation of this DateTime appropriate for the REPL.
       * @return {string}
       */
      [/* @__PURE__ */ Symbol.for("nodejs.util.inspect.custom")]() {
        if (this.isValid) {
          return `DateTime { ts: ${this.toISO()}, zone: ${this.zone.name}, locale: ${this.locale} }`;
        } else {
          return `DateTime { Invalid, reason: ${this.invalidReason} }`;
        }
      }
      /**
       * Returns the epoch milliseconds of this DateTime. Alias of {@link DateTime#toMillis}
       * @return {number}
       */
      valueOf() {
        return this.toMillis();
      }
      /**
       * Returns the epoch milliseconds of this DateTime.
       * @return {number}
       */
      toMillis() {
        return this.isValid ? this.ts : NaN;
      }
      /**
       * Returns the epoch seconds (including milliseconds in the fractional part) of this DateTime.
       * @return {number}
       */
      toSeconds() {
        return this.isValid ? this.ts / 1e3 : NaN;
      }
      /**
       * Returns the epoch seconds (as a whole number) of this DateTime.
       * @return {number}
       */
      toUnixInteger() {
        return this.isValid ? Math.floor(this.ts / 1e3) : NaN;
      }
      /**
       * Returns an ISO 8601 representation of this DateTime appropriate for use in JSON.
       * @return {string}
       */
      toJSON() {
        return this.toISO();
      }
      /**
       * Returns a BSON serializable equivalent to this DateTime.
       * @return {Date}
       */
      toBSON() {
        return this.toJSDate();
      }
      /**
       * Returns a JavaScript object with this DateTime's year, month, day, and so on.
       * @param opts - options for generating the object
       * @param {boolean} [opts.includeConfig=false] - include configuration attributes in the output
       * @example DateTime.now().toObject() //=> { year: 2017, month: 4, day: 22, hour: 20, minute: 49, second: 42, millisecond: 268 }
       * @return {Object}
       */
      toObject(opts = {}) {
        if (!this.isValid) return {};
        const base = {
          ...this.c
        };
        if (opts.includeConfig) {
          base.outputCalendar = this.outputCalendar;
          base.numberingSystem = this.loc.numberingSystem;
          base.locale = this.loc.locale;
        }
        return base;
      }
      /**
       * Returns a JavaScript Date equivalent to this DateTime.
       * @return {Date}
       */
      toJSDate() {
        return new Date(this.isValid ? this.ts : NaN);
      }
      // COMPARE
      /**
       * Return the difference between two DateTimes as a Duration.
       * @param {DateTime} otherDateTime - the DateTime to compare this one to
       * @param {string|string[]} [unit=['milliseconds']] - the unit or array of units (such as 'hours' or 'days') to include in the duration.
       * @param {Object} opts - options that affect the creation of the Duration
       * @param {string} [opts.conversionAccuracy='casual'] - the conversion system to use
       * @example
       * var i1 = DateTime.fromISO('1982-05-25T09:45'),
       *     i2 = DateTime.fromISO('1983-10-14T10:30');
       * i2.diff(i1).toObject() //=> { milliseconds: 43807500000 }
       * i2.diff(i1, 'hours').toObject() //=> { hours: 12168.75 }
       * i2.diff(i1, ['months', 'days']).toObject() //=> { months: 16, days: 19.03125 }
       * i2.diff(i1, ['months', 'days', 'hours']).toObject() //=> { months: 16, days: 19, hours: 0.75 }
       * @return {Duration}
       */
      diff(otherDateTime, unit = "milliseconds", opts = {}) {
        if (!this.isValid || !otherDateTime.isValid) {
          return Duration.invalid("created by diffing an invalid DateTime");
        }
        const durOpts = {
          locale: this.locale,
          numberingSystem: this.numberingSystem,
          ...opts
        };
        const units = maybeArray(unit).map(Duration.normalizeUnit), otherIsLater = otherDateTime.valueOf() > this.valueOf(), earlier = otherIsLater ? this : otherDateTime, later = otherIsLater ? otherDateTime : this, diffed = diff(earlier, later, units, durOpts);
        return otherIsLater ? diffed.negate() : diffed;
      }
      /**
       * Return the difference between this DateTime and right now.
       * See {@link DateTime#diff}
       * @param {string|string[]} [unit=['milliseconds']] - the unit or units units (such as 'hours' or 'days') to include in the duration
       * @param {Object} opts - options that affect the creation of the Duration
       * @param {string} [opts.conversionAccuracy='casual'] - the conversion system to use
       * @return {Duration}
       */
      diffNow(unit = "milliseconds", opts = {}) {
        return this.diff(_DateTime.now(), unit, opts);
      }
      /**
       * Return an Interval spanning between this DateTime and another DateTime
       * @param {DateTime} otherDateTime - the other end point of the Interval
       * @return {Interval|DateTime}
       */
      until(otherDateTime) {
        return this.isValid ? Interval.fromDateTimes(this, otherDateTime) : this;
      }
      /**
       * Return whether this DateTime is in the same unit of time as another DateTime.
       * Higher-order units must also be identical for this function to return `true`.
       * Note that time zones are **ignored** in this comparison, which compares the **local** calendar time. Use {@link DateTime#setZone} to convert one of the dates if needed.
       * @param {DateTime} otherDateTime - the other DateTime
       * @param {string} unit - the unit of time to check sameness on
       * @param {Object} opts - options
       * @param {boolean} [opts.useLocaleWeeks=false] - If true, use weeks based on the locale, i.e. use the locale-dependent start of the week; only the locale of this DateTime is used
       * @example DateTime.now().hasSame(otherDT, 'day'); //~> true if otherDT is in the same current calendar day
       * @return {boolean}
       */
      hasSame(otherDateTime, unit, opts) {
        if (!this.isValid) return false;
        const inputMs = otherDateTime.valueOf();
        const adjustedToZone = this.setZone(otherDateTime.zone, {
          keepLocalTime: true
        });
        return adjustedToZone.startOf(unit, opts) <= inputMs && inputMs <= adjustedToZone.endOf(unit, opts);
      }
      /**
       * Equality check
       * Two DateTimes are equal if and only if they represent the same millisecond, have the same zone and location, and are both valid.
       * To compare just the millisecond values, use `+dt1 === +dt2`.
       * @param {DateTime} other - the other DateTime
       * @return {boolean}
       */
      equals(other) {
        return this.isValid && other.isValid && this.valueOf() === other.valueOf() && this.zone.equals(other.zone) && this.loc.equals(other.loc);
      }
      /**
       * Returns a string representation of a this time relative to now, such as "in two days". Can only internationalize if your
       * platform supports Intl.RelativeTimeFormat. Rounds towards zero by default.
       * @param {Object} options - options that affect the output
       * @param {DateTime} [options.base=DateTime.now()] - the DateTime to use as the basis to which this time is compared. Defaults to now.
       * @param {string} [options.style="long"] - the style of units, must be "long", "short", or "narrow"
       * @param {string|string[]} options.unit - use a specific unit or array of units; if omitted, or an array, the method will pick the best unit. Use an array or one of "years", "quarters", "months", "weeks", "days", "hours", "minutes", or "seconds"
       * @param {boolean} [options.round=true] - whether to round the numbers in the output.
       * @param {string} [options.rounding="trunc"] - rounding method to use when rounding the numbers in the output. Can be "trunc" (toward zero), "expand" (away from zero), "round", "floor", or "ceil".
       * @param {number} [options.padding=0] - padding in milliseconds. This allows you to round up the result if it fits inside the threshold. Don't use in combination with {round: false} because the decimal output will include the padding.
       * @param {string} options.locale - override the locale of this DateTime
       * @param {string} options.numberingSystem - override the numberingSystem of this DateTime. The Intl system may choose not to honor this
       * @example DateTime.now().plus({ days: 1 }).toRelative() //=> "in 1 day"
       * @example DateTime.now().setLocale("es").toRelative({ days: 1 }) //=> "dentro de 1 día"
       * @example DateTime.now().plus({ days: 1 }).toRelative({ locale: "fr" }) //=> "dans 23 heures"
       * @example DateTime.now().minus({ days: 2 }).toRelative() //=> "2 days ago"
       * @example DateTime.now().minus({ days: 2 }).toRelative({ unit: "hours" }) //=> "48 hours ago"
       * @example DateTime.now().minus({ hours: 36 }).toRelative({ round: false }) //=> "1.5 days ago"
       */
      toRelative(options = {}) {
        if (!this.isValid) return null;
        const base = options.base || _DateTime.fromObject({}, {
          zone: this.zone
        }), padding = options.padding ? this < base ? -options.padding : options.padding : 0;
        let units = ["years", "months", "days", "hours", "minutes", "seconds"];
        let unit = options.unit;
        if (Array.isArray(options.unit)) {
          units = options.unit;
          unit = void 0;
        }
        return diffRelative(base, this.plus(padding), {
          ...options,
          numeric: "always",
          units,
          unit
        });
      }
      /**
       * Returns a string representation of this date relative to today, such as "yesterday" or "next month".
       * Only internationalizes on platforms that supports Intl.RelativeTimeFormat.
       * @param {Object} options - options that affect the output
       * @param {DateTime} [options.base=DateTime.now()] - the DateTime to use as the basis to which this time is compared. Defaults to now.
       * @param {string} options.locale - override the locale of this DateTime
       * @param {string} options.unit - use a specific unit; if omitted, the method will pick the unit. Use one of "years", "quarters", "months", "weeks", or "days"
       * @param {string} options.numberingSystem - override the numberingSystem of this DateTime. The Intl system may choose not to honor this
       * @example DateTime.now().plus({ days: 1 }).toRelativeCalendar() //=> "tomorrow"
       * @example DateTime.now().setLocale("es").plus({ days: 1 }).toRelative() //=> ""mañana"
       * @example DateTime.now().plus({ days: 1 }).toRelativeCalendar({ locale: "fr" }) //=> "demain"
       * @example DateTime.now().minus({ days: 2 }).toRelativeCalendar() //=> "2 days ago"
       */
      toRelativeCalendar(options = {}) {
        if (!this.isValid) return null;
        return diffRelative(options.base || _DateTime.fromObject({}, {
          zone: this.zone
        }), this, {
          ...options,
          numeric: "auto",
          units: ["years", "months", "days"],
          calendary: true
        });
      }
      /**
       * Return the min of several date times
       * @param {...DateTime} dateTimes - the DateTimes from which to choose the minimum
       * @return {DateTime} the min DateTime, or undefined if called with no argument
       */
      static min(...dateTimes) {
        if (!dateTimes.every(_DateTime.isDateTime)) {
          throw new InvalidArgumentError("min requires all arguments be DateTimes");
        }
        return bestBy(dateTimes, (i) => i.valueOf(), Math.min);
      }
      /**
       * Return the max of several date times
       * @param {...DateTime} dateTimes - the DateTimes from which to choose the maximum
       * @return {DateTime} the max DateTime, or undefined if called with no argument
       */
      static max(...dateTimes) {
        if (!dateTimes.every(_DateTime.isDateTime)) {
          throw new InvalidArgumentError("max requires all arguments be DateTimes");
        }
        return bestBy(dateTimes, (i) => i.valueOf(), Math.max);
      }
      // MISC
      /**
       * Explain how a string would be parsed by fromFormat()
       * @param {string} text - the string to parse
       * @param {string} fmt - the format the string is expected to be in (see description)
       * @param {Object} options - options taken by fromFormat()
       * @return {Object}
       */
      static fromFormatExplain(text, fmt, options = {}) {
        const {
          locale = null,
          numberingSystem = null
        } = options, localeToUse = Locale.fromOpts({
          locale,
          numberingSystem,
          defaultToEN: true
        });
        return explainFromTokens(localeToUse, text, fmt);
      }
      /**
       * @deprecated use fromFormatExplain instead
       */
      static fromStringExplain(text, fmt, options = {}) {
        return _DateTime.fromFormatExplain(text, fmt, options);
      }
      /**
       * Build a parser for `fmt` using the given locale. This parser can be passed
       * to {@link DateTime.fromFormatParser} to a parse a date in this format. This
       * can be used to optimize cases where many dates need to be parsed in a
       * specific format.
       *
       * @param {String} fmt - the format the string is expected to be in (see
       * description)
       * @param {Object} options - options used to set locale and numberingSystem
       * for parser
       * @returns {TokenParser} - opaque object to be used
       */
      static buildFormatParser(fmt, options = {}) {
        const {
          locale = null,
          numberingSystem = null
        } = options, localeToUse = Locale.fromOpts({
          locale,
          numberingSystem,
          defaultToEN: true
        });
        return new TokenParser(localeToUse, fmt);
      }
      /**
       * Create a DateTime from an input string and format parser.
       *
       * The format parser must have been created with the same locale as this call.
       *
       * @param {String} text - the string to parse
       * @param {TokenParser} formatParser - parser from {@link DateTime.buildFormatParser}
       * @param {Object} opts - options taken by fromFormat()
       * @returns {DateTime}
       */
      static fromFormatParser(text, formatParser, opts = {}) {
        if (isUndefined(text) || isUndefined(formatParser)) {
          throw new InvalidArgumentError("fromFormatParser requires an input string and a format parser");
        }
        const {
          locale = null,
          numberingSystem = null
        } = opts, localeToUse = Locale.fromOpts({
          locale,
          numberingSystem,
          defaultToEN: true
        });
        if (!localeToUse.equals(formatParser.locale)) {
          throw new InvalidArgumentError(`fromFormatParser called with a locale of ${localeToUse}, but the format parser was created for ${formatParser.locale}`);
        }
        const {
          result,
          zone,
          specificOffset,
          invalidReason
        } = formatParser.explainFromTokens(text);
        if (invalidReason) {
          return _DateTime.invalid(invalidReason);
        } else {
          return parseDataToDateTime(result, zone, opts, `format ${formatParser.format}`, text, specificOffset);
        }
      }
      // FORMAT PRESETS
      /**
       * {@link DateTime#toLocaleString} format like 10/14/1983
       * @type {Object}
       */
      static get DATE_SHORT() {
        return DATE_SHORT;
      }
      /**
       * {@link DateTime#toLocaleString} format like 'Oct 14, 1983'
       * @type {Object}
       */
      static get DATE_MED() {
        return DATE_MED;
      }
      /**
       * {@link DateTime#toLocaleString} format like 'Fri, Oct 14, 1983'
       * @type {Object}
       */
      static get DATE_MED_WITH_WEEKDAY() {
        return DATE_MED_WITH_WEEKDAY;
      }
      /**
       * {@link DateTime#toLocaleString} format like 'October 14, 1983'
       * @type {Object}
       */
      static get DATE_FULL() {
        return DATE_FULL;
      }
      /**
       * {@link DateTime#toLocaleString} format like 'Tuesday, October 14, 1983'
       * @type {Object}
       */
      static get DATE_HUGE() {
        return DATE_HUGE;
      }
      /**
       * {@link DateTime#toLocaleString} format like '09:30 AM'. Only 12-hour if the locale is.
       * @type {Object}
       */
      static get TIME_SIMPLE() {
        return TIME_SIMPLE;
      }
      /**
       * {@link DateTime#toLocaleString} format like '09:30:23 AM'. Only 12-hour if the locale is.
       * @type {Object}
       */
      static get TIME_WITH_SECONDS() {
        return TIME_WITH_SECONDS;
      }
      /**
       * {@link DateTime#toLocaleString} format like '09:30:23 AM EDT'. Only 12-hour if the locale is.
       * @type {Object}
       */
      static get TIME_WITH_SHORT_OFFSET() {
        return TIME_WITH_SHORT_OFFSET;
      }
      /**
       * {@link DateTime#toLocaleString} format like '09:30:23 AM Eastern Daylight Time'. Only 12-hour if the locale is.
       * @type {Object}
       */
      static get TIME_WITH_LONG_OFFSET() {
        return TIME_WITH_LONG_OFFSET;
      }
      /**
       * {@link DateTime#toLocaleString} format like '09:30', always 24-hour.
       * @type {Object}
       */
      static get TIME_24_SIMPLE() {
        return TIME_24_SIMPLE;
      }
      /**
       * {@link DateTime#toLocaleString} format like '09:30:23', always 24-hour.
       * @type {Object}
       */
      static get TIME_24_WITH_SECONDS() {
        return TIME_24_WITH_SECONDS;
      }
      /**
       * {@link DateTime#toLocaleString} format like '09:30:23 EDT', always 24-hour.
       * @type {Object}
       */
      static get TIME_24_WITH_SHORT_OFFSET() {
        return TIME_24_WITH_SHORT_OFFSET;
      }
      /**
       * {@link DateTime#toLocaleString} format like '09:30:23 Eastern Daylight Time', always 24-hour.
       * @type {Object}
       */
      static get TIME_24_WITH_LONG_OFFSET() {
        return TIME_24_WITH_LONG_OFFSET;
      }
      /**
       * {@link DateTime#toLocaleString} format like '10/14/1983, 9:30 AM'. Only 12-hour if the locale is.
       * @type {Object}
       */
      static get DATETIME_SHORT() {
        return DATETIME_SHORT;
      }
      /**
       * {@link DateTime#toLocaleString} format like '10/14/1983, 9:30:33 AM'. Only 12-hour if the locale is.
       * @type {Object}
       */
      static get DATETIME_SHORT_WITH_SECONDS() {
        return DATETIME_SHORT_WITH_SECONDS;
      }
      /**
       * {@link DateTime#toLocaleString} format like 'Oct 14, 1983, 9:30 AM'. Only 12-hour if the locale is.
       * @type {Object}
       */
      static get DATETIME_MED() {
        return DATETIME_MED;
      }
      /**
       * {@link DateTime#toLocaleString} format like 'Oct 14, 1983, 9:30:33 AM'. Only 12-hour if the locale is.
       * @type {Object}
       */
      static get DATETIME_MED_WITH_SECONDS() {
        return DATETIME_MED_WITH_SECONDS;
      }
      /**
       * {@link DateTime#toLocaleString} format like 'Fri, 14 Oct 1983, 9:30 AM'. Only 12-hour if the locale is.
       * @type {Object}
       */
      static get DATETIME_MED_WITH_WEEKDAY() {
        return DATETIME_MED_WITH_WEEKDAY;
      }
      /**
       * {@link DateTime#toLocaleString} format like 'October 14, 1983, 9:30 AM EDT'. Only 12-hour if the locale is.
       * @type {Object}
       */
      static get DATETIME_FULL() {
        return DATETIME_FULL;
      }
      /**
       * {@link DateTime#toLocaleString} format like 'October 14, 1983, 9:30:33 AM EDT'. Only 12-hour if the locale is.
       * @type {Object}
       */
      static get DATETIME_FULL_WITH_SECONDS() {
        return DATETIME_FULL_WITH_SECONDS;
      }
      /**
       * {@link DateTime#toLocaleString} format like 'Friday, October 14, 1983, 9:30 AM Eastern Daylight Time'. Only 12-hour if the locale is.
       * @type {Object}
       */
      static get DATETIME_HUGE() {
        return DATETIME_HUGE;
      }
      /**
       * {@link DateTime#toLocaleString} format like 'Friday, October 14, 1983, 9:30:33 AM Eastern Daylight Time'. Only 12-hour if the locale is.
       * @type {Object}
       */
      static get DATETIME_HUGE_WITH_SECONDS() {
        return DATETIME_HUGE_WITH_SECONDS;
      }
    };
    function friendlyDateTime(dateTimeish) {
      if (DateTime.isDateTime(dateTimeish)) {
        return dateTimeish;
      } else if (dateTimeish && dateTimeish.valueOf && isNumber(dateTimeish.valueOf())) {
        return DateTime.fromJSDate(dateTimeish);
      } else if (dateTimeish && typeof dateTimeish === "object") {
        return DateTime.fromObject(dateTimeish);
      } else {
        throw new InvalidArgumentError(`Unknown datetime argument: ${dateTimeish}, of type ${typeof dateTimeish}`);
      }
    }
    var VERSION = "3.7.2";
    exports.DateTime = DateTime;
    exports.Duration = Duration;
    exports.FixedOffsetZone = FixedOffsetZone;
    exports.IANAZone = IANAZone;
    exports.Info = Info;
    exports.Interval = Interval;
    exports.InvalidZone = InvalidZone;
    exports.Settings = Settings;
    exports.SystemZone = SystemZone;
    exports.VERSION = VERSION;
    exports.Zone = Zone;
  }
});

// node_modules/cron-parser/dist/CronDate.js
var require_CronDate = __commonJS({
  "node_modules/cron-parser/dist/CronDate.js"(exports) {
    "use strict";
    init_define_SEI_BUNDLED_ENGINE_VERSIONS();
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.CronDate = exports.DAYS_IN_MONTH = exports.DateMathOp = exports.TimeUnit = void 0;
    var luxon_1 = require_luxon();
    var TimeUnit;
    (function(TimeUnit2) {
      TimeUnit2["Second"] = "Second";
      TimeUnit2["Minute"] = "Minute";
      TimeUnit2["Hour"] = "Hour";
      TimeUnit2["Day"] = "Day";
      TimeUnit2["Month"] = "Month";
      TimeUnit2["Year"] = "Year";
    })(TimeUnit || (exports.TimeUnit = TimeUnit = {}));
    var DateMathOp;
    (function(DateMathOp2) {
      DateMathOp2["Add"] = "Add";
      DateMathOp2["Subtract"] = "Subtract";
    })(DateMathOp || (exports.DateMathOp = DateMathOp = {}));
    exports.DAYS_IN_MONTH = Object.freeze([31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]);
    var CronDate = class _CronDate {
      #date;
      #dstStart = null;
      #dstEnd = null;
      /**
       * Constructs a new CronDate instance.
       * @param {CronDate | Date | number | string} [timestamp] - The timestamp to initialize the CronDate with.
       * @param {string} [tz] - The timezone to use for the CronDate.
       */
      constructor(timestamp, tz) {
        const dateOpts = { zone: tz };
        if (!timestamp) {
          this.#date = luxon_1.DateTime.local();
        } else if (timestamp instanceof _CronDate) {
          this.#date = timestamp.#date;
          this.#dstStart = timestamp.#dstStart;
          this.#dstEnd = timestamp.#dstEnd;
        } else if (timestamp instanceof Date) {
          this.#date = luxon_1.DateTime.fromJSDate(timestamp, dateOpts);
        } else if (typeof timestamp === "number") {
          this.#date = luxon_1.DateTime.fromMillis(timestamp, dateOpts);
        } else {
          this.#date = luxon_1.DateTime.fromISO(timestamp, dateOpts);
          this.#date.isValid || (this.#date = luxon_1.DateTime.fromRFC2822(timestamp, dateOpts));
          this.#date.isValid || (this.#date = luxon_1.DateTime.fromSQL(timestamp, dateOpts));
          this.#date.isValid || (this.#date = luxon_1.DateTime.fromFormat(timestamp, "EEE, d MMM yyyy HH:mm:ss", dateOpts));
        }
        if (!this.#date.isValid) {
          throw new Error(`CronDate: unhandled timestamp: ${timestamp}`);
        }
        if (tz && tz !== this.#date.zoneName) {
          this.#date = this.#date.setZone(tz);
        }
      }
      /**
       * Determines if the given year is a leap year.
       * @param {number} year - The year to check
       * @returns {boolean} - True if the year is a leap year, false otherwise
       * @private
       */
      static #isLeapYear(year) {
        return year % 4 === 0 && year % 100 !== 0 || year % 400 === 0;
      }
      /**
       * Returns daylight savings start time.
       * @returns {number | null}
       */
      get dstStart() {
        return this.#dstStart;
      }
      /**
       * Sets daylight savings start time.
       * @param {number | null} value
       */
      set dstStart(value) {
        this.#dstStart = value;
      }
      /**
       * Returns daylight savings end time.
       * @returns {number | null}
       */
      get dstEnd() {
        return this.#dstEnd;
      }
      /**
       * Sets daylight savings end time.
       * @param {number | null} value
       */
      set dstEnd(value) {
        this.#dstEnd = value;
      }
      /**
       * Adds one year to the current CronDate.
       */
      addYear() {
        this.#date = this.#date.plus({ years: 1 });
      }
      /**
       * Adds one month to the current CronDate.
       */
      addMonth() {
        this.#date = this.#date.plus({ months: 1 }).startOf("month");
      }
      /**
       * Adds one day to the current CronDate.
       */
      addDay() {
        this.#date = this.#date.plus({ days: 1 }).startOf("day");
      }
      /**
       * Adds one hour to the current CronDate.
       */
      addHour() {
        this.#date = this.#date.plus({ hours: 1 }).startOf("hour");
      }
      /**
       * Adds one minute to the current CronDate.
       */
      addMinute() {
        this.#date = this.#date.plus({ minutes: 1 }).startOf("minute");
      }
      /**
       * Adds one second to the current CronDate.
       */
      addSecond() {
        this.#date = this.#date.plus({ seconds: 1 });
      }
      /**
       * Subtracts one year from the current CronDate.
       */
      subtractYear() {
        this.#date = this.#date.minus({ years: 1 });
      }
      /**
       * Subtracts one month from the current CronDate.
       * If the month is 1, it will subtract one year instead.
       */
      subtractMonth() {
        this.#date = this.#date.minus({ months: 1 }).endOf("month").startOf("second");
      }
      /**
       * Subtracts one day from the current CronDate.
       * If the day is 1, it will subtract one month instead.
       */
      subtractDay() {
        this.#date = this.#date.minus({ days: 1 }).endOf("day").startOf("second");
      }
      /**
       * Subtracts one hour from the current CronDate.
       * If the hour is 0, it will subtract one day instead.
       */
      subtractHour() {
        this.#date = this.#date.minus({ hours: 1 }).endOf("hour").startOf("second");
      }
      /**
       * Subtracts one minute from the current CronDate.
       * If the minute is 0, it will subtract one hour instead.
       */
      subtractMinute() {
        this.#date = this.#date.minus({ minutes: 1 }).endOf("minute").startOf("second");
      }
      /**
       * Subtracts one second from the current CronDate.
       * If the second is 0, it will subtract one minute instead.
       */
      subtractSecond() {
        this.#date = this.#date.minus({ seconds: 1 });
      }
      /**
       * Adds a unit of time to the current CronDate.
       * @param {TimeUnit} unit
       */
      addUnit(unit) {
        switch (unit) {
          case TimeUnit.Year:
            return this.addYear();
          case TimeUnit.Month:
            return this.addMonth();
          case TimeUnit.Day:
            return this.addDay();
          case TimeUnit.Hour:
            return this.addHour();
          case TimeUnit.Minute:
            return this.addMinute();
          case TimeUnit.Second:
            return this.addSecond();
        }
      }
      /**
       * Subtracts a unit of time from the current CronDate.
       * @param {TimeUnit} unit
       */
      subtractUnit(unit) {
        switch (unit) {
          case TimeUnit.Year:
            return this.subtractYear();
          case TimeUnit.Month:
            return this.subtractMonth();
          case TimeUnit.Day:
            return this.subtractDay();
          case TimeUnit.Hour:
            return this.subtractHour();
          case TimeUnit.Minute:
            return this.subtractMinute();
          case TimeUnit.Second:
            return this.subtractSecond();
        }
      }
      /**
       * Handles a math operation.
       * @param {DateMathOp} verb - {'add' | 'subtract'}
       * @param {TimeUnit} unit - {'year' | 'month' | 'day' | 'hour' | 'minute' | 'second'}
       */
      invokeDateOperation(verb, unit) {
        if (verb === DateMathOp.Add) {
          this.addUnit(unit);
          return;
        }
        if (verb === DateMathOp.Subtract) {
          this.subtractUnit(unit);
          return;
        }
        throw new Error(`Invalid verb: ${verb}`);
      }
      /**
       * Returns the day.
       * @returns {number}
       */
      getDate() {
        return this.#date.day;
      }
      /**
       * Returns the year.
       * @returns {number}
       */
      getFullYear() {
        return this.#date.year;
      }
      /**
       * Returns the day of the week.
       * @returns {number}
       */
      getDay() {
        const weekday = this.#date.weekday;
        return weekday === 7 ? 0 : weekday;
      }
      /**
       * Returns the month.
       * @returns {number}
       */
      getMonth() {
        return this.#date.month - 1;
      }
      /**
       * Returns the hour.
       * @returns {number}
       */
      getHours() {
        return this.#date.hour;
      }
      /**
       * Returns the minutes.
       * @returns {number}
       */
      getMinutes() {
        return this.#date.minute;
      }
      /**
       * Returns the seconds.
       * @returns {number}
       */
      getSeconds() {
        return this.#date.second;
      }
      /**
       * Returns the milliseconds.
       * @returns {number}
       */
      getMilliseconds() {
        return this.#date.millisecond;
      }
      /**
       * Returns the timezone offset from UTC in minutes (e.g. UTC+2 => 120).
       * Useful for detecting DST transition days.
       *
       * @returns {number} UTC offset in minutes
       */
      getUTCOffset() {
        return this.#date.offset;
      }
      /**
       * Sets the time to the start of the day (00:00:00.000) in the current timezone.
       */
      setStartOfDay() {
        this.#date = this.#date.startOf("day");
      }
      /**
       * Sets the time to the end of the day (23:59:59.999) in the current timezone.
       */
      setEndOfDay() {
        this.#date = this.#date.endOf("day");
      }
      /**
       * Returns the time.
       * @returns {number}
       */
      getTime() {
        return this.#date.valueOf();
      }
      /**
       * Returns the UTC day.
       * @returns {number}
       */
      getUTCDate() {
        return this.#getUTC().day;
      }
      /**
       * Returns the UTC year.
       * @returns {number}
       */
      getUTCFullYear() {
        return this.#getUTC().year;
      }
      /**
       * Returns the UTC day of the week.
       * @returns {number}
       */
      getUTCDay() {
        const weekday = this.#getUTC().weekday;
        return weekday === 7 ? 0 : weekday;
      }
      /**
       * Returns the UTC month.
       * @returns {number}
       */
      getUTCMonth() {
        return this.#getUTC().month - 1;
      }
      /**
       * Returns the UTC hour.
       * @returns {number}
       */
      getUTCHours() {
        return this.#getUTC().hour;
      }
      /**
       * Returns the UTC minutes.
       * @returns {number}
       */
      getUTCMinutes() {
        return this.#getUTC().minute;
      }
      /**
       * Returns the UTC seconds.
       * @returns {number}
       */
      getUTCSeconds() {
        return this.#getUTC().second;
      }
      /**
       * Returns the UTC milliseconds.
       * @returns {string | null}
       */
      toISOString() {
        return this.#date.toUTC().toISO();
      }
      /**
       * Returns the date as a JSON string.
       * @returns {string | null}
       */
      toJSON() {
        return this.#date.toJSON();
      }
      /**
       * Sets the day.
       * @param d
       */
      setDate(d) {
        this.#date = this.#date.set({ day: d });
      }
      /**
       * Sets the year.
       * @param y
       */
      setFullYear(y) {
        this.#date = this.#date.set({ year: y });
      }
      /**
       * Sets the day of the week.
       * @param d
       */
      setDay(d) {
        this.#date = this.#date.set({ weekday: d });
      }
      /**
       * Sets the month.
       * @param m
       */
      setMonth(m) {
        this.#date = this.#date.set({ month: m + 1 });
      }
      /**
       * Sets the hour.
       * @param h
       */
      setHours(h) {
        this.#date = this.#date.set({ hour: h });
      }
      /**
       * Sets the minutes.
       * @param m
       */
      setMinutes(m) {
        this.#date = this.#date.set({ minute: m });
      }
      /**
       * Sets the seconds.
       * @param s
       */
      setSeconds(s) {
        this.#date = this.#date.set({ second: s });
      }
      /**
       * Sets the milliseconds.
       * @param s
       */
      setMilliseconds(s) {
        this.#date = this.#date.set({ millisecond: s });
      }
      /**
       * Returns the date as a string.
       * @returns {string}
       */
      toString() {
        return this.toDate().toString();
      }
      /**
       * Returns the date as a Date object.
       * @returns {Date}
       */
      toDate() {
        return this.#date.toJSDate();
      }
      /**
       * Returns true if the day is the last day of the month.
       * @returns {boolean}
       */
      isLastDayOfMonth() {
        const { day, month } = this.#date;
        if (month === 2) {
          const isLeap = _CronDate.#isLeapYear(this.#date.year);
          return day === exports.DAYS_IN_MONTH[month - 1] - (isLeap ? 0 : 1);
        }
        return day === exports.DAYS_IN_MONTH[month - 1];
      }
      /**
       * Returns true if the day is the last weekday of the month.
       * @returns {boolean}
       */
      isLastWeekdayOfMonth() {
        const { day, month } = this.#date;
        let lastDay;
        if (month === 2) {
          lastDay = exports.DAYS_IN_MONTH[month - 1] - (_CronDate.#isLeapYear(this.#date.year) ? 0 : 1);
        } else {
          lastDay = exports.DAYS_IN_MONTH[month - 1];
        }
        return day > lastDay - 7;
      }
      /**
       * Primarily for internal use.
       * @param {DateMathOp} op - The operation to perform.
       * @param {TimeUnit} unit - The unit of time to use.
       * @param {number} [hoursLength] - The length of the hours. Required when unit is not month or day.
       */
      applyDateOperation(op, unit, hoursLength) {
        if (unit === TimeUnit.Month || unit === TimeUnit.Day) {
          this.invokeDateOperation(op, unit);
          return;
        }
        const previousHour = this.getHours();
        this.invokeDateOperation(op, unit);
        const currentHour = this.getHours();
        const diff = currentHour - previousHour;
        if (diff === 2) {
          if (hoursLength !== 24) {
            this.dstStart = previousHour + 1;
          }
        } else if (diff === 0 && this.getMinutes() === 0 && this.getSeconds() === 0) {
          if (hoursLength !== 24) {
            this.dstEnd = currentHour;
          }
        }
      }
      /**
       * Returns the UTC date.
       * @private
       * @returns {DateTime}
       */
      #getUTC() {
        return this.#date.toUTC();
      }
    };
    exports.CronDate = CronDate;
    exports.default = CronDate;
  }
});

// node_modules/cron-parser/dist/fields/CronMonth.js
var require_CronMonth = __commonJS({
  "node_modules/cron-parser/dist/fields/CronMonth.js"(exports) {
    "use strict";
    init_define_SEI_BUNDLED_ENGINE_VERSIONS();
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.CronMonth = void 0;
    var CronDate_1 = require_CronDate();
    var CronField_1 = require_CronField();
    var MIN_MONTH = 1;
    var MAX_MONTH = 12;
    var MONTH_CHARS = Object.freeze([]);
    var CronMonth = class extends CronField_1.CronField {
      static get min() {
        return MIN_MONTH;
      }
      static get max() {
        return MAX_MONTH;
      }
      static get chars() {
        return MONTH_CHARS;
      }
      static get daysInMonth() {
        return CronDate_1.DAYS_IN_MONTH;
      }
      /**
       * CronDayOfMonth constructor. Initializes the "day of the month" field with the provided values.
       * @param {MonthRange[]} values - Values for the "day of the month" field
       * @param {CronFieldOptions} [options] - Options provided by the parser
       */
      constructor(values, options) {
        super(values, options);
        this.validate();
      }
      /**
       * Returns an array of allowed values for the "day of the month" field.
       * @returns {MonthRange[]}
       */
      get values() {
        return super.values;
      }
    };
    exports.CronMonth = CronMonth;
  }
});

// node_modules/cron-parser/dist/fields/CronDayOfMonth.js
var require_CronDayOfMonth = __commonJS({
  "node_modules/cron-parser/dist/fields/CronDayOfMonth.js"(exports) {
    "use strict";
    init_define_SEI_BUNDLED_ENGINE_VERSIONS();
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.CronDayOfMonth = void 0;
    var CronField_1 = require_CronField();
    var CronMonth_1 = require_CronMonth();
    var MIN_DAY = 1;
    var MAX_DAY = 31;
    var DAY_CHARS = Object.freeze(["L"]);
    var CronDayOfMonth = class _CronDayOfMonth extends CronField_1.CronField {
      /**
       * Creates a "day of the month" field limited to the days the given month has.
       * @param {MonthRange[]} month - Values for the "month" field the days are used with
       * @param {DayOfMonthRange[]} values - Values for the "day of the month" field
       * @param {CronFieldOptions} [options] - Options provided by the parser
       * @returns {CronDayOfMonth}
       */
      static fromMonth(month, values, options) {
        if (month.length !== 1) {
          return new _CronDayOfMonth(values, options);
        }
        const daysInMonth = CronMonth_1.CronMonth.daysInMonth[month[0] - 1];
        const days = values.filter((value) => typeof value !== "number" || value <= daysInMonth);
        return new _CronDayOfMonth(days.length > 0 ? days : values, options);
      }
      static get min() {
        return MIN_DAY;
      }
      static get max() {
        return MAX_DAY;
      }
      static get chars() {
        return DAY_CHARS;
      }
      static get validChars() {
        return /^[?,*\dLH/-]+$|^.*H\(\d+-\d+\)\/\d+.*$|^.*H\(\d+-\d+\).*$|^.*H\/\d+.*$/;
      }
      /**
       * CronDayOfMonth constructor. Initializes the "day of the month" field with the provided values.
       * @param {DayOfMonthRange[]} values - Values for the "day of the month" field
       * @param {CronFieldOptions} [options] - Options provided by the parser
       * @throws {Error} if validation fails
       */
      constructor(values, options) {
        super(values, options);
        this.validate();
      }
      /**
       * Returns an array of allowed values for the "day of the month" field.
       * @returns {DayOfMonthRange[]}
       */
      get values() {
        return super.values;
      }
    };
    exports.CronDayOfMonth = CronDayOfMonth;
  }
});

// node_modules/cron-parser/dist/fields/CronDayOfWeek.js
var require_CronDayOfWeek = __commonJS({
  "node_modules/cron-parser/dist/fields/CronDayOfWeek.js"(exports) {
    "use strict";
    init_define_SEI_BUNDLED_ENGINE_VERSIONS();
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.CronDayOfWeek = void 0;
    var CronField_1 = require_CronField();
    var MIN_DAY = 0;
    var MAX_DAY = 7;
    var DAY_CHARS = Object.freeze(["L"]);
    var CronDayOfWeek = class extends CronField_1.CronField {
      static get min() {
        return MIN_DAY;
      }
      static get max() {
        return MAX_DAY;
      }
      static get chars() {
        return DAY_CHARS;
      }
      static get validChars() {
        return /^[?,*\dLH#/-]+$|^.*H\(\d+-\d+\)\/\d+.*$|^.*H\(\d+-\d+\).*$|^.*H\/\d+.*$/;
      }
      /**
       * CronDayOfTheWeek constructor. Initializes the "day of the week" field with the provided values.
       * @param {DayOfWeekRange[]} values - Values for the "day of the week" field
       * @param {CronFieldOptions} [options] - Options provided by the parser
       */
      constructor(values, options) {
        super(values, options);
        this.validate();
        if (this.values.some((value) => value === "L")) {
          throw new Error(`${this.constructor.name} Validation error, unexpected standalone L`);
        }
      }
      /**
       * Returns an array of allowed values for the "day of the week" field.
       * @returns {DayOfWeekRange[]}
       */
      get values() {
        return super.values;
      }
      /**
       * Returns the nth day of the week if specified in the cron expression.
       * This is used for the '#' character in the cron expression.
       * @returns {number} The nth day of the week (1-5) or 0 if not specified.
       */
      get nthDay() {
        return this.options.nthDayOfWeek ?? 0;
      }
    };
    exports.CronDayOfWeek = CronDayOfWeek;
  }
});

// node_modules/cron-parser/dist/fields/CronHour.js
var require_CronHour = __commonJS({
  "node_modules/cron-parser/dist/fields/CronHour.js"(exports) {
    "use strict";
    init_define_SEI_BUNDLED_ENGINE_VERSIONS();
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.CronHour = void 0;
    var CronField_1 = require_CronField();
    var MIN_HOUR = 0;
    var MAX_HOUR = 23;
    var HOUR_CHARS = Object.freeze([]);
    var CronHour = class extends CronField_1.CronField {
      static get min() {
        return MIN_HOUR;
      }
      static get max() {
        return MAX_HOUR;
      }
      static get chars() {
        return HOUR_CHARS;
      }
      /**
       * CronHour constructor. Initializes the "hour" field with the provided values.
       * @param {HourRange[]} values - Values for the "hour" field
       * @param {CronFieldOptions} [options] - Options provided by the parser
       */
      constructor(values, options) {
        super(values, options);
        this.validate();
      }
      /**
       * Returns an array of allowed values for the "hour" field.
       * @returns {HourRange[]}
       */
      get values() {
        return super.values;
      }
    };
    exports.CronHour = CronHour;
  }
});

// node_modules/cron-parser/dist/fields/CronMinute.js
var require_CronMinute = __commonJS({
  "node_modules/cron-parser/dist/fields/CronMinute.js"(exports) {
    "use strict";
    init_define_SEI_BUNDLED_ENGINE_VERSIONS();
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.CronMinute = void 0;
    var CronField_1 = require_CronField();
    var MIN_MINUTE = 0;
    var MAX_MINUTE = 59;
    var MINUTE_CHARS = Object.freeze([]);
    var CronMinute = class extends CronField_1.CronField {
      static get min() {
        return MIN_MINUTE;
      }
      static get max() {
        return MAX_MINUTE;
      }
      static get chars() {
        return MINUTE_CHARS;
      }
      /**
       * CronSecond constructor. Initializes the "second" field with the provided values.
       * @param {SixtyRange[]} values - Values for the "second" field
       * @param {CronFieldOptions} [options] - Options provided by the parser
       */
      constructor(values, options) {
        super(values, options);
        this.validate();
      }
      /**
       * Returns an array of allowed values for the "second" field.
       * @returns {SixtyRange[]}
       */
      get values() {
        return super.values;
      }
    };
    exports.CronMinute = CronMinute;
  }
});

// node_modules/cron-parser/dist/fields/CronSecond.js
var require_CronSecond = __commonJS({
  "node_modules/cron-parser/dist/fields/CronSecond.js"(exports) {
    "use strict";
    init_define_SEI_BUNDLED_ENGINE_VERSIONS();
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.CronSecond = void 0;
    var CronField_1 = require_CronField();
    var MIN_SECOND = 0;
    var MAX_SECOND = 59;
    var SECOND_CHARS = Object.freeze([]);
    var CronSecond = class extends CronField_1.CronField {
      static get min() {
        return MIN_SECOND;
      }
      static get max() {
        return MAX_SECOND;
      }
      static get chars() {
        return SECOND_CHARS;
      }
      /**
       * CronSecond constructor. Initializes the "second" field with the provided values.
       * @param {SixtyRange[]} values - Values for the "second" field
       * @param {CronFieldOptions} [options] - Options provided by the parser
       */
      constructor(values, options) {
        super(values, options);
        this.validate();
      }
      /**
       * Returns an array of allowed values for the "second" field.
       * @returns {SixtyRange[]}
       */
      get values() {
        return super.values;
      }
    };
    exports.CronSecond = CronSecond;
  }
});

// node_modules/cron-parser/dist/fields/index.js
var require_fields = __commonJS({
  "node_modules/cron-parser/dist/fields/index.js"(exports) {
    "use strict";
    init_define_SEI_BUNDLED_ENGINE_VERSIONS();
    var __createBinding = exports && exports.__createBinding || (Object.create ? (function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      var desc = Object.getOwnPropertyDescriptor(m, k);
      if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = { enumerable: true, get: function() {
          return m[k];
        } };
      }
      Object.defineProperty(o, k2, desc);
    }) : (function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      o[k2] = m[k];
    }));
    var __exportStar = exports && exports.__exportStar || function(m, exports2) {
      for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports2, p)) __createBinding(exports2, m, p);
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    __exportStar(require_types(), exports);
    __exportStar(require_CronDayOfMonth(), exports);
    __exportStar(require_CronDayOfWeek(), exports);
    __exportStar(require_CronField(), exports);
    __exportStar(require_CronHour(), exports);
    __exportStar(require_CronMinute(), exports);
    __exportStar(require_CronMonth(), exports);
    __exportStar(require_CronSecond(), exports);
  }
});

// node_modules/cron-parser/dist/CronFieldCollection.js
var require_CronFieldCollection = __commonJS({
  "node_modules/cron-parser/dist/CronFieldCollection.js"(exports) {
    "use strict";
    init_define_SEI_BUNDLED_ENGINE_VERSIONS();
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.CronFieldCollection = void 0;
    var fields_1 = require_fields();
    var CronFieldCollection = class _CronFieldCollection {
      #second;
      #minute;
      #hour;
      #dayOfMonth;
      #month;
      #dayOfWeek;
      /**
       * Creates a new CronFieldCollection instance by partially overriding fields from an existing one.
       * @param {CronFieldCollection} base - The base CronFieldCollection to copy fields from
       * @param {CronFieldOverride} fields - The fields to override, can be CronField instances or raw values
       * @returns {CronFieldCollection} A new CronFieldCollection instance
       * @example
       * const base = new CronFieldCollection({
       *   second: new CronSecond([0]),
       *   minute: new CronMinute([0]),
       *   hour: new CronHour([12]),
       *   dayOfMonth: new CronDayOfMonth([1]),
       *   month: new CronMonth([1]),
       *   dayOfWeek: new CronDayOfWeek([1])
       * });
       *
       * // Using CronField instances
       * const modified1 = CronFieldCollection.from(base, {
       *   hour: new CronHour([15]),
       *   minute: new CronMinute([30])
       * });
       *
       * // Using raw values
       * const modified2 = CronFieldCollection.from(base, {
       *   hour: [15],        // Will create new CronHour
       *   minute: [30]       // Will create new CronMinute
       * });
       */
      static from(base, fields) {
        return new _CronFieldCollection({
          second: this.resolveField(fields_1.CronSecond, base.second, fields.second),
          minute: this.resolveField(fields_1.CronMinute, base.minute, fields.minute),
          hour: this.resolveField(fields_1.CronHour, base.hour, fields.hour),
          dayOfMonth: this.resolveField(fields_1.CronDayOfMonth, base.dayOfMonth, fields.dayOfMonth),
          month: this.resolveField(fields_1.CronMonth, base.month, fields.month),
          dayOfWeek: this.resolveField(fields_1.CronDayOfWeek, base.dayOfWeek, fields.dayOfWeek)
        });
      }
      /**
       * Resolves a field value, either using the provided CronField instance or creating a new one from raw values.
       * @param constructor - The constructor for creating new field instances
       * @param baseField - The base field to use if no override is provided
       * @param fieldValue - The override value, either a CronField instance or raw values
       * @returns The resolved CronField instance
       * @private
       */
      static resolveField(constructor, baseField, fieldValue2) {
        if (!fieldValue2) {
          return baseField;
        }
        if (fieldValue2 instanceof fields_1.CronField) {
          return fieldValue2;
        }
        return new constructor(fieldValue2);
      }
      /**
       * CronFieldCollection constructor. Initializes the cron fields with the provided values.
       * @param {CronFields} param0 - The cron fields values
       * @throws {Error} if validation fails
       * @example
       * const cronFields = new CronFieldCollection({
       *   second: new CronSecond([0]),
       *   minute: new CronMinute([0, 30]),
       *   hour: new CronHour([9]),
       *   dayOfMonth: new CronDayOfMonth([15]),
       *   month: new CronMonth([1]),
       *   dayOfWeek: new CronDayOfTheWeek([1, 2, 3, 4, 5]),
       * })
       *
       * console.log(cronFields.second.values); // [0]
       * console.log(cronFields.minute.values); // [0, 30]
       * console.log(cronFields.hour.values); // [9]
       * console.log(cronFields.dayOfMonth.values); // [15]
       * console.log(cronFields.month.values); // [1]
       * console.log(cronFields.dayOfWeek.values); // [1, 2, 3, 4, 5]
       */
      constructor({ second, minute, hour, dayOfMonth, month, dayOfWeek }) {
        if (!second) {
          throw new Error("Validation error, Field second is missing");
        }
        if (!minute) {
          throw new Error("Validation error, Field minute is missing");
        }
        if (!hour) {
          throw new Error("Validation error, Field hour is missing");
        }
        if (!dayOfMonth) {
          throw new Error("Validation error, Field dayOfMonth is missing");
        }
        if (!month) {
          throw new Error("Validation error, Field month is missing");
        }
        if (!dayOfWeek) {
          throw new Error("Validation error, Field dayOfWeek is missing");
        }
        if (month.values.length === 1 && !dayOfMonth.hasLastChar && dayOfWeek.isWildcard) {
          if (!(parseInt(dayOfMonth.values[0], 10) <= fields_1.CronMonth.daysInMonth[month.values[0] - 1])) {
            throw new Error("Invalid explicit day of month definition");
          }
        }
        this.#second = second;
        this.#minute = minute;
        this.#hour = hour;
        this.#month = month;
        this.#dayOfWeek = dayOfWeek;
        this.#dayOfMonth = dayOfMonth;
      }
      /**
       * Returns the second field.
       * @returns {CronSecond}
       */
      get second() {
        return this.#second;
      }
      /**
       * Returns the minute field.
       * @returns {CronMinute}
       */
      get minute() {
        return this.#minute;
      }
      /**
       * Returns the hour field.
       * @returns {CronHour}
       */
      get hour() {
        return this.#hour;
      }
      /**
       * Returns the day of the month field.
       * @returns {CronDayOfMonth}
       */
      get dayOfMonth() {
        return this.#dayOfMonth;
      }
      /**
       * Returns the month field.
       * @returns {CronMonth}
       */
      get month() {
        return this.#month;
      }
      /**
       * Returns the day of the week field.
       * @returns {CronDayOfWeek}
       */
      get dayOfWeek() {
        return this.#dayOfWeek;
      }
      /**
       * Returns a string representation of the cron fields.
       * @param {(number | CronChars)[]} input - The cron fields values
       * @static
       * @returns {FieldRange[]} - The compacted cron fields
       */
      static compactField(input) {
        if (input.length === 0) {
          return [];
        }
        const output = [];
        let current = void 0;
        input.forEach((item, i, arr) => {
          if (current === void 0) {
            current = { start: item, count: 1 };
            return;
          }
          const prevItem = arr[i - 1] || current.start;
          const nextItem = arr[i + 1];
          if (item === "L" || item === "W") {
            output.push(current);
            output.push({ start: item, count: 1 });
            current = void 0;
            return;
          }
          if (current.step === void 0 && nextItem !== void 0) {
            const step = item - prevItem;
            const nextStep = nextItem - item;
            if (step <= nextStep) {
              current = { ...current, count: 2, end: item, step };
              return;
            }
            current.step = 1;
          }
          if (item - (current.end ?? 0) === current.step) {
            current.count++;
            current.end = item;
          } else {
            if (current.count === 1) {
              output.push({ start: current.start, count: 1 });
            } else if (current.count === 2) {
              output.push({ start: current.start, count: 1 });
              output.push({
                start: current.end ?? /* istanbul ignore next - see above */
                prevItem,
                count: 1
              });
            } else {
              output.push(current);
            }
            current = { start: item, count: 1 };
          }
        });
        if (current) {
          output.push(current);
        }
        return output;
      }
      /**
       * Handles a single range.
       * @param {CronField} field - The cron field to stringify
       * @param {FieldRange} range {start: number, end: number, step: number, count: number} The range to handle.
       * @param {number} max The maximum value for the field.
       * @returns {string | null} The stringified range or null if it cannot be stringified.
       * @private
       */
      static #handleSingleRange(field, range, max) {
        const step = range.step;
        if (!step) {
          return null;
        }
        if (step === 1 && range.start === field.min && range.end && range.end >= max) {
          const isDayField = field instanceof fields_1.CronDayOfMonth || field instanceof fields_1.CronDayOfWeek;
          if (isDayField && !field.isWildcard) {
            return null;
          }
          return field.hasQuestionMarkChar ? "?" : "*";
        }
        if (step !== 1 && range.start === field.min && range.end && range.end >= max - step + 1) {
          return `*/${step}`;
        }
        return null;
      }
      /**
       * Handles multiple ranges.
       * @param {FieldRange} range {start: number, end: number, step: number, count: number} The range to handle.
       * @param {number} max The maximum value for the field.
       * @returns {string} The stringified range.
       * @private
       */
      static #handleMultipleRanges(range, max) {
        const step = range.step;
        if (step === 1) {
          return `${range.start}-${range.end}`;
        }
        const multiplier = range.start === 0 ? range.count - 1 : range.count;
        if (!step) {
          throw new Error("Unexpected range step");
        }
        if (!range.end) {
          throw new Error("Unexpected range end");
        }
        if (step * multiplier > range.end) {
          const mapFn = (_, index) => {
            if (typeof range.start !== "number") {
              throw new Error("Unexpected range start");
            }
            return index % step === 0 ? range.start + index : null;
          };
          if (typeof range.start !== "number") {
            throw new Error("Unexpected range start");
          }
          const seed = { length: range.end - range.start + 1 };
          return Array.from(seed, mapFn).filter((value) => value !== null).join(",");
        }
        return range.end === max - step + 1 ? `${range.start}/${step}` : `${range.start}-${range.end}/${step}`;
      }
      /**
       * Returns a string representation of the cron fields.
       * @param {CronField} field - The cron field to stringify
       * @static
       * @returns {string} - The stringified cron field
       */
      stringifyField(field) {
        let max = field.max;
        let values = field.values;
        if (field instanceof fields_1.CronDayOfWeek) {
          max = 6;
          const dayOfWeek = this.#dayOfWeek.values;
          values = dayOfWeek[dayOfWeek.length - 1] === 7 ? dayOfWeek.slice(0, -1) : dayOfWeek;
        }
        if (field instanceof fields_1.CronDayOfMonth) {
          max = this.#month.values.length === 1 ? fields_1.CronMonth.daysInMonth[this.#month.values[0] - 1] : field.max;
        }
        const ranges = _CronFieldCollection.compactField(values);
        if (ranges.length === 1) {
          const singleRangeResult = _CronFieldCollection.#handleSingleRange(field, ranges[0], max);
          if (singleRangeResult) {
            return singleRangeResult;
          }
        }
        return ranges.map((range) => {
          const value = range.count === 1 ? range.start.toString() : _CronFieldCollection.#handleMultipleRanges(range, max);
          if (field instanceof fields_1.CronDayOfWeek && field.nthDay > 0) {
            return `${value}#${field.nthDay}`;
          }
          return value;
        }).join(",");
      }
      /**
       * Returns a string representation of the cron field values.
       * @param {boolean} includeSeconds - Whether to include seconds in the output
       * @returns {string} The formatted cron string
       */
      stringify(includeSeconds = false) {
        const arr = [];
        if (includeSeconds) {
          arr.push(this.stringifyField(this.#second));
        }
        arr.push(
          this.stringifyField(this.#minute),
          // minute
          this.stringifyField(this.#hour),
          // hour
          this.stringifyField(this.#dayOfMonth),
          // dayOfMonth
          this.stringifyField(this.#month),
          // month
          this.stringifyField(this.#dayOfWeek)
        );
        return arr.join(" ");
      }
      /**
       * Returns a serialized representation of the cron fields values.
       * @returns {SerializedCronFields} An object containing the cron field values
       */
      serialize() {
        return {
          second: this.#second.serialize(),
          minute: this.#minute.serialize(),
          hour: this.#hour.serialize(),
          dayOfMonth: this.#dayOfMonth.serialize(),
          month: this.#month.serialize(),
          dayOfWeek: this.#dayOfWeek.serialize()
        };
      }
    };
    exports.CronFieldCollection = CronFieldCollection;
  }
});

// node_modules/cron-parser/dist/CronExpression.js
var require_CronExpression = __commonJS({
  "node_modules/cron-parser/dist/CronExpression.js"(exports) {
    "use strict";
    init_define_SEI_BUNDLED_ENGINE_VERSIONS();
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.CronExpression = exports.LOOPS_LIMIT_EXCEEDED_ERROR_MESSAGE = exports.TIME_SPAN_OUT_OF_BOUNDS_ERROR_MESSAGE = void 0;
    var CronDate_1 = require_CronDate();
    exports.TIME_SPAN_OUT_OF_BOUNDS_ERROR_MESSAGE = "Out of the time span range";
    exports.LOOPS_LIMIT_EXCEEDED_ERROR_MESSAGE = "Invalid expression, loop limit exceeded";
    var LOOP_LIMIT = 1e4;
    var CronExpression = class _CronExpression {
      #options;
      #tz;
      #currentDate;
      #startDate;
      #endDate;
      #fields;
      #dstTransitionDayKey = null;
      #isDstTransitionDay = false;
      /**
       * Creates a new CronExpression instance.
       *
       * @param {CronFieldCollection} fields - Cron fields.
       * @param {CronExpressionOptions} options - Parser options.
       */
      constructor(fields, options) {
        this.#options = options;
        this.#tz = options.tz;
        this.#startDate = options.startDate ? new CronDate_1.CronDate(options.startDate, this.#tz) : null;
        this.#endDate = options.endDate ? new CronDate_1.CronDate(options.endDate, this.#tz) : null;
        let currentDateValue = options.currentDate ?? options.startDate;
        if (currentDateValue) {
          const tempCurrentDate = new CronDate_1.CronDate(currentDateValue, this.#tz);
          if (this.#startDate && tempCurrentDate.getTime() < this.#startDate.getTime()) {
            currentDateValue = this.#startDate;
          } else if (this.#endDate && tempCurrentDate.getTime() > this.#endDate.getTime()) {
            currentDateValue = this.#endDate;
          }
        }
        this.#currentDate = new CronDate_1.CronDate(currentDateValue, this.#tz);
        this.#fields = fields;
      }
      /**
       * Getter for the cron fields.
       *
       * @returns {CronFieldCollection} Cron fields.
       */
      get fields() {
        return this.#fields;
      }
      /**
       * Converts cron fields back to a CronExpression instance.
       *
       * @public
       * @param {Record<string, number[]>} fields - The input cron fields object.
       * @param {CronExpressionOptions} [options] - Optional parsing options.
       * @returns {CronExpression} - A new CronExpression instance.
       */
      static fieldsToExpression(fields, options) {
        return new _CronExpression(fields, options || {});
      }
      /**
       * Checks if the given value matches any element in the sequence.
       *
       * @param {number} value - The value to be matched.
       * @param {number[]} sequence - The sequence to be checked against.
       * @returns {boolean} - True if the value matches an element in the sequence; otherwise, false.
       * @memberof CronExpression
       * @private
       */
      static #matchSchedule(value, sequence) {
        return sequence.some((element) => element === value);
      }
      /**
       * Returns the minimum or maximum value from the given array of numbers.
       *
       * @param {number[]} values - An array of numbers.
       * @param {boolean} reverse - If true, returns the maximum value; otherwise, returns the minimum value.
       * @returns {number} - The minimum or maximum value.
       */
      #getMinOrMax(values, reverse) {
        return values[reverse ? values.length - 1 : 0];
      }
      /**
       * Checks whether the given date falls on a DST transition day in its timezone.
       *
       * This is used to disable certain “direct set” fast paths on DST days, because setting the hour
       * directly may land on a non-existent or repeated local time. We cache the result per calendar day
       * to keep iteration overhead low.
       *
       * @param {CronDate} currentDate - Date to check (in the cron timezone)
       * @returns {boolean} True when the day has a DST transition
       * @private
       */
      #checkDstTransition(currentDate) {
        const key = `${currentDate.getFullYear()}-${currentDate.getMonth() + 1}-${currentDate.getDate()}`;
        if (this.#dstTransitionDayKey === key) {
          return this.#isDstTransitionDay;
        }
        const startOfDay = new CronDate_1.CronDate(currentDate);
        startOfDay.setStartOfDay();
        const endOfDay = new CronDate_1.CronDate(currentDate);
        endOfDay.setEndOfDay();
        this.#dstTransitionDayKey = key;
        this.#isDstTransitionDay = startOfDay.getUTCOffset() !== endOfDay.getUTCOffset();
        return this.#isDstTransitionDay;
      }
      /**
       * Moves the date to the next/previous allowed second value. If there is no remaining allowed second
       * within the current minute, rolls to the next/previous minute and resets seconds to the min/max allowed.
       *
       * @param {CronDate} currentDate - Mutable date being iterated
       * @param {DateMathOp} dateMathVerb - Add/Subtract depending on direction
       * @param {boolean} reverse - When true, iterating backwards
       * @private
       */
      #moveToNextSecond(currentDate, dateMathVerb, reverse) {
        const seconds = this.#fields.second.values;
        const currentSecond = currentDate.getSeconds();
        const nextSecond = this.#fields.second.findNearestValue(currentSecond, reverse);
        if (nextSecond !== null) {
          currentDate.setSeconds(nextSecond);
          return;
        }
        currentDate.applyDateOperation(dateMathVerb, CronDate_1.TimeUnit.Minute, this.#fields.hour.values.length);
        currentDate.setSeconds(this.#getMinOrMax(seconds, reverse));
      }
      /**
       * Moves the date to the next/previous allowed minute value and resets seconds to the min/max allowed.
       * If there is no remaining allowed minute within the current hour, rolls to the next/previous hour and
       * resets minutes/seconds to their extrema.
       *
       * @param {CronDate} currentDate - Mutable date being iterated
       * @param {DateMathOp} dateMathVerb - Add/Subtract depending on direction
       * @param {boolean} reverse - When true, iterating backwards
       * @private
       */
      #moveToNextMinute(currentDate, dateMathVerb, reverse) {
        const minutes = this.#fields.minute.values;
        const seconds = this.#fields.second.values;
        const currentMinute = currentDate.getMinutes();
        const nextMinute = this.#fields.minute.findNearestValue(currentMinute, reverse);
        if (nextMinute !== null) {
          currentDate.setMinutes(nextMinute);
          currentDate.setSeconds(this.#getMinOrMax(seconds, reverse));
          return;
        }
        currentDate.applyDateOperation(dateMathVerb, CronDate_1.TimeUnit.Hour, this.#fields.hour.values.length);
        currentDate.setMinutes(this.#getMinOrMax(minutes, reverse));
        currentDate.setSeconds(this.#getMinOrMax(seconds, reverse));
      }
      /**
       * Determines if the current date matches the last specified weekday of the month.
       *
       * @param {Array<(number|string)>} expressions - An array of expressions containing weekdays and "L" for the last weekday.
       * @param {CronDate} currentDate - The current date object.
       * @returns {boolean} - True if the current date matches the last specified weekday of the month; otherwise, false.
       * @memberof CronExpression
       * @private
       */
      static #isLastWeekdayOfMonthMatch(expressions, currentDate) {
        if (!currentDate.isLastWeekdayOfMonth()) {
          return false;
        }
        const day = currentDate.getDay();
        return expressions.some((expression) => day === parseInt(expression.toString().charAt(0), 10) % 7);
      }
      /**
       * Determines if the current date matches the nth occurrence of a weekday in the month.
       *
       * @param {number} nthDay - The nth occurrence (1-5) from a `#` expression; values <= 0 mean no nth constraint.
       * @param {CronDate} currentDate - The current date object.
       * @returns {boolean} - True if there is no nth constraint, or the current date is the nth occurrence of its weekday; otherwise, false.
       * @memberof CronExpression
       * @private
       */
      static #isNthWeekdayOfMonthMatch(nthDay, currentDate) {
        return nthDay <= 0 || Math.ceil(currentDate.getDate() / 7) === nthDay;
      }
      /**
       * Find the next scheduled date based on the cron expression.
       * @returns {CronDate} - The next scheduled date or an ES6 compatible iterator object.
       * @memberof CronExpression
       * @public
       */
      next() {
        return this.#findSchedule();
      }
      /**
       * Find the previous scheduled date based on the cron expression.
       * @returns {CronDate} - The previous scheduled date or an ES6 compatible iterator object.
       * @memberof CronExpression
       * @public
       */
      prev() {
        return this.#findSchedule(true);
      }
      /**
       * Check if there is a next scheduled date based on the current date and cron expression.
       * @returns {boolean} - Returns true if there is a next scheduled date, false otherwise.
       * @memberof CronExpression
       * @public
       */
      hasNext() {
        const current = this.#currentDate;
        try {
          this.#findSchedule();
          return true;
        } catch {
          return false;
        } finally {
          this.#currentDate = current;
        }
      }
      /**
       * Check if there is a previous scheduled date based on the current date and cron expression.
       * @returns {boolean} - Returns true if there is a previous scheduled date, false otherwise.
       * @memberof CronExpression
       * @public
       */
      hasPrev() {
        const current = this.#currentDate;
        try {
          this.#findSchedule(true);
          return true;
        } catch {
          return false;
        } finally {
          this.#currentDate = current;
        }
      }
      /**
       * Iterate over a specified number of steps and optionally execute a callback function for each step.
       * @param {number} steps - The number of steps to iterate. Positive value iterates forward, negative value iterates backward.
       * @returns {CronDate[]} - An array of iterator fields or CronDate objects.
       * @memberof CronExpression
       * @public
       */
      take(limit) {
        const items = [];
        if (limit >= 0) {
          for (let i = 0; i < limit; i++) {
            try {
              items.push(this.next());
            } catch {
              return items;
            }
          }
        } else {
          for (let i = 0; i > limit; i--) {
            try {
              items.push(this.prev());
            } catch {
              return items;
            }
          }
        }
        return items;
      }
      /**
       * Reset the iterators current date to a new date or the initial date.
       * @param {Date | CronDate} [newDate] - Optional new date to reset to. If not provided, it will reset to the initial date.
       * @memberof CronExpression
       * @public
       */
      reset(newDate) {
        this.#currentDate = new CronDate_1.CronDate(newDate || this.#options.currentDate, this.#tz);
      }
      /**
       * Generate a string representation of the cron expression.
       * @param {boolean} [includeSeconds=false] - Whether to include the seconds field in the string representation.
       * @returns {string} - The string representation of the cron expression.
       * @memberof CronExpression
       * @public
       */
      stringify(includeSeconds = false) {
        return this.#fields.stringify(includeSeconds);
      }
      /**
       * Check if the cron expression includes the given date
       * @param {Date|CronDate} date
       * @returns {boolean}
       */
      includesDate(date) {
        const { second, minute, hour, month } = this.#fields;
        const dt = new CronDate_1.CronDate(date, this.#tz);
        if (!second.values.includes(dt.getSeconds()) || !minute.values.includes(dt.getMinutes()) || !hour.values.includes(dt.getHours()) || !month.values.includes(dt.getMonth() + 1)) {
          return false;
        }
        if (!this.#matchDayOfMonth(dt)) {
          return false;
        }
        return true;
      }
      /**
       * Returns the string representation of the cron expression.
       * @returns {CronDate} - The next schedule date.
       */
      toString() {
        return this.#options.expression || this.stringify(true);
      }
      /**
       * Determines if the given date matches the cron expression's day of month and day of week fields.
       *
       * The function checks the following rules:
       * Rule 1: If both "day of month" and "day of week" are restricted (not wildcard), then one or both must match the current day.
       * Rule 2: If "day of month" is restricted and "day of week" is not restricted, then "day of month" must match the current day.
       * Rule 3: If "day of month" is a wildcard, "day of week" is not a wildcard, and "day of week" matches the current day, then the match is accepted.
       * In all rules, a "day of week" match also honors an nth-occurrence (`#`) constraint (e.g. `5#3` = the 3rd Friday) and the last-weekday (`L`) form.
       * If none of the rules match, the match is rejected.
       *
       * @param {CronDate} currentDate - The current date to be evaluated against the cron expression.
       * @returns {boolean} Returns true if the current date matches the cron expression's day of month and day of week fields, otherwise false.
       * @memberof CronExpression
       * @private
       */
      #matchDayOfMonth(currentDate) {
        const isDayOfMonthWildcardMatch = this.#fields.dayOfMonth.isWildcard;
        const isRestrictedDayOfMonth = !isDayOfMonthWildcardMatch;
        const isDayOfWeekWildcardMatch = this.#fields.dayOfWeek.isWildcard;
        const isRestrictedDayOfWeek = !isDayOfWeekWildcardMatch;
        const matchedDOM = _CronExpression.#matchSchedule(currentDate.getDate(), this.#fields.dayOfMonth.values) || this.#fields.dayOfMonth.hasLastChar && currentDate.isLastDayOfMonth();
        const nthDay = this.#fields.dayOfWeek.nthDay;
        const matchedDOW = _CronExpression.#matchSchedule(currentDate.getDay(), this.#fields.dayOfWeek.values) && _CronExpression.#isNthWeekdayOfMonthMatch(nthDay, currentDate) || this.#fields.dayOfWeek.hasLastChar && _CronExpression.#isLastWeekdayOfMonthMatch(this.#fields.dayOfWeek.values, currentDate);
        if (isRestrictedDayOfMonth && isRestrictedDayOfWeek && (matchedDOM || matchedDOW)) {
          return true;
        }
        if (matchedDOM && !isRestrictedDayOfWeek) {
          return true;
        }
        if (isDayOfMonthWildcardMatch && !isDayOfWeekWildcardMatch && matchedDOW) {
          return true;
        }
        return false;
      }
      /**
       * Determines if the current hour matches the cron expression.
       *
       * @param {CronDate} currentDate - The current date object.
       * @param {DateMathOp} dateMathVerb - The date math operation enumeration value.
       * @param {boolean} reverse - A flag indicating whether the matching should be done in reverse order.
       * @returns {boolean} - True if the current hour matches the cron expression; otherwise, false.
       */
      #matchHour(currentDate, dateMathVerb, reverse) {
        const hourValues = this.#fields.hour.values;
        const hours = hourValues;
        const currentHour = currentDate.getHours();
        const isMatch = _CronExpression.#matchSchedule(currentHour, hourValues);
        const isDstEnd = currentDate.dstEnd === currentHour;
        if (currentDate.dstStart !== null && currentDate.dstStart === currentHour - 1) {
          if (_CronExpression.#matchSchedule(currentDate.dstStart, hourValues)) {
            return true;
          }
        }
        if (isDstEnd && !reverse) {
          currentDate.dstEnd = null;
          currentDate.applyDateOperation(CronDate_1.DateMathOp.Add, CronDate_1.TimeUnit.Hour, hours.length);
          return false;
        }
        if (isMatch) {
          return true;
        }
        currentDate.dstStart = null;
        const nextHour = this.#fields.hour.findNearestValue(currentHour, reverse);
        if (nextHour === null) {
          currentDate.applyDateOperation(dateMathVerb, CronDate_1.TimeUnit.Day, hours.length);
          return false;
        }
        if (this.#checkDstTransition(currentDate)) {
          const steps = reverse ? currentHour - nextHour : nextHour - currentHour;
          for (let i = 0; i < steps; i++) {
            currentDate.applyDateOperation(dateMathVerb, CronDate_1.TimeUnit.Hour, hours.length);
            if (!reverse && currentDate.getHours() >= nextHour)
              break;
            if (reverse && currentDate.getHours() <= nextHour)
              break;
          }
        } else {
          currentDate.setHours(nextHour);
        }
        currentDate.setMinutes(this.#getMinOrMax(this.#fields.minute.values, reverse));
        currentDate.setSeconds(this.#getMinOrMax(this.#fields.second.values, reverse));
        return false;
      }
      /**
       * Validates the current date against the start and end dates of the cron expression.
       * If the current date is outside the specified time span, an error is thrown.
       *
       * @param currentDate {CronDate} - The current date to validate.
       * @throws {Error} If the current date is outside the specified time span.
       * @private
       */
      #validateTimeSpan(currentDate) {
        if (!this.#startDate && !this.#endDate) {
          return;
        }
        const currentTime = currentDate.getTime();
        if (this.#startDate && currentTime < this.#startDate.getTime()) {
          throw new Error(exports.TIME_SPAN_OUT_OF_BOUNDS_ERROR_MESSAGE);
        }
        if (this.#endDate && currentTime > this.#endDate.getTime()) {
          throw new Error(exports.TIME_SPAN_OUT_OF_BOUNDS_ERROR_MESSAGE);
        }
      }
      /**
       * Finds the next or previous schedule based on the cron expression.
       *
       * @param {boolean} [reverse=false] - If true, finds the previous schedule; otherwise, finds the next schedule.
       * @returns {CronDate} - The next or previous schedule date.
       * @private
       */
      #findSchedule(reverse = false) {
        const dateMathVerb = reverse ? CronDate_1.DateMathOp.Subtract : CronDate_1.DateMathOp.Add;
        const currentDate = new CronDate_1.CronDate(this.#currentDate);
        const startTimestamp = currentDate.getTime();
        if (currentDate.getMilliseconds() > 0) {
          currentDate.setMilliseconds(0);
          if (!reverse) {
            currentDate.applyDateOperation(CronDate_1.DateMathOp.Add, CronDate_1.TimeUnit.Second, this.#fields.hour.values.length);
          }
        }
        let stepCount = 0;
        while (++stepCount < LOOP_LIMIT) {
          this.#validateTimeSpan(currentDate);
          if (!this.#matchDayOfMonth(currentDate)) {
            currentDate.applyDateOperation(dateMathVerb, CronDate_1.TimeUnit.Day, this.#fields.hour.values.length);
            continue;
          }
          if (!_CronExpression.#matchSchedule(currentDate.getMonth() + 1, this.#fields.month.values)) {
            currentDate.applyDateOperation(dateMathVerb, CronDate_1.TimeUnit.Month, this.#fields.hour.values.length);
            continue;
          }
          if (!this.#matchHour(currentDate, dateMathVerb, reverse)) {
            continue;
          }
          if (!_CronExpression.#matchSchedule(currentDate.getMinutes(), this.#fields.minute.values)) {
            this.#moveToNextMinute(currentDate, dateMathVerb, reverse);
            continue;
          }
          if (!_CronExpression.#matchSchedule(currentDate.getSeconds(), this.#fields.second.values)) {
            this.#moveToNextSecond(currentDate, dateMathVerb, reverse);
            continue;
          }
          if (startTimestamp === currentDate.getTime()) {
            currentDate.applyDateOperation(dateMathVerb, CronDate_1.TimeUnit.Second, this.#fields.hour.values.length);
            continue;
          }
          break;
        }
        if (stepCount >= LOOP_LIMIT) {
          throw new Error(exports.LOOPS_LIMIT_EXCEEDED_ERROR_MESSAGE);
        }
        this.#currentDate = currentDate;
        return currentDate;
      }
      /**
       * Returns an iterator for iterating through future CronDate instances
       *
       * @name Symbol.iterator
       * @memberof CronExpression
       * @returns {Iterator<CronDate>} An iterator object for CronExpression that returns CronDate values.
       */
      [Symbol.iterator]() {
        return {
          next: () => {
            try {
              const schedule = this.#findSchedule();
              return { value: schedule, done: false };
            } catch {
              return { value: void 0, done: true };
            }
          }
        };
      }
    };
    exports.CronExpression = CronExpression;
    exports.default = CronExpression;
  }
});

// node_modules/cron-parser/dist/utils/random.js
var require_random = __commonJS({
  "node_modules/cron-parser/dist/utils/random.js"(exports) {
    "use strict";
    init_define_SEI_BUNDLED_ENGINE_VERSIONS();
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.seededRandom = seededRandom;
    function xfnv1a(str) {
      let h = 2166136261 >>> 0;
      for (let i = 0; i < str.length; i++) {
        h ^= str.charCodeAt(i);
        h = Math.imul(h, 16777619);
      }
      return () => h >>> 0;
    }
    function mulberry32(seed) {
      return () => {
        let t = seed += 1831565813;
        t = Math.imul(t ^ t >>> 15, t | 1);
        t ^= t + Math.imul(t ^ t >>> 7, t | 61);
        return ((t ^ t >>> 14) >>> 0) / 4294967296;
      };
    }
    function seededRandom(str) {
      const seed = str ? xfnv1a(str)() : Math.floor(Math.random() * 1e10);
      return mulberry32(seed);
    }
  }
});

// node_modules/cron-parser/dist/CronExpressionParser.js
var require_CronExpressionParser = __commonJS({
  "node_modules/cron-parser/dist/CronExpressionParser.js"(exports) {
    "use strict";
    init_define_SEI_BUNDLED_ENGINE_VERSIONS();
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.CronExpressionParser = exports.DayOfWeek = exports.Months = exports.CronUnit = exports.PredefinedExpressions = void 0;
    var CronFieldCollection_1 = require_CronFieldCollection();
    var CronExpression_1 = require_CronExpression();
    var random_1 = require_random();
    var fields_1 = require_fields();
    var PredefinedExpressions;
    (function(PredefinedExpressions2) {
      PredefinedExpressions2["@yearly"] = "0 0 0 1 1 *";
      PredefinedExpressions2["@annually"] = "0 0 0 1 1 *";
      PredefinedExpressions2["@monthly"] = "0 0 0 1 * *";
      PredefinedExpressions2["@weekly"] = "0 0 0 * * 0";
      PredefinedExpressions2["@daily"] = "0 0 0 * * *";
      PredefinedExpressions2["@hourly"] = "0 0 * * * *";
      PredefinedExpressions2["@minutely"] = "0 * * * * *";
      PredefinedExpressions2["@secondly"] = "* * * * * *";
      PredefinedExpressions2["@weekdays"] = "0 0 0 * * 1-5";
      PredefinedExpressions2["@weekends"] = "0 0 0 * * 0,6";
    })(PredefinedExpressions || (exports.PredefinedExpressions = PredefinedExpressions = {}));
    var CronUnit;
    (function(CronUnit2) {
      CronUnit2["Second"] = "Second";
      CronUnit2["Minute"] = "Minute";
      CronUnit2["Hour"] = "Hour";
      CronUnit2["DayOfMonth"] = "DayOfMonth";
      CronUnit2["Month"] = "Month";
      CronUnit2["DayOfWeek"] = "DayOfWeek";
    })(CronUnit || (exports.CronUnit = CronUnit = {}));
    var Months;
    (function(Months2) {
      Months2[Months2["jan"] = 1] = "jan";
      Months2[Months2["feb"] = 2] = "feb";
      Months2[Months2["mar"] = 3] = "mar";
      Months2[Months2["apr"] = 4] = "apr";
      Months2[Months2["may"] = 5] = "may";
      Months2[Months2["jun"] = 6] = "jun";
      Months2[Months2["jul"] = 7] = "jul";
      Months2[Months2["aug"] = 8] = "aug";
      Months2[Months2["sep"] = 9] = "sep";
      Months2[Months2["oct"] = 10] = "oct";
      Months2[Months2["nov"] = 11] = "nov";
      Months2[Months2["dec"] = 12] = "dec";
    })(Months || (exports.Months = Months = {}));
    var DayOfWeek;
    (function(DayOfWeek2) {
      DayOfWeek2[DayOfWeek2["sun"] = 0] = "sun";
      DayOfWeek2[DayOfWeek2["mon"] = 1] = "mon";
      DayOfWeek2[DayOfWeek2["tue"] = 2] = "tue";
      DayOfWeek2[DayOfWeek2["wed"] = 3] = "wed";
      DayOfWeek2[DayOfWeek2["thu"] = 4] = "thu";
      DayOfWeek2[DayOfWeek2["fri"] = 5] = "fri";
      DayOfWeek2[DayOfWeek2["sat"] = 6] = "sat";
    })(DayOfWeek || (exports.DayOfWeek = DayOfWeek = {}));
    var CronExpressionParser2 = class _CronExpressionParser {
      /**
       * Parses a cron expression and returns a CronExpression object.
       * @param {string} expression - The cron expression to parse.
       * @param {CronExpressionOptions} [options={}] - The options to use when parsing the expression.
       * @param {boolean} [options.strict=false] - If true, will throw an error if the expression contains both dayOfMonth and dayOfWeek.
       * @param {CronDate} [options.currentDate=new CronDate(undefined, 'UTC')] - The date to use when calculating the next/previous occurrence.
       *
       * @returns {CronExpression} A CronExpression object.
       */
      static parse(expression, options = {}) {
        const { strict = false, hashSeed } = options;
        const rand = (0, random_1.seededRandom)(hashSeed);
        expression = PredefinedExpressions[expression] || expression;
        const rawFields = _CronExpressionParser.#getRawFields(expression, strict);
        if (!(rawFields.dayOfMonth === "*" || rawFields.dayOfWeek === "*" || !strict)) {
          throw new Error("Cannot use both dayOfMonth and dayOfWeek together in strict mode!");
        }
        const second = _CronExpressionParser.#parseField(CronUnit.Second, rawFields.second, fields_1.CronSecond.constraints, rand);
        const minute = _CronExpressionParser.#parseField(CronUnit.Minute, rawFields.minute, fields_1.CronMinute.constraints, rand);
        const hour = _CronExpressionParser.#parseField(CronUnit.Hour, rawFields.hour, fields_1.CronHour.constraints, rand);
        const month = _CronExpressionParser.#parseField(CronUnit.Month, rawFields.month, fields_1.CronMonth.constraints, rand);
        const dayOfMonth = _CronExpressionParser.#parseField(CronUnit.DayOfMonth, rawFields.dayOfMonth, fields_1.CronDayOfMonth.constraints, rand);
        const { dayOfWeek: _dayOfWeek, nthDayOfWeek } = _CronExpressionParser.#parseNthDay(rawFields.dayOfWeek);
        const dayOfWeek = _CronExpressionParser.#parseField(CronUnit.DayOfWeek, _dayOfWeek, fields_1.CronDayOfWeek.constraints, rand);
        const fields = new CronFieldCollection_1.CronFieldCollection({
          second: new fields_1.CronSecond(second, { rawValue: rawFields.second }),
          minute: new fields_1.CronMinute(minute, { rawValue: rawFields.minute }),
          hour: new fields_1.CronHour(hour, { rawValue: rawFields.hour }),
          dayOfMonth: fields_1.CronDayOfMonth.fromMonth(month, dayOfMonth, { rawValue: rawFields.dayOfMonth }),
          month: new fields_1.CronMonth(month, { rawValue: rawFields.month }),
          dayOfWeek: new fields_1.CronDayOfWeek(dayOfWeek, { rawValue: rawFields.dayOfWeek, nthDayOfWeek })
        });
        return new CronExpression_1.CronExpression(fields, { ...options, expression });
      }
      /**
       * Get the raw fields from a cron expression.
       * @param {string} expression - The cron expression to parse.
       * @param {boolean} strict - If true, will throw an error if the expression contains both dayOfMonth and dayOfWeek.
       * @private
       * @returns {RawCronFields} The raw fields.
       */
      static #getRawFields(expression, strict) {
        if (strict && !expression.length) {
          throw new Error("Invalid cron expression");
        }
        expression = expression || "0 * * * * *";
        const atoms = expression.trim().split(/\s+/);
        if (strict && atoms.length < 6) {
          throw new Error("Invalid cron expression, expected 6 fields");
        }
        if (atoms.length > 6) {
          throw new Error("Invalid cron expression, too many fields");
        }
        const defaults = ["*", "*", "*", "*", "*", "0"];
        if (atoms.length < defaults.length) {
          atoms.unshift(...defaults.slice(atoms.length));
        }
        const [second, minute, hour, dayOfMonth, month, dayOfWeek] = atoms;
        return { second, minute, hour, dayOfMonth, month, dayOfWeek };
      }
      /**
       * Parse a field from a cron expression.
       * @param {CronUnit} field - The field to parse.
       * @param {string} value - The value of the field.
       * @param {CronConstraints} constraints - The constraints for the field.
       * @private
       * @returns {(number | string)[]} The parsed field.
       */
      static #parseField(field, value, constraints, rand) {
        if (field === CronUnit.Month || field === CronUnit.DayOfWeek) {
          value = value.replace(/[a-z]{3}/gi, (match) => {
            match = match.toLowerCase();
            const replacer = Months[match] || DayOfWeek[match];
            if (replacer === void 0) {
              throw new Error(`Validation error, cannot resolve alias "${match}"`);
            }
            return replacer.toString();
          });
        }
        if (!constraints.validChars.test(value)) {
          throw new Error(`Invalid characters, got value: ${value}`);
        }
        value = this.#parseWildcard(value, constraints);
        value = this.#parseHashed(value, constraints, rand);
        return this.#parseSequence(field, value, constraints);
      }
      /**
       * Parse a wildcard from a cron expression.
       * @param {string} value - The value to parse.
       * @param {CronConstraints} constraints - The constraints for the field.
       * @private
       */
      static #parseWildcard(value, constraints) {
        return value.replace(/[*?]/g, constraints.min + "-" + constraints.max);
      }
      /**
       * Parse a hashed value from a cron expression.
       * @param {string} value - The value to parse.
       * @param {CronConstraints} constraints - The constraints for the field.
       * @param {PRNG} rand - The random number generator to use.
       * @private
       */
      static #parseHashed(value, constraints, rand) {
        const randomValue = rand();
        return value.replace(/H(?:\((\d+)-(\d+)\))?(?:\/(\d+))?/g, (_, min, max, step) => {
          if (min && max && step) {
            const minNum = parseInt(min, 10);
            const maxNum = parseInt(max, 10);
            const stepNum = parseInt(step, 10);
            if (minNum > maxNum) {
              throw new Error(`Invalid range: ${minNum}-${maxNum}, min > max`);
            }
            if (stepNum <= 0) {
              throw new Error(`Invalid step: ${stepNum}, must be positive`);
            }
            const minStart = Math.max(minNum, constraints.min);
            const offset = Math.floor(randomValue * stepNum);
            const values = [];
            for (let i = Math.floor(minStart / stepNum) * stepNum + offset; i <= maxNum; i += stepNum) {
              if (i >= minStart) {
                values.push(i);
              }
            }
            return values.join(",");
          } else if (min && max) {
            const minNum = parseInt(min, 10);
            const maxNum = parseInt(max, 10);
            if (minNum > maxNum) {
              throw new Error(`Invalid range: ${minNum}-${maxNum}, min > max`);
            }
            return String(Math.floor(randomValue * (maxNum - minNum + 1)) + minNum);
          } else if (step) {
            const stepNum = parseInt(step, 10);
            if (stepNum <= 0) {
              throw new Error(`Invalid step: ${stepNum}, must be positive`);
            }
            const offset = Math.floor(randomValue * stepNum);
            const values = [];
            for (let i = Math.floor(constraints.min / stepNum) * stepNum + offset; i <= constraints.max; i += stepNum) {
              if (i >= constraints.min) {
                values.push(i);
              }
            }
            return values.join(",");
          } else {
            return String(Math.floor(randomValue * (constraints.max - constraints.min + 1) + constraints.min));
          }
        });
      }
      /**
       * Parse a sequence from a cron expression.
       * @param {CronUnit} field - The field to parse.
       * @param {string} val - The sequence to parse.
       * @param {CronConstraints} constraints - The constraints for the field.
       * @private
       */
      static #parseSequence(field, val, constraints) {
        const stack = [];
        function handleResult(result, constraints2) {
          if (Array.isArray(result)) {
            stack.push(...result);
          } else {
            if (_CronExpressionParser.#isValidConstraintChar(constraints2, result)) {
              stack.push(result);
            } else {
              const v = parseInt(result.toString(), 10);
              const isValid = v >= constraints2.min && v <= constraints2.max;
              if (!isValid) {
                throw new Error(`Constraint error, got value ${result} expected range ${constraints2.min}-${constraints2.max}`);
              }
              stack.push(field === CronUnit.DayOfWeek ? v % 7 : result);
            }
          }
        }
        const atoms = val.split(",");
        atoms.forEach((atom) => {
          if (!(atom.length > 0)) {
            throw new Error("Invalid list value format");
          }
          handleResult(_CronExpressionParser.#parseRepeat(field, atom, constraints), constraints);
        });
        return stack;
      }
      /**
       * Parse repeat from a cron expression.
       * @param {CronUnit} field - The field to parse.
       * @param {string} val - The repeat to parse.
       * @param {CronConstraints} constraints - The constraints for the field.
       * @private
       * @returns {(number | string)[]} The parsed repeat.
       */
      static #parseRepeat(field, val, constraints) {
        const atoms = val.split("/");
        if (atoms.length > 2) {
          throw new Error(`Invalid repeat: ${val}`);
        }
        if (atoms.length === 2) {
          if (!atoms[0].includes("-")) {
            atoms[0] = `${atoms[0]}-${constraints.max}`;
          }
          return _CronExpressionParser.#parseRange(field, atoms[0], parseInt(atoms[1], 10), constraints);
        }
        return _CronExpressionParser.#parseRange(field, val, 1, constraints);
      }
      /**
       * Validate a cron range.
       * @param {number} min - The minimum value of the range.
       * @param {number} max - The maximum value of the range.
       * @param {CronConstraints} constraints - The constraints for the field.
       * @private
       * @returns {void}
       * @throws {Error} Throws an error if the range is invalid.
       */
      static #validateRange(min, max, constraints) {
        const isValid = !isNaN(min) && !isNaN(max) && min >= constraints.min && max <= constraints.max;
        if (!isValid) {
          throw new Error(`Constraint error, got range ${min}-${max} expected range ${constraints.min}-${constraints.max}`);
        }
        if (min > max) {
          throw new Error(`Invalid range: ${min}-${max}, min(${min}) > max(${max})`);
        }
      }
      /**
       * Validate a cron repeat interval.
       * @param {number} repeatInterval - The repeat interval to validate.
       * @private
       * @returns {void}
       * @throws {Error} Throws an error if the repeat interval is invalid.
       */
      static #validateRepeatInterval(repeatInterval) {
        if (!(!isNaN(repeatInterval) && repeatInterval > 0)) {
          throw new Error(`Constraint error, cannot repeat at every ${repeatInterval} time.`);
        }
      }
      /**
       * Create a range from a cron expression.
       * @param {CronUnit} field - The field to parse.
       * @param {number} min - The minimum value of the range.
       * @param {number} max - The maximum value of the range.
       * @param {number} repeatInterval - The repeat interval of the range.
       * @private
       * @returns {number[]} The created range.
       */
      static #createRange(field, min, max, repeatInterval) {
        const stack = [];
        if (field === CronUnit.DayOfWeek && max % 7 === 0 && (max - min) % repeatInterval === 0) {
          stack.push(0);
        }
        for (let index = min; index <= max; index += repeatInterval) {
          if (stack.indexOf(index) === -1) {
            stack.push(index);
          }
        }
        return stack;
      }
      /**
       * Parse a range from a cron expression.
       * @param {CronUnit} field - The field to parse.
       * @param {string} val - The range to parse.
       * @param {number} repeatInterval - The repeat interval of the range.
       * @param {CronConstraints} constraints - The constraints for the field.
       * @private
       * @returns {number[] | string[] | number | string} The parsed range.
       */
      static #parseRange(field, val, repeatInterval, constraints) {
        const atoms = val.split("-");
        if (atoms.length <= 1) {
          return isNaN(+val) ? val : +val;
        }
        const [min, max] = atoms.map((num) => parseInt(num, 10));
        this.#validateRange(min, max, constraints);
        this.#validateRepeatInterval(repeatInterval);
        return this.#createRange(field, min, max, repeatInterval);
      }
      /**
       * Parse a cron expression.
       * @param {string} val - The cron expression to parse.
       * @private
       * @returns {string} The parsed cron expression.
       */
      static #parseNthDay(val) {
        const atoms = val.split("#");
        if (atoms.length <= 1) {
          return { dayOfWeek: atoms[0] };
        }
        const nthValue = +atoms[atoms.length - 1];
        const matches = val.match(/([,\-/])/);
        if (matches !== null) {
          throw new Error(`Constraint error, invalid dayOfWeek \`#\` and \`${matches?.[0]}\` special characters are incompatible`);
        }
        if (!(atoms.length <= 2 && !isNaN(nthValue) && nthValue >= 1 && nthValue <= 5)) {
          throw new Error("Constraint error, invalid dayOfWeek occurrence number (#)");
        }
        return { dayOfWeek: atoms[0], nthDayOfWeek: nthValue };
      }
      /**
       * Checks if a character is valid for a field.
       * @param {CronConstraints} constraints - The constraints for the field.
       * @param {string | number} value - The value to check.
       * @private
       * @returns {boolean} Whether the character is valid for the field.
       */
      static #isValidConstraintChar(constraints, value) {
        return constraints.chars.some((char) => value.toString().includes(char));
      }
    };
    exports.CronExpressionParser = CronExpressionParser2;
  }
});

// node_modules/cron-parser/dist/CronFileParser.js
var require_CronFileParser = __commonJS({
  "node_modules/cron-parser/dist/CronFileParser.js"(exports) {
    "use strict";
    init_define_SEI_BUNDLED_ENGINE_VERSIONS();
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.CronFileParser = void 0;
    var CronExpressionParser_1 = require_CronExpressionParser();
    var CronFileParser = class _CronFileParser {
      /**
       * Parse a crontab file asynchronously
       * @param filePath Path to crontab file
       * @returns Promise resolving to parse results
       * @throws If file cannot be read
       */
      static async parseFile(filePath) {
        const { readFile } = __require("fs/promises");
        const data = await readFile(filePath, "utf8");
        return _CronFileParser.#parseContent(data);
      }
      /**
       * Parse a crontab file synchronously
       * @param filePath Path to crontab file
       * @returns Parse results
       * @throws If file cannot be read
       */
      static parseFileSync(filePath) {
        const { readFileSync: readFileSync2 } = __require("fs");
        const data = readFileSync2(filePath, "utf8");
        return _CronFileParser.#parseContent(data);
      }
      /**
       * Internal method to parse crontab file content
       * @private
       */
      static #parseContent(data) {
        const blocks = data.split("\n");
        const result = {
          variables: {},
          expressions: [],
          errors: {}
        };
        for (const block of blocks) {
          const entry = block.trim();
          if (entry.length === 0 || entry.startsWith("#")) {
            continue;
          }
          const variableMatch = entry.match(/^(.*)=(.*)$/);
          if (variableMatch) {
            const [, key, value] = variableMatch;
            result.variables[key] = value.replace(/["']/g, "");
            continue;
          }
          try {
            const parsedEntry = _CronFileParser.#parseEntry(entry);
            result.expressions.push(parsedEntry.interval);
          } catch (err) {
            result.errors[entry] = err;
          }
        }
        return result;
      }
      /**
       * Parse a single crontab entry
       * @private
       */
      static #parseEntry(entry) {
        const atoms = entry.split(" ");
        return {
          interval: CronExpressionParser_1.CronExpressionParser.parse(atoms.slice(0, 5).join(" ")),
          command: atoms.slice(5, atoms.length)
        };
      }
    };
    exports.CronFileParser = CronFileParser;
  }
});

// node_modules/cron-parser/dist/index.js
var require_dist2 = __commonJS({
  "node_modules/cron-parser/dist/index.js"(exports) {
    "use strict";
    init_define_SEI_BUNDLED_ENGINE_VERSIONS();
    var __createBinding = exports && exports.__createBinding || (Object.create ? (function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      var desc = Object.getOwnPropertyDescriptor(m, k);
      if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = { enumerable: true, get: function() {
          return m[k];
        } };
      }
      Object.defineProperty(o, k2, desc);
    }) : (function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      o[k2] = m[k];
    }));
    var __exportStar = exports && exports.__exportStar || function(m, exports2) {
      for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports2, p)) __createBinding(exports2, m, p);
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.CronFileParser = exports.CronExpressionParser = exports.CronExpression = exports.CronFieldCollection = exports.CronDate = void 0;
    var CronExpressionParser_1 = require_CronExpressionParser();
    var CronDate_1 = require_CronDate();
    Object.defineProperty(exports, "CronDate", { enumerable: true, get: function() {
      return CronDate_1.CronDate;
    } });
    var CronFieldCollection_1 = require_CronFieldCollection();
    Object.defineProperty(exports, "CronFieldCollection", { enumerable: true, get: function() {
      return CronFieldCollection_1.CronFieldCollection;
    } });
    var CronExpression_1 = require_CronExpression();
    Object.defineProperty(exports, "CronExpression", { enumerable: true, get: function() {
      return CronExpression_1.CronExpression;
    } });
    var CronExpressionParser_2 = require_CronExpressionParser();
    Object.defineProperty(exports, "CronExpressionParser", { enumerable: true, get: function() {
      return CronExpressionParser_2.CronExpressionParser;
    } });
    var CronFileParser_1 = require_CronFileParser();
    Object.defineProperty(exports, "CronFileParser", { enumerable: true, get: function() {
      return CronFileParser_1.CronFileParser;
    } });
    __exportStar(require_fields(), exports);
    exports.default = CronExpressionParser_1.CronExpressionParser;
  }
});

// node_modules/iso8601-duration/lib/index.js
var require_lib = __commonJS({
  "node_modules/iso8601-duration/lib/index.js"(exports) {
    "use strict";
    init_define_SEI_BUNDLED_ENGINE_VERSIONS();
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.toSeconds = exports.end = exports.parse = exports.pattern = void 0;
    var numbers = "\\d+";
    var fractionalNumbers = "".concat(numbers, "(?:[\\.,]").concat(numbers, ")?");
    var datePattern = "(".concat(numbers, "Y)?(").concat(numbers, "M)?(").concat(numbers, "W)?(").concat(numbers, "D)?");
    var timePattern = "T(".concat(fractionalNumbers, "H)?(").concat(fractionalNumbers, "M)?(").concat(fractionalNumbers, "S)?");
    var iso8601 = "P(?:".concat(datePattern, "(?:").concat(timePattern, ")?)");
    var objMap = [
      "years",
      "months",
      "weeks",
      "days",
      "hours",
      "minutes",
      "seconds"
    ];
    var defaultDuration = Object.freeze({
      years: 0,
      months: 0,
      weeks: 0,
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0
    });
    exports.pattern = new RegExp(iso8601);
    var parse5 = function(durationString) {
      var matches = durationString.replace(/,/g, ".").match(exports.pattern);
      if (!matches) {
        throw new RangeError("invalid duration: ".concat(durationString));
      }
      var slicedMatches = matches.slice(1);
      if (slicedMatches.filter(function(v) {
        return v != null;
      }).length === 0) {
        throw new RangeError("invalid duration: ".concat(durationString));
      }
      var fractionalIdx = slicedMatches.findIndex(function(v) {
        return /\./.test(v || "");
      });
      if (fractionalIdx !== -1) {
        var lastPresentIdx = slicedMatches.reduce(function(acc, v, idx) {
          return v != null ? idx : acc;
        }, -1);
        if (fractionalIdx !== lastPresentIdx) {
          throw new RangeError("only the smallest unit can be fractional");
        }
      }
      return slicedMatches.reduce(function(prev, next, idx) {
        prev[objMap[idx]] = parseFloat(next || "0") || 0;
        return prev;
      }, {});
    };
    exports.parse = parse5;
    var end = function(durationInput, startDate) {
      if (startDate === void 0) {
        startDate = /* @__PURE__ */ new Date();
      }
      var duration = Object.assign({}, defaultDuration, durationInput);
      var timestamp = startDate.getTime();
      var then = new Date(timestamp);
      then.setFullYear(then.getFullYear() + duration.years);
      then.setMonth(then.getMonth() + duration.months);
      then.setDate(then.getDate() + duration.days);
      var hoursInMs = duration.hours * 3600 * 1e3;
      var minutesInMs = duration.minutes * 60 * 1e3;
      then.setMilliseconds(then.getMilliseconds() + duration.seconds * 1e3 + hoursInMs + minutesInMs);
      then.setDate(then.getDate() + duration.weeks * 7);
      return then;
    };
    exports.end = end;
    var toSeconds = function(durationInput, startDate) {
      if (startDate === void 0) {
        startDate = /* @__PURE__ */ new Date();
      }
      var duration = Object.assign({}, defaultDuration, durationInput);
      var timestamp = startDate.getTime();
      var now = new Date(timestamp);
      var then = (0, exports.end)(duration, now);
      var tzStart = startDate.getTimezoneOffset();
      var tzEnd = then.getTimezoneOffset();
      var tzOffsetSeconds = (tzStart - tzEnd) * 60;
      var seconds = (then.getTime() - now.getTime()) / 1e3;
      return seconds + tzOffsetSeconds;
    };
    exports.toSeconds = toSeconds;
    exports.default = {
      end: exports.end,
      toSeconds: exports.toSeconds,
      pattern: exports.pattern,
      parse: exports.parse
    };
  }
});

// node_modules/rrule/dist/es5/rrule.js
var require_rrule = __commonJS({
  "node_modules/rrule/dist/es5/rrule.js"(exports, module) {
    init_define_SEI_BUNDLED_ENGINE_VERSIONS();
    (function webpackUniversalModuleDefinition(root, factory) {
      if (typeof exports === "object" && typeof module === "object")
        module.exports = factory();
      else if (typeof define === "function" && define.amd)
        define([], factory);
      else if (typeof exports === "object")
        exports["rrule"] = factory();
      else
        root["rrule"] = factory();
    })(typeof self !== "undefined" ? self : exports, () => {
      return (
        /******/
        (() => {
          "use strict";
          var __webpack_require__ = {};
          (() => {
            __webpack_require__.d = (exports2, definition) => {
              for (var key in definition) {
                if (__webpack_require__.o(definition, key) && !__webpack_require__.o(exports2, key)) {
                  Object.defineProperty(exports2, key, { enumerable: true, get: definition[key] });
                }
              }
            };
          })();
          (() => {
            __webpack_require__.o = (obj, prop) => Object.prototype.hasOwnProperty.call(obj, prop);
          })();
          (() => {
            __webpack_require__.r = (exports2) => {
              if (typeof Symbol !== "undefined" && Symbol.toStringTag) {
                Object.defineProperty(exports2, Symbol.toStringTag, { value: "Module" });
              }
              Object.defineProperty(exports2, "__esModule", { value: true });
            };
          })();
          var __webpack_exports__ = {};
          __webpack_require__.r(__webpack_exports__);
          __webpack_require__.d(__webpack_exports__, {
            "ALL_WEEKDAYS": () => (
              /* reexport */
              ALL_WEEKDAYS
            ),
            "Frequency": () => (
              /* reexport */
              Frequency
            ),
            "RRule": () => (
              /* reexport */
              RRule2
            ),
            "RRuleSet": () => (
              /* reexport */
              RRuleSet
            ),
            "Weekday": () => (
              /* reexport */
              Weekday
            ),
            "datetime": () => (
              /* reexport */
              datetime
            ),
            "rrulestr": () => (
              /* reexport */
              rrulestr
            )
          });
          ;
          var ALL_WEEKDAYS = [
            "MO",
            "TU",
            "WE",
            "TH",
            "FR",
            "SA",
            "SU"
          ];
          var Weekday = (
            /** @class */
            (function() {
              function Weekday2(weekday, n) {
                if (n === 0)
                  throw new Error("Can't create weekday with n == 0");
                this.weekday = weekday;
                this.n = n;
              }
              Weekday2.fromStr = function(str) {
                return new Weekday2(ALL_WEEKDAYS.indexOf(str));
              };
              Weekday2.prototype.nth = function(n) {
                return this.n === n ? this : new Weekday2(this.weekday, n);
              };
              Weekday2.prototype.equals = function(other) {
                return this.weekday === other.weekday && this.n === other.n;
              };
              Weekday2.prototype.toString = function() {
                var s = ALL_WEEKDAYS[this.weekday];
                if (this.n)
                  s = (this.n > 0 ? "+" : "") + String(this.n) + s;
                return s;
              };
              Weekday2.prototype.getJsWeekday = function() {
                return this.weekday === 6 ? 0 : this.weekday + 1;
              };
              return Weekday2;
            })()
          );
          ;
          var isPresent = function(value) {
            return value !== null && value !== void 0;
          };
          var isNumber = function(value) {
            return typeof value === "number";
          };
          var isWeekdayStr = function(value) {
            return typeof value === "string" && ALL_WEEKDAYS.includes(value);
          };
          var isArray = Array.isArray;
          var range = function(start, end) {
            if (end === void 0) {
              end = start;
            }
            if (arguments.length === 1) {
              end = start;
              start = 0;
            }
            var rang = [];
            for (var i = start; i < end; i++)
              rang.push(i);
            return rang;
          };
          var clone = function(array) {
            return [].concat(array);
          };
          var repeat = function(value, times) {
            var i = 0;
            var array = [];
            if (isArray(value)) {
              for (; i < times; i++)
                array[i] = [].concat(value);
            } else {
              for (; i < times; i++)
                array[i] = value;
            }
            return array;
          };
          var toArray = function(item) {
            if (isArray(item)) {
              return item;
            }
            return [item];
          };
          function padStart(item, targetLength, padString) {
            if (padString === void 0) {
              padString = " ";
            }
            var str = String(item);
            targetLength = targetLength >> 0;
            if (str.length > targetLength) {
              return String(str);
            }
            targetLength = targetLength - str.length;
            if (targetLength > padString.length) {
              padString += repeat(padString, targetLength / padString.length);
            }
            return padString.slice(0, targetLength) + String(str);
          }
          var split = function(str, sep, num) {
            var splits = str.split(sep);
            return num ? splits.slice(0, num).concat([splits.slice(num).join(sep)]) : splits;
          };
          var pymod = function(a, b) {
            var r = a % b;
            return r * b < 0 ? r + b : r;
          };
          var divmod = function(a, b) {
            return { div: Math.floor(a / b), mod: pymod(a, b) };
          };
          var empty = function(obj) {
            return !isPresent(obj) || obj.length === 0;
          };
          var notEmpty = function(obj) {
            return !empty(obj);
          };
          var includes = function(arr, val) {
            return notEmpty(arr) && arr.indexOf(val) !== -1;
          };
          ;
          var datetime = function(y, m, d, h, i, s) {
            if (h === void 0) {
              h = 0;
            }
            if (i === void 0) {
              i = 0;
            }
            if (s === void 0) {
              s = 0;
            }
            return new Date(Date.UTC(y, m - 1, d, h, i, s));
          };
          var MONTH_DAYS = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
          var ONE_DAY = 1e3 * 60 * 60 * 24;
          var MAXYEAR = 9999;
          var ORDINAL_BASE = datetime(1970, 1, 1);
          var PY_WEEKDAYS = [6, 0, 1, 2, 3, 4, 5];
          var getYearDay = function(date) {
            var dateNoTime = new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
            return Math.ceil((dateNoTime.valueOf() - new Date(date.getUTCFullYear(), 0, 1).valueOf()) / ONE_DAY) + 1;
          };
          var isLeapYear3 = function(year) {
            return year % 4 === 0 && year % 100 !== 0 || year % 400 === 0;
          };
          var isDate = function(value) {
            return value instanceof Date;
          };
          var isValidDate = function(value) {
            return isDate(value) && !isNaN(value.getTime());
          };
          var tzOffset = function(date) {
            return date.getTimezoneOffset() * 60 * 1e3;
          };
          var daysBetween = function(date1, date2) {
            var date1ms = date1.getTime();
            var date2ms = date2.getTime();
            var differencems = date1ms - date2ms;
            return Math.round(differencems / ONE_DAY);
          };
          var toOrdinal = function(date) {
            return daysBetween(date, ORDINAL_BASE);
          };
          var fromOrdinal = function(ordinal) {
            return new Date(ORDINAL_BASE.getTime() + ordinal * ONE_DAY);
          };
          var getMonthDays = function(date) {
            var month = date.getUTCMonth();
            return month === 1 && isLeapYear3(date.getUTCFullYear()) ? 29 : MONTH_DAYS[month];
          };
          var getWeekday = function(date) {
            return PY_WEEKDAYS[date.getUTCDay()];
          };
          var monthRange = function(year, month) {
            var date = datetime(year, month + 1, 1);
            return [getWeekday(date), getMonthDays(date)];
          };
          var combine = function(date, time) {
            time = time || date;
            return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), time.getHours(), time.getMinutes(), time.getSeconds(), time.getMilliseconds()));
          };
          var dateutil_clone = function(date) {
            var dolly = new Date(date.getTime());
            return dolly;
          };
          var cloneDates = function(dates) {
            var clones = [];
            for (var i = 0; i < dates.length; i++) {
              clones.push(dateutil_clone(dates[i]));
            }
            return clones;
          };
          var sort = function(dates) {
            dates.sort(function(a, b) {
              return a.getTime() - b.getTime();
            });
          };
          var timeToUntilString = function(time, utc) {
            if (utc === void 0) {
              utc = true;
            }
            var date = new Date(time);
            return [
              padStart(date.getUTCFullYear().toString(), 4, "0"),
              padStart(date.getUTCMonth() + 1, 2, "0"),
              padStart(date.getUTCDate(), 2, "0"),
              "T",
              padStart(date.getUTCHours(), 2, "0"),
              padStart(date.getUTCMinutes(), 2, "0"),
              padStart(date.getUTCSeconds(), 2, "0"),
              utc ? "Z" : ""
            ].join("");
          };
          var untilStringToDate = function(until) {
            var re = /^(\d{4})(\d{2})(\d{2})(T(\d{2})(\d{2})(\d{2})Z?)?$/;
            var bits = re.exec(until);
            if (!bits)
              throw new Error("Invalid UNTIL value: ".concat(until));
            return new Date(Date.UTC(parseInt(bits[1], 10), parseInt(bits[2], 10) - 1, parseInt(bits[3], 10), parseInt(bits[5], 10) || 0, parseInt(bits[6], 10) || 0, parseInt(bits[7], 10) || 0));
          };
          var dateTZtoISO8601 = function(date, timeZone) {
            var dateStr = date.toLocaleString("sv-SE", { timeZone });
            return dateStr.replace(" ", "T") + "Z";
          };
          var dateInTimeZone = function(date, timeZone) {
            var localTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
            var dateInLocalTZ = new Date(dateTZtoISO8601(date, localTimeZone));
            var dateInTargetTZ = new Date(dateTZtoISO8601(date, timeZone !== null && timeZone !== void 0 ? timeZone : "UTC"));
            var tzOffset2 = dateInTargetTZ.getTime() - dateInLocalTZ.getTime();
            return new Date(date.getTime() - tzOffset2);
          };
          ;
          var IterResult = (
            /** @class */
            (function() {
              function IterResult2(method, args) {
                this.minDate = null;
                this.maxDate = null;
                this._result = [];
                this.total = 0;
                this.method = method;
                this.args = args;
                if (method === "between") {
                  this.maxDate = args.inc ? args.before : new Date(args.before.getTime() - 1);
                  this.minDate = args.inc ? args.after : new Date(args.after.getTime() + 1);
                } else if (method === "before") {
                  this.maxDate = args.inc ? args.dt : new Date(args.dt.getTime() - 1);
                } else if (method === "after") {
                  this.minDate = args.inc ? args.dt : new Date(args.dt.getTime() + 1);
                }
              }
              IterResult2.prototype.accept = function(date) {
                ++this.total;
                var tooEarly = this.minDate && date < this.minDate;
                var tooLate = this.maxDate && date > this.maxDate;
                if (this.method === "between") {
                  if (tooEarly)
                    return true;
                  if (tooLate)
                    return false;
                } else if (this.method === "before") {
                  if (tooLate)
                    return false;
                } else if (this.method === "after") {
                  if (tooEarly)
                    return true;
                  this.add(date);
                  return false;
                }
                return this.add(date);
              };
              IterResult2.prototype.add = function(date) {
                this._result.push(date);
                return true;
              };
              IterResult2.prototype.getValue = function() {
                var res = this._result;
                switch (this.method) {
                  case "all":
                  case "between":
                    return res;
                  case "before":
                  case "after":
                  default:
                    return res.length ? res[res.length - 1] : null;
                }
              };
              IterResult2.prototype.clone = function() {
                return new IterResult2(this.method, this.args);
              };
              return IterResult2;
            })()
          );
          const iterresult = IterResult;
          ;
          var extendStatics = function(d, b) {
            extendStatics = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function(d2, b2) {
              d2.__proto__ = b2;
            } || function(d2, b2) {
              for (var p in b2) if (Object.prototype.hasOwnProperty.call(b2, p)) d2[p] = b2[p];
            };
            return extendStatics(d, b);
          };
          function __extends(d, b) {
            if (typeof b !== "function" && b !== null)
              throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
            extendStatics(d, b);
            function __() {
              this.constructor = d;
            }
            d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
          }
          var __assign = function() {
            __assign = Object.assign || function __assign2(t) {
              for (var s, i = 1, n = arguments.length; i < n; i++) {
                s = arguments[i];
                for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
              }
              return t;
            };
            return __assign.apply(this, arguments);
          };
          function __rest(s, e) {
            var t = {};
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
              t[p] = s[p];
            if (s != null && typeof Object.getOwnPropertySymbols === "function")
              for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
                if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                  t[p[i]] = s[p[i]];
              }
            return t;
          }
          function __decorate(decorators, target, key, desc) {
            var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
            if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
            else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
            return c > 3 && r && Object.defineProperty(target, key, r), r;
          }
          function __param(paramIndex, decorator) {
            return function(target, key) {
              decorator(target, key, paramIndex);
            };
          }
          function __metadata(metadataKey, metadataValue) {
            if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(metadataKey, metadataValue);
          }
          function __awaiter(thisArg, _arguments, P, generator) {
            function adopt(value) {
              return value instanceof P ? value : new P(function(resolve2) {
                resolve2(value);
              });
            }
            return new (P || (P = Promise))(function(resolve2, reject) {
              function fulfilled(value) {
                try {
                  step(generator.next(value));
                } catch (e) {
                  reject(e);
                }
              }
              function rejected(value) {
                try {
                  step(generator["throw"](value));
                } catch (e) {
                  reject(e);
                }
              }
              function step(result) {
                result.done ? resolve2(result.value) : adopt(result.value).then(fulfilled, rejected);
              }
              step((generator = generator.apply(thisArg, _arguments || [])).next());
            });
          }
          function __generator(thisArg, body) {
            var _ = { label: 0, sent: function() {
              if (t[0] & 1) throw t[1];
              return t[1];
            }, trys: [], ops: [] }, f, y, t, g;
            return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() {
              return this;
            }), g;
            function verb(n) {
              return function(v) {
                return step([n, v]);
              };
            }
            function step(op) {
              if (f) throw new TypeError("Generator is already executing.");
              while (_) try {
                if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
                if (y = 0, t) op = [op[0] & 2, t.value];
                switch (op[0]) {
                  case 0:
                  case 1:
                    t = op;
                    break;
                  case 4:
                    _.label++;
                    return { value: op[1], done: false };
                  case 5:
                    _.label++;
                    y = op[1];
                    op = [0];
                    continue;
                  case 7:
                    op = _.ops.pop();
                    _.trys.pop();
                    continue;
                  default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) {
                      _ = 0;
                      continue;
                    }
                    if (op[0] === 3 && (!t || op[1] > t[0] && op[1] < t[3])) {
                      _.label = op[1];
                      break;
                    }
                    if (op[0] === 6 && _.label < t[1]) {
                      _.label = t[1];
                      t = op;
                      break;
                    }
                    if (t && _.label < t[2]) {
                      _.label = t[2];
                      _.ops.push(op);
                      break;
                    }
                    if (t[2]) _.ops.pop();
                    _.trys.pop();
                    continue;
                }
                op = body.call(thisArg, _);
              } catch (e) {
                op = [6, e];
                y = 0;
              } finally {
                f = t = 0;
              }
              if (op[0] & 5) throw op[1];
              return { value: op[0] ? op[1] : void 0, done: true };
            }
          }
          var __createBinding = Object.create ? (function(o, m, k, k2) {
            if (k2 === void 0) k2 = k;
            var desc = Object.getOwnPropertyDescriptor(m, k);
            if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
              desc = { enumerable: true, get: function() {
                return m[k];
              } };
            }
            Object.defineProperty(o, k2, desc);
          }) : (function(o, m, k, k2) {
            if (k2 === void 0) k2 = k;
            o[k2] = m[k];
          });
          function __exportStar(m, o) {
            for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(o, p)) __createBinding(o, m, p);
          }
          function __values(o) {
            var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
            if (m) return m.call(o);
            if (o && typeof o.length === "number") return {
              next: function() {
                if (o && i >= o.length) o = void 0;
                return { value: o && o[i++], done: !o };
              }
            };
            throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
          }
          function __read(o, n) {
            var m = typeof Symbol === "function" && o[Symbol.iterator];
            if (!m) return o;
            var i = m.call(o), r, ar = [], e;
            try {
              while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
            } catch (error) {
              e = { error };
            } finally {
              try {
                if (r && !r.done && (m = i["return"])) m.call(i);
              } finally {
                if (e) throw e.error;
              }
            }
            return ar;
          }
          function __spread() {
            for (var ar = [], i = 0; i < arguments.length; i++)
              ar = ar.concat(__read(arguments[i]));
            return ar;
          }
          function __spreadArrays() {
            for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
            for (var r = Array(s), k = 0, i = 0; i < il; i++)
              for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
                r[k] = a[j];
            return r;
          }
          function __spreadArray(to, from, pack) {
            if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
              if (ar || !(i in from)) {
                if (!ar) ar = Array.prototype.slice.call(from, 0, i);
                ar[i] = from[i];
              }
            }
            return to.concat(ar || Array.prototype.slice.call(from));
          }
          function __await(v) {
            return this instanceof __await ? (this.v = v, this) : new __await(v);
          }
          function __asyncGenerator(thisArg, _arguments, generator) {
            if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
            var g = generator.apply(thisArg, _arguments || []), i, q = [];
            return i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function() {
              return this;
            }, i;
            function verb(n) {
              if (g[n]) i[n] = function(v) {
                return new Promise(function(a, b) {
                  q.push([n, v, a, b]) > 1 || resume(n, v);
                });
              };
            }
            function resume(n, v) {
              try {
                step(g[n](v));
              } catch (e) {
                settle(q[0][3], e);
              }
            }
            function step(r) {
              r.value instanceof __await ? Promise.resolve(r.value.v).then(fulfill, reject) : settle(q[0][2], r);
            }
            function fulfill(value) {
              resume("next", value);
            }
            function reject(value) {
              resume("throw", value);
            }
            function settle(f, v) {
              if (f(v), q.shift(), q.length) resume(q[0][0], q[0][1]);
            }
          }
          function __asyncDelegator(o) {
            var i, p;
            return i = {}, verb("next"), verb("throw", function(e) {
              throw e;
            }), verb("return"), i[Symbol.iterator] = function() {
              return this;
            }, i;
            function verb(n, f) {
              i[n] = o[n] ? function(v) {
                return (p = !p) ? { value: __await(o[n](v)), done: n === "return" } : f ? f(v) : v;
              } : f;
            }
          }
          function __asyncValues(o) {
            if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
            var m = o[Symbol.asyncIterator], i;
            return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function() {
              return this;
            }, i);
            function verb(n) {
              i[n] = o[n] && function(v) {
                return new Promise(function(resolve2, reject) {
                  v = o[n](v), settle(resolve2, reject, v.done, v.value);
                });
              };
            }
            function settle(resolve2, reject, d, v) {
              Promise.resolve(v).then(function(v2) {
                resolve2({ value: v2, done: d });
              }, reject);
            }
          }
          function __makeTemplateObject(cooked, raw) {
            if (Object.defineProperty) {
              Object.defineProperty(cooked, "raw", { value: raw });
            } else {
              cooked.raw = raw;
            }
            return cooked;
          }
          ;
          var __setModuleDefault = Object.create ? (function(o, v) {
            Object.defineProperty(o, "default", { enumerable: true, value: v });
          }) : function(o, v) {
            o["default"] = v;
          };
          function __importStar(mod) {
            if (mod && mod.__esModule) return mod;
            var result = {};
            if (mod != null) {
              for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
            }
            __setModuleDefault(result, mod);
            return result;
          }
          function __importDefault(mod) {
            return mod && mod.__esModule ? mod : { default: mod };
          }
          function __classPrivateFieldGet(receiver, state, kind, f) {
            if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
            if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
            return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
          }
          function __classPrivateFieldSet(receiver, state, value, kind, f) {
            if (kind === "m") throw new TypeError("Private method is not writable");
            if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
            if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
            return kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value), value;
          }
          function __classPrivateFieldIn(state, receiver) {
            if (receiver === null || typeof receiver !== "object" && typeof receiver !== "function") throw new TypeError("Cannot use 'in' operator on non-object");
            return typeof state === "function" ? receiver === state : state.has(receiver);
          }
          ;
          var CallbackIterResult = (
            /** @class */
            (function(_super) {
              __extends(CallbackIterResult2, _super);
              function CallbackIterResult2(method, args, iterator) {
                var _this = _super.call(this, method, args) || this;
                _this.iterator = iterator;
                return _this;
              }
              CallbackIterResult2.prototype.add = function(date) {
                if (this.iterator(date, this._result.length)) {
                  this._result.push(date);
                  return true;
                }
                return false;
              };
              return CallbackIterResult2;
            })(iterresult)
          );
          const callbackiterresult = CallbackIterResult;
          ;
          var ENGLISH = {
            dayNames: [
              "Sunday",
              "Monday",
              "Tuesday",
              "Wednesday",
              "Thursday",
              "Friday",
              "Saturday"
            ],
            monthNames: [
              "January",
              "February",
              "March",
              "April",
              "May",
              "June",
              "July",
              "August",
              "September",
              "October",
              "November",
              "December"
            ],
            tokens: {
              SKIP: /^[ \r\n\t]+|^\.$/,
              number: /^[1-9][0-9]*/,
              numberAsText: /^(one|two|three)/i,
              every: /^every/i,
              "day(s)": /^days?/i,
              "weekday(s)": /^weekdays?/i,
              "week(s)": /^weeks?/i,
              "hour(s)": /^hours?/i,
              "minute(s)": /^minutes?/i,
              "month(s)": /^months?/i,
              "year(s)": /^years?/i,
              on: /^(on|in)/i,
              at: /^(at)/i,
              the: /^the/i,
              first: /^first/i,
              second: /^second/i,
              third: /^third/i,
              nth: /^([1-9][0-9]*)(\.|th|nd|rd|st)/i,
              last: /^last/i,
              for: /^for/i,
              "time(s)": /^times?/i,
              until: /^(un)?til/i,
              monday: /^mo(n(day)?)?/i,
              tuesday: /^tu(e(s(day)?)?)?/i,
              wednesday: /^we(d(n(esday)?)?)?/i,
              thursday: /^th(u(r(sday)?)?)?/i,
              friday: /^fr(i(day)?)?/i,
              saturday: /^sa(t(urday)?)?/i,
              sunday: /^su(n(day)?)?/i,
              january: /^jan(uary)?/i,
              february: /^feb(ruary)?/i,
              march: /^mar(ch)?/i,
              april: /^apr(il)?/i,
              may: /^may/i,
              june: /^june?/i,
              july: /^july?/i,
              august: /^aug(ust)?/i,
              september: /^sep(t(ember)?)?/i,
              october: /^oct(ober)?/i,
              november: /^nov(ember)?/i,
              december: /^dec(ember)?/i,
              comma: /^(,\s*|(and|or)\s*)+/i
            }
          };
          const i18n = ENGLISH;
          ;
          var contains = function(arr, val) {
            return arr.indexOf(val) !== -1;
          };
          var defaultGetText = function(id) {
            return id.toString();
          };
          var defaultDateFormatter = function(year, month, day) {
            return "".concat(month, " ").concat(day, ", ").concat(year);
          };
          var ToText = (
            /** @class */
            (function() {
              function ToText2(rrule, gettext, language, dateFormatter) {
                if (gettext === void 0) {
                  gettext = defaultGetText;
                }
                if (language === void 0) {
                  language = i18n;
                }
                if (dateFormatter === void 0) {
                  dateFormatter = defaultDateFormatter;
                }
                this.text = [];
                this.language = language || i18n;
                this.gettext = gettext;
                this.dateFormatter = dateFormatter;
                this.rrule = rrule;
                this.options = rrule.options;
                this.origOptions = rrule.origOptions;
                if (this.origOptions.bymonthday) {
                  var bymonthday = [].concat(this.options.bymonthday);
                  var bynmonthday = [].concat(this.options.bynmonthday);
                  bymonthday.sort(function(a, b) {
                    return a - b;
                  });
                  bynmonthday.sort(function(a, b) {
                    return b - a;
                  });
                  this.bymonthday = bymonthday.concat(bynmonthday);
                  if (!this.bymonthday.length)
                    this.bymonthday = null;
                }
                if (isPresent(this.origOptions.byweekday)) {
                  var byweekday = !isArray(this.origOptions.byweekday) ? [this.origOptions.byweekday] : this.origOptions.byweekday;
                  var days = String(byweekday);
                  this.byweekday = {
                    allWeeks: byweekday.filter(function(weekday) {
                      return !weekday.n;
                    }),
                    someWeeks: byweekday.filter(function(weekday) {
                      return Boolean(weekday.n);
                    }),
                    isWeekdays: days.indexOf("MO") !== -1 && days.indexOf("TU") !== -1 && days.indexOf("WE") !== -1 && days.indexOf("TH") !== -1 && days.indexOf("FR") !== -1 && days.indexOf("SA") === -1 && days.indexOf("SU") === -1,
                    isEveryDay: days.indexOf("MO") !== -1 && days.indexOf("TU") !== -1 && days.indexOf("WE") !== -1 && days.indexOf("TH") !== -1 && days.indexOf("FR") !== -1 && days.indexOf("SA") !== -1 && days.indexOf("SU") !== -1
                  };
                  var sortWeekDays = function(a, b) {
                    return a.weekday - b.weekday;
                  };
                  this.byweekday.allWeeks.sort(sortWeekDays);
                  this.byweekday.someWeeks.sort(sortWeekDays);
                  if (!this.byweekday.allWeeks.length)
                    this.byweekday.allWeeks = null;
                  if (!this.byweekday.someWeeks.length)
                    this.byweekday.someWeeks = null;
                } else {
                  this.byweekday = null;
                }
              }
              ToText2.isFullyConvertible = function(rrule) {
                var canConvert = true;
                if (!(rrule.options.freq in ToText2.IMPLEMENTED))
                  return false;
                if (rrule.origOptions.until && rrule.origOptions.count)
                  return false;
                for (var key in rrule.origOptions) {
                  if (contains(["dtstart", "tzid", "wkst", "freq"], key))
                    return true;
                  if (!contains(ToText2.IMPLEMENTED[rrule.options.freq], key))
                    return false;
                }
                return canConvert;
              };
              ToText2.prototype.isFullyConvertible = function() {
                return ToText2.isFullyConvertible(this.rrule);
              };
              ToText2.prototype.toString = function() {
                var gettext = this.gettext;
                if (!(this.options.freq in ToText2.IMPLEMENTED)) {
                  return gettext("RRule error: Unable to fully convert this rrule to text");
                }
                this.text = [gettext("every")];
                this[RRule2.FREQUENCIES[this.options.freq]]();
                if (this.options.until) {
                  this.add(gettext("until"));
                  var until = this.options.until;
                  this.add(this.dateFormatter(until.getUTCFullYear(), this.language.monthNames[until.getUTCMonth()], until.getUTCDate()));
                } else if (this.options.count) {
                  this.add(gettext("for")).add(this.options.count.toString()).add(this.plural(this.options.count) ? gettext("times") : gettext("time"));
                }
                if (!this.isFullyConvertible())
                  this.add(gettext("(~ approximate)"));
                return this.text.join("");
              };
              ToText2.prototype.HOURLY = function() {
                var gettext = this.gettext;
                if (this.options.interval !== 1)
                  this.add(this.options.interval.toString());
                this.add(this.plural(this.options.interval) ? gettext("hours") : gettext("hour"));
              };
              ToText2.prototype.MINUTELY = function() {
                var gettext = this.gettext;
                if (this.options.interval !== 1)
                  this.add(this.options.interval.toString());
                this.add(this.plural(this.options.interval) ? gettext("minutes") : gettext("minute"));
              };
              ToText2.prototype.DAILY = function() {
                var gettext = this.gettext;
                if (this.options.interval !== 1)
                  this.add(this.options.interval.toString());
                if (this.byweekday && this.byweekday.isWeekdays) {
                  this.add(this.plural(this.options.interval) ? gettext("weekdays") : gettext("weekday"));
                } else {
                  this.add(this.plural(this.options.interval) ? gettext("days") : gettext("day"));
                }
                if (this.origOptions.bymonth) {
                  this.add(gettext("in"));
                  this._bymonth();
                }
                if (this.bymonthday) {
                  this._bymonthday();
                } else if (this.byweekday) {
                  this._byweekday();
                } else if (this.origOptions.byhour) {
                  this._byhour();
                }
              };
              ToText2.prototype.WEEKLY = function() {
                var gettext = this.gettext;
                if (this.options.interval !== 1) {
                  this.add(this.options.interval.toString()).add(this.plural(this.options.interval) ? gettext("weeks") : gettext("week"));
                }
                if (this.byweekday && this.byweekday.isWeekdays) {
                  if (this.options.interval === 1) {
                    this.add(this.plural(this.options.interval) ? gettext("weekdays") : gettext("weekday"));
                  } else {
                    this.add(gettext("on")).add(gettext("weekdays"));
                  }
                } else if (this.byweekday && this.byweekday.isEveryDay) {
                  this.add(this.plural(this.options.interval) ? gettext("days") : gettext("day"));
                } else {
                  if (this.options.interval === 1)
                    this.add(gettext("week"));
                  if (this.origOptions.bymonth) {
                    this.add(gettext("in"));
                    this._bymonth();
                  }
                  if (this.bymonthday) {
                    this._bymonthday();
                  } else if (this.byweekday) {
                    this._byweekday();
                  }
                  if (this.origOptions.byhour) {
                    this._byhour();
                  }
                }
              };
              ToText2.prototype.MONTHLY = function() {
                var gettext = this.gettext;
                if (this.origOptions.bymonth) {
                  if (this.options.interval !== 1) {
                    this.add(this.options.interval.toString()).add(gettext("months"));
                    if (this.plural(this.options.interval))
                      this.add(gettext("in"));
                  } else {
                  }
                  this._bymonth();
                } else {
                  if (this.options.interval !== 1) {
                    this.add(this.options.interval.toString());
                  }
                  this.add(this.plural(this.options.interval) ? gettext("months") : gettext("month"));
                }
                if (this.bymonthday) {
                  this._bymonthday();
                } else if (this.byweekday && this.byweekday.isWeekdays) {
                  this.add(gettext("on")).add(gettext("weekdays"));
                } else if (this.byweekday) {
                  this._byweekday();
                }
              };
              ToText2.prototype.YEARLY = function() {
                var gettext = this.gettext;
                if (this.origOptions.bymonth) {
                  if (this.options.interval !== 1) {
                    this.add(this.options.interval.toString());
                    this.add(gettext("years"));
                  } else {
                  }
                  this._bymonth();
                } else {
                  if (this.options.interval !== 1) {
                    this.add(this.options.interval.toString());
                  }
                  this.add(this.plural(this.options.interval) ? gettext("years") : gettext("year"));
                }
                if (this.bymonthday) {
                  this._bymonthday();
                } else if (this.byweekday) {
                  this._byweekday();
                }
                if (this.options.byyearday) {
                  this.add(gettext("on the")).add(this.list(this.options.byyearday, this.nth, gettext("and"))).add(gettext("day"));
                }
                if (this.options.byweekno) {
                  this.add(gettext("in")).add(this.plural(this.options.byweekno.length) ? gettext("weeks") : gettext("week")).add(this.list(this.options.byweekno, void 0, gettext("and")));
                }
              };
              ToText2.prototype._bymonthday = function() {
                var gettext = this.gettext;
                if (this.byweekday && this.byweekday.allWeeks) {
                  this.add(gettext("on")).add(this.list(this.byweekday.allWeeks, this.weekdaytext, gettext("or"))).add(gettext("the")).add(this.list(this.bymonthday, this.nth, gettext("or")));
                } else {
                  this.add(gettext("on the")).add(this.list(this.bymonthday, this.nth, gettext("and")));
                }
              };
              ToText2.prototype._byweekday = function() {
                var gettext = this.gettext;
                if (this.byweekday.allWeeks && !this.byweekday.isWeekdays) {
                  this.add(gettext("on")).add(this.list(this.byweekday.allWeeks, this.weekdaytext));
                }
                if (this.byweekday.someWeeks) {
                  if (this.byweekday.allWeeks)
                    this.add(gettext("and"));
                  this.add(gettext("on the")).add(this.list(this.byweekday.someWeeks, this.weekdaytext, gettext("and")));
                }
              };
              ToText2.prototype._byhour = function() {
                var gettext = this.gettext;
                this.add(gettext("at")).add(this.list(this.origOptions.byhour, void 0, gettext("and")));
              };
              ToText2.prototype._bymonth = function() {
                this.add(this.list(this.options.bymonth, this.monthtext, this.gettext("and")));
              };
              ToText2.prototype.nth = function(n) {
                n = parseInt(n.toString(), 10);
                var nth;
                var gettext = this.gettext;
                if (n === -1)
                  return gettext("last");
                var npos = Math.abs(n);
                switch (npos) {
                  case 1:
                  case 21:
                  case 31:
                    nth = npos + gettext("st");
                    break;
                  case 2:
                  case 22:
                    nth = npos + gettext("nd");
                    break;
                  case 3:
                  case 23:
                    nth = npos + gettext("rd");
                    break;
                  default:
                    nth = npos + gettext("th");
                }
                return n < 0 ? nth + " " + gettext("last") : nth;
              };
              ToText2.prototype.monthtext = function(m) {
                return this.language.monthNames[m - 1];
              };
              ToText2.prototype.weekdaytext = function(wday) {
                var weekday = isNumber(wday) ? (wday + 1) % 7 : wday.getJsWeekday();
                return (wday.n ? this.nth(wday.n) + " " : "") + this.language.dayNames[weekday];
              };
              ToText2.prototype.plural = function(n) {
                return n % 100 !== 1;
              };
              ToText2.prototype.add = function(s) {
                this.text.push(" ");
                this.text.push(s);
                return this;
              };
              ToText2.prototype.list = function(arr, callback, finalDelim, delim) {
                var _this = this;
                if (delim === void 0) {
                  delim = ",";
                }
                if (!isArray(arr)) {
                  arr = [arr];
                }
                var delimJoin = function(array, delimiter, finalDelimiter) {
                  var list = "";
                  for (var i = 0; i < array.length; i++) {
                    if (i !== 0) {
                      if (i === array.length - 1) {
                        list += " " + finalDelimiter + " ";
                      } else {
                        list += delimiter + " ";
                      }
                    }
                    list += array[i];
                  }
                  return list;
                };
                callback = callback || function(o) {
                  return o.toString();
                };
                var realCallback = function(arg) {
                  return callback && callback.call(_this, arg);
                };
                if (finalDelim) {
                  return delimJoin(arr.map(realCallback), delim, finalDelim);
                } else {
                  return arr.map(realCallback).join(delim + " ");
                }
              };
              return ToText2;
            })()
          );
          const totext = ToText;
          ;
          var Parser = (
            /** @class */
            (function() {
              function Parser2(rules) {
                this.done = true;
                this.rules = rules;
              }
              Parser2.prototype.start = function(text) {
                this.text = text;
                this.done = false;
                return this.nextSymbol();
              };
              Parser2.prototype.isDone = function() {
                return this.done && this.symbol === null;
              };
              Parser2.prototype.nextSymbol = function() {
                var best;
                var bestSymbol;
                this.symbol = null;
                this.value = null;
                do {
                  if (this.done)
                    return false;
                  var rule = void 0;
                  best = null;
                  for (var name_1 in this.rules) {
                    rule = this.rules[name_1];
                    var match = rule.exec(this.text);
                    if (match) {
                      if (best === null || match[0].length > best[0].length) {
                        best = match;
                        bestSymbol = name_1;
                      }
                    }
                  }
                  if (best != null) {
                    this.text = this.text.substr(best[0].length);
                    if (this.text === "")
                      this.done = true;
                  }
                  if (best == null) {
                    this.done = true;
                    this.symbol = null;
                    this.value = null;
                    return;
                  }
                } while (bestSymbol === "SKIP");
                this.symbol = bestSymbol;
                this.value = best;
                return true;
              };
              Parser2.prototype.accept = function(name) {
                if (this.symbol === name) {
                  if (this.value) {
                    var v = this.value;
                    this.nextSymbol();
                    return v;
                  }
                  this.nextSymbol();
                  return true;
                }
                return false;
              };
              Parser2.prototype.acceptNumber = function() {
                return this.accept("number");
              };
              Parser2.prototype.expect = function(name) {
                if (this.accept(name))
                  return true;
                throw new Error("expected " + name + " but found " + this.symbol);
              };
              return Parser2;
            })()
          );
          function parseText(text, language) {
            if (language === void 0) {
              language = i18n;
            }
            var options = {};
            var ttr = new Parser(language.tokens);
            if (!ttr.start(text))
              return null;
            S();
            return options;
            function S() {
              ttr.expect("every");
              var n = ttr.acceptNumber();
              if (n)
                options.interval = parseInt(n[0], 10);
              if (ttr.isDone())
                throw new Error("Unexpected end");
              switch (ttr.symbol) {
                case "day(s)":
                  options.freq = RRule2.DAILY;
                  if (ttr.nextSymbol()) {
                    AT();
                    F();
                  }
                  break;
                // FIXME Note: every 2 weekdays != every two weeks on weekdays.
                // DAILY on weekdays is not a valid rule
                case "weekday(s)":
                  options.freq = RRule2.WEEKLY;
                  options.byweekday = [RRule2.MO, RRule2.TU, RRule2.WE, RRule2.TH, RRule2.FR];
                  ttr.nextSymbol();
                  AT();
                  F();
                  break;
                case "week(s)":
                  options.freq = RRule2.WEEKLY;
                  if (ttr.nextSymbol()) {
                    ON();
                    AT();
                    F();
                  }
                  break;
                case "hour(s)":
                  options.freq = RRule2.HOURLY;
                  if (ttr.nextSymbol()) {
                    ON();
                    F();
                  }
                  break;
                case "minute(s)":
                  options.freq = RRule2.MINUTELY;
                  if (ttr.nextSymbol()) {
                    ON();
                    F();
                  }
                  break;
                case "month(s)":
                  options.freq = RRule2.MONTHLY;
                  if (ttr.nextSymbol()) {
                    ON();
                    F();
                  }
                  break;
                case "year(s)":
                  options.freq = RRule2.YEARLY;
                  if (ttr.nextSymbol()) {
                    ON();
                    F();
                  }
                  break;
                case "monday":
                case "tuesday":
                case "wednesday":
                case "thursday":
                case "friday":
                case "saturday":
                case "sunday":
                  options.freq = RRule2.WEEKLY;
                  var key = ttr.symbol.substr(0, 2).toUpperCase();
                  options.byweekday = [RRule2[key]];
                  if (!ttr.nextSymbol())
                    return;
                  while (ttr.accept("comma")) {
                    if (ttr.isDone())
                      throw new Error("Unexpected end");
                    var wkd = decodeWKD();
                    if (!wkd) {
                      throw new Error("Unexpected symbol " + ttr.symbol + ", expected weekday");
                    }
                    options.byweekday.push(RRule2[wkd]);
                    ttr.nextSymbol();
                  }
                  AT();
                  MDAYs();
                  F();
                  break;
                case "january":
                case "february":
                case "march":
                case "april":
                case "may":
                case "june":
                case "july":
                case "august":
                case "september":
                case "october":
                case "november":
                case "december":
                  options.freq = RRule2.YEARLY;
                  options.bymonth = [decodeM()];
                  if (!ttr.nextSymbol())
                    return;
                  while (ttr.accept("comma")) {
                    if (ttr.isDone())
                      throw new Error("Unexpected end");
                    var m = decodeM();
                    if (!m) {
                      throw new Error("Unexpected symbol " + ttr.symbol + ", expected month");
                    }
                    options.bymonth.push(m);
                    ttr.nextSymbol();
                  }
                  ON();
                  F();
                  break;
                default:
                  throw new Error("Unknown symbol");
              }
            }
            function ON() {
              var on = ttr.accept("on");
              var the = ttr.accept("the");
              if (!(on || the))
                return;
              do {
                var nth = decodeNTH();
                var wkd = decodeWKD();
                var m = decodeM();
                if (nth) {
                  if (wkd) {
                    ttr.nextSymbol();
                    if (!options.byweekday)
                      options.byweekday = [];
                    options.byweekday.push(RRule2[wkd].nth(nth));
                  } else {
                    if (!options.bymonthday)
                      options.bymonthday = [];
                    options.bymonthday.push(nth);
                    ttr.accept("day(s)");
                  }
                } else if (wkd) {
                  ttr.nextSymbol();
                  if (!options.byweekday)
                    options.byweekday = [];
                  options.byweekday.push(RRule2[wkd]);
                } else if (ttr.symbol === "weekday(s)") {
                  ttr.nextSymbol();
                  if (!options.byweekday) {
                    options.byweekday = [RRule2.MO, RRule2.TU, RRule2.WE, RRule2.TH, RRule2.FR];
                  }
                } else if (ttr.symbol === "week(s)") {
                  ttr.nextSymbol();
                  var n = ttr.acceptNumber();
                  if (!n) {
                    throw new Error("Unexpected symbol " + ttr.symbol + ", expected week number");
                  }
                  options.byweekno = [parseInt(n[0], 10)];
                  while (ttr.accept("comma")) {
                    n = ttr.acceptNumber();
                    if (!n) {
                      throw new Error("Unexpected symbol " + ttr.symbol + "; expected monthday");
                    }
                    options.byweekno.push(parseInt(n[0], 10));
                  }
                } else if (m) {
                  ttr.nextSymbol();
                  if (!options.bymonth)
                    options.bymonth = [];
                  options.bymonth.push(m);
                } else {
                  return;
                }
              } while (ttr.accept("comma") || ttr.accept("the") || ttr.accept("on"));
            }
            function AT() {
              var at = ttr.accept("at");
              if (!at)
                return;
              do {
                var n = ttr.acceptNumber();
                if (!n) {
                  throw new Error("Unexpected symbol " + ttr.symbol + ", expected hour");
                }
                options.byhour = [parseInt(n[0], 10)];
                while (ttr.accept("comma")) {
                  n = ttr.acceptNumber();
                  if (!n) {
                    throw new Error("Unexpected symbol " + ttr.symbol + "; expected hour");
                  }
                  options.byhour.push(parseInt(n[0], 10));
                }
              } while (ttr.accept("comma") || ttr.accept("at"));
            }
            function decodeM() {
              switch (ttr.symbol) {
                case "january":
                  return 1;
                case "february":
                  return 2;
                case "march":
                  return 3;
                case "april":
                  return 4;
                case "may":
                  return 5;
                case "june":
                  return 6;
                case "july":
                  return 7;
                case "august":
                  return 8;
                case "september":
                  return 9;
                case "october":
                  return 10;
                case "november":
                  return 11;
                case "december":
                  return 12;
                default:
                  return false;
              }
            }
            function decodeWKD() {
              switch (ttr.symbol) {
                case "monday":
                case "tuesday":
                case "wednesday":
                case "thursday":
                case "friday":
                case "saturday":
                case "sunday":
                  return ttr.symbol.substr(0, 2).toUpperCase();
                default:
                  return false;
              }
            }
            function decodeNTH() {
              switch (ttr.symbol) {
                case "last":
                  ttr.nextSymbol();
                  return -1;
                case "first":
                  ttr.nextSymbol();
                  return 1;
                case "second":
                  ttr.nextSymbol();
                  return ttr.accept("last") ? -2 : 2;
                case "third":
                  ttr.nextSymbol();
                  return ttr.accept("last") ? -3 : 3;
                case "nth":
                  var v = parseInt(ttr.value[1], 10);
                  if (v < -366 || v > 366)
                    throw new Error("Nth out of range: " + v);
                  ttr.nextSymbol();
                  return ttr.accept("last") ? -v : v;
                default:
                  return false;
              }
            }
            function MDAYs() {
              ttr.accept("on");
              ttr.accept("the");
              var nth = decodeNTH();
              if (!nth)
                return;
              options.bymonthday = [nth];
              ttr.nextSymbol();
              while (ttr.accept("comma")) {
                nth = decodeNTH();
                if (!nth) {
                  throw new Error("Unexpected symbol " + ttr.symbol + "; expected monthday");
                }
                options.bymonthday.push(nth);
                ttr.nextSymbol();
              }
            }
            function F() {
              if (ttr.symbol === "until") {
                var date = Date.parse(ttr.text);
                if (!date)
                  throw new Error("Cannot parse until date:" + ttr.text);
                options.until = new Date(date);
              } else if (ttr.accept("for")) {
                options.count = parseInt(ttr.value[0], 10);
                ttr.expect("number");
              }
            }
          }
          ;
          var Frequency;
          (function(Frequency2) {
            Frequency2[Frequency2["YEARLY"] = 0] = "YEARLY";
            Frequency2[Frequency2["MONTHLY"] = 1] = "MONTHLY";
            Frequency2[Frequency2["WEEKLY"] = 2] = "WEEKLY";
            Frequency2[Frequency2["DAILY"] = 3] = "DAILY";
            Frequency2[Frequency2["HOURLY"] = 4] = "HOURLY";
            Frequency2[Frequency2["MINUTELY"] = 5] = "MINUTELY";
            Frequency2[Frequency2["SECONDLY"] = 6] = "SECONDLY";
          })(Frequency || (Frequency = {}));
          function freqIsDailyOrGreater(freq) {
            return freq < Frequency.HOURLY;
          }
          ;
          var fromText = function(text, language) {
            if (language === void 0) {
              language = i18n;
            }
            return new RRule2(parseText(text, language) || void 0);
          };
          var common = [
            "count",
            "until",
            "interval",
            "byweekday",
            "bymonthday",
            "bymonth"
          ];
          totext.IMPLEMENTED = [];
          totext.IMPLEMENTED[Frequency.HOURLY] = common;
          totext.IMPLEMENTED[Frequency.MINUTELY] = common;
          totext.IMPLEMENTED[Frequency.DAILY] = ["byhour"].concat(common);
          totext.IMPLEMENTED[Frequency.WEEKLY] = common;
          totext.IMPLEMENTED[Frequency.MONTHLY] = common;
          totext.IMPLEMENTED[Frequency.YEARLY] = ["byweekno", "byyearday"].concat(common);
          var toText = function(rrule, gettext, language, dateFormatter) {
            return new totext(rrule, gettext, language, dateFormatter).toString();
          };
          var isFullyConvertible = totext.isFullyConvertible;
          ;
          var Time = (
            /** @class */
            (function() {
              function Time2(hour, minute, second, millisecond) {
                this.hour = hour;
                this.minute = minute;
                this.second = second;
                this.millisecond = millisecond || 0;
              }
              Time2.prototype.getHours = function() {
                return this.hour;
              };
              Time2.prototype.getMinutes = function() {
                return this.minute;
              };
              Time2.prototype.getSeconds = function() {
                return this.second;
              };
              Time2.prototype.getMilliseconds = function() {
                return this.millisecond;
              };
              Time2.prototype.getTime = function() {
                return (this.hour * 60 * 60 + this.minute * 60 + this.second) * 1e3 + this.millisecond;
              };
              return Time2;
            })()
          );
          var DateTime = (
            /** @class */
            (function(_super) {
              __extends(DateTime2, _super);
              function DateTime2(year, month, day, hour, minute, second, millisecond) {
                var _this = _super.call(this, hour, minute, second, millisecond) || this;
                _this.year = year;
                _this.month = month;
                _this.day = day;
                return _this;
              }
              DateTime2.fromDate = function(date) {
                return new this(date.getUTCFullYear(), date.getUTCMonth() + 1, date.getUTCDate(), date.getUTCHours(), date.getUTCMinutes(), date.getUTCSeconds(), date.valueOf() % 1e3);
              };
              DateTime2.prototype.getWeekday = function() {
                return getWeekday(new Date(this.getTime()));
              };
              DateTime2.prototype.getTime = function() {
                return new Date(Date.UTC(this.year, this.month - 1, this.day, this.hour, this.minute, this.second, this.millisecond)).getTime();
              };
              DateTime2.prototype.getDay = function() {
                return this.day;
              };
              DateTime2.prototype.getMonth = function() {
                return this.month;
              };
              DateTime2.prototype.getYear = function() {
                return this.year;
              };
              DateTime2.prototype.addYears = function(years) {
                this.year += years;
              };
              DateTime2.prototype.addMonths = function(months) {
                this.month += months;
                if (this.month > 12) {
                  var yearDiv = Math.floor(this.month / 12);
                  var monthMod = pymod(this.month, 12);
                  this.month = monthMod;
                  this.year += yearDiv;
                  if (this.month === 0) {
                    this.month = 12;
                    --this.year;
                  }
                }
              };
              DateTime2.prototype.addWeekly = function(days, wkst) {
                if (wkst > this.getWeekday()) {
                  this.day += -(this.getWeekday() + 1 + (6 - wkst)) + days * 7;
                } else {
                  this.day += -(this.getWeekday() - wkst) + days * 7;
                }
                this.fixDay();
              };
              DateTime2.prototype.addDaily = function(days) {
                this.day += days;
                this.fixDay();
              };
              DateTime2.prototype.addHours = function(hours, filtered, byhour) {
                if (filtered) {
                  this.hour += Math.floor((23 - this.hour) / hours) * hours;
                }
                for (; ; ) {
                  this.hour += hours;
                  var _a = divmod(this.hour, 24), dayDiv = _a.div, hourMod = _a.mod;
                  if (dayDiv) {
                    this.hour = hourMod;
                    this.addDaily(dayDiv);
                  }
                  if (empty(byhour) || includes(byhour, this.hour))
                    break;
                }
              };
              DateTime2.prototype.addMinutes = function(minutes, filtered, byhour, byminute) {
                if (filtered) {
                  this.minute += Math.floor((1439 - (this.hour * 60 + this.minute)) / minutes) * minutes;
                }
                for (; ; ) {
                  this.minute += minutes;
                  var _a = divmod(this.minute, 60), hourDiv = _a.div, minuteMod = _a.mod;
                  if (hourDiv) {
                    this.minute = minuteMod;
                    this.addHours(hourDiv, false, byhour);
                  }
                  if ((empty(byhour) || includes(byhour, this.hour)) && (empty(byminute) || includes(byminute, this.minute))) {
                    break;
                  }
                }
              };
              DateTime2.prototype.addSeconds = function(seconds, filtered, byhour, byminute, bysecond) {
                if (filtered) {
                  this.second += Math.floor((86399 - (this.hour * 3600 + this.minute * 60 + this.second)) / seconds) * seconds;
                }
                for (; ; ) {
                  this.second += seconds;
                  var _a = divmod(this.second, 60), minuteDiv = _a.div, secondMod = _a.mod;
                  if (minuteDiv) {
                    this.second = secondMod;
                    this.addMinutes(minuteDiv, false, byhour, byminute);
                  }
                  if ((empty(byhour) || includes(byhour, this.hour)) && (empty(byminute) || includes(byminute, this.minute)) && (empty(bysecond) || includes(bysecond, this.second))) {
                    break;
                  }
                }
              };
              DateTime2.prototype.fixDay = function() {
                if (this.day <= 28) {
                  return;
                }
                var daysinmonth = monthRange(this.year, this.month - 1)[1];
                if (this.day <= daysinmonth) {
                  return;
                }
                while (this.day > daysinmonth) {
                  this.day -= daysinmonth;
                  ++this.month;
                  if (this.month === 13) {
                    this.month = 1;
                    ++this.year;
                    if (this.year > MAXYEAR) {
                      return;
                    }
                  }
                  daysinmonth = monthRange(this.year, this.month - 1)[1];
                }
              };
              DateTime2.prototype.add = function(options, filtered) {
                var freq = options.freq, interval = options.interval, wkst = options.wkst, byhour = options.byhour, byminute = options.byminute, bysecond = options.bysecond;
                switch (freq) {
                  case Frequency.YEARLY:
                    return this.addYears(interval);
                  case Frequency.MONTHLY:
                    return this.addMonths(interval);
                  case Frequency.WEEKLY:
                    return this.addWeekly(interval, wkst);
                  case Frequency.DAILY:
                    return this.addDaily(interval);
                  case Frequency.HOURLY:
                    return this.addHours(interval, filtered, byhour);
                  case Frequency.MINUTELY:
                    return this.addMinutes(interval, filtered, byhour, byminute);
                  case Frequency.SECONDLY:
                    return this.addSeconds(interval, filtered, byhour, byminute, bysecond);
                }
              };
              return DateTime2;
            })(Time)
          );
          ;
          function initializeOptions(options) {
            var invalid2 = [];
            var keys = Object.keys(options);
            for (var _i = 0, keys_1 = keys; _i < keys_1.length; _i++) {
              var key = keys_1[_i];
              if (!includes(defaultKeys, key))
                invalid2.push(key);
              if (isDate(options[key]) && !isValidDate(options[key])) {
                invalid2.push(key);
              }
            }
            if (invalid2.length) {
              throw new Error("Invalid options: " + invalid2.join(", "));
            }
            return __assign({}, options);
          }
          function parseOptions(options) {
            var opts = __assign(__assign({}, DEFAULT_OPTIONS), initializeOptions(options));
            if (isPresent(opts.byeaster))
              opts.freq = RRule2.YEARLY;
            if (!(isPresent(opts.freq) && RRule2.FREQUENCIES[opts.freq])) {
              throw new Error("Invalid frequency: ".concat(opts.freq, " ").concat(options.freq));
            }
            if (!opts.dtstart)
              opts.dtstart = new Date((/* @__PURE__ */ new Date()).setMilliseconds(0));
            if (!isPresent(opts.wkst)) {
              opts.wkst = RRule2.MO.weekday;
            } else if (isNumber(opts.wkst)) {
            } else {
              opts.wkst = opts.wkst.weekday;
            }
            if (isPresent(opts.bysetpos)) {
              if (isNumber(opts.bysetpos))
                opts.bysetpos = [opts.bysetpos];
              for (var i = 0; i < opts.bysetpos.length; i++) {
                var v = opts.bysetpos[i];
                if (v === 0 || !(v >= -366 && v <= 366)) {
                  throw new Error("bysetpos must be between 1 and 366, or between -366 and -1");
                }
              }
            }
            if (!(Boolean(opts.byweekno) || notEmpty(opts.byweekno) || notEmpty(opts.byyearday) || Boolean(opts.bymonthday) || notEmpty(opts.bymonthday) || isPresent(opts.byweekday) || isPresent(opts.byeaster))) {
              switch (opts.freq) {
                case RRule2.YEARLY:
                  if (!opts.bymonth)
                    opts.bymonth = opts.dtstart.getUTCMonth() + 1;
                  opts.bymonthday = opts.dtstart.getUTCDate();
                  break;
                case RRule2.MONTHLY:
                  opts.bymonthday = opts.dtstart.getUTCDate();
                  break;
                case RRule2.WEEKLY:
                  opts.byweekday = [getWeekday(opts.dtstart)];
                  break;
              }
            }
            if (isPresent(opts.bymonth) && !isArray(opts.bymonth)) {
              opts.bymonth = [opts.bymonth];
            }
            if (isPresent(opts.byyearday) && !isArray(opts.byyearday) && isNumber(opts.byyearday)) {
              opts.byyearday = [opts.byyearday];
            }
            if (!isPresent(opts.bymonthday)) {
              opts.bymonthday = [];
              opts.bynmonthday = [];
            } else if (isArray(opts.bymonthday)) {
              var bymonthday = [];
              var bynmonthday = [];
              for (var i = 0; i < opts.bymonthday.length; i++) {
                var v = opts.bymonthday[i];
                if (v > 0) {
                  bymonthday.push(v);
                } else if (v < 0) {
                  bynmonthday.push(v);
                }
              }
              opts.bymonthday = bymonthday;
              opts.bynmonthday = bynmonthday;
            } else if (opts.bymonthday < 0) {
              opts.bynmonthday = [opts.bymonthday];
              opts.bymonthday = [];
            } else {
              opts.bynmonthday = [];
              opts.bymonthday = [opts.bymonthday];
            }
            if (isPresent(opts.byweekno) && !isArray(opts.byweekno)) {
              opts.byweekno = [opts.byweekno];
            }
            if (!isPresent(opts.byweekday)) {
              opts.bynweekday = null;
            } else if (isNumber(opts.byweekday)) {
              opts.byweekday = [opts.byweekday];
              opts.bynweekday = null;
            } else if (isWeekdayStr(opts.byweekday)) {
              opts.byweekday = [Weekday.fromStr(opts.byweekday).weekday];
              opts.bynweekday = null;
            } else if (opts.byweekday instanceof Weekday) {
              if (!opts.byweekday.n || opts.freq > RRule2.MONTHLY) {
                opts.byweekday = [opts.byweekday.weekday];
                opts.bynweekday = null;
              } else {
                opts.bynweekday = [[opts.byweekday.weekday, opts.byweekday.n]];
                opts.byweekday = null;
              }
            } else {
              var byweekday = [];
              var bynweekday = [];
              for (var i = 0; i < opts.byweekday.length; i++) {
                var wday = opts.byweekday[i];
                if (isNumber(wday)) {
                  byweekday.push(wday);
                  continue;
                } else if (isWeekdayStr(wday)) {
                  byweekday.push(Weekday.fromStr(wday).weekday);
                  continue;
                }
                if (!wday.n || opts.freq > RRule2.MONTHLY) {
                  byweekday.push(wday.weekday);
                } else {
                  bynweekday.push([wday.weekday, wday.n]);
                }
              }
              opts.byweekday = notEmpty(byweekday) ? byweekday : null;
              opts.bynweekday = notEmpty(bynweekday) ? bynweekday : null;
            }
            if (!isPresent(opts.byhour)) {
              opts.byhour = opts.freq < RRule2.HOURLY ? [opts.dtstart.getUTCHours()] : null;
            } else if (isNumber(opts.byhour)) {
              opts.byhour = [opts.byhour];
            }
            if (!isPresent(opts.byminute)) {
              opts.byminute = opts.freq < RRule2.MINUTELY ? [opts.dtstart.getUTCMinutes()] : null;
            } else if (isNumber(opts.byminute)) {
              opts.byminute = [opts.byminute];
            }
            if (!isPresent(opts.bysecond)) {
              opts.bysecond = opts.freq < RRule2.SECONDLY ? [opts.dtstart.getUTCSeconds()] : null;
            } else if (isNumber(opts.bysecond)) {
              opts.bysecond = [opts.bysecond];
            }
            return { parsedOptions: opts };
          }
          function buildTimeset(opts) {
            var millisecondModulo = opts.dtstart.getTime() % 1e3;
            if (!freqIsDailyOrGreater(opts.freq)) {
              return [];
            }
            var timeset = [];
            opts.byhour.forEach(function(hour) {
              opts.byminute.forEach(function(minute) {
                opts.bysecond.forEach(function(second) {
                  timeset.push(new Time(hour, minute, second, millisecondModulo));
                });
              });
            });
            return timeset;
          }
          ;
          function parseString(rfcString) {
            var options = rfcString.split("\n").map(parseLine).filter(function(x) {
              return x !== null;
            });
            return __assign(__assign({}, options[0]), options[1]);
          }
          function parseDtstart(line) {
            var options = {};
            var dtstartWithZone = /DTSTART(?:;TZID=([^:=]+?))?(?::|=)([^;\s]+)/i.exec(line);
            if (!dtstartWithZone) {
              return options;
            }
            var tzid = dtstartWithZone[1], dtstart = dtstartWithZone[2];
            if (tzid) {
              options.tzid = tzid;
            }
            options.dtstart = untilStringToDate(dtstart);
            return options;
          }
          function parseLine(rfcString) {
            rfcString = rfcString.replace(/^\s+|\s+$/, "");
            if (!rfcString.length)
              return null;
            var header = /^([A-Z]+?)[:;]/.exec(rfcString.toUpperCase());
            if (!header) {
              return parseRrule2(rfcString);
            }
            var key = header[1];
            switch (key.toUpperCase()) {
              case "RRULE":
              case "EXRULE":
                return parseRrule2(rfcString);
              case "DTSTART":
                return parseDtstart(rfcString);
              default:
                throw new Error("Unsupported RFC prop ".concat(key, " in ").concat(rfcString));
            }
          }
          function parseRrule2(line) {
            var strippedLine = line.replace(/^RRULE:/i, "");
            var options = parseDtstart(strippedLine);
            var attrs = line.replace(/^(?:RRULE|EXRULE):/i, "").split(";");
            attrs.forEach(function(attr) {
              var _a = attr.split("="), key = _a[0], value = _a[1];
              switch (key.toUpperCase()) {
                case "FREQ":
                  options.freq = Frequency[value.toUpperCase()];
                  break;
                case "WKST":
                  options.wkst = Days[value.toUpperCase()];
                  break;
                case "COUNT":
                case "INTERVAL":
                case "BYSETPOS":
                case "BYMONTH":
                case "BYMONTHDAY":
                case "BYYEARDAY":
                case "BYWEEKNO":
                case "BYHOUR":
                case "BYMINUTE":
                case "BYSECOND":
                  var num = parseNumber(value);
                  var optionKey = key.toLowerCase();
                  options[optionKey] = num;
                  break;
                case "BYWEEKDAY":
                case "BYDAY":
                  options.byweekday = parseWeekday(value);
                  break;
                case "DTSTART":
                case "TZID":
                  var dtstart = parseDtstart(line);
                  options.tzid = dtstart.tzid;
                  options.dtstart = dtstart.dtstart;
                  break;
                case "UNTIL":
                  options.until = untilStringToDate(value);
                  break;
                case "BYEASTER":
                  options.byeaster = Number(value);
                  break;
                default:
                  throw new Error("Unknown RRULE property '" + key + "'");
              }
            });
            return options;
          }
          function parseNumber(value) {
            if (value.indexOf(",") !== -1) {
              var values = value.split(",");
              return values.map(parseIndividualNumber);
            }
            return parseIndividualNumber(value);
          }
          function parseIndividualNumber(value) {
            if (/^[+-]?\d+$/.test(value)) {
              return Number(value);
            }
            return value;
          }
          function parseWeekday(value) {
            var days = value.split(",");
            return days.map(function(day) {
              if (day.length === 2) {
                return Days[day];
              }
              var parts = day.match(/^([+-]?\d{1,2})([A-Z]{2})$/);
              if (!parts || parts.length < 3) {
                throw new SyntaxError("Invalid weekday string: ".concat(day));
              }
              var n = Number(parts[1]);
              var wdaypart = parts[2];
              var wday = Days[wdaypart].weekday;
              return new Weekday(wday, n);
            });
          }
          ;
          var DateWithZone = (
            /** @class */
            (function() {
              function DateWithZone2(date, tzid) {
                if (isNaN(date.getTime())) {
                  throw new RangeError("Invalid date passed to DateWithZone");
                }
                this.date = date;
                this.tzid = tzid;
              }
              Object.defineProperty(DateWithZone2.prototype, "isUTC", {
                get: function() {
                  return !this.tzid || this.tzid.toUpperCase() === "UTC";
                },
                enumerable: false,
                configurable: true
              });
              DateWithZone2.prototype.toString = function() {
                var datestr = timeToUntilString(this.date.getTime(), this.isUTC);
                if (!this.isUTC) {
                  return ";TZID=".concat(this.tzid, ":").concat(datestr);
                }
                return ":".concat(datestr);
              };
              DateWithZone2.prototype.getTime = function() {
                return this.date.getTime();
              };
              DateWithZone2.prototype.rezonedDate = function() {
                if (this.isUTC) {
                  return this.date;
                }
                return dateInTimeZone(this.date, this.tzid);
              };
              return DateWithZone2;
            })()
          );
          ;
          function optionsToString(options) {
            var rrule = [];
            var dtstart = "";
            var keys = Object.keys(options);
            var defaultKeys2 = Object.keys(DEFAULT_OPTIONS);
            for (var i = 0; i < keys.length; i++) {
              if (keys[i] === "tzid")
                continue;
              if (!includes(defaultKeys2, keys[i]))
                continue;
              var key = keys[i].toUpperCase();
              var value = options[keys[i]];
              var outValue = "";
              if (!isPresent(value) || isArray(value) && !value.length)
                continue;
              switch (key) {
                case "FREQ":
                  outValue = RRule2.FREQUENCIES[options.freq];
                  break;
                case "WKST":
                  if (isNumber(value)) {
                    outValue = new Weekday(value).toString();
                  } else {
                    outValue = value.toString();
                  }
                  break;
                case "BYWEEKDAY":
                  key = "BYDAY";
                  outValue = toArray(value).map(function(wday) {
                    if (wday instanceof Weekday) {
                      return wday;
                    }
                    if (isArray(wday)) {
                      return new Weekday(wday[0], wday[1]);
                    }
                    return new Weekday(wday);
                  }).toString();
                  break;
                case "DTSTART":
                  dtstart = buildDtstart(value, options.tzid);
                  break;
                case "UNTIL":
                  outValue = timeToUntilString(value, !options.tzid);
                  break;
                default:
                  if (isArray(value)) {
                    var strValues = [];
                    for (var j = 0; j < value.length; j++) {
                      strValues[j] = String(value[j]);
                    }
                    outValue = strValues.toString();
                  } else {
                    outValue = String(value);
                  }
              }
              if (outValue) {
                rrule.push([key, outValue]);
              }
            }
            var rules = rrule.map(function(_a) {
              var key2 = _a[0], value2 = _a[1];
              return "".concat(key2, "=").concat(value2.toString());
            }).join(";");
            var ruleString = "";
            if (rules !== "") {
              ruleString = "RRULE:".concat(rules);
            }
            return [dtstart, ruleString].filter(function(x) {
              return !!x;
            }).join("\n");
          }
          function buildDtstart(dtstart, tzid) {
            if (!dtstart) {
              return "";
            }
            return "DTSTART" + new DateWithZone(new Date(dtstart), tzid).toString();
          }
          ;
          function argsMatch(left, right) {
            if (Array.isArray(left)) {
              if (!Array.isArray(right))
                return false;
              if (left.length !== right.length)
                return false;
              return left.every(function(date, i) {
                return date.getTime() === right[i].getTime();
              });
            }
            if (left instanceof Date) {
              return right instanceof Date && left.getTime() === right.getTime();
            }
            return left === right;
          }
          var Cache = (
            /** @class */
            (function() {
              function Cache2() {
                this.all = false;
                this.before = [];
                this.after = [];
                this.between = [];
              }
              Cache2.prototype._cacheAdd = function(what, value, args) {
                if (value) {
                  value = value instanceof Date ? dateutil_clone(value) : cloneDates(value);
                }
                if (what === "all") {
                  this.all = value;
                } else {
                  args._value = value;
                  this[what].push(args);
                }
              };
              Cache2.prototype._cacheGet = function(what, args) {
                var cached = false;
                var argsKeys = args ? Object.keys(args) : [];
                var findCacheDiff = function(item2) {
                  for (var i2 = 0; i2 < argsKeys.length; i2++) {
                    var key = argsKeys[i2];
                    if (!argsMatch(args[key], item2[key])) {
                      return true;
                    }
                  }
                  return false;
                };
                var cachedObject = this[what];
                if (what === "all") {
                  cached = this.all;
                } else if (isArray(cachedObject)) {
                  for (var i = 0; i < cachedObject.length; i++) {
                    var item = cachedObject[i];
                    if (argsKeys.length && findCacheDiff(item))
                      continue;
                    cached = item._value;
                    break;
                  }
                }
                if (!cached && this.all) {
                  var iterResult = new iterresult(what, args);
                  for (var i = 0; i < this.all.length; i++) {
                    if (!iterResult.accept(this.all[i]))
                      break;
                  }
                  cached = iterResult.getValue();
                  this._cacheAdd(what, cached, args);
                }
                return isArray(cached) ? cloneDates(cached) : cached instanceof Date ? dateutil_clone(cached) : cached;
              };
              return Cache2;
            })()
          );
          ;
          var M365MASK = __spreadArray(__spreadArray(__spreadArray(__spreadArray(__spreadArray(__spreadArray(__spreadArray(__spreadArray(__spreadArray(__spreadArray(__spreadArray(__spreadArray(__spreadArray([], repeat(1, 31), true), repeat(2, 28), true), repeat(3, 31), true), repeat(4, 30), true), repeat(5, 31), true), repeat(6, 30), true), repeat(7, 31), true), repeat(8, 31), true), repeat(9, 30), true), repeat(10, 31), true), repeat(11, 30), true), repeat(12, 31), true), repeat(1, 7), true);
          var M366MASK = __spreadArray(__spreadArray(__spreadArray(__spreadArray(__spreadArray(__spreadArray(__spreadArray(__spreadArray(__spreadArray(__spreadArray(__spreadArray(__spreadArray(__spreadArray([], repeat(1, 31), true), repeat(2, 29), true), repeat(3, 31), true), repeat(4, 30), true), repeat(5, 31), true), repeat(6, 30), true), repeat(7, 31), true), repeat(8, 31), true), repeat(9, 30), true), repeat(10, 31), true), repeat(11, 30), true), repeat(12, 31), true), repeat(1, 7), true);
          var M28 = range(1, 29);
          var M29 = range(1, 30);
          var M30 = range(1, 31);
          var M31 = range(1, 32);
          var MDAY366MASK = __spreadArray(__spreadArray(__spreadArray(__spreadArray(__spreadArray(__spreadArray(__spreadArray(__spreadArray(__spreadArray(__spreadArray(__spreadArray(__spreadArray(__spreadArray([], M31, true), M29, true), M31, true), M30, true), M31, true), M30, true), M31, true), M31, true), M30, true), M31, true), M30, true), M31, true), M31.slice(0, 7), true);
          var MDAY365MASK = __spreadArray(__spreadArray(__spreadArray(__spreadArray(__spreadArray(__spreadArray(__spreadArray(__spreadArray(__spreadArray(__spreadArray(__spreadArray(__spreadArray(__spreadArray([], M31, true), M28, true), M31, true), M30, true), M31, true), M30, true), M31, true), M31, true), M30, true), M31, true), M30, true), M31, true), M31.slice(0, 7), true);
          var NM28 = range(-28, 0);
          var NM29 = range(-29, 0);
          var NM30 = range(-30, 0);
          var NM31 = range(-31, 0);
          var NMDAY366MASK = __spreadArray(__spreadArray(__spreadArray(__spreadArray(__spreadArray(__spreadArray(__spreadArray(__spreadArray(__spreadArray(__spreadArray(__spreadArray(__spreadArray(__spreadArray([], NM31, true), NM29, true), NM31, true), NM30, true), NM31, true), NM30, true), NM31, true), NM31, true), NM30, true), NM31, true), NM30, true), NM31, true), NM31.slice(0, 7), true);
          var NMDAY365MASK = __spreadArray(__spreadArray(__spreadArray(__spreadArray(__spreadArray(__spreadArray(__spreadArray(__spreadArray(__spreadArray(__spreadArray(__spreadArray(__spreadArray(__spreadArray([], NM31, true), NM28, true), NM31, true), NM30, true), NM31, true), NM30, true), NM31, true), NM31, true), NM30, true), NM31, true), NM30, true), NM31, true), NM31.slice(0, 7), true);
          var M366RANGE = [0, 31, 60, 91, 121, 152, 182, 213, 244, 274, 305, 335, 366];
          var M365RANGE = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334, 365];
          var WDAYMASK = (function() {
            var wdaymask = [];
            for (var i = 0; i < 55; i++)
              wdaymask = wdaymask.concat(range(7));
            return wdaymask;
          })();
          ;
          function rebuildYear(year, options) {
            var firstyday = datetime(year, 1, 1);
            var yearlen = isLeapYear3(year) ? 366 : 365;
            var nextyearlen = isLeapYear3(year + 1) ? 366 : 365;
            var yearordinal = toOrdinal(firstyday);
            var yearweekday = getWeekday(firstyday);
            var result = __assign(__assign({ yearlen, nextyearlen, yearordinal, yearweekday }, baseYearMasks(year)), { wnomask: null });
            if (empty(options.byweekno)) {
              return result;
            }
            result.wnomask = repeat(0, yearlen + 7);
            var firstwkst;
            var wyearlen;
            var no1wkst = firstwkst = pymod(7 - yearweekday + options.wkst, 7);
            if (no1wkst >= 4) {
              no1wkst = 0;
              wyearlen = result.yearlen + pymod(yearweekday - options.wkst, 7);
            } else {
              wyearlen = yearlen - no1wkst;
            }
            var div = Math.floor(wyearlen / 7);
            var mod = pymod(wyearlen, 7);
            var numweeks = Math.floor(div + mod / 4);
            for (var j = 0; j < options.byweekno.length; j++) {
              var n = options.byweekno[j];
              if (n < 0) {
                n += numweeks + 1;
              }
              if (!(n > 0 && n <= numweeks)) {
                continue;
              }
              var i = void 0;
              if (n > 1) {
                i = no1wkst + (n - 1) * 7;
                if (no1wkst !== firstwkst) {
                  i -= 7 - firstwkst;
                }
              } else {
                i = no1wkst;
              }
              for (var k = 0; k < 7; k++) {
                result.wnomask[i] = 1;
                i++;
                if (result.wdaymask[i] === options.wkst)
                  break;
              }
            }
            if (includes(options.byweekno, 1)) {
              var i = no1wkst + numweeks * 7;
              if (no1wkst !== firstwkst)
                i -= 7 - firstwkst;
              if (i < yearlen) {
                for (var j = 0; j < 7; j++) {
                  result.wnomask[i] = 1;
                  i += 1;
                  if (result.wdaymask[i] === options.wkst)
                    break;
                }
              }
            }
            if (no1wkst) {
              var lnumweeks = void 0;
              if (!includes(options.byweekno, -1)) {
                var lyearweekday = getWeekday(datetime(year - 1, 1, 1));
                var lno1wkst = pymod(7 - lyearweekday.valueOf() + options.wkst, 7);
                var lyearlen = isLeapYear3(year - 1) ? 366 : 365;
                var weekst = void 0;
                if (lno1wkst >= 4) {
                  lno1wkst = 0;
                  weekst = lyearlen + pymod(lyearweekday - options.wkst, 7);
                } else {
                  weekst = yearlen - no1wkst;
                }
                lnumweeks = Math.floor(52 + pymod(weekst, 7) / 4);
              } else {
                lnumweeks = -1;
              }
              if (includes(options.byweekno, lnumweeks)) {
                for (var i = 0; i < no1wkst; i++)
                  result.wnomask[i] = 1;
              }
            }
            return result;
          }
          function baseYearMasks(year) {
            var yearlen = isLeapYear3(year) ? 366 : 365;
            var firstyday = datetime(year, 1, 1);
            var wday = getWeekday(firstyday);
            if (yearlen === 365) {
              return {
                mmask: M365MASK,
                mdaymask: MDAY365MASK,
                nmdaymask: NMDAY365MASK,
                wdaymask: WDAYMASK.slice(wday),
                mrange: M365RANGE
              };
            }
            return {
              mmask: M366MASK,
              mdaymask: MDAY366MASK,
              nmdaymask: NMDAY366MASK,
              wdaymask: WDAYMASK.slice(wday),
              mrange: M366RANGE
            };
          }
          ;
          function rebuildMonth(year, month, yearlen, mrange, wdaymask, options) {
            var result = {
              lastyear: year,
              lastmonth: month,
              nwdaymask: []
            };
            var ranges = [];
            if (options.freq === RRule2.YEARLY) {
              if (empty(options.bymonth)) {
                ranges = [[0, yearlen]];
              } else {
                for (var j = 0; j < options.bymonth.length; j++) {
                  month = options.bymonth[j];
                  ranges.push(mrange.slice(month - 1, month + 1));
                }
              }
            } else if (options.freq === RRule2.MONTHLY) {
              ranges = [mrange.slice(month - 1, month + 1)];
            }
            if (empty(ranges)) {
              return result;
            }
            result.nwdaymask = repeat(0, yearlen);
            for (var j = 0; j < ranges.length; j++) {
              var rang = ranges[j];
              var first = rang[0];
              var last = rang[1] - 1;
              for (var k = 0; k < options.bynweekday.length; k++) {
                var i = void 0;
                var _a = options.bynweekday[k], wday = _a[0], n = _a[1];
                if (n < 0) {
                  i = last + (n + 1) * 7;
                  i -= pymod(wdaymask[i] - wday, 7);
                } else {
                  i = first + (n - 1) * 7;
                  i += pymod(7 - wdaymask[i] + wday, 7);
                }
                if (first <= i && i <= last)
                  result.nwdaymask[i] = 1;
              }
            }
            return result;
          }
          ;
          function easter(y, offset) {
            if (offset === void 0) {
              offset = 0;
            }
            var a = y % 19;
            var b = Math.floor(y / 100);
            var c = y % 100;
            var d = Math.floor(b / 4);
            var e = b % 4;
            var f = Math.floor((b + 8) / 25);
            var g = Math.floor((b - f + 1) / 3);
            var h = Math.floor(19 * a + b - d - g + 15) % 30;
            var i = Math.floor(c / 4);
            var k = c % 4;
            var l = Math.floor(32 + 2 * e + 2 * i - h - k) % 7;
            var m = Math.floor((a + 11 * h + 22 * l) / 451);
            var month = Math.floor((h + l - 7 * m + 114) / 31);
            var day = (h + l - 7 * m + 114) % 31 + 1;
            var date = Date.UTC(y, month - 1, day + offset);
            var yearStart = Date.UTC(y, 0, 1);
            return [Math.ceil((date - yearStart) / (1e3 * 60 * 60 * 24))];
          }
          ;
          var Iterinfo = (
            /** @class */
            (function() {
              function Iterinfo2(options) {
                this.options = options;
              }
              Iterinfo2.prototype.rebuild = function(year, month) {
                var options = this.options;
                if (year !== this.lastyear) {
                  this.yearinfo = rebuildYear(year, options);
                }
                if (notEmpty(options.bynweekday) && (month !== this.lastmonth || year !== this.lastyear)) {
                  var _a = this.yearinfo, yearlen = _a.yearlen, mrange = _a.mrange, wdaymask = _a.wdaymask;
                  this.monthinfo = rebuildMonth(year, month, yearlen, mrange, wdaymask, options);
                }
                if (isPresent(options.byeaster)) {
                  this.eastermask = easter(year, options.byeaster);
                }
              };
              Object.defineProperty(Iterinfo2.prototype, "lastyear", {
                get: function() {
                  return this.monthinfo ? this.monthinfo.lastyear : null;
                },
                enumerable: false,
                configurable: true
              });
              Object.defineProperty(Iterinfo2.prototype, "lastmonth", {
                get: function() {
                  return this.monthinfo ? this.monthinfo.lastmonth : null;
                },
                enumerable: false,
                configurable: true
              });
              Object.defineProperty(Iterinfo2.prototype, "yearlen", {
                get: function() {
                  return this.yearinfo.yearlen;
                },
                enumerable: false,
                configurable: true
              });
              Object.defineProperty(Iterinfo2.prototype, "yearordinal", {
                get: function() {
                  return this.yearinfo.yearordinal;
                },
                enumerable: false,
                configurable: true
              });
              Object.defineProperty(Iterinfo2.prototype, "mrange", {
                get: function() {
                  return this.yearinfo.mrange;
                },
                enumerable: false,
                configurable: true
              });
              Object.defineProperty(Iterinfo2.prototype, "wdaymask", {
                get: function() {
                  return this.yearinfo.wdaymask;
                },
                enumerable: false,
                configurable: true
              });
              Object.defineProperty(Iterinfo2.prototype, "mmask", {
                get: function() {
                  return this.yearinfo.mmask;
                },
                enumerable: false,
                configurable: true
              });
              Object.defineProperty(Iterinfo2.prototype, "wnomask", {
                get: function() {
                  return this.yearinfo.wnomask;
                },
                enumerable: false,
                configurable: true
              });
              Object.defineProperty(Iterinfo2.prototype, "nwdaymask", {
                get: function() {
                  return this.monthinfo ? this.monthinfo.nwdaymask : [];
                },
                enumerable: false,
                configurable: true
              });
              Object.defineProperty(Iterinfo2.prototype, "nextyearlen", {
                get: function() {
                  return this.yearinfo.nextyearlen;
                },
                enumerable: false,
                configurable: true
              });
              Object.defineProperty(Iterinfo2.prototype, "mdaymask", {
                get: function() {
                  return this.yearinfo.mdaymask;
                },
                enumerable: false,
                configurable: true
              });
              Object.defineProperty(Iterinfo2.prototype, "nmdaymask", {
                get: function() {
                  return this.yearinfo.nmdaymask;
                },
                enumerable: false,
                configurable: true
              });
              Iterinfo2.prototype.ydayset = function() {
                return [range(this.yearlen), 0, this.yearlen];
              };
              Iterinfo2.prototype.mdayset = function(_, month) {
                var start = this.mrange[month - 1];
                var end = this.mrange[month];
                var set = repeat(null, this.yearlen);
                for (var i = start; i < end; i++)
                  set[i] = i;
                return [set, start, end];
              };
              Iterinfo2.prototype.wdayset = function(year, month, day) {
                var set = repeat(null, this.yearlen + 7);
                var i = toOrdinal(datetime(year, month, day)) - this.yearordinal;
                var start = i;
                for (var j = 0; j < 7; j++) {
                  set[i] = i;
                  ++i;
                  if (this.wdaymask[i] === this.options.wkst)
                    break;
                }
                return [set, start, i];
              };
              Iterinfo2.prototype.ddayset = function(year, month, day) {
                var set = repeat(null, this.yearlen);
                var i = toOrdinal(datetime(year, month, day)) - this.yearordinal;
                set[i] = i;
                return [set, i, i + 1];
              };
              Iterinfo2.prototype.htimeset = function(hour, _, second, millisecond) {
                var _this = this;
                var set = [];
                this.options.byminute.forEach(function(minute) {
                  set = set.concat(_this.mtimeset(hour, minute, second, millisecond));
                });
                sort(set);
                return set;
              };
              Iterinfo2.prototype.mtimeset = function(hour, minute, _, millisecond) {
                var set = this.options.bysecond.map(function(second) {
                  return new Time(hour, minute, second, millisecond);
                });
                sort(set);
                return set;
              };
              Iterinfo2.prototype.stimeset = function(hour, minute, second, millisecond) {
                return [new Time(hour, minute, second, millisecond)];
              };
              Iterinfo2.prototype.getdayset = function(freq) {
                switch (freq) {
                  case Frequency.YEARLY:
                    return this.ydayset.bind(this);
                  case Frequency.MONTHLY:
                    return this.mdayset.bind(this);
                  case Frequency.WEEKLY:
                    return this.wdayset.bind(this);
                  case Frequency.DAILY:
                    return this.ddayset.bind(this);
                  default:
                    return this.ddayset.bind(this);
                }
              };
              Iterinfo2.prototype.gettimeset = function(freq) {
                switch (freq) {
                  case Frequency.HOURLY:
                    return this.htimeset.bind(this);
                  case Frequency.MINUTELY:
                    return this.mtimeset.bind(this);
                  case Frequency.SECONDLY:
                    return this.stimeset.bind(this);
                }
              };
              return Iterinfo2;
            })()
          );
          const iterinfo = Iterinfo;
          ;
          function buildPoslist(bysetpos, timeset, start, end, ii, dayset) {
            var poslist = [];
            for (var j = 0; j < bysetpos.length; j++) {
              var daypos = void 0;
              var timepos = void 0;
              var pos = bysetpos[j];
              if (pos < 0) {
                daypos = Math.floor(pos / timeset.length);
                timepos = pymod(pos, timeset.length);
              } else {
                daypos = Math.floor((pos - 1) / timeset.length);
                timepos = pymod(pos - 1, timeset.length);
              }
              var tmp = [];
              for (var k = start; k < end; k++) {
                var val = dayset[k];
                if (!isPresent(val))
                  continue;
                tmp.push(val);
              }
              var i = void 0;
              if (daypos < 0) {
                i = tmp.slice(daypos)[0];
              } else {
                i = tmp[daypos];
              }
              var time = timeset[timepos];
              var date = fromOrdinal(ii.yearordinal + i);
              var res = combine(date, time);
              if (!includes(poslist, res))
                poslist.push(res);
            }
            sort(poslist);
            return poslist;
          }
          ;
          function iter(iterResult, options) {
            var dtstart = options.dtstart, freq = options.freq, interval = options.interval, until = options.until, bysetpos = options.bysetpos;
            var count = options.count;
            if (count === 0 || interval === 0) {
              return emitResult(iterResult);
            }
            var counterDate = DateTime.fromDate(dtstart);
            var ii = new iterinfo(options);
            ii.rebuild(counterDate.year, counterDate.month);
            var timeset = makeTimeset(ii, counterDate, options);
            for (; ; ) {
              var _a = ii.getdayset(freq)(counterDate.year, counterDate.month, counterDate.day), dayset = _a[0], start = _a[1], end = _a[2];
              var filtered = removeFilteredDays(dayset, start, end, ii, options);
              if (notEmpty(bysetpos)) {
                var poslist = buildPoslist(bysetpos, timeset, start, end, ii, dayset);
                for (var j = 0; j < poslist.length; j++) {
                  var res = poslist[j];
                  if (until && res > until) {
                    return emitResult(iterResult);
                  }
                  if (res >= dtstart) {
                    var rezonedDate = rezoneIfNeeded(res, options);
                    if (!iterResult.accept(rezonedDate)) {
                      return emitResult(iterResult);
                    }
                    if (count) {
                      --count;
                      if (!count) {
                        return emitResult(iterResult);
                      }
                    }
                  }
                }
              } else {
                for (var j = start; j < end; j++) {
                  var currentDay = dayset[j];
                  if (!isPresent(currentDay)) {
                    continue;
                  }
                  var date = fromOrdinal(ii.yearordinal + currentDay);
                  for (var k = 0; k < timeset.length; k++) {
                    var time = timeset[k];
                    var res = combine(date, time);
                    if (until && res > until) {
                      return emitResult(iterResult);
                    }
                    if (res >= dtstart) {
                      var rezonedDate = rezoneIfNeeded(res, options);
                      if (!iterResult.accept(rezonedDate)) {
                        return emitResult(iterResult);
                      }
                      if (count) {
                        --count;
                        if (!count) {
                          return emitResult(iterResult);
                        }
                      }
                    }
                  }
                }
              }
              if (options.interval === 0) {
                return emitResult(iterResult);
              }
              counterDate.add(options, filtered);
              if (counterDate.year > MAXYEAR) {
                return emitResult(iterResult);
              }
              if (!freqIsDailyOrGreater(freq)) {
                timeset = ii.gettimeset(freq)(counterDate.hour, counterDate.minute, counterDate.second, 0);
              }
              ii.rebuild(counterDate.year, counterDate.month);
            }
          }
          function isFiltered(ii, currentDay, options) {
            var bymonth = options.bymonth, byweekno = options.byweekno, byweekday = options.byweekday, byeaster = options.byeaster, bymonthday = options.bymonthday, bynmonthday = options.bynmonthday, byyearday = options.byyearday;
            return notEmpty(bymonth) && !includes(bymonth, ii.mmask[currentDay]) || notEmpty(byweekno) && !ii.wnomask[currentDay] || notEmpty(byweekday) && !includes(byweekday, ii.wdaymask[currentDay]) || notEmpty(ii.nwdaymask) && !ii.nwdaymask[currentDay] || byeaster !== null && !includes(ii.eastermask, currentDay) || (notEmpty(bymonthday) || notEmpty(bynmonthday)) && !includes(bymonthday, ii.mdaymask[currentDay]) && !includes(bynmonthday, ii.nmdaymask[currentDay]) || notEmpty(byyearday) && (currentDay < ii.yearlen && !includes(byyearday, currentDay + 1) && !includes(byyearday, -ii.yearlen + currentDay) || currentDay >= ii.yearlen && !includes(byyearday, currentDay + 1 - ii.yearlen) && !includes(byyearday, -ii.nextyearlen + currentDay - ii.yearlen));
          }
          function rezoneIfNeeded(date, options) {
            return new DateWithZone(date, options.tzid).rezonedDate();
          }
          function emitResult(iterResult) {
            return iterResult.getValue();
          }
          function removeFilteredDays(dayset, start, end, ii, options) {
            var filtered = false;
            for (var dayCounter = start; dayCounter < end; dayCounter++) {
              var currentDay = dayset[dayCounter];
              filtered = isFiltered(ii, currentDay, options);
              if (filtered)
                dayset[currentDay] = null;
            }
            return filtered;
          }
          function makeTimeset(ii, counterDate, options) {
            var freq = options.freq, byhour = options.byhour, byminute = options.byminute, bysecond = options.bysecond;
            if (freqIsDailyOrGreater(freq)) {
              return buildTimeset(options);
            }
            if (freq >= RRule2.HOURLY && notEmpty(byhour) && !includes(byhour, counterDate.hour) || freq >= RRule2.MINUTELY && notEmpty(byminute) && !includes(byminute, counterDate.minute) || freq >= RRule2.SECONDLY && notEmpty(bysecond) && !includes(bysecond, counterDate.second)) {
              return [];
            }
            return ii.gettimeset(freq)(counterDate.hour, counterDate.minute, counterDate.second, counterDate.millisecond);
          }
          ;
          var Days = {
            MO: new Weekday(0),
            TU: new Weekday(1),
            WE: new Weekday(2),
            TH: new Weekday(3),
            FR: new Weekday(4),
            SA: new Weekday(5),
            SU: new Weekday(6)
          };
          var DEFAULT_OPTIONS = {
            freq: Frequency.YEARLY,
            dtstart: null,
            interval: 1,
            wkst: Days.MO,
            count: null,
            until: null,
            tzid: null,
            bysetpos: null,
            bymonth: null,
            bymonthday: null,
            bynmonthday: null,
            byyearday: null,
            byweekno: null,
            byweekday: null,
            bynweekday: null,
            byhour: null,
            byminute: null,
            bysecond: null,
            byeaster: null
          };
          var defaultKeys = Object.keys(DEFAULT_OPTIONS);
          var RRule2 = (
            /** @class */
            (function() {
              function RRule3(options, noCache) {
                if (options === void 0) {
                  options = {};
                }
                if (noCache === void 0) {
                  noCache = false;
                }
                this._cache = noCache ? null : new Cache();
                this.origOptions = initializeOptions(options);
                var parsedOptions = parseOptions(options).parsedOptions;
                this.options = parsedOptions;
              }
              RRule3.parseText = function(text, language) {
                return parseText(text, language);
              };
              RRule3.fromText = function(text, language) {
                return fromText(text, language);
              };
              RRule3.fromString = function(str) {
                return new RRule3(RRule3.parseString(str) || void 0);
              };
              RRule3.prototype._iter = function(iterResult) {
                return iter(iterResult, this.options);
              };
              RRule3.prototype._cacheGet = function(what, args) {
                if (!this._cache)
                  return false;
                return this._cache._cacheGet(what, args);
              };
              RRule3.prototype._cacheAdd = function(what, value, args) {
                if (!this._cache)
                  return;
                return this._cache._cacheAdd(what, value, args);
              };
              RRule3.prototype.all = function(iterator) {
                if (iterator) {
                  return this._iter(new callbackiterresult("all", {}, iterator));
                }
                var result = this._cacheGet("all");
                if (result === false) {
                  result = this._iter(new iterresult("all", {}));
                  this._cacheAdd("all", result);
                }
                return result;
              };
              RRule3.prototype.between = function(after, before, inc, iterator) {
                if (inc === void 0) {
                  inc = false;
                }
                if (!isValidDate(after) || !isValidDate(before)) {
                  throw new Error("Invalid date passed in to RRule.between");
                }
                var args = {
                  before,
                  after,
                  inc
                };
                if (iterator) {
                  return this._iter(new callbackiterresult("between", args, iterator));
                }
                var result = this._cacheGet("between", args);
                if (result === false) {
                  result = this._iter(new iterresult("between", args));
                  this._cacheAdd("between", result, args);
                }
                return result;
              };
              RRule3.prototype.before = function(dt, inc) {
                if (inc === void 0) {
                  inc = false;
                }
                if (!isValidDate(dt)) {
                  throw new Error("Invalid date passed in to RRule.before");
                }
                var args = { dt, inc };
                var result = this._cacheGet("before", args);
                if (result === false) {
                  result = this._iter(new iterresult("before", args));
                  this._cacheAdd("before", result, args);
                }
                return result;
              };
              RRule3.prototype.after = function(dt, inc) {
                if (inc === void 0) {
                  inc = false;
                }
                if (!isValidDate(dt)) {
                  throw new Error("Invalid date passed in to RRule.after");
                }
                var args = { dt, inc };
                var result = this._cacheGet("after", args);
                if (result === false) {
                  result = this._iter(new iterresult("after", args));
                  this._cacheAdd("after", result, args);
                }
                return result;
              };
              RRule3.prototype.count = function() {
                return this.all().length;
              };
              RRule3.prototype.toString = function() {
                return optionsToString(this.origOptions);
              };
              RRule3.prototype.toText = function(gettext, language, dateFormatter) {
                return toText(this, gettext, language, dateFormatter);
              };
              RRule3.prototype.isFullyConvertibleToText = function() {
                return isFullyConvertible(this);
              };
              RRule3.prototype.clone = function() {
                return new RRule3(this.origOptions);
              };
              RRule3.FREQUENCIES = [
                "YEARLY",
                "MONTHLY",
                "WEEKLY",
                "DAILY",
                "HOURLY",
                "MINUTELY",
                "SECONDLY"
              ];
              RRule3.YEARLY = Frequency.YEARLY;
              RRule3.MONTHLY = Frequency.MONTHLY;
              RRule3.WEEKLY = Frequency.WEEKLY;
              RRule3.DAILY = Frequency.DAILY;
              RRule3.HOURLY = Frequency.HOURLY;
              RRule3.MINUTELY = Frequency.MINUTELY;
              RRule3.SECONDLY = Frequency.SECONDLY;
              RRule3.MO = Days.MO;
              RRule3.TU = Days.TU;
              RRule3.WE = Days.WE;
              RRule3.TH = Days.TH;
              RRule3.FR = Days.FR;
              RRule3.SA = Days.SA;
              RRule3.SU = Days.SU;
              RRule3.parseString = parseString;
              RRule3.optionsToString = optionsToString;
              return RRule3;
            })()
          );
          ;
          function iterSet(iterResult, _rrule, _exrule, _rdate, _exdate, tzid) {
            var _exdateHash = {};
            var _accept = iterResult.accept;
            function evalExdate(after, before) {
              _exrule.forEach(function(rrule) {
                rrule.between(after, before, true).forEach(function(date) {
                  _exdateHash[Number(date)] = true;
                });
              });
            }
            _exdate.forEach(function(date) {
              var zonedDate2 = new DateWithZone(date, tzid).rezonedDate();
              _exdateHash[Number(zonedDate2)] = true;
            });
            iterResult.accept = function(date) {
              var dt = Number(date);
              if (isNaN(dt))
                return _accept.call(this, date);
              if (!_exdateHash[dt]) {
                evalExdate(new Date(dt - 1), new Date(dt + 1));
                if (!_exdateHash[dt]) {
                  _exdateHash[dt] = true;
                  return _accept.call(this, date);
                }
              }
              return true;
            };
            if (iterResult.method === "between") {
              evalExdate(iterResult.args.after, iterResult.args.before);
              iterResult.accept = function(date) {
                var dt = Number(date);
                if (!_exdateHash[dt]) {
                  _exdateHash[dt] = true;
                  return _accept.call(this, date);
                }
                return true;
              };
            }
            for (var i = 0; i < _rdate.length; i++) {
              var zonedDate = new DateWithZone(_rdate[i], tzid).rezonedDate();
              if (!iterResult.accept(new Date(zonedDate.getTime())))
                break;
            }
            _rrule.forEach(function(rrule) {
              iter(iterResult, rrule.options);
            });
            var res = iterResult._result;
            sort(res);
            switch (iterResult.method) {
              case "all":
              case "between":
                return res;
              case "before":
                return res.length && res[res.length - 1] || null;
              case "after":
              default:
                return res.length && res[0] || null;
            }
          }
          ;
          var rrulestr_DEFAULT_OPTIONS = {
            dtstart: null,
            cache: false,
            unfold: false,
            forceset: false,
            compatible: false,
            tzid: null
          };
          function parseInput(s, options) {
            var rrulevals = [];
            var rdatevals = [];
            var exrulevals = [];
            var exdatevals = [];
            var parsedDtstart = parseDtstart(s);
            var dtstart = parsedDtstart.dtstart;
            var tzid = parsedDtstart.tzid;
            var lines = splitIntoLines(s, options.unfold);
            lines.forEach(function(line) {
              var _a;
              if (!line)
                return;
              var _b = breakDownLine(line), name = _b.name, parms = _b.parms, value = _b.value;
              switch (name.toUpperCase()) {
                case "RRULE":
                  if (parms.length) {
                    throw new Error("unsupported RRULE parm: ".concat(parms.join(",")));
                  }
                  rrulevals.push(parseString(line));
                  break;
                case "RDATE":
                  var _c = (_a = /RDATE(?:;TZID=([^:=]+))?/i.exec(line)) !== null && _a !== void 0 ? _a : [], rdateTzid = _c[1];
                  if (rdateTzid && !tzid) {
                    tzid = rdateTzid;
                  }
                  rdatevals = rdatevals.concat(parseRDate(value, parms));
                  break;
                case "EXRULE":
                  if (parms.length) {
                    throw new Error("unsupported EXRULE parm: ".concat(parms.join(",")));
                  }
                  exrulevals.push(parseString(value));
                  break;
                case "EXDATE":
                  exdatevals = exdatevals.concat(parseRDate(value, parms));
                  break;
                case "DTSTART":
                  break;
                default:
                  throw new Error("unsupported property: " + name);
              }
            });
            return {
              dtstart,
              tzid,
              rrulevals,
              rdatevals,
              exrulevals,
              exdatevals
            };
          }
          function buildRule(s, options) {
            var _a = parseInput(s, options), rrulevals = _a.rrulevals, rdatevals = _a.rdatevals, exrulevals = _a.exrulevals, exdatevals = _a.exdatevals, dtstart = _a.dtstart, tzid = _a.tzid;
            var noCache = options.cache === false;
            if (options.compatible) {
              options.forceset = true;
              options.unfold = true;
            }
            if (options.forceset || rrulevals.length > 1 || rdatevals.length || exrulevals.length || exdatevals.length) {
              var rset_1 = new RRuleSet(noCache);
              rset_1.dtstart(dtstart);
              rset_1.tzid(tzid || void 0);
              rrulevals.forEach(function(val2) {
                rset_1.rrule(new RRule2(groomRruleOptions(val2, dtstart, tzid), noCache));
              });
              rdatevals.forEach(function(date) {
                rset_1.rdate(date);
              });
              exrulevals.forEach(function(val2) {
                rset_1.exrule(new RRule2(groomRruleOptions(val2, dtstart, tzid), noCache));
              });
              exdatevals.forEach(function(date) {
                rset_1.exdate(date);
              });
              if (options.compatible && options.dtstart)
                rset_1.rdate(dtstart);
              return rset_1;
            }
            var val = rrulevals[0] || {};
            return new RRule2(groomRruleOptions(val, val.dtstart || options.dtstart || dtstart, val.tzid || options.tzid || tzid), noCache);
          }
          function rrulestr(s, options) {
            if (options === void 0) {
              options = {};
            }
            return buildRule(s, rrulestr_initializeOptions(options));
          }
          function groomRruleOptions(val, dtstart, tzid) {
            return __assign(__assign({}, val), { dtstart, tzid });
          }
          function rrulestr_initializeOptions(options) {
            var invalid2 = [];
            var keys = Object.keys(options);
            var defaultKeys2 = Object.keys(rrulestr_DEFAULT_OPTIONS);
            keys.forEach(function(key) {
              if (!includes(defaultKeys2, key))
                invalid2.push(key);
            });
            if (invalid2.length) {
              throw new Error("Invalid options: " + invalid2.join(", "));
            }
            return __assign(__assign({}, rrulestr_DEFAULT_OPTIONS), options);
          }
          function extractName(line) {
            if (line.indexOf(":") === -1) {
              return {
                name: "RRULE",
                value: line
              };
            }
            var _a = split(line, ":", 1), name = _a[0], value = _a[1];
            return {
              name,
              value
            };
          }
          function breakDownLine(line) {
            var _a = extractName(line), name = _a.name, value = _a.value;
            var parms = name.split(";");
            if (!parms)
              throw new Error("empty property name");
            return {
              name: parms[0].toUpperCase(),
              parms: parms.slice(1),
              value
            };
          }
          function splitIntoLines(s, unfold) {
            if (unfold === void 0) {
              unfold = false;
            }
            s = s && s.trim();
            if (!s)
              throw new Error("Invalid empty string");
            if (!unfold) {
              return s.split(/\s/);
            }
            var lines = s.split("\n");
            var i = 0;
            while (i < lines.length) {
              var line = lines[i] = lines[i].replace(/\s+$/g, "");
              if (!line) {
                lines.splice(i, 1);
              } else if (i > 0 && line[0] === " ") {
                lines[i - 1] += line.slice(1);
                lines.splice(i, 1);
              } else {
                i += 1;
              }
            }
            return lines;
          }
          function validateDateParm(parms) {
            parms.forEach(function(parm) {
              if (!/(VALUE=DATE(-TIME)?)|(TZID=)/.test(parm)) {
                throw new Error("unsupported RDATE/EXDATE parm: " + parm);
              }
            });
          }
          function parseRDate(rdateval, parms) {
            validateDateParm(parms);
            return rdateval.split(",").map(function(datestr) {
              return untilStringToDate(datestr);
            });
          }
          ;
          function createGetterSetter(fieldName) {
            var _this = this;
            return function(field) {
              if (field !== void 0) {
                _this["_".concat(fieldName)] = field;
              }
              if (_this["_".concat(fieldName)] !== void 0) {
                return _this["_".concat(fieldName)];
              }
              for (var i = 0; i < _this._rrule.length; i++) {
                var field_1 = _this._rrule[i].origOptions[fieldName];
                if (field_1) {
                  return field_1;
                }
              }
            };
          }
          var RRuleSet = (
            /** @class */
            (function(_super) {
              __extends(RRuleSet2, _super);
              function RRuleSet2(noCache) {
                if (noCache === void 0) {
                  noCache = false;
                }
                var _this = _super.call(this, {}, noCache) || this;
                _this.dtstart = createGetterSetter.apply(_this, ["dtstart"]);
                _this.tzid = createGetterSetter.apply(_this, ["tzid"]);
                _this._rrule = [];
                _this._rdate = [];
                _this._exrule = [];
                _this._exdate = [];
                return _this;
              }
              RRuleSet2.prototype._iter = function(iterResult) {
                return iterSet(iterResult, this._rrule, this._exrule, this._rdate, this._exdate, this.tzid());
              };
              RRuleSet2.prototype.rrule = function(rrule) {
                _addRule(rrule, this._rrule);
              };
              RRuleSet2.prototype.exrule = function(rrule) {
                _addRule(rrule, this._exrule);
              };
              RRuleSet2.prototype.rdate = function(date) {
                _addDate(date, this._rdate);
              };
              RRuleSet2.prototype.exdate = function(date) {
                _addDate(date, this._exdate);
              };
              RRuleSet2.prototype.rrules = function() {
                return this._rrule.map(function(e) {
                  return rrulestr(e.toString());
                });
              };
              RRuleSet2.prototype.exrules = function() {
                return this._exrule.map(function(e) {
                  return rrulestr(e.toString());
                });
              };
              RRuleSet2.prototype.rdates = function() {
                return this._rdate.map(function(e) {
                  return new Date(e.getTime());
                });
              };
              RRuleSet2.prototype.exdates = function() {
                return this._exdate.map(function(e) {
                  return new Date(e.getTime());
                });
              };
              RRuleSet2.prototype.valueOf = function() {
                var result = [];
                if (!this._rrule.length && this._dtstart) {
                  result = result.concat(optionsToString({ dtstart: this._dtstart }));
                }
                this._rrule.forEach(function(rrule) {
                  result = result.concat(rrule.toString().split("\n"));
                });
                this._exrule.forEach(function(exrule) {
                  result = result.concat(exrule.toString().split("\n").map(function(line) {
                    return line.replace(/^RRULE:/, "EXRULE:");
                  }).filter(function(line) {
                    return !/^DTSTART/.test(line);
                  }));
                });
                if (this._rdate.length) {
                  result.push(rdatesToString("RDATE", this._rdate, this.tzid()));
                }
                if (this._exdate.length) {
                  result.push(rdatesToString("EXDATE", this._exdate, this.tzid()));
                }
                return result;
              };
              RRuleSet2.prototype.toString = function() {
                return this.valueOf().join("\n");
              };
              RRuleSet2.prototype.clone = function() {
                var rrs = new RRuleSet2(!!this._cache);
                this._rrule.forEach(function(rule) {
                  return rrs.rrule(rule.clone());
                });
                this._exrule.forEach(function(rule) {
                  return rrs.exrule(rule.clone());
                });
                this._rdate.forEach(function(date) {
                  return rrs.rdate(new Date(date.getTime()));
                });
                this._exdate.forEach(function(date) {
                  return rrs.exdate(new Date(date.getTime()));
                });
                return rrs;
              };
              return RRuleSet2;
            })(RRule2)
          );
          function _addRule(rrule, collection) {
            if (!(rrule instanceof RRule2)) {
              throw new TypeError(String(rrule) + " is not RRule instance");
            }
            if (!includes(collection.map(String), String(rrule))) {
              collection.push(rrule);
            }
          }
          function _addDate(date, collection) {
            if (!(date instanceof Date)) {
              throw new TypeError(String(date) + " is not Date instance");
            }
            if (!includes(collection.map(Number), Number(date))) {
              collection.push(date);
              sort(collection);
            }
          }
          function rdatesToString(param, rdates, tzid) {
            var isUTC = !tzid || tzid.toUpperCase() === "UTC";
            var header = isUTC ? "".concat(param, ":") : "".concat(param, ";TZID=").concat(tzid, ":");
            var dateString = rdates.map(function(rdate) {
              return timeToUntilString(rdate.valueOf(), isUTC);
            }).join(",");
            return "".concat(header).concat(dateString);
          }
          ;
          return __webpack_exports__;
        })()
      );
    });
  }
});

// node_modules/semver/internal/constants.js
var require_constants = __commonJS({
  "node_modules/semver/internal/constants.js"(exports, module) {
    "use strict";
    init_define_SEI_BUNDLED_ENGINE_VERSIONS();
    var SEMVER_SPEC_VERSION = "2.0.0";
    var MAX_LENGTH = 256;
    var MAX_SAFE_INTEGER = Number.MAX_SAFE_INTEGER || /* istanbul ignore next */
    9007199254740991;
    var MAX_SAFE_COMPONENT_LENGTH = 16;
    var MAX_SAFE_BUILD_LENGTH = MAX_LENGTH - 6;
    var RELEASE_TYPES = [
      "major",
      "premajor",
      "minor",
      "preminor",
      "patch",
      "prepatch",
      "prerelease"
    ];
    module.exports = {
      MAX_LENGTH,
      MAX_SAFE_COMPONENT_LENGTH,
      MAX_SAFE_BUILD_LENGTH,
      MAX_SAFE_INTEGER,
      RELEASE_TYPES,
      SEMVER_SPEC_VERSION,
      FLAG_INCLUDE_PRERELEASE: 1,
      FLAG_LOOSE: 2
    };
  }
});

// node_modules/semver/internal/debug.js
var require_debug = __commonJS({
  "node_modules/semver/internal/debug.js"(exports, module) {
    "use strict";
    init_define_SEI_BUNDLED_ENGINE_VERSIONS();
    var debug = typeof process === "object" && process.env && process.env.NODE_DEBUG && /\bsemver\b/i.test(process.env.NODE_DEBUG) ? (...args) => console.error("SEMVER", ...args) : () => {
    };
    module.exports = debug;
  }
});

// node_modules/semver/internal/re.js
var require_re = __commonJS({
  "node_modules/semver/internal/re.js"(exports, module) {
    "use strict";
    init_define_SEI_BUNDLED_ENGINE_VERSIONS();
    var {
      MAX_SAFE_COMPONENT_LENGTH,
      MAX_SAFE_BUILD_LENGTH,
      MAX_LENGTH
    } = require_constants();
    var debug = require_debug();
    exports = module.exports = {};
    var re = exports.re = [];
    var safeRe = exports.safeRe = [];
    var src = exports.src = [];
    var safeSrc = exports.safeSrc = [];
    var t = exports.t = {};
    var R = 0;
    var LETTERDASHNUMBER = "[a-zA-Z0-9-]";
    var safeRegexReplacements = [
      ["\\s", 1],
      ["\\d", MAX_LENGTH],
      [LETTERDASHNUMBER, MAX_SAFE_BUILD_LENGTH]
    ];
    var makeSafeRegex = (value) => {
      for (const [token, max] of safeRegexReplacements) {
        value = value.split(`${token}*`).join(`${token}{0,${max}}`).split(`${token}+`).join(`${token}{1,${max}}`);
      }
      return value;
    };
    var createToken = (name, value, isGlobal) => {
      const safe = makeSafeRegex(value);
      const index = R++;
      debug(name, index, value);
      t[name] = index;
      src[index] = value;
      safeSrc[index] = safe;
      re[index] = new RegExp(value, isGlobal ? "g" : void 0);
      safeRe[index] = new RegExp(safe, isGlobal ? "g" : void 0);
    };
    createToken("NUMERICIDENTIFIER", "0|[1-9]\\d*");
    createToken("NUMERICIDENTIFIERLOOSE", "\\d+");
    createToken("NONNUMERICIDENTIFIER", `\\d*[a-zA-Z-]${LETTERDASHNUMBER}*`);
    createToken("MAINVERSION", `(${src[t.NUMERICIDENTIFIER]})\\.(${src[t.NUMERICIDENTIFIER]})\\.(${src[t.NUMERICIDENTIFIER]})`);
    createToken("MAINVERSIONLOOSE", `(${src[t.NUMERICIDENTIFIERLOOSE]})\\.(${src[t.NUMERICIDENTIFIERLOOSE]})\\.(${src[t.NUMERICIDENTIFIERLOOSE]})`);
    createToken("PRERELEASEIDENTIFIER", `(?:${src[t.NONNUMERICIDENTIFIER]}|${src[t.NUMERICIDENTIFIER]})`);
    createToken("PRERELEASEIDENTIFIERLOOSE", `(?:${src[t.NONNUMERICIDENTIFIER]}|${src[t.NUMERICIDENTIFIERLOOSE]})`);
    createToken("PRERELEASE", `(?:-(${src[t.PRERELEASEIDENTIFIER]}(?:\\.${src[t.PRERELEASEIDENTIFIER]})*))`);
    createToken("PRERELEASELOOSE", `(?:-?(${src[t.PRERELEASEIDENTIFIERLOOSE]}(?:\\.${src[t.PRERELEASEIDENTIFIERLOOSE]})*))`);
    createToken("BUILDIDENTIFIER", `${LETTERDASHNUMBER}+`);
    createToken("BUILD", `(?:\\+(${src[t.BUILDIDENTIFIER]}(?:\\.${src[t.BUILDIDENTIFIER]})*))`);
    createToken("FULLPLAIN", `v?${src[t.MAINVERSION]}${src[t.PRERELEASE]}?${src[t.BUILD]}?`);
    createToken("FULL", `^${src[t.FULLPLAIN]}$`);
    createToken("LOOSEPLAIN", `[v=\\s]*${src[t.MAINVERSIONLOOSE]}${src[t.PRERELEASELOOSE]}?${src[t.BUILD]}?`);
    createToken("LOOSE", `^${src[t.LOOSEPLAIN]}$`);
    createToken("GTLT", "((?:<|>)?=?)");
    createToken("XRANGEIDENTIFIERLOOSE", `${src[t.NUMERICIDENTIFIERLOOSE]}|x|X|\\*`);
    createToken("XRANGEIDENTIFIER", `${src[t.NUMERICIDENTIFIER]}|x|X|\\*`);
    createToken("XRANGEPLAIN", `[v=\\s]*(${src[t.XRANGEIDENTIFIER]})(?:\\.(${src[t.XRANGEIDENTIFIER]})(?:\\.(${src[t.XRANGEIDENTIFIER]})(?:${src[t.PRERELEASE]})?${src[t.BUILD]}?)?)?`);
    createToken("XRANGEPLAINLOOSE", `[v=\\s]*(${src[t.XRANGEIDENTIFIERLOOSE]})(?:\\.(${src[t.XRANGEIDENTIFIERLOOSE]})(?:\\.(${src[t.XRANGEIDENTIFIERLOOSE]})(?:${src[t.PRERELEASELOOSE]})?${src[t.BUILD]}?)?)?`);
    createToken("XRANGE", `^${src[t.GTLT]}\\s*${src[t.XRANGEPLAIN]}$`);
    createToken("XRANGELOOSE", `^${src[t.GTLT]}\\s*${src[t.XRANGEPLAINLOOSE]}$`);
    createToken("COERCEPLAIN", `${"(^|[^\\d])(\\d{1,"}${MAX_SAFE_COMPONENT_LENGTH}})(?:\\.(\\d{1,${MAX_SAFE_COMPONENT_LENGTH}}))?(?:\\.(\\d{1,${MAX_SAFE_COMPONENT_LENGTH}}))?`);
    createToken("COERCE", `${src[t.COERCEPLAIN]}(?:$|[^\\d])`);
    createToken("COERCEFULL", src[t.COERCEPLAIN] + `(?:${src[t.PRERELEASE]})?(?:${src[t.BUILD]})?(?:$|[^\\d])`);
    createToken("COERCERTL", src[t.COERCE], true);
    createToken("COERCERTLFULL", src[t.COERCEFULL], true);
    createToken("LONETILDE", "(?:~>?)");
    createToken("TILDETRIM", `(\\s*)${src[t.LONETILDE]}\\s+`, true);
    exports.tildeTrimReplace = "$1~";
    createToken("TILDE", `^${src[t.LONETILDE]}${src[t.XRANGEPLAIN]}$`);
    createToken("TILDELOOSE", `^${src[t.LONETILDE]}${src[t.XRANGEPLAINLOOSE]}$`);
    createToken("LONECARET", "(?:\\^)");
    createToken("CARETTRIM", `(\\s*)${src[t.LONECARET]}\\s+`, true);
    exports.caretTrimReplace = "$1^";
    createToken("CARET", `^${src[t.LONECARET]}${src[t.XRANGEPLAIN]}$`);
    createToken("CARETLOOSE", `^${src[t.LONECARET]}${src[t.XRANGEPLAINLOOSE]}$`);
    createToken("COMPARATORLOOSE", `^${src[t.GTLT]}\\s*(${src[t.LOOSEPLAIN]})$|^$`);
    createToken("COMPARATOR", `^${src[t.GTLT]}\\s*(${src[t.FULLPLAIN]})$|^$`);
    createToken("COMPARATORTRIM", `(\\s*)${src[t.GTLT]}\\s*(${src[t.LOOSEPLAIN]}|${src[t.XRANGEPLAIN]})`, true);
    exports.comparatorTrimReplace = "$1$2$3";
    createToken("HYPHENRANGE", `^\\s*(${src[t.XRANGEPLAIN]})\\s+-\\s+(${src[t.XRANGEPLAIN]})\\s*$`);
    createToken("HYPHENRANGELOOSE", `^\\s*(${src[t.XRANGEPLAINLOOSE]})\\s+-\\s+(${src[t.XRANGEPLAINLOOSE]})\\s*$`);
    createToken("STAR", "(<|>)?=?\\s*\\*");
    createToken("GTE0", "^\\s*>=\\s*0\\.0\\.0\\s*$");
    createToken("GTE0PRE", "^\\s*>=\\s*0\\.0\\.0-0\\s*$");
  }
});

// node_modules/semver/internal/parse-options.js
var require_parse_options = __commonJS({
  "node_modules/semver/internal/parse-options.js"(exports, module) {
    "use strict";
    init_define_SEI_BUNDLED_ENGINE_VERSIONS();
    var looseOption = Object.freeze({ loose: true });
    var emptyOpts = Object.freeze({});
    var parseOptions = (options) => {
      if (!options) {
        return emptyOpts;
      }
      if (typeof options !== "object") {
        return looseOption;
      }
      return options;
    };
    module.exports = parseOptions;
  }
});

// node_modules/semver/internal/identifiers.js
var require_identifiers = __commonJS({
  "node_modules/semver/internal/identifiers.js"(exports, module) {
    "use strict";
    init_define_SEI_BUNDLED_ENGINE_VERSIONS();
    var numeric = /^[0-9]+$/;
    var compareIdentifiers = (a, b) => {
      if (typeof a === "number" && typeof b === "number") {
        return a === b ? 0 : a < b ? -1 : 1;
      }
      const anum = numeric.test(a);
      const bnum = numeric.test(b);
      if (anum && bnum) {
        a = +a;
        b = +b;
      }
      return a === b ? 0 : anum && !bnum ? -1 : bnum && !anum ? 1 : a < b ? -1 : 1;
    };
    var rcompareIdentifiers = (a, b) => compareIdentifiers(b, a);
    module.exports = {
      compareIdentifiers,
      rcompareIdentifiers
    };
  }
});

// node_modules/semver/classes/semver.js
var require_semver = __commonJS({
  "node_modules/semver/classes/semver.js"(exports, module) {
    "use strict";
    init_define_SEI_BUNDLED_ENGINE_VERSIONS();
    var debug = require_debug();
    var { MAX_LENGTH, MAX_SAFE_INTEGER } = require_constants();
    var { safeRe: re, t } = require_re();
    var parseOptions = require_parse_options();
    var { compareIdentifiers } = require_identifiers();
    var isPrereleaseIdentifier = (prerelease, identifier) => {
      const identifiers = identifier.split(".");
      if (identifiers.length > prerelease.length) {
        return false;
      }
      for (let i = 0; i < identifiers.length; i++) {
        if (compareIdentifiers(prerelease[i], identifiers[i]) !== 0) {
          return false;
        }
      }
      return true;
    };
    var SemVer = class _SemVer {
      constructor(version, options) {
        options = parseOptions(options);
        if (version instanceof _SemVer) {
          if (version.loose === !!options.loose && version.includePrerelease === !!options.includePrerelease) {
            return version;
          } else {
            version = version.version;
          }
        } else if (typeof version !== "string") {
          throw new TypeError(`Invalid version. Must be a string. Got type "${typeof version}".`);
        }
        if (version.length > MAX_LENGTH) {
          throw new TypeError(
            `version is longer than ${MAX_LENGTH} characters`
          );
        }
        debug("SemVer", version, options);
        this.options = options;
        this.loose = !!options.loose;
        this.includePrerelease = !!options.includePrerelease;
        const m = version.trim().match(options.loose ? re[t.LOOSE] : re[t.FULL]);
        if (!m) {
          throw new TypeError(`Invalid Version: ${version}`);
        }
        this.raw = version;
        this.major = +m[1];
        this.minor = +m[2];
        this.patch = +m[3];
        if (this.major > MAX_SAFE_INTEGER || this.major < 0) {
          throw new TypeError("Invalid major version");
        }
        if (this.minor > MAX_SAFE_INTEGER || this.minor < 0) {
          throw new TypeError("Invalid minor version");
        }
        if (this.patch > MAX_SAFE_INTEGER || this.patch < 0) {
          throw new TypeError("Invalid patch version");
        }
        if (!m[4]) {
          this.prerelease = [];
        } else {
          this.prerelease = m[4].split(".").map((id) => {
            if (/^[0-9]+$/.test(id)) {
              const num = +id;
              if (num >= 0 && num < MAX_SAFE_INTEGER) {
                return num;
              }
            }
            return id;
          });
        }
        this.build = m[5] ? m[5].split(".") : [];
        this.format();
      }
      format() {
        this.version = `${this.major}.${this.minor}.${this.patch}`;
        if (this.prerelease.length) {
          this.version += `-${this.prerelease.join(".")}`;
        }
        return this.version;
      }
      toString() {
        return this.version;
      }
      compare(other) {
        debug("SemVer.compare", this.version, this.options, other);
        if (!(other instanceof _SemVer)) {
          if (typeof other === "string" && other === this.version) {
            return 0;
          }
          other = new _SemVer(other, this.options);
        }
        if (other.version === this.version) {
          return 0;
        }
        return this.compareMain(other) || this.comparePre(other);
      }
      compareMain(other) {
        if (!(other instanceof _SemVer)) {
          other = new _SemVer(other, this.options);
        }
        if (this.major < other.major) {
          return -1;
        }
        if (this.major > other.major) {
          return 1;
        }
        if (this.minor < other.minor) {
          return -1;
        }
        if (this.minor > other.minor) {
          return 1;
        }
        if (this.patch < other.patch) {
          return -1;
        }
        if (this.patch > other.patch) {
          return 1;
        }
        return 0;
      }
      comparePre(other) {
        if (!(other instanceof _SemVer)) {
          other = new _SemVer(other, this.options);
        }
        if (this.prerelease.length && !other.prerelease.length) {
          return -1;
        } else if (!this.prerelease.length && other.prerelease.length) {
          return 1;
        } else if (!this.prerelease.length && !other.prerelease.length) {
          return 0;
        }
        let i = 0;
        do {
          const a = this.prerelease[i];
          const b = other.prerelease[i];
          debug("prerelease compare", i, a, b);
          if (a === void 0 && b === void 0) {
            return 0;
          } else if (b === void 0) {
            return 1;
          } else if (a === void 0) {
            return -1;
          } else if (a === b) {
            continue;
          } else {
            return compareIdentifiers(a, b);
          }
        } while (++i);
      }
      compareBuild(other) {
        if (!(other instanceof _SemVer)) {
          other = new _SemVer(other, this.options);
        }
        let i = 0;
        do {
          const a = this.build[i];
          const b = other.build[i];
          debug("build compare", i, a, b);
          if (a === void 0 && b === void 0) {
            return 0;
          } else if (b === void 0) {
            return 1;
          } else if (a === void 0) {
            return -1;
          } else if (a === b) {
            continue;
          } else {
            return compareIdentifiers(a, b);
          }
        } while (++i);
      }
      // preminor will bump the version up to the next minor release, and immediately
      // down to pre-release. premajor and prepatch work the same way.
      inc(release, identifier, identifierBase) {
        if (release.startsWith("pre")) {
          if (!identifier && identifierBase === false) {
            throw new Error("invalid increment argument: identifier is empty");
          }
          if (identifier) {
            const match = `-${identifier}`.match(this.options.loose ? re[t.PRERELEASELOOSE] : re[t.PRERELEASE]);
            if (!match || match[1] !== identifier) {
              throw new Error(`invalid identifier: ${identifier}`);
            }
          }
        }
        switch (release) {
          case "premajor":
            this.prerelease.length = 0;
            this.patch = 0;
            this.minor = 0;
            this.major++;
            this.inc("pre", identifier, identifierBase);
            break;
          case "preminor":
            this.prerelease.length = 0;
            this.patch = 0;
            this.minor++;
            this.inc("pre", identifier, identifierBase);
            break;
          case "prepatch":
            this.prerelease.length = 0;
            this.inc("patch", identifier, identifierBase);
            this.inc("pre", identifier, identifierBase);
            break;
          // If the input is a non-prerelease version, this acts the same as
          // prepatch.
          case "prerelease":
            if (this.prerelease.length === 0) {
              this.inc("patch", identifier, identifierBase);
            }
            this.inc("pre", identifier, identifierBase);
            break;
          case "release":
            if (this.prerelease.length === 0) {
              throw new Error(`version ${this.raw} is not a prerelease`);
            }
            this.prerelease.length = 0;
            break;
          case "major":
            if (this.minor !== 0 || this.patch !== 0 || this.prerelease.length === 0) {
              this.major++;
            }
            this.minor = 0;
            this.patch = 0;
            this.prerelease = [];
            break;
          case "minor":
            if (this.patch !== 0 || this.prerelease.length === 0) {
              this.minor++;
            }
            this.patch = 0;
            this.prerelease = [];
            break;
          case "patch":
            if (this.prerelease.length === 0) {
              this.patch++;
            }
            this.prerelease = [];
            break;
          // This probably shouldn't be used publicly.
          // 1.0.0 'pre' would become 1.0.0-0 which is the wrong direction.
          case "pre": {
            const base = Number(identifierBase) ? 1 : 0;
            if (this.prerelease.length === 0) {
              this.prerelease = [base];
            } else {
              let i = this.prerelease.length;
              while (--i >= 0) {
                if (typeof this.prerelease[i] === "number") {
                  this.prerelease[i]++;
                  i = -2;
                }
              }
              if (i === -1) {
                if (identifier === this.prerelease.join(".") && identifierBase === false) {
                  throw new Error("invalid increment argument: identifier already exists");
                }
                this.prerelease.push(base);
              }
            }
            if (identifier) {
              let prerelease = [identifier, base];
              if (identifierBase === false) {
                prerelease = [identifier];
              }
              if (isPrereleaseIdentifier(this.prerelease, identifier)) {
                const prereleaseBase = this.prerelease[identifier.split(".").length];
                if (isNaN(prereleaseBase)) {
                  this.prerelease = prerelease;
                }
              } else {
                this.prerelease = prerelease;
              }
            }
            break;
          }
          default:
            throw new Error(`invalid increment argument: ${release}`);
        }
        this.raw = this.format();
        if (this.build.length) {
          this.raw += `+${this.build.join(".")}`;
        }
        return this;
      }
    };
    module.exports = SemVer;
  }
});

// node_modules/semver/functions/parse.js
var require_parse = __commonJS({
  "node_modules/semver/functions/parse.js"(exports, module) {
    "use strict";
    init_define_SEI_BUNDLED_ENGINE_VERSIONS();
    var SemVer = require_semver();
    var parse5 = (version, options, throwErrors = false) => {
      if (version instanceof SemVer) {
        return version;
      }
      try {
        return new SemVer(version, options);
      } catch (er) {
        if (!throwErrors) {
          return null;
        }
        throw er;
      }
    };
    module.exports = parse5;
  }
});

// node_modules/semver/functions/valid.js
var require_valid = __commonJS({
  "node_modules/semver/functions/valid.js"(exports, module) {
    "use strict";
    init_define_SEI_BUNDLED_ENGINE_VERSIONS();
    var parse5 = require_parse();
    var valid = (version, options) => {
      const v = parse5(version, options);
      return v ? v.version : null;
    };
    module.exports = valid;
  }
});

// node_modules/semver/functions/clean.js
var require_clean = __commonJS({
  "node_modules/semver/functions/clean.js"(exports, module) {
    "use strict";
    init_define_SEI_BUNDLED_ENGINE_VERSIONS();
    var parse5 = require_parse();
    var clean = (version, options) => {
      const s = parse5(version.trim().replace(/^[=v]+/, ""), options);
      return s ? s.version : null;
    };
    module.exports = clean;
  }
});

// node_modules/semver/functions/inc.js
var require_inc = __commonJS({
  "node_modules/semver/functions/inc.js"(exports, module) {
    "use strict";
    init_define_SEI_BUNDLED_ENGINE_VERSIONS();
    var SemVer = require_semver();
    var inc = (version, release, options, identifier, identifierBase) => {
      if (typeof options === "string") {
        identifierBase = identifier;
        identifier = options;
        options = void 0;
      }
      try {
        return new SemVer(
          version instanceof SemVer ? version.version : version,
          options
        ).inc(release, identifier, identifierBase).version;
      } catch (er) {
        return null;
      }
    };
    module.exports = inc;
  }
});

// node_modules/semver/functions/diff.js
var require_diff = __commonJS({
  "node_modules/semver/functions/diff.js"(exports, module) {
    "use strict";
    init_define_SEI_BUNDLED_ENGINE_VERSIONS();
    var parse5 = require_parse();
    var diff = (version1, version2) => {
      const v1 = parse5(version1, null, true);
      const v2 = parse5(version2, null, true);
      const comparison = v1.compare(v2);
      if (comparison === 0) {
        return null;
      }
      const v1Higher = comparison > 0;
      const highVersion = v1Higher ? v1 : v2;
      const lowVersion = v1Higher ? v2 : v1;
      const highHasPre = !!highVersion.prerelease.length;
      const lowHasPre = !!lowVersion.prerelease.length;
      if (lowHasPre && !highHasPre) {
        if (!lowVersion.patch && !lowVersion.minor) {
          return "major";
        }
        if (lowVersion.compareMain(highVersion) === 0) {
          if (lowVersion.minor && !lowVersion.patch) {
            return "minor";
          }
          return "patch";
        }
      }
      const prefix = highHasPre ? "pre" : "";
      if (v1.major !== v2.major) {
        return prefix + "major";
      }
      if (v1.minor !== v2.minor) {
        return prefix + "minor";
      }
      if (v1.patch !== v2.patch) {
        return prefix + "patch";
      }
      return "prerelease";
    };
    module.exports = diff;
  }
});

// node_modules/semver/functions/major.js
var require_major = __commonJS({
  "node_modules/semver/functions/major.js"(exports, module) {
    "use strict";
    init_define_SEI_BUNDLED_ENGINE_VERSIONS();
    var SemVer = require_semver();
    var major = (a, loose) => new SemVer(a, loose).major;
    module.exports = major;
  }
});

// node_modules/semver/functions/minor.js
var require_minor = __commonJS({
  "node_modules/semver/functions/minor.js"(exports, module) {
    "use strict";
    init_define_SEI_BUNDLED_ENGINE_VERSIONS();
    var SemVer = require_semver();
    var minor = (a, loose) => new SemVer(a, loose).minor;
    module.exports = minor;
  }
});

// node_modules/semver/functions/patch.js
var require_patch = __commonJS({
  "node_modules/semver/functions/patch.js"(exports, module) {
    "use strict";
    init_define_SEI_BUNDLED_ENGINE_VERSIONS();
    var SemVer = require_semver();
    var patch = (a, loose) => new SemVer(a, loose).patch;
    module.exports = patch;
  }
});

// node_modules/semver/functions/prerelease.js
var require_prerelease = __commonJS({
  "node_modules/semver/functions/prerelease.js"(exports, module) {
    "use strict";
    init_define_SEI_BUNDLED_ENGINE_VERSIONS();
    var parse5 = require_parse();
    var prerelease = (version, options) => {
      const parsed = parse5(version, options);
      return parsed && parsed.prerelease.length ? parsed.prerelease : null;
    };
    module.exports = prerelease;
  }
});

// node_modules/semver/functions/compare.js
var require_compare = __commonJS({
  "node_modules/semver/functions/compare.js"(exports, module) {
    "use strict";
    init_define_SEI_BUNDLED_ENGINE_VERSIONS();
    var SemVer = require_semver();
    var compare = (a, b, loose) => new SemVer(a, loose).compare(new SemVer(b, loose));
    module.exports = compare;
  }
});

// node_modules/semver/functions/rcompare.js
var require_rcompare = __commonJS({
  "node_modules/semver/functions/rcompare.js"(exports, module) {
    "use strict";
    init_define_SEI_BUNDLED_ENGINE_VERSIONS();
    var compare = require_compare();
    var rcompare = (a, b, loose) => compare(b, a, loose);
    module.exports = rcompare;
  }
});

// node_modules/semver/functions/compare-loose.js
var require_compare_loose = __commonJS({
  "node_modules/semver/functions/compare-loose.js"(exports, module) {
    "use strict";
    init_define_SEI_BUNDLED_ENGINE_VERSIONS();
    var compare = require_compare();
    var compareLoose = (a, b) => compare(a, b, true);
    module.exports = compareLoose;
  }
});

// node_modules/semver/functions/compare-build.js
var require_compare_build = __commonJS({
  "node_modules/semver/functions/compare-build.js"(exports, module) {
    "use strict";
    init_define_SEI_BUNDLED_ENGINE_VERSIONS();
    var SemVer = require_semver();
    var compareBuild = (a, b, loose) => {
      const versionA = new SemVer(a, loose);
      const versionB = new SemVer(b, loose);
      return versionA.compare(versionB) || versionA.compareBuild(versionB);
    };
    module.exports = compareBuild;
  }
});

// node_modules/semver/functions/sort.js
var require_sort = __commonJS({
  "node_modules/semver/functions/sort.js"(exports, module) {
    "use strict";
    init_define_SEI_BUNDLED_ENGINE_VERSIONS();
    var compareBuild = require_compare_build();
    var sort = (list, loose) => list.sort((a, b) => compareBuild(a, b, loose));
    module.exports = sort;
  }
});

// node_modules/semver/functions/rsort.js
var require_rsort = __commonJS({
  "node_modules/semver/functions/rsort.js"(exports, module) {
    "use strict";
    init_define_SEI_BUNDLED_ENGINE_VERSIONS();
    var compareBuild = require_compare_build();
    var rsort = (list, loose) => list.sort((a, b) => compareBuild(b, a, loose));
    module.exports = rsort;
  }
});

// node_modules/semver/functions/gt.js
var require_gt = __commonJS({
  "node_modules/semver/functions/gt.js"(exports, module) {
    "use strict";
    init_define_SEI_BUNDLED_ENGINE_VERSIONS();
    var compare = require_compare();
    var gt = (a, b, loose) => compare(a, b, loose) > 0;
    module.exports = gt;
  }
});

// node_modules/semver/functions/lt.js
var require_lt = __commonJS({
  "node_modules/semver/functions/lt.js"(exports, module) {
    "use strict";
    init_define_SEI_BUNDLED_ENGINE_VERSIONS();
    var compare = require_compare();
    var lt = (a, b, loose) => compare(a, b, loose) < 0;
    module.exports = lt;
  }
});

// node_modules/semver/functions/eq.js
var require_eq = __commonJS({
  "node_modules/semver/functions/eq.js"(exports, module) {
    "use strict";
    init_define_SEI_BUNDLED_ENGINE_VERSIONS();
    var compare = require_compare();
    var eq = (a, b, loose) => compare(a, b, loose) === 0;
    module.exports = eq;
  }
});

// node_modules/semver/functions/neq.js
var require_neq = __commonJS({
  "node_modules/semver/functions/neq.js"(exports, module) {
    "use strict";
    init_define_SEI_BUNDLED_ENGINE_VERSIONS();
    var compare = require_compare();
    var neq = (a, b, loose) => compare(a, b, loose) !== 0;
    module.exports = neq;
  }
});

// node_modules/semver/functions/gte.js
var require_gte = __commonJS({
  "node_modules/semver/functions/gte.js"(exports, module) {
    "use strict";
    init_define_SEI_BUNDLED_ENGINE_VERSIONS();
    var compare = require_compare();
    var gte = (a, b, loose) => compare(a, b, loose) >= 0;
    module.exports = gte;
  }
});

// node_modules/semver/functions/lte.js
var require_lte = __commonJS({
  "node_modules/semver/functions/lte.js"(exports, module) {
    "use strict";
    init_define_SEI_BUNDLED_ENGINE_VERSIONS();
    var compare = require_compare();
    var lte = (a, b, loose) => compare(a, b, loose) <= 0;
    module.exports = lte;
  }
});

// node_modules/semver/functions/cmp.js
var require_cmp = __commonJS({
  "node_modules/semver/functions/cmp.js"(exports, module) {
    "use strict";
    init_define_SEI_BUNDLED_ENGINE_VERSIONS();
    var eq = require_eq();
    var neq = require_neq();
    var gt = require_gt();
    var gte = require_gte();
    var lt = require_lt();
    var lte = require_lte();
    var cmp = (a, op, b, loose) => {
      switch (op) {
        case "===":
          if (typeof a === "object") {
            a = a.version;
          }
          if (typeof b === "object") {
            b = b.version;
          }
          return a === b;
        case "!==":
          if (typeof a === "object") {
            a = a.version;
          }
          if (typeof b === "object") {
            b = b.version;
          }
          return a !== b;
        case "":
        case "=":
        case "==":
          return eq(a, b, loose);
        case "!=":
          return neq(a, b, loose);
        case ">":
          return gt(a, b, loose);
        case ">=":
          return gte(a, b, loose);
        case "<":
          return lt(a, b, loose);
        case "<=":
          return lte(a, b, loose);
        default:
          throw new TypeError(`Invalid operator: ${op}`);
      }
    };
    module.exports = cmp;
  }
});

// node_modules/semver/functions/coerce.js
var require_coerce = __commonJS({
  "node_modules/semver/functions/coerce.js"(exports, module) {
    "use strict";
    init_define_SEI_BUNDLED_ENGINE_VERSIONS();
    var SemVer = require_semver();
    var parse5 = require_parse();
    var { safeRe: re, t } = require_re();
    var coerce = (version, options) => {
      if (version instanceof SemVer) {
        return version;
      }
      if (typeof version === "number") {
        version = String(version);
      }
      if (typeof version !== "string") {
        return null;
      }
      options = options || {};
      let match = null;
      if (!options.rtl) {
        match = version.match(options.includePrerelease ? re[t.COERCEFULL] : re[t.COERCE]);
      } else {
        const coerceRtlRegex = options.includePrerelease ? re[t.COERCERTLFULL] : re[t.COERCERTL];
        let next;
        while ((next = coerceRtlRegex.exec(version)) && (!match || match.index + match[0].length !== version.length)) {
          if (!match || next.index + next[0].length !== match.index + match[0].length) {
            match = next;
          }
          coerceRtlRegex.lastIndex = next.index + next[1].length + next[2].length;
        }
        coerceRtlRegex.lastIndex = -1;
      }
      if (match === null) {
        return null;
      }
      const major = match[2];
      const minor = match[3] || "0";
      const patch = match[4] || "0";
      const prerelease = options.includePrerelease && match[5] ? `-${match[5]}` : "";
      const build = options.includePrerelease && match[6] ? `+${match[6]}` : "";
      return parse5(`${major}.${minor}.${patch}${prerelease}${build}`, options);
    };
    module.exports = coerce;
  }
});

// node_modules/semver/functions/truncate.js
var require_truncate = __commonJS({
  "node_modules/semver/functions/truncate.js"(exports, module) {
    "use strict";
    init_define_SEI_BUNDLED_ENGINE_VERSIONS();
    var parse5 = require_parse();
    var constants = require_constants();
    var SemVer = require_semver();
    var truncate = (version, truncation, options) => {
      if (!constants.RELEASE_TYPES.includes(truncation)) {
        return null;
      }
      const clonedVersion = cloneInputVersion(version, options);
      return clonedVersion && doTruncation(clonedVersion, truncation);
    };
    var cloneInputVersion = (version, options) => {
      const versionStringToParse = version instanceof SemVer ? version.version : version;
      return parse5(versionStringToParse, options);
    };
    var doTruncation = (version, truncation) => {
      if (isPrerelease(truncation)) {
        return version.version;
      }
      version.prerelease = [];
      switch (truncation) {
        case "major":
          version.minor = 0;
          version.patch = 0;
          break;
        case "minor":
          version.patch = 0;
          break;
      }
      return version.format();
    };
    var isPrerelease = (type) => {
      return type.startsWith("pre");
    };
    module.exports = truncate;
  }
});

// node_modules/semver/internal/lrucache.js
var require_lrucache = __commonJS({
  "node_modules/semver/internal/lrucache.js"(exports, module) {
    "use strict";
    init_define_SEI_BUNDLED_ENGINE_VERSIONS();
    var LRUCache = class {
      constructor() {
        this.max = 1e3;
        this.map = /* @__PURE__ */ new Map();
      }
      get(key) {
        const value = this.map.get(key);
        if (value === void 0) {
          return void 0;
        } else {
          this.map.delete(key);
          this.map.set(key, value);
          return value;
        }
      }
      delete(key) {
        return this.map.delete(key);
      }
      set(key, value) {
        const deleted = this.delete(key);
        if (!deleted && value !== void 0) {
          if (this.map.size >= this.max) {
            const firstKey = this.map.keys().next().value;
            this.delete(firstKey);
          }
          this.map.set(key, value);
        }
        return this;
      }
    };
    module.exports = LRUCache;
  }
});

// node_modules/semver/classes/range.js
var require_range = __commonJS({
  "node_modules/semver/classes/range.js"(exports, module) {
    "use strict";
    init_define_SEI_BUNDLED_ENGINE_VERSIONS();
    var SPACE_CHARACTERS = /\s+/g;
    var Range2 = class _Range {
      constructor(range, options) {
        options = parseOptions(options);
        if (range instanceof _Range) {
          if (range.loose === !!options.loose && range.includePrerelease === !!options.includePrerelease) {
            return range;
          } else {
            return new _Range(range.raw, options);
          }
        }
        if (range instanceof Comparator) {
          this.raw = range.value;
          this.set = [[range]];
          this.formatted = void 0;
          return this;
        }
        this.options = options;
        this.loose = !!options.loose;
        this.includePrerelease = !!options.includePrerelease;
        this.raw = range.trim().replace(SPACE_CHARACTERS, " ");
        this.set = this.raw.split("||").map((r) => this.parseRange(r.trim())).filter((c) => c.length);
        if (!this.set.length) {
          throw new TypeError(`Invalid SemVer Range: ${this.raw}`);
        }
        if (this.set.length > 1) {
          const first = this.set[0];
          this.set = this.set.filter((c) => !isNullSet(c[0]));
          if (this.set.length === 0) {
            this.set = [first];
          } else if (this.set.length > 1) {
            for (const c of this.set) {
              if (c.length === 1 && isAny(c[0])) {
                this.set = [c];
                break;
              }
            }
          }
        }
        this.formatted = void 0;
      }
      get range() {
        if (this.formatted === void 0) {
          this.formatted = "";
          for (let i = 0; i < this.set.length; i++) {
            if (i > 0) {
              this.formatted += "||";
            }
            const comps = this.set[i];
            for (let k = 0; k < comps.length; k++) {
              if (k > 0) {
                this.formatted += " ";
              }
              this.formatted += comps[k].toString().trim();
            }
          }
        }
        return this.formatted;
      }
      format() {
        return this.range;
      }
      toString() {
        return this.range;
      }
      parseRange(range) {
        range = range.replace(BUILDSTRIPRE, "");
        const memoOpts = (this.options.includePrerelease && FLAG_INCLUDE_PRERELEASE) | (this.options.loose && FLAG_LOOSE);
        const memoKey = memoOpts + ":" + range;
        const cached = cache.get(memoKey);
        if (cached) {
          return cached;
        }
        const loose = this.options.loose;
        const hr = loose ? re[t.HYPHENRANGELOOSE] : re[t.HYPHENRANGE];
        range = range.replace(hr, hyphenReplace(this.options.includePrerelease));
        debug("hyphen replace", range);
        range = range.replace(re[t.COMPARATORTRIM], comparatorTrimReplace);
        debug("comparator trim", range);
        range = range.replace(re[t.TILDETRIM], tildeTrimReplace);
        debug("tilde trim", range);
        range = range.replace(re[t.CARETTRIM], caretTrimReplace);
        debug("caret trim", range);
        let rangeList = range.split(" ").map((comp) => parseComparator(comp, this.options)).join(" ").split(/\s+/).map((comp) => replaceGTE0(comp, this.options));
        if (loose) {
          rangeList = rangeList.filter((comp) => {
            debug("loose invalid filter", comp, this.options);
            return !!comp.match(re[t.COMPARATORLOOSE]);
          });
        }
        debug("range list", rangeList);
        const rangeMap = /* @__PURE__ */ new Map();
        const comparators = rangeList.map((comp) => new Comparator(comp, this.options));
        for (const comp of comparators) {
          if (isNullSet(comp)) {
            return [comp];
          }
          rangeMap.set(comp.value, comp);
        }
        if (rangeMap.size > 1 && rangeMap.has("")) {
          rangeMap.delete("");
        }
        const result = [...rangeMap.values()];
        cache.set(memoKey, result);
        return result;
      }
      intersects(range, options) {
        if (!(range instanceof _Range)) {
          throw new TypeError("a Range is required");
        }
        return this.set.some((thisComparators) => {
          return isSatisfiable(thisComparators, options) && range.set.some((rangeComparators) => {
            return isSatisfiable(rangeComparators, options) && thisComparators.every((thisComparator) => {
              return rangeComparators.every((rangeComparator) => {
                return thisComparator.intersects(rangeComparator, options);
              });
            });
          });
        });
      }
      // if ANY of the sets match ALL of its comparators, then pass
      test(version) {
        if (!version) {
          return false;
        }
        if (typeof version === "string") {
          try {
            version = new SemVer(version, this.options);
          } catch (er) {
            return false;
          }
        }
        for (let i = 0; i < this.set.length; i++) {
          if (testSet(this.set[i], version, this.options)) {
            return true;
          }
        }
        return false;
      }
    };
    module.exports = Range2;
    var LRU = require_lrucache();
    var cache = new LRU();
    var parseOptions = require_parse_options();
    var Comparator = require_comparator();
    var debug = require_debug();
    var SemVer = require_semver();
    var {
      safeRe: re,
      src,
      t,
      comparatorTrimReplace,
      tildeTrimReplace,
      caretTrimReplace
    } = require_re();
    var { FLAG_INCLUDE_PRERELEASE, FLAG_LOOSE } = require_constants();
    var BUILDSTRIPRE = new RegExp(src[t.BUILD], "g");
    var isNullSet = (c) => c.value === "<0.0.0-0";
    var isAny = (c) => c.value === "";
    var isSatisfiable = (comparators, options) => {
      let result = true;
      const remainingComparators = comparators.slice();
      let testComparator = remainingComparators.pop();
      while (result && remainingComparators.length) {
        result = remainingComparators.every((otherComparator) => {
          return testComparator.intersects(otherComparator, options);
        });
        testComparator = remainingComparators.pop();
      }
      return result;
    };
    var parseComparator = (comp, options) => {
      comp = comp.replace(re[t.BUILD], "");
      debug("comp", comp, options);
      comp = replaceCarets(comp, options);
      debug("caret", comp);
      comp = replaceTildes(comp, options);
      debug("tildes", comp);
      comp = replaceXRanges(comp, options);
      debug("xrange", comp);
      comp = replaceStars(comp, options);
      debug("stars", comp);
      return comp;
    };
    var isX = (id) => !id || id.toLowerCase() === "x" || id === "*";
    var invalidXRangeOrder = (M, m, p) => isX(M) && !isX(m) || isX(m) && p && !isX(p);
    var replaceTildes = (comp, options) => {
      return comp.trim().split(/\s+/).map((c) => replaceTilde(c, options)).join(" ");
    };
    var replaceTilde = (comp, options) => {
      const r = options.loose ? re[t.TILDELOOSE] : re[t.TILDE];
      const z = options.includePrerelease ? "-0" : "";
      return comp.replace(r, (_, M, m, p, pr) => {
        debug("tilde", comp, _, M, m, p, pr);
        let ret;
        if (isX(M)) {
          ret = "";
        } else if (isX(m)) {
          ret = `>=${M}.0.0${z} <${+M + 1}.0.0-0`;
        } else if (isX(p)) {
          ret = `>=${M}.${m}.0${z} <${M}.${+m + 1}.0-0`;
        } else if (pr) {
          debug("replaceTilde pr", pr);
          ret = `>=${M}.${m}.${p}-${pr} <${M}.${+m + 1}.0-0`;
        } else {
          ret = `>=${M}.${m}.${p} <${M}.${+m + 1}.0-0`;
        }
        debug("tilde return", ret);
        return ret;
      });
    };
    var replaceCarets = (comp, options) => {
      return comp.trim().split(/\s+/).map((c) => replaceCaret(c, options)).join(" ");
    };
    var replaceCaret = (comp, options) => {
      debug("caret", comp, options);
      const r = options.loose ? re[t.CARETLOOSE] : re[t.CARET];
      const z = options.includePrerelease ? "-0" : "";
      return comp.replace(r, (_, M, m, p, pr) => {
        debug("caret", comp, _, M, m, p, pr);
        let ret;
        if (isX(M)) {
          ret = "";
        } else if (isX(m)) {
          ret = `>=${M}.0.0${z} <${+M + 1}.0.0-0`;
        } else if (isX(p)) {
          if (M === "0") {
            ret = `>=${M}.${m}.0${z} <${M}.${+m + 1}.0-0`;
          } else {
            ret = `>=${M}.${m}.0${z} <${+M + 1}.0.0-0`;
          }
        } else if (pr) {
          debug("replaceCaret pr", pr);
          if (M === "0") {
            if (m === "0") {
              ret = `>=${M}.${m}.${p}-${pr} <${M}.${m}.${+p + 1}-0`;
            } else {
              ret = `>=${M}.${m}.${p}-${pr} <${M}.${+m + 1}.0-0`;
            }
          } else {
            ret = `>=${M}.${m}.${p}-${pr} <${+M + 1}.0.0-0`;
          }
        } else {
          debug("no pr");
          if (M === "0") {
            if (m === "0") {
              ret = `>=${M}.${m}.${p} <${M}.${m}.${+p + 1}-0`;
            } else {
              ret = `>=${M}.${m}.${p} <${M}.${+m + 1}.0-0`;
            }
          } else {
            ret = `>=${M}.${m}.${p} <${+M + 1}.0.0-0`;
          }
        }
        debug("caret return", ret);
        return ret;
      });
    };
    var replaceXRanges = (comp, options) => {
      debug("replaceXRanges", comp, options);
      return comp.split(/\s+/).map((c) => replaceXRange(c, options)).join(" ");
    };
    var replaceXRange = (comp, options) => {
      comp = comp.trim();
      const r = options.loose ? re[t.XRANGELOOSE] : re[t.XRANGE];
      return comp.replace(r, (ret, gtlt, M, m, p, pr) => {
        debug("xRange", comp, ret, gtlt, M, m, p, pr);
        if (invalidXRangeOrder(M, m, p)) {
          return comp;
        }
        const xM = isX(M);
        const xm = xM || isX(m);
        const xp = xm || isX(p);
        const anyX = xp;
        if (gtlt === "=" && anyX) {
          gtlt = "";
        }
        pr = options.includePrerelease ? "-0" : "";
        if (xM) {
          if (gtlt === ">" || gtlt === "<") {
            ret = "<0.0.0-0";
          } else {
            ret = "*";
          }
        } else if (gtlt && anyX) {
          if (xm) {
            m = 0;
          }
          p = 0;
          if (gtlt === ">") {
            gtlt = ">=";
            if (xm) {
              M = +M + 1;
              m = 0;
              p = 0;
            } else {
              m = +m + 1;
              p = 0;
            }
          } else if (gtlt === "<=") {
            gtlt = "<";
            if (xm) {
              M = +M + 1;
            } else {
              m = +m + 1;
            }
          }
          if (gtlt === "<") {
            pr = "-0";
          }
          ret = `${gtlt + M}.${m}.${p}${pr}`;
        } else if (xm) {
          ret = `>=${M}.0.0${pr} <${+M + 1}.0.0-0`;
        } else if (xp) {
          ret = `>=${M}.${m}.0${pr} <${M}.${+m + 1}.0-0`;
        }
        debug("xRange return", ret);
        return ret;
      });
    };
    var replaceStars = (comp, options) => {
      debug("replaceStars", comp, options);
      return comp.trim().replace(re[t.STAR], "");
    };
    var replaceGTE0 = (comp, options) => {
      debug("replaceGTE0", comp, options);
      return comp.trim().replace(re[options.includePrerelease ? t.GTE0PRE : t.GTE0], "");
    };
    var hyphenReplace = (incPr) => ($0, from, fM, fm, fp, fpr, fb, to, tM, tm, tp, tpr) => {
      if (isX(fM)) {
        from = "";
      } else if (isX(fm)) {
        from = `>=${fM}.0.0${incPr ? "-0" : ""}`;
      } else if (isX(fp)) {
        from = `>=${fM}.${fm}.0${incPr ? "-0" : ""}`;
      } else if (fpr) {
        from = `>=${from}`;
      } else {
        from = `>=${from}${incPr ? "-0" : ""}`;
      }
      if (isX(tM)) {
        to = "";
      } else if (isX(tm)) {
        to = `<${+tM + 1}.0.0-0`;
      } else if (isX(tp)) {
        to = `<${tM}.${+tm + 1}.0-0`;
      } else if (tpr) {
        to = `<=${tM}.${tm}.${tp}-${tpr}`;
      } else if (incPr) {
        to = `<${tM}.${tm}.${+tp + 1}-0`;
      } else {
        to = `<=${to}`;
      }
      return `${from} ${to}`.trim();
    };
    var testSet = (set, version, options) => {
      for (let i = 0; i < set.length; i++) {
        if (!set[i].test(version)) {
          return false;
        }
      }
      if (version.prerelease.length && !options.includePrerelease) {
        for (let i = 0; i < set.length; i++) {
          debug(set[i].semver);
          if (set[i].semver === Comparator.ANY) {
            continue;
          }
          if (set[i].semver.prerelease.length > 0) {
            const allowed = set[i].semver;
            if (allowed.major === version.major && allowed.minor === version.minor && allowed.patch === version.patch) {
              return true;
            }
          }
        }
        return false;
      }
      return true;
    };
  }
});

// node_modules/semver/classes/comparator.js
var require_comparator = __commonJS({
  "node_modules/semver/classes/comparator.js"(exports, module) {
    "use strict";
    init_define_SEI_BUNDLED_ENGINE_VERSIONS();
    var ANY = /* @__PURE__ */ Symbol("SemVer ANY");
    var Comparator = class _Comparator {
      static get ANY() {
        return ANY;
      }
      constructor(comp, options) {
        options = parseOptions(options);
        if (comp instanceof _Comparator) {
          if (comp.loose === !!options.loose) {
            return comp;
          } else {
            comp = comp.value;
          }
        }
        comp = comp.trim().split(/\s+/).join(" ");
        debug("comparator", comp, options);
        this.options = options;
        this.loose = !!options.loose;
        this.parse(comp);
        if (this.semver === ANY) {
          this.value = "";
        } else {
          this.value = this.operator + this.semver.version;
        }
        debug("comp", this);
      }
      parse(comp) {
        const r = this.options.loose ? re[t.COMPARATORLOOSE] : re[t.COMPARATOR];
        const m = comp.match(r);
        if (!m) {
          throw new TypeError(`Invalid comparator: ${comp}`);
        }
        this.operator = m[1] !== void 0 ? m[1] : "";
        if (this.operator === "=") {
          this.operator = "";
        }
        if (!m[2]) {
          this.semver = ANY;
        } else {
          this.semver = new SemVer(m[2], this.options.loose);
        }
      }
      toString() {
        return this.value;
      }
      test(version) {
        debug("Comparator.test", version, this.options.loose);
        if (this.semver === ANY || version === ANY) {
          return true;
        }
        if (typeof version === "string") {
          try {
            version = new SemVer(version, this.options);
          } catch (er) {
            return false;
          }
        }
        return cmp(version, this.operator, this.semver, this.options);
      }
      intersects(comp, options) {
        if (!(comp instanceof _Comparator)) {
          throw new TypeError("a Comparator is required");
        }
        if (this.operator === "") {
          if (this.value === "") {
            return true;
          }
          return new Range2(comp.value, options).test(this.value);
        } else if (comp.operator === "") {
          if (comp.value === "") {
            return true;
          }
          return new Range2(this.value, options).test(comp.semver);
        }
        options = parseOptions(options);
        if (options.includePrerelease && (this.value === "<0.0.0-0" || comp.value === "<0.0.0-0")) {
          return false;
        }
        if (!options.includePrerelease && (this.value.startsWith("<0.0.0") || comp.value.startsWith("<0.0.0"))) {
          return false;
        }
        if (this.operator.startsWith(">") && comp.operator.startsWith(">")) {
          return true;
        }
        if (this.operator.startsWith("<") && comp.operator.startsWith("<")) {
          return true;
        }
        if (this.semver.version === comp.semver.version && this.operator.includes("=") && comp.operator.includes("=")) {
          return true;
        }
        if (cmp(this.semver, "<", comp.semver, options) && this.operator.startsWith(">") && comp.operator.startsWith("<")) {
          return true;
        }
        if (cmp(this.semver, ">", comp.semver, options) && this.operator.startsWith("<") && comp.operator.startsWith(">")) {
          return true;
        }
        return false;
      }
    };
    module.exports = Comparator;
    var parseOptions = require_parse_options();
    var { safeRe: re, t } = require_re();
    var cmp = require_cmp();
    var debug = require_debug();
    var SemVer = require_semver();
    var Range2 = require_range();
  }
});

// node_modules/semver/functions/satisfies.js
var require_satisfies = __commonJS({
  "node_modules/semver/functions/satisfies.js"(exports, module) {
    "use strict";
    init_define_SEI_BUNDLED_ENGINE_VERSIONS();
    var Range2 = require_range();
    var satisfies2 = (version, range, options) => {
      try {
        range = new Range2(range, options);
      } catch (er) {
        return false;
      }
      return range.test(version);
    };
    module.exports = satisfies2;
  }
});

// node_modules/semver/ranges/to-comparators.js
var require_to_comparators = __commonJS({
  "node_modules/semver/ranges/to-comparators.js"(exports, module) {
    "use strict";
    init_define_SEI_BUNDLED_ENGINE_VERSIONS();
    var Range2 = require_range();
    var toComparators = (range, options) => new Range2(range, options).set.map((comp) => comp.map((c) => c.value).join(" ").trim().split(" "));
    module.exports = toComparators;
  }
});

// node_modules/semver/ranges/max-satisfying.js
var require_max_satisfying = __commonJS({
  "node_modules/semver/ranges/max-satisfying.js"(exports, module) {
    "use strict";
    init_define_SEI_BUNDLED_ENGINE_VERSIONS();
    var SemVer = require_semver();
    var Range2 = require_range();
    var maxSatisfying = (versions, range, options) => {
      let max = null;
      let maxSV = null;
      let rangeObj = null;
      try {
        rangeObj = new Range2(range, options);
      } catch (er) {
        return null;
      }
      versions.forEach((v) => {
        if (rangeObj.test(v)) {
          if (!max || maxSV.compare(v) === -1) {
            max = v;
            maxSV = new SemVer(max, options);
          }
        }
      });
      return max;
    };
    module.exports = maxSatisfying;
  }
});

// node_modules/semver/ranges/min-satisfying.js
var require_min_satisfying = __commonJS({
  "node_modules/semver/ranges/min-satisfying.js"(exports, module) {
    "use strict";
    init_define_SEI_BUNDLED_ENGINE_VERSIONS();
    var SemVer = require_semver();
    var Range2 = require_range();
    var minSatisfying = (versions, range, options) => {
      let min = null;
      let minSV = null;
      let rangeObj = null;
      try {
        rangeObj = new Range2(range, options);
      } catch (er) {
        return null;
      }
      versions.forEach((v) => {
        if (rangeObj.test(v)) {
          if (!min || minSV.compare(v) === 1) {
            min = v;
            minSV = new SemVer(min, options);
          }
        }
      });
      return min;
    };
    module.exports = minSatisfying;
  }
});

// node_modules/semver/ranges/min-version.js
var require_min_version = __commonJS({
  "node_modules/semver/ranges/min-version.js"(exports, module) {
    "use strict";
    init_define_SEI_BUNDLED_ENGINE_VERSIONS();
    var SemVer = require_semver();
    var Range2 = require_range();
    var gt = require_gt();
    var minVersion = (range, loose) => {
      range = new Range2(range, loose);
      let minver = new SemVer("0.0.0");
      if (range.test(minver)) {
        return minver;
      }
      minver = new SemVer("0.0.0-0");
      if (range.test(minver)) {
        return minver;
      }
      minver = null;
      for (let i = 0; i < range.set.length; ++i) {
        const comparators = range.set[i];
        let setMin = null;
        comparators.forEach((comparator) => {
          const compver = new SemVer(comparator.semver.version);
          switch (comparator.operator) {
            case ">":
              if (compver.prerelease.length === 0) {
                compver.patch++;
              } else {
                compver.prerelease.push(0);
              }
              compver.raw = compver.format();
            /* fallthrough */
            case "":
            case ">=":
              if (!setMin || gt(compver, setMin)) {
                setMin = compver;
              }
              break;
            case "<":
            case "<=":
              break;
            /* istanbul ignore next */
            default:
              throw new Error(`Unexpected operation: ${comparator.operator}`);
          }
        });
        if (setMin && (!minver || gt(minver, setMin))) {
          minver = setMin;
        }
      }
      if (minver && range.test(minver)) {
        return minver;
      }
      return null;
    };
    module.exports = minVersion;
  }
});

// node_modules/semver/ranges/valid.js
var require_valid2 = __commonJS({
  "node_modules/semver/ranges/valid.js"(exports, module) {
    "use strict";
    init_define_SEI_BUNDLED_ENGINE_VERSIONS();
    var Range2 = require_range();
    var validRange = (range, options) => {
      try {
        return new Range2(range, options).range || "*";
      } catch (er) {
        return null;
      }
    };
    module.exports = validRange;
  }
});

// node_modules/semver/ranges/outside.js
var require_outside = __commonJS({
  "node_modules/semver/ranges/outside.js"(exports, module) {
    "use strict";
    init_define_SEI_BUNDLED_ENGINE_VERSIONS();
    var SemVer = require_semver();
    var Comparator = require_comparator();
    var { ANY } = Comparator;
    var Range2 = require_range();
    var satisfies2 = require_satisfies();
    var gt = require_gt();
    var lt = require_lt();
    var lte = require_lte();
    var gte = require_gte();
    var outside = (version, range, hilo, options) => {
      version = new SemVer(version, options);
      range = new Range2(range, options);
      let gtfn, ltefn, ltfn, comp, ecomp;
      switch (hilo) {
        case ">":
          gtfn = gt;
          ltefn = lte;
          ltfn = lt;
          comp = ">";
          ecomp = ">=";
          break;
        case "<":
          gtfn = lt;
          ltefn = gte;
          ltfn = gt;
          comp = "<";
          ecomp = "<=";
          break;
        default:
          throw new TypeError('Must provide a hilo val of "<" or ">"');
      }
      if (satisfies2(version, range, options)) {
        return false;
      }
      for (let i = 0; i < range.set.length; ++i) {
        const comparators = range.set[i];
        let high = null;
        let low = null;
        comparators.forEach((comparator) => {
          if (comparator.semver === ANY) {
            comparator = new Comparator(">=0.0.0");
          }
          high = high || comparator;
          low = low || comparator;
          if (gtfn(comparator.semver, high.semver, options)) {
            high = comparator;
          } else if (ltfn(comparator.semver, low.semver, options)) {
            low = comparator;
          }
        });
        if (high.operator === comp || high.operator === ecomp) {
          return false;
        }
        if ((!low.operator || low.operator === comp) && ltefn(version, low.semver)) {
          return false;
        } else if (low.operator === ecomp && ltfn(version, low.semver)) {
          return false;
        }
      }
      return true;
    };
    module.exports = outside;
  }
});

// node_modules/semver/ranges/gtr.js
var require_gtr = __commonJS({
  "node_modules/semver/ranges/gtr.js"(exports, module) {
    "use strict";
    init_define_SEI_BUNDLED_ENGINE_VERSIONS();
    var outside = require_outside();
    var gtr = (version, range, options) => outside(version, range, ">", options);
    module.exports = gtr;
  }
});

// node_modules/semver/ranges/ltr.js
var require_ltr = __commonJS({
  "node_modules/semver/ranges/ltr.js"(exports, module) {
    "use strict";
    init_define_SEI_BUNDLED_ENGINE_VERSIONS();
    var outside = require_outside();
    var ltr = (version, range, options) => outside(version, range, "<", options);
    module.exports = ltr;
  }
});

// node_modules/semver/ranges/intersects.js
var require_intersects = __commonJS({
  "node_modules/semver/ranges/intersects.js"(exports, module) {
    "use strict";
    init_define_SEI_BUNDLED_ENGINE_VERSIONS();
    var Range2 = require_range();
    var intersects2 = (r1, r2, options) => {
      r1 = new Range2(r1, options);
      r2 = new Range2(r2, options);
      return r1.intersects(r2, options);
    };
    module.exports = intersects2;
  }
});

// node_modules/semver/ranges/simplify.js
var require_simplify = __commonJS({
  "node_modules/semver/ranges/simplify.js"(exports, module) {
    "use strict";
    init_define_SEI_BUNDLED_ENGINE_VERSIONS();
    var satisfies2 = require_satisfies();
    var compare = require_compare();
    module.exports = (versions, range, options) => {
      const set = [];
      let first = null;
      let prev = null;
      const v = versions.sort((a, b) => compare(a, b, options));
      for (const version of v) {
        const included = satisfies2(version, range, options);
        if (included) {
          prev = version;
          if (!first) {
            first = version;
          }
        } else {
          if (prev) {
            set.push([first, prev]);
          }
          prev = null;
          first = null;
        }
      }
      if (first) {
        set.push([first, null]);
      }
      const ranges = [];
      for (const [min, max] of set) {
        if (min === max) {
          ranges.push(min);
        } else if (!max && min === v[0]) {
          ranges.push("*");
        } else if (!max) {
          ranges.push(`>=${min}`);
        } else if (min === v[0]) {
          ranges.push(`<=${max}`);
        } else {
          ranges.push(`${min} - ${max}`);
        }
      }
      const simplified = ranges.join(" || ");
      const original = typeof range.raw === "string" ? range.raw : String(range);
      return simplified.length < original.length ? simplified : range;
    };
  }
});

// node_modules/semver/ranges/subset.js
var require_subset = __commonJS({
  "node_modules/semver/ranges/subset.js"(exports, module) {
    "use strict";
    init_define_SEI_BUNDLED_ENGINE_VERSIONS();
    var Range2 = require_range();
    var Comparator = require_comparator();
    var { ANY } = Comparator;
    var satisfies2 = require_satisfies();
    var compare = require_compare();
    var subset = (sub, dom, options = {}) => {
      if (sub === dom) {
        return true;
      }
      sub = new Range2(sub, options);
      dom = new Range2(dom, options);
      let sawNonNull = false;
      OUTER: for (const simpleSub of sub.set) {
        for (const simpleDom of dom.set) {
          const isSub = simpleSubset(simpleSub, simpleDom, options);
          sawNonNull = sawNonNull || isSub !== null;
          if (isSub) {
            continue OUTER;
          }
        }
        if (sawNonNull) {
          return false;
        }
      }
      return true;
    };
    var minimumVersionWithPreRelease = [new Comparator(">=0.0.0-0")];
    var minimumVersion = [new Comparator(">=0.0.0")];
    var simpleSubset = (sub, dom, options) => {
      if (sub === dom) {
        return true;
      }
      if (sub.length === 1 && sub[0].semver === ANY) {
        if (dom.length === 1 && dom[0].semver === ANY) {
          return true;
        } else if (options.includePrerelease) {
          sub = minimumVersionWithPreRelease;
        } else {
          sub = minimumVersion;
        }
      }
      if (dom.length === 1 && dom[0].semver === ANY) {
        if (options.includePrerelease) {
          return true;
        } else {
          dom = minimumVersion;
        }
      }
      const eqSet = /* @__PURE__ */ new Set();
      let gt, lt;
      for (const c of sub) {
        if (c.operator === ">" || c.operator === ">=") {
          gt = higherGT(gt, c, options);
        } else if (c.operator === "<" || c.operator === "<=") {
          lt = lowerLT(lt, c, options);
        } else {
          eqSet.add(c.semver);
        }
      }
      if (eqSet.size > 1) {
        return null;
      }
      let gtltComp;
      if (gt && lt) {
        gtltComp = compare(gt.semver, lt.semver, options);
        if (gtltComp > 0) {
          return null;
        } else if (gtltComp === 0 && (gt.operator !== ">=" || lt.operator !== "<=")) {
          return null;
        }
      }
      for (const eq of eqSet) {
        if (gt && !satisfies2(eq, String(gt), options)) {
          return null;
        }
        if (lt && !satisfies2(eq, String(lt), options)) {
          return null;
        }
        for (const c of dom) {
          if (!satisfies2(eq, String(c), options)) {
            return false;
          }
        }
        return true;
      }
      let higher, lower;
      let hasDomLT, hasDomGT;
      let needDomLTPre = lt && !options.includePrerelease && lt.semver.prerelease.length ? lt.semver : false;
      let needDomGTPre = gt && !options.includePrerelease && gt.semver.prerelease.length ? gt.semver : false;
      if (needDomLTPre && needDomLTPre.prerelease.length === 1 && lt.operator === "<" && needDomLTPre.prerelease[0] === 0) {
        needDomLTPre = false;
      }
      for (const c of dom) {
        hasDomGT = hasDomGT || c.operator === ">" || c.operator === ">=";
        hasDomLT = hasDomLT || c.operator === "<" || c.operator === "<=";
        if (gt) {
          if (needDomGTPre) {
            if (c.semver.prerelease && c.semver.prerelease.length && c.semver.major === needDomGTPre.major && c.semver.minor === needDomGTPre.minor && c.semver.patch === needDomGTPre.patch) {
              needDomGTPre = false;
            }
          }
          if (c.operator === ">" || c.operator === ">=") {
            higher = higherGT(gt, c, options);
            if (higher === c && higher !== gt) {
              return false;
            }
          } else if (gt.operator === ">=" && !c.test(gt.semver)) {
            return false;
          }
        }
        if (lt) {
          if (needDomLTPre) {
            if (c.semver.prerelease && c.semver.prerelease.length && c.semver.major === needDomLTPre.major && c.semver.minor === needDomLTPre.minor && c.semver.patch === needDomLTPre.patch) {
              needDomLTPre = false;
            }
          }
          if (c.operator === "<" || c.operator === "<=") {
            lower = lowerLT(lt, c, options);
            if (lower === c && lower !== lt) {
              return false;
            }
          } else if (lt.operator === "<=" && !c.test(lt.semver)) {
            return false;
          }
        }
        if (!c.operator && (lt || gt) && gtltComp !== 0) {
          return false;
        }
      }
      if (gt && hasDomLT && !lt && gtltComp !== 0) {
        return false;
      }
      if (lt && hasDomGT && !gt && gtltComp !== 0) {
        return false;
      }
      if (needDomGTPre || needDomLTPre) {
        return false;
      }
      return true;
    };
    var higherGT = (a, b, options) => {
      if (!a) {
        return b;
      }
      const comp = compare(a.semver, b.semver, options);
      return comp > 0 ? a : comp < 0 ? b : b.operator === ">" && a.operator === ">=" ? b : a;
    };
    var lowerLT = (a, b, options) => {
      if (!a) {
        return b;
      }
      const comp = compare(a.semver, b.semver, options);
      return comp < 0 ? a : comp > 0 ? b : b.operator === "<" && a.operator === "<=" ? b : a;
    };
    module.exports = subset;
  }
});

// node_modules/semver/index.js
var require_semver2 = __commonJS({
  "node_modules/semver/index.js"(exports, module) {
    "use strict";
    init_define_SEI_BUNDLED_ENGINE_VERSIONS();
    var internalRe = require_re();
    var constants = require_constants();
    var SemVer = require_semver();
    var identifiers = require_identifiers();
    var parse5 = require_parse();
    var valid = require_valid();
    var clean = require_clean();
    var inc = require_inc();
    var diff = require_diff();
    var major = require_major();
    var minor = require_minor();
    var patch = require_patch();
    var prerelease = require_prerelease();
    var compare = require_compare();
    var rcompare = require_rcompare();
    var compareLoose = require_compare_loose();
    var compareBuild = require_compare_build();
    var sort = require_sort();
    var rsort = require_rsort();
    var gt = require_gt();
    var lt = require_lt();
    var eq = require_eq();
    var neq = require_neq();
    var gte = require_gte();
    var lte = require_lte();
    var cmp = require_cmp();
    var coerce = require_coerce();
    var truncate = require_truncate();
    var Comparator = require_comparator();
    var Range2 = require_range();
    var satisfies2 = require_satisfies();
    var toComparators = require_to_comparators();
    var maxSatisfying = require_max_satisfying();
    var minSatisfying = require_min_satisfying();
    var minVersion = require_min_version();
    var validRange = require_valid2();
    var outside = require_outside();
    var gtr = require_gtr();
    var ltr = require_ltr();
    var intersects2 = require_intersects();
    var simplifyRange = require_simplify();
    var subset = require_subset();
    module.exports = {
      parse: parse5,
      valid,
      clean,
      inc,
      diff,
      major,
      minor,
      patch,
      prerelease,
      compare,
      rcompare,
      compareLoose,
      compareBuild,
      sort,
      rsort,
      gt,
      lt,
      eq,
      neq,
      gte,
      lte,
      cmp,
      coerce,
      truncate,
      Comparator,
      Range: Range2,
      satisfies: satisfies2,
      toComparators,
      maxSatisfying,
      minSatisfying,
      minVersion,
      validRange,
      outside,
      gtr,
      ltr,
      intersects: intersects2,
      simplifyRange,
      subset,
      SemVer,
      re: internalRe.re,
      src: internalRe.src,
      tokens: internalRe.t,
      SEMVER_SPEC_VERSION: constants.SEMVER_SPEC_VERSION,
      RELEASE_TYPES: constants.RELEASE_TYPES,
      compareIdentifiers: identifiers.compareIdentifiers,
      rcompareIdentifiers: identifiers.rcompareIdentifiers
    };
  }
});

// node_modules/uri-js/dist/es5/uri.all.js
var require_uri_all = __commonJS({
  "node_modules/uri-js/dist/es5/uri.all.js"(exports, module) {
    init_define_SEI_BUNDLED_ENGINE_VERSIONS();
    (function(global, factory) {
      typeof exports === "object" && typeof module !== "undefined" ? factory(exports) : typeof define === "function" && define.amd ? define(["exports"], factory) : factory(global.URI = global.URI || {});
    })(exports, (function(exports2) {
      "use strict";
      function merge() {
        for (var _len = arguments.length, sets = Array(_len), _key = 0; _key < _len; _key++) {
          sets[_key] = arguments[_key];
        }
        if (sets.length > 1) {
          sets[0] = sets[0].slice(0, -1);
          var xl = sets.length - 1;
          for (var x = 1; x < xl; ++x) {
            sets[x] = sets[x].slice(1, -1);
          }
          sets[xl] = sets[xl].slice(1);
          return sets.join("");
        } else {
          return sets[0];
        }
      }
      function subexp(str) {
        return "(?:" + str + ")";
      }
      function typeOf(o) {
        return o === void 0 ? "undefined" : o === null ? "null" : Object.prototype.toString.call(o).split(" ").pop().split("]").shift().toLowerCase();
      }
      function toUpperCase(str) {
        return str.toUpperCase();
      }
      function toArray(obj) {
        return obj !== void 0 && obj !== null ? obj instanceof Array ? obj : typeof obj.length !== "number" || obj.split || obj.setInterval || obj.call ? [obj] : Array.prototype.slice.call(obj) : [];
      }
      function assign(target, source) {
        var obj = target;
        if (source) {
          for (var key in source) {
            obj[key] = source[key];
          }
        }
        return obj;
      }
      function buildExps(isIRI2) {
        var ALPHA$$ = "[A-Za-z]", CR$ = "[\\x0D]", DIGIT$$ = "[0-9]", DQUOTE$$ = "[\\x22]", HEXDIG$$2 = merge(DIGIT$$, "[A-Fa-f]"), LF$$ = "[\\x0A]", SP$$ = "[\\x20]", PCT_ENCODED$2 = subexp(subexp("%[EFef]" + HEXDIG$$2 + "%" + HEXDIG$$2 + HEXDIG$$2 + "%" + HEXDIG$$2 + HEXDIG$$2) + "|" + subexp("%[89A-Fa-f]" + HEXDIG$$2 + "%" + HEXDIG$$2 + HEXDIG$$2) + "|" + subexp("%" + HEXDIG$$2 + HEXDIG$$2)), GEN_DELIMS$$ = "[\\:\\/\\?\\#\\[\\]\\@]", SUB_DELIMS$$ = "[\\!\\$\\&\\'\\(\\)\\*\\+\\,\\;\\=]", RESERVED$$ = merge(GEN_DELIMS$$, SUB_DELIMS$$), UCSCHAR$$ = isIRI2 ? "[\\xA0-\\u200D\\u2010-\\u2029\\u202F-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFEF]" : "[]", IPRIVATE$$ = isIRI2 ? "[\\uE000-\\uF8FF]" : "[]", UNRESERVED$$2 = merge(ALPHA$$, DIGIT$$, "[\\-\\.\\_\\~]", UCSCHAR$$), SCHEME$ = subexp(ALPHA$$ + merge(ALPHA$$, DIGIT$$, "[\\+\\-\\.]") + "*"), USERINFO$ = subexp(subexp(PCT_ENCODED$2 + "|" + merge(UNRESERVED$$2, SUB_DELIMS$$, "[\\:]")) + "*"), DEC_OCTET$ = subexp(subexp("25[0-5]") + "|" + subexp("2[0-4]" + DIGIT$$) + "|" + subexp("1" + DIGIT$$ + DIGIT$$) + "|" + subexp("[1-9]" + DIGIT$$) + "|" + DIGIT$$), DEC_OCTET_RELAXED$ = subexp(subexp("25[0-5]") + "|" + subexp("2[0-4]" + DIGIT$$) + "|" + subexp("1" + DIGIT$$ + DIGIT$$) + "|" + subexp("0?[1-9]" + DIGIT$$) + "|0?0?" + DIGIT$$), IPV4ADDRESS$ = subexp(DEC_OCTET_RELAXED$ + "\\." + DEC_OCTET_RELAXED$ + "\\." + DEC_OCTET_RELAXED$ + "\\." + DEC_OCTET_RELAXED$), H16$ = subexp(HEXDIG$$2 + "{1,4}"), LS32$ = subexp(subexp(H16$ + "\\:" + H16$) + "|" + IPV4ADDRESS$), IPV6ADDRESS1$ = subexp(subexp(H16$ + "\\:") + "{6}" + LS32$), IPV6ADDRESS2$ = subexp("\\:\\:" + subexp(H16$ + "\\:") + "{5}" + LS32$), IPV6ADDRESS3$ = subexp(subexp(H16$) + "?\\:\\:" + subexp(H16$ + "\\:") + "{4}" + LS32$), IPV6ADDRESS4$ = subexp(subexp(subexp(H16$ + "\\:") + "{0,1}" + H16$) + "?\\:\\:" + subexp(H16$ + "\\:") + "{3}" + LS32$), IPV6ADDRESS5$ = subexp(subexp(subexp(H16$ + "\\:") + "{0,2}" + H16$) + "?\\:\\:" + subexp(H16$ + "\\:") + "{2}" + LS32$), IPV6ADDRESS6$ = subexp(subexp(subexp(H16$ + "\\:") + "{0,3}" + H16$) + "?\\:\\:" + H16$ + "\\:" + LS32$), IPV6ADDRESS7$ = subexp(subexp(subexp(H16$ + "\\:") + "{0,4}" + H16$) + "?\\:\\:" + LS32$), IPV6ADDRESS8$ = subexp(subexp(subexp(H16$ + "\\:") + "{0,5}" + H16$) + "?\\:\\:" + H16$), IPV6ADDRESS9$ = subexp(subexp(subexp(H16$ + "\\:") + "{0,6}" + H16$) + "?\\:\\:"), IPV6ADDRESS$ = subexp([IPV6ADDRESS1$, IPV6ADDRESS2$, IPV6ADDRESS3$, IPV6ADDRESS4$, IPV6ADDRESS5$, IPV6ADDRESS6$, IPV6ADDRESS7$, IPV6ADDRESS8$, IPV6ADDRESS9$].join("|")), ZONEID$ = subexp(subexp(UNRESERVED$$2 + "|" + PCT_ENCODED$2) + "+"), IPV6ADDRZ$ = subexp(IPV6ADDRESS$ + "\\%25" + ZONEID$), IPV6ADDRZ_RELAXED$ = subexp(IPV6ADDRESS$ + subexp("\\%25|\\%(?!" + HEXDIG$$2 + "{2})") + ZONEID$), IPVFUTURE$ = subexp("[vV]" + HEXDIG$$2 + "+\\." + merge(UNRESERVED$$2, SUB_DELIMS$$, "[\\:]") + "+"), IP_LITERAL$ = subexp("\\[" + subexp(IPV6ADDRZ_RELAXED$ + "|" + IPV6ADDRESS$ + "|" + IPVFUTURE$) + "\\]"), REG_NAME$ = subexp(subexp(PCT_ENCODED$2 + "|" + merge(UNRESERVED$$2, SUB_DELIMS$$)) + "*"), HOST$ = subexp(IP_LITERAL$ + "|" + IPV4ADDRESS$ + "(?!" + REG_NAME$ + ")|" + REG_NAME$), PORT$ = subexp(DIGIT$$ + "*"), AUTHORITY$ = subexp(subexp(USERINFO$ + "@") + "?" + HOST$ + subexp("\\:" + PORT$) + "?"), PCHAR$ = subexp(PCT_ENCODED$2 + "|" + merge(UNRESERVED$$2, SUB_DELIMS$$, "[\\:\\@]")), SEGMENT$ = subexp(PCHAR$ + "*"), SEGMENT_NZ$ = subexp(PCHAR$ + "+"), SEGMENT_NZ_NC$ = subexp(subexp(PCT_ENCODED$2 + "|" + merge(UNRESERVED$$2, SUB_DELIMS$$, "[\\@]")) + "+"), PATH_ABEMPTY$ = subexp(subexp("\\/" + SEGMENT$) + "*"), PATH_ABSOLUTE$ = subexp("\\/" + subexp(SEGMENT_NZ$ + PATH_ABEMPTY$) + "?"), PATH_NOSCHEME$ = subexp(SEGMENT_NZ_NC$ + PATH_ABEMPTY$), PATH_ROOTLESS$ = subexp(SEGMENT_NZ$ + PATH_ABEMPTY$), PATH_EMPTY$ = "(?!" + PCHAR$ + ")", PATH$ = subexp(PATH_ABEMPTY$ + "|" + PATH_ABSOLUTE$ + "|" + PATH_NOSCHEME$ + "|" + PATH_ROOTLESS$ + "|" + PATH_EMPTY$), QUERY$ = subexp(subexp(PCHAR$ + "|" + merge("[\\/\\?]", IPRIVATE$$)) + "*"), FRAGMENT$ = subexp(subexp(PCHAR$ + "|[\\/\\?]") + "*"), HIER_PART$ = subexp(subexp("\\/\\/" + AUTHORITY$ + PATH_ABEMPTY$) + "|" + PATH_ABSOLUTE$ + "|" + PATH_ROOTLESS$ + "|" + PATH_EMPTY$), URI$ = subexp(SCHEME$ + "\\:" + HIER_PART$ + subexp("\\?" + QUERY$) + "?" + subexp("\\#" + FRAGMENT$) + "?"), RELATIVE_PART$ = subexp(subexp("\\/\\/" + AUTHORITY$ + PATH_ABEMPTY$) + "|" + PATH_ABSOLUTE$ + "|" + PATH_NOSCHEME$ + "|" + PATH_EMPTY$), RELATIVE$ = subexp(RELATIVE_PART$ + subexp("\\?" + QUERY$) + "?" + subexp("\\#" + FRAGMENT$) + "?"), URI_REFERENCE$ = subexp(URI$ + "|" + RELATIVE$), ABSOLUTE_URI$ = subexp(SCHEME$ + "\\:" + HIER_PART$ + subexp("\\?" + QUERY$) + "?"), GENERIC_REF$ = "^(" + SCHEME$ + ")\\:" + subexp(subexp("\\/\\/(" + subexp("(" + USERINFO$ + ")@") + "?(" + HOST$ + ")" + subexp("\\:(" + PORT$ + ")") + "?)") + "?(" + PATH_ABEMPTY$ + "|" + PATH_ABSOLUTE$ + "|" + PATH_ROOTLESS$ + "|" + PATH_EMPTY$ + ")") + subexp("\\?(" + QUERY$ + ")") + "?" + subexp("\\#(" + FRAGMENT$ + ")") + "?$", RELATIVE_REF$ = "^(){0}" + subexp(subexp("\\/\\/(" + subexp("(" + USERINFO$ + ")@") + "?(" + HOST$ + ")" + subexp("\\:(" + PORT$ + ")") + "?)") + "?(" + PATH_ABEMPTY$ + "|" + PATH_ABSOLUTE$ + "|" + PATH_NOSCHEME$ + "|" + PATH_EMPTY$ + ")") + subexp("\\?(" + QUERY$ + ")") + "?" + subexp("\\#(" + FRAGMENT$ + ")") + "?$", ABSOLUTE_REF$ = "^(" + SCHEME$ + ")\\:" + subexp(subexp("\\/\\/(" + subexp("(" + USERINFO$ + ")@") + "?(" + HOST$ + ")" + subexp("\\:(" + PORT$ + ")") + "?)") + "?(" + PATH_ABEMPTY$ + "|" + PATH_ABSOLUTE$ + "|" + PATH_ROOTLESS$ + "|" + PATH_EMPTY$ + ")") + subexp("\\?(" + QUERY$ + ")") + "?$", SAMEDOC_REF$ = "^" + subexp("\\#(" + FRAGMENT$ + ")") + "?$", AUTHORITY_REF$ = "^" + subexp("(" + USERINFO$ + ")@") + "?(" + HOST$ + ")" + subexp("\\:(" + PORT$ + ")") + "?$";
        return {
          NOT_SCHEME: new RegExp(merge("[^]", ALPHA$$, DIGIT$$, "[\\+\\-\\.]"), "g"),
          NOT_USERINFO: new RegExp(merge("[^\\%\\:]", UNRESERVED$$2, SUB_DELIMS$$), "g"),
          NOT_HOST: new RegExp(merge("[^\\%\\[\\]\\:]", UNRESERVED$$2, SUB_DELIMS$$), "g"),
          NOT_PATH: new RegExp(merge("[^\\%\\/\\:\\@]", UNRESERVED$$2, SUB_DELIMS$$), "g"),
          NOT_PATH_NOSCHEME: new RegExp(merge("[^\\%\\/\\@]", UNRESERVED$$2, SUB_DELIMS$$), "g"),
          NOT_QUERY: new RegExp(merge("[^\\%]", UNRESERVED$$2, SUB_DELIMS$$, "[\\:\\@\\/\\?]", IPRIVATE$$), "g"),
          NOT_FRAGMENT: new RegExp(merge("[^\\%]", UNRESERVED$$2, SUB_DELIMS$$, "[\\:\\@\\/\\?]"), "g"),
          ESCAPE: new RegExp(merge("[^]", UNRESERVED$$2, SUB_DELIMS$$), "g"),
          UNRESERVED: new RegExp(UNRESERVED$$2, "g"),
          OTHER_CHARS: new RegExp(merge("[^\\%]", UNRESERVED$$2, RESERVED$$), "g"),
          PCT_ENCODED: new RegExp(PCT_ENCODED$2, "g"),
          IPV4ADDRESS: new RegExp("^(" + IPV4ADDRESS$ + ")$"),
          IPV6ADDRESS: new RegExp("^\\[?(" + IPV6ADDRESS$ + ")" + subexp(subexp("\\%25|\\%(?!" + HEXDIG$$2 + "{2})") + "(" + ZONEID$ + ")") + "?\\]?$")
          //RFC 6874, with relaxed parsing rules
        };
      }
      var URI_PROTOCOL = buildExps(false);
      var IRI_PROTOCOL = buildExps(true);
      var slicedToArray = /* @__PURE__ */ (function() {
        function sliceIterator(arr, i) {
          var _arr = [];
          var _n = true;
          var _d = false;
          var _e = void 0;
          try {
            for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
              _arr.push(_s.value);
              if (i && _arr.length === i) break;
            }
          } catch (err) {
            _d = true;
            _e = err;
          } finally {
            try {
              if (!_n && _i["return"]) _i["return"]();
            } finally {
              if (_d) throw _e;
            }
          }
          return _arr;
        }
        return function(arr, i) {
          if (Array.isArray(arr)) {
            return arr;
          } else if (Symbol.iterator in Object(arr)) {
            return sliceIterator(arr, i);
          } else {
            throw new TypeError("Invalid attempt to destructure non-iterable instance");
          }
        };
      })();
      var toConsumableArray = function(arr) {
        if (Array.isArray(arr)) {
          for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i];
          return arr2;
        } else {
          return Array.from(arr);
        }
      };
      var maxInt = 2147483647;
      var base = 36;
      var tMin = 1;
      var tMax = 26;
      var skew = 38;
      var damp = 700;
      var initialBias = 72;
      var initialN = 128;
      var delimiter = "-";
      var regexPunycode = /^xn--/;
      var regexNonASCII = /[^\0-\x7E]/;
      var regexSeparators = /[\x2E\u3002\uFF0E\uFF61]/g;
      var errors = {
        "overflow": "Overflow: input needs wider integers to process",
        "not-basic": "Illegal input >= 0x80 (not a basic code point)",
        "invalid-input": "Invalid input"
      };
      var baseMinusTMin = base - tMin;
      var floor = Math.floor;
      var stringFromCharCode = String.fromCharCode;
      function error$1(type) {
        throw new RangeError(errors[type]);
      }
      function map(array, fn) {
        var result = [];
        var length = array.length;
        while (length--) {
          result[length] = fn(array[length]);
        }
        return result;
      }
      function mapDomain(string, fn) {
        var parts = string.split("@");
        var result = "";
        if (parts.length > 1) {
          result = parts[0] + "@";
          string = parts[1];
        }
        string = string.replace(regexSeparators, ".");
        var labels = string.split(".");
        var encoded = map(labels, fn).join(".");
        return result + encoded;
      }
      function ucs2decode(string) {
        var output = [];
        var counter = 0;
        var length = string.length;
        while (counter < length) {
          var value = string.charCodeAt(counter++);
          if (value >= 55296 && value <= 56319 && counter < length) {
            var extra = string.charCodeAt(counter++);
            if ((extra & 64512) == 56320) {
              output.push(((value & 1023) << 10) + (extra & 1023) + 65536);
            } else {
              output.push(value);
              counter--;
            }
          } else {
            output.push(value);
          }
        }
        return output;
      }
      var ucs2encode = function ucs2encode2(array) {
        return String.fromCodePoint.apply(String, toConsumableArray(array));
      };
      var basicToDigit = function basicToDigit2(codePoint) {
        if (codePoint - 48 < 10) {
          return codePoint - 22;
        }
        if (codePoint - 65 < 26) {
          return codePoint - 65;
        }
        if (codePoint - 97 < 26) {
          return codePoint - 97;
        }
        return base;
      };
      var digitToBasic = function digitToBasic2(digit, flag) {
        return digit + 22 + 75 * (digit < 26) - ((flag != 0) << 5);
      };
      var adapt = function adapt2(delta, numPoints, firstTime) {
        var k = 0;
        delta = firstTime ? floor(delta / damp) : delta >> 1;
        delta += floor(delta / numPoints);
        for (
          ;
          /* no initialization */
          delta > baseMinusTMin * tMax >> 1;
          k += base
        ) {
          delta = floor(delta / baseMinusTMin);
        }
        return floor(k + (baseMinusTMin + 1) * delta / (delta + skew));
      };
      var decode = function decode2(input) {
        var output = [];
        var inputLength = input.length;
        var i = 0;
        var n = initialN;
        var bias = initialBias;
        var basic = input.lastIndexOf(delimiter);
        if (basic < 0) {
          basic = 0;
        }
        for (var j = 0; j < basic; ++j) {
          if (input.charCodeAt(j) >= 128) {
            error$1("not-basic");
          }
          output.push(input.charCodeAt(j));
        }
        for (var index = basic > 0 ? basic + 1 : 0; index < inputLength; ) {
          var oldi = i;
          for (
            var w = 1, k = base;
            ;
            /* no condition */
            k += base
          ) {
            if (index >= inputLength) {
              error$1("invalid-input");
            }
            var digit = basicToDigit(input.charCodeAt(index++));
            if (digit >= base || digit > floor((maxInt - i) / w)) {
              error$1("overflow");
            }
            i += digit * w;
            var t = k <= bias ? tMin : k >= bias + tMax ? tMax : k - bias;
            if (digit < t) {
              break;
            }
            var baseMinusT = base - t;
            if (w > floor(maxInt / baseMinusT)) {
              error$1("overflow");
            }
            w *= baseMinusT;
          }
          var out = output.length + 1;
          bias = adapt(i - oldi, out, oldi == 0);
          if (floor(i / out) > maxInt - n) {
            error$1("overflow");
          }
          n += floor(i / out);
          i %= out;
          output.splice(i++, 0, n);
        }
        return String.fromCodePoint.apply(String, output);
      };
      var encode = function encode2(input) {
        var output = [];
        input = ucs2decode(input);
        var inputLength = input.length;
        var n = initialN;
        var delta = 0;
        var bias = initialBias;
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = void 0;
        try {
          for (var _iterator = input[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var _currentValue2 = _step.value;
            if (_currentValue2 < 128) {
              output.push(stringFromCharCode(_currentValue2));
            }
          }
        } catch (err) {
          _didIteratorError = true;
          _iteratorError = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion && _iterator.return) {
              _iterator.return();
            }
          } finally {
            if (_didIteratorError) {
              throw _iteratorError;
            }
          }
        }
        var basicLength = output.length;
        var handledCPCount = basicLength;
        if (basicLength) {
          output.push(delimiter);
        }
        while (handledCPCount < inputLength) {
          var m = maxInt;
          var _iteratorNormalCompletion2 = true;
          var _didIteratorError2 = false;
          var _iteratorError2 = void 0;
          try {
            for (var _iterator2 = input[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
              var currentValue = _step2.value;
              if (currentValue >= n && currentValue < m) {
                m = currentValue;
              }
            }
          } catch (err) {
            _didIteratorError2 = true;
            _iteratorError2 = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion2 && _iterator2.return) {
                _iterator2.return();
              }
            } finally {
              if (_didIteratorError2) {
                throw _iteratorError2;
              }
            }
          }
          var handledCPCountPlusOne = handledCPCount + 1;
          if (m - n > floor((maxInt - delta) / handledCPCountPlusOne)) {
            error$1("overflow");
          }
          delta += (m - n) * handledCPCountPlusOne;
          n = m;
          var _iteratorNormalCompletion3 = true;
          var _didIteratorError3 = false;
          var _iteratorError3 = void 0;
          try {
            for (var _iterator3 = input[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
              var _currentValue = _step3.value;
              if (_currentValue < n && ++delta > maxInt) {
                error$1("overflow");
              }
              if (_currentValue == n) {
                var q = delta;
                for (
                  var k = base;
                  ;
                  /* no condition */
                  k += base
                ) {
                  var t = k <= bias ? tMin : k >= bias + tMax ? tMax : k - bias;
                  if (q < t) {
                    break;
                  }
                  var qMinusT = q - t;
                  var baseMinusT = base - t;
                  output.push(stringFromCharCode(digitToBasic(t + qMinusT % baseMinusT, 0)));
                  q = floor(qMinusT / baseMinusT);
                }
                output.push(stringFromCharCode(digitToBasic(q, 0)));
                bias = adapt(delta, handledCPCountPlusOne, handledCPCount == basicLength);
                delta = 0;
                ++handledCPCount;
              }
            }
          } catch (err) {
            _didIteratorError3 = true;
            _iteratorError3 = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion3 && _iterator3.return) {
                _iterator3.return();
              }
            } finally {
              if (_didIteratorError3) {
                throw _iteratorError3;
              }
            }
          }
          ++delta;
          ++n;
        }
        return output.join("");
      };
      var toUnicode = function toUnicode2(input) {
        return mapDomain(input, function(string) {
          return regexPunycode.test(string) ? decode(string.slice(4).toLowerCase()) : string;
        });
      };
      var toASCII = function toASCII2(input) {
        return mapDomain(input, function(string) {
          return regexNonASCII.test(string) ? "xn--" + encode(string) : string;
        });
      };
      var punycode = {
        /**
         * A string representing the current Punycode.js version number.
         * @memberOf punycode
         * @type String
         */
        "version": "2.1.0",
        /**
         * An object of methods to convert from JavaScript's internal character
         * representation (UCS-2) to Unicode code points, and back.
         * @see <https://mathiasbynens.be/notes/javascript-encoding>
         * @memberOf punycode
         * @type Object
         */
        "ucs2": {
          "decode": ucs2decode,
          "encode": ucs2encode
        },
        "decode": decode,
        "encode": encode,
        "toASCII": toASCII,
        "toUnicode": toUnicode
      };
      var SCHEMES = {};
      function pctEncChar(chr) {
        var c = chr.charCodeAt(0);
        var e = void 0;
        if (c < 16) e = "%0" + c.toString(16).toUpperCase();
        else if (c < 128) e = "%" + c.toString(16).toUpperCase();
        else if (c < 2048) e = "%" + (c >> 6 | 192).toString(16).toUpperCase() + "%" + (c & 63 | 128).toString(16).toUpperCase();
        else e = "%" + (c >> 12 | 224).toString(16).toUpperCase() + "%" + (c >> 6 & 63 | 128).toString(16).toUpperCase() + "%" + (c & 63 | 128).toString(16).toUpperCase();
        return e;
      }
      function pctDecChars(str) {
        var newStr = "";
        var i = 0;
        var il = str.length;
        while (i < il) {
          var c = parseInt(str.substr(i + 1, 2), 16);
          if (c < 128) {
            newStr += String.fromCharCode(c);
            i += 3;
          } else if (c >= 194 && c < 224) {
            if (il - i >= 6) {
              var c2 = parseInt(str.substr(i + 4, 2), 16);
              newStr += String.fromCharCode((c & 31) << 6 | c2 & 63);
            } else {
              newStr += str.substr(i, 6);
            }
            i += 6;
          } else if (c >= 224) {
            if (il - i >= 9) {
              var _c = parseInt(str.substr(i + 4, 2), 16);
              var c3 = parseInt(str.substr(i + 7, 2), 16);
              newStr += String.fromCharCode((c & 15) << 12 | (_c & 63) << 6 | c3 & 63);
            } else {
              newStr += str.substr(i, 9);
            }
            i += 9;
          } else {
            newStr += str.substr(i, 3);
            i += 3;
          }
        }
        return newStr;
      }
      function _normalizeComponentEncoding(components, protocol) {
        function decodeUnreserved2(str) {
          var decStr = pctDecChars(str);
          return !decStr.match(protocol.UNRESERVED) ? str : decStr;
        }
        if (components.scheme) components.scheme = String(components.scheme).replace(protocol.PCT_ENCODED, decodeUnreserved2).toLowerCase().replace(protocol.NOT_SCHEME, "");
        if (components.userinfo !== void 0) components.userinfo = String(components.userinfo).replace(protocol.PCT_ENCODED, decodeUnreserved2).replace(protocol.NOT_USERINFO, pctEncChar).replace(protocol.PCT_ENCODED, toUpperCase);
        if (components.host !== void 0) components.host = String(components.host).replace(protocol.PCT_ENCODED, decodeUnreserved2).toLowerCase().replace(protocol.NOT_HOST, pctEncChar).replace(protocol.PCT_ENCODED, toUpperCase);
        if (components.path !== void 0) components.path = String(components.path).replace(protocol.PCT_ENCODED, decodeUnreserved2).replace(components.scheme ? protocol.NOT_PATH : protocol.NOT_PATH_NOSCHEME, pctEncChar).replace(protocol.PCT_ENCODED, toUpperCase);
        if (components.query !== void 0) components.query = String(components.query).replace(protocol.PCT_ENCODED, decodeUnreserved2).replace(protocol.NOT_QUERY, pctEncChar).replace(protocol.PCT_ENCODED, toUpperCase);
        if (components.fragment !== void 0) components.fragment = String(components.fragment).replace(protocol.PCT_ENCODED, decodeUnreserved2).replace(protocol.NOT_FRAGMENT, pctEncChar).replace(protocol.PCT_ENCODED, toUpperCase);
        return components;
      }
      function _stripLeadingZeros(str) {
        return str.replace(/^0*(.*)/, "$1") || "0";
      }
      function _normalizeIPv4(host, protocol) {
        var matches = host.match(protocol.IPV4ADDRESS) || [];
        var _matches = slicedToArray(matches, 2), address = _matches[1];
        if (address) {
          return address.split(".").map(_stripLeadingZeros).join(".");
        } else {
          return host;
        }
      }
      function _normalizeIPv6(host, protocol) {
        var matches = host.match(protocol.IPV6ADDRESS) || [];
        var _matches2 = slicedToArray(matches, 3), address = _matches2[1], zone = _matches2[2];
        if (address) {
          var _address$toLowerCase$ = address.toLowerCase().split("::").reverse(), _address$toLowerCase$2 = slicedToArray(_address$toLowerCase$, 2), last = _address$toLowerCase$2[0], first = _address$toLowerCase$2[1];
          var firstFields = first ? first.split(":").map(_stripLeadingZeros) : [];
          var lastFields = last.split(":").map(_stripLeadingZeros);
          var isLastFieldIPv4Address = protocol.IPV4ADDRESS.test(lastFields[lastFields.length - 1]);
          var fieldCount = isLastFieldIPv4Address ? 7 : 8;
          var lastFieldsStart = lastFields.length - fieldCount;
          var fields = Array(fieldCount);
          for (var x = 0; x < fieldCount; ++x) {
            fields[x] = firstFields[x] || lastFields[lastFieldsStart + x] || "";
          }
          if (isLastFieldIPv4Address) {
            fields[fieldCount - 1] = _normalizeIPv4(fields[fieldCount - 1], protocol);
          }
          var allZeroFields = fields.reduce(function(acc, field, index) {
            if (!field || field === "0") {
              var lastLongest = acc[acc.length - 1];
              if (lastLongest && lastLongest.index + lastLongest.length === index) {
                lastLongest.length++;
              } else {
                acc.push({ index, length: 1 });
              }
            }
            return acc;
          }, []);
          var longestZeroFields = allZeroFields.sort(function(a, b) {
            return b.length - a.length;
          })[0];
          var newHost = void 0;
          if (longestZeroFields && longestZeroFields.length > 1) {
            var newFirst = fields.slice(0, longestZeroFields.index);
            var newLast = fields.slice(longestZeroFields.index + longestZeroFields.length);
            newHost = newFirst.join(":") + "::" + newLast.join(":");
          } else {
            newHost = fields.join(":");
          }
          if (zone) {
            newHost += "%" + zone;
          }
          return newHost;
        } else {
          return host;
        }
      }
      var URI_PARSE = /^(?:([^:\/?#]+):)?(?:\/\/((?:([^\/?#@]*)@)?(\[[^\/?#\]]+\]|[^\/?#:]*)(?:\:(\d*))?))?([^?#]*)(?:\?([^#]*))?(?:#((?:.|\n|\r)*))?/i;
      var NO_MATCH_IS_UNDEFINED = "".match(/(){0}/)[1] === void 0;
      function parse5(uriString) {
        var options = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
        var components = {};
        var protocol = options.iri !== false ? IRI_PROTOCOL : URI_PROTOCOL;
        if (options.reference === "suffix") uriString = (options.scheme ? options.scheme + ":" : "") + "//" + uriString;
        var matches = uriString.match(URI_PARSE);
        if (matches) {
          if (NO_MATCH_IS_UNDEFINED) {
            components.scheme = matches[1];
            components.userinfo = matches[3];
            components.host = matches[4];
            components.port = parseInt(matches[5], 10);
            components.path = matches[6] || "";
            components.query = matches[7];
            components.fragment = matches[8];
            if (isNaN(components.port)) {
              components.port = matches[5];
            }
          } else {
            components.scheme = matches[1] || void 0;
            components.userinfo = uriString.indexOf("@") !== -1 ? matches[3] : void 0;
            components.host = uriString.indexOf("//") !== -1 ? matches[4] : void 0;
            components.port = parseInt(matches[5], 10);
            components.path = matches[6] || "";
            components.query = uriString.indexOf("?") !== -1 ? matches[7] : void 0;
            components.fragment = uriString.indexOf("#") !== -1 ? matches[8] : void 0;
            if (isNaN(components.port)) {
              components.port = uriString.match(/\/\/(?:.|\n)*\:(?:\/|\?|\#|$)/) ? matches[4] : void 0;
            }
          }
          if (components.host) {
            components.host = _normalizeIPv6(_normalizeIPv4(components.host, protocol), protocol);
          }
          if (components.scheme === void 0 && components.userinfo === void 0 && components.host === void 0 && components.port === void 0 && !components.path && components.query === void 0) {
            components.reference = "same-document";
          } else if (components.scheme === void 0) {
            components.reference = "relative";
          } else if (components.fragment === void 0) {
            components.reference = "absolute";
          } else {
            components.reference = "uri";
          }
          if (options.reference && options.reference !== "suffix" && options.reference !== components.reference) {
            components.error = components.error || "URI is not a " + options.reference + " reference.";
          }
          var schemeHandler = SCHEMES[(options.scheme || components.scheme || "").toLowerCase()];
          if (!options.unicodeSupport && (!schemeHandler || !schemeHandler.unicodeSupport)) {
            if (components.host && (options.domainHost || schemeHandler && schemeHandler.domainHost)) {
              try {
                components.host = punycode.toASCII(components.host.replace(protocol.PCT_ENCODED, pctDecChars).toLowerCase());
              } catch (e) {
                components.error = components.error || "Host's domain name can not be converted to ASCII via punycode: " + e;
              }
            }
            _normalizeComponentEncoding(components, URI_PROTOCOL);
          } else {
            _normalizeComponentEncoding(components, protocol);
          }
          if (schemeHandler && schemeHandler.parse) {
            schemeHandler.parse(components, options);
          }
        } else {
          components.error = components.error || "URI can not be parsed.";
        }
        return components;
      }
      function _recomposeAuthority(components, options) {
        var protocol = options.iri !== false ? IRI_PROTOCOL : URI_PROTOCOL;
        var uriTokens = [];
        if (components.userinfo !== void 0) {
          uriTokens.push(components.userinfo);
          uriTokens.push("@");
        }
        if (components.host !== void 0) {
          uriTokens.push(_normalizeIPv6(_normalizeIPv4(String(components.host), protocol), protocol).replace(protocol.IPV6ADDRESS, function(_, $1, $2) {
            return "[" + $1 + ($2 ? "%25" + $2 : "") + "]";
          }));
        }
        if (typeof components.port === "number" || typeof components.port === "string") {
          uriTokens.push(":");
          uriTokens.push(String(components.port));
        }
        return uriTokens.length ? uriTokens.join("") : void 0;
      }
      var RDS1 = /^\.\.?\//;
      var RDS2 = /^\/\.(\/|$)/;
      var RDS3 = /^\/\.\.(\/|$)/;
      var RDS5 = /^\/?(?:.|\n)*?(?=\/|$)/;
      function removeDotSegments(input) {
        var output = [];
        while (input.length) {
          if (input.match(RDS1)) {
            input = input.replace(RDS1, "");
          } else if (input.match(RDS2)) {
            input = input.replace(RDS2, "/");
          } else if (input.match(RDS3)) {
            input = input.replace(RDS3, "/");
            output.pop();
          } else if (input === "." || input === "..") {
            input = "";
          } else {
            var im = input.match(RDS5);
            if (im) {
              var s = im[0];
              input = input.slice(s.length);
              output.push(s);
            } else {
              throw new Error("Unexpected dot segment condition");
            }
          }
        }
        return output.join("");
      }
      function serialize(components) {
        var options = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
        var protocol = options.iri ? IRI_PROTOCOL : URI_PROTOCOL;
        var uriTokens = [];
        var schemeHandler = SCHEMES[(options.scheme || components.scheme || "").toLowerCase()];
        if (schemeHandler && schemeHandler.serialize) schemeHandler.serialize(components, options);
        if (components.host) {
          if (protocol.IPV6ADDRESS.test(components.host)) {
          } else if (options.domainHost || schemeHandler && schemeHandler.domainHost) {
            try {
              components.host = !options.iri ? punycode.toASCII(components.host.replace(protocol.PCT_ENCODED, pctDecChars).toLowerCase()) : punycode.toUnicode(components.host);
            } catch (e) {
              components.error = components.error || "Host's domain name can not be converted to " + (!options.iri ? "ASCII" : "Unicode") + " via punycode: " + e;
            }
          }
        }
        _normalizeComponentEncoding(components, protocol);
        if (options.reference !== "suffix" && components.scheme) {
          uriTokens.push(components.scheme);
          uriTokens.push(":");
        }
        var authority = _recomposeAuthority(components, options);
        if (authority !== void 0) {
          if (options.reference !== "suffix") {
            uriTokens.push("//");
          }
          uriTokens.push(authority);
          if (components.path && components.path.charAt(0) !== "/") {
            uriTokens.push("/");
          }
        }
        if (components.path !== void 0) {
          var s = components.path;
          if (!options.absolutePath && (!schemeHandler || !schemeHandler.absolutePath)) {
            s = removeDotSegments(s);
          }
          if (authority === void 0) {
            s = s.replace(/^\/\//, "/%2F");
          }
          uriTokens.push(s);
        }
        if (components.query !== void 0) {
          uriTokens.push("?");
          uriTokens.push(components.query);
        }
        if (components.fragment !== void 0) {
          uriTokens.push("#");
          uriTokens.push(components.fragment);
        }
        return uriTokens.join("");
      }
      function resolveComponents(base2, relative) {
        var options = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
        var skipNormalization = arguments[3];
        var target = {};
        if (!skipNormalization) {
          base2 = parse5(serialize(base2, options), options);
          relative = parse5(serialize(relative, options), options);
        }
        options = options || {};
        if (!options.tolerant && relative.scheme) {
          target.scheme = relative.scheme;
          target.userinfo = relative.userinfo;
          target.host = relative.host;
          target.port = relative.port;
          target.path = removeDotSegments(relative.path || "");
          target.query = relative.query;
        } else {
          if (relative.userinfo !== void 0 || relative.host !== void 0 || relative.port !== void 0) {
            target.userinfo = relative.userinfo;
            target.host = relative.host;
            target.port = relative.port;
            target.path = removeDotSegments(relative.path || "");
            target.query = relative.query;
          } else {
            if (!relative.path) {
              target.path = base2.path;
              if (relative.query !== void 0) {
                target.query = relative.query;
              } else {
                target.query = base2.query;
              }
            } else {
              if (relative.path.charAt(0) === "/") {
                target.path = removeDotSegments(relative.path);
              } else {
                if ((base2.userinfo !== void 0 || base2.host !== void 0 || base2.port !== void 0) && !base2.path) {
                  target.path = "/" + relative.path;
                } else if (!base2.path) {
                  target.path = relative.path;
                } else {
                  target.path = base2.path.slice(0, base2.path.lastIndexOf("/") + 1) + relative.path;
                }
                target.path = removeDotSegments(target.path);
              }
              target.query = relative.query;
            }
            target.userinfo = base2.userinfo;
            target.host = base2.host;
            target.port = base2.port;
          }
          target.scheme = base2.scheme;
        }
        target.fragment = relative.fragment;
        return target;
      }
      function resolve2(baseURI, relativeURI, options) {
        var schemelessOptions = assign({ scheme: "null" }, options);
        return serialize(resolveComponents(parse5(baseURI, schemelessOptions), parse5(relativeURI, schemelessOptions), schemelessOptions, true), schemelessOptions);
      }
      function normalize2(uri, options) {
        if (typeof uri === "string") {
          uri = serialize(parse5(uri, options), options);
        } else if (typeOf(uri) === "object") {
          uri = parse5(serialize(uri, options), options);
        }
        return uri;
      }
      function equal2(uriA, uriB, options) {
        if (typeof uriA === "string") {
          uriA = serialize(parse5(uriA, options), options);
        } else if (typeOf(uriA) === "object") {
          uriA = serialize(uriA, options);
        }
        if (typeof uriB === "string") {
          uriB = serialize(parse5(uriB, options), options);
        } else if (typeOf(uriB) === "object") {
          uriB = serialize(uriB, options);
        }
        return uriA === uriB;
      }
      function escapeComponent(str, options) {
        return str && str.toString().replace(!options || !options.iri ? URI_PROTOCOL.ESCAPE : IRI_PROTOCOL.ESCAPE, pctEncChar);
      }
      function unescapeComponent(str, options) {
        return str && str.toString().replace(!options || !options.iri ? URI_PROTOCOL.PCT_ENCODED : IRI_PROTOCOL.PCT_ENCODED, pctDecChars);
      }
      var handler = {
        scheme: "http",
        domainHost: true,
        parse: function parse6(components, options) {
          if (!components.host) {
            components.error = components.error || "HTTP URIs must have a host.";
          }
          return components;
        },
        serialize: function serialize2(components, options) {
          var secure = String(components.scheme).toLowerCase() === "https";
          if (components.port === (secure ? 443 : 80) || components.port === "") {
            components.port = void 0;
          }
          if (!components.path) {
            components.path = "/";
          }
          return components;
        }
      };
      var handler$1 = {
        scheme: "https",
        domainHost: handler.domainHost,
        parse: handler.parse,
        serialize: handler.serialize
      };
      function isSecure(wsComponents) {
        return typeof wsComponents.secure === "boolean" ? wsComponents.secure : String(wsComponents.scheme).toLowerCase() === "wss";
      }
      var handler$2 = {
        scheme: "ws",
        domainHost: true,
        parse: function parse6(components, options) {
          var wsComponents = components;
          wsComponents.secure = isSecure(wsComponents);
          wsComponents.resourceName = (wsComponents.path || "/") + (wsComponents.query ? "?" + wsComponents.query : "");
          wsComponents.path = void 0;
          wsComponents.query = void 0;
          return wsComponents;
        },
        serialize: function serialize2(wsComponents, options) {
          if (wsComponents.port === (isSecure(wsComponents) ? 443 : 80) || wsComponents.port === "") {
            wsComponents.port = void 0;
          }
          if (typeof wsComponents.secure === "boolean") {
            wsComponents.scheme = wsComponents.secure ? "wss" : "ws";
            wsComponents.secure = void 0;
          }
          if (wsComponents.resourceName) {
            var _wsComponents$resourc = wsComponents.resourceName.split("?"), _wsComponents$resourc2 = slicedToArray(_wsComponents$resourc, 2), path = _wsComponents$resourc2[0], query = _wsComponents$resourc2[1];
            wsComponents.path = path && path !== "/" ? path : void 0;
            wsComponents.query = query;
            wsComponents.resourceName = void 0;
          }
          wsComponents.fragment = void 0;
          return wsComponents;
        }
      };
      var handler$3 = {
        scheme: "wss",
        domainHost: handler$2.domainHost,
        parse: handler$2.parse,
        serialize: handler$2.serialize
      };
      var O = {};
      var isIRI = true;
      var UNRESERVED$$ = "[A-Za-z0-9\\-\\.\\_\\~" + (isIRI ? "\\xA0-\\u200D\\u2010-\\u2029\\u202F-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFEF" : "") + "]";
      var HEXDIG$$ = "[0-9A-Fa-f]";
      var PCT_ENCODED$ = subexp(subexp("%[EFef]" + HEXDIG$$ + "%" + HEXDIG$$ + HEXDIG$$ + "%" + HEXDIG$$ + HEXDIG$$) + "|" + subexp("%[89A-Fa-f]" + HEXDIG$$ + "%" + HEXDIG$$ + HEXDIG$$) + "|" + subexp("%" + HEXDIG$$ + HEXDIG$$));
      var ATEXT$$ = "[A-Za-z0-9\\!\\$\\%\\'\\*\\+\\-\\^\\_\\`\\{\\|\\}\\~]";
      var QTEXT$$ = "[\\!\\$\\%\\'\\(\\)\\*\\+\\,\\-\\.0-9\\<\\>A-Z\\x5E-\\x7E]";
      var VCHAR$$ = merge(QTEXT$$, '[\\"\\\\]');
      var SOME_DELIMS$$ = "[\\!\\$\\'\\(\\)\\*\\+\\,\\;\\:\\@]";
      var UNRESERVED = new RegExp(UNRESERVED$$, "g");
      var PCT_ENCODED = new RegExp(PCT_ENCODED$, "g");
      var NOT_LOCAL_PART = new RegExp(merge("[^]", ATEXT$$, "[\\.]", '[\\"]', VCHAR$$), "g");
      var NOT_HFNAME = new RegExp(merge("[^]", UNRESERVED$$, SOME_DELIMS$$), "g");
      var NOT_HFVALUE = NOT_HFNAME;
      function decodeUnreserved(str) {
        var decStr = pctDecChars(str);
        return !decStr.match(UNRESERVED) ? str : decStr;
      }
      var handler$4 = {
        scheme: "mailto",
        parse: function parse$$1(components, options) {
          var mailtoComponents = components;
          var to = mailtoComponents.to = mailtoComponents.path ? mailtoComponents.path.split(",") : [];
          mailtoComponents.path = void 0;
          if (mailtoComponents.query) {
            var unknownHeaders = false;
            var headers = {};
            var hfields = mailtoComponents.query.split("&");
            for (var x = 0, xl = hfields.length; x < xl; ++x) {
              var hfield = hfields[x].split("=");
              switch (hfield[0]) {
                case "to":
                  var toAddrs = hfield[1].split(",");
                  for (var _x = 0, _xl = toAddrs.length; _x < _xl; ++_x) {
                    to.push(toAddrs[_x]);
                  }
                  break;
                case "subject":
                  mailtoComponents.subject = unescapeComponent(hfield[1], options);
                  break;
                case "body":
                  mailtoComponents.body = unescapeComponent(hfield[1], options);
                  break;
                default:
                  unknownHeaders = true;
                  headers[unescapeComponent(hfield[0], options)] = unescapeComponent(hfield[1], options);
                  break;
              }
            }
            if (unknownHeaders) mailtoComponents.headers = headers;
          }
          mailtoComponents.query = void 0;
          for (var _x2 = 0, _xl2 = to.length; _x2 < _xl2; ++_x2) {
            var addr = to[_x2].split("@");
            addr[0] = unescapeComponent(addr[0]);
            if (!options.unicodeSupport) {
              try {
                addr[1] = punycode.toASCII(unescapeComponent(addr[1], options).toLowerCase());
              } catch (e) {
                mailtoComponents.error = mailtoComponents.error || "Email address's domain name can not be converted to ASCII via punycode: " + e;
              }
            } else {
              addr[1] = unescapeComponent(addr[1], options).toLowerCase();
            }
            to[_x2] = addr.join("@");
          }
          return mailtoComponents;
        },
        serialize: function serialize$$1(mailtoComponents, options) {
          var components = mailtoComponents;
          var to = toArray(mailtoComponents.to);
          if (to) {
            for (var x = 0, xl = to.length; x < xl; ++x) {
              var toAddr = String(to[x]);
              var atIdx = toAddr.lastIndexOf("@");
              var localPart = toAddr.slice(0, atIdx).replace(PCT_ENCODED, decodeUnreserved).replace(PCT_ENCODED, toUpperCase).replace(NOT_LOCAL_PART, pctEncChar);
              var domain = toAddr.slice(atIdx + 1);
              try {
                domain = !options.iri ? punycode.toASCII(unescapeComponent(domain, options).toLowerCase()) : punycode.toUnicode(domain);
              } catch (e) {
                components.error = components.error || "Email address's domain name can not be converted to " + (!options.iri ? "ASCII" : "Unicode") + " via punycode: " + e;
              }
              to[x] = localPart + "@" + domain;
            }
            components.path = to.join(",");
          }
          var headers = mailtoComponents.headers = mailtoComponents.headers || {};
          if (mailtoComponents.subject) headers["subject"] = mailtoComponents.subject;
          if (mailtoComponents.body) headers["body"] = mailtoComponents.body;
          var fields = [];
          for (var name in headers) {
            if (headers[name] !== O[name]) {
              fields.push(name.replace(PCT_ENCODED, decodeUnreserved).replace(PCT_ENCODED, toUpperCase).replace(NOT_HFNAME, pctEncChar) + "=" + headers[name].replace(PCT_ENCODED, decodeUnreserved).replace(PCT_ENCODED, toUpperCase).replace(NOT_HFVALUE, pctEncChar));
            }
          }
          if (fields.length) {
            components.query = fields.join("&");
          }
          return components;
        }
      };
      var URN_PARSE = /^([^\:]+)\:(.*)/;
      var handler$5 = {
        scheme: "urn",
        parse: function parse$$1(components, options) {
          var matches = components.path && components.path.match(URN_PARSE);
          var urnComponents = components;
          if (matches) {
            var scheme = options.scheme || urnComponents.scheme || "urn";
            var nid = matches[1].toLowerCase();
            var nss = matches[2];
            var urnScheme = scheme + ":" + (options.nid || nid);
            var schemeHandler = SCHEMES[urnScheme];
            urnComponents.nid = nid;
            urnComponents.nss = nss;
            urnComponents.path = void 0;
            if (schemeHandler) {
              urnComponents = schemeHandler.parse(urnComponents, options);
            }
          } else {
            urnComponents.error = urnComponents.error || "URN can not be parsed.";
          }
          return urnComponents;
        },
        serialize: function serialize$$1(urnComponents, options) {
          var scheme = options.scheme || urnComponents.scheme || "urn";
          var nid = urnComponents.nid;
          var urnScheme = scheme + ":" + (options.nid || nid);
          var schemeHandler = SCHEMES[urnScheme];
          if (schemeHandler) {
            urnComponents = schemeHandler.serialize(urnComponents, options);
          }
          var uriComponents = urnComponents;
          var nss = urnComponents.nss;
          uriComponents.path = (nid || options.nid) + ":" + nss;
          return uriComponents;
        }
      };
      var UUID = /^[0-9A-Fa-f]{8}(?:\-[0-9A-Fa-f]{4}){3}\-[0-9A-Fa-f]{12}$/;
      var handler$6 = {
        scheme: "urn:uuid",
        parse: function parse6(urnComponents, options) {
          var uuidComponents = urnComponents;
          uuidComponents.uuid = uuidComponents.nss;
          uuidComponents.nss = void 0;
          if (!options.tolerant && (!uuidComponents.uuid || !uuidComponents.uuid.match(UUID))) {
            uuidComponents.error = uuidComponents.error || "UUID is not valid.";
          }
          return uuidComponents;
        },
        serialize: function serialize2(uuidComponents, options) {
          var urnComponents = uuidComponents;
          urnComponents.nss = (uuidComponents.uuid || "").toLowerCase();
          return urnComponents;
        }
      };
      SCHEMES[handler.scheme] = handler;
      SCHEMES[handler$1.scheme] = handler$1;
      SCHEMES[handler$2.scheme] = handler$2;
      SCHEMES[handler$3.scheme] = handler$3;
      SCHEMES[handler$4.scheme] = handler$4;
      SCHEMES[handler$5.scheme] = handler$5;
      SCHEMES[handler$6.scheme] = handler$6;
      exports2.SCHEMES = SCHEMES;
      exports2.pctEncChar = pctEncChar;
      exports2.pctDecChars = pctDecChars;
      exports2.parse = parse5;
      exports2.removeDotSegments = removeDotSegments;
      exports2.serialize = serialize;
      exports2.resolveComponents = resolveComponents;
      exports2.resolve = resolve2;
      exports2.normalize = normalize2;
      exports2.equal = equal2;
      exports2.escapeComponent = escapeComponent;
      exports2.unescapeComponent = unescapeComponent;
      Object.defineProperty(exports2, "__esModule", { value: true });
    }));
  }
});

// src/core/worker.ts
init_define_SEI_BUNDLED_ENGINE_VERSIONS();
import { parentPort, workerData } from "node:worker_threads";

// src/default-registry.ts
init_define_SEI_BUNDLED_ENGINE_VERSIONS();

// src/adapters/cidr.ts
init_define_SEI_BUNDLED_ENGINE_VERSIONS();
var import_ipaddr = __toESM(require_ipaddr(), 1);

// src/core/errors.ts
init_define_SEI_BUNDLED_ENGINE_VERSIONS();
var SeiError = class extends Error {
  diagnostic;
  constructor(code, message, options = {}) {
    super(message);
    this.name = "SeiError";
    this.diagnostic = {
      code,
      severity: "error",
      message,
      ...options
    };
  }
};
function asDiagnostic(error) {
  if (error instanceof SeiError) {
    return error.diagnostic;
  }
  if (typeof error === "object" && error !== null && "diagnostic" in error && typeof error.diagnostic === "object" && error.diagnostic !== null && "code" in error.diagnostic && typeof error.diagnostic.code === "string" && "severity" in error.diagnostic && error.diagnostic.severity === "error" && "message" in error.diagnostic && typeof error.diagnostic.message === "string") {
    return error.diagnostic;
  }
  return {
    code: "E_RUNTIME",
    severity: "error",
    message: error instanceof Error ? error.message : "Unexpected interpreter failure."
  };
}

// src/core/provenance.ts
init_define_SEI_BUNDLED_ENGINE_VERSIONS();
import { readFileSync } from "node:fs";
import { dirname, join, parse } from "node:path";
import { createRequire } from "node:module";
var require2 = createRequire(import.meta.url);
var versionCache = /* @__PURE__ */ new Map();
var bundledEngineVersions = typeof define_SEI_BUNDLED_ENGINE_VERSIONS_default === "undefined" ? void 0 : define_SEI_BUNDLED_ENGINE_VERSIONS_default;
function packageVersion(packageName) {
  const cached = versionCache.get(packageName);
  if (cached !== void 0) {
    return cached;
  }
  const bundled = bundledEngineVersions?.[packageName];
  if (bundled !== void 0) {
    versionCache.set(packageName, bundled);
    return bundled;
  }
  try {
    let directory = dirname(require2.resolve(packageName));
    const root = parse(directory).root;
    while (directory !== root) {
      try {
        const manifest = JSON.parse(
          readFileSync(join(directory, "package.json"), "utf8")
        );
        if (manifest.name === packageName && typeof manifest.version === "string") {
          versionCache.set(packageName, manifest.version);
          return manifest.version;
        }
      } catch {
      }
      directory = dirname(directory);
    }
  } catch {
  }
  versionCache.set(packageName, "unknown");
  return "unknown";
}

// src/adapters/cidr.ts
function isStrictIpv4(value) {
  const parts = value.split(".");
  return parts.length === 4 && parts.every(
    (part) => /^(?:0|[1-9]\d{0,2})$/.test(part) && Number.parseInt(part, 10) <= 255
  );
}
function parseStrictAddress(value, errorCode = "E_CIDR_PARSE") {
  try {
    if (value.includes(":")) {
      if (value.includes("%") || !import_ipaddr.default.IPv6.isValid(value)) {
        throw new Error("Invalid strict IPv6 address.");
      }
      const embeddedIpv4 = value.match(/(?:^|:)([^:]+\.[^:]+)$/)?.[1];
      if (embeddedIpv4 !== void 0 && !isStrictIpv4(embeddedIpv4)) {
        throw new Error("Embedded IPv4 must use four-part decimal notation.");
      }
      return import_ipaddr.default.IPv6.parse(value);
    }
    if (!isStrictIpv4(value)) {
      throw new Error("IPv4 must use four decimal octets without leading zeros.");
    }
    return import_ipaddr.default.IPv4.parse(value);
  } catch (error) {
    throw new SeiError(
      errorCode,
      error instanceof Error ? error.message : "Invalid strict IP address."
    );
  }
}
function parseStrictCidr(value, errorCode = "E_CIDR_PARSE") {
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
function addressString(address) {
  return address.kind() === "ipv6" ? address.toRFC5952String() : address.toString();
}
function networkParts(address, prefix) {
  const bytes = address.toByteArray();
  const maskBytes = bytes.map((_, index) => {
    const remaining = prefix - index * 8;
    if (remaining >= 8) return 255;
    if (remaining <= 0) return 0;
    return 255 << 8 - remaining & 255;
  });
  const networkBytes = bytes.map((byte, index) => byte & (maskBytes[index] ?? 0));
  const lastBytes = networkBytes.map((byte, index) => byte | 255 ^ (maskBytes[index] ?? 0));
  return {
    network: import_ipaddr.default.fromByteArray(networkBytes),
    last: import_ipaddr.default.fromByteArray(lastBytes),
    mask: import_ipaddr.default.fromByteArray(maskBytes)
  };
}
function parseCidr(value, errorCode = "E_CIDR_PARSE") {
  const { address, prefix, bitLength } = parseStrictCidr(value, errorCode);
  const { network } = networkParts(address, prefix);
  return { network, prefix, bitLength };
}
var CidrAdapter = class {
  descriptor = {
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
          address_count: { type: "string", pattern: "^[1-9]\\d*$" }
        },
        required: [
          "family",
          "network",
          "prefix",
          "netmask",
          "first_address",
          "last_address",
          "address_count"
        ],
        additionalProperties: false
      }
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
              max_length: 45
            }
          },
          required: ["address"],
          additional_properties: false
        },
        result_schema: {
          type: "object",
          properties: { address: { type: "string" }, contains: { type: "boolean" } },
          required: ["address", "contains"],
          additionalProperties: false
        }
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
              max_length: 49
            }
          },
          required: ["cidr"],
          additional_properties: false
        },
        result_schema: {
          type: "object",
          properties: { cidr: { type: "string" }, overlaps: { type: "boolean" } },
          required: ["cidr", "overlaps"],
          additionalProperties: false
        }
      }
    ],
    provenance: {
      spec: "RFC4632/RFC4291",
      engine: "ipaddr.js",
      engine_version: packageVersion("ipaddr.js"),
      compatibility_mode: "strict-cidr"
    }
  };
  interpret(input) {
    try {
      const { address, prefix, bitLength } = parseStrictCidr(input.expression);
      const { network, last, mask } = networkParts(address, prefix);
      const normalized = `${addressString(network)}/${prefix}`;
      const diagnostics = [];
      if (addressString(address) !== addressString(network)) {
        diagnostics.push({
          code: "W_CIDR_HOST_BITS_CLEARED",
          severity: "warning",
          message: `Host bits were cleared in canonical network '${normalized}'.`
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
          address_count: (1n << BigInt(bitLength - prefix)).toString()
        },
        diagnostics,
        state: { network, prefix, bitLength }
      };
    } catch (error) {
      if (error instanceof SeiError) {
        throw new SeiError(error.diagnostic.code, error.message, {
          span: { start: 0, end: input.expression.length }
        });
      }
      throw new SeiError(
        "E_CIDR_PARSE",
        error instanceof Error ? error.message : "Invalid CIDR expression.",
        { span: { start: 0, end: input.expression.length } }
      );
    }
  }
  query(interpretation, query, _input) {
    const state = interpretation.state;
    const argumentsValue = query.arguments ?? {};
    if (query.name === "contains") {
      const candidate = argumentsValue.address;
      if (typeof candidate !== "string") {
        throw new SeiError(
          "E_QUERY_INVALID",
          "CIDR query 'contains' requires arguments.address as an IP address."
        );
      }
      try {
        const address = parseStrictAddress(candidate, "E_QUERY_INVALID");
        return {
          address: candidate,
          contains: address.kind() === state.network.kind() && address.match([state.network, state.prefix])
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
          "CIDR query 'overlaps' requires arguments.cidr as a CIDR string."
        );
      }
      const other = parseCidr(candidate, "E_QUERY_INVALID");
      const overlaps = other.network.kind() === state.network.kind() && (state.network.match([other.network, other.prefix]) || other.network.match([state.network, state.prefix]));
      return { cidr: candidate, overlaps };
    }
    throw new SeiError("E_QUERY_UNSUPPORTED", `CIDR query '${query.name}' is not supported.`, {
      expected: { queries: ["contains", "overlaps"] }
    });
  }
  detect(expression) {
    if (!/^[^/\s]+\/\d{1,3}$/.test(expression)) return null;
    try {
      parseStrictCidr(expression);
      return {
        kind: "cidr",
        dialect: "cidr",
        confidence: 0.99,
        reason: "The input is a valid IPv4 or IPv6 address with a prefix length.",
        supported: true
      };
    } catch {
      return null;
    }
  }
};

// src/adapters/content-type.ts
init_define_SEI_BUNDLED_ENGINE_VERSIONS();
var import_content_type = __toESM(require_dist(), 1);
function assertUniqueParameters(expression) {
  const segments = [];
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
  const seen = /* @__PURE__ */ new Set();
  for (const segment of segments.slice(1)) {
    const equals = segment.indexOf("=");
    if (equals < 0) continue;
    const name = segment.slice(0, equals).trim().toLowerCase();
    if (seen.has(name)) {
      throw new SeiError(
        "E_CONTENT_TYPE_DUPLICATE_PARAMETER",
        `Content-Type parameter '${name}' appears more than once; normalization would discard information.`
      );
    }
    seen.add(name);
  }
}
var ContentTypeAdapter = class {
  descriptor = {
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
          parameters: { type: "object", additionalProperties: { type: "string" } }
        },
        required: ["media_type", "type", "subtype", "parameters"],
        additionalProperties: false
      }
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
              pattern: "^[!#$%&'*+.^_`|~0-9A-Za-z-]+$"
            }
          },
          required: ["name"],
          additional_properties: false
        },
        result_schema: {
          type: "object",
          properties: {
            name: { type: "string" },
            present: { type: "boolean" },
            value: { anyOf: [{ type: "string" }, { type: "null" }] }
          },
          required: ["name", "present", "value"],
          additionalProperties: false
        }
      }
    ],
    provenance: {
      spec: "RFC9110-media-type",
      engine: "content-type",
      engine_version: packageVersion("content-type"),
      compatibility_mode: "strict-header-value"
    }
  };
  interpret(input) {
    assertUniqueParameters(input.expression);
    let parsed;
    try {
      parsed = (0, import_content_type.parse)(input.expression);
    } catch (error) {
      throw new SeiError(
        "E_CONTENT_TYPE_PARSE",
        error instanceof Error ? error.message : "Invalid Content-Type value.",
        { span: { start: 0, end: input.expression.length } }
      );
    }
    if (!/^[!#$%&'*+.^_`|~0-9A-Za-z-]+\/[!#$%&'*+.^_`|~0-9A-Za-z-]+$/.test(parsed.type)) {
      throw new SeiError(
        "E_CONTENT_TYPE_PARSE",
        "Content-Type must contain a valid type/subtype media type.",
        { span: { start: 0, end: input.expression.length } }
      );
    }
    const mediaType = parsed.type.toLowerCase();
    const parameters = Object.fromEntries(
      Object.entries(parsed.parameters).map(([name, value]) => [name.toLowerCase(), value]).sort(([left], [right]) => left < right ? -1 : left > right ? 1 : 0)
    );
    if (Object.keys(parameters).length > input.limits.max_output_items) {
      throw new SeiError(
        "E_RESOURCE_LIMIT",
        `Content-Type parameter output exceeds max_output_items=${input.limits.max_output_items}.`
      );
    }
    const slash = mediaType.indexOf("/");
    const subtype = mediaType.slice(slash + 1);
    const suffixIndex = subtype.lastIndexOf("+");
    let normalized;
    try {
      normalized = (0, import_content_type.format)({ type: mediaType, parameters });
    } catch (error) {
      throw new SeiError(
        "E_CONTENT_TYPE_PARSE",
        error instanceof Error ? error.message : "Invalid Content-Type value.",
        { span: { start: 0, end: input.expression.length } }
      );
    }
    return {
      normalized,
      value: {
        media_type: mediaType,
        type: mediaType.slice(0, slash),
        subtype,
        ...suffixIndex < 0 ? {} : { suffix: subtype.slice(suffixIndex + 1) },
        parameters
      }
    };
  }
  query(interpretation, query, _input) {
    if (query.name !== "parameter") {
      throw new SeiError(
        "E_QUERY_UNSUPPORTED",
        `Content-Type query '${query.name}' is not supported.`,
        { expected: { queries: ["parameter"] } }
      );
    }
    const name = query.arguments?.name;
    if (typeof name !== "string") {
      throw new SeiError(
        "E_QUERY_INVALID",
        "Content-Type query 'parameter' requires arguments.name as a string."
      );
    }
    const value = interpretation.value;
    return {
      name: name.toLowerCase(),
      present: Object.hasOwn(value.parameters, name.toLowerCase()),
      value: value.parameters[name.toLowerCase()] ?? null
    };
  }
  detect(expression) {
    try {
      assertUniqueParameters(expression);
      const parsed = (0, import_content_type.parse)(expression);
      if (!/^[!#$%&'*+.^_`|~0-9A-Za-z-]+\/[!#$%&'*+.^_`|~0-9A-Za-z-]+$/.test(parsed.type)) {
        return null;
      }
      return {
        kind: "content_type",
        dialect: "http",
        confidence: 0.96,
        reason: "The input is a valid media type with optional Content-Type parameters.",
        supported: true
      };
    } catch {
      return null;
    }
  }
};

// src/adapters/cron.ts
init_define_SEI_BUNDLED_ENGINE_VERSIONS();
var import_cron_parser = __toESM(require_dist2(), 1);
var CRON_FIELD_RESULT_SCHEMA = {
  oneOf: [
    {
      type: "object",
      properties: { type: { const: "any" } },
      required: ["type"],
      additionalProperties: false
    },
    {
      type: "object",
      properties: {
        type: { const: "set" },
        values: {
          type: "array",
          items: { anyOf: [{ type: "integer" }, { type: "string" }] }
        }
      },
      required: ["type", "values"],
      additionalProperties: false
    },
    {
      type: "object",
      properties: {
        type: { const: "range" },
        from: { type: "integer" },
        to: { type: "integer" }
      },
      required: ["type", "from", "to"],
      additionalProperties: false
    }
  ]
};
var CRON_OCCURRENCE_RESULT_SCHEMA = {
  type: "object",
  properties: { instant: { type: "string" }, timezone: { type: "string" } },
  required: ["instant", "timezone"],
  additionalProperties: false
};
var STRICT_RFC3339 = /^(?<year>\d{4})-(?<month>\d{2})-(?<day>\d{2})T(?<hour>\d{2}):(?<minute>\d{2}):(?<second>\d{2})(?:\.(?<fraction>\d{1,3}))?(?<offset>Z|[+-]\d{2}:\d{2})$/;
var STRICT_RFC3339_SOURCE = String.raw`^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?(?:Z|[+-]\d{2}:\d{2})$`;
function isLeapYear(year) {
  return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
}
function parseReferenceTime(value, location = "context.reference_time") {
  const match = STRICT_RFC3339.exec(value);
  if (match?.groups === void 0) {
    throw new SeiError(
      "E_TIME_INVALID",
      `'${location}' must be an RFC 3339 timestamp with seconds and an explicit Z or numeric offset.`
    );
  }
  const year = Number.parseInt(match.groups.year ?? "", 10);
  const month = Number.parseInt(match.groups.month ?? "", 10);
  const day = Number.parseInt(match.groups.day ?? "", 10);
  const hour = Number.parseInt(match.groups.hour ?? "", 10);
  const minute = Number.parseInt(match.groups.minute ?? "", 10);
  const second = Number.parseInt(match.groups.second ?? "", 10);
  const offset = match.groups.offset ?? "";
  const daysInMonth = [31, isLeapYear(year) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  const offsetHours = offset === "Z" ? 0 : Number.parseInt(offset.slice(1, 3), 10);
  const offsetMinutes = offset === "Z" ? 0 : Number.parseInt(offset.slice(4, 6), 10);
  if (month < 1 || month > 12 || day < 1 || day > (daysInMonth[month - 1] ?? 0) || hour > 23 || minute > 59 || second > 59 || offsetHours > 23 || offsetMinutes > 59) {
    throw new SeiError("E_TIME_INVALID", `'${location}' contains an invalid calendar or time value.`);
  }
  const timestamp = Date.parse(value);
  if (!Number.isFinite(timestamp)) {
    throw new SeiError("E_TIME_INVALID", `'${location}' is outside the supported timestamp range.`);
  }
  return new Date(timestamp).toISOString();
}
function timezoneFor(input) {
  return input.context.timezone ?? "UTC";
}
var GITHUB_MONTH_NAMES = /* @__PURE__ */ new Set([
  "JAN",
  "FEB",
  "MAR",
  "APR",
  "MAY",
  "JUN",
  "JUL",
  "AUG",
  "SEP",
  "OCT",
  "NOV",
  "DEC"
]);
var GITHUB_WEEKDAY_NAMES = /* @__PURE__ */ new Set(["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"]);
function assertCronEndpoint(endpoint, fieldIndex, minimum, maximum, code, dialectLabel) {
  if (/^\d+$/.test(endpoint)) {
    const numeric = Number.parseInt(endpoint, 10);
    if (numeric < minimum || numeric > maximum) {
      throw new SeiError(
        code,
        `${dialectLabel} cron field ${fieldIndex + 1} requires values from ${minimum} through ${maximum}.`
      );
    }
    return;
  }
  const names = fieldIndex === 3 ? GITHUB_MONTH_NAMES : fieldIndex === 4 ? GITHUB_WEEKDAY_NAMES : void 0;
  if (names === void 0 || !names.has(endpoint.toUpperCase())) {
    throw new SeiError(
      code,
      `${dialectLabel} cron field ${fieldIndex + 1} contains an unsupported value '${endpoint}'.`
    );
  }
}
function assertFiveFieldCronSyntax(fields, options) {
  const ranges = [
    [0, 59],
    [0, 23],
    [1, 31],
    [1, 12],
    [0, options.dayOfWeekMaximum]
  ];
  fields.forEach((field, fieldIndex) => {
    if (!/^[0-9A-Za-z*,\/-]+$/.test(field)) {
      throw new SeiError(
        options.code,
        `${options.dialectLabel} cron supports only '*', ',', '-', and '/' operators.`
      );
    }
    for (const item of field.split(",")) {
      const stepParts = item.split("/");
      if (stepParts.length > 2 || stepParts[0] === "") {
        throw new SeiError(options.code, `Invalid ${options.dialectLabel} cron item '${item}'.`);
      }
      const [base = "", step] = stepParts;
      if (step !== void 0 && !/^[1-9]\d*$/.test(step)) {
        throw new SeiError(
          options.code,
          `${options.dialectLabel} cron step '${step}' must be a positive decimal integer.`
        );
      }
      if (base === "*") continue;
      const endpoints = base.split("-");
      if (endpoints.length > 2 || endpoints.some((endpoint) => endpoint.length === 0)) {
        throw new SeiError(options.code, `Invalid ${options.dialectLabel} cron range '${base}'.`);
      }
      const [minimum, maximum] = ranges[fieldIndex] ?? [0, 0];
      endpoints.forEach((endpoint) => assertCronEndpoint(
        endpoint,
        fieldIndex,
        minimum,
        maximum,
        options.code,
        options.dialectLabel
      ));
    }
  });
}
function assertGithubCronSyntax(fields) {
  assertFiveFieldCronSyntax(fields, {
    code: "E_CRON_GITHUB_SYNTAX",
    dialectLabel: "GitHub Actions",
    dayOfWeekMaximum: 6
  });
}
function assertUnixCronSyntax(fields) {
  assertFiveFieldCronSyntax(fields, {
    code: "E_CRON_UNIX_SYNTAX",
    dialectLabel: "Unix five-field",
    dayOfWeekMaximum: 7
  });
}
function fieldContains(field, value) {
  return field.wildcard || field.values.includes(value);
}
function hasConsecutiveMatchingDates(fields) {
  const matchesDate = (date) => {
    if (!fieldContains(fields.month, date.getUTCMonth() + 1)) return false;
    const dayOfMonth = fieldContains(fields.dayOfMonth, date.getUTCDate());
    const dayOfWeek = fieldContains(fields.dayOfWeek, date.getUTCDay());
    if (fields.dayOfMonth.wildcard) return dayOfWeek;
    if (fields.dayOfWeek.wildcard) return dayOfMonth;
    return dayOfMonth || dayOfWeek;
  };
  const end = Date.UTC(2400, 0, 1);
  for (let timestamp = Date.UTC(2e3, 0, 1); timestamp < end; timestamp += 864e5) {
    if (matchesDate(new Date(timestamp)) && matchesDate(new Date(timestamp + 864e5))) {
      return true;
    }
  }
  return false;
}
function enforceGithubMinimumInterval(expression) {
  const serialized = expression.fields.serialize();
  const minuteValues = serialized.minute.values.filter(
    (value) => typeof value === "number"
  );
  const hourValues = serialized.hour.values.filter(
    (value) => typeof value === "number"
  );
  const times = hourValues.flatMap((hour) => minuteValues.map((minute) => hour * 60 + minute)).sort((left, right) => left - right);
  for (let index = 1; index < times.length; index += 1) {
    if ((times[index] ?? 0) - (times[index - 1] ?? 0) < 5) {
      throw new SeiError(
        "E_CRON_GITHUB_MIN_INTERVAL",
        "GitHub Actions schedules cannot request runs less than five minutes apart."
      );
    }
  }
  const crossMidnightGap = times.length === 0 ? Number.POSITIVE_INFINITY : 24 * 60 - (times.at(-1) ?? 0) + (times[0] ?? 0);
  if (crossMidnightGap < 5 && hasConsecutiveMatchingDates(serialized)) {
    throw new SeiError(
      "E_CRON_GITHUB_MIN_INTERVAL",
      "GitHub Actions schedules cannot request runs less than five minutes apart across days."
    );
  }
}
function enforceGithubTimezoneQueryBoundary(input) {
  if (input.dialect === "github-actions" && timezoneFor(input) !== "UTC") {
    throw new SeiError(
      "E_QUERY_UNSUPPORTED",
      "GitHub Actions timezone-aware DST adjustment is not reproduced by the current engine; occurrence and match queries are limited to UTC for this dialect.",
      { expected: { timezone: "UTC" } }
    );
  }
}
function requireQueryArgs(query) {
  return query.arguments ?? {};
}
function describeField(label, wildcard, values) {
  return wildcard ? `${label}=any` : `${label}=${values.join(",")}`;
}
function fieldValue(field, maxOutputItems) {
  if (field.wildcard) return { type: "any" };
  if (field.values.length > 1 && field.values.every((value) => typeof value === "number") && field.values.every((value, index, values) => index === 0 || value === values[index - 1] + 1)) {
    return {
      type: "range",
      from: field.values[0],
      to: field.values.at(-1)
    };
  }
  if (field.values.length > maxOutputItems) {
    throw new SeiError(
      "E_RESOURCE_LIMIT",
      `Cron field output contains ${field.values.length} values, exceeding max_output_items=${maxOutputItems}.`
    );
  }
  return { type: "set", values: field.values };
}
var CronAdapter = class {
  descriptor = {
    kind: "cron",
    title: "Cron schedule",
    summary: "Interpret five-field Unix and GitHub Actions cron schedules.",
    dialects: ["unix-5", "github-actions"],
    capabilities: [
      "interpret",
      "validate",
      "normalize",
      "query.next_occurrences",
      "query.matches",
      "derive.human_description",
      "derive.next_occurrences"
    ],
    context_contract: {
      type: "object",
      properties: {
        timezone: {
          type: "string",
          description: "IANA timezone name; defaults to UTC.",
          min_length: 1,
          max_length: 255
        },
        reference_time: {
          type: "string",
          description: "RFC 3339 timestamp with seconds and an explicit Z or numeric offset.",
          min_length: 20,
          max_length: 35,
          pattern: STRICT_RFC3339_SOURCE,
          diagnostic_code: "E_TIME_INVALID"
        }
      },
      required: [],
      additional_properties: false
    },
    interpretation_contract: {
      value_schema: {
        type: "object",
        properties: {
          minute: CRON_FIELD_RESULT_SCHEMA,
          hour: CRON_FIELD_RESULT_SCHEMA,
          day_of_month: CRON_FIELD_RESULT_SCHEMA,
          month: CRON_FIELD_RESULT_SCHEMA,
          day_of_week: CRON_FIELD_RESULT_SCHEMA
        },
        required: ["minute", "hour", "day_of_month", "month", "day_of_week"],
        additionalProperties: false
      },
      semantics_schema: {
        type: "object",
        properties: {
          timezone: { type: "string" },
          day_of_month_day_of_week_relation: { const: "or" }
        },
        required: ["timezone", "day_of_month_day_of_week_relation"],
        additionalProperties: false
      }
    },
    query_contracts: [
      {
        name: "next_occurrences",
        summary: "Return the next bounded schedule instants after context.reference_time.",
        required_context: ["reference_time"],
        arguments: {
          type: "object",
          properties: {
            count: {
              type: "integer",
              description: "Number of occurrences to return; also constrained by limits.max_output_items.",
              minimum: 1,
              maximum: 100
            }
          },
          required: [],
          additional_properties: false
        },
        result_schema: {
          type: "array",
          items: CRON_OCCURRENCE_RESULT_SCHEMA,
          maxItems: 100
        }
      },
      {
        name: "matches",
        summary: "Test whether one explicit RFC 3339 instant is selected by the schedule.",
        arguments: {
          type: "object",
          properties: {
            candidate: {
              type: "string",
              description: "RFC 3339 timestamp with an explicit Z or numeric offset.",
              min_length: 20,
              max_length: 35
            }
          },
          required: ["candidate"],
          additional_properties: false
        },
        result_schema: {
          type: "object",
          properties: { matches: { type: "boolean" } },
          required: ["matches"],
          additionalProperties: false
        }
      }
    ],
    derive_contracts: [
      {
        name: "human_description",
        summary: "Compact deterministic field description.",
        result_schema: { type: "string" }
      },
      {
        name: "next_occurrences",
        summary: "The next five occurrences; requires context.reference_time.",
        required_context: ["reference_time"],
        result_schema: {
          type: "array",
          items: CRON_OCCURRENCE_RESULT_SCHEMA,
          maxItems: 5
        }
      }
    ],
    capability_constraints: {
      "github-actions": {
        "query.next_occurrences": { timezones: ["UTC"] },
        "query.matches": { timezones: ["UTC"] },
        "derive.next_occurrences": { timezones: ["UTC"] }
      }
    },
    provenance: {
      spec: "POSIX-cron-family",
      engine: "cron-parser",
      engine_version: packageVersion("cron-parser"),
      compatibility_mode: "explicit-five-field",
      runtime: "node",
      runtime_version: process.versions.node,
      timezone_engine: "Intl",
      timezone_data_version: process.versions.tz ?? "unreported",
      icu_version: process.versions.icu ?? "unreported"
    }
  };
  interpret(input) {
    const fields = input.expression.trim().split(/\s+/);
    if (fields.length !== 5) {
      throw new SeiError(
        "E_CRON_FIELD_COUNT",
        `${input.dialect} cron requires 5 fields; received ${fields.length}.`,
        {
          expected: { field_count: 5 },
          span: { start: 0, end: input.expression.length }
        }
      );
    }
    if (input.dialect === "github-actions") {
      assertGithubCronSyntax(fields);
    } else {
      assertUnixCronSyntax(fields);
    }
    const timezone = timezoneFor(input);
    const currentDate = input.context.reference_time === void 0 ? "1970-01-01T00:00:00.000Z" : parseReferenceTime(input.context.reference_time);
    let expression;
    try {
      expression = import_cron_parser.CronExpressionParser.parse(input.expression, {
        currentDate,
        tz: timezone
      });
    } catch (error) {
      throw new SeiError(
        "E_CRON_PARSE",
        error instanceof Error ? error.message : "Invalid cron expression.",
        { span: { start: 0, end: input.expression.length } }
      );
    }
    if (input.dialect === "github-actions") {
      enforceGithubMinimumInterval(expression);
    }
    const serialized = expression.fields.serialize();
    const normalized = expression.stringify(false);
    const diagnostics = [];
    if (!serialized.dayOfMonth.wildcard && !serialized.dayOfWeek.wildcard) {
      diagnostics.push({
        code: "W_CRON_DOM_DOW_OR",
        severity: "warning",
        message: "Both day-of-month and day-of-week are restricted; Unix cron matches when either field matches."
      });
    }
    if (input.dialect === "github-actions" && timezone !== "UTC") {
      diagnostics.push({
        code: "W_CRON_PLATFORM_QUERY_LIMITED",
        severity: "warning",
        message: "GitHub Actions timezone syntax is valid, but v0.1 occurrence and match queries for this dialect are limited to UTC."
      });
    }
    const derived = {};
    for (const name of input.derive) {
      if (name === "human_description") {
        derived.human_description = [
          describeField("minute", serialized.minute.wildcard, serialized.minute.values),
          describeField("hour", serialized.hour.wildcard, serialized.hour.values),
          describeField("day-of-month", serialized.dayOfMonth.wildcard, serialized.dayOfMonth.values),
          describeField("month", serialized.month.wildcard, serialized.month.values),
          describeField("day-of-week", serialized.dayOfWeek.wildcard, serialized.dayOfWeek.values),
          `timezone=${timezone}`
        ].join("; ");
      } else if (name === "next_occurrences") {
        derived.next_occurrences = this.nextOccurrences(expression, input);
      } else {
        throw new SeiError("E_DERIVE_UNSUPPORTED", `Cron does not support derive '${name}'.`, {
          expected: { derive: ["human_description", "next_occurrences"] }
        });
      }
    }
    return {
      normalized,
      value: {
        minute: fieldValue(serialized.minute, input.limits.max_output_items),
        hour: fieldValue(serialized.hour, input.limits.max_output_items),
        day_of_month: fieldValue(serialized.dayOfMonth, input.limits.max_output_items),
        month: fieldValue(serialized.month, input.limits.max_output_items),
        day_of_week: fieldValue(serialized.dayOfWeek, input.limits.max_output_items)
      },
      semantics: {
        timezone,
        day_of_month_day_of_week_relation: "or"
      },
      ...Object.keys(derived).length === 0 ? {} : { derived },
      diagnostics,
      state: { expression }
    };
  }
  query(interpretation, query, input) {
    const state = interpretation.state;
    if (query.name === "next_occurrences") {
      return this.nextOccurrences(state.expression, input, requireQueryArgs(query));
    }
    if (query.name === "matches") {
      enforceGithubTimezoneQueryBoundary(input);
      const candidate = requireQueryArgs(query).candidate;
      if (typeof candidate !== "string") {
        throw new SeiError(
          "E_QUERY_INVALID",
          "Cron query 'matches' requires arguments.candidate as an RFC 3339 timestamp."
        );
      }
      const instant = parseReferenceTime(candidate, "query.arguments.candidate");
      return { matches: state.expression.includesDate(new Date(instant)) };
    }
    throw new SeiError("E_QUERY_UNSUPPORTED", `Cron query '${query.name}' is not supported.`, {
      expected: { queries: ["next_occurrences", "matches"] }
    });
  }
  detect(expression) {
    const value = expression.trim();
    if (value.split(/\s+/).length !== 5) return null;
    try {
      assertUnixCronSyntax(value.split(/\s+/));
      import_cron_parser.CronExpressionParser.parse(value, {
        currentDate: "1970-01-01T00:00:00.000Z",
        tz: "UTC"
      });
      return {
        kind: "cron",
        confidence: 0.98,
        reason: "The input is a valid five-field cron expression; choose unix-5 or github-actions explicitly.",
        supported: true
      };
    } catch {
      return null;
    }
  }
  nextOccurrences(expression, input, argumentsValue = {}) {
    enforceGithubTimezoneQueryBoundary(input);
    if (input.context.reference_time === void 0) {
      throw new SeiError(
        "E_REFERENCE_TIME_REQUIRED",
        "Cron occurrence queries require explicit 'context.reference_time' for deterministic replay."
      );
    }
    const requestedCount = argumentsValue.count ?? 5;
    if (!Number.isSafeInteger(requestedCount) || requestedCount < 1) {
      throw new SeiError("E_QUERY_INVALID", "Cron occurrence count must be a positive integer.");
    }
    if (requestedCount > input.limits.max_output_items) {
      throw new SeiError(
        "E_RESOURCE_LIMIT",
        `Occurrence count ${requestedCount} exceeds max_output_items=${input.limits.max_output_items}.`
      );
    }
    expression.reset(new Date(parseReferenceTime(input.context.reference_time)));
    return expression.take(requestedCount).map((date) => ({
      instant: date.toISOString() ?? new Date(date.getTime()).toISOString(),
      timezone: timezoneFor(input)
    }));
  }
};

// src/adapters/iso-duration.ts
init_define_SEI_BUNDLED_ENGINE_VERSIONS();
var import_iso8601_duration = __toESM(require_lib(), 1);
var FULL_DURATION = /^P(?=\d|T\d)(?:(?<years>\d+)Y)?(?:(?<months>\d+)M)?(?:(?<weeks>\d+)W)?(?:(?<days>\d+)D)?(?:T(?=\d)(?:(?<hours>\d+(?:[.,]\d+)?)H)?(?:(?<minutes>\d+(?:[.,]\d+)?)M)?(?:(?<seconds>\d+(?:[.,]\d+)?)S)?)?$/;
var UNITS = [
  ["years", "Y", false],
  ["months", "M", false],
  ["weeks", "W", false],
  ["days", "D", false],
  ["hours", "H", true],
  ["minutes", "M", true],
  ["seconds", "S", true]
];
function canonicalDecimal(value) {
  if (value === void 0) return "0";
  const [integerPart = "0", fractionalPart] = value.replace(",", ".").split(".");
  const integer = integerPart.replace(/^0+(?=\d)/, "");
  const fractional = fractionalPart?.replace(/0+$/, "") ?? "";
  return fractional.length === 0 ? integer : `${integer}.${fractional}`;
}
function exactDuration(expression) {
  const match = FULL_DURATION.exec(expression);
  if (match === null) {
    throw new SeiError(
      "E_DURATION_PARSE",
      "Invalid or unsupported ISO 8601 duration syntax.",
      { span: { start: 0, end: expression.length } }
    );
  }
  const groups = match.groups ?? {};
  const fractionalIndices = UNITS.flatMap(([name], index) => {
    const value = groups[name];
    return value !== void 0 && /[.,]/.test(value) ? [index] : [];
  });
  if (fractionalIndices.length > 1 || fractionalIndices[0] !== void 0 && UNITS.slice(fractionalIndices[0] + 1).some(([name]) => groups[name] !== void 0)) {
    throw new SeiError(
      "E_DURATION_FRACTION_POSITION",
      "A decimal fraction is allowed only on the smallest unit present.",
      { span: { start: 0, end: expression.length } }
    );
  }
  return {
    duration: Object.fromEntries(
      UNITS.map(([name]) => [name, canonicalDecimal(groups[name])])
    ),
    present: new Set(
      UNITS.flatMap(([name]) => groups[name] === void 0 ? [] : [name])
    )
  };
}
function normalizeDuration(duration) {
  let date = "";
  let time = "";
  for (const [name, suffix, isTime] of UNITS) {
    const value = duration[name];
    if (value === "0") continue;
    if (isTime) time += `${value}${suffix}`;
    else date += `${value}${suffix}`;
  }
  if (date.length === 0 && time.length === 0) return "P0D";
  return `P${date}${time.length === 0 ? "" : `T${time}`}`;
}
var IsoDurationAdapter = class {
  descriptor = {
    kind: "iso_duration",
    title: "ISO 8601 duration",
    summary: "Interpret bounded ISO 8601 duration component expressions without assuming calendar length.",
    dialects: ["iso8601-1"],
    default_dialect: "iso8601-1",
    capabilities: ["interpret", "validate", "normalize"],
    interpretation_contract: {
      value_schema: {
        type: "object",
        properties: Object.fromEntries(
          UNITS.map(([name]) => [
            name,
            { type: "string", pattern: "^(?:0|[1-9]\\d*)(?:\\.\\d+)?$" }
          ])
        ),
        required: UNITS.map(([name]) => name),
        additionalProperties: false
      }
    },
    provenance: {
      spec: "ISO8601-1-duration",
      engine: "iso8601-duration",
      engine_version: packageVersion("iso8601-duration"),
      compatibility_mode: "strict-exact-lexical-subset"
    }
  };
  interpret(input) {
    const { duration, present } = exactDuration(input.expression);
    try {
      (0, import_iso8601_duration.parse)(input.expression);
    } catch (error) {
      throw new SeiError(
        "E_DURATION_PARSE",
        error instanceof Error ? error.message : "Invalid ISO 8601 duration.",
        { span: { start: 0, end: input.expression.length } }
      );
    }
    const hasWeek = present.has("weeks");
    const hasOther = [...present].some((name) => name !== "weeks");
    if (hasWeek && hasOther) {
      throw new SeiError(
        "E_DURATION_WEEK_MIXED",
        "Week-based durations cannot be mixed with other units in the iso8601-1 dialect."
      );
    }
    const diagnostics = [];
    if (duration.years !== "0" || duration.months !== "0") {
      diagnostics.push({
        code: "W_DURATION_CALENDAR_CONTEXT",
        severity: "warning",
        message: "Years and months are calendar-relative; no fixed seconds value is implied."
      });
    }
    return {
      normalized: normalizeDuration(duration),
      value: duration,
      diagnostics
    };
  }
  detect(expression) {
    if (!FULL_DURATION.test(expression)) return null;
    try {
      const { present } = exactDuration(expression);
      if (present.has("weeks") && [...present].some((name) => name !== "weeks")) {
        return null;
      }
      (0, import_iso8601_duration.parse)(expression);
      return {
        kind: "iso_duration",
        dialect: "iso8601-1",
        confidence: 0.97,
        reason: "The input uses ISO 8601 duration designators beginning with P.",
        supported: true
      };
    } catch {
      return null;
    }
  }
};

// src/adapters/rrule.ts
init_define_SEI_BUNDLED_ENGINE_VERSIONS();
var rruleNamespace = __toESM(require_rrule(), 1);

// src/core/request.ts
init_define_SEI_BUNDLED_ENGINE_VERSIONS();

// src/contracts.ts
init_define_SEI_BUNDLED_ENGINE_VERSIONS();
var OPERATIONS = [
  "interpret",
  "validate",
  "normalize",
  "query",
  "convert",
  "detect"
];

// src/core/request.ts
var HARD_LIMITS = {
  max_expression_length: 8192,
  max_output_items: 100,
  max_request_bytes: 32768,
  max_response_bytes: 65536,
  max_nesting_depth: 12,
  max_collection_entries: 256,
  max_string_length: 8192,
  max_execution_ms: 1e3
};
var MINIMUM_LIMITS = {
  max_expression_length: 1,
  max_output_items: 1,
  max_request_bytes: 1024,
  max_response_bytes: 1024,
  max_nesting_depth: 2,
  max_collection_entries: 16,
  max_string_length: 64,
  max_execution_ms: 10
};
var LIMIT_KEYS = [
  "max_expression_length",
  "max_output_items",
  "max_request_bytes",
  "max_response_bytes",
  "max_nesting_depth",
  "max_collection_entries",
  "max_string_length",
  "max_execution_ms"
];
var RESPONSE_STRUCTURAL_LIMITS = {
  ...HARD_LIMITS,
  max_nesting_depth: 24,
  max_collection_entries: 4096,
  max_string_length: HARD_LIMITS.max_response_bytes
};
function isRecord(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
function visitJsonBoundary(value, limits, seen, state, depth, subject) {
  if (depth > limits.max_nesting_depth) {
    throw new SeiError(
      "E_REQUEST_LIMIT",
      `${subject} nesting exceeds max_nesting_depth=${limits.max_nesting_depth}.`
    );
  }
  if (typeof value === "string") {
    if (value.length > limits.max_string_length) {
      throw new SeiError(
        "E_REQUEST_LIMIT",
        `A ${subject.toLowerCase()} string exceeds max_string_length=${limits.max_string_length}.`
      );
    }
    return;
  }
  if (typeof value === "number") {
    if (!Number.isFinite(value)) {
      throw new SeiError("E_REQUEST_INVALID", `${subject} numbers must be finite JSON numbers.`);
    }
    return;
  }
  if (value === null || typeof value === "boolean") return;
  if (typeof value !== "object") {
    throw new SeiError("E_REQUEST_INVALID", `${subject} must contain JSON-compatible values only.`);
  }
  if (seen.has(value)) {
    throw new SeiError("E_REQUEST_INVALID", `${subject} must not contain cyclic references.`);
  }
  seen.add(value);
  if (Array.isArray(value)) {
    state.entries += value.length;
    if (state.entries > limits.max_collection_entries) {
      throw new SeiError(
        "E_REQUEST_LIMIT",
        `${subject} collections exceed max_collection_entries=${limits.max_collection_entries}.`
      );
    }
    for (const item of value) visitJsonBoundary(item, limits, seen, state, depth + 1, subject);
  } else {
    const prototype = Object.getPrototypeOf(value);
    if (prototype !== Object.prototype && prototype !== null) {
      throw new SeiError("E_REQUEST_INVALID", `${subject} objects must be plain JSON objects.`);
    }
    const entries = Object.entries(value);
    state.entries += entries.length;
    if (state.entries > limits.max_collection_entries) {
      throw new SeiError(
        "E_REQUEST_LIMIT",
        `${subject} collections exceed max_collection_entries=${limits.max_collection_entries}.`
      );
    }
    for (const [key, item] of entries) {
      if (key.length > limits.max_string_length) {
        throw new SeiError(
          "E_REQUEST_LIMIT",
          `A ${subject.toLowerCase()} key exceeds max_string_length=${limits.max_string_length}.`
        );
      }
      visitJsonBoundary(item, limits, seen, state, depth + 1, subject);
    }
  }
  seen.delete(value);
}
function enforceRequestBoundary(value, limits) {
  visitJsonBoundary(value, limits, /* @__PURE__ */ new WeakSet(), { entries: 0 }, 0, "Request");
  const serialized = JSON.stringify(value);
  if (serialized === void 0) {
    throw new SeiError("E_REQUEST_INVALID", "Request must be JSON serializable.");
  }
  const bytes = Buffer.byteLength(serialized, "utf8");
  if (bytes > limits.max_request_bytes) {
    throw new SeiError(
      "E_REQUEST_LIMIT",
      `Serialized request size ${bytes} exceeds max_request_bytes=${limits.max_request_bytes}.`,
      { details: { actual_bytes: bytes, limit: limits.max_request_bytes } }
    );
  }
  return bytes;
}
function enforceResponseBoundary(value, limits) {
  try {
    visitJsonBoundary(
      value,
      RESPONSE_STRUCTURAL_LIMITS,
      /* @__PURE__ */ new WeakSet(),
      { entries: 0 },
      0,
      "Response"
    );
  } catch (error) {
    throw new SeiError(
      "E_RESPONSE_LIMIT",
      error instanceof Error ? error.message : "Response exceeds its structural boundary."
    );
  }
  const serialized = JSON.stringify(value);
  if (serialized === void 0) {
    throw new SeiError("E_RESPONSE_LIMIT", "Response is not JSON serializable.");
  }
  const bytes = Buffer.byteLength(serialized, "utf8");
  if (bytes > limits.max_response_bytes) {
    throw new SeiError(
      "E_RESPONSE_LIMIT",
      `Serialized response size ${bytes} exceeds max_response_bytes=${limits.max_response_bytes}.`,
      { details: { actual_bytes: bytes, limit: limits.max_response_bytes } }
    );
  }
  return bytes;
}
function rejectUnknownKeys(value, allowed, location) {
  const unknown = Object.keys(value).filter((key) => !allowed.includes(key));
  if (unknown.length > 0) {
    throw new SeiError(
      "E_REQUEST_INVALID",
      `${location} contains unsupported field${unknown.length === 1 ? "" : "s"}: ${unknown.join(", ")}.`
    );
  }
}
function optionalString(value, name) {
  if (value === void 0) return void 0;
  if (typeof value !== "string") {
    throw new SeiError("E_REQUEST_INVALID", `'${name}' must be a string.`);
  }
  return value;
}
function parseContext(value) {
  if (value === void 0) return void 0;
  if (!isRecord(value)) {
    throw new SeiError("E_REQUEST_INVALID", "'context' must be an object.");
  }
  rejectUnknownKeys(value, ["timezone", "reference_time"], "'context'");
  for (const key of ["timezone", "reference_time"]) {
    if (value[key] !== void 0 && typeof value[key] !== "string") {
      throw new SeiError("E_REQUEST_INVALID", `'context.${key}' must be a string.`);
    }
  }
  return value;
}
function parseQuery(value) {
  if (value === void 0) return void 0;
  if (!isRecord(value) || typeof value.name !== "string") {
    throw new SeiError("E_REQUEST_INVALID", "'query.name' must be a string.");
  }
  rejectUnknownKeys(value, ["name", "arguments"], "'query'");
  if (value.arguments !== void 0 && !isRecord(value.arguments)) {
    throw new SeiError("E_REQUEST_INVALID", "'query.arguments' must be an object.");
  }
  return {
    name: value.name,
    ...value.arguments === void 0 ? {} : { arguments: value.arguments }
  };
}
function parseConversion(value) {
  if (value === void 0) return void 0;
  if (!isRecord(value)) {
    throw new SeiError("E_REQUEST_INVALID", "'convert' must be an object.");
  }
  rejectUnknownKeys(
    value,
    ["target_dialect", "target_representation", "arguments"],
    "'convert'"
  );
  const targetDialect = optionalString(value.target_dialect, "convert.target_dialect");
  const targetRepresentation = optionalString(
    value.target_representation,
    "convert.target_representation"
  );
  if (value.arguments !== void 0 && !isRecord(value.arguments)) {
    throw new SeiError("E_REQUEST_INVALID", "'convert.arguments' must be an object.");
  }
  return {
    ...targetDialect === void 0 ? {} : { target_dialect: targetDialect },
    ...targetRepresentation === void 0 ? {} : { target_representation: targetRepresentation },
    ...value.arguments === void 0 ? {} : { arguments: value.arguments }
  };
}
function parseLimits(value) {
  if (value === void 0) return void 0;
  if (!isRecord(value)) {
    throw new SeiError("E_REQUEST_INVALID", "'limits' must be an object.");
  }
  rejectUnknownKeys(value, LIMIT_KEYS, "'limits'");
  const result = {};
  for (const key of LIMIT_KEYS) {
    const candidate = value[key];
    if (candidate === void 0) continue;
    if (!Number.isSafeInteger(candidate) || candidate < MINIMUM_LIMITS[key]) {
      throw new SeiError(
        "E_LIMIT_INVALID",
        `'limits.${key}' must be an integer of at least ${MINIMUM_LIMITS[key]}.`
      );
    }
    if (candidate > HARD_LIMITS[key]) {
      throw new SeiError(
        "E_LIMIT_INVALID",
        `'limits.${key}' cannot exceed the hard maximum ${HARD_LIMITS[key]}.`
      );
    }
    result[key] = candidate;
  }
  return result;
}
function parseRequest(value) {
  if (!isRecord(value)) {
    throw new SeiError("E_REQUEST_INVALID", "Request must be a JSON object.");
  }
  rejectUnknownKeys(
    value,
    [
      "schema_version",
      "op",
      "expression",
      "kind",
      "dialect",
      "context",
      "derive",
      "query",
      "convert",
      "limits"
    ],
    "Request"
  );
  const rawOperation = value.op;
  if (rawOperation === void 0) {
    throw new SeiError("E_REQUEST_INVALID", "'op' is required.");
  }
  if (typeof rawOperation !== "string" || !OPERATIONS.includes(rawOperation)) {
    throw new SeiError("E_OPERATION_UNKNOWN", `Unsupported operation '${String(rawOperation)}'.`, {
      expected: { operations: [...OPERATIONS] }
    });
  }
  if (typeof value.expression !== "string") {
    throw new SeiError("E_REQUEST_INVALID", "'expression' must be a string.");
  }
  if (value.schema_version !== void 0 && value.schema_version !== "sei.request.v1") {
    throw new SeiError("E_SCHEMA_VERSION", "Only schema_version 'sei.request.v1' is supported.");
  }
  if (value.derive !== void 0) {
    if (!Array.isArray(value.derive) || !value.derive.every((item) => typeof item === "string")) {
      throw new SeiError("E_REQUEST_INVALID", "'derive' must be an array of strings.");
    }
    if (new Set(value.derive).size !== value.derive.length) {
      throw new SeiError("E_REQUEST_INVALID", "'derive' must not contain duplicate values.");
    }
  }
  const kind = optionalString(value.kind, "kind");
  const dialect = optionalString(value.dialect, "dialect");
  const context = parseContext(value.context);
  const query = parseQuery(value.query);
  const conversion = parseConversion(value.convert);
  const limits = parseLimits(value.limits);
  return {
    schema_version: "sei.request.v1",
    op: rawOperation,
    expression: value.expression,
    ...kind === void 0 ? {} : { kind },
    ...dialect === void 0 ? {} : { dialect },
    ...context === void 0 ? {} : { context },
    ...value.derive === void 0 ? {} : { derive: value.derive },
    ...query === void 0 ? {} : { query },
    ...conversion === void 0 ? {} : { convert: conversion },
    ...limits === void 0 ? {} : { limits }
  };
}
function resolveLimits(requested) {
  return {
    max_expression_length: requested?.max_expression_length ?? HARD_LIMITS.max_expression_length,
    max_output_items: requested?.max_output_items ?? HARD_LIMITS.max_output_items,
    max_request_bytes: requested?.max_request_bytes ?? HARD_LIMITS.max_request_bytes,
    max_response_bytes: requested?.max_response_bytes ?? HARD_LIMITS.max_response_bytes,
    max_nesting_depth: requested?.max_nesting_depth ?? HARD_LIMITS.max_nesting_depth,
    max_collection_entries: requested?.max_collection_entries ?? HARD_LIMITS.max_collection_entries,
    max_string_length: requested?.max_string_length ?? HARD_LIMITS.max_string_length,
    max_execution_ms: requested?.max_execution_ms ?? HARD_LIMITS.max_execution_ms
  };
}

// src/adapters/rrule.ts
var rrulePackage = rruleNamespace.default ?? rruleNamespace;
var { RRule } = rrulePackage;
var FREQUENCIES = [
  "YEARLY",
  "MONTHLY",
  "WEEKLY",
  "DAILY",
  "HOURLY",
  "MINUTELY",
  "SECONDLY"
];
var WEEKDAYS = ["MO", "TU", "WE", "TH", "FR", "SA", "SU"];
var CANONICAL_FIELD_ORDER = [
  "FREQ",
  "INTERVAL",
  "COUNT",
  "UNTIL",
  "WKST",
  "BYSECOND",
  "BYMINUTE",
  "BYHOUR",
  "BYDAY",
  "BYMONTHDAY",
  "BYYEARDAY",
  "BYWEEKNO",
  "BYMONTH",
  "BYSETPOS"
];
var ALLOWED_FIELDS = new Set(CANONICAL_FIELD_ORDER);
function invalid(message) {
  throw new SeiError("E_RRULE_PARSE", message);
}
function parsePositiveInteger(value, field) {
  if (!/^\d+$/.test(value)) invalid(`${field} must be a positive integer.`);
  const parsed = Number(value);
  if (!Number.isSafeInteger(parsed) || parsed < 1 || parsed > 2147483647) {
    throw new SeiError(
      "E_RRULE_VALUE_RANGE",
      `${field} must be between 1 and 2147483647.`
    );
  }
  return parsed;
}
function parseIntegerList(value, field, minimum, maximum, allowZero, input) {
  const tokens = value.split(",");
  if (tokens.length === 0 || tokens.length > input.limits.max_output_items || tokens.some((token) => token.length === 0)) {
    throw new SeiError(
      "E_RRULE_LIST_LIMIT",
      `${field} must contain between 1 and max_output_items=${input.limits.max_output_items} values.`
    );
  }
  const numbers = tokens.map((token) => {
    if (!/^[+-]?\d+$/.test(token)) invalid(`${field} contains a non-integer value.`);
    const parsed = Number(token);
    if (!Number.isSafeInteger(parsed) || parsed < minimum || parsed > maximum || !allowZero && parsed === 0) {
      throw new SeiError(
        "E_RRULE_VALUE_RANGE",
        `${field} values must be between ${minimum} and ${maximum}${allowZero ? "" : " and cannot be zero"}.`
      );
    }
    return parsed;
  });
  if (new Set(numbers).size !== numbers.length) {
    throw new SeiError(
      "E_RRULE_DUPLICATE_VALUE",
      `${field} must not contain duplicate values.`
    );
  }
  return numbers;
}
function parseByDay(value, input) {
  const tokens = value.split(",");
  if (tokens.length === 0 || tokens.length > input.limits.max_output_items || tokens.some((token) => token.length === 0)) {
    throw new SeiError(
      "E_RRULE_LIST_LIMIT",
      `BYDAY must contain between 1 and max_output_items=${input.limits.max_output_items} values.`
    );
  }
  const days = tokens.map((raw) => {
    const match = /^(?<ordinal>[+-]?\d{1,2})?(?<weekday>MO|TU|WE|TH|FR|SA|SU)$/i.exec(raw);
    if (match?.groups === void 0) invalid("BYDAY contains an invalid weekday value.");
    const weekday = match.groups.weekday?.toUpperCase();
    const ordinalToken = match.groups.ordinal;
    if (ordinalToken === void 0) return { weekday };
    const ordinal = Number(ordinalToken);
    if (!Number.isInteger(ordinal) || ordinal === 0 || ordinal < -53 || ordinal > 53) {
      throw new SeiError(
        "E_RRULE_VALUE_RANGE",
        "BYDAY ordinals must be between -53 and 53 and cannot be zero."
      );
    }
    return { weekday, ordinal };
  });
  const canonical = days.map((day) => `${day.ordinal ?? ""}${day.weekday}`);
  if (new Set(canonical).size !== canonical.length) {
    throw new SeiError("E_RRULE_DUPLICATE_VALUE", "BYDAY must not contain duplicate values.");
  }
  return days;
}
function canonicalDay(day) {
  if (day.ordinal === void 0) return day.weekday;
  return `${day.ordinal > 0 ? "+" : ""}${day.ordinal}${day.weekday}`;
}
function isLeapYear2(year) {
  return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
}
function parseUntil(value) {
  const match = /^(?<year>\d{4})(?<month>\d{2})(?<day>\d{2})T(?<hour>\d{2})(?<minute>\d{2})(?<second>\d{2})Z$/.exec(value);
  if (match?.groups === void 0) {
    invalid("UNTIL must use the supported UTC DATE-TIME form YYYYMMDDTHHMMSSZ.");
  }
  const year = Number(match.groups.year);
  const month = Number(match.groups.month);
  const day = Number(match.groups.day);
  const hour = Number(match.groups.hour);
  const minute = Number(match.groups.minute);
  const second = Number(match.groups.second);
  const monthLengths = [31, isLeapYear2(year) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  if (year < 100 || month < 1 || month > 12 || day < 1 || day > (monthLengths[month - 1] ?? 0) || hour > 23 || minute > 59 || second > 59) {
    throw new SeiError("E_RRULE_VALUE_RANGE", "UNTIL contains an invalid UTC calendar value.");
  }
  return value;
}
function assertSemanticCombinations(fields, byDay) {
  const frequency = fields.get("FREQ");
  if (fields.has("COUNT") && fields.has("UNTIL")) {
    throw new SeiError("E_RRULE_CONFLICT", "COUNT and UNTIL cannot appear in the same RRULE.");
  }
  if (fields.has("BYSETPOS") && ![...fields.keys()].some((name) => name.startsWith("BY") && name !== "BYSETPOS")) {
    throw new SeiError("E_RRULE_CONFLICT", "BYSETPOS requires at least one other BY* field.");
  }
  if (fields.has("BYWEEKNO") && frequency !== "YEARLY") {
    throw new SeiError("E_RRULE_CONFLICT", "BYWEEKNO is supported only with FREQ=YEARLY.");
  }
  if (fields.has("BYMONTHDAY") && frequency === "WEEKLY") {
    throw new SeiError("E_RRULE_CONFLICT", "BYMONTHDAY cannot be used with FREQ=WEEKLY.");
  }
  if (fields.has("BYYEARDAY") && ["DAILY", "WEEKLY", "MONTHLY"].includes(frequency ?? "")) {
    throw new SeiError(
      "E_RRULE_CONFLICT",
      "BYYEARDAY cannot be used with DAILY, WEEKLY, or MONTHLY frequency."
    );
  }
  if (byDay.some((day) => day.ordinal !== void 0) && !(frequency === "MONTHLY" || frequency === "YEARLY" && !fields.has("BYWEEKNO"))) {
    throw new SeiError(
      "E_RRULE_CONFLICT",
      "Numeric BYDAY values require MONTHLY, or YEARLY without BYWEEKNO."
    );
  }
}
function parseRrule(input) {
  const expression = input.expression;
  if (/[\r\n]/.test(expression) || !/^RRULE:/i.test(expression)) {
    invalid("RRULE input must be one RRULE: property line without DTSTART, RDATE, EXDATE, or VEVENT data.");
  }
  if (/\s/.test(expression)) invalid("RRULE input cannot contain whitespace.");
  const body = expression.slice(expression.indexOf(":") + 1);
  if (body.length === 0) invalid("RRULE must contain rule fields after RRULE:.");
  const parts = body.split(";");
  if (parts.length > CANONICAL_FIELD_ORDER.length) {
    throw new SeiError("E_RRULE_LIST_LIMIT", "RRULE contains too many fields.");
  }
  const fields = /* @__PURE__ */ new Map();
  for (const part of parts) {
    const match = /^(?<name>[A-Za-z][A-Za-z0-9-]*)=(?<value>[^=;]+)$/.exec(part);
    if (match?.groups === void 0) invalid("Each RRULE field must use NAME=VALUE syntax.");
    const name = match.groups.name?.toUpperCase() ?? "";
    const value = match.groups.value?.toUpperCase() ?? "";
    if (!ALLOWED_FIELDS.has(name)) {
      throw new SeiError("E_RRULE_FIELD_UNKNOWN", `Unsupported RRULE field '${name}'.`);
    }
    if (fields.has(name)) {
      throw new SeiError("E_RRULE_FIELD_DUPLICATE", `RRULE field '${name}' appears more than once.`);
    }
    fields.set(name, value);
  }
  const frequency = fields.get("FREQ");
  if (frequency === void 0) invalid("RRULE requires FREQ.");
  if (!FREQUENCIES.includes(frequency)) {
    invalid(`Unsupported FREQ value '${frequency}'.`);
  }
  const interval = fields.has("INTERVAL") ? parsePositiveInteger(fields.get("INTERVAL") ?? "", "INTERVAL") : 1;
  const count = fields.has("COUNT") ? parsePositiveInteger(fields.get("COUNT") ?? "", "COUNT") : null;
  const until = fields.has("UNTIL") ? parseUntil(fields.get("UNTIL") ?? "") : null;
  const weekStart = fields.get("WKST") ?? "MO";
  if (!WEEKDAYS.includes(weekStart)) invalid("WKST must be a weekday token.");
  const bySecond = fields.has("BYSECOND") ? parseIntegerList(fields.get("BYSECOND") ?? "", "BYSECOND", 0, 60, true, input) : [];
  const byMinute = fields.has("BYMINUTE") ? parseIntegerList(fields.get("BYMINUTE") ?? "", "BYMINUTE", 0, 59, true, input) : [];
  const byHour = fields.has("BYHOUR") ? parseIntegerList(fields.get("BYHOUR") ?? "", "BYHOUR", 0, 23, true, input) : [];
  const byDay = fields.has("BYDAY") ? parseByDay(fields.get("BYDAY") ?? "", input) : [];
  const byMonthDay = fields.has("BYMONTHDAY") ? parseIntegerList(fields.get("BYMONTHDAY") ?? "", "BYMONTHDAY", -31, 31, false, input) : [];
  const byYearDay = fields.has("BYYEARDAY") ? parseIntegerList(fields.get("BYYEARDAY") ?? "", "BYYEARDAY", -366, 366, false, input) : [];
  const byWeekNumber = fields.has("BYWEEKNO") ? parseIntegerList(fields.get("BYWEEKNO") ?? "", "BYWEEKNO", -53, 53, false, input) : [];
  const byMonth = fields.has("BYMONTH") ? parseIntegerList(fields.get("BYMONTH") ?? "", "BYMONTH", 1, 12, true, input) : [];
  const bySetPosition = fields.has("BYSETPOS") ? parseIntegerList(fields.get("BYSETPOS") ?? "", "BYSETPOS", -366, 366, false, input) : [];
  const totalListItems = [
    bySecond,
    byMinute,
    byHour,
    byDay,
    byMonthDay,
    byYearDay,
    byWeekNumber,
    byMonth,
    bySetPosition
  ].reduce((total, values) => total + values.length, 0);
  if (totalListItems > input.limits.max_output_items) {
    throw new SeiError(
      "E_RRULE_LIST_LIMIT",
      `RRULE BY* values exceed cumulative max_output_items=${input.limits.max_output_items}.`
    );
  }
  assertSemanticCombinations(fields, byDay);
  const canonicalValues = new Map([
    ["FREQ", frequency],
    ...fields.has("INTERVAL") ? [["INTERVAL", String(interval)]] : [],
    ...count === null ? [] : [["COUNT", String(count)]],
    ...until === null ? [] : [["UNTIL", until]],
    ...fields.has("WKST") ? [["WKST", weekStart]] : [],
    ...bySecond.length === 0 ? [] : [["BYSECOND", bySecond.join(",")]],
    ...byMinute.length === 0 ? [] : [["BYMINUTE", byMinute.join(",")]],
    ...byHour.length === 0 ? [] : [["BYHOUR", byHour.join(",")]],
    ...byDay.length === 0 ? [] : [["BYDAY", byDay.map(canonicalDay).join(",")]],
    ...byMonthDay.length === 0 ? [] : [["BYMONTHDAY", byMonthDay.join(",")]],
    ...byYearDay.length === 0 ? [] : [["BYYEARDAY", byYearDay.join(",")]],
    ...byWeekNumber.length === 0 ? [] : [["BYWEEKNO", byWeekNumber.join(",")]],
    ...byMonth.length === 0 ? [] : [["BYMONTH", byMonth.join(",")]],
    ...bySetPosition.length === 0 ? [] : [["BYSETPOS", bySetPosition.join(",")]]
  ]);
  const normalized = `RRULE:${CANONICAL_FIELD_ORDER.flatMap((name) => {
    const value = canonicalValues.get(name);
    return value === void 0 ? [] : [`${name}=${value}`];
  }).join(";")}`;
  try {
    const rule = RRule.fromString(normalized);
    if (rule.toString() !== normalized) {
      throw new Error("engine canonical form differs from the strict adapter form");
    }
  } catch {
    throw new SeiError(
      "E_RRULE_PARSE",
      "RRULE parser rejected the supported strict subset."
    );
  }
  return {
    normalized,
    value: {
      frequency,
      interval,
      count,
      until,
      week_start: weekStart,
      by_second: bySecond,
      by_minute: byMinute,
      by_hour: byHour,
      by_day: byDay,
      by_month_day: byMonthDay,
      by_year_day: byYearDay,
      by_week_number: byWeekNumber,
      by_month: byMonth,
      by_set_position: bySetPosition
    },
    semantics: {
      bounded: count !== null || until !== null,
      termination: count !== null ? "count" : until !== null ? "until" : "unbounded"
    }
  };
}
var integerArraySchema = (minimum, maximum, allowZero = true) => ({
  type: "array",
  maxItems: HARD_LIMITS.max_output_items,
  items: {
    type: "integer",
    minimum,
    maximum,
    ...allowZero ? {} : { not: { const: 0 } }
  }
});
var RruleAdapter = class {
  descriptor = {
    kind: "rrule",
    title: "RFC 5545 recurrence rule",
    summary: "Interpret one strict RRULE property without expanding calendar occurrences.",
    dialects: ["rfc5545"],
    default_dialect: "rfc5545",
    capabilities: ["interpret", "validate", "normalize"],
    interpretation_contract: {
      value_schema: {
        type: "object",
        properties: {
          frequency: { enum: [...FREQUENCIES] },
          interval: { type: "integer", minimum: 1, maximum: 2147483647 },
          count: { anyOf: [{ type: "integer", minimum: 1 }, { type: "null" }] },
          until: {
            anyOf: [
              { type: "string", pattern: "^(?:0[1-9]\\d{2}|[1-9]\\d{3})\\d{4}T\\d{6}Z$" },
              { type: "null" }
            ]
          },
          week_start: { enum: [...WEEKDAYS] },
          by_second: integerArraySchema(0, 60),
          by_minute: integerArraySchema(0, 59),
          by_hour: integerArraySchema(0, 23),
          by_day: {
            type: "array",
            maxItems: HARD_LIMITS.max_output_items,
            items: {
              type: "object",
              properties: {
                weekday: { enum: [...WEEKDAYS] },
                ordinal: { type: "integer", minimum: -53, maximum: 53, not: { const: 0 } }
              },
              required: ["weekday"],
              additionalProperties: false
            }
          },
          by_month_day: integerArraySchema(-31, 31, false),
          by_year_day: integerArraySchema(-366, 366, false),
          by_week_number: integerArraySchema(-53, 53, false),
          by_month: integerArraySchema(1, 12),
          by_set_position: integerArraySchema(-366, 366, false)
        },
        required: [
          "frequency",
          "interval",
          "count",
          "until",
          "week_start",
          "by_second",
          "by_minute",
          "by_hour",
          "by_day",
          "by_month_day",
          "by_year_day",
          "by_week_number",
          "by_month",
          "by_set_position"
        ],
        additionalProperties: false
      },
      semantics_schema: {
        type: "object",
        properties: {
          bounded: { type: "boolean" },
          termination: { enum: ["count", "until", "unbounded"] }
        },
        required: ["bounded", "termination"],
        additionalProperties: false
      }
    },
    provenance: {
      spec: "RFC5545-RRULE",
      engine: "rrule",
      engine_version: packageVersion("rrule"),
      compatibility_mode: "strict-single-property-no-occurrence-expansion"
    }
  };
  interpret(input) {
    return parseRrule(input);
  }
  detect(expression) {
    if (!/^RRULE:/i.test(expression) || /[\r\n]/.test(expression)) return null;
    return {
      kind: "rrule",
      dialect: "rfc5545",
      confidence: 0.995,
      reason: "The input has the explicit RFC 5545 RRULE property front door.",
      supported: true
    };
  }
};

// src/adapters/semver-range.ts
init_define_SEI_BUNDLED_ENGINE_VERSIONS();
var import_semver = __toESM(require_semver2(), 1);
function booleanArgument(argumentsValue, name) {
  const value = argumentsValue[name] ?? false;
  if (typeof value !== "boolean") {
    throw new SeiError("E_QUERY_INVALID", `'query.arguments.${name}' must be boolean.`);
  }
  return value;
}
var SemverRangeAdapter = class {
  descriptor = {
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
                additionalProperties: false
              }
            }
          }
        },
        required: ["comparator_sets"],
        additionalProperties: false
      }
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
              max_length: 256
            },
            include_prerelease: {
              type: "boolean",
              description: "Apply node-semver includePrerelease range semantics."
            }
          },
          required: ["candidate"],
          additional_properties: false
        },
        result_schema: {
          type: "object",
          properties: { candidate: { type: "string" }, matches: { type: "boolean" } },
          required: ["candidate", "matches"],
          additionalProperties: false
        }
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
              max_length: 8192
            },
            include_prerelease: {
              type: "boolean",
              description: "Apply node-semver includePrerelease range semantics."
            }
          },
          required: ["range"],
          additional_properties: false
        },
        result_schema: {
          type: "object",
          properties: { range: { type: "string" }, intersects: { type: "boolean" } },
          required: ["range", "intersects"],
          additionalProperties: false
        }
      }
    ],
    provenance: {
      spec: "Semantic-Versioning-2.0.0/npm-range",
      engine: "semver",
      engine_version: packageVersion("semver"),
      compatibility_mode: "npm-strict"
    }
  };
  interpret(input) {
    let range;
    try {
      range = new import_semver.Range(input.expression);
    } catch (error) {
      throw new SeiError(
        "E_SEMVER_RANGE_PARSE",
        error instanceof Error ? error.message : "Invalid semantic-version range.",
        { span: { start: 0, end: input.expression.length } }
      );
    }
    const normalized = range.range.length === 0 ? "*" : range.range;
    const comparatorSets = range.set.map(
      (set) => set.filter((comparator) => comparator.value !== "").map((comparator) => ({
        operator: comparator.operator || "=",
        version: comparator.semver.version
      }))
    );
    if (comparatorSets.length > input.limits.max_output_items || comparatorSets.some((set) => set.length > input.limits.max_output_items)) {
      throw new SeiError(
        "E_RESOURCE_LIMIT",
        `SemVer comparator output exceeds max_output_items=${input.limits.max_output_items}.`
      );
    }
    return {
      normalized,
      value: {
        comparator_sets: comparatorSets
      },
      state: { range }
    };
  }
  query(interpretation, query, _input) {
    const state = interpretation.state;
    const argumentsValue = query.arguments ?? {};
    const includePrerelease = booleanArgument(argumentsValue, "include_prerelease");
    if (query.name === "matches") {
      const candidate = argumentsValue.candidate;
      if (typeof candidate !== "string") {
        throw new SeiError(
          "E_QUERY_INVALID",
          "SemVer query 'matches' requires arguments.candidate as a version string."
        );
      }
      const normalizedCandidate = (0, import_semver.valid)(candidate);
      if (normalizedCandidate === null) {
        throw new SeiError(
          "E_QUERY_INVALID",
          `SemVer query candidate '${candidate}' is not a valid semantic version.`
        );
      }
      return {
        candidate: normalizedCandidate,
        matches: (0, import_semver.satisfies)(normalizedCandidate, state.range, { includePrerelease })
      };
    }
    if (query.name === "intersects") {
      const other = argumentsValue.range;
      if (typeof other !== "string") {
        throw new SeiError(
          "E_QUERY_INVALID",
          "SemVer query 'intersects' requires arguments.range as a range string."
        );
      }
      try {
        return {
          range: other,
          intersects: (0, import_semver.intersects)(state.range, new import_semver.Range(other), { includePrerelease })
        };
      } catch (error) {
        throw new SeiError(
          "E_QUERY_INVALID",
          error instanceof Error ? error.message : "Invalid comparison range."
        );
      }
    }
    throw new SeiError("E_QUERY_UNSUPPORTED", `SemVer query '${query.name}' is not supported.`, {
      expected: { queries: ["matches", "intersects"] }
    });
  }
  detect(expression) {
    const value = expression;
    const rangeShape = /[~^*xX<>=|]/.test(value) || /^v?\d+\.\d+\.\d+(?:[-+][0-9A-Za-z.-]+)?$/.test(value);
    if (!rangeShape) return null;
    try {
      new import_semver.Range(value);
      return {
        kind: "semver_range",
        dialect: "npm",
        confidence: 0.91,
        reason: "The input has npm semantic-version range syntax.",
        supported: true
      };
    } catch {
      return null;
    }
  }
};

// src/adapters/unix-permission.ts
init_define_SEI_BUNDLED_ENGINE_VERSIONS();
var CLASSES = ["owner", "group", "other"];
var PERMISSIONS = ["read", "write", "execute"];
function parseSymbolic(value) {
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
    mode |= digit << (2 - group) * 3;
  }
  if (value[2] === "s" || value[2] === "S") mode |= 2048;
  if (value[5] === "s" || value[5] === "S") mode |= 1024;
  if (value[8] === "t" || value[8] === "T") mode |= 512;
  return mode;
}
function parseMode(expression) {
  const value = expression.trim();
  if (/^(?:0?[0-7]{3}|[0-7]{4})$/.test(value)) {
    return Number.parseInt(value, 8);
  }
  return parseSymbolic(value);
}
function symbolicFor(mode) {
  const output = [];
  for (let group = 0; group < 3; group += 1) {
    const digit = mode >> (2 - group) * 3 & 7;
    output.push(digit & 4 ? "r" : "-", digit & 2 ? "w" : "-");
    const execute = (digit & 1) !== 0;
    const special = group === 0 ? 2048 : group === 1 ? 1024 : 512;
    if ((mode & special) !== 0) {
      output.push(group === 2 ? execute ? "t" : "T" : execute ? "s" : "S");
    } else {
      output.push(execute ? "x" : "-");
    }
  }
  return output.join("");
}
function octalFor(mode) {
  return mode.toString(8).padStart(4, "0");
}
var UnixPermissionAdapter = class {
  descriptor = {
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
              sticky: { type: "boolean" }
            },
            required: ["setuid", "setgid", "sticky"],
            additionalProperties: false
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
                    execute: { type: "boolean" }
                  },
                  required: ["read", "write", "execute"],
                  additionalProperties: false
                }
              ])
            ),
            required: [...CLASSES],
            additionalProperties: false
          }
        },
        required: ["octal", "symbolic", "special", "classes"],
        additionalProperties: false
      }
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
              enum: ["owner", "group", "other"]
            },
            permission: {
              type: "string",
              description: "Permission bit.",
              enum: ["read", "write", "execute"]
            }
          },
          required: ["subject", "permission"],
          additional_properties: false
        },
        result_schema: {
          type: "object",
          properties: {
            subject: { enum: [...CLASSES] },
            permission: { enum: [...PERMISSIONS] },
            allows: { type: "boolean" }
          },
          required: ["subject", "permission", "allows"],
          additionalProperties: false
        }
      }
    ],
    conversion_contract: {
      summary: "Convert the same POSIX mode between octal and symbolic representations.",
      target_dialects: ["posix-mode"],
      target_representations: ["octal", "symbolic"],
      arguments: {
        type: "object",
        properties: {},
        required: [],
        additional_properties: false
      },
      result_schemas: {
        octal: {
          type: "object",
          properties: {
            representation: { const: "octal" },
            expression: { type: "string", pattern: "^[0-7]{4}$" }
          },
          required: ["representation", "expression"],
          additionalProperties: false
        },
        symbolic: {
          type: "object",
          properties: {
            representation: { const: "symbolic" },
            expression: { type: "string", minLength: 9, maxLength: 9 }
          },
          required: ["representation", "expression"],
          additionalProperties: false
        }
      }
    },
    provenance: {
      spec: "POSIX-file-mode-bits",
      engine: "sei-bounded-mode-parser",
      engine_version: "0.1.0",
      compatibility_mode: "permission-and-special-bits"
    }
  };
  interpret(input) {
    let mode;
    try {
      mode = parseMode(input.expression);
    } catch (error) {
      if (error instanceof SeiError) throw error;
      throw new SeiError("E_PERMISSION_PARSE", "Invalid Unix permission mode.", {
        span: { start: 0, end: input.expression.length }
      });
    }
    const symbolic = symbolicFor(mode);
    const classes = Object.fromEntries(
      CLASSES.map((name, index) => {
        const digit = mode >> (2 - index) * 3 & 7;
        return [
          name,
          {
            read: (digit & 4) !== 0,
            write: (digit & 2) !== 0,
            execute: (digit & 1) !== 0
          }
        ];
      })
    );
    return {
      normalized: octalFor(mode),
      value: {
        octal: octalFor(mode),
        symbolic,
        special: {
          setuid: (mode & 2048) !== 0,
          setgid: (mode & 1024) !== 0,
          sticky: (mode & 512) !== 0
        },
        classes
      },
      state: { mode, symbolic }
    };
  }
  query(interpretation, query, _input) {
    if (query.name !== "allows") {
      throw new SeiError(
        "E_QUERY_UNSUPPORTED",
        `Unix permission query '${query.name}' is not supported.`,
        { expected: { queries: ["allows"] } }
      );
    }
    const subject = query.arguments?.subject;
    const permission = query.arguments?.permission;
    if (typeof subject !== "string" || !CLASSES.includes(subject)) {
      throw new SeiError("E_QUERY_INVALID", "Permission query subject must be owner, group, or other.");
    }
    if (typeof permission !== "string" || !PERMISSIONS.includes(permission)) {
      throw new SeiError("E_QUERY_INVALID", "Permission must be read, write, or execute.");
    }
    const state = interpretation.state;
    const classIndex = CLASSES.indexOf(subject);
    const permissionBit = permission === "read" ? 4 : permission === "write" ? 2 : 1;
    const digit = state.mode >> (2 - classIndex) * 3 & 7;
    return { subject, permission, allows: (digit & permissionBit) !== 0 };
  }
  convert(interpretation, conversion, _input) {
    const state = interpretation.state;
    if (conversion.target_dialect !== void 0 && conversion.target_dialect !== "posix-mode") {
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
      "Unix mode conversion requires target_representation 'octal' or 'symbolic'."
    );
  }
  detect(expression) {
    const value = expression.trim();
    if (/^0[0-7]{3}$/.test(value) || /^[r-][w-][xSs-][r-][w-][xSs-][r-][w-][xTt-]$/.test(value)) {
      return {
        kind: "unix_permission",
        dialect: "posix-mode",
        confidence: 0.96,
        reason: "The input has an explicit octal prefix or nine-character Unix permission shape.",
        supported: true
      };
    }
    if (/^[1-7][0-7]{3}$/.test(value)) {
      return {
        kind: "unix_permission",
        dialect: "posix-mode",
        confidence: 0.88,
        reason: "Four octal digits represent Unix special and permission mode bits but may also be an integer.",
        supported: true
      };
    }
    if (/^[0-7]{3}$/.test(value)) {
      return {
        kind: "unix_permission",
        dialect: "posix-mode",
        confidence: 0.72,
        reason: "Three octal digits commonly represent a Unix permission but may also be an integer.",
        supported: true
      };
    }
    return null;
  }
};

// src/adapters/uri.ts
init_define_SEI_BUNDLED_ENGINE_VERSIONS();
var URI = __toESM(require_uri_all(), 1);
import { isIP } from "node:net";
var URI_STRUCTURE = /^(?:([A-Za-z][A-Za-z0-9+.-]*):)?(?:(\/\/)([^/?#]*))?([^?#]*)(?:\?([^#]*))?(?:#(.*))?$/;
var USERINFO = /^[A-Za-z0-9._~!$&'()*+,;=:%-]*$/;
var REG_NAME = /^[A-Za-z0-9._~!$&'()*+,;=%-]*$/;
var PATH = /^[A-Za-z0-9._~!$&'()*+,;=:@%\/-]*$/;
var QUERY_OR_FRAGMENT = /^[A-Za-z0-9._~!$&'()*+,;=:@%/?-]*$/;
var IPV_FUTURE = /^v[0-9A-Fa-f]+\.[A-Za-z0-9._~!$&'()*+,;=:-]+$/i;
function failUri(code, message) {
  throw new SeiError(code, message);
}
function assertAuthority(authority, code) {
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
  const port = colon < 0 ? void 0 : hostPort.slice(colon + 1);
  if (!REG_NAME.test(host)) {
    failUri(code, "URI registered-name host contains a character outside RFC 3986.");
  }
  if (port !== void 0 && !/^\d*$/.test(port)) {
    failUri(code, "URI port must contain decimal digits only.");
  }
}
function parseStrictUri(value, options) {
  if (!/^[\x21-\x7E]*$/.test(value)) {
    failUri(options.code, "URI input must contain visible ASCII characters only; use percent encoding for octets.");
  }
  if (/%(?![0-9A-Fa-f]{2})/.test(value)) {
    failUri(options.code, "Every URI percent escape must contain exactly two hexadecimal digits.");
  }
  const match = URI_STRUCTURE.exec(value);
  if (match === null) failUri(options.code, "Input does not match RFC 3986 URI-reference structure.");
  const [, scheme, authorityMarker, authority, path = "", query, fragment] = match;
  if (options.requireScheme && scheme === void 0) {
    failUri(
      options.schemeRequiredCode ?? options.code,
      "RFC 3986 URI input must include a scheme."
    );
  }
  if (authorityMarker !== void 0) {
    assertAuthority(authority ?? "", options.code);
    if (path !== "" && !path.startsWith("/")) {
      failUri(options.code, "A URI path following an authority must be empty or begin with '/'.");
    }
  } else if (path.startsWith("//")) {
    failUri(options.code, "A URI path without an authority cannot begin with '//'.");
  }
  if (scheme === void 0 && authorityMarker === void 0 && !path.startsWith("/") && (path.split("/", 1)[0] ?? "").includes(":")) {
    failUri(options.code, "The first segment of a relative path cannot contain ':'.");
  }
  if (!PATH.test(path)) failUri(options.code, "URI path contains a character outside RFC 3986.");
  if (query !== void 0 && !QUERY_OR_FRAGMENT.test(query)) {
    failUri(options.code, "URI query contains a character outside RFC 3986.");
  }
  if (fragment !== void 0 && !QUERY_OR_FRAGMENT.test(fragment)) {
    failUri(options.code, "URI fragment contains a character outside RFC 3986.");
  }
  return {
    ...scheme === void 0 ? {} : { scheme },
    ...authorityMarker === void 0 ? {} : { authority: authority ?? "" },
    path,
    ...query === void 0 ? {} : { query },
    ...fragment === void 0 ? {} : { fragment }
  };
}
var UriAdapter = class {
  descriptor = {
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
          fragment: { type: "string" }
        },
        required: ["scheme", "path"],
        additionalProperties: false
      }
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
              max_length: 8192
            }
          },
          required: ["reference"],
          additional_properties: false
        },
        result_schema: {
          type: "object",
          properties: { reference: { type: "string" }, resolved: { type: "string" } },
          required: ["reference", "resolved"],
          additionalProperties: false
        }
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
              max_length: 8192
            }
          },
          required: ["uri"],
          additional_properties: false
        },
        result_schema: {
          type: "object",
          properties: { uri: { type: "string" }, equals: { type: "boolean" } },
          required: ["uri", "equals"],
          additionalProperties: false
        }
      }
    ],
    provenance: {
      spec: "RFC3986",
      engine: "uri-js",
      engine_version: packageVersion("uri-js"),
      compatibility_mode: "scheme-qualified-uri"
    }
  };
  interpret(input) {
    parseStrictUri(input.expression, {
      requireScheme: true,
      code: "E_URI_PARSE",
      schemeRequiredCode: "E_URI_SCHEME_REQUIRED"
    });
    const parsed = URI.parse(input.expression);
    if (parsed.error !== void 0) {
      throw new SeiError("E_URI_PARSE", parsed.error, {
        span: { start: 0, end: input.expression.length }
      });
    }
    if (parsed.scheme === void 0) {
      throw new SeiError("E_URI_SCHEME_REQUIRED", "RFC 3986 URI input must include a scheme.", {
        expected: { example: "https://example.com/path" }
      });
    }
    const normalized = URI.normalize(input.expression);
    const normalizedParts = URI.parse(normalized);
    if (normalizedParts.error !== void 0) {
      throw new SeiError("E_URI_PARSE", normalizedParts.error);
    }
    const diagnostics = [];
    if (normalizedParts.userinfo !== void 0) {
      diagnostics.push({
        code: "W_URI_USERINFO",
        severity: "warning",
        message: "The URI contains userinfo; avoid embedding credentials in stored or logged URIs."
      });
    }
    return {
      normalized,
      value: {
        scheme: normalizedParts.scheme ?? "",
        ...normalizedParts.userinfo === void 0 ? {} : { userinfo: normalizedParts.userinfo },
        ...normalizedParts.host === void 0 ? {} : { host: normalizedParts.host },
        ...normalizedParts.port === void 0 ? {} : { port: String(normalizedParts.port) },
        path: normalizedParts.path ?? "",
        ...normalizedParts.query === void 0 ? {} : { query: normalizedParts.query },
        ...normalizedParts.fragment === void 0 ? {} : { fragment: normalizedParts.fragment }
      },
      diagnostics
    };
  }
  query(interpretation, query, _input) {
    const argumentsValue = query.arguments ?? {};
    if (query.name === "resolve") {
      const reference = argumentsValue.reference;
      if (typeof reference !== "string") {
        throw new SeiError(
          "E_QUERY_INVALID",
          "URI query 'resolve' requires arguments.reference as a URI reference string."
        );
      }
      parseStrictUri(reference, { requireScheme: false, code: "E_QUERY_INVALID" });
      const resolved = URI.resolve(interpretation.normalized, reference);
      parseStrictUri(resolved, { requireScheme: true, code: "E_QUERY_INVALID" });
      const parsed = URI.parse(resolved);
      if (parsed.error !== void 0) {
        throw new SeiError("E_QUERY_INVALID", parsed.error);
      }
      return { reference, resolved };
    }
    if (query.name === "equals") {
      const candidate = argumentsValue.uri;
      if (typeof candidate !== "string") {
        throw new SeiError(
          "E_QUERY_INVALID",
          "URI query 'equals' requires arguments.uri as a URI string."
        );
      }
      parseStrictUri(candidate, { requireScheme: true, code: "E_QUERY_INVALID" });
      return { uri: candidate, equals: URI.equal(interpretation.normalized, candidate) };
    }
    throw new SeiError("E_QUERY_UNSUPPORTED", `URI query '${query.name}' is not supported.`, {
      expected: { queries: ["resolve", "equals"] }
    });
  }
  detect(expression) {
    if (!/^[A-Za-z][A-Za-z0-9+.-]*:/.test(expression)) return null;
    try {
      parseStrictUri(expression, { requireScheme: true, code: "E_URI_PARSE" });
      const parsed = URI.parse(expression);
      if (parsed.error !== void 0 || parsed.scheme === void 0) return null;
      return {
        kind: "uri",
        dialect: "rfc3986",
        confidence: 0.98,
        reason: "The input begins with a valid URI scheme and parses as an RFC 3986 URI.",
        supported: true
      };
    } catch {
      return null;
    }
  }
};

// src/core/registry.ts
init_define_SEI_BUNDLED_ENGINE_VERSIONS();
function deepFreeze(value, seen = /* @__PURE__ */ new WeakSet()) {
  if (typeof value !== "object" || value === null || seen.has(value)) return value;
  seen.add(value);
  for (const key of Reflect.ownKeys(value)) {
    deepFreeze(value[key], seen);
  }
  return Object.freeze(value);
}
function assertUniqueNonEmpty(values, label) {
  if (values.length === 0 || values.some((value) => value.length === 0)) {
    throw new SeiError("E_ADAPTER_INVALID", `${label} must contain non-empty values.`);
  }
  if (new Set(values).size !== values.length) {
    throw new SeiError("E_ADAPTER_INVALID", `${label} must not contain duplicates.`);
  }
}
function validateDeclaredFields(required, properties, label) {
  if (new Set(required).size !== required.length) {
    throw new SeiError("E_ADAPTER_INVALID", `${label} required fields must not contain duplicates.`);
  }
  if (required.some((name) => !Object.hasOwn(properties, name))) {
    throw new SeiError("E_ADAPTER_INVALID", `${label} requires a field it does not declare.`);
  }
}
function validateDescriptor(adapter, descriptor) {
  if (!/^[a-z][a-z0-9_]*$/.test(descriptor.kind)) {
    throw new SeiError(
      "E_ADAPTER_INVALID",
      "Adapter kind must use lower_snake_case and begin with a letter."
    );
  }
  assertUniqueNonEmpty(descriptor.dialects, "Adapter dialects");
  assertUniqueNonEmpty(descriptor.capabilities, "Adapter capabilities");
  if (descriptor.default_dialect !== void 0 && !descriptor.dialects.includes(descriptor.default_dialect)) {
    throw new SeiError("E_ADAPTER_INVALID", "Adapter default_dialect must be declared in dialects.");
  }
  if (!descriptor.capabilities.includes("interpret")) {
    throw new SeiError("E_ADAPTER_INVALID", "Every adapter must declare the interpret capability.");
  }
  for (const [name, value] of Object.entries({
    title: descriptor.title,
    summary: descriptor.summary,
    spec: descriptor.provenance.spec,
    engine: descriptor.provenance.engine,
    engine_version: descriptor.provenance.engine_version,
    compatibility_mode: descriptor.provenance.compatibility_mode
  })) {
    if (value.length === 0) {
      throw new SeiError("E_ADAPTER_INVALID", `Adapter ${name} must not be empty.`);
    }
  }
  if (descriptor.context_contract !== void 0) {
    validateDeclaredFields(
      descriptor.context_contract.required,
      descriptor.context_contract.properties,
      "Adapter context contract"
    );
  }
  const queryNames = (descriptor.query_contracts ?? []).map((contract) => contract.name);
  const deriveNames = (descriptor.derive_contracts ?? []).map((contract) => contract.name);
  if (queryNames.length > 0) assertUniqueNonEmpty(queryNames, "Adapter query contracts");
  if (deriveNames.length > 0) assertUniqueNonEmpty(deriveNames, "Adapter derive contracts");
  for (const contract of descriptor.query_contracts ?? []) {
    validateDeclaredFields(
      contract.arguments.required,
      contract.arguments.properties,
      `Adapter query '${contract.name}' arguments`
    );
  }
  const expectedDynamicCapabilities = /* @__PURE__ */ new Set([
    ...queryNames.map((name) => `query.${name}`),
    ...deriveNames.map((name) => `derive.${name}`)
  ]);
  const declaredDynamicCapabilities = descriptor.capabilities.filter(
    (name) => name.startsWith("query.") || name.startsWith("derive.")
  );
  if (declaredDynamicCapabilities.some((name) => !expectedDynamicCapabilities.has(name)) || [...expectedDynamicCapabilities].some((name) => !descriptor.capabilities.includes(name))) {
    throw new SeiError(
      "E_ADAPTER_INVALID",
      "Adapter query and derive capabilities must exactly match their descriptor contracts."
    );
  }
  if (queryNames.length > 0 !== (adapter.query !== void 0)) {
    throw new SeiError(
      "E_ADAPTER_INVALID",
      "Adapter query implementation and query contracts must either both exist or both be absent."
    );
  }
  const conversionDeclared = descriptor.capabilities.includes("convert");
  if (conversionDeclared !== (descriptor.conversion_contract !== void 0) || conversionDeclared !== (adapter.convert !== void 0)) {
    throw new SeiError(
      "E_ADAPTER_INVALID",
      "Adapter conversion capability, contract, and implementation must agree."
    );
  }
  if (descriptor.conversion_contract !== void 0) {
    const contract = descriptor.conversion_contract;
    assertUniqueNonEmpty(contract.target_dialects, "Adapter conversion target dialects");
    assertUniqueNonEmpty(
      contract.target_representations,
      "Adapter conversion target representations"
    );
    validateDeclaredFields(
      contract.arguments.required,
      contract.arguments.properties,
      "Adapter conversion arguments"
    );
    if (contract.target_representations.some(
      (target) => !Object.hasOwn(contract.result_schemas, target)
    )) {
      throw new SeiError(
        "E_ADAPTER_INVALID",
        "Every conversion target representation must declare a result schema."
      );
    }
  }
  const contextFields = new Set(Object.keys(descriptor.context_contract?.properties ?? {}));
  for (const contract of [
    ...descriptor.query_contracts ?? [],
    ...descriptor.derive_contracts ?? []
  ]) {
    if ((contract.required_context ?? []).some((name) => !contextFields.has(name))) {
      throw new SeiError(
        "E_ADAPTER_INVALID",
        `Adapter contract '${contract.name}' requires an undeclared context field.`
      );
    }
  }
}
var ExpressionRegistry = class {
  #adapters = /* @__PURE__ */ new Map();
  #descriptors = /* @__PURE__ */ new Map();
  #sealed = false;
  register(adapter) {
    if (this.#sealed) {
      throw new SeiError("E_REGISTRY_SEALED", "This expression registry is sealed.");
    }
    const candidate = adapter.descriptor;
    validateDescriptor(adapter, candidate);
    const { kind } = candidate;
    if (this.#adapters.has(kind)) {
      throw new SeiError("E_ADAPTER_DUPLICATE", `Adapter kind '${kind}' is already registered.`);
    }
    const descriptor = deepFreeze(candidate);
    this.#adapters.set(kind, adapter);
    this.#descriptors.set(kind, descriptor);
    return this;
  }
  seal() {
    this.#sealed = true;
    return this;
  }
  get sealed() {
    return this.#sealed;
  }
  get(kind) {
    return this.#adapters.get(kind);
  }
  require(kind) {
    const adapter = this.get(kind);
    if (adapter === void 0) {
      throw new SeiError("E_KIND_UNKNOWN", `Unsupported expression kind '${kind}'.`, {
        expected: { kinds: this.list().map((descriptor) => descriptor.kind) }
      });
    }
    return adapter;
  }
  list() {
    return [...this.#descriptors.values()].sort((left, right) => left.kind < right.kind ? -1 : left.kind > right.kind ? 1 : 0);
  }
  describe(kind) {
    this.require(kind);
    return this.#descriptors.get(kind);
  }
  adapters() {
    return [...this.#adapters.values()];
  }
};

// src/default-registry.ts
function createDefaultRegistry() {
  return new ExpressionRegistry().register(new CronAdapter()).register(new SemverRangeAdapter()).register(new CidrAdapter()).register(new UriAdapter()).register(new ContentTypeAdapter()).register(new IsoDurationAdapter()).register(new RruleAdapter()).register(new UnixPermissionAdapter());
}
var defaultRegistry = createDefaultRegistry().seal();

// src/core/interpreter.ts
init_define_SEI_BUNDLED_ENGINE_VERSIONS();

// src/core/batch.ts
init_define_SEI_BUNDLED_ENGINE_VERSIONS();
var BATCH_LIMITS = Object.freeze({
  max_items: 50,
  max_request_bytes: 262144,
  max_response_bytes: 1048576,
  max_collection_entries: 5e3,
  max_execution_ms: 5e3
});

// src/core/operation-contract.ts
init_define_SEI_BUNDLED_ENGINE_VERSIONS();
function requireContextFields(request, required) {
  for (const name of required ?? []) {
    if (request.context === void 0 || !Object.hasOwn(request.context, name)) {
      if (name === "reference_time") {
        throw new SeiError(
          "E_REFERENCE_TIME_REQUIRED",
          "This operation requires explicit 'context.reference_time' for deterministic replay."
        );
      }
      throw new SeiError(
        "E_CONTEXT_REQUIRED",
        `This operation requires explicit 'context.${name}'.`
      );
    }
  }
}
function isJsonPrimitive(value) {
  return value === null || ["string", "number", "boolean"].includes(typeof value);
}
function validateField(value, schema, location) {
  if (schema.type === "string") {
    if (typeof value !== "string") {
      throw new SeiError("E_REQUEST_INVALID", `${location} must be a string.`);
    }
    if (schema.min_length !== void 0 && value.length < schema.min_length) {
      throw new SeiError(
        schema.diagnostic_code ?? "E_REQUEST_INVALID",
        `${location} must contain at least ${schema.min_length} character(s).`
      );
    }
    if (schema.max_length !== void 0 && value.length > schema.max_length) {
      throw new SeiError(
        schema.diagnostic_code ?? "E_REQUEST_INVALID",
        `${location} exceeds its ${schema.max_length}-character limit.`
      );
    }
    if (schema.pattern !== void 0 && !new RegExp(schema.pattern, "u").test(value)) {
      throw new SeiError(
        schema.diagnostic_code ?? "E_REQUEST_INVALID",
        `${location} does not match its declared format.`
      );
    }
  } else if (schema.type === "integer") {
    if (!Number.isSafeInteger(value)) {
      throw new SeiError("E_REQUEST_INVALID", `${location} must be a safe integer.`);
    }
    if (schema.minimum !== void 0 && value < schema.minimum) {
      throw new SeiError("E_REQUEST_INVALID", `${location} must be at least ${schema.minimum}.`);
    }
    if (schema.maximum !== void 0 && value > schema.maximum) {
      throw new SeiError("E_REQUEST_INVALID", `${location} cannot exceed ${schema.maximum}.`);
    }
  } else if (typeof value !== "boolean") {
    throw new SeiError("E_REQUEST_INVALID", `${location} must be boolean.`);
  }
  if (schema.enum !== void 0 && (!isJsonPrimitive(value) || !schema.enum.some((candidate) => candidate === value))) {
    throw new SeiError("E_REQUEST_INVALID", `${location} is not an allowed value.`, {
      expected: { values: schema.enum }
    });
  }
}
function validateObjectContract(value, schema, location) {
  const object = value ?? {};
  const unknown = Object.keys(object).filter(
    (name) => !Object.hasOwn(schema.properties, name)
  );
  if (unknown.length > 0) {
    throw new SeiError(
      "E_REQUEST_INVALID",
      `${location} contains unsupported field${unknown.length === 1 ? "" : "s"}: ${unknown.join(", ")}.`
    );
  }
  for (const required of schema.required) {
    if (!Object.hasOwn(object, required)) {
      throw new SeiError("E_REQUEST_INVALID", `${location}.${required} is required.`);
    }
  }
  for (const [name, fieldValue2] of Object.entries(object)) {
    const fieldSchema = Object.hasOwn(schema.properties, name) ? schema.properties[name] : void 0;
    if (fieldSchema !== void 0) {
      validateField(fieldValue2, fieldSchema, `${location}.${name}`);
    }
  }
}
function validateOperationContract(descriptor, request) {
  if ((request.op === "interpret" || request.op === "validate" || request.op === "normalize") && !descriptor.capabilities.includes(request.op)) {
    throw new SeiError(
      "E_OPERATION_UNSUPPORTED",
      `Kind '${descriptor.kind}' does not support operation '${request.op}'.`
    );
  }
  if (descriptor.context_contract === void 0) {
    if (request.context !== void 0) {
      throw new SeiError(
        "E_REQUEST_INVALID",
        `Kind '${descriptor.kind}' does not accept context fields.`
      );
    }
  } else {
    validateObjectContract(request.context, descriptor.context_contract, "context");
  }
  if (request.op === "query") {
    if (request.query === void 0) {
      throw new SeiError("E_QUERY_REQUIRED", "'query' is required for op='query'.");
    }
    const contract = descriptor.query_contracts?.find(
      (candidate) => candidate.name === request.query?.name
    );
    if (contract === void 0) {
      throw new SeiError(
        "E_QUERY_UNSUPPORTED",
        `Kind '${descriptor.kind}' does not support query '${request.query.name}'.`,
        { expected: { queries: descriptor.query_contracts?.map((item) => item.name) ?? [] } }
      );
    }
    validateObjectContract(request.query.arguments, contract.arguments, "query.arguments");
    requireContextFields(request, contract.required_context);
  } else if (request.query !== void 0) {
    throw new SeiError("E_REQUEST_INVALID", "'query' is only allowed when op='query'.");
  }
  if (request.op === "convert") {
    if (request.convert === void 0) {
      throw new SeiError("E_CONVERSION_REQUIRED", "'convert' is required for op='convert'.");
    }
    const contract = descriptor.conversion_contract;
    if (contract === void 0) {
      throw new SeiError(
        "E_CONVERSION_UNSUPPORTED",
        `Kind '${descriptor.kind}' does not support conversion.`
      );
    }
    if (request.convert.target_dialect !== void 0 && !contract.target_dialects.includes(request.convert.target_dialect)) {
      throw new SeiError("E_CONVERSION_UNSUPPORTED", "Unsupported conversion target dialect.", {
        expected: { target_dialects: contract.target_dialects }
      });
    }
    if (request.convert.target_representation === void 0 || !contract.target_representations.includes(request.convert.target_representation)) {
      throw new SeiError("E_CONVERSION_UNSUPPORTED", "Unsupported conversion representation.", {
        expected: { target_representations: contract.target_representations }
      });
    }
    validateObjectContract(request.convert.arguments, contract.arguments, "convert.arguments");
  } else if (request.convert !== void 0) {
    throw new SeiError("E_REQUEST_INVALID", "'convert' is only allowed when op='convert'.");
  }
  if (request.derive !== void 0) {
    if (!["interpret", "validate", "normalize"].includes(request.op)) {
      throw new SeiError(
        "E_REQUEST_INVALID",
        "'derive' is only allowed for interpret, validate, and normalize operations."
      );
    }
    if (new Set(request.derive).size !== request.derive.length) {
      throw new SeiError("E_REQUEST_INVALID", "'derive' must not contain duplicate values.");
    }
    const supported = descriptor.derive_contracts?.map((contract) => contract.name) ?? [];
    const unsupported = request.derive.filter((name) => !supported.includes(name));
    if (unsupported.length > 0) {
      throw new SeiError(
        "E_DERIVE_UNSUPPORTED",
        `Kind '${descriptor.kind}' does not support derive value(s): ${unsupported.join(", ")}.`,
        { expected: { derive: supported } }
      );
    }
    for (const name of request.derive) {
      const contract = descriptor.derive_contracts?.find((candidate) => candidate.name === name);
      requireContextFields(request, contract?.required_context);
    }
  }
}

// src/core/interpreter.ts
function failedResult(operation, input, diagnostic, request) {
  return {
    schema_version: "sei.result.v1",
    ok: false,
    operation,
    input,
    ...request?.kind === void 0 ? {} : { kind: request.kind },
    ...request?.dialect === void 0 ? {} : { dialect: request.dialect },
    diagnostics: [diagnostic]
  };
}
function detect(expression, registry) {
  const supported = registry.adapters().map((adapter) => adapter.detect(expression)).filter((candidate) => candidate !== null);
  if (/^[0-9]+$/.test(expression.trim())) {
    supported.push({
      kind: "integer",
      confidence: 0.28,
      reason: "The input is also a plain decimal integer.",
      supported: false
    });
  }
  return supported.sort((left, right) => right.confidence - left.confidence);
}
function enforceDeadline(startedAt, maxExecutionMs) {
  const elapsed = performance.now() - startedAt;
  if (elapsed > maxExecutionMs) {
    throw new SeiError(
      "E_EXECUTION_TIMEOUT",
      `Interpretation exceeded max_execution_ms=${maxExecutionMs}.`,
      { details: { elapsed_ms: Math.ceil(elapsed), limit_ms: maxExecutionMs } }
    );
  }
}
function compactFailure(result, limits) {
  const correlationDetails = {
    input_truncated: result.input.length > 64,
    kind_omitted: result.kind !== void 0 && result.kind.length > 64,
    dialect_omitted: result.dialect !== void 0 && result.dialect.length > 64
  };
  const diagnostics = result.diagnostics.map((diagnostic, index) => index === 0 ? {
    ...diagnostic,
    details: { ...diagnostic.details ?? {}, ...correlationDetails }
  } : diagnostic);
  const base = {
    schema_version: "sei.result.v1",
    ok: false,
    operation: result.operation,
    input: result.input.slice(0, 64),
    ...result.kind !== void 0 && result.kind.length <= 64 ? { kind: result.kind } : {},
    ...result.dialect !== void 0 && result.dialect.length <= 64 ? { dialect: result.dialect } : {},
    diagnostics
  };
  try {
    enforceResponseBoundary(base, limits);
    return base;
  } catch {
    const compactDiagnostics = result.diagnostics.slice(0, 4).map((diagnostic) => ({
      code: diagnostic.code.slice(0, 128),
      severity: diagnostic.severity,
      message: diagnostic.message.slice(0, 256),
      ...diagnostic.span === void 0 ? {} : { span: diagnostic.span },
      details: {
        ...correlationDetails,
        diagnostic_truncated: result.diagnostics.length > 4 || diagnostic.message.length > 256
      }
    }));
    const compact = { ...base, diagnostics: compactDiagnostics };
    try {
      enforceResponseBoundary(compact, limits);
      return compact;
    } catch {
      return void 0;
    }
  }
}
function finalizeResult(result, limits) {
  try {
    enforceResponseBoundary(result, limits);
    return result;
  } catch (error) {
    if (!result.ok) {
      const compact = compactFailure(result, limits);
      if (compact !== void 0) return compact;
    }
    const diagnostic = asDiagnostic(error);
    return {
      schema_version: "sei.result.v1",
      ok: false,
      operation: result.operation,
      input: result.input.slice(0, 64),
      ...result.kind !== void 0 && result.kind.length <= 64 ? { kind: result.kind } : {},
      ...result.dialect !== void 0 && result.dialect.length <= 64 ? { dialect: result.dialect } : {},
      diagnostics: [
        {
          ...diagnostic,
          details: {
            ...diagnostic.details ?? {},
            input_truncated: result.input.length > 64,
            kind_omitted: result.kind !== void 0 && result.kind.length > 64,
            dialect_omitted: result.dialect !== void 0 && result.dialect.length > 64
          }
        }
      ]
    };
  }
}
function interpret(requestValue, registry) {
  const startedAt = performance.now();
  let operation = "interpret";
  let input = "";
  let request;
  let limits = HARD_LIMITS;
  try {
    enforceRequestBoundary(requestValue, HARD_LIMITS);
    request = parseRequest(requestValue);
    operation = request.op;
    input = request.expression;
    limits = resolveLimits(request.limits);
    enforceRequestBoundary(requestValue, limits);
    enforceDeadline(startedAt, limits.max_execution_ms);
    if (operation === "detect" && [request.kind, request.dialect, request.context, request.derive, request.query, request.convert].some((value) => value !== void 0)) {
      throw new SeiError(
        "E_REQUEST_INVALID",
        "Detect requests accept only op, expression, schema_version, and limits."
      );
    }
    if (input.length > limits.max_expression_length) {
      throw new SeiError(
        "E_EXPRESSION_TOO_LONG",
        `Expression length ${input.length} exceeds max_expression_length=${limits.max_expression_length}.`,
        { details: { actual_length: input.length, limit: limits.max_expression_length } }
      );
    }
    if (operation === "detect") {
      const candidates = detect(input, registry);
      if (candidates.length > limits.max_output_items) {
        throw new SeiError(
          "E_RESOURCE_LIMIT",
          `Detection produced ${candidates.length} candidates, exceeding max_output_items=${limits.max_output_items}.`
        );
      }
      const result2 = {
        schema_version: "sei.result.v1",
        ok: true,
        operation,
        input,
        candidates,
        resolved: false,
        diagnostics: []
      };
      enforceDeadline(startedAt, limits.max_execution_ms);
      return finalizeResult(result2, limits);
    }
    if (request.kind === void 0 || request.kind.length === 0) {
      throw new SeiError("E_KIND_REQUIRED", "'kind' is required unless op='detect'.");
    }
    const adapter = registry.require(request.kind);
    const descriptor = registry.describe(request.kind);
    let dialect = request.dialect;
    if (dialect === void 0 || dialect.length === 0) {
      dialect = descriptor.default_dialect;
    }
    if (dialect === void 0) {
      throw new SeiError("E_DIALECT_REQUIRED", `'dialect' is required for kind '${request.kind}'.`, {
        expected: { dialects: descriptor.dialects }
      });
    }
    if (!descriptor.dialects.includes(dialect)) {
      throw new SeiError(
        "E_DIALECT_UNSUPPORTED",
        `Dialect '${dialect}' is not supported for kind '${request.kind}'.`,
        { expected: { dialects: descriptor.dialects } }
      );
    }
    validateOperationContract(descriptor, request);
    enforceDeadline(startedAt, limits.max_execution_ms);
    const adapterInput = {
      expression: request.expression,
      dialect,
      context: request.context ?? {},
      derive: request.derive ?? [],
      limits
    };
    const interpretation = adapter.interpret(adapterInput);
    enforceDeadline(startedAt, limits.max_execution_ms);
    const base = {
      schema_version: "sei.result.v1",
      ok: true,
      operation,
      input,
      kind: request.kind,
      dialect,
      normalized: interpretation.normalized,
      capabilities: descriptor.capabilities,
      diagnostics: interpretation.diagnostics ?? [],
      provenance: descriptor.provenance
    };
    if (operation === "query") {
      if (request.query === void 0) throw new SeiError("E_QUERY_REQUIRED", "'query' is required.");
      if (adapter.query === void 0) {
        throw new SeiError(
          "E_QUERY_UNSUPPORTED",
          `Kind '${request.kind}' does not support semantic queries.`
        );
      }
      const result2 = {
        ...base,
        query_name: request.query.name,
        query_result: adapter.query(interpretation, request.query, adapterInput)
      };
      enforceDeadline(startedAt, limits.max_execution_ms);
      return finalizeResult(result2, limits);
    }
    if (operation === "convert") {
      if (request.convert === void 0) throw new SeiError("E_CONVERSION_REQUIRED", "'convert' is required.");
      if (adapter.convert === void 0) {
        throw new SeiError(
          "E_CONVERSION_UNSUPPORTED",
          `Kind '${request.kind}' does not support conversion.`
        );
      }
      const result2 = {
        ...base,
        conversion_target: request.convert.target_representation,
        converted: adapter.convert(interpretation, request.convert, adapterInput)
      };
      enforceDeadline(startedAt, limits.max_execution_ms);
      return finalizeResult(result2, limits);
    }
    const result = {
      ...base,
      ...operation === "validate" ? {} : { value: interpretation.value },
      ...interpretation.semantics === void 0 ? {} : { semantics: interpretation.semantics },
      ...interpretation.derived === void 0 ? {} : { derived: interpretation.derived }
    };
    enforceDeadline(startedAt, limits.max_execution_ms);
    return finalizeResult(result, limits);
  } catch (error) {
    return finalizeResult(failedResult(operation, input, asDiagnostic(error), request), limits);
  }
}

// src/core/worker-protocol.ts
init_define_SEI_BUNDLED_ENGINE_VERSIONS();
import { createHash } from "node:crypto";
var WORKER_PROTOCOL_VERSION = "sei.worker.v1";
function canonicalJson(value) {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map((item) => canonicalJson(item)).join(",")}]`;
  return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${canonicalJson(value[key])}`).join(",")}}`;
}
function requestCorrelationDigest(value) {
  return createHash("sha256").update(canonicalJson(value)).digest("hex");
}
function createWorkerResultEnvelope(request, result) {
  return {
    protocol_version: WORKER_PROTOCOL_VERSION,
    request_correlation: requestCorrelationDigest(request),
    result
  };
}

// src/core/worker.ts
if (parentPort === null) {
  throw new Error("SEI worker must run inside a worker thread.");
}
parentPort.postMessage(
  createWorkerResultEnvelope(workerData, interpret(workerData, defaultRegistry))
);
