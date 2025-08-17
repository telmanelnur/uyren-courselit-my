import { z } from "zod";
import { router } from "@/server/api/core/trpc";
import { protectedProcedure, createPermissionMiddleware, createDomainRequiredMiddleware } from "@/server/api/core/procedures";
import { ListInputSchema } from "@/server/api/core/schema";
import { NotFoundException, AuthorizationException } from "@/server/api/core/exceptions";
import { AssignmentSubmissionModel } from "@/models/lms";

const CreateSubmissionSchema = z.object({
  assignmentId: z.string(),
  content: z.string(),
  attachments: z.array(z.string()).default([]),
  status: z.enum(["draft", "submitted", "graded", "late"]).default("draft"),
});

const UpdateSubmissionSchema = CreateSubmissionSchema.partial();

const SubmissionListInputSchema = ListInputSchema.extend({
  assignmentId: z.string().optional(),
  userId: z.string().optional(),
  status: z.enum(["draft", "submitted", "graded", "late"]).optional(),
});

export const assignmentSubmissionRouter = router({
  create: protectedProcedure
    .use(createDomainRequiredMiddleware())
    .input(CreateSubmissionSchema)
    .mutation(async ({ ctx, input }) => {
      const submission = await AssignmentSubmissionModel.create({
        ...input,
        userId: ctx.user._id,
        domain: ctx.domainData.domainObj._id,
        submittedAt: new Date(),
      });
      return submission;
    }),

  update: protectedProcedure
    .use(createDomainRequiredMiddleware())
    .input(z.object({ id: z.string(), data: UpdateSubmissionSchema }))
    .mutation(async ({ ctx, input }) => {
      const submission = await AssignmentSubmissionModel.findOne({ 
        _id: input.id, 
        domain: ctx.domainData.domainObj._id 
      });
      if (!submission) throw new NotFoundException("Submission not found");
      
      if (submission.userId.toString() !== ctx.user._id.toString()) {
        throw new AuthorizationException("No access to this submission");
      }
      
      const updated = await AssignmentSubmissionModel.findByIdAndUpdate(
        input.id, 
        input.data, 
        { new: true }
      );
      return updated;
    }),

  delete: protectedProcedure
    .use(createDomainRequiredMiddleware())
    .use(createPermissionMiddleware(["manageAnyCourse"]))
    .input(z.string())
    .mutation(async ({ ctx, input }) => {
      const submission = await AssignmentSubmissionModel.findOne({ 
        _id: input, 
        domain: ctx.domainData.domainObj._id 
      });
      if (!submission) throw new NotFoundException("Submission not found");
      
      await AssignmentSubmissionModel.findByIdAndDelete(input);
      return { success: true };
    }),

  getById: protectedProcedure
    .use(createDomainRequiredMiddleware())
    .input(z.string())
    .query(async ({ ctx, input }) => {
      const submission = await AssignmentSubmissionModel.findOne({ 
        _id: input, 
        domain: ctx.domainData.domainObj._id 
      });
      if (!submission) throw new NotFoundException("Submission not found");
      
      if (submission.userId.toString() !== ctx.user._id.toString()) {
        throw new AuthorizationException("No access to this submission");
      }
      
      return submission;
    }),

  list: protectedProcedure
    .use(createDomainRequiredMiddleware())
    .input(SubmissionListInputSchema)
    .query(async ({ ctx, input }) => {
      const { assignmentId, userId, status, ...listInput } = input;

      const filter: any = { domain: ctx.domainData.domainObj._id };
      if (assignmentId) filter.assignmentId = assignmentId;
      if (userId) filter.userId = userId;
      if (status) filter.status = status;

      const itemsPromise = AssignmentSubmissionModel.find(filter)
        .skip(listInput.pagination?.skip || 0)
        .limit(listInput.pagination?.take || 20)
        .sort(listInput.orderBy ? { [listInput.orderBy.field]: listInput.orderBy.direction === "asc" ? 1 : -1 } : { createdAt: -1 });

      const includeCount = listInput.pagination?.includePaginationCount ?? true;
      const [items, total] = await Promise.all([
        itemsPromise,
        includeCount ? AssignmentSubmissionModel.countDocuments(filter) : Promise.resolve(0)
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
