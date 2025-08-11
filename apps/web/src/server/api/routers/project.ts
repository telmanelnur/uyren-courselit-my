import z from "zod";
import {
  AuthorizationException,
  NotFoundException,
  ResourceExistsException,
} from "../core/exceptions";
import { protectedProcedure, teacherProcedure } from "../core/procedures";
import { isAdmin } from "../core/roles";
import { getFormDataSchema, ListInputSchema } from "../core/schema";
import { router } from "../core/trpc";
import { like, orderBy, paginate } from "../core/utils";
import {
  documentIdValidator,
  documentSlugValidator,
  toSlug,
} from "../core/validators";

const CreateSchema = getFormDataSchema({
  slug: documentSlugValidator().transform(toSlug),
  name: z.string().min(1),
  description: z.string().optional(),
});

const UpdateSchema = getFormDataSchema({
  slug: documentSlugValidator().transform(toSlug).optional(),
  name: z.string().min(1).optional(),
  description: z.string().optional(),
}).extend({
  id: documentIdValidator(),
});

async function assertOwnerOrAdmin(ctx: any, ownerId: number) {
  if (isAdmin(ctx.user)) return;
  if (ctx.user!.id !== ownerId)
    throw new AuthorizationException("You are not the owner of this project");
}
async function ensureUniqueSlug(ctx: any, slug: string, excludeId?: number) {
  const e = await ctx.prisma.project.findFirst({
    where: { slug, ...(excludeId ? { id: { not: excludeId } } : {}) },
    select: { id: true },
  });
  if (e) throw new ResourceExistsException("Project", "slug", slug);
}

