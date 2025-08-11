import { router } from "../../core/trpc";
import { orgsRouter } from "./orgs";
import { tenantsRouter } from "./tenants";

export const organizationModuleRouter = router({
  orgs: orgsRouter,
  tenants: tenantsRouter,
});
