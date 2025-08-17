import { LessonType } from "../lesson-type";
import { Media } from "../media";
import { Quiz } from "../quiz";
import { TextEditorContent } from "./text-editor-content";

export default interface Lesson {
    lessonId: string;
    title: string;
    type: LessonType;
    content: Quiz | TextEditorContent | { value: string };
    requiresEnrollment: boolean;
    courseId: string;
    groupId: string;
    downloadable: boolean;
    media?: Media;
    prevLesson?: string;
    nextLesson?: string;
}
