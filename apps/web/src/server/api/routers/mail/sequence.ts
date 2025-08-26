import { router } from "../../core/trpc";
import {
  createDomainRequiredMiddleware,
  createPermissionMiddleware,
  protectedProcedure,
} from "../../core/procedures";
import { getFormDataSchema, ListInputSchema } from "../../core/schema";
import { paginate } from "../../core/utils";
import { NotFoundException } from "../../core/exceptions";
import SequenceModel from "@/models/Sequence";
import { UIConstants, Constants } from "@workspace/common-models";
import { generateUniqueId } from "@workspace/utils";
import { z } from "zod";
import { Log } from "@/lib/logger";
import { AdminSequence } from "@workspace/common-logic";
import { internal } from "@/config/strings";
import { RootFilterQuery } from "mongoose";

const { permissions } = UIConstants;

export const sequenceRouter = router({
  list: protectedProcedure
    .use(createDomainRequiredMiddleware())
    .use(createPermissionMiddleware([permissions.manageUsers]))
    .input(
      ListInputSchema.extend({
        filter: z
          .object({
            type: z.enum(["broadcast", "sequence"]).optional(),
          })
          .optional()
          .default({}),
      }),
    )
    .query(async ({ ctx, input }) => {
      const query: RootFilterQuery<AdminSequence> = {
        domain: ctx.domainData.domainObj._id,
      };
      if (input.filter.type) {
        query.type = input.filter.type;
      }
      const paginationMeta = paginate(input.pagination);
      const orderBy = input.orderBy || {
        field: "createdAt",
        direction: "desc",
      };
      const sortObject: Record<string, 1 | -1> = {
        [orderBy.field]: orderBy.direction === "asc" ? 1 : -1,
      };
      const [items, total] = await Promise.all([
        SequenceModel.find(query)
          .select("sequenceId title emails status entrants")
          .skip(paginationMeta.skip)
          .limit(paginationMeta.take)
          .sort(sortObject)
          .lean(),
        paginationMeta.includePaginationCount
          ? SequenceModel.countDocuments(query)
          : Promise.resolve(null),
      ]);
      return {
        items: items.map((seq) => ({
          sequenceId: seq.sequenceId,
          title: seq.title || "",
          emails: seq.emails || [],
          status: seq.status,
          entrantsCount: seq.entrants?.length || 0,
        })),
        total,
        meta: paginationMeta,
      };
    }),

  getById: protectedProcedure
    .use(createDomainRequiredMiddleware())
    .use(createPermissionMiddleware([permissions.manageUsers]))
    .input(
      z.object({
        sequenceId: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const sequence = await SequenceModel.findOne({
        domain: ctx.domainData.domainObj._id,
        sequenceId: input.sequenceId,
      }).lean();

      if (!sequence) {
        throw new NotFoundException("Sequence", input.sequenceId);
      }

      return {
        sequenceId: sequence.sequenceId,
        title: sequence.title,
        emails: sequence.emails || [],
        status: sequence.status,
        entrantsCount: sequence.entrants?.length || 0,
        type: sequence.type,
      };
    }),

  create: protectedProcedure
    .use(createDomainRequiredMiddleware())
    .use(createPermissionMiddleware([permissions.manageUsers]))
    .input(
      getFormDataSchema({
        type: z.enum(["broadcast", "sequence"]),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // const sequence = await SequenceModel.create({
      //   domain: ctx.domainData.domainObj._id,
      //   sequenceId: generateUniqueId(),
      //   type: input.data.type,
      //   title: input.data.title,
      //   creatorId: ctx.user.userId,
      //   status: Constants.sequenceStatus[0], // draft
      //   emails: input.data.subject ? [{
      //     emailId: generateUniqueId(),
      //     subject: input.data.subject,
      //     content: input.data.content || "",
      //     published: false,
      //     delayInMillis: 0,
      //   }] : [],
      //   entrants: [],
      // });

      // return {
      //   sequenceId: sequence.sequenceId,
      //   title: sequence.title,
      //   status: sequence.status,
      //   type: sequence.type,
      // };
      try {
        const emailId = generateUniqueId();
        const sequenceObj: Partial<AdminSequence> = {
          domain: ctx.domainData.domainObj._id,
          type: input.data.type,
          status: Constants.sequenceStatus[0],
          title: internal.default_email_sequence_name,
          creatorId: ctx.user.userId,
          emails: [
            {
              emailId,
              content: "defaultEmailContent",
              subject:
                input.data.type === "broadcast"
                  ? internal.default_email_broadcast_subject
                  : internal.default_email_sequence_subject,
              delayInMillis: 0,
              published: false,
            },
          ],
          trigger: {
            type:
              input.data.type === "broadcast"
                ? Constants.EventType.DATE_OCCURRED
                : Constants.EventType.PRODUCT_PURCHASED,
          },
          emailsOrder: [emailId],
          filter: {
            aggregator: "or",
            filters: [],
          },
        };
        const sequence = await SequenceModel.create(sequenceObj);
        return sequence;
      } catch (e: any) {
        Log.error(e.message, {
          stack: e.stack,
        });
        throw e;
      }
    }),

  update: protectedProcedure
    .use(createDomainRequiredMiddleware())
    .use(createPermissionMiddleware([permissions.manageUsers]))
    .input(
      getFormDataSchema({
        title: z.string().min(1).max(255).optional(),
        status: z.enum(Constants.sequenceStatus as any).optional(),
      }).extend({
        sequenceId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const sequence = await SequenceModel.findOne({
        domain: ctx.domainData.domainObj._id,
        sequenceId: input.sequenceId,
      });

      if (!sequence) {
        throw new NotFoundException("Sequence", input.sequenceId);
      }

      Object.keys(input.data).forEach((key) => {
        (sequence as any)[key] = (input.data as any)[key];
      });

      await sequence.save();

      return {
        sequenceId: sequence.sequenceId,
        title: sequence.title,
        status: sequence.status,
      };
    }),

  delete: protectedProcedure
    .use(createDomainRequiredMiddleware())
    .use(createPermissionMiddleware([permissions.manageUsers]))
    .input(
      z.object({
        sequenceId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const sequence = await SequenceModel.findOne({
        domain: ctx.domainData.domainObj._id,
        sequenceId: input.sequenceId,
      });

      if (!sequence) {
        throw new NotFoundException("Sequence", input.sequenceId);
      }

      await SequenceModel.deleteOne({
        domain: ctx.domainData.domainObj._id,
        sequenceId: input.sequenceId,
      });

      return true;
    }),

  startSequence: protectedProcedure
    .use(createDomainRequiredMiddleware())
    .use(createPermissionMiddleware([permissions.manageUsers]))
    .input(
      z.object({
        sequenceId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const sequence = await SequenceModel.findOne({
        domain: ctx.domainData.domainObj._id,
        sequenceId: input.sequenceId,
      });

      if (!sequence) {
        throw new NotFoundException("Sequence", input.sequenceId);
      }

      sequence.status = Constants.sequenceStatus[1]; // active
      await sequence.save();

      return {
        sequenceId: sequence.sequenceId,
        status: sequence.status,
      };
    }),

  pauseSequence: protectedProcedure
    .use(createDomainRequiredMiddleware())
    .use(createPermissionMiddleware([permissions.manageUsers]))
    .input(
      z.object({
        sequenceId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const sequence = await SequenceModel.findOne({
        domain: ctx.domainData.domainObj._id,
        sequenceId: input.sequenceId,
      });

      if (!sequence) {
        throw new NotFoundException("Sequence", input.sequenceId);
      }

      sequence.status = Constants.sequenceStatus[2]; // paused
      await sequence.save();

      return {
        sequenceId: sequence.sequenceId,
        status: sequence.status,
      };
    }),

  addMailToSequence: protectedProcedure
    .use(createDomainRequiredMiddleware())
    .use(createPermissionMiddleware([permissions.manageUsers]))
    .input(
      z.object({
        sequenceId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const sequence = await SequenceModel.findOne({
        domain: ctx.domainData.domainObj._id,
        sequenceId: input.sequenceId,
      });

      if (!sequence) {
        throw new NotFoundException("Sequence", input.sequenceId);
      }

      const emailId = generateUniqueId();
      const newEmail = {
        emailId,
        content: "defaultEmailContent",
        subject: "New Email",
        delayInMillis: 0,
        published: false,
      };

      sequence.emails.push(newEmail);
      sequence.emailsOrder.push(emailId);
      await sequence.save();

      return {
        sequenceId: sequence.sequenceId,
        emails: sequence.emails,
        emailsOrder: sequence.emailsOrder,
      };
    }),

  deleteMailFromSequence: protectedProcedure
    .use(createDomainRequiredMiddleware())
    .use(createPermissionMiddleware([permissions.manageUsers]))
    .input(
      z.object({
        sequenceId: z.string(),
        emailId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const sequence = await SequenceModel.findOne({
        domain: ctx.domainData.domainObj._id,
        sequenceId: input.sequenceId,
      });

      if (!sequence) {
        throw new NotFoundException("Sequence", input.sequenceId);
      }

      // Remove email from emails array
      sequence.emails = sequence.emails.filter(
        (email) => email.emailId !== input.emailId,
      );

      // Remove email from emailsOrder
      sequence.emailsOrder = sequence.emailsOrder.filter(
        (id) => id !== input.emailId,
      );

      await sequence.save();

      return {
        sequenceId: sequence.sequenceId,
        emails: sequence.emails,
        emailsOrder: sequence.emailsOrder,
      };
    }),

  updateMailInSequence: protectedProcedure
    .use(createDomainRequiredMiddleware())
    .use(createPermissionMiddleware([permissions.manageUsers]))
    .input(
      z.object({
        sequenceId: z.string(),
        emailId: z.string(),
        subject: z.string().optional(),
        content: z.string().optional(),
        delayInMillis: z.number().optional(),
        published: z.boolean().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const sequence = await SequenceModel.findOne({
        domain: ctx.domainData.domainObj._id,
        sequenceId: input.sequenceId,
      });

      if (!sequence) {
        throw new NotFoundException("Sequence", input.sequenceId);
      }

      const email = sequence.emails.find((e) => e.emailId === input.emailId);
      if (!email) {
        throw new NotFoundException("Email", input.emailId);
      }

      // Update email fields
      if (input.subject !== undefined) email.subject = input.subject;
      if (input.content !== undefined) email.content = input.content;
      if (input.delayInMillis !== undefined)
        email.delayInMillis = input.delayInMillis;
      if (input.published !== undefined) email.published = input.published;

      await sequence.save();

      return {
        sequenceId: sequence.sequenceId,
        emails: sequence.emails,
      };
    }),
});
