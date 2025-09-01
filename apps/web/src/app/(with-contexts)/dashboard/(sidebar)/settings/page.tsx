"use client";

import { Metadata, ResolvingMetadata } from "next";
import DashboardContent from "@/components/admin/dashboard-content";
import LoadingScreen from "@/components/admin/loading-screen";
import { useProfile } from "@/components/contexts/profile-context";
import { SITE_SETTINGS_PAGE_HEADING } from "@/lib/ui/config/strings";
import { UIConstants } from "@workspace/common-models";
import { checkPermission } from "@workspace/utils";
import { useSearchParams } from "next/navigation";
import Settings from "./_components/settings";
import { SettingsProvider } from "./_components/settings-context";

const { permissions } = UIConstants;

const breadcrumbs = [{ label: SITE_SETTINGS_PAGE_HEADING, href: "#" }];

export default function Page() {
  const { profile } = useProfile();
  const searchParams = useSearchParams();

  const tab = searchParams?.get("tab") || "Branding";

  if (!checkPermission(profile.permissions!, [permissions.manageSettings])) {
    return <LoadingScreen />;
  }

  return (
    <DashboardContent breadcrumbs={breadcrumbs}>
      <SettingsProvider>
        <Settings selectedTab={tab} />
      </SettingsProvider>
    </DashboardContent>
  );
}
