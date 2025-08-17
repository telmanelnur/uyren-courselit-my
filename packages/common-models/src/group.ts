import { Drip } from "./drip";

export default interface Group {
    groupId: string;
    name: string;
    rank: number;
    collapsed: boolean;
    lessonsOrder: string[];
    drip?: Drip;
}
