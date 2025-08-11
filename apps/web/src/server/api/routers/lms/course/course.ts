import constants from "@/config/constants";
import { Log } from "@/lib/logger";
import CourseModel from "@/models/Course";
import MembershipModel from "@/models/Membership";
import PageModel from "@/models/Page";
import {
  AuthorizationException,
  NotFoundException,
} from "@/server/api/core/exceptions";
import { checkOwnershipWithoutModel } from "@/server/api/core/permissions";
import {
  createDomainRequiredMiddleware,
  protectedProcedure,
} from "@/server/api/core/procedures";
import { getFormDataSchema, ListInputSchema } from "@/server/api/core/schema";
import { router } from "@/server/api/core/trpc";
import { paginate } from "@/server/api/core/utils";
import {
  documentIdValidator,
  documentSlugValidator,
  toSlug,
} from "@/server/api/core/validators";
import { deleteMedia } from "@/server/services/media";
import { connectToDatabase, InternalCourse } from "@workspace/common-logic";
import { Constants, Lesson, UIConstants } from "@workspace/common-models";
import { checkPermission } from "@workspace/utils";
import mongoose from "mongoose";
import { ActivityType } from "node_modules/@workspace/common-models/src/constants";
import { z } from "zod";
import { getActivities } from "../../activity/helpers";
import { getPlans } from "../../community/helpers";
import { deleteAllLessons, getPrevNextCursor } from "./helpers";

const CreateSchema = getFormDataSchema({
  slug: documentSlugValidator().transform(toSlug),
  title: z.string().min(1).max(255),
  description: z.string().optional(),
  thumbnailImageId: documentIdValidator().optional(),
  price: z.number().min(0).optional(),
  categoryId: documentIdValidator().optional(),
  isPublished: z.boolean().default(false),
  isGlobal: z.boolean().default(false),
});

const UpdateSchema = getFormDataSchema({
  slug: documentSlugValidator().transform(toSlug).optional(),
  title: z.string().min(1).max(255).optional(),
  description: z.string().optional(),
  thumbnailImageId: documentIdValidator().nullable().optional(),
  price: z.number().min(0).nullable().optional(),
  categoryId: documentIdValidator().nullable().optional(),
  isPublished: z.boolean().optional(),
  isGlobal: z.boolean().optional(),
}).extend({
  id: documentIdValidator(),
});

const { permissions } = UIConstants;

async function formatCourse(
  courseId: string,
  ctx: {
    domainData: { domainObj: { _id: mongoose.Types.ObjectId } };
  }
) {
  const course = await CourseModel.findOne({
    courseId,
    domain: ctx.domainData.domainObj._id,
  }).lean();

  if (!course) {
    throw new Error("Course not found");
  }

  const paymentPlans = await getPlans({
    planIds: course!.paymentPlans,
    domainId: ctx.domainData.domainObj._id,
  });

  if (
    [Constants.CourseType.COURSE, Constants.CourseType.DOWNLOAD].includes(
      course.type as any
    )
  ) {
    const { nextLesson } = await getPrevNextCursor(
      course.courseId,
      ctx.domainData.domainObj._id
    );
    (course as any).firstLesson = nextLesson;
  }

  const result = {
    ...course,
    groups: course!.groups?.map((group: any) => ({
      ...group,
      id: group._id.toString(),
    })),
    paymentPlans,
  };
  return result;
}

export const getCourseOrThrow = async (
  id: mongoose.Types.ObjectId | undefined,
  ctx: {
    user: {
      _id: mongoose.Types.ObjectId | string;
      userId: mongoose.Types.ObjectId | string;
      permissions: string[];
    };
    domainData: { domainObj: { _id: mongoose.Types.ObjectId } };
  },
  courseId?: string
) => {
  const query = courseId
    ? {
        courseId,
      }
    : {
        _id: id,
      };

  const course = await CourseModel.findOne({
    ...query,
    domain: ctx.domainData.domainObj._id,
  });

  if (!course) {
    throw new NotFoundException("Course", String(courseId || id));
  }

  if (!checkPermission(ctx.user.permissions, [permissions.manageAnyCourse])) {
    if (!checkOwnershipWithoutModel(course, ctx)) {
      throw new NotFoundException("Course", String(courseId || id));
    } else {
      if (!checkPermission(ctx.user.permissions, [permissions.manageCourse])) {
        throw new AuthorizationException(
          `You are not allowed to manage this course`
        );
      }
    }
  }

  return course;
};

