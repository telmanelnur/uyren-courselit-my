import { Media } from "./media";
import { Progress } from "./progress";

export default interface Profile {
  name: string;
  id: string;
  fetched: boolean;
  purchases: Progress[];
  email: string;
  bio: string;
  permissions: string[];
  userId: string;
  subscribedToUpdates: boolean;
  avatar: Partial<Media> | null; // MY: union with null to avoid type errors
}
