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
import { documentIdValidator } from "@/server/api/core/validators";
import { z } from "zod";

// Enum values from the schema
const QuestionTypeEnum = z.enum([
  "MULTIPLE_CHOICE",
  "MULTIPLE_SELECT",
  "TRUE_FALSE",
  "SHORT_ANSWER",
  "ESSAY",
  "FILL_IN_BLANK",
  "MATCHING",
  "ORDERING",
  "FILE_UPLOAD",
  "CODE",
]);

const QuestionDifficultyEnum = z.enum(["EASY", "MEDIUM", "HARD"]);

const CreateSchema = getFormDataSchema({
  title: z.string().min(1).max(255),
  text: z.string().min(1),
  explanation: z.string().optional(),
  type: QuestionTypeEnum,
  points: z.number().min(0).default(1.0),
  difficulty: QuestionDifficultyEnum.default("MEDIUM"),
  position: z.number().min(1).default(1),
  quizId: documentIdValidator().optional(),
});

// const UpdateSchema = getFormDataSchema({
//   title: z.string().min(1).max(255).optional(),
//   text: z.string().min(1).optional(),
//   explanation: z.string().optional(),
//   type: QuestionTypeEnum.optional(),
//   points: z.number().min(0).optional(),
//   difficulty: QuestionDifficultyEnum.optional(),
//   position: z.number().min(1).optional(),
//   quizId: documentIdValidator().optional(),
// }).extend({
//   id: documentIdValidator(),
// });

// Helper functions
async function assertQuestionQuizOwnerOrAdmin(
  ctx: any,
  ownerId: number | null,
) {
  if (!ownerId) throw new AuthorizationException();
  if (isAdmin(ctx.user)) return;
  if (ownerId !== ctx.user.id) {
    throw new AuthorizationException("You are not the owner of this quiz");
  }
}

async function ensureUniqueQuestionPosition(
  ctx: any,
  quizId: number,
  position: number,
  excludeId?: number,
) {
  const existing = await ctx.prisma.question.findFirst({
    where: {
      quizId,
      position,
      ...(excludeId ? { id: { not: excludeId } } : {}),
    },
    select: { id: true },
  });
  if (existing)
    throw new ResourceExistsException("Question", "position", String(position));
}

