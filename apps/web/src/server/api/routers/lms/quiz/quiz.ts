import { z } from "zod";
import { router } from "@/server/api/core/trpc";
import { protectedProcedure, createPermissionMiddleware, createDomainRequiredMiddleware } from "@/server/api/core/procedures";
import { ListInputSchema } from "@/server/api/core/schema";
import { checkPermission } from "@workspace/utils";
import { NotFoundException, AuthorizationException } from "@/server/api/core/exceptions";
import { QuizModel } from "@/models/lms";

const CreateSchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().optional(),
  courseId: z.string().min(1),
  timeLimit: z.number().min(1).optional(),
  maxAttempts: z.number().min(1).max(10).default(1),
  passingScore: z.number().min(0).max(100).default(60),
  shuffleQuestions: z.boolean().default(true),
  showResults: z.boolean().default(false),
  isPublished: z.boolean().default(false),
  totalPoints: z.number().min(1).default(0),
});

const UpdateSchema = CreateSchema.partial();

const QuizListInputSchema = ListInputSchema.extend({
  courseId: z.string().optional(),
  isPublished: z.boolean().optional(),
});

export const quizRouter = router({
  create: protectedProcedure
    .use(createDomainRequiredMiddleware())
    .use(createPermissionMiddleware(["manageAnyCourse"]))
    .input(CreateSchema)
    .mutation(async ({ ctx, input }) => {
      const quiz = await QuizModel.create({
        ...input,
        domain: ctx.domainData.domainObj._id,
        ownerId: ctx.user._id,
      });
      return quiz;
    }),

  update: protectedProcedure
    .use(createDomainRequiredMiddleware())
    .use(createPermissionMiddleware(["manageAnyCourse"]))
    .input(z.object({ id: z.string(), data: UpdateSchema }))
    .mutation(async ({ ctx, input }) => {
      const quiz = await QuizModel.findOne({ 
        _id: input.id, 
        domain: ctx.domainData.domainObj._id 
      });
      if (!quiz) throw new NotFoundException("Quiz not found");

      const updated = await QuizModel.findByIdAndUpdate(input.id, input.data, { new: true });
      return updated;
    }),

  delete: protectedProcedure
    .use(createDomainRequiredMiddleware())
    .use(createPermissionMiddleware(["manageAnyCourse"]))
    .input(z.string())
    .mutation(async ({ ctx, input }) => {
      const quiz = await QuizModel.findOne({ 
        _id: input, 
        domain: ctx.domainData.domainObj._id 
      });
      if (!quiz) throw new NotFoundException("Quiz not found");

      await QuizModel.findByIdAndDelete(input);
      return { success: true };
    }),

  getById: protectedProcedure
    .use(createDomainRequiredMiddleware())
    .input(z.string())
    .query(async ({ ctx, input }) => {
      const quiz = await QuizModel.findOne({ 
        _id: input, 
        domain: ctx.domainData.domainObj._id 
      });
      if (!quiz) throw new NotFoundException("Quiz not found");

      const hasAccess = await checkPermission(ctx.user.permissions, ["manageAnyCourse"]);
      if (!hasAccess && !quiz.isPublished) throw new AuthorizationException("No access");

      return quiz;
    }),

  list: protectedProcedure
    .use(createDomainRequiredMiddleware())
    .input(QuizListInputSchema)
    .query(async ({ ctx, input }) => {
      const { courseId, isPublished, ...listInput } = input;

      const filter: any = { domain: ctx.domainData.domainObj._id };
      if (courseId) filter.courseId = courseId;
      if (isPublished !== undefined) filter.isPublished = isPublished;

      const itemsPromise = QuizModel.find(filter)
        .skip(listInput.pagination?.skip || 0)
        .limit(listInput.pagination?.take || 20)
        .sort(listInput.orderBy ? { [listInput.orderBy.field]: listInput.orderBy.direction === "asc" ? 1 : -1 } : { createdAt: -1 });

      const includeCount = listInput.pagination?.includePaginationCount ?? true;
      const [items, total] = await Promise.all([
        itemsPromise,
        includeCount ? QuizModel.countDocuments(filter) : Promise.resolve(0)
      ]);

      return { 
        items, 
        total,
        meta: { 
          total: includeCount ? total : undefined, 
          skip: listInput.pagination?.skip || 0, 
          take: listInput.pagination?.take || 20 
        } 
      };
    }),
});
