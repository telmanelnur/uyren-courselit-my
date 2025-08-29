"use client";

import { DataTable } from "@/components/data-table/data-table";
import { DataTableSortList } from "@/components/data-table/data-table-sort-list";
import { DataTableToolbar } from "@/components/data-table/data-table-toolbar";
import { useDataTable } from "@/components/data-table/use-data-table";
import { APP_MESSAGE_SETTINGS_SAVED, BUTTON_SAVE } from "@/lib/ui/config/strings";
import { trpc } from "@/utils/trpc";
import { zodResolver } from "@hookform/resolvers/zod";
import { createColumnHelper } from "@tanstack/react-table";
import { ComboBox2, NiceModal, NiceModalHocProps, useToast } from "@workspace/components-library";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@workspace/ui/components/alert-dialog";
import { Button } from "@workspace/ui/components/button";
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@workspace/ui/components/dialog";
import { Form } from "@workspace/ui/components/form";
import { Separator } from "@workspace/ui/components/separator";
import { BookOpen, Import, Star, Trash2 } from "lucide-react";
import React, { useCallback, useMemo, useRef } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";
import { BannerSettings } from "./banner-settings";
import { GeneralSettings } from "./general-settings";

type SelectItemType = {
  key: string;
  title: string;
};

// Course import dialog
const CourseImportDialog = NiceModal.create<
  NiceModalHocProps,
  { reason: "cancel"; data: null } | { reason: "submit"; data: { key: string; title: string } }
