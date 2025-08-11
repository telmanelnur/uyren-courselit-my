import { z } from "zod";
import {
  NotFoundException,
  ResourceExistsException,
} from "../../core/exceptions";
import { adminProcedure, protectedProcedure } from "../../core/procedures";
import { getFormDataSchema, ListInputSchema } from "../../core/schema";
import { router } from "../../core/trpc";
import { like, orderBy, paginate } from "../../core/utils";
import { documentIdValidator } from "../../core/validators";

const CreateOrganizationSchema = getFormDataSchema({
  name: z.string().min(1, "Organization name is required").max(255),
});

const UpdateOrganizationSchema = getFormDataSchema({
  name: z.string().min(1, "Organization name is required").max(255).optional(),
}).extend({
  id: documentIdValidator(),
});

const MembershipSchema = z.object({
  organizationId: documentIdValidator(),
  userId: documentIdValidator(),
  role: z.enum(["OWNER", "MEMBER"]),
});

const UpdateMembershipSchema = z.object({
  organizationId: documentIdValidator(),
  userId: documentIdValidator(),
  role: z.enum(["OWNER", "MEMBER"]),
});

async function ensureUniqueName(ctx: any, name: string, excludeId?: number) {
  const existing = await ctx.prisma.organization.findFirst({
    where: { name, ...(excludeId ? { id: { not: excludeId } } : {}) },
    select: { id: true },
  });
  if (existing) throw new ResourceExistsException("Organization", "name", name);
}

