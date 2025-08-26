"use client";

import { useProfile } from "@/components/contexts/profile-context";
import { useSiteInfo } from "@/components/contexts/site-info-context";
import { getPlanPrice } from "@/lib/ui/lib/utils";
import { GeneralRouterOutputs } from "@/server/api/types";
import { Constants } from "@workspace/common-models";
import { Clock, Globe } from "@workspace/icons";
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
import { trpc } from "@/utils/trpc";
import {
  Award,
  BookOpen,
  CheckCircle,
  ChevronDown,
  ChevronRight,
  Download,
  FileText,
  HelpCircle,
  Lock,
  Play,
  Users,
  Video,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useState } from "react";

type CourseDetailType =
  GeneralRouterOutputs["lmsModule"]["courseModule"]["course"]["publicGetByCourseId"];

interface CourseLessonsSidebarProps {
  course: CourseDetailType;
  currentLessonId?: string;
  showPricing?: boolean;
  showCourseInfo?: boolean;
}

export default function CourseLessonsSidebar({
  course,
  currentLessonId,
  showPricing = true,
  showCourseInfo = true,
}: CourseLessonsSidebarProps) {
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

  return (
    <div className="space-y-6">
      {/* Pricing Card */}
      {showPricing && (
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="text-center">
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
                <>
                  {isAuthenticated && isMembershipLoading ? (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Skeleton className="h-4 w-4" />
                        <Skeleton className="h-4 w-20" />
                      </div>
                      <div className="flex items-center gap-2">
                        <Skeleton className="h-4 w-4" />
                        <Skeleton className="h-4 w-24" />
                      </div>
                      <div className="flex items-center gap-2">
                        <Skeleton className="h-4 w-4" />
                        <Skeleton className="h-4 w-32" />
                      </div>
                      <div className="flex items-center gap-2">
                        <Skeleton className="h-4 w-4" />
                        <Skeleton className="h-4 w-20" />
                      </div>
                      <div className="flex items-center gap-2">
                        <Skeleton className="h-4 w-4" />
                        <Skeleton className="h-4 w-24" />
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        <span>{course.duration} total</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4" />
                        <span>{allLessons.length} lessons</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Download className="h-4 w-4" />
                        <span>Downloadable resources</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Award className="h-4 w-4" />
                        <span>Certificate of completion</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4" />
                        <span>Lifetime access</span>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Course Content */}
      <Card>
        <CardHeader>
          <CardTitle>Course Content</CardTitle>
          <CardDescription>
            {course.groups.length} sections • {allLessons.length} lessons •{" "}
            {course.duration} weeks
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {isAuthenticated && isMembershipLoading ? (
            <div className="p-6 space-y-4">
              <div className="space-y-3">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-4 w-24" />
              </div>
              <div className="space-y-3">
                <Skeleton className="h-6 w-28" />
                <Skeleton className="h-4 w-20" />
              </div>
              <div className="space-y-3">
                <Skeleton className="h-6 w-36" />
                <Skeleton className="h-4 w-16" />
              </div>
            </div>
          ) : (
            <div className="space-y-1">
              {course.groups.map((group) => (
                <div key={group.groupId}>
                  <button
                    onClick={() => toggleGroup(group.groupId)}
                    className="w-full p-4 text-left hover:bg-muted/50 transition-colors flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      {expandedGroups.includes(group.groupId) ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                      <span className="font-medium">{group.name}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {group.lessonsOrder.length} lessons
                    </span>
                  </button>

                  {expandedGroups.includes(group.groupId) && (
                    <div className="ml-4 border-l border-muted">
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
                              className={`block p-3 pl-6 text-left hover:bg-muted/50 transition-colors ${
                                isCurrentLesson ? "bg-muted" : ""
                              } ${!(hasAccess || !lesson?.requiresEnrollment) ? "opacity-60 pointer-events-none" : ""}`}
                            >
                              <div className="flex items-center gap-3">
                                <div className="flex-shrink-0">
                                  {hasAccess || !lesson?.requiresEnrollment ? (
                                    getTypeIcon(lesson?.type || "text")
                                  ) : (
                                    <Lock className="h-4 w-4 text-muted-foreground" />
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium truncate">
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
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
