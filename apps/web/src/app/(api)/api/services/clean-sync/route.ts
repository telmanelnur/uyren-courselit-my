import { NextRequest, NextResponse } from "next/server";
import CourseModel from "@/models/Course";
import LessonModel from "@/models/Lesson";
import MembershipModel from "@/models/Membership";
import UserModel from "@/models/User";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { checkPermission } from "@workspace/utils";
import { UIConstants } from "@workspace/common-models";

const { permissions } = UIConstants;

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user has admin permissions
    if (
      !checkPermission(session.user.permissions, [
        permissions.manageSite,
        permissions.manageSettings,
      ])
    ) {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 },
      );
    }

    const { searchParams } = new URL(request.url);
    const entityType = searchParams.get("entityType") || "all";
    const detailed = searchParams.get("detailed") === "true";

    const report: any = {
      timestamp: new Date().toISOString(),
      summary: {},
      details: {},
      recommendations: [],
    };

    if (entityType === "all" || entityType === "courses") {
      const courseReport = await analyzeCourseLessonSync();
      report.summary.courses = courseReport.summary;
      if (detailed) {
        report.details.courses = courseReport.details;
      }
      report.recommendations.push(...courseReport.recommendations);
    }

    if (entityType === "all" || entityType === "memberships") {
      const membershipReport = await analyzeMembershipSync();
      report.summary.memberships = membershipReport.summary;
      if (detailed) {
        report.details.memberships = membershipReport.details;
      }
      report.recommendations.push(...membershipReport.recommendations);
    }

    if (entityType === "all" || entityType === "lessons") {
      const lessonReport = await analyzeLessonIntegrity();
      report.summary.lessons = lessonReport.summary;
      if (detailed) {
        report.details.lessons = lessonReport.details;
      }
      report.recommendations.push(...lessonReport.recommendations);
    }

    return NextResponse.json(report);
  } catch (error: any) {
    console.error("Clean sync report error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user has admin permissions
    if (
      !checkPermission(session.user.permissions, [
        permissions.manageSite,
        permissions.manageSettings,
      ])
    ) {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 },
      );
    }

    const body = await request.json();
    const { entityType, actions, dryRun = true } = body;

    if (!entityType || !actions) {
      return NextResponse.json(
        { error: "Missing required fields: entityType, actions" },
        { status: 400 },
      );
    }

    const results: any = {
      timestamp: new Date().toISOString(),
      actions,
      dryRun,
      results: {},
      errors: [],
    };

    try {
      if (entityType === "all" || entityType === "courses") {
        if (actions.fixLessonOrder) {
          results.results.courseLessonOrder =
            await fixCourseLessonOrder(dryRun);
        }
        if (actions.fixCourseReferences) {
          results.results.courseReferences = await fixCourseReferences(dryRun);
        }
      }

      if (entityType === "all" || entityType === "lessons") {
        if (actions.removeOrphanedLessons) {
          results.results.orphanedLessons = await removeOrphanedLessons(dryRun);
        }
      }

      if (entityType === "all" || entityType === "memberships") {
        if (actions.removeInvalidMemberships) {
          results.results.invalidMemberships =
            await removeInvalidMemberships(dryRun);
        }
      }
    } catch (error: any) {
      results.errors.push({
        message: error.message,
        stack: error.stack,
      });
    }

    return NextResponse.json(results);
  } catch (error: any) {
    console.error("Clean sync execution error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 },
    );
  }
}

