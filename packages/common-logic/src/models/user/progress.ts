import mongoose from "mongoose";
import { Progress } from "@workspace/common-models";

export const ProgressSchema = new mongoose.Schema<Progress>(
  {
    courseId: { type: String, required: true },
    completedLessons: { type: [String] },
    downloaded: { type: Boolean },
    accessibleGroups: { type: [String] },
  },
  {
    timestamps: true,
  }
);
