import { Metadata, ResolvingMetadata } from "next";
import DashboardContent from "@/components/admin/dashboard-content";
import { COMMUNITY_HEADER, COMMUNITY_SETTINGS } from "@/lib/ui/config/strings";
import { ManageClientView } from "./manage-client-view";

export async function generateMetadata(
  { params }: { params: Promise<{ id: string }> },
  parent: ResolvingMetadata,
): Promise<Metadata> {
  const { id } = await params;
  return {
    title: `Manage | Community ${id} | Community | ${(await parent)?.title?.absolute}`,
  };
}

export default async function Page({
  params,
}: {
  params: Promise<{
    id: string;
  }>;
}) {
  const { id } = await params;
  const breadcrumbs = [
    {
      label: COMMUNITY_HEADER,
      href: `/dashboard/community/${id}`,
    },
    { label: COMMUNITY_SETTINGS, href: "#" },
  ];
  return (
    <DashboardContent breadcrumbs={breadcrumbs}>
      <ManageClientView id={id} />
    </DashboardContent>
  );
}
