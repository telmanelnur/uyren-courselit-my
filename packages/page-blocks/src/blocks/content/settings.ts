import { Alignment, WidgetDefaultSettings } from "@workspace/common-models";

export default interface Settings extends WidgetDefaultSettings {
    title: string;
    description: Record<string, unknown>;
    headerAlignment: Alignment;
    cssId?: string;
}
