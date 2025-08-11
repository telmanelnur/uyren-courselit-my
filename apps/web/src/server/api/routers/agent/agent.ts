import { z } from "zod";
import {
  AuthorizationException,
  NotFoundException,
} from "../../core/exceptions";
import { teacherProcedure } from "../../core/procedures";
import { isAdmin } from "../../core/roles";
import { getFormDataSchema, ListInputSchema } from "../../core/schema";
import { router } from "../../core/trpc";
import { like, orderBy, paginate } from "../../core/utils";
import { documentIdValidator } from "../../core/validators";

const CreateSchema = getFormDataSchema({
  name: z.string().min(1),
  scope: z.enum(["PUBLIC", "USER"]).default("USER"),
  provider: z.string().min(1),
  model: z.string().min(1),
  baseUrl: z.url().optional(),
  apiKey: z.string().min(1).optional(),
});

const UpdateSchema = getFormDataSchema({
  name: z.string().min(1).optional(),
  scope: z.enum(["PUBLIC", "USER"]).optional(),
  provider: z.string().min(1).optional(),
  model: z.string().min(1).optional(),
  baseUrl: z.url().optional(),
  rotateApiKey: z.string().min(1).optional(),
}).extend({
  id: documentIdValidator(),
});

async function assertAgentOwnerOrAdmin(
  ctx: any,
  ownerId?: number | null,
  scope?: "PUBLIC" | "USER",
) {
  if (isAdmin(ctx.user)) return;
  if (scope === "PUBLIC")
    throw new AuthorizationException("Cannot access PUBLIC agents as USER");
  if (!ownerId || ownerId !== ctx.user!.id)
    throw new AuthorizationException(
      "You do not have permission to access this agent",
    );
}

export const agentRouter = router({
  list: teacherProcedure
    .input(
      ListInputSchema.extend({
        filter: z.object({
          scope: z.enum(["PUBLIC", "USER"]).optional(),
        }),
      }),
    )
    .query(async ({ ctx, input }) => {
      const q = input?.search?.q;
      const where: any = {
        ...(input.filter.scope ? { scope: input.filter.scope } : {}),
        ...(q
          ? {
              OR: [
                { name: like(q) },
                { provider: like(q) },
                { model: like(q) },
              ],
            }
          : {}),
        // show my USER agents + all PUBLIC
        OR: [
          ...(q
            ? [{ name: like(q) }, { provider: like(q) }, { model: like(q) }]
            : []),
          { scope: "PUBLIC" },
          { ownerId: ctx.user!.id },
        ],
      };
      const { skip, take } = paginate(input.pagination);
      const ob = orderBy(input.orderBy?.field, input.orderBy?.direction);
      const [items, total] = await Promise.all([
        ctx.prisma.agent.findMany({
          where,
          skip,
          take,
          orderBy: ob,
          include: {
            owner: {
              select: { id: true, email: true, username: true },
            },
          },
        }),
        ctx.prisma.agent.count({ where }),
      ]);
      return { items, total, meta: { skip, take } };
    }),

  getById: teacherProcedure
    .input(documentIdValidator())
    .query(async ({ ctx, input }) => {
      const row = await ctx.prisma.agent.findUnique({
        where: { id: input },
      });
      if (!row) throw new NotFoundException("Agent", String(input));
      await assertAgentOwnerOrAdmin(ctx, row.ownerId, row.scope);
      return row;
    }),

  create: teacherProcedure
    .input(CreateSchema)
    .mutation(async ({ ctx, input }) => {
      if (input.data.scope === "PUBLIC" && !isAdmin(ctx.user))
        throw new AuthorizationException(
          "Only admins can create PUBLIC agents",
        );
      return ctx.prisma.agent.create({
        data: {
          ...input.data,
          ownerId: input.data.scope === "USER" ? ctx.user!.id : null,
          secret: input.data.apiKey
            ? { create: { apiKey: input.data.apiKey } }
            : undefined,
        },
      });
    }),

  update: teacherProcedure
    .input(UpdateSchema)
    .mutation(async ({ ctx, input }) => {
      const row = await ctx.prisma.agent.findUnique({
        where: { id: input.id },
      });
      if (!row) throw new NotFoundException("Agent", String(input.id));
      await assertAgentOwnerOrAdmin(ctx, row.ownerId, row.scope);
      const { rotateApiKey, ...rest } = input.data;
      return ctx.prisma.agent.update({
        where: { id: input.id },
        data: {
          ...rest,
          secret: rotateApiKey
            ? {
                upsert: {
                  create: { apiKey: rotateApiKey },
                  update: { apiKey: rotateApiKey },
                },
              }
            : undefined,
        },
      });
    }),

  delete: teacherProcedure
    .input(documentIdValidator())
    .mutation(async ({ ctx, input }) => {
      const row = await ctx.prisma.agent.findUnique({
        where: { id: input },
      });
      if (!row) throw new NotFoundException("Agent", String(input));
      await assertAgentOwnerOrAdmin(ctx, row.ownerId, row.scope);
      return ctx.prisma.agent.delete({ where: { id: input } });
    }),
});
