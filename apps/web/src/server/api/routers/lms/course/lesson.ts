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
  title: z.string().min(1).max(255),
  content: z.string().optional(),
  videoUrl: z.string().optional(),
  position: z.number().min(1).default(1),
  isPublished: z.boolean().default(false),
  chapterId: documentIdValidator(),
});

const UpdateSchema = getFormDataSchema({
  slug: documentSlugValidator().transform(toSlug).optional(),
  title: z.string().min(1).max(255).optional(),
  content: z.string().optional(),
  videoUrl: z.string().optional(),
  position: z.number().min(1).optional(),
  isPublished: z.boolean().optional(),
}).extend({
  id: documentIdValidator(),
});

// const ReorderLessonsSchema = z.object({
//   chapterId: documentIdValidator(),
//   lessons: z.array(
//     z.object({
//       id: documentIdValidator(),
//       position: z.number(),
//     })
//   ),
// });

const ReorderLessonsSchema = z.object({
  chapterId: documentIdValidator(),
  lessons: z.array(
    z.object({
      id: documentIdValidator(),
      position: z.number(),
    }),
  ),
});

// Helper functions
async function assertLessonChapterCourseOwnerOrAdmin(
  ctx: any,
  chapterId: number,
) {
  const chapter = await ctx.prisma.chapter.findUnique({
    where: { id: chapterId },
    include: {
      course: {
        select: { ownerId: true },
      },
    },
  });

  if (!chapter) throw new NotFoundException("Chapter", String(chapterId));

  if (isAdmin(ctx.user)) return chapter;
  if (chapter.course.ownerId !== ctx.user.id) {
    throw new AuthorizationException("You are not the owner of this course");
  }
  return chapter;
}

async function ensureUniqueLessonSlug(
  ctx: any,
  slug: string,
  excludeId?: number,
) {
  const existing = await ctx.prisma.lesson.findFirst({
    where: { slug, ...(excludeId ? { id: { not: excludeId } } : {}) },
    select: { id: true },
  });
  if (existing) throw new ResourceExistsException("Lesson", "slug", slug);
}

async function ensureUniqueLessonPosition(
  ctx: any,
  chapterId: number,
  position: number,
  excludeId?: number,
) {
  const existing = await ctx.prisma.lesson.findFirst({
    where: {
      chapterId,
      position,
      ...(excludeId ? { id: { not: excludeId } } : {}),
    },
    select: { id: true },
  });
  if (existing)
    throw new ResourceExistsException("Lesson", "position", String(position));
}

