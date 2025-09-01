"use client";

import { Metadata, ResolvingMetadata } from "next";
import DashboardContent from "@/components/admin/dashboard-content";
import CommunityCreator from "@/components/community/creator";
import {
  MANAGE_COMMUNITIES_PAGE_HEADING,
  NEW_COMMUNITY_BUTTON,
} from "@/lib/ui/config/strings";
import { UIConstants } from "@workspace/common-models";
const { permissions } = UIConstants;

const breadcrumbs = [
  {
    label: MANAGE_COMMUNITIES_PAGE_HEADING,
    href: `/dashboard/communities`,
  },
  { label: NEW_COMMUNITY_BUTTON, href: "#" },
];

export async function generateMetadata(
  _: any,
  parent: ResolvingMetadata,
): Promise<Metadata> {
  return {
    title: `New Community | Community | ${(await parent)?.title?.absolute}`,
  };
}

export default function Page() {
  return (
    <DashboardContent
      breadcrumbs={breadcrumbs}
      permissions={[permissions.manageCommunity]}
    >
      <CommunityCreator />
    </DashboardContent>
  );
}
