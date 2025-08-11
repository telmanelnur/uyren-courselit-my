import { VisibilityStatus } from "@/generated/prisma";
import {
  AuthorizationException,
  NotFoundException,
  ResourceExistsException,
} from "@/server/api/core/exceptions";
import { teacherProcedure } from "@/server/api/core/procedures";
import { isAdmin } from "@/server/api/core/roles";
import { getFormDataSchema, ListInputSchema } from "@/server/api/core/schema";
import { router } from "@/server/api/core/trpc";
import { like, orderBy, paginate } from "@/server/api/core/utils";
import {
  documentIdValidator,
  documentSlugValidator,
  toSlug,
} from "@/server/api/core/validators";
import { z } from "zod";

// Quiz schemas for when models are added to schema.prisma
const CreateSchema = getFormDataSchema({
  slug: documentSlugValidator().transform(toSlug),
  title: z.string().min(1).max(255),
  description: z.string().optional(),
  courseId: documentIdValidator().optional(),
  isPublished: z.boolean().default(false),
  visibility: z.nativeEnum(VisibilityStatus).default(VisibilityStatus.draft),
});

const UpdateSchema = getFormDataSchema({
  slug: documentSlugValidator().transform(toSlug).optional(),
  title: z.string().min(1).max(255).optional(),
  description: z.string().optional(),
  courseId: documentIdValidator().nullable().optional(),
  isPublished: z.boolean().optional(),
  visibility: z.nativeEnum(VisibilityStatus).optional(),
}).extend({
  id: documentIdValidator(),
});

const CreateQuizSettingsSchema = getFormDataSchema({
  shuffleQuestions: z.boolean().default(true),
  showResults: z.boolean().default(false),
  timeLimit: z.number().int().positive().optional(),
  maxAttempts: z.number().int().positive().default(1),
  passingScore: z.number().min(0).max(100).default(60.0),
  availableFrom: z.date().optional(),
  availableUntil: z.date().optional(),
}).extend({
  quizId: documentIdValidator(),
});

// Helper functions
async function assertQuizOwnerOrAdmin(ctx: any, ownerId: number | null) {
  if (isAdmin(ctx.user)) return;
  if (!ownerId || ctx.user!.id !== ownerId)
    throw new AuthorizationException("You are not the owner of this quiz");
}

async function ensureUniqueQuizSlug(
  ctx: any,
  slug: string,
  excludeId?: number,
) {
  const existing = await ctx.prisma.quiz.findFirst({
    where: { slug, ...(excludeId ? { id: { not: excludeId } } : {}) },
    select: { id: true },
  });
  if (existing) throw new ResourceExistsException("Quiz", "slug", slug);
}

