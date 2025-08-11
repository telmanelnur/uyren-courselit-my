import { Progress } from "@workspace/common-models";
import mongoose from "mongoose";

const ProgressSchema = new mongoose.Schema<Progress>(
    {
        courseId: { type: String, required: true },
        completedLessons: { type: [String] },
        downloaded: { type: Boolean },
        accessibleGroups: { type: [String] },
    },
    {
        timestamps: true,
    },
);

export default ProgressSchema;
