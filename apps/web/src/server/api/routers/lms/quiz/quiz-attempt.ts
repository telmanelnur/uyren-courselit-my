import { QuizAttemptModel } from "@/models/lms";
import { AuthorizationException, NotFoundException } from "@/server/api/core/exceptions";
import { createDomainRequiredMiddleware, createPermissionMiddleware, protectedProcedure } from "@/server/api/core/procedures";
import { ListInputSchema } from "@/server/api/core/schema";
import { router } from "@/server/api/core/trpc";
import { documentIdValidator } from "@/server/api/core/validators";
import { UIConstants } from "@workspace/common-models";
import { RootFilterQuery } from "mongoose";
import { z } from "zod";

const { permissions } = UIConstants;

const CreateQuizAttemptSchema = z.object({
  quizId: z.string().min(1),
  status: z.enum(["in_progress", "completed", "abandoned", "graded"]).default("in_progress"),
  startedAt: z.date().optional(),
  expiresAt: z.date().optional(),
});

const UpdateQuizAttemptSchema = CreateQuizAttemptSchema.partial();

const QuizAttemptListInputSchema = ListInputSchema.extend({
  filter: z.object({
    quizId: z.string().optional(),
    userId: z.string().optional(),
    status: z.enum(["in_progress", "completed", "abandoned", "graded"]).optional(),
  }).optional(),
});

export const quizAttemptRouter = router({
  create: protectedProcedure
    .use(createDomainRequiredMiddleware())
    .use(createPermissionMiddleware([permissions.manageAnyCourse]))
    .input(CreateQuizAttemptSchema)
    .mutation(async ({ ctx, input }) => {
      const attempt = await QuizAttemptModel.create({
        quizId: input.quizId,
        userId: ctx.user._id,
        domain: ctx.domainData.domainObj._id,
        status: input.status,
        startedAt: input.startedAt || new Date(),
        expiresAt: input.expiresAt,
      });
      return attempt;
    }),

  update: protectedProcedure
    .use(createDomainRequiredMiddleware())
    .use(createPermissionMiddleware([permissions.manageAnyCourse]))
    .input(z.object({
      id: documentIdValidator(),
      data: UpdateQuizAttemptSchema
    }))
    .mutation(async ({ ctx, input }) => {
      const attempt = await QuizAttemptModel.findOne({
        _id: input.id,
        domain: ctx.domainData.domainObj._id
      });
      if (!attempt) throw new NotFoundException("Quiz attempt not found");
      if (attempt.userId.toString() !== ctx.user._id.toString()) {
        throw new AuthorizationException("No access to this attempt");
      }
      const updated = await QuizAttemptModel.findByIdAndUpdate(input.id, input.data, { new: true });
      return updated;
    }),

  delete: protectedProcedure
    .use(createDomainRequiredMiddleware())
    .use(createPermissionMiddleware([permissions.manageAnyCourse]))
    .input(documentIdValidator())
    .mutation(async ({ ctx, input }) => {
      const attempt = await QuizAttemptModel.findOne({
        _id: input,
        domain: ctx.domainData.domainObj._id
      });
      if (!attempt) throw new NotFoundException("Quiz attempt not found");
      await QuizAttemptModel.findByIdAndDelete(input);
      return { success: true };
    }),

  getById: protectedProcedure
    .use(createDomainRequiredMiddleware())
    .use(createPermissionMiddleware([permissions.manageAnyCourse]))
    .input(z.object({
      id: documentIdValidator()
    }))
    .query(async ({ ctx, input }) => {
      const attempt = await QuizAttemptModel.findOne({
        _id: input.id,
        domain: ctx.domainData.domainObj._id
      })
        .populate<{
          user: {
            userId: string;
            name: string;
            email: string;
          };
        }>('user', 'userId name email')
        .populate<{
          quiz: {
            quizId: string;
            title: string;
            totalPoints: number;
          };
        }>('quiz', 'quizId title totalPoints')
        .lean();

      if (!attempt) throw new NotFoundException("Quiz attempt not found");
      return attempt;
    }),

  list: protectedProcedure
    .use(createDomainRequiredMiddleware())
    .use(createPermissionMiddleware([permissions.manageAnyCourse]))
    .input(QuizAttemptListInputSchema)
    .query(async ({ ctx, input }) => {
      const query: RootFilterQuery<typeof QuizAttemptModel> = {
        domain: ctx.domainData.domainObj._id,
        ...(input.filter?.quizId ? { quizId: input.filter.quizId } : {}),
        ...(input.filter?.userId ? { userId: input.filter.userId } : {}),
        ...(input.filter?.status ? { status: input.filter.status } : {}),
      };
      const includeCount = input.pagination?.includePaginationCount ?? true;
      const [items, total] = await Promise.all([
        QuizAttemptModel.find(query)
          .populate<{
            user: {
              userId: string;
              name: string;
              email: string;
            };
          }>('user', 'userId name email')
          // .populate<{
          //   quiz: {
          //     quizId: string;
          //     title: string;
          //     totalPoints: number;
          //   };
          // }>('quiz', 'quizId title totalPoints')
          .skip(input.pagination?.skip || 0)
          .limit(input.pagination?.take || 20)
          .sort(input.orderBy ? { [input.orderBy.field]: input.orderBy.direction === "asc" ? 1 : -1 } : { createdAt: -1 })
          .lean(),
        includeCount ? QuizAttemptModel.countDocuments(query) : Promise.resolve(0)
      ]);

      return {
        items: items.map(item => ({
          ...item,
        })),
        total,
        meta: {
          includePaginationCount: input.pagination?.includePaginationCount,
          skip: input.pagination?.skip || 0,
          take: input.pagination?.take || 20,
        }
      };
    }),



  getCurrentUserAttempt: protectedProcedure
    .use(createDomainRequiredMiddleware())
    .input(z.object({
      quizId: z.string().min(1)
    }))
    .query(async ({ ctx, input }) => {
      const attempt = await QuizAttemptModel.findOne({
        quizId: input.quizId,
        userId: ctx.user._id,
        domain: ctx.domainData.domainObj._id
      })
        .populate<{
          user: {
            userId: string;
            name: string;
            email: string;
          };
        }>('user', 'userId name email')
        .populate<{
          quiz: {
            quizId: string;
            title: string;
            totalPoints: number;
          };
        }>('quiz', 'quizId title totalPoints')
        .lean();

      return attempt;
    }),
});
