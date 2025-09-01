import { Metadata, ResolvingMetadata } from "next";
import DashboardContent from "@/components/admin/dashboard-content";
import { CommunityForum } from "@/components/community";
import { COMMUNITY_HEADER } from "@/lib/ui/config/strings";

export async function generateMetadata(
  { params }: { params: Promise<{ id: string }> },
  parent: ResolvingMetadata,
): Promise<Metadata> {
  const { id } = await params;
  return {
    title: `Community ${id} | Community | ${(await parent)?.title?.absolute}`,
  };
}

const breadcrumbs = [{ label: COMMUNITY_HEADER, href: "#" }];

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ category?: string }>;
}) {
  const { id } = await params;
  const category = (await searchParams)?.category || "All";

  return (
    <DashboardContent breadcrumbs={breadcrumbs}>
      <CommunityForum id={id} activeCategory={category} />
    </DashboardContent>
  );
}
