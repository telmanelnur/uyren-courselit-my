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

// Assignment schemas for when models are added to schema.prisma
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

const AssignmentListInputSchema = ListInputSchema.extend({
  filter: z
    .object({
      ownerId: documentIdValidator().optional(),
      courseId: documentIdValidator().optional(),
      visibility: z.nativeEnum(VisibilityStatus).optional(),
      isPublished: z.boolean().optional(),
    })
    .optional()
    .default({}),
});

const CreateAssignmentSettingsSchema = getFormDataSchema({
  submissionDeadline: z.date().optional(),
  maxAttempts: z.number().int().positive().default(1),
  passingScore: z.number().min(0).max(100).default(60.0),
  gradingMethod: z.enum(["MANUAL", "AUTOMATIC"]).default("MANUAL"),
}).extend({
  assignmentId: documentIdValidator(),
});

// Helper functions
async function assertAssignmentOwnerOrAdmin(ctx: any, ownerId: number | null) {
  if (isAdmin(ctx.user)) return;
  if (!ownerId || ctx.user!.id !== ownerId)
    throw new AuthorizationException(
      "You are not the owner of this assignment",
    );
}

async function ensureUniqueAssignmentSlug(
  ctx: any,
  slug: string,
  excludeId?: number,
) {
  const existing = await ctx.prisma.assignment.findFirst({
    where: { slug, ...(excludeId ? { id: { not: excludeId } } : {}) },
    select: { id: true },
  });
  if (existing) throw new ResourceExistsException("Assignment", "slug", slug);
}

