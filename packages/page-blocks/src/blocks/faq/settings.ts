import { Alignment, WidgetDefaultSettings } from "@workspace/common-models";

export interface Item {
    title: string;
    description: Record<string, unknown>;
}

export default interface Settings extends WidgetDefaultSettings {
    title: string;
    description?: Record<string, unknown>;
    headerAlignment: Alignment;
    itemsAlignment: Alignment;
    items?: Item[];
    cssId?: string;
}
