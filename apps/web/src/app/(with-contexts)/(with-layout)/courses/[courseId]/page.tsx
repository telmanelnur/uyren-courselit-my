"use client"

import { useParams } from "next/navigation"
import { Suspense, useEffect, useState } from "react"
import { useTranslation } from "next-i18next"
import Navigation from "@/components/navigation"
import Footer from "@/components/layout/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { ToggleButton } from "@/components/ui/toggle-button"
import { Clock, Users, Star, BookOpen, Award } from "lucide-react"
import Link from "next/link"
import { ScrollAnimation } from "@/components/scroll-animation"
import CourseLessonsSidebar from "@/components/course-lessons-sidebar"
interface Course {
  id: string
  title: string
  short_description?: string
  description: string
  duration: string
  level: string
  tags?: string[]
  lessons_count?: number
}


function CourseDetailsContent() {
  const { t, i18n } = useTranslation("common")
  let coursesData

if (i18n.language === "ru") {
  coursesData = require("../../../data/courses.ru.json")
} else if (i18n.language === "kz") {
  coursesData = require("../../../data/courses.kz.json")
} else {
  coursesData = require("../../../data/courses.en.json")
}
  const params = useParams()
  const courseId = params.courseId as string
  const [course, setCourse] = useState<Course | null>(null)
  const [loading, setLoading] = useState(true)
  // const [coursesData, setCoursesData] = useState<Course[]>([])

  useEffect(() => {
    const loadCoursesData = async () => {
      try {
        let data: Course[]
        if (i18n.language === "ru") {
          const module = await import("../../../data/courses.ru.json")
          data = module.default as Course[]
        } else if (i18n.language === "kz") {
          const module = await import("../../../data/courses.kz.json")
          data = module.default as Course[]
        } else {
          const module = await import("../../../data/courses.en.json")
          data = module.default as Course[]
        }
  
        const found = data.find((c: Course) => c.id === courseId)
        setCourse(found || null)
        setLoading(false)
      } catch (error) {
        console.error("Failed to load course data:", error)
        setLoading(false)
      }
    }
  
    loadCoursesData()
  }, [courseId, i18n.language])
  
  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
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
    )
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">{t("course_not_found")}</h1>
          <p className="text-muted-foreground mb-4">{t("course_not_exist")}</p>
          <Link href="/courses">
            <Button className="bg-brand-primary hover:bg-brand-primary-hover">
              {t("back_to_courses")}
            </Button>
          </Link>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background m--course-page">
      <Navigation />

      <div className="container mx-auto px-4 py-4 flex justify-end">
        <ToggleButton
          toggledText={t("custom_view")}
          untoggledText={t("default_view")}
          className="m--view-toggle"
        />
      </div>

      <main className="container mx-auto px-4 py-8 m--course-main">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 m--course-layout">
          <div className="lg:col-span-2 space-y-6 m--course-content">
            {/* Breadcrumbs */}
            <ScrollAnimation variant="fadeUp">
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6 m--breadcrumbs">
                <Link href="/" className="hover:text-brand-primary transition-colors">{t("home")}</Link>
                <span>/</span>
                <Link href="/courses" className="hover:text-brand-primary transition-colors">{t("courses")}</Link>
                <span>/</span>
                <span className="text-foreground">{course.title}</span>
              </div>
            </ScrollAnimation>

            {/* Course Header */}
            <ScrollAnimation variant="fadeUp">
              <div className="space-y-4 m--course-header">
                <h1 className="text-3xl md:text-4xl font-bold text-foreground m--course-title">
                  {course.title}
                </h1>

                {course.short_description && (
                  <p className="text-lg text-muted-foreground leading-relaxed m--course-description">
                    {course.short_description}
                  </p>
                )}

                <div className="flex flex-wrap items-center gap-4 text-sm m--course-meta">
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-medium">4.8</span>
                    <span className="text-muted-foreground">(124 {t("reviews")})</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4 text-brand-primary" />
                    <span>1,234 {t("students")}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4 text-brand-primary" />
                    <span>{course.duration}</span>
                  </div>
                  <Badge variant="secondary" className="bg-brand-primary/10 text-brand-primary border-brand-primary/20">
                    {course.level}
                  </Badge>
                </div>
              </div>
            </ScrollAnimation>

            {/* Overview Section */}
            <ScrollAnimation variant="fadeUp">
              <div className="bg-white rounded-lg border border-gray-200 shadow-sm m--course-overview">
                <div className="border-b border-gray-100 p-6 m--overview-header">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-brand-primary to-orange-600 rounded-lg flex items-center justify-center">
                      <BookOpen className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">{t("course_overview")}</h2>
                      <p className="text-sm text-gray-500">{t("course_overview_desc")}</p>
                    </div>
                  </div>
                </div>

                <div className="p-6 space-y-6 m--overview-content">
                  {/* Description */}
                  <div className="space-y-3 m--description-block">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      📖 {t("about_course")}
                    </h3>
                    <div className="prose prose-gray max-w-none">
                      <p className="text-gray-700 leading-relaxed text-base">{course.description}</p>
                    </div>
                  </div>

                  {/* Tags/Objectives */}
                  <div className="space-y-3 m--objectives-block">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      🎯 {t("what_you_will_learn")}
                    </h3>
                    <div className="space-y-2">
                      {course.tags?.map((tag: string, i: number) => (
                        <div key={i} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg m--objective-item">
                          <div className="w-2 h-2 rounded-full bg-brand-primary mt-2 flex-shrink-0"></div>
                          <span className="text-gray-700">{tag}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="space-y-3 m--stats-block">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">📊 {t("course_details")}</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 m--stats-grid">
                      <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg text-center m--stat-card">
                        <BookOpen className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                        <div className="text-2xl font-bold text-blue-900">{course.lessons_count || 0}</div>
                        <div className="text-sm text-blue-700">{t("Lessons")}</div>
                      </div>
                      <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg text-center m--stat-card">
                        <Clock className="h-6 w-6 text-green-600 mx-auto mb-2" />
                        <div className="text-2xl font-bold text-green-900">{course.duration}</div>
                        <div className="text-sm text-green-700">{t("duration")}</div>
                      </div>
                      <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg text-center m--stat-card">
                        <Users className="h-6 w-6 text-purple-600 mx-auto mb-2" />
                        <div className="text-2xl font-bold text-purple-900">1.2K</div>
                        <div className="text-sm text-purple-700">{t("students")}</div>
                      </div>
                      <div className="p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg text-center m--stat-card">
                        <Award className="h-6 w-6 text-orange-600 mx-auto mb-2" />
                        <div className="text-2xl font-bold text-orange-900">{course.level}</div>
                        <div className="text-sm text-orange-700">{t("level")}</div>
                      </div>
                    </div>
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
  )
}
export default function CourseDetailsPage() {

  const { t } = useTranslation("common")
    return (
      <Suspense fallback={<div>{t("loading")}</div>}>
        <CourseDetailsContent />
      </Suspense>
    )
  }