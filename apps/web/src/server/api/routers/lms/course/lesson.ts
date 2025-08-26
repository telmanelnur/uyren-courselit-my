import constants from "@/config/constants";
import { responses } from "@/config/strings";
import CourseModel from "@/models/Course";
import LessonModel, { Lesson } from "@/models/Lesson";
import { AssignmentModel, QuizModel } from "@/models/lms";
import {
  AuthorizationException,
  ConflictException,
  NotFoundException,
  ValidationException,
} from "@/server/api/core/exceptions";
import { checkOwnershipWithoutModel } from "@/server/api/core/permissions";
import {
  createDomainRequiredMiddleware,
  createPermissionMiddleware,
  MainContextType,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/core/procedures";
import { getFormDataSchema } from "@/server/api/core/schema";
import { router } from "@/server/api/core/trpc";
import {
  mediaWrappedFieldValidator,
  textEditorContentValidator,
} from "@/server/api/core/validators";
import { deleteMedia } from "@/server/services/media";
import { Constants, UIConstants } from "@workspace/common-models";
import { checkPermission } from "@workspace/utils";
import { z } from "zod";
import { getPrevNextCursor } from "./helpers";

const { permissions } = UIConstants;

const getLessonOrThrow = async (id: string, ctx: MainContextType) => {
  const lesson = await LessonModel.findOne({
    lessonId: id,
    domain: ctx.domainData.domainObj._id,
  });

  if (!lesson) {
    throw new NotFoundException("Lesson", id);
  }

  if (!checkPermission(ctx.user.permissions, [permissions.manageAnyCourse])) {
    if (!checkOwnershipWithoutModel(lesson, ctx)) {
      throw new NotFoundException("Lesson", id);
    } else {
      if (!checkPermission(ctx.user.permissions, [permissions.manageCourse])) {
        throw new AuthorizationException(
          "You are not allowed to update this lesson",
        );
      }
    }
  }

  return lesson;
};
type LessonValidatorProps = {
  type?: Lesson["type"];
  content?: Lesson["content"];
  media?: Lesson["media"];
};
export const lessonValidator = (lessonData: LessonValidatorProps) => {
  if (lessonData.content) {
    validateTextContent(lessonData);
  }
  // validateMediaContent(lessonData);
};
function validateTextContent(lessonData: LessonValidatorProps) {
  const content = lessonData.content;

  if ([constants.text, constants.embed].includes(lessonData.type as any)) {
    if (
      lessonData.type === constants.text &&
      content &&
      typeof content === "object"
    ) {
      return;
    }
    // if (lessonData.type === constants.embed && content && content.value) {
    //   return;
    // }

    throw new ValidationException(responses.content_cannot_be_null);
  }

  //   if (lessonData.type === quiz) {
  //       if (content && content.questions) {
  //           validateQuizContent(content.questions);
  //       }
  //   }
}
const updateLesson = async ({
  lessonData,
  ctx,
}: {
  lessonData: Partial<
    Pick<
      Lesson,
      | "title"
      | "content"
      | "media"
      | "downloadable"
      | "requiresEnrollment"
      | "type"
    >
  > & { lessonId: string };
  ctx: MainContextType;
}) => {
  let lesson = await getLessonOrThrow(lessonData.lessonId, ctx);
  lessonData.lessonId = lessonData.lessonId;

  lessonData.type = lesson.type;
  lessonValidator(lessonData as LessonValidatorProps);

  for (const key of Object.keys(lessonData)) {
    (lesson as any)[key] = (lessonData as any)[key];
  }

  lesson = await (lesson as any).save();
  return lesson;
};

export const lessonRouter = router({
  getById: protectedProcedure
    .use(createDomainRequiredMiddleware())
    .input(
      z.object({
        lessonId: z.string().min(1),
      }),
    )
    .query(async ({ ctx, input }) => {
      return getLessonOrThrow(input.lessonId, ctx as MainContextType);
    }),
  create: protectedProcedure
    .use(createDomainRequiredMiddleware())
    .use(createPermissionMiddleware([permissions.manageCourse]))
    .input(
      getFormDataSchema({
        title: z.string().min(1).max(100),
        content: textEditorContentValidator(),
        type: z.nativeEnum(Constants.LessonType),
        downloadable: z.boolean(),
        requiresEnrollment: z.boolean(),
        media: mediaWrappedFieldValidator().optional(),
        groupId: z.string().min(1),
        courseId: z.string().min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      lessonValidator(input.data);

      const course = await CourseModel.findOne({
        courseId: input.data.courseId,
        domain: ctx.domainData.domainObj._id,
      });
      if (!course) throw new NotFoundException("Course", input.data.courseId);
      if (course.isBlog)
        throw new ConflictException(responses.cannot_add_to_blogs); // TODO: refactor this
      const group = course.groups.find(
        (group) => group.groupId === input.data.groupId,
      );
      if (!group) throw new NotFoundException("Group", input.data.groupId);
      const lesson = await LessonModel.create({
        domain: ctx.domainData.domainObj._id,
        title: input.data.title,
        type: input.data.type,
        content: input.data.content,
        media: input.data.media,
        downloadable: input.data.downloadable,
        creatorId: ctx.user._id, // TODO: refactor this
        courseId: course.courseId,
        groupId: input.data.groupId,
        requiresEnrollment: input.data.requiresEnrollment,
      });

      course.lessons.push(lesson.lessonId);
      group.lessonsOrder.push(lesson.lessonId);
      await course.save();

      return lesson;
    }),
  update: protectedProcedure
    .use(createDomainRequiredMiddleware())
    .input(
      getFormDataSchema({
        title: z.string().min(1).max(100).optional(),
        content: textEditorContentValidator().optional(),
        type: z.nativeEnum(Constants.LessonType).optional(),
        downloadable: z.boolean().optional(),
        requiresEnrollment: z.boolean().optional(),
        media: mediaWrappedFieldValidator().nullable().optional(),
      }).extend({
        id: z.string().min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return updateLesson({
        lessonData: {
          title: input.data.title,
          content: input.data.content,
          type: input.data.type,
          downloadable: input.data.downloadable,
          requiresEnrollment: input.data.requiresEnrollment,
          media: input.data.media as any,
          lessonId: input.id,
        },
        ctx: ctx as MainContextType,
      });
    }),
  delete: protectedProcedure
    .use(createDomainRequiredMiddleware())
    .input(
      z.object({
        id: z.string().min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const lesson = await getLessonOrThrow(input.id, ctx as any);
      let course = await CourseModel.findOne({
        domain: ctx.domainData.domainObj._id,
      }).elemMatch("lessons", { $eq: lesson.lessonId });
      if (!course) {
        throw new NotFoundException("Course", lesson.courseId);
      }

      course.lessons.splice(course.lessons.indexOf(lesson.lessonId), 1);
      await course.save();

      if (lesson.media?.mediaId) {
        await deleteMedia(lesson.media.mediaId);
      }

      await LessonModel.deleteOne({
        _id: lesson._id,
        domain: ctx.domainData.domainObj._id,
      });
      return true;
    }),

  searchAssignmentEntities: protectedProcedure
    .use(createDomainRequiredMiddleware())
    .use(createPermissionMiddleware([permissions.manageAnyCourse]))
    .input(
      z.object({
        search: z.string().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { search } = input;
      const assignments = await AssignmentModel.find({
        domain: ctx.domainData.domainObj._id,
        title: search ? { $regex: search, $options: "i" } : undefined,
      });
      const quizzes = await QuizModel.find({
        domain: ctx.domainData.domainObj._id,
        title: search ? { $regex: search, $options: "i" } : undefined,
      });
      return {
        assignments,
        quizzes,
      };
    }),

  publicGetById: publicProcedure
    .use(createDomainRequiredMiddleware())
    .input(
      z.object({
        courseId: z.string().min(1),
        lessonId: z.string().min(1),
      }),
    )
    .query(async ({ ctx, input }) => {
      const course = await CourseModel.findOne({
        courseId: input.courseId,
        domain: ctx.domainData.domainObj._id,
      });
      if (!course) {
        throw new NotFoundException("Course", input.lessonId);
      }
      const lesson = await LessonModel.findOne({
        courseId: input.courseId,
        lessonId: input.lessonId,
        domain: ctx.domainData.domainObj._id,
      });
      if (!lesson) {
        throw new NotFoundException("Lesson", input.lessonId);
      }
      const { nextLesson, prevLesson } = await getPrevNextCursor(
        lesson.courseId,
        ctx.domainData.domainObj._id,
        lesson.lessonId,
      );
      return {
        lessonId: lesson.lessonId,
        title: lesson.title,
        type: lesson.type,
        content: lesson.content,
        media: lesson.media,
        downloadable: lesson.downloadable,
        requiresEnrollment: lesson.requiresEnrollment,
        meta: {
          nextLesson: nextLesson || null,
          prevLesson: prevLesson || null,
        },
      };
    }),
});
