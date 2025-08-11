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

const CreateSchema = getFormDataSchema({
  slug: documentSlugValidator().transform(toSlug),
  title: z
    .string()
    .min(3, "Chapter title must be at least 3 characters long")
    .max(100, "Chapter title must be less than 100 characters"),
  description: z.string().optional(),
  videoUrl: z
    .string()
    .url("Please enter a valid video URL")
    .optional()
    .or(z.literal("")),
  position: z
    .number()
    .min(1, "Position must be a positive number")
    .max(1000, "Position cannot exceed 1000"),
  isPublished: z.boolean().default(false),
  isFree: z.boolean().default(false),
  courseId: documentIdValidator(),
});

const UpdateSchema = getFormDataSchema({
  slug: documentSlugValidator().transform(toSlug).optional(),
  title: z
    .string()
    .min(3, "Chapter title must be at least 3 characters long")
    .max(100, "Chapter title must be less than 100 characters")
    .optional(),
  description: z.string().optional(),
  videoUrl: z
    .string()
    .url("Please enter a valid video URL")
    .optional()
    .or(z.literal("")),
  position: z
    .number()
    .min(1, "Position must be a positive number")
    .max(1000, "Position cannot exceed 1000")
    .optional(),
  isPublished: z.boolean().optional(),
  isFree: z.boolean().optional(),
}).extend({
  id: documentIdValidator(),
});

// const ReorderChaptersSchema = z.object({
//   courseId: documentIdValidator(),
//   chapters: z.array(
//     z.object({
//       id: documentIdValidator(),
//       position: z.number(),
//     })
//   ),
// });

const ReorderChaptersSchema = z.object({
  courseId: documentIdValidator(),
  chapters: z.array(
    z.object({
      id: documentIdValidator(),
      position: z.number(),
    }),
  ),
});

const BulkUpdateSchema = z.object({
  courseId: documentIdValidator(),
  updates: z.array(
    z.object({
      id: documentIdValidator(),
      position: z.number().optional(),
      isPublished: z.boolean().optional(),
    }),
  ),
});

// Helper functions
async function assertChapterCourseOwnerOrAdmin(ctx: any, ownerId: number) {
  if (isAdmin(ctx.user)) return;
  if (ownerId !== ctx.user.id) {
    throw new AuthorizationException("You are not the owner of this course");
  }
}

async function ensureUniqueChapterSlug(
  ctx: any,
  slug: string,
  excludeId?: number,
) {
  const existing = await ctx.prisma.chapter.findFirst({
    where: { slug, ...(excludeId ? { id: { not: excludeId } } : {}) },
    select: { id: true },
  });
  if (existing) throw new ResourceExistsException("Chapter", "slug", slug);
}

async function ensureUniqueChapterPosition(
  ctx: any,
  courseId: number,
  position: number,
  excludeId?: number,
) {
  const existing = await ctx.prisma.chapter.findFirst({
    where: {
      courseId,
      position,
      ...(excludeId ? { id: { not: excludeId } } : {}),
    },
    select: { id: true },
  });
  if (existing)
    throw new ResourceExistsException("Chapter", "position", String(position));
}

