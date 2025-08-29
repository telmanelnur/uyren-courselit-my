"use client"

import type React from "react"

import { useParams, useSearchParams } from "next/navigation"
import { Suspense, useEffect, useState } from "react"
import { ArrowLeft, ArrowRight, ChevronLeft, ChevronRight, Clock, User, CheckCircle, FileText } from "lucide-react"
import Link from "next/link"
import Header from "@/components/layout/header"
import { Skeleton } from "@workspace/ui/components/skeleton"
import Footer from "@/components/layout/footer"
import { Button } from "@workspace/ui/components/button"
import { ScrollAnimation } from "@/components/public/scroll-animation"
import { Badge } from "@workspace/ui/components/badge"
import { Card, CardContent } from "@workspace/ui/components/card"
import CourseLessonsSidebar from "../../../_components/course-lessons-sidebar"
import { trpc } from "@/utils/trpc"
import dynamic from "next/dynamic"
import { TextEditorContent } from "@workspace/common-models"

// Dynamic import for LessonContentEditor
const LessonContentEditor = dynamic(
  () =>
    import(
      "@/components/editors/tiptap/templates/lesson-content/lesson-content-editor"
    ).then((mod) => ({ default: mod.LessonContentEditor })),
  { ssr: false },
);

function LessonDetailsContent() {
  const params = useParams()
  const searchParams = useSearchParams()
  const courseId = params.courseId as string
  const lessonId = params.lessonId as string
  const program = searchParams.get("program") || "primary"

  // Load lesson data using tRPC
  const { data: lesson, isLoading: lessonLoading, error: lessonError } = trpc.lmsModule.courseModule.lesson.publicGetById.useQuery({
    courseId,
    lessonId
  }, {
    enabled: !!(courseId && lessonId)
  })

  // Load course data to get lesson groups and navigation
  const { data: course, isLoading: courseLoading, error: courseError } = trpc.lmsModule.courseModule.course.publicGetByCourseId.useQuery({
    courseId
  }, {
    enabled: !!courseId
  })

  const isLoading = lessonLoading || courseLoading
  const error = lessonError || courseError

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="grid lg:grid-cols-4 gap-8">
            <div className="lg:col-span-3 space-y-6">
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-96 w-full" />
            </div>
            <div className="space-y-6">
              <Skeleton className="h-64 w-full" />
            </div>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  if (error || !lesson) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Lesson Not Found</h1>
          <p className="text-gray-600 mb-4">{error?.message || "The requested lesson could not be found."}</p>
          <Link href={`/courses/${courseId}`}>
            <Button className="bg-brand-primary hover:bg-brand-primary-hover">Back to Course</Button>
          </Link>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white m--lesson-page">
      <Header />

      {/* Breadcrumb */}
      <section className="py-4 border-b bg-gray-50/50 m--breadcrumb-section">
        <div className="container mx-auto px-4">
          <div className="flex items-center space-x-2 text-sm text-gray-600 m--breadcrumbs">
            <Link href="/courses" className="hover:text-brand-primary transition-colors">
              Courses
            </Link>
            <span>/</span>
            <Link href={`/courses/${courseId}`} className="hover:text-brand-primary transition-colors">
              {course?.title}
            </Link>
            <span>/</span>
            <span className="text-gray-900 font-medium">{lesson.title}</span>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-8 m--lesson-main">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-4 gap-8 m--lesson-layout">
            {/* Content Area */}
            <div className="lg:col-span-3 space-y-6 m--lesson-content">
              {/* Header */}
              <ScrollAnimation variant="fadeUp">
                <div className="flex items-center justify-between mb-6 m--lesson-header">
                  <Link
                    href={`/courses/${courseId}`}
                    className="inline-flex items-center text-gray-600 hover:text-brand-primary transition-colors"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Course
                  </Link>
                  <Badge variant="outline" className="border-brand-primary text-brand-primary">
                    {lesson.type || "Content"}
                  </Badge>
                </div>

                <div className="m--lesson-title-section">
                  <h1 className="text-4xl font-bold text-gray-900 mb-4 m--lesson-title">{lesson.title}</h1>
                  <div className="flex items-center space-x-6 text-gray-600 m--lesson-meta">
                    {/* <div className="flex items-center">
                      <Clock className="h-5 w-5 mr-2 text-brand-primary" />
                      <span>{lesson.duration} min read</span>
                    </div> */}
                    <div className="flex items-center">
                      <User className="h-5 w-5 mr-2 text-brand-primary" />
                      <span>Beginner Level</span>
                    </div>
                  </div>
                </div>
              </ScrollAnimation>

              {/* Lesson Content */}
              <ScrollAnimation variant="fadeUp">
                <Card className="border-0 shadow-sm m--lesson-content-card">
                  <CardContent className="p-8">
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

                      {/* Lesson Content - render LessonContentEditor */}
                      {lesson.type?.toLowerCase() === "text" ? (
                        lesson.content ? (
                          <LessonContentEditor
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
              </ScrollAnimation>

              {/* Learning Objectives */}
              {/* {lesson.objectives && (
                <ScrollAnimation variant="fadeUp">
                  <Card className="border-brand-primary/20 m--objectives-card">
                    <CardContent className="p-6">
                      <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center m--objectives-title">
                        <CheckCircle className="h-5 w-5 mr-2 text-brand-primary" />
                        Learning Objectives
                      </h2>
                      <div className="space-y-3 m--objectives-list">
                        {lesson.objectives.map((objective: string, index: number) => (
                          <div key={index} className="flex items-start m--objective-item">
                            <CheckCircle className="h-5 w-5 text-brand-primary mr-3 mt-0.5 flex-shrink-0" />
                            <span className="text-gray-600">{objective}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </ScrollAnimation>
              )} */}

              {/* Navigation */}
              <ScrollAnimation variant="fadeUp">
                <div className="flex justify-between items-center pt-8 border-t m--lesson-navigation">
                  {lesson.meta?.prevLesson ? (
                    <Link
                      href={`/courses/${courseId}/lessons/${lesson.meta.prevLesson}`}
                      className="flex items-center text-brand-primary hover:text-brand-primary-hover transition-colors"
                    >
                      <ChevronLeft className="h-4 w-4 mr-1" />
                      Previous Lesson
                    </Link>
                  ) : (
                    <div></div>
                  )}

                  {lesson.meta?.nextLesson ? (
                    <Link
                      href={`/courses/${courseId}/lessons/${lesson.meta.nextLesson}`}
                      className="flex items-center text-brand-primary hover:text-brand-primary-hover transition-colors"
                    >
                      Next Lesson
                      <ChevronRight className="h-4 w-4 ml-1" />
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
              </ScrollAnimation>
            </div>

            <div className="m--lesson-sidebar">
              <CourseLessonsSidebar
                course={course}
                currentLessonId={lessonId}
                showPricing={true}
                showCourseInfo={true}
                loading={isLoading}
              />
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}

export default function LessonDetailsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LessonDetailsContent />
    </Suspense>
  )
}
