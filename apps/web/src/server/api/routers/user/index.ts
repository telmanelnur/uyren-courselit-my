import { router } from "@/server/api/core/trpc";
import { userRouter } from "./user";
import { userContentRouter } from "./user-content";
import { notificationRouter } from "./notification";
import { tagRouter } from "./tag";

export const userModuleRouter = router({
  user: userRouter,
  userContent: userContentRouter,
  notification: notificationRouter,
  tag: tagRouter,
});
