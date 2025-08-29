"use client";

import { SkeletonCard } from "@/components/skeleton-card";
import { trpc } from "@/utils/trpc";
import { Constants } from "@workspace/common-models";
import { Search } from "@workspace/icons";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@workspace/ui/components/select";
import { useDebounce } from "@workspace/ui/hooks/use-debounce";
import { BookOpen } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

const ITEMS_PER_PAGE_COURSES = 12;

export default function CoursesPage() {
    const searchParams = useSearchParams();
    const search = searchParams?.get("search") || "";
    const type = searchParams?.get("type") || "all";
    const router = useRouter();

    const [searchQuery, setSearchQuery] = useState(search);
    const [selectedType, setSelectedType] = useState(type);

    const debouncedSearchValue = useDebounce(searchQuery, 500);
    const [page, setPage] = useState(1);

    useEffect(() => {
        setSearchQuery(search);
        setSelectedType(type);
    }, [search, type]);

    const handlePageChange = useCallback(
        (value: number) => {
            const params = new URLSearchParams();
            params.set("page", value.toString());
            if (debouncedSearchValue) params.set("search", debouncedSearchValue);
            if (selectedType && selectedType !== "all")
                params.set("type", selectedType);
            setPage(value);
            // router.push(`/courses?${params.toString()}`);
        },
        [router, debouncedSearchValue, selectedType],
    );

    const handleFilterChange = useCallback(
        (filters: { search?: string; type?: string }) => {
            const params = new URLSearchParams();
            params.set("page", "1"); // Reset to first page when filtering
            if (filters.search) params.set("search", filters.search);
            if (filters.type && filters.type !== "all")
                params.set("type", filters.type);
            // router.push(`/courses?${params.toString()}`);
        },
        [router],
    );

    useEffect(() => {
        handleFilterChange({ search: debouncedSearchValue, type: selectedType });
    }, [debouncedSearchValue, selectedType]);

    const loadCoursesQuery = trpc.lmsModule.product.publicList.useQuery(
        {
            pagination: {
                take: ITEMS_PER_PAGE_COURSES,
                skip: (page - 1) * ITEMS_PER_PAGE_COURSES,
            },
            search: {
                q: debouncedSearchValue,
            },
            filter: {
                type: (selectedType && selectedType !== "all"
                    ? [selectedType]
                    : undefined) as any,
            },
        },
        {
            staleTime: 0,
        },
    );

    const courses = loadCoursesQuery.data?.items || [];
    const loading = loadCoursesQuery.isLoading;
    const totalPages = loadCoursesQuery.data?.total || 0;

    function SkeletonGrid() {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(ITEMS_PER_PAGE_COURSES)].map((_, index) => (
                    <SkeletonCard key={index} />
                ))}
            </div>
        );
    }

    return (
        <main className="bg-background min-h-screen">
            <section className="py-16 text-center  bg-gradient-to-b from-orange-100 to-white dark:from-orange-950/20 dark:to-background">
                <div className="container mx-auto px-4">
                    <div className="text-center space-y-4">
                        <h1 className="text-4xl font-bold">
                            <span className="text-brand-primary">Our</span> Courses
                        </h1>
                        <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
                            Choose from our comprehensive collection of programming and data
                            science courses designed to take you from beginner to expert.
                        </p>
                    </div>
                </div>
            </section>

            <section className="py-4">
                <div className="container mx-auto px-4">
                    <div className="flex flex-col gap-6 min-h-[80vh]">
                        <div className="flex flex-col sm:flex-row justify-between gap-4">
                            <div className="relative flex-1 max-w-md">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                <Input
                                    placeholder="Search courses, topics, or tags..."
                                    value={searchQuery}
                                    onChange={(e) => {
                                        setSearchQuery(e.target.value);
                                    }}
                                    className="pl-10"
                                />
                            </div>
                            <Select value={selectedType} onValueChange={setSelectedType}>
                                <SelectTrigger className="w-full sm:w-[180px]">
                                    <SelectValue placeholder="Filter by type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Types</SelectItem>
                                    <SelectItem value={Constants.CourseType.COURSE}>
                                        Course
                                    </SelectItem>
                                    <SelectItem value={Constants.CourseType.DOWNLOAD}>
                                        Download
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {!loading && totalPages && courses.length === 0 ? (
                            <div className="flex flex-col gap-4 items-center justify-center py-12 text-center">
                                <BookOpen className="w-12 h-12 text-muted-foreground" />
                                <h4>This page is empty.</h4>
                                <Button
                                    size="sm"
                                    onClick={() => handlePageChange(1)}
                                >
                                    Go to first page
                                </Button>
                            </div>
                        ) : (
                            <div className="space-y-8">
                                {/* {loading ? (
                                    <SkeletonGrid />
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {courses.map((course) => (
                                            <CourseCard
                                                key={course.courseId}
                                                course={course as any}
                                            />
                                        ))}
                                    </div>
                                )} */}
                                {/* <CoursePagination
                                    currentPage={page}
                                    totalPages={Math.ceil(totalPages / ITEMS_PER_PAGE_COURSES)}
                                    totalItems={totalPages}
                                    itemsPerPage={ITEMS_PER_PAGE_COURSES}
                                    onPageChange={handlePageChange}
                                    theme={theme.theme}
                                /> */}
                            </div>
                        )}
                    </div>
                </div>
            </section>
        </main>
    );
}