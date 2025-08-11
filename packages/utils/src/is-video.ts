import { Media } from "@workspace/common-models";

export function isVideo(youtubeLink?: string, media?: Partial<Media>) {
  return youtubeLink || (media && RegExp("video/").test(media?.mimeType || ""));
}