// Helper functions for analysis
async function analyzeCourseLessonSync() {
  const courses = await CourseModel.find({}).lean();
  const lessons = await LessonModel.find({}).lean();

  const lessonIds = new Set(lessons.map((l) => l.lessonId));
  const courseIds = new Set(courses.map((c) => c.courseId));

  let totalIssues = 0;
  let orphanedLessons = 0;
  let invalidLessonOrders = 0;
  let missingLessons = 0;

  const details: any[] = [];
  const recommendations: string[] = [];

  // Check each course's lesson references
  for (const course of courses) {
    const courseIssues: any = {
      courseId: course.courseId,
      title: course.title,
      issues: [],
    };

    // Check if course has lessons array
    if (!course.lessons || course.lessons.length === 0) {
      courseIssues.issues.push("No lessons array found");
      totalIssues++;
    }

    // Check each group's lesson order
    if (course.groups && course.groups.length > 0) {
      for (const group of course.groups) {
        if (group.lessonsOrder && group.lessonsOrder.length > 0) {
          for (const lessonId of group.lessonsOrder) {
            // Check if lesson exists in Lesson model
            if (!lessonIds.has(lessonId)) {
              courseIssues.issues.push(
                `Group "${group.name}": Lesson ${lessonId} not found in Lesson model`,
              );
              missingLessons++;
              totalIssues++;
            }
            // Check if lesson exists in course.lessons (priority check)
            if (course.lessons && !course.lessons.includes(lessonId)) {
              courseIssues.issues.push(
                `Group "${group.name}": Lesson ${lessonId} not found in course.lessons array`,
              );
              invalidLessonOrders++;
              totalIssues++;
            }
          }
        }
      }
    }

    // Check if lessons array matches actual lessons
    if (course.lessons && course.lessons.length > 0) {
      for (const lessonId of course.lessons) {
        if (!lessonIds.has(lessonId)) {
          courseIssues.issues.push(
            `Lesson ${lessonId} in lessons array not found in Lesson model`,
          );
          missingLessons++;
          totalIssues++;
        }
      }
    }

    if (courseIssues.issues.length > 0) {
      details.push(courseIssues);
    }
  }

  // Check for orphaned lessons (lessons not referenced by any course.lessons array)
  for (const lesson of lessons) {
    let isReferenced = false;

    for (const course of courses) {
      // Only check course.lessons array - this is the source of truth
      if (course.lessons && course.lessons.includes(lesson.lessonId)) {
        isReferenced = true;
        break;
      }
    }

    if (!isReferenced) {
      orphanedLessons++;
      totalIssues++;
      details.push({
        type: "orphaned_lesson",
        lessonId: lesson.lessonId,
        title: lesson.title,
        courseId: lesson.courseId,
      });
    }
  }

  if (missingLessons > 0) {
    recommendations.push(
      `Fix ${missingLessons} missing lesson references in courses`,
    );
  }
  if (orphanedLessons > 0) {
    recommendations.push(
      `Remove ${orphanedLessons} orphaned lessons not in course.lessons`,
    );
  }
  if (invalidLessonOrders > 0) {
    recommendations.push(
      `Fix ${invalidLessonOrders} group lesson orders not matching course.lessons`,
    );
  }

  return {
    summary: {
      totalCourses: courses.length,
      totalLessons: lessons.length,
      totalIssues,
      orphanedLessons,
      missingLessons,
      invalidLessonOrders,
    },
    details,
    recommendations,
  };
}

async function analyzeMembershipSync() {
  const memberships = await MembershipModel.find({}).lean();
  const users = await UserModel.find({}).lean();
  const courses = await CourseModel.find({}).lean();

  const userIds = new Set(users.map((u) => u.userId));
  const courseIds = new Set(courses.map((c) => c.courseId));

  let totalIssues = 0;
  let invalidUserReferences = 0;
  let invalidEntityReferences = 0;
  let orphanedMemberships = 0;

  const details: any[] = [];
  const recommendations: string[] = [];

  for (const membership of memberships) {
    const membershipIssues: any = {
      membershipId: membership.membershipId,
      issues: [],
    };

    // Check if user exists
    if (!userIds.has(membership.userId)) {
      membershipIssues.issues.push(`User ${membership.userId} not found`);
      invalidUserReferences++;
      totalIssues++;
    }

    // Check if entity exists (for course memberships)
    if (
      membership.entityType === "course" &&
      !courseIds.has(membership.entityId)
    ) {
      membershipIssues.issues.push(`Course ${membership.entityId} not found`);
      invalidEntityReferences++;
      totalIssues++;
    }

    if (membershipIssues.issues.length > 0) {
      details.push(membershipIssues);
    }
  }

  if (invalidUserReferences > 0) {
    recommendations.push(
      `Fix ${invalidUserReferences} invalid user references in memberships`,
    );
  }
  if (invalidEntityReferences > 0) {
    recommendations.push(
      `Fix ${invalidEntityReferences} invalid entity references in memberships`,
    );
  }

  return {
    summary: {
      totalMemberships: memberships.length,
      totalIssues,
      invalidUserReferences,
      invalidEntityReferences,
      orphanedMemberships,
    },
    details,
    recommendations,
  };
}

