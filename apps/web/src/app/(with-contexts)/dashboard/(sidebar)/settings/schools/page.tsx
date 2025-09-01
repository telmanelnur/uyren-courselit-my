"use client";

import DashboardContent from "@/components/admin/dashboard-content";
import LoadingScreen from "@/components/admin/loading-screen";
import { useProfile } from "@/components/contexts/profile-context";
import { UIConstants } from "@workspace/common-models";
import { checkPermission } from "@workspace/utils";
import SchoolsManagement from "./_components/schools-management";

const { permissions } = UIConstants;

const breadcrumbs = [
  { label: "Settings", href: "/dashboard/settings" },
  { label: "Schools", href: "#" },
];

export default function SchoolsPage() {
  const { profile } = useProfile();

  // Check if user has admin role and manageSettings permission
  const isAdmin = profile?.roles?.includes("admin");
  const hasPermission = checkPermission(profile?.permissions || [], [
    permissions.manageSettings,
  ]);

  if (!isAdmin || !hasPermission) {
    return <LoadingScreen />;
  }

  return (
    <DashboardContent breadcrumbs={breadcrumbs}>
      <SchoolsManagement />
    </DashboardContent>
  );
}
