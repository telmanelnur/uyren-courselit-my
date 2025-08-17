import { router } from "../../core/trpc";
import { 
  createDomainRequiredMiddleware,
  createPermissionMiddleware,
  protectedProcedure 
} from "../../core/procedures";
import { getFormDataSchema, ListInputSchema } from "../../core/schema";
import { paginate } from "../../core/utils";
import { NotFoundException } from "../../core/exceptions";
import SequenceModel from "@/models/Sequence";
import { UIConstants, Constants } from "@workspace/common-models";
import { generateUniqueId } from "@workspace/utils";
import { z } from "zod";

const { permissions } = UIConstants;

export const broadcastRouter = router({
  list: protectedProcedure
    .use(createDomainRequiredMiddleware())
    .use(createPermissionMiddleware([permissions.manageSite]))
    .input(ListInputSchema)
    .query(async ({ ctx, input }) => {
      const query = {
        domain: ctx.domainData.domainObj._id,
        type: "broadcast",
      };

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
        items: items.map(seq => ({
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
    .use(createPermissionMiddleware([permissions.manageSite]))
    .input(z.object({
      sequenceId: z.string(),
    }))
    .query(async ({ ctx, input }) => {
      const broadcast = await SequenceModel.findOne({
        domain: ctx.domainData.domainObj._id,
        sequenceId: input.sequenceId,
        type: "broadcast",
      }).lean();

      if (!broadcast) {
        throw new NotFoundException("Broadcast", input.sequenceId);
      }

      return {
        sequenceId: broadcast.sequenceId,
        title: broadcast.title,
        emails: broadcast.emails || [],
        status: broadcast.status,
        entrantsCount: broadcast.entrants?.length || 0,
      };
    }),

  create: protectedProcedure
    .use(createDomainRequiredMiddleware())
    .use(createPermissionMiddleware([permissions.manageSite]))
    .input(getFormDataSchema({
      subject: z.string().min(1).max(255),
      content: z.string().optional(),
      title: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const broadcast = await SequenceModel.create({
        domain: ctx.domainData.domainObj._id,
        sequenceId: generateUniqueId(),
        type: "broadcast",
        title: input.data.title || input.data.subject,
        creatorId: ctx.user.userId,
        status: Constants.sequenceStatus[0], // draft
        emails: [{
          emailId: generateUniqueId(),
          subject: input.data.subject,
          content: input.data.content || "",
          published: false,
          delayInMillis: 0,
        }],
        entrants: [],
      });

      return {
        sequenceId: broadcast.sequenceId,
        title: broadcast.title,
        status: broadcast.status,
      };
    }),

  update: protectedProcedure
    .use(createDomainRequiredMiddleware())
    .use(createPermissionMiddleware([permissions.manageSite]))
    .input(getFormDataSchema({
      title: z.string().min(1).max(255).optional(),
      subject: z.string().optional(),
      content: z.string().optional(),
      status: z.enum(Constants.sequenceStatus as any).optional(),
    }).extend({
      sequenceId: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      const broadcast = await SequenceModel.findOne({
        domain: ctx.domainData.domainObj._id,
        sequenceId: input.sequenceId,
        type: "broadcast",
      });

      if (!broadcast) {
        throw new NotFoundException("Broadcast", input.sequenceId);
      }

      Object.keys(input.data).forEach(key => {
        if (key === "subject" || key === "content") {
          if (broadcast.emails?.[0]) {
            (broadcast.emails[0] as any)[key] = (input.data as any)[key];
          }
        } else {
          (broadcast as any)[key] = (input.data as any)[key];
        }
      });

      await broadcast.save();
      
      return {
        sequenceId: broadcast.sequenceId,
        title: broadcast.title,
        status: broadcast.status,
      };
    }),

  delete: protectedProcedure
    .use(createDomainRequiredMiddleware())
    .use(createPermissionMiddleware([permissions.manageSite]))
    .input(z.object({
      sequenceId: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      const broadcast = await SequenceModel.findOne({
        domain: ctx.domainData.domainObj._id,
        sequenceId: input.sequenceId,
        type: "broadcast",
      });

      if (!broadcast) {
        throw new NotFoundException("Broadcast", input.sequenceId);
      }

      await SequenceModel.deleteOne({
        domain: ctx.domainData.domainObj._id,
        sequenceId: input.sequenceId,
      });

      return true;
    }),
});
