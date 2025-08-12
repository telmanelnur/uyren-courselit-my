import { parseHost } from "@/lib/domain";
import DomainModel from "@/models/Domain";

import { z } from "zod";
import {
  NotFoundException,
  ResourceExistsException,
} from "../../core/exceptions";
import { adminProcedure, publicProcedure } from "../../core/procedures";
import { getFormDataSchema, ListInputSchema } from "../../core/schema";
import { router } from "../../core/trpc";
import { like, paginate } from "../../core/utils";
import {
  documentIdValidator,
  documentSlugValidator,
  toSlug,
} from "../../core/validators";

const CreateSchema = getFormDataSchema({
  name: documentSlugValidator().transform(toSlug),
  customDomain: z.string().optional(),
  email: z.string().email("Valid email is required"),
  settings: z
    .object({
      title: z.string().optional(),
      subtitle: z.string().optional(),
      logo: z.string().optional(),
    })
    .optional(),
});

const UpdateSchema = getFormDataSchema({
  name: documentSlugValidator().transform(toSlug).optional(),
  customDomain: z.string().optional(),
  email: z.string().email().optional(),
  settings: z
    .object({
      title: z.string().optional(),
      subtitle: z.string().optional(),
      logo: z.string().optional(),
    })
    .optional(),
}).extend({
  id: documentIdValidator(),
});

async function ensureUniqueName(name: string, excludeId?: string) {
  
  const existing = await DomainModel.findOne({
    name,
    deleted: false,
    ...(excludeId ? { _id: { $ne: excludeId } } : {}),
  });
  if (existing) throw new ResourceExistsException("Domain", "name", name);
}

async function ensureUniqueCustomDomain(
  customDomain: string,
  excludeId?: string
) {
  
  const existing = await DomainModel.findOne({
    customDomain,
    deleted: false,
    ...(excludeId ? { _id: { $ne: excludeId } } : {}),
  });
  if (existing)
    throw new ResourceExistsException("Domain", "customDomain", customDomain);
}

export const domainRouter = router({
  list: adminProcedure
    .input(
      ListInputSchema.extend({
        filter: z
          .object({
            name: z.string().optional(),
            customDomain: z.string().optional(),
          })
          .optional(),
      })
    )
    .query(async ({ input }) => {
      

      const q = input?.search?.q;
      const baseWhere: any = {
        deleted: false,
        ...(input?.filter?.name ? { name: like(input.filter.name) } : {}),
        ...(input?.filter?.customDomain
          ? { customDomain: like(input.filter.customDomain) }
          : {}),
        ...(q
          ? {
              $or: [
                { name: like(q) },
                { customDomain: like(q) },
                { email: like(q) },
              ],
            }
          : {}),
      };

      const paginationMeta = paginate(input?.pagination);
      const orderByConfig = input?.orderBy || {
        field: "createdAt",
        direction: "desc",
      };
      const sortObject: Record<string, 1 | -1> = {
        [orderByConfig.field]: orderByConfig.direction === "asc" ? 1 : -1,
      };

      const [items, total] = await Promise.all([
        DomainModel.find(baseWhere)
          .sort(sortObject)
          .skip(paginationMeta.skip)
          .limit(paginationMeta.take)
          .lean(),
        paginationMeta.includePaginationCount
          ? DomainModel.countDocuments(baseWhere)
          : Promise.resolve(null),
      ]);

      return { 
        items, 
        total, 
        meta: paginationMeta 
      };
    }),

  getById: adminProcedure
    .input(documentIdValidator())
    .query(async ({ input }) => {
      

      const domain = await DomainModel.findOne({
        _id: input,
        deleted: false,
      });

      if (!domain) throw new NotFoundException("Domain", input);
      return domain.toObject();
    }),

  create: adminProcedure.input(CreateSchema).mutation(async ({ input }) => {
    

    await ensureUniqueName(input.data.name);

    if (input.data.customDomain) {
      await ensureUniqueCustomDomain(input.data.customDomain);
    }

    const domain = new DomainModel({
      name: input.data.name,
      customDomain: input.data.customDomain,
      email: input.data.email,
      settings: input.data.settings || {},
    });

    const saved = await domain.save();
    return saved.toObject();
  }),

  update: adminProcedure.input(UpdateSchema).mutation(async ({ input }) => {
    

    const existing = await DomainModel.findOne({
      _id: input.id,
      deleted: false,
    });

    if (!existing) throw new NotFoundException("Domain", input.id);

    if (input.data.name) {
      await ensureUniqueName(input.data.name, input.id);
    }

    if (input.data.customDomain) {
      await ensureUniqueCustomDomain(input.data.customDomain, input.id);
    }

    const updated = await DomainModel.findByIdAndUpdate(input.id, input.data, {
      new: true,
    });

    return updated!.toObject();
  }),

  delete: adminProcedure
    .input(documentIdValidator())
    .mutation(async ({ input }) => {
      

      const existing = await DomainModel.findOne({
        _id: input,
        deleted: false,
      });

      if (!existing) throw new NotFoundException("Domain", input);

      // Soft delete
      const deleted = await DomainModel.findByIdAndUpdate(
        input,
        { deleted: true },
        { new: true }
      );

      return deleted!.toObject();
    }),

  // Get current domain context from tRPC context
  getCurrentDomain: publicProcedure.query(async ({ ctx }) => {
    return {
      domainHeaders: ctx.domainHeaders,
      domainData: ctx.domainData,
    };
  }),

  // Public endpoints
  publicGetByHost: publicProcedure
    .input(z.object({ host: z.string() }))
    .query(async ({ input }) => {
      

      const { cleanHost, subdomain } = parseHost(input.host);
      if (!cleanHost) throw new NotFoundException("Domain", input.host);

      let domain = null;

      // Check subdomain pattern first
      if (subdomain) {
        domain = await DomainModel.findOne({
          name: subdomain,
          deleted: false,
        });
      }

      // If not found as subdomain, check custom domain
      if (!domain) {
        domain = await DomainModel.findOne({
          customDomain: cleanHost,
          deleted: false,
        });
      }

      if (!domain) throw new NotFoundException("Domain", input.host);
      return domain.toObject();
    }),
});
