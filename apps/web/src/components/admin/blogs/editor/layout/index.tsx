import { truncate } from "@/lib/ui/lib/utils";
import dynamic from "next/dynamic";
import { ReactNode } from "react";
import useCourse from "../course-hook";

const BlogHeader = dynamic(() => import("./header"));

interface BlogEditorLayoutProps {
    id: string;
    children: ReactNode;
}

export default function BlogEditorLayout({
    id,
    children,
}: BlogEditorLayoutProps) {
    const course = useCourse(id);
    const breadcrumbs = [
        { text: "Blogs", url: "/dashboard/blogs" },
        {
            text: course && course.title ? truncate(course.title, 10) : "",
            url: "",
        },
    ];

    return (
        <div className="flex flex-col gap-4">
            <BlogHeader
                id={id as string}
                breadcrumbs={breadcrumbs}
            />
            {course && children}
        </div>
    );
}