export const chapterRouter = router({
  // List chapters for a course
  list: teacherProcedure
    .input(
      ListInputSchema.extend({
        filter: z.object({
          courseId: documentIdValidator(),
          isPublished: z.boolean().optional(),
          isFree: z.boolean().optional(),
        }),
      }),
    )
    .query(async ({ ctx, input }) => {
      const filter = input.filter;
      const q = input?.search?.q;

      // Get course and verify ownership
      const course = await ctx.prisma.course.findUnique({
        where: { id: filter.courseId },
        select: { ownerId: true },
      });
      if (!course)
        throw new NotFoundException("Course", String(filter.courseId));

      await assertChapterCourseOwnerOrAdmin(ctx, course.ownerId!);

      const where: any = {
        courseId: filter.courseId,
        ...(filter.isPublished !== undefined
          ? { isPublished: filter.isPublished }
          : {}),
        ...(filter.isFree !== undefined ? { isFree: filter.isFree } : {}),
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

      const { skip, take } = paginate(input.pagination);
      const ob = orderBy(
        input.orderBy?.field || "position",
        input.orderBy?.direction,
      );

      const [items, total] = await Promise.all([
        ctx.prisma.chapter.findMany({
          where,
          skip,
          take,
          orderBy: ob,
          include: {
            lessons: {
              select: { id: true, title: true, position: true },
              orderBy: { position: "asc" },
            },
            _count: {
              select: {
                lessons: true,
              },
            },
          },
        }),
        ctx.prisma.chapter.count({ where }),
      ]);

      return { items, total, meta: { skip, take } };
    }),

  // Get single chapter by ID
  getById: teacherProcedure
    .input(documentIdValidator())
    .query(async ({ ctx, input }) => {
      const row = await ctx.prisma.chapter.findUnique({
        where: { id: input },
        include: {
          course: {
            select: { id: true, title: true, ownerId: true },
          },
          lessons: {
            orderBy: { position: "asc" },
          },
        },
      });
      if (!row) throw new NotFoundException("Chapter", String(input));
      await assertChapterCourseOwnerOrAdmin(ctx, row.course.ownerId!);
      return row;
    }),

  // Create new chapter
  create: teacherProcedure
    .input(CreateSchema)
    .mutation(async ({ ctx, input }) => {
      // Get course and verify ownership
      const course = await ctx.prisma.course.findUnique({
        where: { id: input.data.courseId },
        select: { ownerId: true },
      });
      if (!course)
        throw new NotFoundException("Course", String(input.data.courseId));

      await assertChapterCourseOwnerOrAdmin(ctx, course.ownerId!);
      await ensureUniqueChapterSlug(ctx, input.data.slug);
      await ensureUniqueChapterPosition(
        ctx,
        input.data.courseId,
        input.data.position,
      );
      return ctx.prisma.chapter.create({
        data: input.data,
        include: {
          course: {
            select: { id: true, title: true },
          },
        },
      });
    }),

  // Update chapter
  update: teacherProcedure
    .input(UpdateSchema)
    .mutation(async ({ ctx, input }) => {
      const row = await ctx.prisma.chapter.findUnique({
        where: { id: input.id },
        include: {
          course: {
            select: { id: true, title: true, ownerId: true },
          },
        },
      });
      if (!row) throw new NotFoundException("Chapter", String(input.id));

      await assertChapterCourseOwnerOrAdmin(ctx, row.course.id);
      if (input.data.slug) {
        await ensureUniqueChapterSlug(ctx, input.data.slug, input.id);
      }
      if (input.data.position) {
        await ensureUniqueChapterPosition(
          ctx,
          row.courseId,
          input.data.position,
          input.id,
        );
      }

      return ctx.prisma.chapter.update({
        where: { id: input.id },
        data: input.data,
        include: {
          course: {
            select: { id: true, title: true },
          },
        },
      });
    }),

  // Delete chapter
  delete: teacherProcedure
    .input(documentIdValidator())
    .mutation(async ({ ctx, input }) => {
      const row = await ctx.prisma.chapter.findUnique({
        where: { id: input },
        include: {
          course: {
            select: { ownerId: true },
          },
        },
      });

      if (!row) throw new NotFoundException("Chapter", String(input));
      await assertChapterCourseOwnerOrAdmin(ctx, row.course.ownerId!);
      return ctx.prisma.chapter.delete({ where: { id: input } });
    }),

  //   // Reorder chapters
  //   reorder: teacherProcedure
  //     .input(ReorderChaptersSchema)
  //     .mutation(async ({ ctx, input }) => {
  //       await assertChapterCourseOwnerOrAdmin(ctx, input.courseId);
  //       await ctx.prisma.$transaction(
  //         input.chapters.map((chapter) =>
  //           ctx.prisma.chapter.update({
  //             where: { id: chapter.id },
  //             data: { position: chapter.position },
  //           })
  //         )
  //       );
  //       return { success: true };
  //     }),

  // Reorder chapters
  reorder: teacherProcedure
    .input(ReorderChaptersSchema)
    .mutation(async ({ ctx, input }) => {
      // Verify course ownership
      const course = await ctx.prisma.course.findUnique({
        where: { id: input.courseId },
        select: { id: true, ownerId: true },
      });
      if (!course)
        throw new NotFoundException("Course", String(input.courseId));
      await assertChapterCourseOwnerOrAdmin(ctx, course.ownerId!);

      // Update positions in transaction
      await ctx.prisma.$transaction(
        input.chapters.map((chapter) =>
          ctx.prisma.chapter.update({
            where: { id: chapter.id },
            data: { position: chapter.position },
          }),
        ),
      );
      return { success: true };
    }),

  // Bulk update chapters (status and position)
  bulkUpdate: teacherProcedure
    .input(BulkUpdateSchema)
    .mutation(async ({ ctx, input }) => {
      // Verify course ownership
      const course = await ctx.prisma.course.findUnique({
        where: { id: input.courseId },
        select: { id: true, ownerId: true },
      });
      if (!course)
        throw new NotFoundException("Course", String(input.courseId));
      await assertChapterCourseOwnerOrAdmin(ctx, course.ownerId!);

      // Update chapters in transaction
      await ctx.prisma.$transaction(
        input.updates.map((update) => {
          const { id, ...data } = update;
          return ctx.prisma.chapter.update({
            where: { id },
            data,
          });
        }),
      );
      return { success: true };
    }),
});
