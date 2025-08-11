import { z } from "zod";
import {
  NotFoundException,
  ResourceExistsException,
} from "../../core/exceptions";
import { adminProcedure } from "../../core/procedures";
import { getFormDataSchema, ListInputSchema } from "../../core/schema";
import { router } from "../../core/trpc";
import { like, orderBy, paginate } from "../../core/utils";
import { documentIdValidator } from "../../core/validators";

const CreateTenantSchema = getFormDataSchema({
  name: z.string().min(1, "Tenant name is required"),
  subdomain: z
    .string()
    .min(1, "Subdomain is required")
    .regex(
      /^[a-z0-9-]+$/,
      "Subdomain must only contain lowercase letters, numbers, and hyphens",
    ),
  organizationId: documentIdValidator(),
});

const UpdateTenantSchema = getFormDataSchema({
  name: z.string().min(1, "Tenant name is required").optional(),
  subdomain: z
    .string()
    .min(1, "Subdomain is required")
    .regex(
      /^[a-z0-9-]+$/,
      "Subdomain must only contain lowercase letters, numbers, and hyphens",
    )
    .optional(),
}).extend({
  id: documentIdValidator(),
});

async function ensureUniqueNameAndSubdomain(
  ctx: any,
  name: string,
  subdomain: string,
  excludeId?: number,
) {
  const existing = await ctx.prisma.tenant.findFirst({
    where: {
      OR: [{ name }, { subdomain }],
      ...(excludeId ? { id: { not: excludeId } } : {}),
    },
    select: { id: true, name: true, subdomain: true },
  });

  if (existing) {
    if (existing.name === name) {
      throw new ResourceExistsException("Tenant", "name", name);
    } else {
      throw new ResourceExistsException("Tenant", "subdomain", subdomain);
    }
  }
}

export const tenantsRouter = router({
  list: adminProcedure
    .input(
      ListInputSchema.extend({
        filter: z.object({
          name: z.string().optional(),
          organizationId: documentIdValidator().optional(),
        }),
      }),
    )
    .query(async ({ ctx, input }) => {
      const q = input?.search?.q;
      const where: any = {
        ...(input.filter.name ? { name: like(input.filter.name) } : {}),
        ...(input.filter.organizationId
          ? { organizationId: input.filter.organizationId }
          : {}),
        ...(q
          ? {
              OR: [{ name: like(q) }, { subdomain: like(q) }],
            }
          : {}),
      };

      const { skip, take } = paginate(input.pagination);
      const ob = orderBy(input.orderBy?.field, input.orderBy?.direction);

      const [items, total] = await Promise.all([
        ctx.prisma.tenant.findMany({
          where,
          skip,
          take,
          orderBy: ob,
          include: {
            organization: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        }),
        ctx.prisma.tenant.count({ where }),
      ]);

      return { items, total, meta: { skip, take } };
    }),

  getById: adminProcedure
    .input(documentIdValidator())
    .query(async ({ ctx, input }) => {
      const tenant = await ctx.prisma.tenant.findUnique({
        where: { id: input },
        include: {
          organization: {
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
          },
        },
      });

      if (!tenant) throw new NotFoundException("Tenant", String(input));

      return tenant;
    }),

  create: adminProcedure
    .input(CreateTenantSchema)
    .mutation(async ({ ctx, input }) => {
      await ensureUniqueNameAndSubdomain(
        ctx,
        input.data.name,
        input.data.subdomain,
      );

      const tenant = await ctx.prisma.tenant.create({
        data: input.data,
        include: {
          organization: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      return tenant;
    }),

  update: adminProcedure
    .input(UpdateTenantSchema)
    .mutation(async ({ ctx, input }) => {
      const tenant = await ctx.prisma.tenant.findUnique({
        where: { id: input.id },
        select: { id: true, organizationId: true, name: true, subdomain: true },
      });

      if (!tenant) throw new NotFoundException("Tenant", String(input.id));

      if (input.data.name || input.data.subdomain) {
        await ensureUniqueNameAndSubdomain(
          ctx,
          input.data.name || tenant.name,
          input.data.subdomain || tenant.subdomain,
          input.id,
        );
      }

      return ctx.prisma.tenant.update({
        where: { id: input.id },
        data: input.data,
        include: {
          organization: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });
    }),

  delete: adminProcedure
    .input(documentIdValidator())
    .mutation(async ({ ctx, input }) => {
      const tenant = await ctx.prisma.tenant.findUnique({
        where: { id: input },
        select: { id: true, organizationId: true },
      });

      if (!tenant) throw new NotFoundException("Tenant", String(input));

      return ctx.prisma.tenant.delete({ where: { id: input } });
    }),

  getByOrganization: adminProcedure
    .input(documentIdValidator())
    .query(async ({ ctx, input }) => {
      return ctx.prisma.tenant.findMany({
        where: { organizationId: input },
        include: {
          organization: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });
    }),
});
