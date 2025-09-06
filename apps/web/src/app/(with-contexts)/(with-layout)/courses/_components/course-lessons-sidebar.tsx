"use client";

import { useProfile } from "@/components/contexts/profile-context";
import { useSiteInfo } from "@/components/contexts/site-info-context";
import { getPlanPrice } from "@/lib/ui/lib/utils";
import { GeneralRouterOutputs } from "@/server/api/types";
import { trpc } from "@/utils/trpc";
import { Constants } from "@workspace/common-models";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { Separator } from "@workspace/ui/components/separator";
import { Skeleton } from "@workspace/ui/components/skeleton";
import { formatCurrency } from "@workspace/utils";
import {
  BookOpen,
  ChevronDown,
  ChevronRight,
  Clock,
  Download,
  FileText,
  HelpCircle,
  Lock,
  Play,
  Video,
  CheckCircle,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";

type CourseType =
  GeneralRouterOutputs["lmsModule"]["courseModule"]["course"]["publicGetByCourseId"];

interface CourseLessonsSidebarProps {
  course: CourseType;
  currentLessonId?: string;
  showPricing?: boolean;
  showCourseInfo?: boolean;
  loading?: boolean;
}

export default function CourseLessonsSidebar({
  course,
  currentLessonId,
  showPricing = true,
  showCourseInfo = true,
  loading = false,
}: CourseLessonsSidebarProps) {
  const { t } = useTranslation("common");
  const { siteInfo } = useSiteInfo();
  const { profile } = useProfile();

  // Get membership status via tRPC only if user is authenticated
  const { data: membershipStatus, isLoading: isMembershipLoading } =
    trpc.userModule.user.getMembershipStatus.useQuery(
      {
        entityId: course.courseId,
        entityType: Constants.MembershipEntityType.COURSE,
      },
      {
        enabled: !!course.courseId && !!profile?.userId,
      },
    );

  const handlePurchase = useCallback(() => {
    window.location.href = `/checkout?type=course&id=${course.courseId}`;
  }, [course.courseId]);

  const allLessons =
    course.groups?.flatMap((group) => group.lessonsOrder || []) || [];
  const [expandedGroups, setExpandedGroups] = useState<string[]>([]);

  const toggleGroup = (groupId: string) => {
    setExpandedGroups((prev) =>
      prev.includes(groupId)
        ? prev.filter((id) => id !== groupId)
        : [...prev, groupId],
    );
  };

  const defaultPlan =
    course.attachedPaymentPlans?.find(
      (plan) => plan.planId === course.defaultPaymentPlan,
    ) || course.attachedPaymentPlans?.[0];
  const isFree = defaultPlan?.type === Constants.PaymentPlanType.FREE;
  const planPrice = defaultPlan
    ? getPlanPrice(defaultPlan)
    : { amount: 0, period: "" };

  // Determine if user has access to the course
  const isAuthenticated = !!profile?.userId;
  const hasAccess =
    isAuthenticated && membershipStatus === Constants.MembershipStatus.ACTIVE;
  const isPending =
    isAuthenticated && membershipStatus === Constants.MembershipStatus.PENDING;

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "video":
        return <Video className="h-4 w-4" />;
      case "text":
        return <FileText className="h-4 w-4" />;
      case "quiz":
        return <HelpCircle className="h-4 w-4" />;
      case "audio":
        return <Play className="h-4 w-4" />;
      case "pdf":
        return <FileText className="h-4 w-4" />;
      case "file":
        return <Download className="h-4 w-4" />;
      case "embed":
        return <Play className="h-4 w-4" />;
      default:
        return <Play className="h-4 w-4" />;
    }
  };

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
    );
  }

  return (
    <div className="space-y-6">
      {/* Pricing Card */}
      {showPricing && (
        <Card className="border-2 border-brand-primary/20">
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="text-center">
                  {!hasAccess && (
                    <div className="flex flex-col items-center justify-center gap-2 mb-2 text-muted-foreground">
                      <Lock className="h-10 w-10 text-[rgb(var(--brand-primary))]" aria-label="Доступ ограничен" />
                        <span className="text-sm">
                            Самозачисление пока недоступно —{" "}
                          {isAuthenticated ? "оформите доступ, чтобы начать" : "войдите или оформите доступ"}
                        </span>
                    </div>
                  )}
                {isAuthenticated && isMembershipLoading ? (
                  <div className="space-y-3">
                    <Skeleton className="h-8 w-32 mx-auto" />
                    <Skeleton className="h-6 w-24 mx-auto" />
                  </div>
                ) : defaultPlan ? (
                  <>
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <span className="text-2xl font-bold text-[rgb(var(--brand-primary))]">
                        {formatCurrency(
                          planPrice.amount,
                          siteInfo.currencyISOCode,
                        )}
                        {planPrice.period && (
                          <span className="text-lg">{planPrice.period}</span>
                        )}
                      </span>
                      {defaultPlan.type === Constants.PaymentPlanType.EMI &&
                        defaultPlan.emiTotalInstallments && (
                          <span className="text-lg text-muted-foreground">
                            for {defaultPlan.emiTotalInstallments} months
                          </span>
                        )}
                    </div>
                    {defaultPlan.type === Constants.PaymentPlanType.ONE_TIME &&
                      course.cost > 0 && (
                        <div className="space-y-2">
                          {defaultPlan.oneTimeAmount &&
                            course.cost > defaultPlan.oneTimeAmount && (
                              <div className="text-center">
                                <span className="text-sm text-muted-foreground line-through">
                                  {formatCurrency(
                                    course.cost,
                                    siteInfo.currencyISOCode,
                                  )}
                                </span>
                              </div>
                            )}
                          <Badge
                            variant="destructive"
                            className="bg-[rgb(var(--brand-primary))] hover:bg-[rgb(var(--brand-primary-hover))]"
                          >
                            {defaultPlan.oneTimeAmount &&
                            course.cost > defaultPlan.oneTimeAmount
                              ? `${Math.round(((course.cost - defaultPlan.oneTimeAmount) / course.cost) * 100)}% OFF`
                              : "Special Offer"}
                          </Badge>
                        </div>
                      )}
                    {defaultPlan.type ===
                      Constants.PaymentPlanType.SUBSCRIPTION && (
                      <Badge variant="secondary" className="text-xs">
                        {defaultPlan.subscriptionYearlyAmount
                          ? "Yearly Plan"
                          : "Monthly Plan"}
                      </Badge>
                    )}
                  </>
                ) : course.costType === Constants.ProductPriceType.FREE ? (
                  <div className="text-center">
                    <span className="text-2xl font-bold text-[rgb(var(--brand-primary))]">
                      Free
                    </span>
                  </div>
                ) : (
                  <div className="text-center">
                    <span className="text-2xl font-bold text-[rgb(var(--brand-primary))]">
                      {formatCurrency(course.cost, siteInfo.currencyISOCode)}
                    </span>
                  </div>
                )}
              </div>
              <div className="flex justify-center">
                {isAuthenticated && isMembershipLoading ? (
                  <div className="space-y-3 w-full">
                    <Skeleton className="h-10 w-32 mx-auto" />
                    <Skeleton className="h-4 w-48 mx-auto" />
                  </div>
                ) : isPending ? (
                  <div className="space-y-2">
                    <div className="text-center">
                      <span className="text-sm text-muted-foreground">
                        Your enrollment is pending
                      </span>
                    </div>
                    <div className="flex items-center justify-center gap-2">
                      <Clock className="h-5 w-5 text-amber-500" />
                      <span className="text-sm font-medium text-amber-600">
                        Waiting for approval
                      </span>
                    </div>
                  </div>
                ) : hasAccess ? (
                  <div className="space-y-2">
                    <div className="text-center">
                      <span className="text-sm text-muted-foreground">
                        You have access to this course
                      </span>
                    </div>
                    <div className="flex items-center justify-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span className="text-sm font-medium text-green-600">
                        Course Purchased
                      </span>
                    </div>
                  </div>
                ) : (
                  <Button
                    size="sm"
                    className="bg-[rgb(var(--brand-primary))] hover:bg-[rgb(var(--brand-primary-hover))] text-white"
                    onClick={handlePurchase}
                  >
                    {defaultPlan?.type === Constants.PaymentPlanType.FREE
                      ? "Get Free Course"
                      : "Purchase Course"}
                  </Button>
                )}
              </div>

              {/* Course Info */}
              {showCourseInfo && (
                <div className="space-y-3 pt-4 border-t">
                  <div className="flex items-center gap-3 text-sm">
                    <Clock className="h-4 w-4 text-brand-primary" />
                    <span>
                      {course.duration} {t("weeks")}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <BookOpen className="h-4 w-4 text-brand-primary" />
                    <span>
                      {course.attachedLessons.length || 0}{" "}
                      {t("course_sidebar_lessons")}
                    </span>
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
          <CardTitle className="text-xl">
            {t("course_sidebar_course_content")}
          </CardTitle>
          <CardDescription>
            {course.groups?.length || 0} {t("course_sidebar_sections")} •{" "}
            {course.attachedLessons.length || 0} {t("course_sidebar_lessons")}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {isAuthenticated && isMembershipLoading ? (
            <div className="p-6 space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="space-y-3">
                  <Skeleton className="h-6 w-32" />
                  <Skeleton className="h-4 w-24" />
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-1">
              {course.groups?.map((group) => (
                <div key={group.groupId}>
                  <button
                    onClick={() => toggleGroup(group.groupId)}
                    className="w-full p-4 text-left hover:bg-muted/50 transition-colors flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-3">
                      {expandedGroups.includes(group.groupId) ? (
                        <ChevronDown className="h-4 w-4 text-brand-primary" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-brand-primary" />
                      )}
                      <span className="font-medium group-hover:text-brand-primary transition-colors">
                        {group.name}
                      </span>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {group.lessonsOrder.length || 0}{" "}
                      {t("course_sidebar_lessons")}
                    </Badge>
                  </button>

                  {expandedGroups.includes(group.groupId) && (
                    <div className="ml-4 border-l-2 border-brand-primary/20">
                      {group.lessonsOrder.map((lessonId) => {
                        const lesson = course.attachedLessons?.find(
                          (l) => l.lessonId === lessonId,
                        );
                        const isCurrentLesson = lessonId === currentLessonId;

                        // Lesson access logic:
                        // - hasAccess: User has active membership
                        // - !lesson?.requiresEnrollment: Lesson doesn't require enrollment (free preview)
                        // - If neither condition is met, lesson is locked
                        return (
                          <div
                            key={lessonId}
                            className="w-full overflow-hidden"
                          >
                            <Link
                              href={`/courses/${course.courseId}/lessons/${lessonId}`}
                              className={`block p-3 pl-6 text-left hover:bg-muted/50 transition-colors border-l-2 hover:border-brand-primary ${
                                isCurrentLesson
                                  ? "bg-brand-primary/5 border-brand-primary"
                                  : "border-transparent"
                              } ${!(hasAccess || !lesson?.requiresEnrollment) ? "opacity-60 pointer-events-none" : ""}`}
                            >
                              <div className="flex items-center gap-3">
                                <div className="flex-shrink-0 w-6 h-6 rounded-sm border-2 border-brand-primary/30 flex items-center justify-center bg-white">
                                  {hasAccess || !lesson?.requiresEnrollment ? (
                                    <div className="text-brand-primary">
                                      {getTypeIcon(lesson?.type || "text")}
                                    </div>
                                  ) : (
                                    <Lock className="h-3 w-3 text-muted-foreground" />
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between">
                                    <span
                                      className={`text-sm font-medium truncate ${
                                        isCurrentLesson
                                          ? "text-brand-primary"
                                          : ""
                                      }`}
                                    >
                                      {lesson?.title || `Lesson ${lessonId}`}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </Link>
                          </div>
                        );
                      })}
                    </div>
                  )}
                  <Separator />
                </div>
              )) || (
                <div className="p-6 text-center text-muted-foreground">
                  <BookOpen className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>{t("course_sidebar_content_coming_soon")}</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
