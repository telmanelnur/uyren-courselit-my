"use client";

import DashboardContent from "@/components/admin/dashboard-content";
import LoadingScreen from "@/components/admin/loading-screen";
import { useProfile } from "@/components/contexts/profile-context";
import { UIConstants } from "@workspace/common-models";
import { checkPermission } from "@workspace/utils";
import WebsiteSettings from "./_components/website-settings";

const { permissions } = UIConstants;

const breadcrumbs = [
  { label: "Settings", href: "/dashboard/settings" },
  { label: "Website Settings", href: "#" }
];

export default function WebsiteSettingsPage() {
  const { profile } = useProfile();

  if (!checkPermission(profile.permissions!, [permissions.manageSettings])) {
    return <LoadingScreen />;
  }

  return (
    <DashboardContent breadcrumbs={breadcrumbs}>
      <WebsiteSettings />
    </DashboardContent>
  );
}
