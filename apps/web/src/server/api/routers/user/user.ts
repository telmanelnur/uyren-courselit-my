import { checkForInvalidPermissions } from "@/lib/check-invalid-permissions";
import CourseModel from "@/models/Course";
import UserModel from "@/models/User";
import { TRPCError } from "@trpc/server";
import { connectToDatabase } from "@workspace/common-logic";
import { UIConstants, User } from "@workspace/common-models";
import { checkPermission } from "@workspace/utils";
import { z } from "zod";
import {
  AuthorizationException,
  NotFoundException,
} from "../../core/exceptions";
import {
  adminProcedure,
  createDomainRequiredMiddleware,
  protectedProcedure,
} from "../../core/procedures";
import { getFormDataSchema, ListInputSchema } from "../../core/schema";
import { router } from "../../core/trpc";
import { paginate } from "../../core/utils";
import { mediaWrappedFieldValidator } from "../../core/validators";
import { addTags } from "./helpers";

const { permissions } = UIConstants;
const removeAdminFieldsFromUserObject = (user: User) => ({
  name: user.name,
  userId: user.userId,
  bio: user.bio,
  email: user.email,
  avatar: user.avatar,
  tags: user.tags,
});
const validateUserProperties = (user: User) => {
  checkForInvalidPermissions(user.permissions);
};
const updateCoursesForCreatorName = async (
  creatorId: string,
  creatorName: string
) => {
  await CourseModel.updateMany(
    {
      creatorId,
    },
    {
      creatorName,
    }
  );
};

