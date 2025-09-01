import { Metadata, ResolvingMetadata } from "next";
import DashboardContent from "@/components/admin/dashboard-content";
import { MembershipList } from "@/components/community/membership-list";
import {
  COMMUNITY_HEADER,
  COMMUNITY_MEMBERSHIP_LIST_HEADER,
  COMMUNITY_SETTINGS,
} from "@/lib/ui/config/strings";

export async function generateMetadata(
  { params }: { params: { id: string } },
  parent: ResolvingMetadata,
): Promise<Metadata> {
  const { id } = params;
  return {
    title: `Memberships | Manage | Community ${id} | Community | ${(await parent)?.title?.absolute}`,
  };
}

export default function Page({
  params,
}: {
  params: {
    id: string;
  };
}) {
  const { id } = params;
  const breadcrumbs = [
    {
      label: COMMUNITY_HEADER,
      href: `/dashboard/community/${id}`,
    },
    {
      label: COMMUNITY_SETTINGS,
      href: `/dashboard/community/${id}/manage`,
    },
    { label: COMMUNITY_MEMBERSHIP_LIST_HEADER, href: "#" },
  ];

  return (
    <DashboardContent breadcrumbs={breadcrumbs}>
      <MembershipList id={id} />
    </DashboardContent>
  );
}
