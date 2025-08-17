import { z } from "zod";
import { router } from "@/server/api/core/trpc";
import { protectedProcedure, createPermissionMiddleware, createDomainRequiredMiddleware } from "@/server/api/core/procedures";
import { ListInputSchema } from "@/server/api/core/schema";
import { NotFoundException, AuthorizationException } from "@/server/api/core/exceptions";
import { AssignmentModel } from "@/models/lms";

const CreateAssignmentSchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().optional(),
  courseId: z.string().min(1),
  assignmentType: z.enum(["essay", "project", "presentation", "file_upload", "peer_review"]),
  dueDate: z.date().optional(),
  totalPoints: z.number().min(1).default(100),
  instructions: z.string().optional(),
  requirements: z.array(z.string()).default([]),
  attachments: z.array(z.string()).default([]),
  isPublished: z.boolean().default(false),
  allowLateSubmission: z.boolean().default(false),
  latePenalty: z.number().min(0).max(100).default(10),
  maxSubmissions: z.number().min(1).default(1),
  allowResubmission: z.boolean().default(false),
  peerReviewEnabled: z.boolean().default(false),
  rubric: z.array(z.object({ criterion: z.string(), points: z.number().min(0), description: z.string().optional() })).optional(),
  tags: z.array(z.string()).default([]),
  category: z.string().optional(),
  difficulty: z.enum(["easy", "medium", "hard"]).default("medium"),
});

const UpdateAssignmentSchema = CreateAssignmentSchema.partial();

const AssignmentListInputSchema = ListInputSchema.extend({
  courseId: z.string().optional(),
  isPublished: z.boolean().optional(),
});

export const assignmentRouter = router({
  create: protectedProcedure
    .use(createDomainRequiredMiddleware())
    .use(createPermissionMiddleware(["manageAnyCourse"]))
    .input(CreateAssignmentSchema)
    .mutation(async ({ ctx, input }) => {
      const assignment = await AssignmentModel.create({
        ...input,
        domain: ctx.domainData.domainObj._id,
        ownerId: ctx.user._id,
      });
      return assignment;
    }),

  update: protectedProcedure
    .use(createDomainRequiredMiddleware())
    .use(createPermissionMiddleware(["manageAnyCourse"]))
    .input(z.object({ id: z.string(), data: UpdateAssignmentSchema }))
    .mutation(async ({ ctx, input }) => {
      const assignment = await AssignmentModel.findOne({ 
        _id: input.id, 
        domain: ctx.domainData.domainObj._id 
      });
      if (!assignment) throw new NotFoundException("Assignment not found");

      const updated = await AssignmentModel.findByIdAndUpdate(input.id, input.data, { new: true });
      return updated;
    }),

  delete: protectedProcedure
    .use(createDomainRequiredMiddleware())
    .use(createPermissionMiddleware(["manageAnyCourse"]))
    .input(z.string())
    .mutation(async ({ ctx, input }) => {
      const assignment = await AssignmentModel.findOne({ 
        _id: input, 
        domain: ctx.domainData.domainObj._id 
      });
      if (!assignment) throw new NotFoundException("Assignment not found");
      await AssignmentModel.findByIdAndDelete(input);
      return { success: true };
    }),

  getById: protectedProcedure
    .use(createDomainRequiredMiddleware())
    .input(z.string())
    .query(async ({ ctx, input }) => {
      const assignment = await AssignmentModel.findOne({ 
        _id: input, 
        domain: ctx.domainData.domainObj._id 
      });
      if (!assignment) throw new NotFoundException("Assignment not found");
      if (!assignment.isPublished) {
        throw new AuthorizationException("No access");
      }
      return assignment;
    }),

  list: protectedProcedure
    .use(createDomainRequiredMiddleware())
    .input(AssignmentListInputSchema)
    .query(async ({ ctx, input }) => {
      const { courseId, isPublished, ...listInput } = input;
      const filter: any = { domain: ctx.domainData.domainObj._id };
      if (courseId) filter.courseId = courseId;
      if (isPublished !== undefined) filter.isPublished = isPublished;
      const itemsPromise = AssignmentModel.find(filter)
        .skip(listInput.pagination?.skip || 0)
        .limit(listInput.pagination?.take || 20)
        .sort(listInput.orderBy ? { [listInput.orderBy.field]: listInput.orderBy.direction === "asc" ? 1 : -1 } : { createdAt: -1 });
      const includeCount = listInput.pagination?.includePaginationCount ?? true;
      const [items, total] = await Promise.all([
        itemsPromise,
        includeCount ? AssignmentModel.countDocuments(filter) : Promise.resolve(0)
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


