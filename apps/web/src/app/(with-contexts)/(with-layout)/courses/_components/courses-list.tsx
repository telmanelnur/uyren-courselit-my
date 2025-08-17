"use client";

import { useSiteInfo } from "@/components/contexts/site-info-context";
import { trpc } from "@/utils/trpc";
import { getPlanPrice, truncate } from "@workspace/utils";
import { Constants, Course, SiteInfo } from "@workspace/common-models";
import { getSymbolFromCurrency } from "@workspace/components-library";
import { ProductCard, ProductCardSkeleton } from "@workspace/page-blocks";
import { ThemeStyle } from "@workspace/page-models";
import { Button, Subheader1 } from "@workspace/page-primitives";
import { BookOpen } from "lucide-react";
import { useMemo } from "react";
import { EmptyState } from "./empty-state";
import { CoursePagination } from "./course-pagination";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Badge } from "@workspace/ui/components/badge";
import { Clock } from "@workspace/icons";
import Link from "next/link";

const ITEMS_PER_PAGE = 9;

export function CoursesList({
    theme,
    page,
    itemsPerPage = ITEMS_PER_PAGE,
    onPageChange,
    searchQuery,
    selectedType,
}: {
    theme: ThemeStyle;
    page: number;
    itemsPerPage?: number;
    onPageChange: (page: number) => void;
    searchQuery?: string;
    selectedType?: string;
}) {
    const { siteInfo } = useSiteInfo();
    const filters = useMemo(
        () => selectedType ? [selectedType] : [Constants.CourseType.COURSE, Constants.CourseType.DOWNLOAD],
        [selectedType],
    );

    // Use direct tRPC call to publicList endpoint
    const coursesQuery = trpc.lmsModule.product.publicList.useQuery({
        pagination: {
            take: itemsPerPage,
            skip: (page - 1) * itemsPerPage,
        },
        filter: {
            filterBy: filters as any,
            searchQuery: searchQuery || undefined,
        },
    });

    const courses = coursesQuery.data?.items || [];
    const loading = coursesQuery.isLoading;
    const totalPages = coursesQuery.data?.total || 0;

    console.log("courses count:", courses.length);

    const handleClearFilters = () => {
        onPageChange(1);
        window.location.href = '/courses';
    };

    if (!loading && totalPages === 0) {
        return (
            <EmptyState
                searchQuery={searchQuery}
                onClearSearch={searchQuery || selectedType ? handleClearFilters : undefined}
            />
        );
    }

    if (!loading && totalPages && courses.length === 0) {
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
                    : courses.map((course) => (
                        <Card className="h-[520px] flex flex-col transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
                            <div className="aspect-video relative overflow-hidden rounded-t-lg">
                                <img
                                    src={course.featuredImage?.file || "/courselit_backdrop_square.webp"}
                                    alt={course.title}
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute top-4 right-4">
                                    <Badge variant="secondary" className="bg-white/90 text-gray-900">
                                        {course.type}
                                    </Badge>
                                </div>
                            </div>

                            <CardHeader className="flex-1 pb-0">
                                <div>
                                    <CardTitle className="text-xl font-semibold mb-2 text-gray-900">
                                        {truncate(course.title, 50)}
                                    </CardTitle>
                                    <CardDescription className="text-sm text-gray-600 leading-relaxed">
                                        {course.description || "Learn essential skills with this comprehensive course designed for beginners and intermediate learners."}
                                    </CardDescription>
                                </div>

                                <div className="flex items-center gap-3 mt-4">
                                    <Badge variant="outline" className="border-amber-600 text-amber-700">
                                        {course.type === Constants.CourseType.COURSE ? "Course" : "Download"}
                                    </Badge>
                                    <div className="flex items-center text-sm text-gray-600">
                                        <span className="text-yellow-500">★</span>
                                        {/* <span className="ml-1">{mockData.rating}</span> */}
                                    </div>
                                </div>
                            </CardHeader>

                            <CardContent className="mt-auto pt-0 pb-6">
                                <div className="grid grid-cols-3 gap-4 text-sm text-gray-600 mb-4">
                                    {/* <div className="flex items-center">
                                        <Clock className="h-4 w-4 mr-1" />
                                        {mockData.duration}
                                    </div> */}
                                    {/* <div className="flex items-center">
                                        <Users className="h-4 w-4 mr-1" />
                                        {mockData.students}
                                    </div> */}
                                    <div className="flex items-center">
                                        <BookOpen className="h-4 w-4 mr-1" />
                                        {course.lessonsCount} lessons
                                    </div>
                                </div>

                                <div className="flex flex-wrap gap-2 mb-4">
                                    {course.tags?.slice(0, 3).map((tag) => (
                                        <Badge key={tag} variant="secondary" className="text-xs bg-amber-50 text-amber-700">
                                            {tag}
                                        </Badge>
                                    ))}
                                </div>

                                {/* <div className="flex items-center justify-between pt-4 border-t border-gray-200 mb-4">
                                    <div className="text-sm text-gray-600">by {course.instructor}</div>
                                    <div className="text-xl font-bold text-amber-600">{currencySymbol}{price.toFixed(2)}</div>
                                </div> */}

                                <Link href={`/courses/${course.courseId}`} className="block">
                                    <Button className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-semibold">
                                        View Course
                                    </Button>
                                </Link>
                            </CardContent>
                        </Card>
                    ))}
            </div>
            <CoursePagination
                currentPage={page}
                totalPages={Math.ceil(totalPages / itemsPerPage)}
                totalItems={totalPages}
                itemsPerPage={itemsPerPage}
                onPageChange={onPageChange}
                theme={theme}
            />
        </div>
    );
}

function getBadgeText(course: Course, siteinfo: SiteInfo) {
    const defaultPlan = course.paymentPlans?.filter(
        (plan) => plan.planId === course.defaultPaymentPlan,
    )[0];
    if (!defaultPlan) {
        throw new Error("Default plan not found");
    }
    const { amount, period } = getPlanPrice(defaultPlan);

    return (
        <>
            {getSymbolFromCurrency(siteinfo.currencyISOCode || "USD")}
            <span>{amount.toFixed(2)}</span>
            <span className="ml-1">{period}</span>
        </>
    );
}
