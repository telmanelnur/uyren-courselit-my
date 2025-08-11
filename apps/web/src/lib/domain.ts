import DomainModel, { type Domain } from "@/models/Domain";
import { connectToDatabase } from "@workspace/common-logic";
import { headers } from "next/headers";
import { redis } from "../server/lib/redis";
import { parseHost } from "./domain-utils";
import { Log } from "./logger";
export {
  analyzeDomain,
  cleanHost,
  extractSubdomain,
  isCustomDomain,
  parseHost,
} from "./domain-utils";

/**
 * Get domain headers info (lightweight - no DB calls)
 */
export async function getDomainHeaders() {
  const headersList = await headers();

  return {
    type: (headersList.get("x-domain-type") || "localhost") as
      | "localhost"
      | "subdomain"
      | "custom",
    host: headersList.get("x-domain-host") || "",
    identifier: headersList.get("x-domain-identifier"),
  };
}

/**
 * Get full domain data (includes database lookup)
 */
export async function getDomainData(
  defaultHeaders?: Awaited<ReturnType<typeof getDomainHeaders>>
) {
  const domainHeaders = defaultHeaders || (await getDomainHeaders());
  let domainObj: Domain | null = null;

  try {
    if (domainHeaders.identifier === "main") {
      domainObj = await DomainManager.getDomainByName(domainHeaders.identifier);
    } else if (domainHeaders.type === "subdomain" && domainHeaders.identifier) {
      domainObj = await DomainManager.getDomainByName(domainHeaders.identifier);
    } else if (domainHeaders.type === "custom" && domainHeaders.identifier) {
      domainObj = await DomainManager.getDomainByCustomDomain(
        domainHeaders.identifier
      );
    }
  } catch (error) {
    console.warn("[getDomainData] Domain lookup failed:", error);
  }

  return {
    headers: domainHeaders,
    domainObj,
  };
}

/**
 * Simplified Domain management with Redis caching
 */
export class DomainManager {
  private static readonly CACHE_TTL = 3600;
  private static readonly CACHE_PREFIX = "domain:";

  static async getDomainByHost(host: string): Promise<Domain | null> {
    const { cleanHost: clean, subdomain } = parseHost(host);
    if (!clean) return null;

    // Check subdomain pattern
    if (subdomain) {
      const domain = await this.getDomainByName(subdomain);
      if (domain) return domain;
    }

    // Check custom domain
    return await this.getDomainByCustomDomain(clean);
  }

  static async getDomainByName(name: string) {
    const cacheKey = `${this.CACHE_PREFIX}name:${name}`;

    try {
      const cached = await redis.get(cacheKey);
      if (cached) {
        return JSON.parse(cached) as Domain;
      }
    } catch (error) {
      // Log.info("[getDomainByName] Redis miss:", error);
    }

    await connectToDatabase();
    const domain = await DomainModel.findOne({ name, deleted: false });

    if (domain) {
      const domainObj = domain.toObject();
      await this.cache(domainObj);
      return domainObj;
    }

    return null;
  }

  static async getDomainByCustomDomain(
    customDomain: string
  ): Promise<Domain | null> {
    const cacheKey = `${this.CACHE_PREFIX}custom:${customDomain}`;

    try {
      const cached = await redis.get(cacheKey);
      if (cached) {
        return JSON.parse(cached) as Domain;
      }
    } catch (error) {
      // Log.info("[getDomainByName] Redis miss:", error);
    }

    await connectToDatabase();
    const domain = await DomainModel.findOne({ customDomain, deleted: false });

    if (domain) {
      const domainObj = domain.toObject();
      await this.cache(domainObj);
      return domainObj;
    }

    return null;
  }

  static async updateDomain(
    id: string,
    updates: Partial<Domain>
  ): Promise<Domain | null> {
    await connectToDatabase();

    const domain = await DomainModel.findByIdAndUpdate(id, updates, {
      new: true,
    });

    if (domain) {
      const domainObj = domain.toObject();
      await this.cache(domainObj);
      return domainObj;
    }

    return null;
  }

  static async deleteDomain(id: string): Promise<boolean> {
    await connectToDatabase();

    const domain = await DomainModel.findByIdAndUpdate(
      id,
      { deleted: true },
      { new: true }
    );

    if (domain) {
      await this.removeFromCache(domain.toObject());
      return true;
    }

    return false;
  }

  private static async cache(domain: Domain): Promise<void> {
    try {
      const promises = [];
      const domainJson = JSON.stringify(domain);

      if (domain.name) {
        promises.push(
          redis.setex(
            `${this.CACHE_PREFIX}name:${domain.name}`,
            this.CACHE_TTL,
            domainJson
          )
        );
      }

      if (domain.customDomain) {
        promises.push(
          redis.setex(
            `${this.CACHE_PREFIX}custom:${domain.customDomain}`,
            this.CACHE_TTL,
            domainJson
          )
        );
      }

      await Promise.all(promises);
    } catch (error) {
      Log.error("[cache] Redis caching failed: " + error);
    }
  }

  private static async removeFromCache(domain: Domain): Promise<void> {
    try {
      const keys = [`${this.CACHE_PREFIX}id:${domain._id}`];

      if (domain.name) {
        keys.push(`${this.CACHE_PREFIX}name:${domain.name}`);
      }

      if (domain.customDomain) {
        keys.push(`${this.CACHE_PREFIX}custom:${domain.customDomain}`);
      }

      await redis.del(...keys);
    } catch (error) {
      Log.error("[removeFromCache] Cache removal failed: " + error);
    }
  }
}

export default DomainManager;
