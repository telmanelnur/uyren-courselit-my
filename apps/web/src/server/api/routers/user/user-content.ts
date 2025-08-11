import CommunityModel from "@/models/Community";
import CourseModel from "@/models/Course";
import MembershipModel from "@/models/Membership";
import UserModel from "@/models/User";
import { TRPCError } from "@trpc/server";
import { Constants } from "@workspace/common-models";
import { NotFoundException } from "../../core/exceptions";
import { assertDomainExist } from "../../core/permissions";
import { protectedProcedure } from "../../core/procedures";
import { router } from "../../core/trpc";

const { MembershipStatus, MembershipEntityType } = Constants;

export const userContentRouter = router({
  getProtectedUserContent: protectedProcedure.query(async ({ ctx }) => {
    try {
      const domainObj = await assertDomainExist(ctx);
      const userId = ctx.session.user.id;

      const user = await UserModel.findOne({
        userId: userId,
        domain: domainObj._id,
      });

      if (!user) {
        throw new NotFoundException("User", userId);
      }

      const memberships = await MembershipModel.find({
        domain: domainObj._id,
        userId,
        status: MembershipStatus.ACTIVE,
      });

      const content: Record<string, unknown>[] = [];

      for (const membership of memberships) {
        if (membership.entityType === MembershipEntityType.COURSE) {
          const course = await CourseModel.findOne({
            courseId: membership.entityId,
            domain: domainObj._id,
          });

          if (course) {
            content.push({
              entityType: MembershipEntityType.COURSE,
              entity: {
                id: course.courseId,
                title: course.title,
                slug: course.slug,
                type: course.type,
                totalLessons: course.lessons?.length || 0,
                completedLessonsCount:
                  user.purchases?.find(
                    (progress: any) => progress.courseId === course.courseId
                  )?.completedLessons?.length || 0,
                featuredImage: course.featuredImage,
              },
            });
          }
        }

        if (membership.entityType === MembershipEntityType.COMMUNITY) {
          const community = await CommunityModel.findOne({
            communityId: membership.entityId,
            domain: domainObj._id,
            deleted: false,
          });

          if (community) {
            content.push({
              entityType: MembershipEntityType.COMMUNITY,
              entity: {
                id: community.communityId,
                title: community.name,
                featuredImage: community.featuredImage,
              },
            });
          }
        }
      }

      return content;
    } catch (error) {
      if (error instanceof TRPCError) {
        throw error;
      }

      console.error("Error fetching user content:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch user content",
      });
    }
  }),
});
