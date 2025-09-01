"use client";

import DashboardContent from "@/components/admin/dashboard-content";
import type { ContentItem } from "@/components/admin/my-content/content";
import { MyContentCard } from "@/components/admin/my-content/content-card";
import { SkeletonCard } from "@/components/skeleton-card";
import { MY_CONTENT_HEADER } from "@/lib/ui/config/strings";
import { trpc } from "@/utils/trpc";
import { Constants, MembershipEntityType } from "@workspace/common-models";
import { Button } from "@workspace/ui/components/button";
import { BookOpen, Users } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

function ContentGrid({
  items,
  type,
}: {
  items: ContentItem[];
  type: MembershipEntityType;
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {items.map((item) => (
        <MyContentCard key={item.entity.id} item={item} />
      ))}
    </div>
  );
}

function SkeletonGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(6)].map((_, index) => (
        <SkeletonCard key={index} />
      ))}
    </div>
  );
}
const breadcrumbs = [{ label: MY_CONTENT_HEADER, href: "#" }];

export default function Page() {
  const [data, setData] = useState<ContentItem[]>([]);

  const loadUserContentQuery = trpc.userModule.userContent.getProtectedUserContent.useQuery();

  useEffect(() => {
    if (loadUserContentQuery.data) {
      setData(loadUserContentQuery.data as unknown as ContentItem[]);
    }
  }, [loadUserContentQuery.data]);

  const courses = data.filter(
    (item) => item.entityType === Constants.MembershipEntityType.COURSE,
  );
  const communities = data.filter(
    (item) => item.entityType === Constants.MembershipEntityType.COMMUNITY,
  );

  const isLoading = loadUserContentQuery.isLoading;

  const EmptyStateMessage = ({ type }: { type: MembershipEntityType }) => (
    <div className="text-center py-12">
      <div className="flex justify-center mb-4">
        {type === Constants.MembershipEntityType.COURSE ? (
          <BookOpen className="w-12 h-12 text-muted-foreground" />
        ) : (
          <Users className="w-12 h-12 text-muted-foreground" />
        )}
      </div>
      <p className="text-muted-foreground mb-4">
        {type === Constants.MembershipEntityType.COURSE
          ? "You haven't enrolled in any products yet."
          : "You haven't joined any communities yet."}{" "}
      </p>
      {type === Constants.MembershipEntityType.COURSE ? (
        <Link href="/courses" className="text-primary">
          <Button size="sm">Browse products</Button>
        </Link>
      ) : (
        <Link href="/communities" className="text-primary">
          <Button size="sm">Browse communities</Button>
        </Link>
      )}
    </div>
  );

  return (
    <DashboardContent breadcrumbs={breadcrumbs}>
      <div className="space-y-12">
        <h1 className="text-4xl font-bold">My Content</h1>

        <section>
          <h2 className="text-xl font-semibold mb-6">My Products</h2>
          {isLoading ? (
            <SkeletonGrid />
          ) : courses.length > 0 ? (
            <ContentGrid
              items={courses}
              type={Constants.MembershipEntityType.COURSE}
            />
          ) : (
            <EmptyStateMessage type="course" />
          )}
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-6">My Communities</h2>
          {isLoading ? (
            <SkeletonGrid />
          ) : communities.length > 0 ? (
            <ContentGrid
              items={communities}
              type={Constants.MembershipEntityType.COMMUNITY}
            />
          ) : (
            <EmptyStateMessage type="community" />
          )}
        </section>
      </div>
    </DashboardContent>
  );
}
