"use client";

import { Button } from "@workspace/ui/components/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { CheckCircle, BookOpen, ArrowRight, Home } from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { trpc } from "@/utils/trpc";
import { Skeleton } from "@workspace/ui/components/skeleton";

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const courseId = searchParams.get("courseId");
  const planId = searchParams.get("planId");

  const [isLoading, setIsLoading] = useState(true);

  // Fetch course data
  const { data: course, isLoading: isCourseLoading } =
    trpc.lmsModule.courseModule.course.publicGetByCourseId.useQuery(
      { courseId: courseId! },
      { enabled: !!courseId },
    );

  const selectedPlan = course?.attachedPaymentPlans?.find(
    (plan) => plan.planId === planId,
  );

  useEffect(() => {
    // Simulate loading time for better UX
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  if (isCourseLoading || isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto text-center">
          <Skeleton className="h-16 w-16 mx-auto mb-4 rounded-full" />
          <Skeleton className="h-8 w-64 mx-auto mb-2" />
          <Skeleton className="h-6 w-96 mx-auto mb-8" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    );
  }

  if (!course || !selectedPlan) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">
            Invalid Success Page
          </h1>
          <p className="text-gray-600 mb-6">
            Course or payment plan not found.
          </p>
          <Button onClick={() => router.push("/")}>
            <Home className="w-4 h-4 mr-2" />
            Go Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto text-center">
        {/* Success Icon */}
        <div className="mb-6">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-[rgb(var(--brand-dark))] mb-2">
            Enrollment Successful!
          </h1>
          <p className="text-[rgb(var(--brand-gray))] text-lg">
            Welcome to {course.title}
          </p>
        </div>

        {/* Course Card */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 justify-center">
              <BookOpen className="w-5 h-5" />
              Course Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-left">
              <h3 className="font-semibold text-lg mb-2">{course.title}</h3>
              <p className="text-gray-600 mb-4">
                {typeof course.description === "string"
                  ? course.description
                  : "Course description available"}
              </p>
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <span>Plan: {selectedPlan.name}</span>
                <span>Type: {selectedPlan.type}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Next Steps */}
        <div className="space-y-4 mb-8">
          <h2 className="text-xl font-semibold text-[rgb(var(--brand-dark))]">
            What's Next?
          </h2>
          <div className="grid md:grid-cols-2 gap-4 text-left">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-medium text-blue-900 mb-2">
                1. Access Your Course
              </h3>
              <p className="text-blue-700 text-sm">
                Start learning immediately with full access to all course
                content.
              </p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="font-medium text-green-900 mb-2">
                2. Complete Lessons
              </h3>
              <p className="text-green-700 text-sm">
                Work through the course at your own pace and track your
                progress.
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            onClick={() => router.push(`/courses/${course.courseId}`)}
            className="bg-[rgb(var(--brand-primary))] hover:bg-[rgb(var(--brand-primary-hover))] text-white"
          >
            <BookOpen className="w-4 h-4 mr-2" />
            Start Learning
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
          <Button variant="outline" onClick={() => router.push("/dashboard")}>
            Go to Dashboard
          </Button>
        </div>

        {/* Additional Info */}
        <div className="mt-8 text-sm text-gray-500">
          <p>
            You'll receive a confirmation email shortly with your enrollment
            details.
          </p>
          <p className="mt-2">Need help? Contact our support team.</p>
        </div>
      </div>
    </div>
  );
}
