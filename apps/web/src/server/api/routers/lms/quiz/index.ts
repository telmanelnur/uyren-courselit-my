import { router } from "@/server/api/core/trpc";
import { quizRouter } from "./quiz";
import { quizAttemptRouter } from "./quiz-attempt";

export const quizModuleRouter = router({
  quiz: quizRouter,
  quizAttempt: quizAttemptRouter,
});
