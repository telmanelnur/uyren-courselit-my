import { Log } from "@/lib/logger";
import ReviewModel from "@/models/lms/Review";
import { NotFoundException } from "@/server/api/core/exceptions";
import { checkOwnershipWithoutModel } from "@/server/api/core/permissions";
import {
  createDomainRequiredMiddleware,
  createPermissionMiddleware,
  MainContextType,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/core/procedures";
import { getFormDataSchema, ListInputSchema } from "@/server/api/core/schema";
import { router } from "@/server/api/core/trpc";
import { paginate } from "@/server/api/core/utils";
import {
  mediaWrappedFieldValidator,
  textEditorContentValidator,
} from "@/server/api/core/validators";
import { deleteMedia } from "@/server/services/media";
import { InternalReview } from "@/models/lms/Review";
import { Media, UIConstants } from "@workspace/common-models";
import { checkPermission } from "@workspace/utils";
import mongoose, { RootFilterQuery } from "mongoose";
import { z } from "zod";

const checkReviewOwnership = (
  review: InternalReview | null,
  ctx: {
    user: {
      _id: mongoose.Types.ObjectId | string;
      userId: mongoose.Types.ObjectId | string;
    };
  },
) => {
  if (!review || !review.authorId) return false;

  return (
    review.authorId!.toString() === ctx.user.userId ||
    review.authorId!.toString() === ctx.user._id?.toString()
  );
};

const getReviewOrThrow = async (
  reviewId: string | undefined,
  ctx: MainContextType,
  reviewIdParam?: string,
) => {
  const id = reviewId || reviewIdParam;
  if (!id) {
    throw new Error("Review ID is required");
  }

  const review = await ReviewModel.findOne({
    reviewId: id,
    domain: ctx.domainData.domainObj._id,
  }).lean();

  if (!review) {
    throw new NotFoundException("Review", String(id));
  }

  return review;
};

export const reviewRouter = router({
  list: protectedProcedure
    .use(createDomainRequiredMiddleware())
    .use(
      createPermissionMiddleware([
        UIConstants.permissions.manageCourse,
        UIConstants.permissions.manageAnyCourse,
      ]),
    )
    .input(
      ListInputSchema.extend({
        filter: z
          .object({
            published: z.boolean().optional(),
            isFeatured: z.boolean().optional(),
            targetType: z.string().optional(),
            targetId: z.string().optional(),
          })
          .optional()
          .default({}),
      }),
    )
    .query(async ({ ctx, input }) => {
      const query: RootFilterQuery<typeof ReviewModel> = {
        domain: ctx.domainData.domainObj._id,
      };

      if (
        !checkPermission(ctx.user.permissions, [
          UIConstants.permissions.manageAnyCourse,
        ])
      ) {
        query.authorId = ctx.user.userId;
      }

      if (input.filter.published !== undefined) {
        query.published = input.filter.published;
      }

      if (input.filter.isFeatured !== undefined) {
        query.isFeatured = input.filter.isFeatured;
      }

      if (input.filter.targetType) {
        query.targetType = input.filter.targetType;
      }

      if (input.filter.targetId) {
        query.targetId = input.filter.targetId;
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
        ReviewModel.find(query)
          .populate<{
            author: {
              userId: string;
              name: string;
              avatar?: any;
            };
          }>({
            path: "author",
            select: "userId name avatar -_id",
          })
          .skip(paginationMeta.skip)
          .limit(paginationMeta.take)
          .sort(sortObject)
          .lean(),
        paginationMeta.includePaginationCount
          ? ReviewModel.countDocuments(query as any)
          : Promise.resolve(null),
      ]);

      return {
        items,
        total,
        meta: paginationMeta,
      };
    }),

  getByReviewId: protectedProcedure
    .use(createDomainRequiredMiddleware())
    .input(
      z.object({
        reviewId: z.string(),
        asGuest: z.boolean().optional().default(false),
      }),
    )
    .query(async ({ ctx, input }) => {
      const review = await ReviewModel.findOne({
        reviewId: input.reviewId,
        domain: ctx.domainData.domainObj._id,
      })
        .populate<{
          author: {
            userId: string;
            name: string;
            avatar?: any;
          };
        }>({
          path: "author",
          select: "userId name avatar -_id",
        })
        .lean();

      if (!review) {
        throw new NotFoundException("Review", String(input.reviewId));
      }

      if (ctx.user && !input.asGuest) {
        const isOwner =
          checkPermission(ctx.user.permissions, [
            UIConstants.permissions.manageAnyCourse,
          ]) || checkReviewOwnership(review, ctx);

        if (isOwner) {
          return review;
        }
      }

      if (!review.published) {
        throw new NotFoundException("Review", String(input.reviewId));
      }

      return review;
    }),

  create: protectedProcedure
    .use(createDomainRequiredMiddleware())
    .use(
      createPermissionMiddleware([
        UIConstants.permissions.manageCourse,
        UIConstants.permissions.manageAnyCourse,
      ]),
    )
    .input(
      getFormDataSchema({
        title: z
          .string()
          .min(1, "Title is required")
          .max(200, "Title too long"),
        content: textEditorContentValidator(),
        rating: z
          .number()
          .min(1, "Rating must be at least 1")
          .max(10, "Rating cannot exceed 10"),
        targetType: z
          .string()
          .min(1, "Target type is required")
          .default("website"),
        targetId: z.string().optional(),
        published: z.boolean().optional().default(false),
        isFeatured: z.boolean().optional().default(false),
        featuredImage: mediaWrappedFieldValidator().optional(),
        tags: z.array(z.string()).optional().default([]),
        authorId: z.string().nullable().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const reviewData: any = {
        domain: ctx.domainData.domainObj._id,
        title: input.data.title,
        content: input.data.content,
        rating: input.data.rating,
        targetType: input.data.targetType,
        targetId: input.data.targetId,
        published: input.data.published,
        isFeatured: input.data.isFeatured,
        featuredImage: input.data.featuredImage,
        tags: input.data.tags,
      };

      // Set authorId - if provided use that, otherwise use current user
      reviewData.authorId = input.data.authorId ?? ctx.user.userId;

      const review = await ReviewModel.create(reviewData);

      Log.info("Review created", {
        reviewId: review.reviewId,
        userId: ctx.user.userId,
      });
      return review;
    }),

  update: protectedProcedure
    .use(createDomainRequiredMiddleware())
    .use(
      createPermissionMiddleware([
        UIConstants.permissions.manageCourse,
        UIConstants.permissions.manageAnyCourse,
      ]),
    )
    .input(
      getFormDataSchema({
        reviewId: z.string().min(1, "Review ID is required"),
        title: z
          .string()
          .min(1, "Title is required")
          .max(200, "Title too long")
          .optional(),
        content: textEditorContentValidator().optional(),
        rating: z
          .number()
          .min(1, "Rating must be at least 1")
          .max(10, "Rating cannot exceed 10")
          .optional(),
        targetType: z.string().min(1, "Target type is required").optional(),
        targetId: z.string().optional(),
        published: z.boolean().optional(),
        isFeatured: z.boolean().optional(),
        featuredImage: mediaWrappedFieldValidator().optional(),
        tags: z.array(z.string()).optional(),
        authorId: z.string().nullable().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const review = await getReviewOrThrow(
        undefined,
        ctx as any,
        input.data.reviewId,
      );

      if (
        !checkPermission(ctx.user.permissions, [
          UIConstants.permissions.manageAnyCourse,
        ]) &&
        !checkReviewOwnership(review, ctx)
      ) {
        throw new Error("You don't have permission to update this review");
      }

      const updateData: any = {};
      if (input.data.title !== undefined) updateData.title = input.data.title;
      if (input.data.content !== undefined)
        updateData.content = input.data.content;
      if (input.data.rating !== undefined)
        updateData.rating = input.data.rating;
      if (input.data.targetType !== undefined)
        updateData.targetType = input.data.targetType;
      if (input.data.targetId !== undefined)
        updateData.targetId = input.data.targetId;
      if (input.data.published !== undefined)
        updateData.published = input.data.published;
      if (input.data.isFeatured !== undefined)
        updateData.isFeatured = input.data.isFeatured;
      if (input.data.featuredImage !== undefined)
        updateData.featuredImage = input.data.featuredImage;
      if (input.data.tags !== undefined) updateData.tags = input.data.tags;
      if (input.data.authorId !== undefined)
        updateData.authorId = input.data.authorId;

      const updatedReview = await ReviewModel.findOneAndUpdate(
        {
          reviewId: input.data.reviewId,
          domain: ctx.domainData.domainObj._id,
        },
        { $set: updateData },
        { new: true },
      );

      Log.info("Review updated", {
        reviewId: input.data.reviewId,
        userId: ctx.user.userId,
      });
      return updatedReview;
    }),

  delete: protectedProcedure
    .use(createDomainRequiredMiddleware())
    .use(
      createPermissionMiddleware([
        UIConstants.permissions.manageCourse,
        UIConstants.permissions.manageAnyCourse,
      ]),
    )
    .input(
      z.object({
        reviewId: z.string().min(1, "Review ID is required"),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const review = await getReviewOrThrow(
        undefined,
        ctx as any,
        input.reviewId,
      );

      if (
        !checkPermission(ctx.user.permissions, [
          UIConstants.permissions.manageAnyCourse,
        ]) &&
        !checkReviewOwnership(review, ctx)
      ) {
        throw new Error("You don't have permission to delete this review");
      }

      if (review.featuredImage) {
        await deleteMedia(review.featuredImage.mediaId);
      }

      await ReviewModel.deleteOne({
        reviewId: input.reviewId,
        domain: ctx.domainData.domainObj._id,
      });

      Log.info("Review deleted", {
        reviewId: input.reviewId,
        userId: ctx.user.userId,
      });
      return { success: true };
    }),

  publicGetByReviewId: publicProcedure
    .use(createDomainRequiredMiddleware())
    .input(
      z.object({
        reviewId: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const review = await ReviewModel.findOne({
        reviewId: input.reviewId,
        domain: ctx.domainData.domainObj._id,
        published: true,
      })
        .populate<{
          author: {
            userId: string;
            name: string;
            avatar?: any;
          };
        }>({
          path: "authorId",
          select: "userId name avatar -_id",
        })
        .lean();

      if (!review) {
        throw new NotFoundException("Review", String(input.reviewId));
      }

      return {
        reviewId: review.reviewId,
        title: review.title,
        content: review.content,
        rating: review.rating,
        targetType: review.targetType,
        targetId: review.targetId,
        featuredImage: review.featuredImage
          ? formatMedia(review.featuredImage)
          : null,
        tags: review.tags,
        author: review.author,
        createdAt: review.createdAt,
      };
    }),
});

const formatMedia = (media: Media) => {
  if (!media) return null;
  return {
    mediaId: media.mediaId,
    url: media.url,
    thumbnail: media.thumbnail,
    originalFileName: media.originalFileName,
    mimeType: media.mimeType,
    size: media.size,
    access: media.access,
    caption: media.caption,
    storageProvider: media.storageProvider,
  };
};
