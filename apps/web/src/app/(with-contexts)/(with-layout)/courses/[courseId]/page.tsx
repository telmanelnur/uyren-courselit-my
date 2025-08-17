import { trpcCaller } from "@/server/api/caller";
import type { Metadata, ResolvingMetadata } from "next";
import { notFound } from "next/navigation";
import CoursePage from "./_components/course-page";

type Props = {
    params: Promise<{
        courseId: string;
    }>;
};

export async function generateMetadata(
    { params }: Props,
    parent: ResolvingMetadata,
): Promise<Metadata> {
    try {
        const course = await trpcCaller.lmsModule.courseModule.course.publicGetByCourseId({
            courseId: (await params).courseId,
        });
        return {
            title: `${course.title} | Course`,
            // description: serializedCourse.description || "Course details and lessons",
            robots: {
                index: true,
            },
        };
    } catch (error) {
        return {
            title: "Course Not Found",
            description: "The requested course could not be found",
        };
    }
}

export default async function CoursePageRoute({ params }: Props) {
    const courseId = (await params).courseId;
    try {
        const course = await trpcCaller.lmsModule.courseModule.course.publicGetByCourseId({
            courseId,
        });
        return (
            <CoursePage
                course={course}
            />
        );
    } catch (error) {
        notFound();
    }
}
