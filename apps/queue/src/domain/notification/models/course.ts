import mongoose from "mongoose";
import { CourseSchema } from "@workspace/common-logic";

export default mongoose.models.Domain || mongoose.model("Course", CourseSchema);