export const courseRouter = router({
  list: protectedProcedure
    .use(createDomainRequiredMiddleware())
    .input(
      ListInputSchema.extend({
        filter: z
          .object({
            type: z.string().optional(),
          })
          .optional()
          .default({}),
      })
    )
    .query(async ({ ctx, input }) => {
      await connectToDatabase();
      if (
        !checkPermission(ctx.user.permissions, [
          UIConstants.permissions.manageCourse,
          UIConstants.permissions.manageAnyCourse,
        ])
      ) {
        throw new AuthorizationException(
          "You are not allowed to manage this course"
        );
      }
      const query: Partial<Omit<InternalCourse, "type">> & {
        $text?: Record<string, unknown>;
        type?: string | { $in: string[] };
      } = {
        domain: ctx.domainData.domainObj._id,
      };
      if (
        !checkPermission(ctx.user.permissions, [
          UIConstants.permissions.manageAnyCourse,
        ])
      ) {
        query.creatorId = `${ctx.user.userId || ctx.user._id}`;
      }
      if (input.filter.type) {
        query.type = { $in: [input.filter.type] };
      } else {
        query.type = { $in: [constants.download, constants.course] };
      }
      if (input.search?.q) query.$text = { $search: input.search.q };
      const paginationMeta = paginate(input.pagination);
      const orderBy = input.orderBy || {
        field: "createdAt",
        direction: "desc",
      };
      const sortObject: Record<string, 1 | -1> = {
        [orderBy.field]: orderBy.direction === "asc" ? 1 : -1,
      };
      const [items, total] = await Promise.all([
        CourseModel.find(query as any)
          .skip(paginationMeta.skip)
          .limit(paginationMeta.take)
          .sort(sortObject),
        paginationMeta.includePaginationCount
          ? CourseModel.countDocuments(query as any)
          : Promise.resolve(null),
      ]);

      const data = await Promise.all(
        items.map(async (course) => ({
          ...course,
          customers: await MembershipModel.countDocuments({
            entityId: course.courseId,
            entityType: Constants.MembershipEntityType.COURSE,
            domain: ctx.domainData.domainObj._id,
          }),
          sales: (
            await getActivities({
              entityId: course.courseId,
              type: ActivityType.PURCHASED,
              duration: "lifetime",
              ctx,
            })
          ).count,
        }))
      );

      return {
        items: data,
        total,
        meta: paginationMeta,
      };
    }),

  // Get single course by ID
  getByCourseId: protectedProcedure
    .use(createDomainRequiredMiddleware())
    .input(
      z.object({
        courseId: documentIdValidator(),
        asGuest: z.boolean().optional().default(false),
        withLessons: z.boolean().optional().default(false),
      })
    )
    .query(async ({ ctx, input }) => {
      const course = await CourseModel.findOne({
        courseId: input.courseId,
        domain: ctx.domainData.domainObj._id,
      }).lean();

      if (!course) {
        throw new NotFoundException("Course", String(input.courseId));
      }

      if (ctx.user && !input.asGuest) {
        const isOwner =
          checkPermission(ctx.user.permissions, [
            UIConstants.permissions.manageAnyCourse,
          ]) || checkOwnershipWithoutModel(course, ctx);

        if (isOwner) {
          return await formatCourse(course.courseId, ctx);
        }
      }

      if (!course.published) {
        throw new NotFoundException("Course", String(input.courseId));
      }
      // if (
      //     [constants.course, constants.download].includes(
      //         course.type as
      //             | typeof constants.course
      //             | typeof constants.download,
      //     )
      // ) {
      //     const { nextLesson } = await getPrevNextCursor(
      //         course.courseId,
      //         ctx.domainData.domainObj._id,
      //     );
      //     (course as any).firstLesson = nextLesson;
      // }
      // course.groups = accessibleGroups;
      return await formatCourse(course.courseId, ctx);
    }),

  getByCourseDetailed: protectedProcedure
    .use(createDomainRequiredMiddleware())
    .input(
      z.object({
        courseId: documentIdValidator(),
        asGuest: z.boolean().optional().default(false),
      })
    )
    .query(async ({ ctx, input }) => {
      const course = await CourseModel.findOne({
        courseId: input.courseId,
        domain: ctx.domainData.domainObj._id,
      })
        .populate<{
          lessons: Lesson[];
        }>({
          path: "lessons",
          select: "lessonId type title groupId",
        })
        .lean();

      if (!course) {
        throw new NotFoundException("Course", String(input.courseId));
      }

      if (ctx.user && !input.asGuest) {
        const isOwner =
          checkPermission(ctx.user.permissions, [
            UIConstants.permissions.manageAnyCourse,
          ]) || checkOwnershipWithoutModel(course, ctx);

        if (isOwner) {
          const formatted = await formatCourse(course.courseId, ctx);
          return formatted as Omit<typeof formatted, "lessons"> & {
            lessons: Array<
              Pick<Lesson, "title" | "groupId" | "lessonId" | "type"> & {
                id: string;
              }
            >;
          };
        }
      }

      if (!course.published) {
        throw new NotFoundException("Course", String(input.courseId));
      }
      const formatted = await formatCourse(course.courseId, ctx);
      return formatted as Omit<typeof formatted, "lessons"> & {
        lessons: Array<
          Pick<Lesson, "title" | "groupId" | "lessonId" | "type"> & {
            id: string;
          }
        >;
      };
    }),

  delete: protectedProcedure
    .use(createDomainRequiredMiddleware())
    .input(
      z.object({
        courseId: documentIdValidator(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const course = await getCourseOrThrow(undefined, ctx, input.courseId);
      await deleteAllLessons(course.courseId, ctx as any);
      if (course.featuredImage) {
        try {
          await deleteMedia(course.featuredImage);
        } catch (err: any) {
          Log.error(err.message, {
            stack: err.stack,
          });
        }
      }
      await PageModel.deleteOne({
        entityId: course.courseId,
        domain: ctx.domainData.domainObj._id,
      });
      await CourseModel.deleteOne({
        domain: ctx.domainData.domainObj._id,
        courseId: course.courseId,
      });

      return {
        success: true,
      };
    }),
});
