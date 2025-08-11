"use client";

import { Index as Blogs } from "@/components/admin/blogs";
import DashboardContent from "@/components/admin/dashboard-content";
import LoadingScreen from "@/components/admin/loading-screen";
import { useAddress } from "@/components/contexts/address-context";
import { useProfile } from "@/components/contexts/profile-context";
import { useSiteInfo } from "@/components/contexts/site-info-context";
import { MANAGE_BLOG_PAGE_HEADING } from "@/lib/ui/config/strings";
import { UIConstants } from "@workspace/common-models";
import { checkPermission } from "@workspace/utils";

const { permissions } = UIConstants;

const breadcrumbs = [{ label: MANAGE_BLOG_PAGE_HEADING, href: "#" }];

export default function Page() {
  const { address } = useAddress();
  const { profile } = useProfile();
  const { siteInfo } = useSiteInfo();

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
      <Blogs address={address} loading={false} siteinfo={siteInfo} />
    </DashboardContent>
  );
}
