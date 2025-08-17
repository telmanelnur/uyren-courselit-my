import mongoose from "mongoose";
import { createModel, EmailEventSchema } from "@workspace/common-logic";

const EmailEventModel = createModel("EmailEvent", EmailEventSchema);

export default EmailEventModel;
