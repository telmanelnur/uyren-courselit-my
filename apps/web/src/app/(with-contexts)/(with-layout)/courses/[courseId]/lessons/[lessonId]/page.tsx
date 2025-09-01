import { Metadata, ResolvingMetadata } from "next";
import { Suspense } from "react";
import LessonView from "../../_components/lesson-view";

export async function generateMetadata(
  { params }: { params: Promise<{ courseId: string; lessonId: string }> },
  parent: ResolvingMetadata,
): Promise<Metadata> {
  const { courseId, lessonId } = await params;
  return {
    title: `Lesson ${lessonId} | Course ${courseId} | Courses | ${(await parent)?.title?.absolute}`,
  };
}

export default function LessonDetailsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LessonView />
    </Suspense>
  );
}
