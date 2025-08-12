import constants from "@/config/constants";
import { internal, responses } from "@/config/strings";
import { Log } from "@/lib/logger";
import CourseModel from "@/models/Course";
import LessonModel from "@/models/Lesson";
import MembershipModel from "@/models/Membership";
import PageModel from "@/models/Page";
import UserModel from "@/models/User";
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
} from "@/server/api/core/procedures";
import { getFormDataSchema, ListInputSchema } from "@/server/api/core/schema";
import { router } from "@/server/api/core/trpc";
import { paginate } from "@/server/api/core/utils";
import {
  documentIdValidator,
  documentSlugValidator,
  mediaWrappedFieldValidator,
  toSlug,
} from "@/server/api/core/validators";
import { deleteMedia } from "@/server/services/media";
import { InternalCourse } from "@workspace/common-logic";
import { Constants, Drip, Email, Group, Lesson, UIConstants } from "@workspace/common-models";
import { checkPermission, slugify } from "@workspace/utils";
import mongoose from "mongoose";
import { ActivityType } from "node_modules/@workspace/common-models/src/constants";
import { z } from "zod";
import { getActivities } from "../../activity/helpers";
import { getPlans } from "../../community/helpers";
import { verifyMandatoryTags } from "../main/helpers";
import { deleteAllLessons, getCourseOrThrow, getPrevNextCursor, validateCourse } from "./helpers";


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


const getInitialLayout = (type: "course" | "download") => {
  const layout: Record<string, any>[] = [
    {
      name: "header",
      deleteable: false,
      shared: true,
    },
    {
      name: "banner",
    },
  ];
  if (type === Constants.CourseType.COURSE) {
    layout.push({
      name: "content",
      settings: {
        title: "Curriculum",
        headerAlignment: "center",
      },
    });
  }
  layout.push({
    name: "footer",
    deleteable: false,
    shared: true,
  });
  return layout;
};


const addGroup = async ({
  id,
  name,
  collapsed,
  ctx,
}: {
  id: string;
  name: string;
  collapsed: boolean;
  ctx: MainContextType;
}) => {
  const course = await getCourseOrThrow(undefined, ctx, id);
  if (
    course.type === Constants.CourseType.DOWNLOAD &&
    course.groups?.length === 1
  ) {
    throw new ConflictException(responses.download_course_cannot_have_groups);
  }

  const existingName = (group: Group) => group.name === name;

  if (course.groups?.some(existingName)) {
    throw new ConflictException(responses.existing_group);
  }

  const maximumRank = course.groups?.reduce(
    (acc: number, value: { rank: number }) =>
      value.rank > acc ? value.rank : acc,
    0,
  );

  await (course as any).groups.push({
    rank: maximumRank + 1000,
    name,
  } as Group);

  await course.save();

  return await formatCourse(course.courseId, ctx);
};

const removeGroup = async (
  id: string,
  courseId: string,
  ctx: MainContextType,
) => {
  const course = await getCourseOrThrow(undefined, ctx, courseId);
  const group = course.groups?.find((group) => group.id === id);

  if (!group) {
    return await formatCourse(course.courseId, ctx);
  }

  if (
    course.type === Constants.CourseType.DOWNLOAD &&
    course.groups?.length === 1
  ) {
    throw new ConflictException(responses.download_course_last_group_cannot_be_removed);
  }

  const countOfAssociatedLessons = await LessonModel.countDocuments({
    courseId,
    groupId: group.id,
    domain: ctx.domainData.domainObj._id,
  });

  if (countOfAssociatedLessons > 0) {
    throw new ConflictException(responses.group_not_empty);
  }

  await (course.groups as any).pull({ _id: id });
  await course.save();

  await UserModel.updateMany(
    {
      domain: ctx.domainData.domainObj._id,
    },
    {
      $pull: {
        "purchases.$[elem].accessibleGroups": id,
      },
    },
    {
      arrayFilters: [{ "elem.courseId": courseId }],
    },
  );

  return await formatCourse(course.courseId, ctx);
};

