import SiteInfo from "./site-info";

export interface Domain {
  name: string;
  customDomain: string;
  email: string;
  deleted: boolean;
  createdAt: Date;
  updatedAt: Date;
  settings: SiteInfo;
  firstRun: boolean;
  tags: string[];
  checkSubscriptionStatusAfter: Date;
  quota: {
    mail: {
      daily: number;
      monthly: number;
      dailyCount: number;
      monthlyCount: number;
      lastDailyCountUpdate: Date;
      lastMonthlyCountUpdate: Date;
    };
  };
  themeId: string;
}
