import { createModel } from "@workspace/common-logic";
import { WebsiteSettings } from "@workspace/common-models";
import mongoose, { Schema } from "mongoose";

const WebsiteSettingsSchema = new Schema<
  WebsiteSettings & { domain: mongoose.Types.ObjectId }
>(
  {
    domain: { type: Schema.Types.ObjectId, ref: "Domain", required: true },
    mainPage: {
      showBanner: { type: Boolean, default: true },
      bannerTitle: { type: String, required: true },
      bannerSubtitle: { type: String },
      featuredCourses: [
        {
          courseId: { type: String, required: true },
          title: { type: String, required: true },
          slug: { type: String, required: true },
          shortDescription: { type: String },
          level: {
            type: String,
            enum: ["beginner", "intermediate", "advanced"],
          },
          duration: { type: Number, min: 0 },
          isFeatured: { type: Boolean, default: false },
          order: { type: Number, min: 0, default: 0 },
        },
      ],
      featuredReviews: [
        {
          reviewId: { type: String, required: true },
          author: {
            userId: { type: String, required: true },
            name: { type: String, required: true },
            avatar: { type: Schema.Types.Mixed },
          },
          rating: { type: Number, required: true, min: 1, max: 10 },
          content: {
            type: Schema.Types.Mixed,
            required: true,
          },
          order: { type: Number, min: 0, default: 0 },
          targetType: { type: String },
          targetId: { type: String },
        },
      ],
      showStats: { type: Boolean, default: true },
      showFeatures: { type: Boolean, default: true },
      showTestimonials: { type: Boolean, default: true },
    },
  },
  {
    timestamps: true,
  },
);

export default createModel("WebsiteSettings", WebsiteSettingsSchema);
