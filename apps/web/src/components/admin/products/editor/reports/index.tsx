import useCourse from "../course-hook";
import Students from "./students";

interface CourseReportsProps {
    courseId: string;
}

export default function CourseReports({
    courseId,
}: CourseReportsProps) {
    let course = useCourse(courseId);

    if (!course) {
        return null;
    }

    return (
        <div>
            <Students
                course={course}
            />
        </div>
    );
}
