import { MediaAccessType } from "./constants";

export type MediaAccessType =
  (typeof MediaAccessType)[keyof typeof MediaAccessType];

export interface Media {
  storageProvider: "cloudinary" | "local";
  url: string;
  mediaId: string;
  originalFileName: string;
  mimeType: string;
  size: number;
  access: MediaAccessType;
  thumbnail: string;
  caption?: string;
  file?: string;
  metadata?: any;
}