export const userRouter = router({
  list: adminProcedure.input(ListInputSchema).query(async ({ ctx, input }) => {
    // Using MongoDB for consistency since Prisma is not available in context
    await connectToDatabase();

    const q = input?.search?.q;
    const { skip, take } = paginate(input.pagination);

    // Build MongoDB query for search
    const searchQuery = q
      ? {
          $or: [
            { name: { $regex: q, $options: "i" } },
            { email: { $regex: q, $options: "i" } },
          ],
        }
      : {};

    const [items, total] = await Promise.all([
      UserModel.find(searchQuery)
        .select({
          userId: 1,
          name: 1,
          email: 1,
          permissions: 1,
          createdAt: 1,
          updatedAt: 1,
        })
        .skip(skip)
        .limit(take)
        .sort({ createdAt: -1 }),
      UserModel.countDocuments(searchQuery),
    ]);

    return { items, total, meta: { skip, take } };
  }),

  protectedLoadUserData: protectedProcedure.query(async ({ ctx }) => {
    await connectToDatabase();

    const session = ctx.session!;
    const userId = session.user.userId || session.user.id;

    const user = await UserModel.findOne({ userId }).select({
      name: 1,
      email: 1,
      userId: 1,
      permissions: 1,
      createdAt: 1,
      updatedAt: 1,
    });

    return user;
  }),

  // Get user profile data from MongoDB
  getProfileProtected: protectedProcedure.query(async ({ ctx }) => {
    try {
      // Connect to MongoDB
      await connectToDatabase();

      const user = await UserModel.findOne({
        userId: ctx.session.user.userId,
      }).select({
        name: 1,
        _id: 1,
        email: 1,
        userId: 1,
        bio: 1,
        permissions: 1,
        purchases: 1,
        avatar: 1,
        subscribedToUpdates: 1,
      });

      if (!user) {
        throw new NotFoundException("User not found");
      }

      return {
        name: user.name,
        id: user._id.toString(),
        email: user.email,
        userId: user.userId,
        bio: user.bio,
        permissions: user.permissions || [],
        purchases:
          user.purchases?.map((purchase: any) => ({
            courseId: purchase.courseId,
            completedLessons: purchase.completedLessons || [],
            accessibleGroups: purchase.accessibleGroups || [],
          })) || [],
        avatar: user.avatar,
        subscribedToUpdates: user.subscribedToUpdates || false,
      };
    } catch (error) {
      if (error instanceof TRPCError) {
        throw error;
      }

      console.error("Error fetching user profile:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch user profile",
      });
    }
  }),

  // Update user profile
  updateProfileProtected: protectedProcedure
    .input(
      z.object({
        name: z.string().optional(),
        bio: z.string().optional(),
        subscribedToUpdates: z.boolean().optional(),
        avatar: z
          .object({
            storageType: z.enum(["media", "custom"]),
            data: z.object({
              url: z.string().optional(),
              mediaId: z.string().optional(),
              originalFileName: z.string().optional(),
              mimeType: z.string().optional(),
              size: z.number().optional(),
              access: z.string().optional(),
              thumbnail: z.string().optional(),
              caption: z.string().optional(),
              file: z.string().optional(),
            }),
          })
          .optional()
          .nullable(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        await connectToDatabase();

        const session = ctx.session!;
        const userId = session.user.userId || session.user.id;

        if (!userId) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "User ID not found in session",
          });
        }

        const updateData: any = {};
        if (input.name !== undefined) updateData.name = input.name;
        if (input.bio !== undefined) updateData.bio = input.bio;
        if (input.subscribedToUpdates !== undefined)
          updateData.subscribedToUpdates = input.subscribedToUpdates;
        if (input.avatar !== undefined) updateData.avatar = input.avatar;

        const updatedUser = await UserModel.findOneAndUpdate(
          { userId: userId },
          { $set: updateData },
          { new: true, runValidators: true }
        );

        if (!updatedUser) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "User not found",
          });
        }

        return {
          success: true,
          message: "Profile updated successfully",
          user: {
            name: updatedUser.name,
            id: updatedUser._id.toString(),
            email: updatedUser.email,
            userId: updatedUser.userId,
            bio: updatedUser.bio,
            avatar: updatedUser.avatar,
            subscribedToUpdates: updatedUser.subscribedToUpdates,
          },
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }

        console.error("Error updating user profile:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update user profile",
        });
      }
    }),

  getByUserId: protectedProcedure
    .use(createDomainRequiredMiddleware())
    .input(z.object({ userId: z.string().nullable() }))
    .query(async ({ ctx, input }) => {
      let user: User | undefined | null;
      user = ctx.user;

      if (input.userId) {
        user = await UserModel.findOne({
          userId: input.userId,
          domain: ctx.domainData.domainObj._id,
        });
      }

      if (!user) {
        throw new NotFoundException("User not found");
      }

      if (
        ctx.user &&
        (user.userId === ctx.user.userId ||
          checkPermission(ctx.user.permissions, [permissions.manageUsers]))
      ) {
        return user;
      } else {
        return removeAdminFieldsFromUserObject(user);
      }
    }),

  update: protectedProcedure
    .use(createDomainRequiredMiddleware())
    .input(
      getFormDataSchema({
        name: z.string().min(2).max(100).optional(),
        active: z.boolean().optional(),
        bio: z.string().max(500).optional(),
        permissions: z.array(z.string()).optional(),
        subscribedToUpdates: z.boolean().optional(),
        tags: z.array(z.string()).optional(),
        avatar: mediaWrappedFieldValidator().optional(),
        invited: z.boolean().optional(),
      }).extend({
        id: z.string().min(2).max(100),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const keys = Object.keys(input.data);

      const hasPermissionToManageUser = checkPermission(ctx.user.permissions, [
        permissions.manageUsers,
      ]);
      const isModifyingSelf = input.id === ctx.user._id.toString();
      const restrictedKeys = ["permissions", "active"];

      if (
        (isModifyingSelf && keys.some((key) => restrictedKeys.includes(key))) ||
        (!isModifyingSelf && !hasPermissionToManageUser)
      ) {
        throw new AuthorizationException(
          "You do not have permission to modify this user"
        );
      }

      let user = await UserModel.findOne({
        _id: input.id,
        domain: ctx.domainData.domainObj._id,
      });
      if (!user) throw new NotFoundException("User not found");

      for (const key of keys.filter((key) => key !== "id")) {
        if (key === "tags") {
          addTags(input.data["tags"]!, ctx as any);
        }

        (user as any)[key] = (input as any).data[key];
      }

      if (!user.tags) {
        user.tags = [];
      }

      validateUserProperties(user);

      user = await user.save();

      if (input.data.name) {
        await updateCoursesForCreatorName(user.userId || user.id, user.name!);
      }

      return user;
    }),
});
