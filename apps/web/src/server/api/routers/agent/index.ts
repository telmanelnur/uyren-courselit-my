import { router } from "../../core/trpc";
import { agentRouter } from "./agent";

export const agentModuleRouter = router({
  agent: agentRouter,
});