async function analyzeLessonIntegrity() {
  const lessons = await LessonModel.find({}).lean();
  const courses = await CourseModel.find({}).lean();

  const courseIds = new Set(courses.map((c) => c.courseId));

  let totalIssues = 0;
  let invalidCourseReferences = 0;
  let invalidGroupReferences = 0;

  const details: any[] = [];
  const recommendations: string[] = [];

  for (const lesson of lessons) {
    const lessonIssues: any = {
      lessonId: lesson.lessonId,
      title: lesson.title,
      issues: [],
    };

    // Check if course exists
    if (!courseIds.has(lesson.courseId)) {
      lessonIssues.issues.push(`Course ${lesson.courseId} not found`);
      invalidCourseReferences++;
      totalIssues++;
    }

    // Check if group exists in the course
    if (lesson.groupId) {
      const course = courses.find((c) => c.courseId === lesson.courseId);
      if (course && course.groups) {
        const groupExists = course.groups.some(
          (g) => g.groupId === lesson.groupId,
        );
        if (!groupExists) {
          lessonIssues.issues.push(
            `Group ${lesson.groupId} not found in course ${lesson.courseId}`,
          );
          invalidGroupReferences++;
          totalIssues++;
        }
      }
    }

    if (lessonIssues.issues.length > 0) {
      details.push(lessonIssues);
    }
  }

  if (invalidCourseReferences > 0) {
    recommendations.push(
      `Fix ${invalidCourseReferences} invalid course references in lessons`,
    );
  }
  if (invalidGroupReferences > 0) {
    recommendations.push(
      `Fix ${invalidGroupReferences} invalid group references in lessons`,
    );
  }

  return {
    summary: {
      totalLessons: lessons.length,
      totalIssues,
      invalidCourseReferences,
      invalidGroupReferences,
    },
    details,
    recommendations,
  };
}

// Helper functions for fixing issues
async function fixCourseLessonOrder(dryRun: boolean) {
  const courses = await CourseModel.find({}).lean();
  const results: any[] = [];

  for (const course of courses) {
    if (!course.groups || course.groups.length === 0) continue;
    if (!course.lessons || course.lessons.length === 0) continue;

    // course.lessons is the source of truth - all valid lesson IDs
    const validLessonIds = new Set(course.lessons);
    let courseFixed = false;
    const updatedGroups = [...course.groups];

    for (let i = 0; i < updatedGroups.length; i++) {
      const group = updatedGroups[i]!;
      if (group.lessonsOrder && group.lessonsOrder.length > 0) {
        // Filter out lesson IDs that don't exist in course.lessons
        const validLessons = group.lessonsOrder.filter((lessonId) =>
          validLessonIds.has(lessonId),
        );

        if (validLessons.length !== group.lessonsOrder.length) {
          if (!dryRun) {
            updatedGroups[i] = { ...group, lessonsOrder: validLessons };
          }

          results.push({
            courseId: course.courseId,
            groupName: group.name,
            removedLessons: group.lessonsOrder.filter(
              (lessonId) => !validLessonIds.has(lessonId),
            ),
            action: dryRun
              ? "Would remove lessons not in course.lessons"
              : "Removed lessons not in course.lessons",
          });

          courseFixed = true;
        }
      }
    }

    if (courseFixed && !dryRun) {
      await CourseModel.updateOne(
        { courseId: course.courseId },
        { $set: { groups: updatedGroups } },
      );
    }
  }

  return results;
}

