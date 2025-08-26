import { useMemo } from "react";
import { trpc } from "@/utils/trpc";

export function useCommunities(page: number, itemsPerPage: number) {
  const query = trpc.communityModule.community.list.useQuery({
    pagination: {
      skip: (page - 1) * itemsPerPage,
      take: itemsPerPage,
    },
  });

  const communities = useMemo(() => query.data?.items || [], [query.data]);
  const totalPages = useMemo(() => {
    if (!query.data?.total || !itemsPerPage) return 1;
    return Math.ceil(query.data.total / itemsPerPage);
  }, [query.data, itemsPerPage]);

  return {
    communities,
    loading: query.isLoading,
    totalPages,
  };
}
