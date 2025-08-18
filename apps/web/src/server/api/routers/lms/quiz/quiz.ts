import { QuizModel } from "@/models/lms";
import { AuthorizationException, NotFoundException } from "@/server/api/core/exceptions";
import { createDomainRequiredMiddleware, createPermissionMiddleware, protectedProcedure } from "@/server/api/core/procedures";
import { getFormDataSchema, ListInputSchema } from "@/server/api/core/schema";
import { router } from "@/server/api/core/trpc";
import { documentIdValidator } from "@/server/api/core/validators";
import { checkPermission } from "@workspace/utils";
import { RootFilterQuery } from "mongoose";
import { z } from "zod";

const CreateSchema = getFormDataSchema({
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
    .input(getFormDataSchema(CreateSchema.shape["data"].partial().shape).extend({
      id: documentIdValidator()
    }))
    .mutation(async ({ ctx, input }) => {
      const quiz = await QuizModel.findOne({
        _id: input.id,
        domain: ctx.domainData.domainObj._id
      });
      if (!quiz) throw new NotFoundException("Quiz not found");
      Object.keys(input.data).forEach(key => {
        (quiz as any)[key] = (input.data as any)[key];
      });
      await quiz.save();
      return quiz;
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
    .input(z.object({
      id: documentIdValidator()
    }))
    .query(async ({ ctx, input }) => {
      const quiz = await QuizModel.findOne({
        _id: input.id,
        domain: ctx.domainData.domainObj._id
      })
        .populate('owner', 'userId name email')
        .populate('course', 'courseId title');
      
      if (!quiz) throw new NotFoundException("Quiz not found");

      const hasAccess = checkPermission(ctx.user.permissions, ["manageAnyCourse"]);
      if (!hasAccess && quiz.status === "draft") throw new AuthorizationException("No access");
      return quiz;
    }),

  list: protectedProcedure
    .use(createDomainRequiredMiddleware())
    .input(ListInputSchema.extend({
      filter: z.object({
        status: z.enum(["published", "draft"]).optional(),
        courseId: z.string().optional(),
      }).optional(),
    }))
    .query(async ({ ctx, input }) => {
      const query: RootFilterQuery<typeof QuizModel> = {
        domain: ctx.domainData.domainObj._id,
      };
      if (input.filter?.status) query.status = input.filter.status;
      if (input.filter?.courseId) query.courseId = input.filter.courseId;
      const itemsPromise = QuizModel.find(query)
        .populate('owner', 'userId name email')
        .populate('course', 'courseId title')
        .skip(input.pagination?.skip || 0)
        .limit(input.pagination?.take || 20)
        .sort(input.orderBy ? { [input.orderBy.field]: input.orderBy.direction === "asc" ? 1 : -1 } : { createdAt: -1 });
      const includeCount = input.pagination?.includePaginationCount ?? true;
      const [items, total] = await Promise.all([
        itemsPromise,
        includeCount ? QuizModel.countDocuments(query) : Promise.resolve(0)
      ]);
      return {
        items,
        total,
        meta: {
          includePaginationCount: input.pagination?.includePaginationCount,
          skip: input.pagination?.skip || 0,
          take: input.pagination?.take || 20,
        }
      };
    }),
});
