"use client"

import { Suspense, useEffect, useState, useMemo } from "react"
import { useTranslation } from "next-i18next"
import Navigation from "@/components/navigation"
import Footer from "@/components/layout/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BookOpen, Search, AlertCircle, ChevronLeft, ChevronRight } from "lucide-react"
import Link from "next/link"
import { ScrollAnimation, ScrollGroup } from "@/components/scroll-animation"
import Image from "next/image"
import { useDebounce } from "@/hooks/use-debounce"

type Level = "Beginner" | "Intermediate" | "Advanced"
type LevelFilter = "all" | Level

interface Course {
  id: string
  title: string
  description: string
  lessons_count: number
  tags: string[]
  image: string
  level: Level
  created_at: string
}

const COURSES_PER_PAGE = 9

function getRussianCourseText(count: number): string {
  const mod10 = count % 10
  const mod100 = count % 100
  if (mod10 === 1 && mod100 !== 11) return `${count} курс доступен`
  if (mod10 >= 2 && mod10 <= 4 && !(mod100 >= 12 && mod100 <= 14)) return `${count} курса доступны`
  return `${count} курсов доступны`
}

function CoursesContent() {
  const { t, i18n } = useTranslation("common")
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [levelFilter, setLevelFilter] = useState<LevelFilter>("all")
  const [currentPage, setCurrentPage] = useState(1)
  const debouncedSearchTerm = useDebounce(searchTerm, 300)

  // Load language-specific JSON dynamically
  useEffect(() => {
    const loadCoursesData = async () => {
      try {
        setLoading(true)
        setError(null)
  
        let rawData: any[] = []
        if (i18n.language === "ru") {
          rawData = (await import("../../data/courses.ru.json")).default
        } else if (i18n.language === "kz") {
          rawData = (await import("../../data/courses.kz.json")).default
        } else {
          rawData = (await import("../../data/courses.en.json")).default
        }
  
        // Map rawData to ensure type matches Level
        const data: Course[] = rawData.map((c) => ({
          ...c,
          level: ["Beginner", "Intermediate", "Advanced"].includes(c.level) ? c.level : "Beginner"
        }))
  
        setCourses(data)
        setLoading(false)
      } catch (err) {
        console.error("Error loading courses:", err)
        setError(t("error_loading_courses"))
        setLoading(false)
      }
    }
  
    loadCoursesData()
  }, [i18n.language, t])
  

  // Filtering
  const filteredCourses = useMemo(() => {
    if (!courses) return []
    let filtered = courses
    if (debouncedSearchTerm) {
      const q = debouncedSearchTerm.toLowerCase()
      filtered = filtered.filter(
        (course) =>
          course.title.toLowerCase().includes(q) ||
          course.description.toLowerCase().includes(q)
      )
    }
    if (levelFilter !== "all") {
      filtered = filtered.filter((course) => course.level === levelFilter)
    }
    return filtered
  }, [courses, debouncedSearchTerm, levelFilter])

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredCourses.length / COURSES_PER_PAGE))
  const paginatedCourses = filteredCourses.slice(
    (currentPage - 1) * COURSES_PER_PAGE,
    currentPage * COURSES_PER_PAGE
  )

  useEffect(() => setCurrentPage(1), [debouncedSearchTerm, levelFilter])
  useEffect(() => setCurrentPage((p) => Math.min(Math.max(1, p), totalPages)), [totalPages])

  const clearFilters = () => {
    setSearchTerm("")
    setLevelFilter("all")
    setCurrentPage(1)
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white">
        <Navigation />
        <div className="container mx-auto px-4 py-20">
          <Card className="max-w-2xl mx-auto">
            <CardContent className="p-6 text-center">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-red-600 mb-2">{t("error_heading")}</h3>
              <p className="text-gray-600 mb-4">{error}</p>
              <Button onClick={() => window.location.reload()} variant="outline">
                {t("try_again")}
              </Button>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <Navigation />

      {/* Header */}
      <section className="relative py-20 md:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-black"></div>
        <div className="container mx-auto px-4 relative z-10">
          <ScrollAnimation variant="fadeUp" className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
              {t("header_title")} <span className="text-brand-primary">{t("highlighted")}</span>
            </h1>
            <p className="text-lg md:text-xl text-white/90 mb-8">{t("header_desc")}</p>
          </ScrollAnimation>
        </div>
      </section>

      {/* Filters */}
      <section className="py-8 bg-gray-50 border-b">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder={t("search_placeholder")}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-4 items-center">
              <Select value={levelFilter} onValueChange={(v) => setLevelFilter(v as LevelFilter)}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder={t("all_levels")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("all_levels")}</SelectItem>
                  <SelectItem value="Beginner">{t("level_beginner")}</SelectItem>
                  <SelectItem value="Intermediate">{t("level_intermediate")}</SelectItem>
                  <SelectItem value="Advanced">{t("level_advanced")}</SelectItem>
                </SelectContent>
              </Select>
              {(searchTerm || levelFilter !== "all") && (
                <Button variant="outline" onClick={clearFilters} className="whitespace-nowrap bg-transparent">
                  {t("clear_filters")}
                </Button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Courses grid */}
      <section className="py-12 md:py-20">
      <div className="container mx-auto px-4">
        {!loading && (
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto text-center mb-8">
  {i18n.language === "ru"
    ? getRussianCourseText(filteredCourses.length)
    : `${filteredCourses.length} ${filteredCourses.length === 1 ? t("course") : t("courses_available_plural")}`
  }
  {(searchTerm || levelFilter !== "all") && ` ${t("matching_criteria")}`}
</p>

        )}

        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {[...Array(6)].map((_, index) => (
              <Card key={index} className="h-full animate-pulse">
                <CardContent className="p-0">
                  <div className="h-48 bg-gray-200 rounded-t-lg"></div>
                  <div className="p-6 space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-full"></div>
                    <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : paginatedCourses.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">{t("no_courses")}</h3>
            <p className="text-gray-500 mb-4">{t("no_courses_desc")}</p>
            <Button onClick={clearFilters} variant="outline">
              {t("clear_filters")}
            </Button>
          </div>
        ) : (
          <>
            <ScrollGroup
              variant="fadeUp"
              staggerDelay={0.1}
              className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8"
            >
              {paginatedCourses.map((course) => {
                const tags = course.tags ?? []
                const extraCount = Math.max(0, tags.length - 3)
                return (
                  <Link key={course.id} href={`/courses/${course.id}`}>
                    <Card className="h-full hover:shadow-xl transition-all duration-300 group cursor-pointer">
                      <CardContent className="p-0">
                        <div className="relative h-48 w-full overflow-hidden rounded-t-lg">
                          <Image
                            src={course.image || "/placeholder.svg"}
                            alt={course.title}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                            loading="lazy"
                          />
                          <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
                          <Badge className="absolute top-3 right-3 bg-brand-primary text-white">
                            {t(`level_${course.level.toLowerCase()}`)}
                          </Badge>
                        </div>
                        <div className="p-6">
                          <div className="w-12 h-12 bg-brand-primary/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-brand-primary/20 transition-colors">
                            <BookOpen className="h-6 w-6 text-brand-primary" />
                          </div>
                          <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2">
                            {course.title}
                          </h3>
                          <p className="text-gray-600 mb-4 text-sm line-clamp-2">
                            {course.description}
                          </p>
                          <div className="flex items-center text-sm text-gray-500 mb-4">
                            <BookOpen className="h-4 w-4 mr-2" />
                            <span>
                              {course.lessons_count} {t("lessons")} • {t(`level_${course.level.toLowerCase()}`)}
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-2 mb-4">
                            {tags.slice(0, 3).map((tag, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                            {extraCount > 0 && (
                              <Badge variant="secondary" className="text-xs">
                                +{extraCount}
                              </Badge>
                            )}
                          </div>
                          <Button className="w-full bg-brand-primary hover:bg-brand-primary-hover text-white">
                            {t("view_course")}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                )
              })}
            </ScrollGroup>

            {totalPages > 1 && (
              <div className="flex justify-center items-center mt-12 gap-2">
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="flex items-center gap-2"
                >
                  <ChevronLeft className="h-4 w-4" />
                  {t("previous")}
                </Button>
                <div className="flex gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <Button
                      key={page}
                      variant={currentPage === page ? "default" : "outline"}
                      onClick={() => setCurrentPage(page)}
                      className={`w-10 h-10 ${currentPage === page ? "bg-brand-primary hover:bg-brand-primary-hover" : ""}`}
                    >
                      {page}
                    </Button>
                  ))}
                </div>
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="flex items-center gap-2"
                >
                  {t("next")}
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </section>

      <Footer />
    </div>
  )
}

export default function CoursesPage() {

const { t } = useTranslation("common")
  return (
    <Suspense fallback={<div>{t("loading")}</div>}>
      <CoursesContent />
    </Suspense>
  )
}