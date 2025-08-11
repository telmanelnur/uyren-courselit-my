import { router } from "@/server/api/core/trpc";
import { communityRouter } from "./community";
import { postRouter } from "./post";
import { reportRouter } from "./report";

export const communityModuleRouter = router({
  community: communityRouter,
  post: postRouter,
  report: reportRouter,
});