const updateGroup = async ({
  id,
  courseId,
  name,
  rank,
  collapsed,
  lessonsOrder,
  drip,
  ctx,
}: {
  id: string;
  courseId: string;
  name: string;
  rank: number;
  collapsed: boolean;
  lessonsOrder: string[];
  drip: Drip;
  ctx: MainContextType;
}) => {
  const course = await getCourseOrThrow(undefined, ctx, courseId);

  const $set: any = {};
  if (name) {
    const existingName = (group: Group) =>
      group.name === name && group.id.toString() !== id;

    if (course.groups?.some(existingName)) {
      throw new ConflictException(responses.existing_group);
    }

    $set["groups.$.name"] = name;
  }

  if (rank) {
    $set["groups.$.rank"] = rank;
  }

  if (
    lessonsOrder &&
    lessonsOrder.every((lessonId) => course.lessons?.includes(lessonId)) &&
    lessonsOrder.every((lessonId) =>
      course.groups
        ?.find((group) => group.id === id)
        ?.lessonsOrder.includes(lessonId),
    )
  ) {
    $set["groups.$.lessonsOrder"] = lessonsOrder;
  }

  if (typeof collapsed === "boolean") {
    $set["groups.$.collapsed"] = collapsed;
  }

  if (drip) {
    if (drip.status) {
      $set["groups.$.drip.status"] = drip.status;
    }
    if (drip.type) {
      $set["groups.$.drip.type"] = drip.type;
    }
    if (drip.type === Constants.dripType[0]) {
      if (drip.delayInMillis) {
        $set["groups.$.drip.delayInMillis"] =
          drip.delayInMillis * 86400000;
      }
      $set["groups.$.drip.dateInUTC"] = drip.dateInUTC;
    }
    if (drip.type === Constants.dripType[1]) {
      $set["groups.$.drip.delayInMillis"] = null;
      if (drip.dateInUTC) {
        $set["groups.$.drip.dateInUTC"] = drip.dateInUTC;
      }
    }
    if (drip.email) {
      if (!drip.email.content || !drip.email.subject) {
        throw new ValidationException(responses.invalid_drip_email);
      }
      const parsedContent: Email = JSON.parse(drip.email.content);
      verifyMandatoryTags(parsedContent.content);

      $set["groups.$.drip.email"] = {
        content: parsedContent,
        subject: drip.email.subject,
        published: true,
        delayInMillis: 0,
      };
    } else {
      $set["groups.$.drip.email"] = null;
    }
  }

  return await CourseModel.findOneAndUpdate(
    {
      domain: ctx.domainData.domainObj._id,
      courseId: course.courseId,
      "groups._id": id,
    },
    { $set },
    { new: true },
  );
};
const setupCourse = async ({
  title,
  type,
  ctx,
}: {
  title: string;
  type: "course" | "download";
  ctx: MainContextType;
}) => {
  const page = await PageModel.create({
    domain: ctx.domainData.domainObj._id,
    name: title,
    creatorId: ctx.user.userId,
    pageId: slugify(title.toLowerCase()),
  });

  const course = await CourseModel.create({
    domain: ctx.domainData.domainObj._id,
    title: title,
    cost: 0,
    costType: constants.costFree,
    privacy: constants.unlisted,
    creatorId: ctx.user.userId,
    creatorName: ctx.user.name,
    slug: slugify(title.toLowerCase()),
    type: type,
    pageId: page.pageId,
  });
  await addGroup({
    id: course.courseId,
    name: internal.default_group_name,
    collapsed: false,
    ctx,
  });
  page.entityId = course.courseId;
  page.layout = getInitialLayout(type);
  await page.save();

  return course;
};
const setupBlog = async ({
  title,
  ctx,
}: {
  title: string;
  ctx: MainContextType;
}) => {
  const course = await CourseModel.create({
    domain: ctx.domainData.domainObj._id,
    title: title,
    cost: 0,
    costType: constants.costFree,
    privacy: constants.unlisted,
    creatorId: ctx.user.userId,
    creatorName: ctx.user.name,
    slug: slugify(title.toLowerCase()),
    type: constants.blog,
  });

  return course;
};


export const courseRouter = router({
  list: protectedProcedure
    .use(createDomainRequiredMiddleware())
    .use(createPermissionMiddleware([
      UIConstants.permissions.manageCourse,
      UIConstants.permissions.manageAnyCourse,
    ]))
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
              ctx: ctx as any,
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

  create: protectedProcedure
    .use(createDomainRequiredMiddleware())
    .use(createPermissionMiddleware([
      UIConstants.permissions.manageCourse,
    ]))
    .input(getFormDataSchema({
      title: z.string().min(1).max(255),
      type: z.nativeEnum(Constants.CourseType),
    }))
    .mutation(async ({ ctx, input }) => {
      if (input.data.type === "blog") {
        return await setupBlog({
          title: input.data.title,
          ctx: ctx as any,
        });
      } else {
        return await setupCourse({
          title: input.data.title,
          type: input.data.type,
          ctx: ctx as any,
        });
      }
    }),

  update: protectedProcedure
    .use(createDomainRequiredMiddleware())
    .input(getFormDataSchema({
      title: z.string().min(1).max(255).optional(),
      // type: z.nativeEnum(Constants.CourseType).optional(),
      published: z.boolean().optional(),
      privacy: z.nativeEnum(Constants.ProductAccessType).optional(),
      description: z.string().optional(),
      featuredImage: mediaWrappedFieldValidator().nullable().optional(),
    }).extend({
      courseId: z.string(),
    })).mutation(async ({ ctx, input }) => {
      let course = await getCourseOrThrow(undefined, ctx, input.courseId);

      for (const key of Object.keys(input.data)) {
        if (
          key === "published" &&
          !checkPermission(ctx.user.permissions, [permissions.publishCourse])
        ) {
          throw new AuthorizationException(responses.action_not_allowed);
        }

        if (key === "published" && !ctx.user.name) {
          throw new ValidationException(responses.profile_incomplete);
        }

        (course as any)[key] = (input as any).data[key];
      }

      course = await validateCourse(course, ctx as any) as any;
      course = await course.save();
      await PageModel.updateOne(
        { entityId: course.courseId, domain: ctx.domainData.domainObj._id },
        { $set: { name: course.title } },
      );
      return await formatCourse(course.courseId, ctx);
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
          await deleteMedia(course.featuredImage.mediaId);
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
      return true;
    }),
});
