"use client";

import { Index as Blogs } from "@/components/admin/blogs";
import DashboardContent from "@/components/admin/dashboard-content";
import LoadingScreen from "@/components/admin/loading-screen";
import { useProfile } from "@/components/contexts/profile-context";
import { MANAGE_BLOG_PAGE_HEADING } from "@/lib/ui/config/strings";
import { UIConstants } from "@workspace/common-models";
import { checkPermission } from "@workspace/utils";

const { permissions } = UIConstants;

const breadcrumbs = [{ label: MANAGE_BLOG_PAGE_HEADING, href: "#" }];

export default function Page() {
  const { profile } = useProfile();

  if (!profile) {
    return;
  }

  if (
    !checkPermission(profile.permissions!, [
      permissions.manageAnyCourse,
      permissions.manageCourse,
    ])
  ) {
    return <LoadingScreen />;
  }

  return (
    <DashboardContent breadcrumbs={breadcrumbs}>
      <Blogs />
    </DashboardContent>
  );
}
