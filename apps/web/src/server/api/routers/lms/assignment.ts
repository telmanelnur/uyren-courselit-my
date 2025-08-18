import { AssignmentModel } from "@/models/lms";
import { AuthorizationException, NotFoundException } from "@/server/api/core/exceptions";
import { createDomainRequiredMiddleware, createPermissionMiddleware, protectedProcedure } from "@/server/api/core/procedures";
import { ListInputSchema } from "@/server/api/core/schema";
import { router } from "@/server/api/core/trpc";
import { checkPermission } from "@workspace/utils";
import { RootFilterQuery } from "mongoose";
import { z } from "zod";

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
      })
        .populate('owner', 'userId name email')
        .populate('course', 'courseId title');

      if (!assignment) throw new NotFoundException("Assignment not found");

      const hasAccess = checkPermission(ctx.user.permissions, ["manageAnyCourse"]);
      if (!hasAccess && assignment.status === "draft") throw new AuthorizationException("No access");

      return assignment;
    }),

  list: protectedProcedure
    .use(createDomainRequiredMiddleware())
    .input(ListInputSchema.extend({
      filter: z.object({
        courseId: z.string().optional(),
        status: z.enum(["draft", "published",]).optional(),
      }),
    }))
    .query(async ({ ctx, input }) => {
      const query: RootFilterQuery<typeof AssignmentModel> = {
        domain: ctx.domainData.domainObj._id,
        ...(input.filter?.courseId ? { courseId: input.filter.courseId } : {}),
        ...(input.filter?.status ? { status: input.filter.status } : {}),
      };
      const includeCount = input.pagination?.includePaginationCount ?? true;
      const [items, total] = await Promise.all([
        AssignmentModel.find(query)
          .populate<{
            owner: {
              userId: string;
              email: string;
            }
          }>('owner', 'userId name email')
          .populate<{
            course: {
              courseId: string;
              title: string;
            }
          }>('course', 'courseId title')
          .skip(input.pagination?.skip || 0)
          .limit(input.pagination?.take || 20)
          .sort(input.orderBy ? { [input.orderBy.field]: input.orderBy.direction === "asc" ? 1 : -1 } : { createdAt: -1 }),
        includeCount ? AssignmentModel.countDocuments(query) : Promise.resolve(0)
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


