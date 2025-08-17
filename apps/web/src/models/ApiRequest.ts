import { User } from "@workspace/common-models";
import { Domain } from "./Domain";
import { NextApiRequest } from "next";

type ApiRequest = NextApiRequest & {
    user?: User;
    subdomain?: Domain;
};

export default ApiRequest;
