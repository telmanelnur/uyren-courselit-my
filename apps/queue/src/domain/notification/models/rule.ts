import mongoose from "mongoose";
import { RuleSchema } from "@workspace/common-logic";
export default mongoose.models.Rule || mongoose.model("Rule", RuleSchema);
