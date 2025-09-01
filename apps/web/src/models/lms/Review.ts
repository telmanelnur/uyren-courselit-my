import mongoose from "mongoose";
import { generateUniqueId } from "@workspace/utils";
import { Review } from "@workspace/common-models";
import { createModel, MediaSchema } from "@workspace/common-logic";

export interface InternalReview extends Review {
  domain: mongoose.Types.ObjectId;
}

const ReviewSchema = new mongoose.Schema<InternalReview>(
  {
    domain: { type: mongoose.Schema.Types.ObjectId, required: true },
    reviewId: { type: String, required: true, default: generateUniqueId },
    title: { type: String, required: true },
    content: { type: mongoose.Schema.Types.Mixed, required: true },
    rating: { type: Number, required: true, min: 1, max: 10 },
    targetType: { type: String, required: true, default: "website" },
    targetId: { type: String, required: false },
    published: { type: Boolean, required: true, default: false },
    isFeatured: { type: Boolean, required: true, default: false },
    featuredImage: MediaSchema,
    tags: [{ type: String }],
    authorId: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

ReviewSchema.virtual("author", {
  ref: "User",
  localField: "authorId",
  foreignField: "userId",
  justOne: true,
});

ReviewSchema.index({ domain: 1, reviewId: 1 }, { unique: true });
ReviewSchema.index({ domain: 1, targetType: 1, targetId: 1 });
ReviewSchema.index({ domain: 1, published: 1 });
ReviewSchema.index({ domain: 1, isFeatured: 1 });
ReviewSchema.index({ domain: 1, authorId: 1 });

const ReviewModel = createModel("Review", ReviewSchema);

export default ReviewModel;
