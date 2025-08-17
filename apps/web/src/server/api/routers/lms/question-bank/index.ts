import { router } from "@/server/api/core/trpc";
import { questionRouter } from "./question";

export const questionBankModuleRouter = router({
  question: questionRouter,
});