export const lessonRouter = router({
  // Get all lessons for a chapter
  list: teacherProcedure
    .input(
      ListInputSchema.extend({
        filter: z.object({
          chapterId: documentIdValidator(),
          isPublished: z.boolean().optional(),
        }),
      }),
    )
    .query(async ({ ctx, input }) => {
      const filter = input.filter;
      const q = input?.search?.q;
      if (filter.chapterId) {
        await assertLessonChapterCourseOwnerOrAdmin(ctx, filter.chapterId);
      }
      const where: any = {
        chapterId: filter.chapterId,
        ...(filter.isPublished !== undefined
          ? { isPublished: filter.isPublished }
          : {}),
        ...(q
          ? {
              OR: [{ title: like(q) }, { slug: like(q) }, { content: like(q) }],
            }
          : {}),
      };

      const { skip, take } = paginate(input.pagination);
      const ob = orderBy(
        input.orderBy?.field || "position",
        input.orderBy?.direction,
      );

      const [items, total] = await Promise.all([
        ctx.prisma.lesson.findMany({
          where,
          skip,
          take,
          orderBy: ob,
        }),
        ctx.prisma.lesson.count({ where }),
      ]);

      return { items, total, meta: { skip, take } };
    }),

  getById: teacherProcedure
    .input(documentIdValidator())
    .query(async ({ ctx, input }) => {
      const row = await ctx.prisma.lesson.findFirst({
        where: { id: input },
        include: {
          chapter: {
            include: {
              course: {
                select: { id: true, title: true, ownerId: true },
              },
            },
          },
        },
      });
      if (!row) throw new NotFoundException("Lesson", String(input));
      await assertLessonChapterCourseOwnerOrAdmin(ctx, row.chapterId);
      return row;
    }),

  // Create new lesson
  create: teacherProcedure
    .input(CreateSchema)
    .mutation(async ({ ctx, input }) => {
      const chapter = await ctx.prisma.chapter.findFirst({
        where: { id: input.data.chapterId },
        include: {
          course: {
            select: { ownerId: true },
          },
        },
      });
      if (!chapter) {
        throw new NotFoundException("Chapter", String(input.data.chapterId));
      }
      await assertLessonChapterCourseOwnerOrAdmin(ctx, chapter.id);
      await ensureUniqueLessonSlug(ctx, input.data.slug);
      await ensureUniqueLessonPosition(ctx, chapter.id, input.data.position);
      const lesson = await ctx.prisma.lesson.create({
        data: input.data,
        include: {
          chapter: {
            include: {
              course: {
                select: { id: true, title: true },
              },
            },
          },
        },
      });
      return lesson;
    }),

  // Update lesson
  update: teacherProcedure
    .input(UpdateSchema)
    .mutation(async ({ ctx, input }) => {
      const row = await ctx.prisma.lesson.findFirst({
        where: { id: input.id },
        include: {
          chapter: {
            include: {
              course: {
                select: { ownerId: true },
              },
            },
          },
        },
      });
      if (!row) {
        throw new NotFoundException("Lesson", String(input.id));
      }
      await assertLessonChapterCourseOwnerOrAdmin(ctx, row.chapterId);
      if (input.data.slug)
        await ensureUniqueLessonSlug(ctx, input.data.slug, input.id);
      if (
        input.data.position !== undefined &&
        input.data.position !== row.position
      )
        await ensureUniqueLessonPosition(
          ctx,
          row.chapterId,
          input.data.position,
          input.id,
        );

      return await ctx.prisma.lesson.update({
        where: { id: input.id },
        data: input.data,
        include: {
          chapter: {
            include: {
              course: {
                select: { id: true, title: true },
              },
            },
          },
        },
      });
    }),

  // Delete lesson
  delete: teacherProcedure
    .input(documentIdValidator())
    .mutation(async ({ ctx, input }) => {
      const row = await ctx.prisma.lesson.findFirst({
        where: { id: input },
        include: {
          chapter: {
            include: {
              course: {
                select: { ownerId: true },
              },
            },
          },
        },
      });
      if (!row) throw new NotFoundException("Lesson", String(input));
      await assertLessonChapterCourseOwnerOrAdmin(ctx, row.chapterId);
      await ctx.prisma.lesson.delete({
        where: { id: row.id },
      });
      return { success: true };
    }),

  // // Reorder lessons within a chapter
  // reorder: teacherProcedure
  //   .input(
  //     z.object({
  //       chapterId: z.number(),
  //       lessons: z.array(
  //         z.object({
  //           id: z.number(),
  //           position: z.number(),
  //         })
  //       ),
  //     })
  //   )
  //   .mutation(async ({ ctx, input }) => {
  //     // Verify chapter exists and course ownership
  //     const chapter = await ctx.prisma.chapter.findFirst({
  //       where: { id: input.chapterId },
  //       include: {
  //         course: {
  //           select: { ownerId: true },
  //         },
  //       },
  //     });

  //     if (!chapter) {
  //       throw new TRPCError({
  //         code: "NOT_FOUND",
  //         message: "Chapter not found",
  //       });
  //     }

  //     if (chapter.course.ownerId !== ctx.user.id) {
  //       throw new TRPCError({
  //         code: "FORBIDDEN",
  //         message: "Access denied to this chapter",
  //       });
  //     }

  //     // Update all lesson positions in a transaction
  //     await ctx.prisma.$transaction(
  //       input.lessons.map((lesson) =>
  //         ctx.prisma.lesson.update({
  //           where: { id: lesson.id },
  //           data: { position: lesson.position },
  //         })
  //       )
  //     );

  //     return { success: true };
  //   }),

  // Reorder lessons within a chapter
  reorder: teacherProcedure
    .input(ReorderLessonsSchema)
    .mutation(async ({ ctx, input }) => {
      // Verify chapter exists and course ownership
      await assertLessonChapterCourseOwnerOrAdmin(ctx, input.chapterId);

      // Update all lesson positions in a transaction
      await ctx.prisma.$transaction(
        input.lessons.map((lesson) =>
          ctx.prisma.lesson.update({
            where: { id: lesson.id },
            data: { position: lesson.position },
          }),
        ),
      );

      return { success: true };
    }),

  // // Toggle lesson publish status
  // togglePublish: teacherProcedure
  //   .input(z.object({ id: z.number() }))
  //   .mutation(async ({ ctx, input }) => {
  //     // Verify lesson exists and course ownership
  //     const existingLesson = await ctx.prisma.lesson.findFirst({
  //       where: { id: input.id },
  //       include: {
  //         chapter: {
  //           include: {
  //             course: {
  //               select: { ownerId: true },
  //             },
  //           },
  //         },
  //       },
  //     });

  //     if (!existingLesson) {
  //       throw new TRPCError({
  //         code: "NOT_FOUND",
  //         message: "Lesson not found",
  //       });
  //     }

  //     if (existingLesson.chapter.course.ownerId !== ctx.user.id) {
  //       throw new TRPCError({
  //         code: "FORBIDDEN",
  //         message: "Access denied to this lesson",
  //       });
  //     }

  //     const lesson = await ctx.prisma.lesson.update({
  //       where: { id: input.id },
  //       data: {
  //         isPublished: !existingLesson.isPublished,
  //       },
  //     });

  //     return lesson;
  //   }),
});
