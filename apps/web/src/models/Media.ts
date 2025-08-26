import { createModel, MediaSchema } from "@workspace/common-logic";
import { Constants, Media } from "@workspace/common-models";
import mongoose from "mongoose";

type Exmbed = Media & {
  userId: string;
  domain: mongoose.Types.ObjectId;
};

const GlobalMediaSchema = new mongoose.Schema<Exmbed>(
  {
    mediaId: { type: String, required: true, unique: true },
    originalFileName: { type: String, required: true },
    mimeType: { type: String, required: true },
    size: { type: Number, required: true },
    access: {
      type: String,
      required: true,
      enum: Object.values(Constants.MediaAccessType),
    },
    thumbnail: String,
    caption: String,
    file: String,
    url: { type: String, required: true },
    storageProvider: { type: String, required: true },
    userId: { type: String, required: false },
    domain: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Domain",
      required: true,
    },
    metadata: { type: mongoose.Schema.Types.Mixed, required: false },
  },
  {
    timestamps: true,
  },
);

const MediaModel = createModel("GlobalMediaSchema", GlobalMediaSchema);

export default MediaModel;

export { MediaSchema };
