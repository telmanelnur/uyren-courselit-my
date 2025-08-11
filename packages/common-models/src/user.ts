import { Constants, Media } from ".";
import { Progress } from "./progress";

export interface ProviderData {
  provider: string; // e.g., "firebase", "google", "github"
  uid: string; // provider-specific user ID
  name?: string; // provider-specific name
}

export default interface User {
  userId: string;
  email: string;
  active: boolean;
  name?: string;
  purchases: Progress[];
  bio?: string;
  permissions: string[];
  roles: string[];
  createdAt: Date;
  updatedAt: Date;
  subscribedToUpdates: boolean;
  lead: (typeof Constants.leads)[number];
  tags?: string[];
  avatar?: Media; // Wrapper object with storageType and data
  invited?: boolean;
  providerData?: ProviderData; // Provider authentication data
}
