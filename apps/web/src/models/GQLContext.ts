import { InternalUser } from "@workspace/common-logic";
import { Domain } from "./Domain";

export default interface GQLContext {
    user: InternalUser;
    subdomain: Domain;
    address: string;
}
