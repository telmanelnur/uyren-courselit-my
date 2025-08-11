import { router } from "../../core/trpc";
import { domainRouter } from "./domain";
import { pageRouter } from "./page";
import { siteInfoRouter } from "./site-info";

export const siteModuleRouter = router({
  domain: domainRouter,
  siteInfo: siteInfoRouter,
  page: pageRouter,
});
