"use client";

import { trpc } from "@/utils/trpc";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import { Card, CardContent } from "@workspace/ui/components/card";
import { ArrowLeft, ArrowRight, FileText } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useRef } from "react";
import dynamic from "next/dynamic";
import CourseLessonsSidebar from "../../../_components/course-lessons-sidebar";
import { TextEditorContent } from "@workspace/common-models";

// Dynamic import for LessonContentEditor
const LessonContentEditor = dynamic(
  () =>
    import(
      "@/components/editors/tiptap/templates/lesson-content/lesson-content-editor"
    ).then((mod) => ({ default: mod.LessonContentEditor })),
  { ssr: false },
);

export default function LessonDetailPage() {
  const params = useParams();
  const courseId = params.courseId as string;
  const lessonId = params.lessonId as string;
  const editorRef = useRef<any>(null);

  // Load lesson data from tRPC
  const loadLessonQuery =
    trpc.lmsModule.courseModule.lesson.publicGetById.useQuery(
      {
        courseId,
        lessonId,
      },
      {
        enabled: !!(courseId && lessonId),
      },
    );

  // Load course data to get lesson groups and navigation
  const loadCourseQuery =
    trpc.lmsModule.courseModule.course.getByCourseDetailed.useQuery(
      {
        courseId,
      },
      {
        enabled: !!courseId,
      },
    );

  const isLoading = loadLessonQuery.isLoading || loadCourseQuery.isLoading;
  const lesson = loadLessonQuery.data;
  const course = loadCourseQuery.data;
  const lessonError = loadLessonQuery.error;
  const courseError = loadCourseQuery.error;

  // Handle errors
  if (lessonError) {
    return (
      <main className="bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground mb-4">
              Error Loading Lesson
            </h1>
            <p className="text-muted-foreground mb-6">{lessonError.message}</p>
            <Button asChild>
              <Link href={`/courses/${courseId}`}>Back to Course</Link>
            </Button>
          </div>
        </div>
      </main>
    );
  }

  if (courseError) {
    return (
      <main className="bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground mb-4">
              Error Loading Course
            </h1>
            <p className="text-muted-foreground mb-6">{courseError.message}</p>
            <Button asChild>
              <Link href="/courses">Back to Courses</Link>
            </Button>
          </div>
        </div>
      </main>
    );
  }

  if (isLoading) {
    return (
      <main className="bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="h-8 bg-muted rounded animate-pulse" />
              <div className="h-12 bg-muted rounded animate-pulse" />
              <div className="h-6 bg-muted rounded animate-pulse" />
              <div className="h-96 bg-muted rounded animate-pulse" />
            </div>
            <div className="space-y-6">
              <div className="h-64 bg-muted rounded animate-pulse" />
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (!lesson) {
    return (
      <main className="bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground mb-4">
              Lesson Not Found
            </h1>
            <p className="text-muted-foreground mb-6">
              The lesson you're looking for doesn't exist or you don't have
              access to it.
            </p>
            <Button asChild>
              <Link href={`/courses/${courseId}`}>Back to Course</Link>
            </Button>
          </div>
        </div>
      </main>
    );
  }

  const getTypeIcon = (type: string) => {
    switch (type?.toLowerCase()) {
      case "text":
        return <FileText className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  return (
    <main className="bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Link href="/courses" className="hover:text-foreground">
                Courses
              </Link>
              <span>/</span>
              <Link
                href={`/courses/${courseId}`}
                className="hover:text-foreground"
              >
                {course?.title || "Course"}
              </Link>
              <span>/</span>
              <span className="text-foreground">{lesson.title}</span>
            </div>

            {/* Lesson Header */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                {getTypeIcon(lesson.type)}
                <Badge variant="secondary" className="capitalize">
                  {lesson.type}
                </Badge>
              </div>

              <h1 className="text-3xl font-bold text-foreground">
                {lesson.title}
              </h1>
              {lesson.media?.caption && (
                <p className="text-lg text-muted-foreground">
                  {lesson.media.caption}
                </p>
              )}
            </div>

            {/* Lesson Content */}
            <Card>
              <CardContent className="p-6">
                <div className="space-y-6">
                  {/* Attached Image/Thumbnail */}
                  {lesson.media?.thumbnail && (
                    <div className="aspect-video bg-muted rounded-lg overflow-hidden">
                      <img
                        src={lesson.media.thumbnail}
                        alt={lesson.media.caption || "Lesson thumbnail"}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  {/* Lesson Content - immediately render LessonContentEditor */}
                  {lesson.type?.toLowerCase() === "text" ? (
                    lesson.content ? (
                      <LessonContentEditor
                        ref={editorRef}
                        editable={false}
                        placeholder="Loading lesson content..."
                        onEditor={(editor, meta) => {
                          if (
                            meta.reason === "create" &&
                            lesson?.content &&
                            lesson.type === "text"
                          ) {
                            try {
                              // Set content when editor is ready
                              console.log(
                                "Setting lesson content:",
                                lesson.content,
                              );
                              const c = lesson.content as TextEditorContent;
                              editor?.commands.setContent(c.content);
                            } catch (error) {
                              console.error(
                                "Error setting lesson content:",
                                error,
                              );
                            }
                          }
                        }}
                      />
                    ) : (
                      <div className="text-muted-foreground">
                        <p>Text content not available.</p>
                      </div>
                    )
                  ) : (
                    <div className="bg-muted rounded-lg p-8 text-center">
                      <FileText className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                      <h4 className="text-lg font-semibold mb-2">Content</h4>
                      <p className="text-muted-foreground">
                        Only text lessons are supported at this time.
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Navigation */}
            <div className="flex items-center justify-between">
              {lesson.meta?.prevLesson ? (
                <Link
                  href={`/courses/${courseId}/lessons/${lesson.meta.prevLesson}`}
                >
                  <Button
                    variant="outline"
                    className="flex items-center gap-2 bg-transparent"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Previous Lesson
                  </Button>
                </Link>
              ) : (
                <div />
              )}

              {lesson.meta?.nextLesson ? (
                <Link
                  href={`/courses/${courseId}/lessons/${lesson.meta.nextLesson}`}
                >
                  <Button className="flex items-center gap-2 bg-[rgb(var(--brand-primary))] hover:bg-[rgb(var(--brand-primary-hover))] text-white">
                    Next Lesson
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              ) : (
                <Link href={`/courses/${courseId}`}>
                  <Button className="flex items-center gap-2 bg-[rgb(var(--brand-primary))] hover:bg-[rgb(var(--brand-primary-hover))] text-white">
                    Back to Course
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              )}
            </div>
          </div>

          {/* Sidebar - Course Lessons */}
          {course && (
            <CourseLessonsSidebar
              course={course as any}
              currentLessonId={lessonId}
              showPricing={false}
              showCourseInfo={false}
            />
          )}
        </div>
      </div>
    </main>
  );
}