export const assignmentRouter = router({
  // Placeholder implementations until Assignment models are added to schema.prisma

  list: teacherProcedure
    .input(AssignmentListInputSchema)
    .query(async ({ ctx, input }) => {
      const filter = input.filter || {};
      const q = input?.search?.q;

      // Build where clause with search functionality
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

      // Check authorization for accessing other user's assignments
      if (
        filter.ownerId &&
        !isAdmin(ctx.user) &&
        ctx.user!.id !== filter.ownerId
      ) {
        throw new AuthorizationException(
          "You do not have permission to access this user's assignments",
        );
      }

      const { skip, take } = paginate(input.pagination);
      const ob = orderBy(input.orderBy?.field, input.orderBy?.direction);

      const [items, total] = await Promise.all([
        ctx.prisma.assignment.findMany({
          where,
          skip,
          take,
          orderBy: ob,
          include: {
            assignmentSettings: true,
            _count: {
              select: {
                assignmentSubmissions: true,
              },
            },
          },
        }),
        ctx.prisma.assignment.count({ where }),
      ]);

      return { items, total, meta: { skip, take } };
    }),

  getById: teacherProcedure
    .input(documentIdValidator())
    .query(async ({ ctx, input }) => {
      const row = await ctx.prisma.assignment.findUnique({
        where: { id: input },
      });
      if (!row) throw new NotFoundException("Assignment", String(input));
      await assertAssignmentOwnerOrAdmin(ctx, row.ownerId);
      return row;
    }),

  create: teacherProcedure
    .input(CreateSchema)
    .mutation(async ({ ctx, input }) => {
      await ensureUniqueAssignmentSlug(ctx, input.data.slug);
      return ctx.prisma.assignment.create({
        data: { ...input.data, ownerId: ctx.user!.id },
      });
    }),

  update: teacherProcedure
    .input(UpdateSchema)
    .mutation(async ({ ctx, input }) => {
      const row = await ctx.prisma.assignment.findUnique({
        where: { id: input.id },
        select: { ownerId: true, slug: true },
      });
      if (!row) throw new NotFoundException("Assignment", String(input.id));
      await assertAssignmentOwnerOrAdmin(ctx, row.ownerId);
      if (input.data.slug && input.data.slug !== row.slug)
        await ensureUniqueAssignmentSlug(ctx, input.data.slug, input.id);
      return ctx.prisma.assignment.update({
        where: { id: input.id },
        data: input.data,
      });
    }),

  delete: teacherProcedure
    .input(documentIdValidator())
    .mutation(async ({ ctx, input }) => {
      const row = await ctx.prisma.assignment.findUnique({
        where: { id: input },
        select: { ownerId: true },
      });
      if (!row) throw new NotFoundException("Assignment", String(input));
      await assertAssignmentOwnerOrAdmin(ctx, row.ownerId);
      return ctx.prisma.assignment.delete({ where: { id: input } });
    }),

  // Assignment settings management
  updateSettings: teacherProcedure
    .input(CreateAssignmentSettingsSchema)
    .mutation(async ({ ctx, input }) => {
      // First verify assignment ownership
      const assignment = await ctx.prisma.assignment.findUnique({
        where: { id: input.assignmentId },
        select: { ownerId: true },
      });

      if (!assignment) {
        throw new NotFoundException("Assignment", String(input.assignmentId));
      }

      await assertAssignmentOwnerOrAdmin(ctx, assignment.ownerId);

      return ctx.prisma.assignmentSettings.upsert({
        where: { assignmentId: input.assignmentId },
        create: {
          ...input.data,
          assignmentId: input.assignmentId,
        },
        update: input.data,
      });
    }),

  // Get assignment settings
  getSettings: teacherProcedure
    .input(documentIdValidator())
    .query(async ({ ctx, input }) => {
      const assignment = await ctx.prisma.assignment.findUnique({
        where: { id: input },
        include: {
          assignmentSettings: true,
        },
      });

      if (!assignment) {
        throw new NotFoundException("Assignment", String(input));
      }

      await assertAssignmentOwnerOrAdmin(ctx, assignment.ownerId);

      return assignment.assignmentSettings;
    }),

  // Bulk grading actions
  bulkGradeSubmissions: teacherProcedure
    .input(
      z.object({
        submissionIds: z.array(documentIdValidator()),
        score: z.number().min(0).max(100),
        feedback: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Get all submissions and verify assignment ownership
      const submissions = await ctx.prisma.assignmentSubmission.findMany({
        where: { id: { in: input.submissionIds } },
        include: {
          assignment: {
            select: { ownerId: true },
          },
        },
      });

      // Verify all submissions belong to assignments owned by the teacher
      for (const submission of submissions) {
        await assertAssignmentOwnerOrAdmin(ctx, submission.assignment.ownerId);
      }

      return ctx.prisma.assignmentSubmission.updateMany({
        where: { id: { in: input.submissionIds } },
        data: {
          score: input.score,
          feedback: input.feedback,
          isGraded: true,
          status: "GRADED" as any,
        },
      });
    }),

  getSubmissions: teacherProcedure
    .input(
      z.object({
        assignmentId: documentIdValidator(),
        pagination: z
          .object({
            skip: z.number().default(0),
            take: z.number().default(20),
          })
          .optional(),
        orderBy: z
          .object({
            field: z.string().default("createdAt"),
            direction: z.enum(["asc", "desc"]).default("desc"),
          })
          .optional(),
        search: z.object({ q: z.string().trim().optional() }).optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      // First check if assignment exists and verify ownership
      const assignment = await ctx.prisma.assignment.findUnique({
        where: { id: input.assignmentId },
        select: { ownerId: true },
      });

      if (!assignment) {
        throw new NotFoundException("Assignment", String(input.assignmentId));
      }

      await assertAssignmentOwnerOrAdmin(ctx, assignment.ownerId);

      const q = input?.search?.q;
      const where: any = {
        assignmentId: input.assignmentId,
        ...(q
          ? {
              OR: [{ data: like(q) }, { feedback: like(q) }],
            }
          : {}),
      };

      const { skip, take } = paginate(input.pagination);
      const ob = orderBy(input.orderBy?.field, input.orderBy?.direction);

      const [items, total] = await Promise.all([
        ctx.prisma.assignmentSubmission.findMany({
          where,
          skip,
          take,
          orderBy: ob,
        }),
        ctx.prisma.assignmentSubmission.count({ where }),
      ]);

      return { items, total, meta: { skip, take } };
    }),

  gradeSubmission: teacherProcedure
    .input(
      z.object({
        submissionId: documentIdValidator(),
        score: z.number().min(0).max(100),
        feedback: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // First get the submission and verify ownership of the assignment
      const submission = await ctx.prisma.assignmentSubmission.findUnique({
        where: { id: input.submissionId },
        include: {
          assignment: {
            select: { ownerId: true },
          },
        },
      });

      if (!submission) {
        throw new NotFoundException(
          "Assignment Submission",
          String(input.submissionId),
        );
      }

      await assertAssignmentOwnerOrAdmin(ctx, submission.assignment.ownerId);

      return ctx.prisma.assignmentSubmission.update({
        where: { id: input.submissionId },
        data: {
          score: input.score,
          feedback: input.feedback,
          isGraded: true,
          status: "GRADED" as any,
        },
      });
    }),

  // Get assignments by course
  getByCourse: teacherProcedure
    .input(documentIdValidator())
    .query(async ({ ctx, input }) => {
      return ctx.prisma.assignment.findMany({
        where: {
          courseId: input,
          ownerId: ctx.user.id,
        },
        orderBy: { createdAt: "desc" },
      });
    }),

  // Reset submission (for retakes)
  resetSubmission: teacherProcedure
    .input(documentIdValidator())
    .mutation(async ({ ctx, input }) => {
      const submission = await ctx.prisma.assignmentSubmission.findUnique({
        where: { id: input },
        include: {
          assignment: {
            select: { ownerId: true },
          },
        },
      });

      if (!submission) {
        throw new NotFoundException("Assignment Submission", String(input));
      }

      await assertAssignmentOwnerOrAdmin(ctx, submission.assignment.ownerId);

      return ctx.prisma.assignmentSubmission.update({
        where: { id: input },
        data: {
          score: null,
          feedback: null,
          isGraded: false,
          status: "PENDING" as any,
        },
      });
    }),

  getStatistics: teacherProcedure
    .input(documentIdValidator())
    .query(async ({ ctx, input }) => {
      // First check if assignment exists and verify ownership
      const assignment = await ctx.prisma.assignment.findUnique({
        where: { id: input },
        select: { ownerId: true },
      });

      if (!assignment) {
        throw new NotFoundException("Assignment", String(input));
      }

      await assertAssignmentOwnerOrAdmin(ctx, assignment.ownerId);

      const [totalSubmissions, gradedSubmissions, submissionStats] =
        await Promise.all([
          ctx.prisma.assignmentSubmission.count({
            where: { assignmentId: input },
          }),
          ctx.prisma.assignmentSubmission.count({
            where: { assignmentId: input, isGraded: true },
          }),
          ctx.prisma.assignmentSubmission.aggregate({
            where: { assignmentId: input, isGraded: true },
            _avg: { score: true },
            _count: {
              score: true,
            },
          }),
        ]);

      const averageScore = submissionStats._avg.score || 0;
      const passedSubmissions = await ctx.prisma.assignmentSubmission.count({
        where: {
          assignmentId: input,
          isGraded: true,
          score: { gte: 60 }, // Assuming 60% is passing
        },
      });

      const passRate =
        gradedSubmissions > 0
          ? (passedSubmissions / gradedSubmissions) * 100
          : 0;

      return {
        totalSubmissions,
        gradedSubmissions,
        averageScore: Math.round(averageScore * 100) / 100,
        passedSubmissions,
        passRate: Math.round(passRate * 100) / 100,
        assignmentId: input,
      };
    }),
});
