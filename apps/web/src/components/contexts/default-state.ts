import {
  Address,
  Profile,
  ServerConfig,
  SiteInfo,
  Typeface,
} from "@workspace/common-models";
import { Theme } from "@workspace/page-models";

export const defaultState: {
  siteinfo: SiteInfo;
  networkAction: boolean;
  profile: Profile;
  address: Address;
  typefaces: Typeface[];
  config: ServerConfig;
  theme: Theme;
  [x: string]: any;
} = {
  siteinfo: {
    title: "",
    subtitle: "",
    logo: {
      file: "",
      thumbnail: "",
      caption: "",
    },
    currencyISOCode: "",
    paymentMethod: "",
    stripeKey: "",
    codeInjectionHead: "",
    codeInjectionBody: "",
    mailingAddress: "",
    hideCourseLitBranding: false,
    razorpayKey: "",
    lemonsqueezyStoreId: "",
    lemonsqueezyOneTimeVariantId: "",
    lemonsqueezySubscriptionMonthlyVariantId: "",
    lemonsqueezySubscriptionYearlyVariantId: "",
  },
  networkAction: false,
  profile: {
    name: "",
    id: "",
    fetched: false,
    purchases: [],
    email: "",
    bio: "",
    permissions: [],
    userId: "",
    avatar: {
      file: "",
      thumbnail: "",
      caption: "",
    },
    subscribedToUpdates: false,
  },
  message: {
    open: false,
    message: "",
    action: null,
  },
  address: {
    backend: "",
    frontend: "",
  },
  typefaces: [],
  config: {
    turnstileSiteKey: process.env.TURNSTILE_SITE_KEY || "",
    queueServer: process.env.QUEUE_SERVER || "",
  },
  theme: {
    id: "",
    name: "",
    theme: {} as any, // Simplified for now - will be properly typed later
  },
};
