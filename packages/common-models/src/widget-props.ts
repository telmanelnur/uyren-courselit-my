import { PageType } from "./constants";
import { PaymentPlan } from "./payment-plan";
import WidgetDefaultSettings from "./widget-default-settings";

export default interface WidgetProps<T extends WidgetDefaultSettings> {
  id: string;
  name: string;
  pageData: {
    pageType: (typeof PageType)[keyof typeof PageType];
    paymentPlans?: PaymentPlan[];
    defaultPaymentPlan?: string;
    [x: string]: unknown;
  };
  settings: T;
  editing: boolean;
  toggleTheme: () => void;
  nextTheme: string | undefined;
}