async function fixCourseReferences(dryRun: boolean) {
  const courses = await CourseModel.find({}).lean();
  const lessons = await LessonModel.find({}).lean();

  const lessonIds = new Set(lessons.map((l) => l.lessonId));
  const results: any[] = [];

  for (const course of courses) {
    if (!course.lessons || course.lessons.length === 0) continue;

    // Filter out invalid lesson IDs
    const validLessons = course.lessons.filter((lessonId) =>
      lessonIds.has(lessonId),
    );

    if (validLessons.length !== course.lessons.length) {
      if (!dryRun) {
        await CourseModel.updateOne(
          { courseId: course.courseId },
          { $set: { lessons: validLessons } },
        );
      }

      results.push({
        courseId: course.courseId,
        title: course.title,
        removedLessons: course.lessons.filter(
          (lessonId) => !lessonIds.has(lessonId),
        ),
        action: dryRun
          ? "Would remove invalid lessons"
          : "Removed invalid lessons",
      });
    }
  }

  return results;
}

async function removeOrphanedLessons(dryRun: boolean) {
  const courses = await CourseModel.find({}).lean();
  const lessons = await LessonModel.find({}).lean();

  const referencedLessonIds = new Set<string>();

  // Collect all referenced lesson IDs from course.lessons (source of truth)
  for (const course of courses) {
    if (course.lessons) {
      course.lessons.forEach((id) => referencedLessonIds.add(id));
    }
  }

  // Find orphaned lessons
  const orphanedLessons = lessons.filter(
    (lesson) => !referencedLessonIds.has(lesson.lessonId),
  );

  if (orphanedLessons.length > 0 && !dryRun) {
    const lessonIds = orphanedLessons.map((l) => l._id);
    await LessonModel.deleteMany({ _id: { $in: lessonIds } });
  }

  return {
    totalOrphaned: orphanedLessons.length,
    removed: dryRun ? 0 : orphanedLessons.length,
    lessons: orphanedLessons.map((l) => ({
      lessonId: l.lessonId,
      title: l.title,
      courseId: l.courseId,
    })),
    action: dryRun
      ? "Would remove orphaned lessons"
      : "Removed orphaned lessons",
  };
}

async function removeInvalidMemberships(dryRun: boolean) {
  const memberships = await MembershipModel.find({}).lean();
  const users = await UserModel.find({}).lean();
  const courses = await CourseModel.find({}).lean();

  const userIds = new Set(users.map((u) => u.userId));
  const courseIds = new Set(courses.map((c) => c.courseId));

  const invalidMemberships = memberships.filter((membership) => {
    // Check if user exists
    if (!userIds.has(membership.userId)) return true;

    // Check if entity exists for course memberships
    if (
      membership.entityType === "course" &&
      !courseIds.has(membership.entityId)
    )
      return true;

    return false;
  });

  if (invalidMemberships.length > 0 && !dryRun) {
    const membershipIds = invalidMemberships.map((m) => m._id);
    await MembershipModel.deleteMany({ _id: { $in: membershipIds } });
  }

  return {
    totalInvalid: invalidMemberships.length,
    removed: dryRun ? 0 : invalidMemberships.length,
    memberships: invalidMemberships.map((m) => ({
      membershipId: m.membershipId,
      userId: m.userId,
      entityId: m.entityId,
      entityType: m.entityType,
    })),
    action: dryRun
      ? "Would remove invalid memberships"
      : "Removed invalid memberships",
  };
}
