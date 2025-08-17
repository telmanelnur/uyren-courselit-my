import { router } from "@/server/api/core/trpc";
import { paymentPlanRouter } from "./payment-plan";

export const paymentModuleRouter = router({
  paymentPlan: paymentPlanRouter,
});


