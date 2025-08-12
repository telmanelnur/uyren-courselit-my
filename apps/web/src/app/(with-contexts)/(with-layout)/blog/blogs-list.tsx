"use client";

import { useTheme } from "@/components/contexts/theme-context";
import { PaginationControls } from "@/components/public/pagination";
import { useProducts } from "@/hooks/use-products";
import { Constants, Course } from "@workspace/common-models";
import { ProductCardSkeleton } from "@workspace/page-blocks";
import { Button, Subheader1 } from "@workspace/page-primitives";
import { BookOpen } from "lucide-react";
import { useMemo } from "react";
import { BlogContentCard } from "./content-card";

const ITEMS_PER_PAGE = 9;

export function BlogsList({
    page,
    itemsPerPage = ITEMS_PER_PAGE,
    onPageChange,
}: {
    page: number;
    itemsPerPage?: number;
    onPageChange: (page: number) => void;
}) {
    const { theme: uiTheme } = useTheme()
    const { theme } = uiTheme;

    const filters = useMemo(
        () => [Constants.CourseType.BLOG.toUpperCase()],
        [],
    );
    const { products, loading, totalPages } = useProducts(
        page,
        itemsPerPage,
        filters,
        true,
    );

    if (!loading && totalPages && products.length === 0) {
        return (
            <div className="flex flex-col gap-4 items-center justify-center py-12 text-center">
                <BookOpen className="w-12 h-12 text-muted-foreground" />
                <Subheader1 theme={theme}>This page is empty.</Subheader1>
                <Button size="sm" theme={theme} onClick={() => onPageChange(1)}>
                    Go to first page
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading
                    ? Array.from({ length: ITEMS_PER_PAGE }).map((_, index) => (
                        <ProductCardSkeleton key={index} theme={theme} />
                    ))
                    : products.map((product: Course) => (
                        <BlogContentCard
                            key={product.courseId}
                            product={product}
                        />
                    ))}
            </div>
            <PaginationControls
                currentPage={page}
                totalPages={Math.ceil(totalPages / itemsPerPage)}
                onPageChange={onPageChange}
            />
        </div>
    );
}
