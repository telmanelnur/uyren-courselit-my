import mongoose from "mongoose";
import constants from "../config/constants";
import { createModel } from "@workspace/common-logic";

const { severityError, severityInfo, severityWarn } = constants;

const LogSchema = new mongoose.Schema(
  {
    severity: {
      type: String,
      required: true,
      enum: [severityError, severityInfo, severityWarn],
    },
    message: { type: String, required: true },
    metadata: { type: mongoose.Schema.Types.Mixed },
  },
  {
    timestamps: true,
  },
);

const LogModel = createModel("Log", LogSchema);

export default LogModel;
