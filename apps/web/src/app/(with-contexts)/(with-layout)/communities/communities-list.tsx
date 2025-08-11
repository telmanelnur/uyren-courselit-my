"use client";

import { useTheme } from "@/components/contexts/theme-context";
import { PaginationControls } from "@/components/public/pagination";
import { SkeletonCard } from "@/components/skeleton-card";
import { trpc } from "@/utils/trpc";
import { Button, Header3, Text2 } from "@workspace/page-primitives";
import { Users } from "lucide-react";
import { CommunityContentCard } from "./content-card";

const ITEMS_PER_PAGE = 9;

export function CommunitiesList({
  itemsPerPage = ITEMS_PER_PAGE,
  publicView = true,
  page,
  onPageChange,
}: {
  itemsPerPage?: number;
  publicView?: boolean;
  page: number;
  onPageChange: (page: number) => void;
}) {
  const { data, isLoading } = trpc.communityModule.community.list.useQuery({
    pagination: {
      skip: (page - 1) * itemsPerPage,
      take: itemsPerPage,
    },
  });
  const { theme } = useTheme();

  if (!isLoading && data?.total === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Users className="w-12 h-12 text-muted-foreground mb-4" />
        <Header3 theme={theme.theme}>No Communities Found</Header3>
        <Text2 theme={theme.theme}>
          {publicView ? "The team " : "You have "} not added any communities
          yet.
        </Text2>
      </div>
    );
  }

  if (!isLoading && data?.total && data?.items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Users className="w-12 h-12 text-muted-foreground mb-4" />
        <Text2 theme={theme.theme}>This page is empty.</Text2>
        <Button
          variant="outline"
          theme={theme.theme}
          onClick={() => onPageChange(1)}
        >
          Go to first page
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading
          ? Array.from({ length: ITEMS_PER_PAGE }).map((_, index) => (
              <SkeletonCard key={index} />
            ))
          : data?.items.map((community) => (
              <CommunityContentCard
                key={community.communityId}
                community={community as any}
                publicView={publicView}
              />
            ))}
      </div>
      <PaginationControls
        currentPage={page}
        totalPages={Math.ceil((data?.total || 1) / itemsPerPage)}
        onPageChange={onPageChange}
      />
    </div>
  );
}
