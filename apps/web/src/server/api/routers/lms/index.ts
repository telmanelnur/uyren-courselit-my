import { router } from "@/server/api/core/trpc";
// import { assignmentModuleRouter } from "./assignment";
import { courseModuleRouter } from "./course";
// import { quizModuleRouter } from "./quiz";

export const lmsModuleRouter = router({
  courseModule: courseModuleRouter,
  // quizModule: quizModuleRouter,
  // assignmentModule: assignmentModuleRouter,
  // post: postRouter,
});
