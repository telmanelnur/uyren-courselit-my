import type {
  HorizontalAlignment,
  WidgetDefaultSettings,
} from "@workspace/common-models";

export default interface Settings extends WidgetDefaultSettings {
  text: Record<string, unknown>;
  alignment: HorizontalAlignment;
  cssId?: string;
  fontSize?: number;
}
