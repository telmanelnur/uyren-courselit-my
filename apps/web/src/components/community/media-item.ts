import { CommunityMedia } from "@workspace/common-models";

export interface MediaItem extends CommunityMedia {
  // fileSize?: string;
  file?: File;
}
