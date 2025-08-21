import { router } from "@/server/api/core/trpc";
import { assignmentModuleRouter } from "./assignment";
import { courseModuleRouter } from "./course";
import { productRouter } from "./product";
import { questionBankModuleRouter } from "./question-bank";
import { quizModuleRouter } from "./quiz";
import { themeModuleRouter } from "./theme";

export const lmsModuleRouter = router({
  courseModule: courseModuleRouter,
  product: productRouter,
  quizModule: quizModuleRouter,
  assignmentModule: assignmentModuleRouter,
  questionBankModule: questionBankModuleRouter,
  themeModule: themeModuleRouter,
});