export const orgsRouter = router({
  list: adminProcedure
    .input(
      ListInputSchema.extend({
        filter: z.object({
          name: z.string().optional(),
        }),
      }),
    )
    .query(async ({ ctx, input }) => {
      const q = input?.search?.q;
      const where: any = {
        ...(input.filter.name ? { name: like(input.filter.name) } : {}),
        ...(q ? { name: like(q) } : {}),
      };

      const { skip, take } = paginate(input.pagination);
      const ob = orderBy(input.orderBy?.field, input.orderBy?.direction);

      const [items, total] = await Promise.all([
        ctx.prisma.organization.findMany({
          where,
          skip,
          take,
          orderBy: ob,
          include: {
            memberships: {
              include: {
                user: {
                  select: {
                    id: true,
                    username: true,
                    email: true,
                  },
                },
              },
            },
            _count: {
              select: {
                memberships: true,
                tenants: true,
              },
            },
          },
        }),
        ctx.prisma.organization.count({ where }),
      ]);

      return { items, total, meta: { skip, take } };
    }),

  getById: adminProcedure
    .input(documentIdValidator())
    .query(async ({ ctx, input }) => {
      const organization = await ctx.prisma.organization.findUnique({
        where: { id: input },
        include: {
          memberships: {
            include: {
              user: {
                select: {
                  id: true,
                  username: true,
                  email: true,
                  role: true,
                },
              },
            },
          },
          _count: {
            select: {
              memberships: true,
              tenants: true,
            },
          },
        },
      });

      if (!organization)
        throw new NotFoundException("Organization", String(input));

      return organization;
    }),

  create: adminProcedure
    .input(CreateOrganizationSchema)
    .mutation(async ({ ctx, input }) => {
      await ensureUniqueName(ctx, input.data.name);

      const organization = await ctx.prisma.organization.create({
        data: input.data,
        include: {
          memberships: {
            include: {
              user: {
                select: {
                  id: true,
                  username: true,
                  email: true,
                },
              },
            },
          },
        },
      });

      // Add current user as owner of the organization
      await ctx.prisma.organizationMembership.create({
        data: {
          organizationId: organization.id,
          userId: ctx.user!.id,
          role: "OWNER",
        },
      });

      return organization;
    }),

  update: adminProcedure
    .input(UpdateOrganizationSchema)
    .mutation(async ({ ctx, input }) => {
      const organization = await ctx.prisma.organization.findUnique({
        where: { id: input.id },
        select: { id: true },
      });

      if (!organization)
        throw new NotFoundException("Organization", String(input.id));

      if (input.data.name) {
        await ensureUniqueName(ctx, input.data.name, input.id);
      }

      return ctx.prisma.organization.update({
        where: { id: input.id },
        data: input.data,
        include: {
          memberships: {
            include: {
              user: {
                select: {
                  id: true,
                  username: true,
                  email: true,
                },
              },
            },
          },
        },
      });
    }),

  delete: adminProcedure
    .input(documentIdValidator())
    .mutation(async ({ ctx, input }) => {
      const organization = await ctx.prisma.organization.findUnique({
        where: { id: input },
        select: { id: true },
      });

      if (!organization)
        throw new NotFoundException("Organization", String(input));

      return ctx.prisma.organization.delete({ where: { id: input } });
    }),

  // Membership management
  addMember: adminProcedure
    .input(MembershipSchema)
    .mutation(async ({ ctx, input }) => {
      // Check if membership already exists
      const existing = await ctx.prisma.organizationMembership.findUnique({
        where: {
          userId_organizationId: {
            userId: input.userId,
            organizationId: input.organizationId,
          },
        },
      });

      if (existing) {
        throw new ResourceExistsException(
          "Membership",
          "user",
          String(input.userId),
        );
      }

      return ctx.prisma.organizationMembership.create({
        data: input,
        include: {
          user: {
            select: {
              id: true,
              username: true,
              email: true,
            },
          },
          organization: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });
    }),

  updateMember: adminProcedure
    .input(UpdateMembershipSchema)
    .mutation(async ({ ctx, input }) => {
      const membership = await ctx.prisma.organizationMembership.findUnique({
        where: {
          userId_organizationId: {
            userId: input.userId,
            organizationId: input.organizationId,
          },
        },
      });

      if (!membership) {
        throw new NotFoundException(
          "Membership",
          `${input.userId}-${input.organizationId}`,
        );
      }

      return ctx.prisma.organizationMembership.update({
        where: {
          userId_organizationId: {
            userId: input.userId,
            organizationId: input.organizationId,
          },
        },
        data: { role: input.role },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              email: true,
            },
          },
          organization: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });
    }),

  removeMember: adminProcedure
    .input(
      z.object({
        organizationId: documentIdValidator(),
        userId: documentIdValidator(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const membership = await ctx.prisma.organizationMembership.findUnique({
        where: {
          userId_organizationId: {
            userId: input.userId,
            organizationId: input.organizationId,
          },
        },
      });

      if (!membership) {
        throw new NotFoundException(
          "Membership",
          `${input.userId}-${input.organizationId}`,
        );
      }

      return ctx.prisma.organizationMembership.delete({
        where: {
          userId_organizationId: {
            userId: input.userId,
            organizationId: input.organizationId,
          },
        },
      });
    }),

  getMembers: adminProcedure
    .input(documentIdValidator())
    .query(async ({ ctx, input }) => {
      const organization = await ctx.prisma.organization.findUnique({
        where: { id: input },
        select: { id: true },
      });

      if (!organization)
        throw new NotFoundException("Organization", String(input));

      return ctx.prisma.organizationMembership.findMany({
        where: { organizationId: input },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              email: true,
              role: true,
              createdAt: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });
    }),

  // Protected procedure for users to get their organizations for switching
  protectedOrganizationSwitchList: protectedProcedure.query(async ({ ctx }) => {
    const organizations = await ctx.prisma.organization.findMany({
      where: {
        memberships: {
          some: {
            userId: ctx.user!.id,
          },
        },
      },
      select: {
        id: true,
        name: true,
        memberships: {
          where: {
            userId: ctx.user!.id,
          },
          select: {
            role: true,
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    });
    return organizations.map((org) => ({
      id: org.id,
      name: org.name || `Organization ${org.id}`,
      role: org.memberships[0]?.role || "MEMBER",
    }));
  }),

  // Get current organization context for the authenticated user
  getCurrentContext: protectedProcedure.query(async ({ ctx }) => {
    try {
      // This will use the helper function we created
      const { getCurrentOrganizationFromContext } = await import(
        "../../core/organization"
      );
      const orgContext = await getCurrentOrganizationFromContext(ctx);

      if (!orgContext) {
        return null;
      }

      // Get additional organization details
      const organization = await ctx.prisma.organization.findUnique({
        where: { id: orgContext.organizationId },
        include: {
          tenants: {
            where: { id: orgContext.tenantId || undefined },
            select: { id: true, name: true, subdomain: true },
          },
          _count: {
            select: {
              memberships: true,
              tenants: true,
            },
          },
        },
      });

      if (!organization) {
        return null;
      }

      return {
        organization: {
          id: organization.id,
          name: organization.name,
          memberCount: organization._count.memberships,
          tenantCount: organization._count.tenants,
        },
        tenant: orgContext.tenantId ? organization.tenants[0] : null,
        role: orgContext.role,
      };
    } catch (error) {
      console.error("Error getting organization context:", error);
      return null;
    }
  }),
});
