"use client"

import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import { Card, CardContent } from "@workspace/ui/components/card"
import { ArrowLeft, ArrowRight, FileText } from "lucide-react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { useRef } from "react"
import dynamic from "next/dynamic"
import CourseLessonsSidebar from "../../../_components/course-lessons-sidebar"
import { TextEditorContent } from "@workspace/common-models"
import { useTranslation } from "next-i18next"


interface LessonMeta {
  prevLesson?: string
  nextLesson?: string
}

interface Lesson {
  id: string
  courseId: string
  title: string
  duration: string
  type: string
  is_preview: boolean
  meta: LessonMeta
  content?: TextEditorContent
}

interface Group {
  id: string
  title: string
  lessons: Lesson[]
}

interface Course {
  id: string
  title: string
  groups: Group[]
}


const LessonContentEditor = dynamic(
  () =>
    import("@/components/editors/tiptap/templates/lesson-content/lesson-content-editor").then(
      mod => ({ default: mod.LessonContentEditor })
    ),
  { ssr: false }
)

export default function LessonDetailPage() {
  const { t, i18n } = useTranslation("common")
  let coursesDataJson

  if (i18n.language === "ru") {
    coursesDataJson = require("../../../../../data/courses.ru.json")
  } else if (i18n.language === "kz") {
    coursesDataJson = require("../../../../../data/courses.kz.json")
  } else {
    coursesDataJson = require("../../../../../data/courses.en.json")
  }
  
  const coursesData: Course[] = coursesDataJson as Course[]
  
  const params = useParams()
  const courseId = params.courseId as string
  const lessonId = params.lessonId as string
  const editorRef = useRef<any>(null)

  const course = coursesData.find(c => c.id === courseId) || null
  const lessons = course?.groups.flatMap(g => g.lessons) || []
  const lesson = lessons.find(l => l.id === lessonId) || null

  if (!course || !lesson) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">{t("lesson_not_found")}</h1>
          <p className="text-gray-600 mb-4">{t("lesson_not_exist_access")}</p>
          <Link href={`/courses/${courseId || ""}`}>
            <Button className="bg-brand-primary hover:bg-brand-primary-hover">
              {t("back_to_course")}
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  const getTypeIcon = (type: string) => <FileText className="h-4 w-4" />

  return (
    <div className="min-h-screen bg-white m--lesson-page">
      {/* Breadcrumb */}
      <section className="py-4 border-b bg-gray-50/50 m--breadcrumb-section">
        <div className="container mx-auto px-4">
          <div className="flex items-center space-x-2 text-sm text-gray-600 m--breadcrumbs">
            <Link href="/courses" className="hover:text-brand-primary transition-colors">
              {t("courses")}
            </Link>
            <span>/</span>
            <Link href={`/courses/${courseId}`} className="hover:text-brand-primary transition-colors">
              {course.title}
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
              <div className="flex items-center justify-between mb-6 m--lesson-header">
                <Link
                  href={`/courses/${courseId}`}
                  className="inline-flex items-center text-gray-600 hover:text-brand-primary transition-colors"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  {t("back_to_course")}
                </Link>
                <div className="flex items-center gap-2">
                  {getTypeIcon(lesson.type)}
                  <Badge
                    variant="outline"
                    className="border-brand-primary text-brand-primary capitalize"
                  >
                    {lesson.type ? t(`lesson_type.${lesson.type.toLowerCase()}`) : t("content")}
                  </Badge>
                </div>
              </div>

              {/* Title */}
              <div className="m--lesson-title-section">
                <h1 className="text-4xl font-bold text-gray-900 mb-4 m--lesson-title">
                  {lesson.title}
                </h1>
              </div>

              {/* Lesson Content */}
              <Card className="border-0 shadow-sm m--lesson-content-card">
                <CardContent className="p-8">
                  <div className="space-y-6">
                    {lesson.type?.toLowerCase() === "text" ? (
                      <LessonContentEditor
                        ref={editorRef}
                        editable={false}
                        placeholder={t("loading_lesson_content")}
                        onEditor={(editor, meta) => {
                          if (meta.reason === "create" && lesson.type === "text") {
                            try {
                              const c = lesson.content as TextEditorContent
                              if (c?.content) {
                                editor?.commands.setContent(c.content)
                              }
                            } catch (error) {
                              console.error("Error setting lesson content:", error)
                            }
                          }
                        }}
                      />
                    ) : (
                      <div className="bg-muted rounded-lg p-8 text-center">
                        <FileText className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                        <h4 className="text-lg font-semibold mb-2">{t("content")}</h4>
                        <p className="text-gray-600">{t("text_lessons_only")}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Lessons Section */}
              <Card className="border border-gray-200 shadow-sm m--lessons-list">
                <CardContent className="p-6 space-y-4">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">{t("course_lessons")}</h2>
                  {lessons.map((l, i) => (
                    <Link
                      key={l.id}
                      href={`/courses/${courseId}/lessons/${l.id}`}
                      className="flex items-center justify-between p-4 rounded-lg border hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-brand-primary text-white flex items-center justify-center font-bold text-sm">
                          {i + 1}
                        </div>
                        <span className="text-gray-800 font-medium">{l.title}</span>
                      </div>
                      <span className="text-sm text-gray-500">{l.duration}</span>
                    </Link>
                  ))}
                </CardContent>
              </Card>

              {/* Navigation */}
              <div className="flex justify-between items-center pt-8 border-t m--lesson-navigation">
                {lesson.meta?.prevLesson ? (
                  <Link
                    href={`/courses/${courseId}/lessons/${lesson.meta.prevLesson}`}
                    className="flex items-center text-brand-primary hover:text-brand-primary-hover transition-colors"
                  >
                    <ArrowLeft className="h-4 w-4 mr-1" />
                    {t("previous_lesson")}
                  </Link>
                ) : (
                  <div></div>
                )}

                {lesson.meta?.nextLesson ? (
                  <Link
                    href={`/courses/${courseId}/lessons/${lesson.meta.nextLesson}`}
                    className="flex items-center text-brand-primary hover:text-brand-primary-hover transition-colors"
                  >
                    {t("next_lesson")}
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </Link>
                ) : (
                  <Link
                    href={`/courses/${courseId}`}
                    className="flex items-center text-brand-primary hover:text-brand-primary-hover transition-colors"
                  >
                    {t("back_to_course")}
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </Link>
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div className="m--lesson-sidebar">
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
        </div>
      </section>
    </div>
  )
}
