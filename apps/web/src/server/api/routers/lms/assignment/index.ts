import { router } from "@/server/api/core/trpc";
import { assignmentRouter } from "./assignment";

export const assignmentModuleRouter = router({
  assignment: assignmentRouter,
});
