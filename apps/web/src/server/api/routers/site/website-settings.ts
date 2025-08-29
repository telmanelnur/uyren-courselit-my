import { Domain } from "@/models/Domain";
import WebsiteSettingsModel from "@/models/WebsiteSettings";
import { WebsiteSettings } from "@workspace/common-models";
import { checkPermission } from "@workspace/utils";
import { z } from "zod";
import { NotFoundException } from "../../core/exceptions";
import {
  createDomainRequiredMiddleware,
  createPermissionMiddleware,
  protectedProcedure,
  publicProcedure,
} from "../../core/procedures";
import { getFormDataSchema } from "../../core/schema";
import { router } from "../../core/trpc";
import { UIConstants } from "@workspace/common-models";

const { permissions } = UIConstants;

const createWebsiteSettings = async (domainObj: Domain) => {
  const created = await WebsiteSettingsModel.create({
    domain: domainObj._id,
    mainPage: {
      showBanner: true,
      bannerTitle: "Welcome to Our Learning Platform",
      bannerSubtitle: "Discover amazing courses and grow your skills",
      featuredCourses: [],
      featuredReviews: [],
      showStats: true,
      showFeatures: true,
      showTestimonials: true,
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  return created;
};

export const websiteSettingsRouter = router({
  // Get website settings for current domain
  getWebsiteSettings: protectedProcedure
    .use(createDomainRequiredMiddleware())
    .query(async ({ ctx }) => {
      let websiteSettings = await WebsiteSettingsModel.findOne({
        domain: ctx.domainData.domainObj._id,
      }).lean();
      if (!websiteSettings) {
        await createWebsiteSettings(ctx.domainData.domainObj);
        websiteSettings = await WebsiteSettingsModel.findOne({
          domain: ctx.domainData.domainObj._id,
        }).lean();
      }
      return websiteSettings;
    }),

  // Update website settings
  updateWebsiteSettings: protectedProcedure
    .use(createDomainRequiredMiddleware())
    .use(createPermissionMiddleware([permissions.manageSettings]))
    .input(
      getFormDataSchema({
        mainPage: z.object({
          showBanner: z.boolean(),
          bannerTitle: z.string().min(1, "Banner title is required"),
          bannerSubtitle: z.string().optional(),
          featuredCourses: z.array(z.object({
            courseId: z.string().min(1, "Course ID is required"),
            title: z.string().min(1, "Course title is required"),
            slug: z.string().min(1, "Course slug is required"),
            shortDescription: z.string().optional(),
            level: z.enum(["beginner", "intermediate", "advanced"]).optional(),
            duration: z.number().min(0, "Duration must be at least 0").optional(),
            isFeatured: z.boolean().optional(),
            order: z.number().min(0, "Order must be at least 0").optional(),
          })).optional(),
          featuredReviews: z.array(z.object({
            reviewId: z.string().min(1, "Review ID is required"),
            authorName: z.string().min(1, "Author name is required"),
            rating: z.number().min(1, "Rating must be at least 1").max(10, "Rating cannot exceed 10"),
            content: z.string().min(1, "Review content is required"),
            courseId: z.string().optional(),
            order: z.number().min(0, "Order must be at least 0").optional(),
          })).optional(),
          showStats: z.boolean(),
          showFeatures: z.boolean(),
          showTestimonials: z.boolean(),
        }),
      })
    )
    .mutation(async ({ ctx, input }) => {
      let websiteSettings = await WebsiteSettingsModel.findOne({
        domain: ctx.domainData.domainObj._id,
      });

      if (!websiteSettings) {
        // Create new settings if none exist
        websiteSettings = new WebsiteSettingsModel({
          ...input.data,
          domain: ctx.domainData.domainObj._id,
        });
      } else {
        // Update existing settings
        Object.assign(websiteSettings, input.data);
        websiteSettings.updatedAt = new Date();
      }

      await websiteSettings.save();
      return websiteSettings;
    }),
});
