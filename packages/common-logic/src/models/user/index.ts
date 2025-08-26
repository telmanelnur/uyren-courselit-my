import { Constants, User } from "@workspace/common-models";
import { generateUniqueId } from "@workspace/utils";
import mongoose from "mongoose";
import { ProgressSchema } from "./progress";
import { MediaSchema } from "../media";

export interface InternalUser extends User {
  _id: mongoose.Types.ObjectId;
  domain: mongoose.Types.ObjectId;
  unsubscribeToken: string;
}

export const UserSchema = new mongoose.Schema<InternalUser>(
  {
    domain: { type: mongoose.Schema.Types.ObjectId, required: true },
    userId: { type: String, required: true, default: generateUniqueId },
    email: { type: String, required: true },
    active: { type: Boolean, required: true, default: true },
    name: { type: String, required: false },
    purchases: [ProgressSchema],
    bio: { type: String },
    permissions: [String],
    roles: [String],
    subscribedToUpdates: { type: Boolean, default: true },
    lead: {
      type: String,
      required: true,
      enum: Constants.leads,
      default: Constants.leads[0],
    },
    tags: [String],
    unsubscribeToken: {
      type: String,
      required: true,
      default: generateUniqueId,
    },
    avatar: MediaSchema,
    invited: { type: Boolean },
    providerData: {
      type: {
        provider: { type: String, required: true },
        uid: { type: String, required: true },
        name: { type: String },
      },
      required: false,
    },
  },
  {
    timestamps: true,
  },
);

UserSchema.index({
  email: "text",
  name: "text",
});

UserSchema.index(
  {
    domain: 1,
    email: 1,
  },
  { unique: true },
);
