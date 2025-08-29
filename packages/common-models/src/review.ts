import { Media } from "./media";
import { TextEditorContent } from "./custom/text-editor-content";

export interface Review {
  reviewId: string;
  title: string;
  content: TextEditorContent;
  authorName: string;
  authorEmail?: string;
  rating: number;
  targetType: string; // e.g., "course", "product", "website", "blog", etc.
  targetId?: string; // ID of the target object
  published: boolean;
  isFeatured: boolean;
  featuredImage?: Media;
  tags: string[];
  authorId: string;
  createdAt: Date;
  updatedAt: Date;
}
