import { router } from "@/server/api/core/trpc";
import { courseModuleRouter } from "./course";
import { productRouter } from "./product";
import { quizModuleRouter } from "./quiz";
import { assignmentRouter } from "./assignment";
import { assignmentSubmissionRouter } from "./assignment-submission";
import { questionBankModuleRouter } from "./question-bank";

export const lmsModuleRouter = router({
  courseModule: courseModuleRouter,
  product: productRouter,
  quizModule: quizModuleRouter,
  assignment: assignmentRouter,
  assignmentSubmission: assignmentSubmissionRouter,
  questionBankModule: questionBankModuleRouter,
});
