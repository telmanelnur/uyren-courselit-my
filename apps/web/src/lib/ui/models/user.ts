import { Media } from "@workspace/common-models";

export default interface User {
    id: string;
    email: string;
    name: string;
    purchases: string[];
    active: boolean;
    userId: number;
    bio: string;
    permissions: string[];
    avatar: Media;
}
