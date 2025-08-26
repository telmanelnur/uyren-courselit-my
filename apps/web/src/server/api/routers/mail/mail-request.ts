import MailRequestStatusModel from "@/models/MailRequestStatus";
import {
  createDomainRequiredMiddleware,
  createPermissionMiddleware,
  protectedProcedure,
} from "@/server/api/core/procedures";
import { router } from "@/server/api/core/trpc";
import z from "zod";
import { getFormDataSchema } from "../../core/schema";
import { UIConstants } from "@workspace/common-models";

const { permissions } = UIConstants;

export const mailRequestRouter = router({
  updateMailRequest: protectedProcedure
    .use(createDomainRequiredMiddleware())
    .use(createPermissionMiddleware([permissions.manageUsers]))
    .input(
      getFormDataSchema({
        reason: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      let mailRequestStatus = await MailRequestStatusModel.findOne({
        domain: ctx.domainData.domainObj._id,
        userId: ctx.user.userId,
      });

      if (mailRequestStatus) {
        mailRequestStatus.reason = input.data.reason;
        await mailRequestStatus.save();
      } else {
        mailRequestStatus = await MailRequestStatusModel.create({
          domain: ctx.domainData.domainObj._id,
          userId: ctx.user.userId,
          reason: input.data.reason,
        });
      }

      return mailRequestStatus;
    }),
  getMailRequestStatus: protectedProcedure
    .use(createDomainRequiredMiddleware())
    .use(createPermissionMiddleware([permissions.manageUsers]))
    .query(async ({ ctx }) => {
      return await MailRequestStatusModel.findOne({
        domain: ctx.domainData.domainObj._id,
        userId: ctx.user.userId,
      });
    }),
});
