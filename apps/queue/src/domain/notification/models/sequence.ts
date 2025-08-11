import mongoose from "mongoose";
import { SequenceSchema } from "@workspace/common-logic";

export default mongoose.models.Sequence ||
    mongoose.model("Sequence", SequenceSchema);
