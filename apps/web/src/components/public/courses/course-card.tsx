import { Image, Link } from "@workspace/components-library";
import { ThemeStyle } from "@workspace/page-models";
import {
  Badge,
  PageCard,
  PageCardContent,
  PageCardHeader,
  PageCardImage,
  Subheader1,
} from "@workspace/page-primitives";
import { Skeleton } from "@workspace/ui/components/skeleton";
import { Constants, Course } from "@workspace/common-models";
import { BookOpen, Download } from "lucide-react";
import { capitalize } from "@workspace/utils";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@workspace/ui/components/card";
import { Button } from "@workspace/ui/components/button";
import { Clock } from "@workspace/icons";
import { InternalCourse } from "@workspace/common-logic";

export function CourseCard({
  course,
}: {
  course: InternalCourse & {
    lessonsCount: number;
  };
}) {
  return (
    <Card
      key={course.courseId}
      className="overflow-hidden hover:shadow-lg transition-shadow pt-0"
    >
      <div className="aspect-video overflow-hidden">
        <Image
          src={course.featuredImage?.url || "/courselit_backdrop_square.webp"}
          alt={course.title || ""}
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
          width={500}
          height={500}
        />
      </div>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex justify-start items-center gap-2">
            <Badge variant="outline">
              {course.type === Constants.CourseType.COURSE ? (
                <BookOpen className="h-4 w-4 mr-1" />
              ) : (
                <Download className="h-4 w-4 mr-1" />
              )}
              {capitalize(course.type || "undefined")}
            </Badge>
            <Badge
              variant={
                course.level === "beginner"
                  ? "secondary"
                  : course.level === "intermediate"
                    ? "default"
                    : "destructive"
              }
            >
              {course.level}
            </Badge>
          </div>
        </div>
        <CardTitle className="line-clamp-2">{course.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            {course.duration} weeks
          </div>
          {/* <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    {course.customers.length}
                </div> */}
          {/* <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    {course.rating}
                </div> */}
          <div className="flex items-center text-muted-foreground">
            <BookOpen className="h-4 w-4 mr-2" />
            <span>{course.lessonsCount || 0} lessons</span>
          </div>
          {course.tags && course.tags.length > 0 && (
            <div className="flex items-center text-muted-foreground">
              <span className="text-xs bg-amber-50 text-amber-700 px-2 py-1 rounded">
                {course.tags[0]}
              </span>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex gap-2">
        <Link href={`/courses/${course.courseId}`} className="flex-1">
          <Button variant="outline" className="w-full bg-transparent">
            View Course
          </Button>
        </Link>
        {/* Conditional button for purchase/access */}
        {/* {course.isPurchased ? (
                <Link href={`/courses/${course.id}`} className="flex-1">
                    <Button className="w-full bg-[rgb(var(--brand-primary))] hover:bg-[rgb(var(--brand-primary-hover))]">
                        Continue Learning
                    </Button>
                </Link>
            ) : (
                <Link href={`/checkout?productType=course&productId=${course.id}`} className="flex-1">
                    <Button className="w-full bg-[rgb(var(--brand-primary))] hover:bg-[rgb(var(--brand-primary-hover))]">
                        Enroll Now
                    </Button>
                </Link>
            )} */}
      </CardFooter>
    </Card>
  );
}

export function CourseCardSkeleton({ theme }: { theme?: ThemeStyle }) {
  return (
    <PageCard className="overflow-hidden" theme={theme}>
      <Skeleton className="aspect-video w-full" />
      <PageCardContent theme={theme}>
        <Skeleton className="h-6 w-3/4 mb-4" />
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <Skeleton className="w-12 h-12 rounded-full" />
            <Skeleton className="h-5 w-32" />
          </div>
          <Skeleton className="h-6 w-24" />
        </div>
      </PageCardContent>
    </PageCard>
  );
}
