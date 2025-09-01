"use client";

import { Metadata, ResolvingMetadata } from "next";
import DashboardContent from "@/components/admin/dashboard-content";
import { CommunityForum } from "@/components/community";
import { COMMUNITY_HEADER } from "@/lib/ui/config/strings";
import { useSearchParams } from "next/navigation";

const breadcrumbs = [{ label: COMMUNITY_HEADER, href: "#" }];

export async function generateMetadata(
  _: any,
  parent: ResolvingMetadata,
): Promise<Metadata> {
  return {
    title: `Community | ${(await parent)?.title?.absolute}`,
  };
}

export default function Page() {
  const searchParams = useSearchParams();
  const category = searchParams?.get("category") || "All";

  return (
    <DashboardContent breadcrumbs={breadcrumbs}>
      <CommunityForum activeCategory={category} />
    </DashboardContent>
  );
}
