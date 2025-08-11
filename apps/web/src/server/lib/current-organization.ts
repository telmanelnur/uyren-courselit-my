import { getServerSession } from "next-auth";
import { cookies } from "next/headers";
import { authOptions } from "@/lib/options";
import { prisma } from "./prisma";

/**
 * Server-side utility to get the current organization for the authenticated user
 * This can be used in server components and API routes
 */
export async function getCurrentOrganizationServer() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return null;
    }

    const cookieStore = await cookies();
    const currentOrgId = cookieStore.get("current-organization-id")?.value;

    if (!currentOrgId) {
      return null;
    }

    // Verify user still has access to this organization
    const membership = await prisma.organizationMembership.findFirst({
      where: {
        organizationId: parseInt(currentOrgId),
        userId: session.user.id,
      },
      include: {
        organization: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!membership) {
      return null;
    }

    return {
      id: membership.organization.id,
      name: membership.organization.name,
      role: membership.role,
    };
  } catch (error) {
    console.error("Error getting current organization:", error);
    return null;
  }
}

/**
 * Get the current organization ID only (for performance when only ID is needed)
 */
export async function getCurrentOrganizationId() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return null;
    }

    const cookieStore = await cookies();
    const currentOrgId = cookieStore.get("current-organization-id")?.value;

    if (!currentOrgId) {
      return null;
    }

    // Quick verification that user has access to this organization
    const membership = await prisma.organizationMembership.findFirst({
      where: {
        organizationId: parseInt(currentOrgId),
        userId: session.user.id,
      },
      select: {
        organizationId: true,
      },
    });

    return membership?.organizationId || null;
  } catch (error) {
    console.error("Error getting current organization ID:", error);
    return null;
  }
}
