import DomainManager, { getDomainHeaders } from "@/lib/domain";
import DomainModel, { type Domain } from "@/models/Domain";
import { connectToDatabase } from "@workspace/common-logic";
import { SiteInfo } from "@workspace/common-models";
import { cache } from "react";

/**
 * Resolve the active domain using Redis first, then DB, with explicit [DEBUG] logs.
 * Returns the full Domain object when available, otherwise null.
 */
async function resolveDomain(): Promise<Domain | null> {
  const headers = await getDomainHeaders();

  // Determine cache key based on header type/identifier
  const identifier = headers.identifier || "";

  let domain: Domain | null = null;
  if (identifier === "main") {
    domain = await DomainManager.getDomainByName(identifier);
  } else if (headers.type === "subdomain" && identifier) {
    domain = await DomainManager.getDomainByName(identifier);
  } else if (headers.type === "custom" && identifier) {
    domain = await DomainManager.getDomainByCustomDomain(identifier);
  } else {
    throw new Error("No domain found");
  }
  return (domain as any) || null;
}

/**
 * Server-side site info fetcher
 * - Uses Redis-first domain resolution with clear [DEBUG] logs
 * - Memoized per-request via React cache() to avoid duplicate Redis/DB calls
 */
export const getSiteInfo = cache(async (): Promise<SiteInfo | undefined> => {
  const domain = await resolveDomain();
  if (!domain) return undefined;
  return (domain.settings as SiteInfo) || undefined;
});
