import DomainModel from "@/models/Domain";
import UserModel from "@/models/User";
import { TRPCError } from "@trpc/server";

import { UIConstants } from "@workspace/common-models";
import { checkPermission } from "@workspace/utils";
import { z } from "zod";
import {
  AuthorizationException,
  NotFoundException,
} from "../../core/exceptions";
import {
  createDomainRequiredMiddleware,
  createPermissionMiddleware,
  MainContextType,
  protectedProcedure,
} from "../../core/procedures";
import { router } from "../../core/trpc";
import { getFormDataSchema } from "../../core/schema";
import { addTags } from "./helpers";

const { permissions } = UIConstants;

const getTagsWithDetails = async (ctx: MainContextType) => {
  if (!checkPermission(ctx.user.permissions, [permissions.manageUsers])) {
    throw new AuthorizationException();
  }
  const tagsWithUsersCount = await UserModel.aggregate([
    { $unwind: "$tags" },
    {
      $match: {
        tags: { $in: ctx.domainData.domainObj.tags },
        domain: ctx.domainData.domainObj._id,
      },
    },
    {
      $group: {
        _id: "$tags",
        count: { $sum: 1 },
      },
    },
    {
      $project: {
        tag: "$_id",
        count: 1,
        _id: 0,
      },
    },
    {
      $unionWith: {
        coll: "domains",
        pipeline: [
          { $match: { _id: ctx.domainData.domainObj._id } },
          { $unwind: "$tags" },
          { $project: { tag: "$tags", _id: 0 } },
        ],
      },
    },
    {
      $group: {
        _id: "$tag",
        count: { $sum: "$count" },
      },
    },
    {
      $project: {
        tag: "$_id",
        count: 1,
        _id: 0,
      },
    },
    { $sort: { count: -1 } },
  ]);

  return tagsWithUsersCount;
};

export const tagRouter = router({
  list: protectedProcedure
    .use(createDomainRequiredMiddleware())
    .use(createPermissionMiddleware([permissions.manageUsers]))
    .query(async ({ ctx }) => {
      const domain = await DomainModel.findById(ctx.domainData.domainObj._id);
      if (!domain) throw new NotFoundException("Domain not found");
      if (!domain.tags) {
        domain.tags = [];
        await domain.save();
      }
      return domain.tags;
    }),

  addTags: protectedProcedure
    .use(createDomainRequiredMiddleware())
    .use(createPermissionMiddleware([permissions.manageUsers]))
    .input(z.object({ tags: z.array(z.string()) }))
    .mutation(async ({ ctx, input }) => {
      return await addTags(input.tags, ctx as any);
    }),

  delete: protectedProcedure
    .use(createDomainRequiredMiddleware())
    .use(createPermissionMiddleware([permissions.manageUsers]))
    .input(getFormDataSchema({ tag: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const domainObj = await DomainModel.findById(
        ctx.domainData.domainObj._id
      );
      if (!domainObj) {
        throw new NotFoundException("Domain not found");
      }
      await UserModel.updateMany(
        { domain: domainObj._id },
        { $pull: { tags: input.data.tag } }
      );
      const tagIndex = domainObj.tags.indexOf(input.data.tag);
      domainObj.tags.splice(tagIndex, 1);

      await domainObj.save();
      return getTagsWithDetails(ctx as any);
    }),

  untagUsers: protectedProcedure
    .use(createDomainRequiredMiddleware())
    .use(createPermissionMiddleware([permissions.manageUsers]))
    .input(getFormDataSchema({ tag: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await UserModel.updateMany(
        { domain: ctx.domainData.domainObj._id },
        { $pull: { tags: input.data.tag } }
      );
      return await getTagsWithDetails(ctx as any);
    }),

  withDetails: protectedProcedure
    .use(createDomainRequiredMiddleware())
    .use(createPermissionMiddleware([permissions.manageUsers]))
    .query(async ({ ctx }) => {
      return await getTagsWithDetails(ctx as any);
    }),
});
