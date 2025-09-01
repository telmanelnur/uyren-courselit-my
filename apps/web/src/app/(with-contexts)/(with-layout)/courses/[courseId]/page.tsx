"use client";

import Footer from "@/components/layout/footer";
import Header from "@/components/layout/header";
import { ScrollAnimation } from "@/components/public/scroll-animation";
import { trpc } from "@/utils/trpc";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import { Card, CardContent } from "@workspace/ui/components/card";
import { Skeleton } from "@workspace/ui/components/skeleton";
import { BookOpen, Clock } from "lucide-react";
import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Suspense } from "react";
import { useTranslation } from "react-i18next";
import CourseLessonsSidebar from "../_components/course-lessons-sidebar";

const DescriptionEditor = dynamic(
  () =>
    import(
      "@/components/editors/tiptap/templates/description/description-editor"
    ).then((mod) => ({ default: mod.DescriptionEditor })),
  {
    ssr: false,
  },
);

function CourseDetailsContent() {
  const { t, i18n } = useTranslation("common");
  const params = useParams();
  const courseId = params.courseId as string;

  // Load course data using tRPC
  const {
    data: course,
    isLoading,
    error,
  } = trpc.lmsModule.courseModule.course.publicGetByCourseId.useQuery(
    {
      courseId,
    },
    {
      enabled: !!courseId,
    },
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              {/* Breadcrumb skeleton */}
              <div className="flex items-center gap-2 mb-6">
                <Skeleton className="h-4 w-12" />
                <span>/</span>
                <Skeleton className="h-4 w-16" />
                <span>/</span>
                <Skeleton className="h-4 w-32" />
              </div>

              {/* Header skeleton */}
              <div className="space-y-4">
                <Skeleton className="h-10 w-3/4" />
                <div className="flex flex-wrap items-center gap-4">
                  <Skeleton className="h-5 w-24" />
                  <Skeleton className="h-5 w-20" />
                  <Skeleton className="h-5 w-16" />
                  <Skeleton className="h-6 w-20" />
                </div>
              </div>

              {/* Content skeleton */}
              <Card>
                <CardContent className="p-6">
                  <Skeleton className="h-6 w-48 mb-4" />
                  <div className="space-y-3">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-5/6" />
                    <Skeleton className="h-4 w-4/5" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar skeleton */}
            <div className="space-y-6">
              <Card>
                <CardContent className="p-6">
                  <Skeleton className="h-8 w-32 mx-auto mb-4" />
                  <Skeleton className="h-10 w-full mb-4" />
                  <div className="space-y-3">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-5/6" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">
            {t("course_not_found")}
          </h1>
          <p className="text-muted-foreground mb-4">{t("course_not_exist")}</p>
          <Link href="/courses">
            <Button className="bg-brand-primary hover:bg-brand-primary-hover">
              {t("back_to_courses")}
            </Button>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background m--course-page">
      <Header />

      <main className="container mx-auto px-4 py-8 m--course-main">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 m--course-layout">
          <div className="lg:col-span-2 space-y-6 m--course-content">
            {/* Breadcrumbs */}
            <ScrollAnimation variant="fadeUp">
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6 m--breadcrumbs">
                <Link
                  href="/"
                  className="hover:text-brand-primary transition-colors"
                >
                  {t("home")}
                </Link>
                <span>/</span>
                <Link
                  href="/courses"
                  className="hover:text-brand-primary transition-colors"
                >
                  {t("courses")}
                </Link>
                <span>/</span>
                <span className="text-foreground">{course.title}</span>
              </div>
            </ScrollAnimation>

            {/* Course Header */}
            <ScrollAnimation variant="fadeUp">
              <div className="space-y-4 m--course-header">
                {/* Stats at the top */}
                <div className="flex flex-wrap items-center gap-4 text-sm m--course-meta">
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4 text-brand-primary" />
                    <span>
                      {course.duration || "Self-paced"} {t("weeks")}
                    </span>
                  </div>
                  <Badge
                    variant="secondary"
                    className="bg-brand-primary/10 text-brand-primary border-brand-primary/20"
                  >
                    {course.level || "Beginner"}
                  </Badge>
                </div>
              </div>
            </ScrollAnimation>

            {/* Course Card with Image, Overview and Description */}
            <ScrollAnimation variant="fadeUp">
              <div className="bg-white rounded-lg border border-gray-200 shadow-sm m--course-overview">
                {/* Featured Image */}
                {course.featuredImage && (
                  <div className="relative w-full h-64 md:h-80 rounded-t-lg overflow-hidden">
                    <Image
                      src={
                        course.featuredImage.url ||
                        course.featuredImage.thumbnail ||
                        "/placeholder-course.jpg"
                      }
                      alt={course.featuredImage.caption || course.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  </div>
                )}

                {/* Course Title */}
                <div className="p-6 pb-0">
                  <h1 className="text-3xl md:text-4xl font-bold text-gray-900 m--course-title">
                    {course.title}
                  </h1>

                  {/* Course Tags */}
                  {course.tags && course.tags.length > 0 && (
                    <div className="flex flex-wrap items-center gap-2 mt-3">
                      {course.tags.map((tag, index) => (
                        <Badge
                          key={index}
                          variant="outline"
                          className="bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100 transition-colors"
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                <div className="border-b border-gray-100 p-6 m--overview-header">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-brand-primary to-orange-600 rounded-lg flex items-center justify-center">
                      <BookOpen className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">
                        {t("course_overview")}
                      </h2>
                      <p className="text-sm text-gray-500">
                        {t("course_overview_desc")}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-6 space-y-6 m--overview-content">
                  {/* Description */}
                  <div className="space-y-3 m--description-block">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      📖 {t("about_course")}
                    </h3>
                    {course.description && (
                      <DescriptionEditor
                        editable={false}
                        toolbar={false}
                        onEditor={(editor, meta) => {
                          if (meta.reason === "create") {
                            editor!.commands.setMyContent(course.description!);
                          }
                        }}
                      />
                    )}
                  </div>
                </div>
              </div>
            </ScrollAnimation>
          </div>

          {/* Sidebar */}
          <div className="space-y-6 m--course-sidebar">
            <ScrollAnimation variant="fadeUp">
              <CourseLessonsSidebar course={course} />
            </ScrollAnimation>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default function CourseDetailsPage() {
  const { t } = useTranslation("common");
  return (
    <Suspense fallback={<div>{t("loading")}</div>}>
      <CourseDetailsContent />
    </Suspense>
  );
}
