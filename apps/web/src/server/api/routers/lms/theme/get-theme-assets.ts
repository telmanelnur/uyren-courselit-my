import { connectToDatabase } from "@workspace/common-logic";
import { ThemeModel } from "@/models/lms";
import { BASIC_PUBLICATION_STATUS_TYPE } from "@workspace/common-models";
import CourseModel from "@/models/Course";

export async function getPublishedThemeAssetsByCourseId(courseId: string) {
  await connectToDatabase();
  const course = await CourseModel.findOne({ courseId }).lean();
  if (!course?.themeId) return [];

  const theme = await ThemeModel.findOne({
    _id: course.themeId,
    domain: course.domain, 
    status: BASIC_PUBLICATION_STATUS_TYPE.PUBLISHED,
  }).lean();

  return theme?.assets ?? [];
}
