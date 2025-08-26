import mongoose from "mongoose";
import { EmailDeliverySchema } from "@workspace/common-logic";

export default mongoose.models.EmailDelivery ||
  mongoose.model("EmailDelivery", EmailDeliverySchema);
