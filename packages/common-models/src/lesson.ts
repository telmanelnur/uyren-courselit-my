import { Media } from "./media";
import { LessonType } from "./lesson-type";
import type { Quiz } from "./quiz";
import { TextEditorContent } from "./custom/text-editor-content";
// import type { TextEditorContent } from "./text-editor-content";

/**
 * @deprecated The method should not be used
 */
export default interface Lesson {
  lessonId: string;
  title: string;
  type: LessonType;
  content: Quiz | TextEditorContent | { value: string };
  requiresEnrollment: boolean;
  courseId: string;
  groupId: string;
  downloadable: boolean;
  media?: Partial<Media>;
  prevLesson?: string;
  nextLesson?: string;
}
