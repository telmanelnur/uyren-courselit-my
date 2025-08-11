"use client";

import DashboardContent from "@/components/admin/dashboard-content";
import LoadingScreen from "@/components/admin/loading-screen";
import Settings from "@/components/admin/settings";
import { useAddress } from "@/components/contexts/address-context";
import { useProfile } from "@/components/contexts/profile-context";
import { useSiteInfo } from "@/components/contexts/site-info-context";
import { SITE_SETTINGS_PAGE_HEADING } from "@/lib/ui/config/strings";
import { Profile, UIConstants } from "@workspace/common-models";
import { checkPermission } from "@workspace/utils";
import { useSearchParams } from "next/navigation";
const { permissions } = UIConstants;

const breadcrumbs = [{ label: SITE_SETTINGS_PAGE_HEADING, href: "#" }];

export default function Page() {
  const { siteInfo } = useSiteInfo();
  const { address } = useAddress();
  const { profile } = useProfile();
  const searchParams = useSearchParams();

  const tab = searchParams?.get("tab") || "Branding";

  if (!checkPermission(profile.permissions!, [permissions.manageSettings])) {
    return <LoadingScreen />;
  }

  return (
    <DashboardContent breadcrumbs={breadcrumbs}>
      <Settings
        key={tab}
        siteinfo={siteInfo}
        address={address}
        profile={profile as Profile}
        selectedTab={tab as any}
        dispatch={() => {}}
        loading={false}
      />
    </DashboardContent>
  );
}
