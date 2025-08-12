import { trpc } from "@/utils/trpc";
import { Course } from "@workspace/common-models";
import { useMemo } from "react";

export function useProducts(
    page: number,
    itemsPerPage: number,
    filterBy?: string[],
    publicView: boolean = false,
) {
    const listQuery = trpc.lmsModule.product.list.useQuery({
        pagination: {
            take: itemsPerPage,
            skip: (page - 1) * itemsPerPage,
        },
        filter: {
            filterBy: filterBy as any,
            publicView,
        },
    });

    const products = useMemo(() => listQuery.data?.items as Course[] || [], [listQuery.data?.items]);
    const loading = listQuery.isLoading;
    const totalPages = useMemo(
        () => (listQuery.data?.total ? listQuery.data.total : 0),
        [listQuery.data?.total],
    );

    return { products, loading, totalPages };
}