export const projectRouter = router({
  list: teacherProcedure
    .input(
      ListInputSchema.extend({
        filter: z
          .object({
            ownerId: documentIdValidator().optional(),
          })
          .optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const q = input?.search?.q;
      const where: any = {
        ...(input.filter?.ownerId ? { ownerId: input.filter.ownerId } : {}),
        ...(q ? { OR: [{ title: like(q) }, { slug: like(q) }] } : {}),
      };
      if (
        input.filter?.ownerId &&
        !isAdmin(ctx.session!.user) &&
        ctx.session!.user.id !== input.filter.ownerId
      )
        throw new AuthorizationException(
          "You are not allowed to view projects of other users",
        );

      const { skip, take } = paginate(input.pagination);
      const ob = orderBy(input.orderBy?.field, input.orderBy?.direction);
      const [items, total] = await Promise.all([
        ctx.prisma.project.findMany({ where, skip, take, orderBy: ob }),
        ctx.prisma.project.count({ where }),
      ]);
      return { items, total, meta: { skip, take } };
    }),

  getById: teacherProcedure
    .input(documentIdValidator())
    .query(async ({ ctx, input }) => {
      const row = await ctx.prisma.project.findUnique({
        where: { id: input },
      });
      if (!row) throw new NotFoundException("Project", String(input));
      await assertOwnerOrAdmin(ctx, row.ownerId);
      return row;
    }),

  create: protectedProcedure
    .input(CreateSchema)
    .mutation(async ({ ctx, input }) => {
      await ensureUniqueSlug(ctx, input.data.slug);
      return ctx.prisma.project.create({
        data: { ...input.data, ownerId: ctx.session!.user.id },
      });
    }),

  update: protectedProcedure
    .input(UpdateSchema)
    .mutation(async ({ ctx, input }) => {
      const row = await ctx.prisma.project.findUnique({
        where: { id: input.id },
        select: { ownerId: true },
      });
      if (!row) throw new NotFoundException("Project", String(input.id));
      await assertOwnerOrAdmin(ctx, row.ownerId);
      if (input.data.slug)
        await ensureUniqueSlug(ctx, input.data.slug, input.id);
      return ctx.prisma.project.update({
        where: { id: input.id },
        data: input.data,
      });
    }),

  delete: teacherProcedure
    .input(documentIdValidator())
    .mutation(async ({ input, ctx }) => {
      const row = await ctx.prisma.project.findUnique({
        where: { id: input },
        select: { ownerId: true },
      });
      if (!row) throw new NotFoundException("Project", String(input));
      await assertOwnerOrAdmin(ctx, row.ownerId);
      return ctx.prisma.project.delete({ where: { id: input } });
    }),

  protectedUserProjectList: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session!.user.id;
    return await ctx.prisma.project.findMany({
      where: { ownerId: userId },
    });
  }),

  protectedUserProjectDetailBySlug: protectedProcedure
    .input(documentSlugValidator())
    .query(async ({ input, ctx }) => {
      const row = await ctx.prisma.project.findUnique({
        where: { slug: input },
        include: {
          files: {
            orderBy: { createdAt: "desc" },
            select: {
              id: true,
            },
          },
          githubRepo: {
            select: {
              id: true,
              githubId: true,
              name: true,
              fullName: true,
              htmlUrl: true,
            },
          },
        },
      });
      if (!row) throw new NotFoundException("Project", String(input));
      await assertOwnerOrAdmin(ctx, row.ownerId);
      return row;
    }),

  protectedUserProjectFileList: protectedProcedure
    .input(documentIdValidator())
    .query(async ({ input, ctx }) => {
      const row = await ctx.prisma.project.findUnique({
        where: { id: input },
      });
      if (!row) throw new NotFoundException("Project", String(input));
      await assertOwnerOrAdmin(ctx, row.ownerId);
      return await ctx.prisma.projectFile.findMany({
        where: { projectId: row.id },
      });
    }),

  protectedSaveProjectFileContent: protectedProcedure
    .input(
      getFormDataSchema({
        content: z.string().optional(),
        name: z.string().min(1).max(255).optional(),
        language: z.string().optional(),
      }).extend({ id: documentIdValidator() }),
    )
    .mutation(async ({ input, ctx }) => {
      const row = await ctx.prisma.projectFile.findUnique({
        where: { id: input.id },
      });
      if (!row) throw new NotFoundException("Project File", String(input.id));
      const parentProject = await ctx.prisma.project.findUnique({
        where: { id: row.projectId },
      });
      if (!parentProject)
        throw new NotFoundException("Parent Project", row.projectId);
      await assertOwnerOrAdmin(ctx, parentProject.ownerId);
      return await ctx.prisma.projectFile.update({
        where: { id: row.id },
        data: input.data,
      });
    }),

  protectedAddProjectFile: protectedProcedure
    .input(
      getFormDataSchema({
        name: z.string().min(1).max(255),
        language: z.string().optional(),
        projectId: documentIdValidator(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const projectObj = await ctx.prisma.project.findUnique({
        where: { id: input.data.projectId },
      });
      if (!projectObj)
        throw new NotFoundException("Project", String(input.data.projectId));
      await assertOwnerOrAdmin(ctx, projectObj.ownerId);
      const newFile = await ctx.prisma.projectFile.create({
        data: {
          name: input.data.name,
          language: input.data.language,
          projectId: projectObj.id,
          path: "",
        },
      });
      const newPath = `Path:${projectObj.slug}/${newFile.id}`;
      return await ctx.prisma.projectFile.update({
        where: { id: newFile.id },
        data: { path: newPath },
      });
    }),

  protectedDeleteProjectFile: protectedProcedure
    .input(documentIdValidator())
    .mutation(async ({ input, ctx }) => {
      const row = await ctx.prisma.projectFile.findUnique({
        where: { id: input },
      });
      if (!row) throw new NotFoundException("Project File", String(input));
      const parentProject = await ctx.prisma.project.findUnique({
        where: { id: row.projectId },
      });
      if (!parentProject)
        throw new NotFoundException("Parent Project", row.projectId);
      await assertOwnerOrAdmin(ctx, parentProject.ownerId);
      return await ctx.prisma.projectFile.delete({
        where: { id: row.id },
      });
    }),

  protectedDeleteProject: protectedProcedure
    .input(documentIdValidator())
    .mutation(async ({ input, ctx }) => {
      const row = await ctx.prisma.project.findUnique({
        where: { id: input },
      });
      if (!row) throw new NotFoundException("Project", String(input));
      await assertOwnerOrAdmin(ctx, row.ownerId);
      return await ctx.prisma.project.delete({
        where: { id: row.id },
      });
    }),
});