export const questionRouter = router({
  // List questions for a quiz
  list: teacherProcedure
    .input(
      ListInputSchema.extend({
        filter: z
          .object({
            quizId: documentIdValidator().optional(),
            type: QuestionTypeEnum.optional(),
            difficulty: QuestionDifficultyEnum.optional(),
          })
          .optional()
          .default({}),
      }),
    )
    .query(async ({ ctx, input }) => {
      const filter = input.filter || {};
      const q = input?.search?.q;
      const where: any = {
        ...(filter.quizId ? { quizId: filter.quizId } : {}),
        ...(filter.type ? { type: filter.type } : {}),
        ...(filter.difficulty ? { difficulty: filter.difficulty } : {}),
        ...(q
          ? {
              OR: [
                { title: like(q) },
                { text: like(q) },
                { explanation: like(q) },
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
        ctx.prisma.question.findMany({
          where,
          skip,
          take,
          orderBy: ob,
          include: {
            multipleChoiceOptions: {
              orderBy: { position: "asc" },
            },
            _count: {
              select: {
                userQuestionAttempt: true,
              },
            },
          },
        }),
        ctx.prisma.question.count({ where }),
      ]);

      return { items, total, meta: { skip, take } };
    }),

  // Get single question by ID
  getById: teacherProcedure
    .input(documentIdValidator())
    .query(async ({ ctx, input }) => {
      const row = await ctx.prisma.question.findUnique({
        where: { id: input },
        include: {
          quiz: {
            select: { id: true, title: true, ownerId: true },
          },
          multipleChoiceOptions: {
            orderBy: { position: "asc" },
          },
          _count: {
            select: {
              userQuestionAttempt: true,
            },
          },
        },
      });

      if (!row) throw new NotFoundException("Question", String(input));

      // Verify quiz ownership if question belongs to a quiz
      if (row.quiz && !isAdmin(ctx.user) && row.quiz.ownerId !== ctx.user.id) {
        throw new AuthorizationException("Access denied to this question");
      }

      return row;
    }),

  // Create new question
  create: teacherProcedure
    .input(CreateSchema)
    .mutation(async ({ ctx, input }) => {
      // Verify quiz ownership if creating for a specific quiz
      if (input.data.quizId) {
        // await assertQuestionQuizOwnerOrAdmin(ctx, input.data.quizId);// TODO
        // Ensure unique position within quiz
        await ensureUniqueQuestionPosition(
          ctx,
          input.data.quizId,
          input.data.position,
        );
      }

      return ctx.prisma.question.create({
        data: input.data,
        include: {
          multipleChoiceOptions: {
            orderBy: { position: "asc" },
          },
        },
      });
    }),

  // // Update question
  // update: teacherProcedure
  //   .input(UpdateSchema)
  //   .mutation(async ({ ctx, input }) => {
  //     // Verify question exists and quiz ownership
  //     const row = await ctx.prisma.question.findUnique({
  //       where: { id: input.id },
  //       include: {
  //         quiz: {
  //           select: { ownerId: true },
  //         },
  //       },
  //     });

  //     if (!row) throw new NotFoundException("Question", String(input.id));
  //     if (!row.quiz)
  //       throw new AuthorizationException("Question does not belong to a quiz");
  //     await assertQuestionQuizOwnerOrAdmin(ctx, row.quiz.ownerId);
  //     if (row.quiz && !isAdmin(ctx.user) && row.quiz.ownerId !== ctx.user.id) {
  //       throw new AuthorizationException("Access denied to this question");
  //     }

  //     // Check position uniqueness if updating
  //     if (input.data.position && row.quizId) {
  //       await ensureUniqueQuestionPosition(
  //         ctx,
  //         row.quizId,
  //         input.data.position,
  //         input.id
  //       );
  //     }

  //     return ctx.prisma.question.update({
  //       where: { id: input.id },
  //       data: input.data,
  //       include: {
  //         multipleChoiceOptions: {
  //           orderBy: { position: "asc" },
  //         },
  //       },
  //     });
  //   }),

  // Delete question
  delete: teacherProcedure
    .input(documentIdValidator())
    .mutation(async ({ ctx, input }) => {
      // Verify question exists and quiz ownership
      const row = await ctx.prisma.question.findUnique({
        where: { id: input },
        include: {
          quiz: {
            select: { ownerId: true },
          },
        },
      });

      if (!row) throw new NotFoundException("Question", String(input));

      if (row.quiz) {
        await assertQuestionQuizOwnerOrAdmin(ctx, row.quiz.ownerId);
      }

      return ctx.prisma.question.delete({ where: { id: input } });
    }),

  // // Reorder questions
  // reorder: teacherProcedure
  //   .input(ReorderQuestionsSchema)
  //   .mutation(async ({ ctx, input }) => {
  //     // Verify quiz ownership
  //     await assertQuestionQuizOwnerOrAdmin(ctx, input.quizId);

  //     // Update all question positions in a transaction
  //     await ctx.prisma.$transaction(
  //       input.questions.map((question) =>
  //         ctx.prisma.question.update({
  //           where: { id: question.id },
  //           data: { position: question.position },
  //         })
  //       )
  //     );

  //     return { success: true };
  //   }),

  // // Create multiple choice option
  // createOption: teacherProcedure
  //   .input(CreateMultipleChoiceOptionSchema)
  //   .mutation(async ({ ctx, input }) => {
  //     // Verify question exists and quiz ownership
  //     const question = await ctx.prisma.question.findUnique({
  //       where: { id: input.data.questionId },
  //       include: {
  //         quiz: {
  //           select: { ownerId: true },
  //         },
  //       },
  //     });

  //     if (!question)
  //       throw new NotFoundException("Question", String(input.data.questionId));

  //     if (
  //       question.quiz &&
  //       !isAdmin(ctx.user) &&
  //       question.quiz.ownerId !== ctx.user.id
  //     ) {
  //       throw new AuthorizationException("Access denied to this question");
  //     }

  //     return ctx.prisma.multipleChoiceOption.create({
  //       data: input.data,
  //     });
  //   }),

  // // Update multiple choice option
  // updateOption: teacherProcedure
  //   .input(UpdateMultipleChoiceOptionSchema)
  //   .mutation(async ({ ctx, input }) => {
  //     // Verify option exists and quiz ownership
  //     const option = await ctx.prisma.multipleChoiceOption.findUnique({
  //       where: { id: input.id },
  //       include: {
  //         question: {
  //           include: {
  //             quiz: {
  //               select: { ownerId: true },
  //             },
  //           },
  //         },
  //       },
  //     });

  //     if (!option)
  //       throw new NotFoundException("MultipleChoiceOption", String(input.id));

  //     if (
  //       option.question.quiz &&
  //       !isAdmin(ctx.user) &&
  //       option.question.quiz.ownerId !== ctx.user.id
  //     ) {
  //       throw new AuthorizationException("Access denied to this option");
  //     }

  //     return ctx.prisma.multipleChoiceOption.update({
  //       where: { id: input.id },
  //       data: input.data,
  //     });
  //   }),

  // // Delete multiple choice option
  // deleteOption: teacherProcedure
  //   .input(documentIdValidator())
  //   .mutation(async ({ ctx, input }) => {
  //     // Verify option exists and quiz ownership
  //     const option = await ctx.prisma.multipleChoiceOption.findUnique({
  //       where: { id: input },
  //       include: {
  //         question: {
  //           include: {
  //             quiz: {
  //               select: { ownerId: true },
  //             },
  //           },
  //         },
  //       },
  //     });

  //     if (!option)
  //       throw new NotFoundException("MultipleChoiceOption", String(input));

  //     if (
  //       option.question.quiz &&
  //       !isAdmin(ctx.user) &&
  //       option.question.quiz.ownerId !== ctx.user.id
  //     ) {
  //       throw new AuthorizationException("Access denied to this option");
  //     }

  //     return ctx.prisma.multipleChoiceOption.delete({ where: { id: input } });
  //   }),
});
