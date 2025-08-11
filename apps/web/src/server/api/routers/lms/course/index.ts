import { router } from "@/server/api/core/trpc";
import { courseRouter } from "./course";

export const courseModuleRouter = router({
  course: courseRouter,
  // chapter: chapterRouter,
  // lesson: lessonRouter,
});
