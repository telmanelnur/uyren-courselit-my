import { router } from "@/server/api/core/trpc";
import { sequenceRouter } from "./sequence";
import { broadcastRouter } from "./broadcast";
import { mailRequestRouter } from "./mail-request";

export const mailModuleRouter = router({
  sequence: sequenceRouter,
  broadcast: broadcastRouter,
  mailRequest: mailRequestRouter,
});
