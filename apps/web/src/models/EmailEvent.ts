import mongoose from "mongoose";
import { EmailEventSchema } from "@workspace/common-logic";

export default mongoose.models.EmailEvent ||
    mongoose.model("EmailEvent", EmailEventSchema);
