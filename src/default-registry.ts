import { CidrAdapter } from "./adapters/cidr.js";
import { ContentTypeAdapter } from "./adapters/content-type.js";
import { CronAdapter } from "./adapters/cron.js";
import { IsoDurationAdapter } from "./adapters/iso-duration.js";
import { RruleAdapter } from "./adapters/rrule.js";
import { SemverRangeAdapter } from "./adapters/semver-range.js";
import { UnixPermissionAdapter } from "./adapters/unix-permission.js";
import { UriAdapter } from "./adapters/uri.js";
import { ExpressionRegistry } from "./core/registry.js";

export function createDefaultRegistry(): ExpressionRegistry {
  return new ExpressionRegistry()
    .register(new CronAdapter())
    .register(new SemverRangeAdapter())
    .register(new CidrAdapter())
    .register(new UriAdapter())
    .register(new ContentTypeAdapter())
    .register(new IsoDurationAdapter())
    .register(new RruleAdapter())
    .register(new UnixPermissionAdapter());
}

export const defaultRegistry = createDefaultRegistry().seal();
