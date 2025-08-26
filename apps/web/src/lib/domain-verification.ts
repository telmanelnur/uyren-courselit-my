import { DomainManager } from "./domain";
import { Domain } from "@/models/Domain";

export interface DomainVerificationResult {
  success: boolean;
  domain?: Domain;
  error?: string;
  status?: number;
}

/**
 * Verifies a domain from a host string
 * @param host - The host string to verify
 * @returns Promise with verification result
 */
export async function verifyDomainFromHost(
  host: string,
): Promise<DomainVerificationResult> {
  try {
    if (!host) {
      return {
        success: false,
        error: "Host is required",
        status: 400,
      };
    }

    const domain = await DomainManager.getDomainByHost(host);

    if (!domain) {
      return {
        success: false,
        error: "Domain not found",
        status: 404,
      };
    }

    return {
      success: true,
      domain,
    };
  } catch (error) {
    console.error("Domain verification error:", error);
    return {
      success: false,
      error: "Internal server error",
      status: 500,
    };
  }
}
