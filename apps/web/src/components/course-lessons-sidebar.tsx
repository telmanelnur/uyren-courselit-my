"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Award,
  BookOpen,
  ChevronDown,
  ChevronRight,
  Clock,
  Download,
  FileText,
  Globe,
  HelpCircle,
  Lock,
  Play,
  Video,
} from "lucide-react"
import Link from "next/link"
import { useState } from "react"

interface CourseLessonsSidebarProps {
  course: any
  currentLessonId?: string
  showPricing?: boolean
  showCourseInfo?: boolean
  loading?: boolean
}

export default function CourseLessonsSidebar({
  course,
  currentLessonId,
  showPricing = true,
  showCourseInfo = true,
  loading = false,
}: CourseLessonsSidebarProps) {
  const [expandedGroups, setExpandedGroups] = useState<string[]>([])

  const toggleGroup = (groupId: string) => {
    setExpandedGroups((prev) => (prev.includes(groupId) ? prev.filter((id) => id !== groupId) : [...prev, groupId]))
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "video":
        return <Video className="h-4 w-4" />
      case "text":
        return <FileText className="h-4 w-4" />
      case "quiz":
        return <HelpCircle className="h-4 w-4" />
      case "audio":
        return <Play className="h-4 w-4" />
      case "pdf":
        return <FileText className="h-4 w-4" />
      case "file":
        return <Download className="h-4 w-4" />
      case "embed":
        return <Play className="h-4 w-4" />
      default:
        return <Play className="h-4 w-4" />
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Pricing Card Skeleton */}
        {showPricing && (
          <Card className="border-2 border-brand-primary/20">
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="text-center">
                  <Skeleton className="h-8 w-32 mx-auto mb-2" />
                  <Skeleton className="h-6 w-24 mx-auto" />
                </div>
                <Skeleton className="h-12 w-full" />
                {showCourseInfo && (
                  <div className="space-y-3 pt-4 border-t">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <Skeleton className="h-4 w-4 rounded" />
                        <Skeleton className="h-4 w-24" />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Course Content Skeleton */}
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-48" />
          </CardHeader>
          <CardContent className="p-0">
            <div className="space-y-1">
              {[...Array(3)].map((_, i) => (
                <div key={i}>
                  <div className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-4 w-4" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                    <Skeleton className="h-5 w-16" />
                  </div>
                  <Separator />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Pricing Card */}
      {showPricing && (
        <Card className="border-2 border-brand-primary/20">
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-brand-primary mb-2">Free Course</div>
                <Badge className="bg-brand-primary text-white hover:bg-brand-primary-hover">Open Access</Badge>
              </div>

              <Button
                size="lg"
                className="w-full bg-brand-primary hover:bg-brand-primary-hover text-white font-semibold"
              >
                Start Learning
              </Button>

              {/* Course Info */}
              {showCourseInfo && (
                <div className="space-y-3 pt-4 border-t">
                  <div className="flex items-center gap-3 text-sm">
                    <Clock className="h-4 w-4 text-brand-primary" />
                    <span>{course.duration} total</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <BookOpen className="h-4 w-4 text-brand-primary" />
                    <span>{course.lessons_count || 0} lessons</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Download className="h-4 w-4 text-brand-primary" />
                    <span>Downloadable resources</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Award className="h-4 w-4 text-brand-primary" />
                    <span>Certificate of completion</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Globe className="h-4 w-4 text-brand-primary" />
                    <span>Lifetime access</span>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Course Content */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Course Content</CardTitle>
          <CardDescription>
            {course.groups?.length || 0} sections • {course.lessons_count || 0} lessons
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="space-y-1">
            {course.groups?.map((group: any) => (
              <div key={group.id}>
                <button
                  onClick={() => toggleGroup(group.id)}
                  className="w-full p-4 text-left hover:bg-muted/50 transition-colors flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3">
                    {expandedGroups.includes(group.id) ? (
                      <ChevronDown className="h-4 w-4 text-brand-primary" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-brand-primary" />
                    )}
                    <span className="font-medium group-hover:text-brand-primary transition-colors">{group.title}</span>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {group.lessons?.length || 0} lessons
                  </Badge>
                </button>

                {expandedGroups.includes(group.id) && (
                  <div className="ml-4 border-l-2 border-brand-primary/20">
                    {group.lessons?.map((lesson: any) => {
                      const isCurrentLesson = lesson.id === currentLessonId
                      const isPreview = lesson.is_preview

                      return (
                        <div key={lesson.id} className="w-full overflow-hidden">
                          <Link
                            href={`/courses/${course.id}/lessons/${lesson.id}`}
                            className={`block p-3 pl-6 text-left hover:bg-muted/50 transition-colors border-l-2 hover:border-brand-primary ${
                              isCurrentLesson ? "bg-brand-primary/5 border-brand-primary" : "border-transparent"
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div className="flex-shrink-0 w-6 h-6 rounded-sm border-2 border-brand-primary/30 flex items-center justify-center bg-white">
                                {isPreview ? (
                                  <div className="text-brand-primary">{getTypeIcon(lesson.type || "text")}</div>
                                ) : (
                                  <Lock className="h-3 w-3 text-muted-foreground" />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                  <span
                                    className={`text-sm font-medium truncate ${
                                      isCurrentLesson ? "text-brand-primary" : ""
                                    }`}
                                  >
                                    {lesson.title}
                                  </span>
                                  {isPreview && (
                                    <Badge
                                      variant="outline"
                                      className="text-xs ml-2 border-brand-primary text-brand-primary"
                                    >
                                      Preview
                                    </Badge>
                                  )}
                                </div>
                                <div className="text-xs text-muted-foreground mt-1">{lesson.duration} min</div>
                              </div>
                            </div>
                          </Link>
                        </div>
                      )
                    }) || <div className="p-3 pl-6 text-sm text-muted-foreground">No lessons available</div>}
                  </div>
                )}
                <Separator />
              </div>
            )) || (
              <div className="p-6 text-center text-muted-foreground">
                <BookOpen className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>Course content will be available soon</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
