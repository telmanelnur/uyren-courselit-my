import { Constants, Media } from "@workspace/common-models";
import mongoose from "mongoose";

type MediaWithOwner = Media & {
    userId: string;
    domain: mongoose.Types.ObjectId;
};

export const MediaSchema = new mongoose.Schema<MediaWithOwner>({
    mediaId: { type: String, required: true, },
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
    storageProvider: { type: String, required: true, },
});
