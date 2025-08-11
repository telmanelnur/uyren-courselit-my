import mongoose from "mongoose";
import { EmailSchema } from "@workspace/common-logic";

export default mongoose.models.Email || mongoose.model("Email", EmailSchema);