export const quizRouter = router({
  list: teacherProcedure
    .input(
      ListInputSchema.extend({
        filter: z
          .object({
            ownerId: documentIdValidator().optional(),
            courseId: documentIdValidator().optional(),
            visibility: z.nativeEnum(VisibilityStatus).optional(),
            isPublished: z.boolean().optional(),
          })
          .optional()
          .default({}),
      }),
    )
    .query(async ({ ctx, input }) => {
      const filter = input.filter || {};
      const q = input?.search?.q;
      const where: any = {
        ...(filter.ownerId
          ? { ownerId: filter.ownerId }
          : { ownerId: ctx.user.id }),
        ...(filter.courseId ? { courseId: filter.courseId } : {}),
        ...(filter.visibility ? { visibility: filter.visibility } : {}),
        ...(filter.isPublished !== undefined
          ? { isPublished: filter.isPublished }
          : {}),
        ...(q
          ? {
              OR: [
                { title: like(q) },
                { slug: like(q) },
                { description: like(q) },
              ],
            }
          : {}),
      };
      if (
        filter.ownerId &&
        !isAdmin(ctx.user) &&
        ctx.user!.id !== filter.ownerId
      ) {
        throw new AuthorizationException(
          "You do not have permission to access this user's quizzes",
        );
      }
      const { skip, take } = paginate(input.pagination);
      const ob = orderBy(input.orderBy?.field, input.orderBy?.direction);

      const [items, total] = await Promise.all([
        ctx.prisma.quiz.findMany({
          where,
          skip,
          take,
          orderBy: ob,
          include: {
            quizSettings: true,
            _count: {
              select: {
                questions: true,
                attempts: true,
              },
            },
          },
        }),
        ctx.prisma.quiz.count({ where }),
      ]);

      return { items, total, meta: { skip, take } };
    }),

  getById: teacherProcedure
    .input(documentIdValidator())
    .query(async ({ ctx, input }) => {
      const row = await ctx.prisma.quiz.findUnique({
        where: { id: input },
        include: {
          quizSettings: true,
          questions: {
            include: {
              multipleChoiceOptions: {
                orderBy: { position: "asc" },
              },
            },
            orderBy: { position: "asc" },
          },
          _count: {
            select: {
              attempts: true,
            },
          },
        },
      });
      if (!row) throw new NotFoundException("Quiz", String(input));
      await assertQuizOwnerOrAdmin(ctx, row.ownerId);
      return row;
    }),

  create: teacherProcedure
    .input(CreateSchema)
    .mutation(async ({ ctx, input }) => {
      await ensureUniqueQuizSlug(ctx, input.data.slug);
      return ctx.prisma.quiz.create({
        data: { ...input.data, ownerId: ctx.user!.id },
        include: {
          quizSettings: true,
          _count: {
            select: {
              questions: true,
            },
          },
        },
      });
    }),

  update: teacherProcedure
    .input(UpdateSchema)
    .mutation(async ({ ctx, input }) => {
      const row = await ctx.prisma.quiz.findUnique({
        where: { id: input.id },
        select: { ownerId: true, slug: true },
      });
      if (!row) throw new NotFoundException("Quiz", String(input.id));
      await assertQuizOwnerOrAdmin(ctx, row.ownerId);
      if (input.data.slug && input.data.slug !== row.slug)
        await ensureUniqueQuizSlug(ctx, input.data.slug, input.id);
      return ctx.prisma.quiz.update({
        where: { id: input.id },
        data: input.data,
        include: {
          quizSettings: true,
          _count: {
            select: {
              questions: true,
            },
          },
        },
      });
    }),

  delete: teacherProcedure
    .input(documentIdValidator())
    .mutation(async ({ ctx, input }) => {
      const row = await ctx.prisma.quiz.findUnique({
        where: { id: input },
        select: { ownerId: true },
      });
      if (!row) throw new NotFoundException("Quiz", String(input));
      await assertQuizOwnerOrAdmin(ctx, row.ownerId);
      return ctx.prisma.quiz.delete({ where: { id: input } });
    }),

  updateSettings: teacherProcedure
    .input(CreateQuizSettingsSchema)
    .mutation(async ({ ctx, input }) => {
      // Verify quiz ownership
      const quiz = await ctx.prisma.quiz.findUnique({
        where: { id: input.quizId },
        select: { ownerId: true },
      });
      if (!quiz) throw new NotFoundException("Quiz", String(input.quizId));
      await assertQuizOwnerOrAdmin(ctx, quiz.ownerId);

      return ctx.prisma.quizSettings.upsert({
        where: { quizId: input.quizId },
        update: input.data,
        create: { ...input.data, quizId: input.quizId },
      });
    }),

  getAttempts: teacherProcedure
    .input(
      z.object({
        quizId: documentIdValidator(),
        pagination: z
          .object({
            skip: z.number().default(0),
            take: z.number().default(20),
          })
          .optional(),
        orderBy: z
          .object({
            field: z.string().default("startedAt"),
            direction: z.enum(["asc", "desc"]).default("desc"),
          })
          .optional(),
        search: z.object({ q: z.string().trim().optional() }).optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      // Verify quiz ownership
      const quiz = await ctx.prisma.quiz.findUnique({
        where: { id: input.quizId },
        select: { ownerId: true },
      });
      if (!quiz) throw new NotFoundException("Quiz", String(input.quizId));
      await assertQuizOwnerOrAdmin(ctx, quiz.ownerId);

      const { skip, take } = paginate(input.pagination);
      const ob = orderBy(input.orderBy?.field, input.orderBy?.direction);

      const [items, total] = await Promise.all([
        ctx.prisma.quizAttempt.findMany({
          where: { quizId: input.quizId },
          skip,
          take,
          orderBy: ob,
        }),
        ctx.prisma.quizAttempt.count({ where: { quizId: input.quizId } }),
      ]);

      return { items, total, meta: { skip, take } };
    }),

  getStatistics: teacherProcedure
    .input(documentIdValidator())
    .query(async ({ ctx, input }) => {
      // Verify quiz ownership
      const quiz = await ctx.prisma.quiz.findUnique({
        where: { id: input },
        select: { ownerId: true },
      });
      if (!quiz) throw new NotFoundException("Quiz", String(input));
      await assertQuizOwnerOrAdmin(ctx, quiz.ownerId);

      const attempts = await ctx.prisma.quizAttempt.findMany({
        where: { quizId: input },
        select: { score: true, isPassed: true, status: true },
      });

      const totalAttempts = attempts.length;
      const completedAttempts = attempts.filter(
        (a) => a.status === "SUBMITTED" || a.status === "GRADED",
      ).length;
      const scores = attempts
        .filter((a) => a.score !== null)
        .map((a) => a.score!);
      const averageScore =
        scores.length > 0
          ? scores.reduce((a, b) => a + b, 0) / scores.length
          : 0;
      const passedAttempts = attempts.filter((a) => a.isPassed === true).length;
      const passRate =
        totalAttempts > 0 ? (passedAttempts / totalAttempts) * 100 : 0;

      return {
        totalAttempts,
        completedAttempts,
        averageScore,
        passedAttempts,
        passRate,
        quizId: input,
      };
    }),
});
