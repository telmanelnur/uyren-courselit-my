"use client";

import { NewBlog } from "@/components/admin/blogs/new-blog";
import DashboardContent from "@/components/admin/dashboard-content";
import { UIConstants } from "@workspace/common-models";
import {
  BTN_NEW_BLOG,
  MANAGE_BLOG_PAGE_HEADING,
} from "@/lib/ui/config/strings";
import { useContext } from "react";
import { useAddress } from "@/components/contexts/address-context";

const breadcrumbs = [
  { label: MANAGE_BLOG_PAGE_HEADING, href: "/dashboard/blogs" },
  { label: BTN_NEW_BLOG, href: "#" },
];

export default function Page() {
  const { address } = useAddress();

  return (
    <DashboardContent
      breadcrumbs={breadcrumbs}
      permissions={[
        UIConstants.permissions.manageAnyCourse,
        UIConstants.permissions.manageCourse,
      ]}
    >
      <NewBlog address={address} networkAction={false} />
    </DashboardContent>
  );
}
