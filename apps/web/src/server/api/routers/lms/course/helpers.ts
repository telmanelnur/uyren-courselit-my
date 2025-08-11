import CourseModel from "@/models/Course";
import LessonModel from "@/models/Lesson";
import { MainContextType } from "@/server/api/core/procedures";
import { deleteMedia } from "@/server/services/media";
import mongoose from "mongoose";

export const getGroupedLessons = async (
  courseId: string,
  domainId: mongoose.Types.ObjectId
) => {
  const course = await CourseModel.findOne({
    courseId: courseId,
    domain: domainId,
  });
  if (!course) {
    throw new Error("Course not found");
  }
  const allLessons = await LessonModel.find(
    {
      lessonId: {
        $in: [...course.lessons],
      },
      domain: domainId,
    },
    {
      lessonId: 1,
      groupId: 1,
    }
  );
  const lessonsInSequentialOrder = [];
  for (let group of course.groups.sort((a, b) => a.rank - b.rank)) {
    lessonsInSequentialOrder.push(
      ...allLessons
        .filter((lesson) => lesson.groupId === group.id)
        .sort(
          (a, b) =>
            group.lessonsOrder?.indexOf(a.lessonId) -
            group.lessonsOrder?.indexOf(b.lessonId)
        )
    );
  }
  return lessonsInSequentialOrder;
};

export const getPrevNextCursor = async (
  courseId: string,
  domainId: mongoose.Types.ObjectId,
  lessonId?: string
) => {
  const lessonsInSequentialOrder = await getGroupedLessons(courseId, domainId);
  const indexOfCurrentLesson = lessonId
    ? lessonsInSequentialOrder.findIndex((item) => item.lessonId === lessonId)
    : -1;

  return {
    prevLesson:
      indexOfCurrentLesson - 1 < 0
        ? ""
        : lessonsInSequentialOrder[indexOfCurrentLesson - 1]!.lessonId,
    nextLesson:
      indexOfCurrentLesson + 1 > lessonsInSequentialOrder.length - 1
        ? ""
        : lessonsInSequentialOrder[indexOfCurrentLesson + 1]!.lessonId,
  };
};

// TODO: refactor this as it might not be deleting the media
export const deleteAllLessons = async (courseId: string, ctx: MainContextType) => {
  const allLessonsWithMedia = await LessonModel.find(
    {
      courseId,
      domain: ctx.domainData.domainObj._id,
      mediaId: { $ne: null },
    },
    {
      mediaId: 1,
    }
  );
  for (let l of allLessonsWithMedia) {
    await deleteMedia(l.mediaId);
  }
  await LessonModel.deleteMany({
    courseId,
    domain: ctx.domainData.domainObj._id,
  });
};
