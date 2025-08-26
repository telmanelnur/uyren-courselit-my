import { TOAST_TITLE_ERROR } from "@/lib/ui/config/strings";
import { trpc } from "@/utils/trpc";
import { InternalCourse } from "@workspace/common-logic";
import { Lesson } from "@workspace/common-models";
import { useToast } from "@workspace/components-library";
import { useCallback, useEffect, useState } from "react";

export type CourseWithAdminProps = Partial<
  InternalCourse & {
    lessons: Array<
      Pick<Lesson, "lessonId" | "type" | "title" | "groupId"> & { id: string }
    >;
  }
>;

export default function useCourse(
  courseId: string,
): CourseWithAdminProps | undefined | null {
  const [course, setCourse] = useState<CourseWithAdminProps | null>();
  const { toast } = useToast();

  const loadCourseQuery =
    trpc.lmsModule.courseModule.course.getByCourseDetailed.useQuery({
      courseId,
    });

  useEffect(() => {
    if (loadCourseQuery.data) {
      setCourse(loadCourseQuery.data as any);
    }
  }, [loadCourseQuery.data]);

  useEffect(() => {
    if (loadCourseQuery.error) {
      setCourse(null);
      toast({
        title: TOAST_TITLE_ERROR,
        description: loadCourseQuery.error.message,
        variant: "destructive",
      });
    }
  }, [loadCourseQuery.error]);

  //     const query = `
  //     query {
  //         course: getCourse(id: "${courseId}") {
  //             title,
  //             description,
  //             type,
  //             slug,
  //             lessons {
  //                 id,
  //                 title,
  //                 groupId,
  //                 lessonId,
  //                 type
  //             },
  //             groups {
  //                 id,
  //                 name,
  //                 rank,
  //                 lessonsOrder,
  //                 drip {
  //                     type,
  //                     status,
  //                     delayInMillis,
  //                     dateInUTC,
  //                     email {
  //                         content,
  //                         subject
  //                     }
  //                 }
  //             },
  //             courseId,
  //             cost,
  //             costType,
  //             featuredImage {
  //                 mediaId,
  //                 originalFileName,
  //                 mimeType,
  //                 size,
  //                 access,
  //                 file,
  //                 thumbnail,
  //                 caption
  //             },
  //             published,
  //             privacy,
  //             pageId
  //         }
  //     }
  // `;

  return course;
}
