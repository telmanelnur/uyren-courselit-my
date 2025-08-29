import Address from "../address";
import Auth from "../auth";
import Message from "../message";
import Profile from "../profile";
import SiteInfo from "../site-info";
import { ServerConfig } from "../server-config";
// import { Theme } from "@workspacepage-models";

export default interface State {
  auth: Auth;
  siteinfo: SiteInfo;
  networkAction: boolean;
  profile: Profile;
  address: Address;
  message: Message;
  config: ServerConfig;
}
