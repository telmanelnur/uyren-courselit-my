import { TOAST_TITLE_ERROR } from "@/lib/ui/config/strings";
import { trpc } from "@/utils/trpc";
import { Course, ProductAccessType } from "@workspace/common-models";
import { useToast } from "@workspace/components-library";
import { useEffect, useState } from "react";

type CourseWithAdminProps = Partial<
    Course & {
        published: boolean;
        privacy: ProductAccessType;
    }
>;

export default function useCourse(
    courseId: string,
): CourseWithAdminProps | undefined | null {
    const [course, setCourse] = useState<
        CourseWithAdminProps | undefined | null
    >();
    const { toast } = useToast();

    const loadCourseQuery = trpc.lmsModule.courseModule.course.getByCourseId.useQuery({
        courseId,
    });

    useEffect(() => {
        if (loadCourseQuery.data) {
            setCourse(loadCourseQuery.data);
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

    return course;
}
