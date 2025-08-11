import { router } from "@/server/api/core/trpc";
import { questionRouter } from "./question";
import { quizRouter } from "./quiz";

export const quizModuleRouter = router({
  quiz: quizRouter,
  question: questionRouter,
});
