import { z } from "zod";
import { router } from "@/server/api/core/trpc";
import { protectedProcedure, createPermissionMiddleware, createDomainRequiredMiddleware } from "@/server/api/core/procedures";
import { ListInputSchema } from "@/server/api/core/schema";
import { NotFoundException, AuthorizationException } from "@/server/api/core/exceptions";
import { QuizAttemptModel } from "@/models/lms";

const CreateQuizAttemptSchema = z.object({
  quizId: z.string(),
  status: z.enum(["in_progress", "completed", "abandoned"]).default("in_progress"),
  startedAt: z.date().optional(),
  expiresAt: z.date().optional(),
});

const UpdateQuizAttemptSchema = CreateQuizAttemptSchema.partial();

const QuizAttemptListInputSchema = ListInputSchema.extend({
  quizId: z.string().optional(),
  userId: z.string().optional(),
  status: z.enum(["in_progress", "completed", "abandoned"]).optional(),
});

export const quizAttemptRouter = router({
  create: protectedProcedure
    .use(createDomainRequiredMiddleware())
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
    .input(z.object({ id: z.string(), data: UpdateQuizAttemptSchema }))
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
    .use(createPermissionMiddleware(["manageAnyCourse"]))
    .input(z.string())
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
    .input(z.string())
    .query(async ({ ctx, input }) => {
      const attempt = await QuizAttemptModel.findOne({ 
        _id: input, 
        domain: ctx.domainData.domainObj._id 
      });
      if (!attempt) throw new NotFoundException("Quiz attempt not found");
      if (attempt.userId.toString() !== ctx.user._id.toString()) {
        throw new AuthorizationException("No access to this attempt");
      }
      return attempt;
    }),

  list: protectedProcedure
    .use(createDomainRequiredMiddleware())
    .input(QuizAttemptListInputSchema)
    .query(async ({ ctx, input }) => {
      const { quizId, userId, status, ...listInput } = input;

      const filter: any = { domain: ctx.domainData.domainObj._id };
      if (quizId) filter.quizId = quizId;
      if (userId) filter.userId = userId;
      if (status) filter.status = status;

      const itemsPromise = QuizAttemptModel.find(filter)
        .skip(listInput.pagination?.skip || 0)
        .limit(listInput.pagination?.take || 20)
        .sort(listInput.orderBy ? { [listInput.orderBy.field]: listInput.orderBy.direction === "asc" ? 1 : -1 } : { createdAt: -1 });

      const includeCount = listInput.pagination?.includePaginationCount ?? true;
      const [items, total] = await Promise.all([
        itemsPromise,
        includeCount ? QuizAttemptModel.countDocuments(filter) : Promise.resolve(0)
      ]);

      return { 
        data: items, 
        meta: { 
          total: includeCount ? total : undefined, 
          skip: listInput.pagination?.skip || 0, 
          take: listInput.pagination?.take || 20 
        } 
      };
    }),
});
