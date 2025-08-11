import { UserFilterWithAggregator } from "@workspace/common-models";

export default interface Segment {
    name: string;
    filter: UserFilterWithAggregator;
    segmentId: string;
}
