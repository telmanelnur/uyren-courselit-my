import { Constants, User } from "@workspace/common-models";
import { generateUniqueId } from "@workspace/utils";
import mongoose from "mongoose";
import { ProgressSchema } from "./progress";

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
    avatar: {
      type: mongoose.Schema.Types.Mixed,
      validate: {
        validator: function (value: any) {
          // Allow null/undefined
          if (!value) return true;

          // Must be an object
          if (typeof value !== "object") return false;

          // Must have storageType and data fields
          if (!value.storageType || !value.data) return false;

          // Validate based on storageType
          if (value.storageType === "media") {
            // Use default Media schema validation
            const data = value.data;
            return (
              data.mediaId &&
              data.originalFileName &&
              data.mimeType &&
              typeof data.size === "number" &&
              data.access &&
              data.thumbnail
            );
          } else if (value.storageType === "custom") {
            // CustomMedia: must have url
            const data = value.data;
            return data.url && typeof data.url === "string";
          }

          return false;
        },
        message:
          'Avatar must be a MediaWrapper with valid storageType ("media" or "custom") and corresponding data',
      },
    },
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
  }
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
  { unique: true }
);
