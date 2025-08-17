import { z } from "zod";
import { router } from "@/server/api/core/trpc";
import { protectedProcedure, createPermissionMiddleware, createDomainRequiredMiddleware } from "@/server/api/core/procedures";
import { ListInputSchema } from "@/server/api/core/schema";
import { checkPermission } from "@workspace/utils";
import { NotFoundException, AuthorizationException } from "@/server/api/core/exceptions";
import { QuestionProviderFactory } from "./_providers";
import { QuestionModel } from "@/models/lms";

const QuestionCreateSchema = z.object({
  text: z.string().min(1),
  type: z.enum(["multiple_choice", "short_answer"]),
  points: z.number().min(1).max(100).default(1),
  options: z.array(z.object({
    text: z.string(),
    isCorrect: z.boolean().default(false),
  })).optional(),
  correctAnswers: z.array(z.string()).optional(),
  explanation: z.string().optional(),
  courseId: z.string().min(1),
});

const QuestionUpdateSchema = QuestionCreateSchema.partial();

const QuestionListInputSchema = ListInputSchema.extend({
  courseId: z.string().optional(),
  type: z.enum(["multiple_choice", "short_answer"]).optional(),
});

export const questionRouter = router({
  create: protectedProcedure
    .use(createDomainRequiredMiddleware())
    .use(createPermissionMiddleware(["manageAnyCourse"]))
    .input(QuestionCreateSchema)
    .mutation(async ({ ctx, input }) => {
      const validation = QuestionProviderFactory.validateQuestion(input);
      if (!validation.isValid) throw new Error(`Validation failed: ${validation.errors.join(", ")}`);

      const defaultSettings = QuestionProviderFactory.getDefaultSettings(input.type);
      const question = await QuestionModel.create({
        ...input,
        ...defaultSettings,
        domain: ctx.domainData.domainObj._id,
        teacherId: ctx.user._id,
      });

      return question;
    }),

  update: protectedProcedure
    .use(createDomainRequiredMiddleware())
    .use(createPermissionMiddleware(["manageAnyCourse"]))
    .input(z.object({ id: z.string(), data: QuestionUpdateSchema }))
    .mutation(async ({ ctx, input }) => {
      const question = await QuestionModel.findOne({ 
        _id: input.id, 
        domain: ctx.domainData.domainObj._id 
      });
      if (!question) throw new NotFoundException("Question not found");

      if (input.data) {
        const mergedData = { ...question.toObject(), ...input.data };
        const validation = QuestionProviderFactory.validateQuestion(mergedData);
        if (!validation.isValid) throw new Error(`Validation failed: ${validation.errors.join(", ")}`);
      }

      const updated = await QuestionModel.findByIdAndUpdate(input.id, input.data, { new: true });
      return updated;
    }),

  delete: protectedProcedure
    .use(createDomainRequiredMiddleware())
    .use(createPermissionMiddleware(["manageAnyCourse"]))
    .input(z.string())
    .mutation(async ({ ctx, input }) => {
      const question = await QuestionModel.findOne({ 
        _id: input, 
        domain: ctx.domainData.domainObj._id 
      });
      if (!question) throw new NotFoundException("Question not found");

      await QuestionModel.findByIdAndDelete(input);
      return { success: true };
    }),

  getById: protectedProcedure
    .use(createDomainRequiredMiddleware())
    .input(z.string())
    .query(async ({ ctx, input }) => {
      const question = await QuestionModel.findOne({ 
        _id: input, 
        domain: ctx.domainData.domainObj._id 
      });
      if (!question) throw new NotFoundException("Question not found");

      const hasAccess = await checkPermission(ctx.user.permissions, ["manageAnyCourse"]);
      if (!hasAccess) throw new AuthorizationException("No access");

      return question;
    }),

  list: protectedProcedure
    .use(createDomainRequiredMiddleware())
    .input(QuestionListInputSchema)
    .query(async ({ ctx, input }) => {
      const { courseId, type, ...listInput } = input;

      const filter: any = { domain: ctx.domainData.domainObj._id };
      if (courseId) filter.courseId = courseId;
      if (type) filter.type = type;

      const itemsPromise = QuestionModel.find(filter)
        .skip(listInput.pagination?.skip || 0)
        .limit(listInput.pagination?.take || 20)
        .sort(listInput.orderBy ? { [listInput.orderBy.field]: listInput.orderBy.direction === "asc" ? 1 : -1 } : { createdAt: -1 });

      const includeCount = listInput.pagination?.includePaginationCount ?? true;
      const [items, total] = await Promise.all([
        itemsPromise,
        includeCount ? QuestionModel.countDocuments(filter) : Promise.resolve(0)
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

  getSupportedQuestionTypes: protectedProcedure.query(() => QuestionProviderFactory.getSupportedTypes()),

  getQuestionTypeMetadata: protectedProcedure
    .input(z.string())
    .query(({ input }) => QuestionProviderFactory.getQuestionMetadata(input)),

  validateQuestionData: protectedProcedure
    .input(z.object({ type: z.string(), data: z.any() }))
    .mutation(({ input }) => QuestionProviderFactory.validateQuestion(input.data)),
});