>(({ }) => {
  const { visible, hide, resolve } = NiceModal.useModal();
  const [selectedCourse, setSelectedCourse] = React.useState<SelectItemType | null>(null);
  const trpcUtils = trpc.useUtils();

  const handleCancel = useCallback(() => {
    resolve({ reason: "cancel", data: null });
    hide();
  }, [resolve, hide]);

  const handleImport = useCallback(() => {
    if (selectedCourse) {
      resolve({ reason: "submit", data: selectedCourse });
      hide();
    }
  }, [selectedCourse, resolve, hide]);

  const fetchCourses = useCallback(async (search: string) => {
    const response = await trpcUtils.lmsModule.courseModule.course.list.fetch({
      pagination: {
        take: 15,
        skip: 0,
      },
      search: {
        q: search,
      },
    });
    return response.items.map(course => ({
      key: `${course.courseId}`,
      title: course.title,
    }));
  }, [trpcUtils]);

  return (
    <Dialog open={visible} onOpenChange={(v) => !v && handleCancel()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Import Course</DialogTitle>
          <DialogDescription>Select a course to import as featured</DialogDescription>
        </DialogHeader>
        <ComboBox2<SelectItemType>
          title="Select a course"
          valueKey="key"
          value={selectedCourse || undefined}
          searchFn={fetchCourses}
          renderText={(item) => item.title}
          onChange={setSelectedCourse}
          multiple={false}
        />
        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={handleCancel}>Cancel</Button>
          <Button onClick={handleImport} disabled={!selectedCourse}>Import</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
});

type ReviewSelectItemType = SelectItemType & {
  rating: number;
  author?: {
    userId: string;
    name: string;
    avatar?: any;
  };
};

// Review import dialog
const ReviewImportDialog = NiceModal.create<
  NiceModalHocProps,
  { reason: "cancel"; data: null } | { reason: "submit"; data: { key: string;  rating: number; author?: { userId: string; name: string; avatar?: any } } }
>(({ }) => {
  const { visible, hide, resolve } = NiceModal.useModal();
  const [selectedReview, setSelectedReview] = React.useState<ReviewSelectItemType | null>(null);
  const trpcUtils = trpc.useUtils();

  const handleCancel = useCallback(() => {
    resolve({ reason: "cancel", data: null });
    hide();
  }, [resolve, hide]);

  const handleImport = useCallback(() => {
    if (selectedReview) {
      resolve({ reason: "submit", data: selectedReview });
      hide();
    }
  }, [selectedReview, resolve, hide]);

  const fetchReviews = useCallback(async (search: string) => {
    const response = await trpcUtils.lmsModule.reviewModule.review.list.fetch({
      pagination: {
        take: 15,
        skip: 0,
      },
      search: {
        q: search,
      },
    });
    return response.items.map(review => ({
      key: `${review.reviewId}`,
      title: `${review.authorName} - ${review.content.content.substring(0, 30)}...`,
      rating: review.rating,
      author: review.author,
    }));
  }, [trpcUtils]);

  return (
    <Dialog open={visible} onOpenChange={(v) => !v && handleCancel()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Import Review</DialogTitle>
          <DialogDescription>Select a review to import as featured</DialogDescription>
        </DialogHeader>
        <ComboBox2<ReviewSelectItemType>
          title="Select a review"
          valueKey="key"
          value={selectedReview || undefined}
          searchFn={fetchReviews}
          renderText={(review) => review.title}
          onChange={setSelectedReview}
          multiple={false}
        />
        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={handleCancel}>Cancel</Button>
          <Button onClick={handleImport} disabled={!selectedReview}>Import</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
});

// Move schema outside component to prevent recreation
const mainPageSchema = z.object({
  showBanner: z.boolean(),
  bannerTitle: z.string().min(1, "Banner title is required").max(100, "Banner title too long"),
  bannerSubtitle: z.string().max(200, "Banner subtitle too long").optional(),
  showStats: z.boolean(),
  showFeatures: z.boolean(),
  showTestimonials: z.boolean(),
  featuredCourses: z.array(z.object({
    courseId: z.string().min(1, "Course ID is required").max(50, "Course ID too long"),
    title: z.string().min(1, "Title is required").max(100, "Title too long"),
    slug: z.string().min(1, "Slug is required").max(100, "Slug too long"),
    shortDescription: z.string().max(500, "Description too long").optional(),
    level: z.enum(["beginner", "intermediate", "advanced"]).optional(),
    duration: z.number().min(0, "Duration must be at least 0").max(1000, "Duration too high").optional(),
    isFeatured: z.boolean().optional(),
    order: z.number().min(0, "Order must be at least 0").max(1000, "Order too high").optional(),
  })),
  featuredReviews: z.array(z.object({
    reviewId: z.string().min(1, "Review ID is required").max(50, "Review ID too long"),
    authorName: z.string().min(1, "Author name is required").max(100, "Author name too long"),
    rating: z.number().min(1, "Rating must be at least 1").max(10, "Rating cannot exceed 10"),
    content: z.string().min(1, "Review content is required").max(1000, "Review content too long"),
    targetType: z.string().min(1, "Target type is required").max(50, "Target type too long").optional(),
    targetId: z.string().max(50, "Target ID too long").optional(),
    authorId: z.string().optional(),
    order: z.number().min(0, "Order must be at least 0").max(1000, "Order too high").optional(),
  })),
});

type MainPageFormData = z.infer<typeof mainPageSchema>;

// Memoized default values to prevent recreation
const defaultValues: MainPageFormData = {
  showBanner: true,
  bannerTitle: "Welcome to Our Learning Platform",
  bannerSubtitle: "Discover amazing courses and grow your skills",
  showStats: true,
  showFeatures: true,
  showTestimonials: true,
  featuredCourses: [],
  featuredReviews: [],
};

export default function MainPageSettings() {
  const { toast } = useToast();
  const courseCountRef = useRef(0);
  const reviewCountRef = useRef(0);

  const { data: websiteSettings, isLoading } = trpc.siteModule.websiteSettings.getWebsiteSettings.useQuery();
  const updateSettingsMutation = trpc.siteModule.websiteSettings.updateWebsiteSettings.useMutation();

  const form = useForm<MainPageFormData>({
    resolver: zodResolver(mainPageSchema),
    defaultValues,
  });

  const { fields: courseFields, append: appendCourse, remove: removeCourse } = useFieldArray({
    control: form.control,
    name: "featuredCourses",
  });

  const { fields: reviewFields, append: appendReview, remove: removeReview } = useFieldArray({
    control: form.control,
    name: "featuredReviews",
  });

  React.useEffect(() => {
    courseCountRef.current = courseFields.length;
    reviewCountRef.current = reviewFields.length;
  }, [courseFields.length, reviewFields.length]);

  const resetForm = useCallback((data: any) => {
    if (data?.mainPage) form.reset(data.mainPage);
  }, [form]);

  React.useEffect(() => {
    resetForm(websiteSettings);
  }, [websiteSettings, resetForm]);

  const mutateSettings = useCallback(async (data: MainPageFormData) => {
    return updateSettingsMutation.mutateAsync({ data: { mainPage: data } });
  }, [updateSettingsMutation]);

  const onSubmit = useCallback(async (data: MainPageFormData) => {
    try {
      await mutateSettings(data);
      toast({ title: "Success", description: APP_MESSAGE_SETTINGS_SAVED });
    } catch (error) {
      toast({ title: "Error", description: "Failed to save settings. Please try again.", variant: "destructive" });
    }
  }, [mutateSettings, toast]);

  const handleAddCourse = useCallback(() => {
    const newOrder = courseCountRef.current;
    appendCourse({
      courseId: `course-${Date.now()}`,
      title: "",
      slug: "",
      shortDescription: "",
      level: "beginner",
      duration: 0,
      isFeatured: false,
      order: newOrder,
    });
  }, [appendCourse]);

  const handleAddReview = useCallback(() => {
    const newOrder = reviewCountRef.current;
    appendReview({
      reviewId: `review-${Date.now()}`,
      authorName: "",
      rating: 5,
      content: "",
      targetType: "website",
      targetId: "",
      authorId: "",
      order: newOrder,
    });
  }, [appendReview]);

  const handleRemoveCourse = useCallback((index: number) => removeCourse(index), [removeCourse]);
  const handleRemoveReview = useCallback((index: number) => removeReview(index), [removeReview]);

  const handleImportCourse = useCallback((course: any) => {
    const newOrder = courseFields.length;
    appendCourse({
      courseId: course.key,
      title: course.title,
      slug: course.title.toLowerCase().replace(/\s+/g, '-'),
      shortDescription: "",
      level: "beginner",
      duration: 0,
      isFeatured: false,
      order: newOrder,
    });
  }, [appendCourse, courseFields.length]);

  const handleImportReview = useCallback((review: any) => {
    const newOrder = reviewFields.length;
    appendReview({
      reviewId: review.key,
      authorName: review.authorName,
      rating: review.rating,
      content: review.content,
      targetType: "course",
      targetId: "",
      authorId: review.author?.userId || "",
      order: newOrder,
    });
  }, [appendReview, reviewFields.length]);

  const loadingSkeleton = useMemo(() => (
    <div className="space-y-8">
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/3 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-2/3"></div>
      </div>
      <div className="grid gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-32 bg-gray-200 rounded animate-pulse"></div>
        ))}
      </div>
    </div>
  ), []);

  const submitButton = useMemo(() => (
    <div className="flex justify-end">
      <Button type="submit" disabled={updateSettingsMutation.isPending} className="min-w-[120px]">
        {updateSettingsMutation.isPending ? "Saving..." : BUTTON_SAVE}
      </Button>
    </div>
  ), [updateSettingsMutation.isPending]);

  if (isLoading) {
    return loadingSkeleton;
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <BannerSettings form={form} />
        <GeneralSettings form={form} />

        <FeaturedCoursesSection
          courseFields={courseFields}
          onRemove={handleRemoveCourse}
          onImport={handleImportCourse}
        />

        <Separator />

        <FeaturedReviewsSection
          reviewFields={reviewFields}
          onRemove={handleRemoveReview}
          onImport={handleImportReview}
        />

        {submitButton}
      </form>
    </Form>
  );
}

// Featured Courses Section Component
const FeaturedCoursesSection = React.memo(({ courseFields, onRemove, onImport }: {
  courseFields: any[];
  onRemove: (index: number) => void;
  onImport: (course: any) => void;
}) => {
  const columnHelper = useMemo(() => createColumnHelper<any>(), []);
  const courseData = useMemo(() => courseFields.map((course, index) => ({ ...course, originalIndex: index })), [courseFields]);

  const courseColumns = useMemo(() => [
    columnHelper.accessor("title", { header: "Title", cell: ({ row }) => row.original.title || "" }),
    columnHelper.accessor("slug", { header: "Slug", cell: ({ row }) => row.original.slug || "" }),
    columnHelper.accessor("level", { header: "Level", cell: ({ row }) => row.original.level || "beginner" }),
    columnHelper.accessor("isFeatured", { header: "Featured", cell: ({ row }) => row.original.isFeatured ? "Yes" : "No" }),
    columnHelper.display({
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="outline" size="sm"><Trash2 className="h-4 w-4" /></Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Remove Course</AlertDialogTitle>
              <AlertDialogDescription>Are you sure you want to remove this course? This action cannot be undone.</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={() => onRemove(row.original.originalIndex)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Remove</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      ),
    }),
  ], [columnHelper, onRemove]);

  const courseTable = useDataTable({
    columns: courseColumns,
    data: courseData,
    pageCount: 1,
    enableGlobalFilter: false,
    enableColumnFilters: false,
    enableSorting: true,
    initialState: { sorting: [{ id: "order", desc: false }] },
  });

  const handleImportClick = useCallback(async () => {
    const result = await NiceModal.show(CourseImportDialog, {});
    if (result.reason === "submit") onImport(result.data);
  }, [onImport]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="h-4 w-4 text-blue-600" />
          Featured Courses
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <DataTable table={courseTable.table}>
          <DataTableToolbar table={courseTable.table}>
            <DataTableSortList table={courseTable.table} />
          </DataTableToolbar>
        </DataTable>
        <Button variant="outline" onClick={handleImportClick} className="flex items-center gap-2">
          <Import className="h-4 w-4" />
          Import Course
        </Button>
      </CardContent>
    </Card>
  );
});

// Featured Reviews Section Component
const FeaturedReviewsSection = React.memo(({ reviewFields, onRemove, onImport }: {
  reviewFields: any[];
  onRemove: (index: number) => void;
  onImport: (review: any) => void;
}) => {
  const columnHelper = useMemo(() => createColumnHelper<any>(), []);
  const reviewData = useMemo(() => reviewFields.map((review, index) => ({ ...review, originalIndex: index })), [reviewFields]);

  const reviewColumns = useMemo(() => [
    columnHelper.accessor("authorName", { header: "Author", cell: ({ row }) => row.original.authorName || "" }),
    columnHelper.accessor("content", { header: "Content", cell: ({ row }) => row.original.content || "" }),
    columnHelper.accessor("rating", { header: "Rating", cell: ({ row }) => row.original.rating || 5 }),
    columnHelper.display({
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="outline" size="sm"><Trash2 className="h-4 w-4" /></Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Remove Review</AlertDialogTitle>
              <AlertDialogDescription>Are you sure you want to remove this review? This action cannot be undone.</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={() => onRemove(row.original.originalIndex)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Remove</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      ),
    }),
  ], [columnHelper, onRemove]);

  const reviewTable = useDataTable({
    columns: reviewColumns,
    data: reviewData,
    pageCount: 1,
    enableGlobalFilter: false,
    enableColumnFilters: false,
    enableSorting: true,
    initialState: { sorting: [{ id: "order", desc: false }] },
  });

  const handleImportClick = useCallback(async () => {
    const result = await NiceModal.show(ReviewImportDialog, {});
    if (result.reason === "submit") onImport(result.data);
  }, [onImport]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Star className="h-4 w-4 text-yellow-600" />
          Featured Reviews
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <DataTable table={reviewTable.table}>
          <DataTableToolbar table={reviewTable.table}>
            <DataTableSortList table={reviewTable.table} />
          </DataTableToolbar>
        </DataTable>
        <Button variant="outline" onClick={handleImportClick} className="flex items-center gap-2">
          <Import className="h-4 w-4" />
          Import Review
        </Button>
      </CardContent>
    </Card>
  );
});

FeaturedCoursesSection.displayName = "FeaturedCoursesSection";
FeaturedReviewsSection.displayName = "FeaturedReviewsSection";
