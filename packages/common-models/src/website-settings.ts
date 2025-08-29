import { TextEditorContent } from "./custom/text-editor-content";
import { Media } from "./media";

export interface FeaturedCourse {
  courseId: string;
  title: string;
  slug: string;
  shortDescription?: string;
  level?: "beginner" | "intermediate" | "advanced";
  duration?: number;
  isFeatured?: boolean;
  order?: number;
}

export interface FeaturedReview {
  reviewId: string;
  author: {
    userId: string;
    name: string;
    avatar: Media;
  };
  rating: number;
  content: TextEditorContent;
  targetType?: string;
  targetId?: string;
  order?: number;
}

export interface MainPageSettings {
  showBanner: boolean;
  bannerTitle: string;
  bannerSubtitle?: string;
  featuredCourses: FeaturedCourse[];
  featuredReviews: FeaturedReview[];
  showStats: boolean;
  showFeatures: boolean;
  showTestimonials: boolean;
}

export default interface WebsiteSettings {
  mainPage: MainPageSettings;
  createdAt: Date;
  updatedAt: Date;
}
