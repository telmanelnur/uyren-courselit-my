import { QuestionModel, QuizModel } from "@/models/lms";
import { NotFoundException, ValidationException } from "@/server/api/core/exceptions";
import { createDomainRequiredMiddleware, createPermissionMiddleware, MainContextType, protectedProcedure } from "@/server/api/core/procedures";
import { getFormDataSchema, ListInputSchema } from "@/server/api/core/schema";
import { router } from "@/server/api/core/trpc";
import { documentIdValidator } from "@/server/api/core/validators";
import { UIConstants } from "@workspace/common-models";
import { RootFilterQuery } from "mongoose";
import { z } from "zod";
import { QuestionProviderFactory } from "../question-bank/_providers";
import { ObjectId } from "mongodb";

const findOrAssertQuiz = async (quizId: string, ctx: MainContextType) => {
    const quiz = await QuizModel.findOne({
        _id: quizId,
        domain: ctx.domainData.domainObj._id,
    });
    if (!quiz) throw new NotFoundException("Quiz not found");
    return quiz;
}

const getQuestionProvider = (questionType: string) => {
    const provider = QuestionProviderFactory.getProvider(questionType);
    if (!provider) {
        throw new ValidationException(`Unsupported question type: ${questionType}`);
    }
    return provider;
}

const { permissions } = UIConstants;

export const quizQuestionsRouter = router({
    listQuestions: protectedProcedure
        .use(createDomainRequiredMiddleware())
        .use(createPermissionMiddleware([permissions.manageAnyCourse]))
        .input(ListInputSchema.extend({
            filter: z.object({
                quizId: documentIdValidator(),
                type: z.enum(["multiple_choice", "short_answer", "true_false"]).optional(),
            }),
        }))
        .query(async ({ ctx, input }) => {
            const quiz = await findOrAssertQuiz(input.filter.quizId, ctx as any);
            const query: RootFilterQuery<typeof QuestionModel> = {
                domain: ctx.domainData.domainObj._id,
                _id: { $in: quiz.questionIds },
                ...(input.filter?.type ? { type: input.filter.type } : {}),
            };
            const includeCount = input.pagination?.includePaginationCount ?? true;
            const [items, total] = await Promise.all([
                QuestionModel.find(query)
                    .skip(input.pagination?.skip || 0)
                    .limit(input.pagination?.take || 20)
                    .sort(input.orderBy ? { [input.orderBy.field]: input.orderBy.direction === "asc" ? 1 : -1 } : { createdAt: -1 })
                    .lean(),
                includeCount ? QuestionModel.countDocuments(query) : Promise.resolve(0)
            ]);
            return {
                items: items.map(item => ({
                    ...item,
                })),
                total,
                meta: {
                    includePaginationCount: input.pagination?.includePaginationCount,
                    skip: input.pagination?.skip || 0,
                    take: input.pagination?.take || 20,
                }
            };
        }),

    createQuestion: protectedProcedure
        .use(createDomainRequiredMiddleware())
        .use(createPermissionMiddleware([permissions.manageAnyCourse]))
        .input(getFormDataSchema({
            text: z.string().min(1),
            type: z.enum(["multiple_choice", "short_answer", "true_false"]),
            points: z.number().min(0),
            explanation: z.string().optional(),
        }).extend({
            quizId: documentIdValidator(),
        }))
        .mutation(async ({ ctx, input }) => {
            const quiz = await findOrAssertQuiz(input.quizId, ctx as any);
            const question = await QuestionModel.create({
                ...input.data,
                domain: ctx.domainData.domainObj._id,
                teacherId: ctx.user._id,
            });
            const newQestionIds = Array.from(new Set([...quiz.questionIds, question._id]));
            await QuizModel.findByIdAndUpdate(input.quizId, {
                questionIds: newQestionIds,
                totalPoints: quiz.totalPoints + input.data.points,
            });
            return question;
        }),

    updateQuestion: protectedProcedure
        .use(createDomainRequiredMiddleware())
        .use(createPermissionMiddleware([permissions.manageAnyCourse]))
        .input(z.object({
            id: documentIdValidator(),
            quizId: documentIdValidator(),
            data: z.any(), // Let the provider handle validation
        }))
        .mutation(async ({ ctx, input }) => {
            const quiz = await findOrAssertQuiz(input.quizId, ctx as any);
            if (!quiz.questionIds.includes(new ObjectId(input.id))) throw new NotFoundException("Question not found");
            const question = await QuestionModel.findOne({
                _id: input.id,
                domain: ctx.domainData.domainObj._id
            });
            if (!question) throw new NotFoundException("Question not found");

            // Calculate points difference for quiz update
            const oldPoints = question.points || 0;
            const newPoints = input.data.points || oldPoints;
            const pointsDifference = newPoints - oldPoints;

            // Get the provider for the question type
            const provider = getQuestionProvider(question.type);

            // Get validated update data from the provider instance
            if (input.data) {
                const validatedUpdateData = provider.getValidatedUpdateData(question, input.data);
                // Update with validated data
                await QuestionModel.findByIdAndUpdate(input.id, validatedUpdateData, { new: true });
            }

            // Update quiz total points if points changed
            if (pointsDifference !== 0) {
                await QuizModel.findByIdAndUpdate(input.quizId, {
                    $inc: { totalPoints: pointsDifference }
                });
            }

            // Return the updated question
            const updated = await QuestionModel.findById(input.id);
            return updated;
        }),

    deleteQuestion: protectedProcedure
        .use(createDomainRequiredMiddleware())
        .use(createPermissionMiddleware([permissions.manageAnyCourse]))
        .input(z.object({
            id: documentIdValidator(),
            quizId: documentIdValidator(),
        }))
        .mutation(async ({ ctx, input }) => {
            const quiz = await findOrAssertQuiz(input.quizId, ctx as any);
            if (!quiz.questionIds.includes(new ObjectId(input.id))) throw new NotFoundException("Question not found");
            const question = await QuestionModel.findOne({
                _id: input.id,
                domain: ctx.domainData.domainObj._id
            });
            if (!question) throw new NotFoundException("Question not found");
            await QuizModel.findByIdAndUpdate(input.quizId, {
                $pull: { questionIds: question._id },
                $inc: { totalPoints: -(question.points || 0) }
            });
            await QuestionModel.findByIdAndDelete(input.id);
            return { success: true };
        }),

    getQuestionById: protectedProcedure
        .use(createDomainRequiredMiddleware())
        .use(createPermissionMiddleware([permissions.manageAnyCourse]))
        .input(z.object({
            id: documentIdValidator(),
            quizId: documentIdValidator(),
        }))
        .query(async ({ ctx, input }) => {
            const quiz = await findOrAssertQuiz(input.quizId, ctx as any);
            if (!quiz.questionIds.includes(new ObjectId(input.id))) throw new NotFoundException("Question not found");
            const question = await QuestionModel.findOne({
                _id: input.id,
                domain: ctx.domainData.domainObj._id
            });
            if (!question) throw new NotFoundException("Question not found");
            return question;
        }),
});
