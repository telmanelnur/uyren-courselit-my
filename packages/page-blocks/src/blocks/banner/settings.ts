import { Alignment } from "@workspace/common-models";
import { WidgetDefaultSettings } from "@workspace/common-models";

export default interface Settings extends WidgetDefaultSettings {
  productId?: string;
  title?: string;
  description?: string;
  buttonCaption?: string;
  buttonAction?: string;
  alignment?: "top" | "bottom" | "left" | "right";
  textAlignment?: Alignment;
  successMessage?: Record<string, unknown>;
  failureMessage?: string;
  editingViewShowSuccess: "1" | "0";
  mediaRadius?: number;
  cssId?: string;
}
