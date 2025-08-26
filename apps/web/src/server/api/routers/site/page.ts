import PageModel from "@/models/Page";

import { z } from "zod";
import { NotFoundException } from "../../core/exceptions";
import {
  createDomainRequiredMiddleware,
  publicProcedure,
} from "../../core/procedures";
import { router } from "../../core/trpc";

/**
 * Page Router - Replaces GraphQL getPage resolver
 *
 * Available endpoints:
 * 1. publicGet - Get page by ID (with published data only)
 * 2. publicGetDefault - Get default page for domain
 *
 * Usage examples:
 * - Client: trpc.siteModule.page.publicGet.query({ id: "pageId" })
 * - Server: trpcCaller.siteModule.page.publicGet({ id: "pageId" })
 * - HTTP: GET /api/trpc/siteModule.page.publicGet?input={"id":"pageId"}
 */
export const pageRouter = router({
  // Get page by ID
  publicGet: publicProcedure
    .use(createDomainRequiredMiddleware())
    .input(
      z.object({
        id: z.string().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      let page: any = null;

      if (input.id) {
        // Get specific page by ID
        page = await PageModel.findOne({
          domain: ctx.domainData.domainObj._id,
          pageId: input.id,
          deleted: false,
        });
      } else {
        // Get default page (first available page for domain)
        page = await PageModel.findOne({
          domain: ctx.domainData.domainObj._id,
          deleted: false,
        }).sort({ createdAt: 1 });
      }

      if (!page) {
        const identifier = input.id || "default";
        throw new NotFoundException("Page", identifier);
      }

      // Return only published data, excluding draft fields and internal data
      return {
        type: page.type,
        name: page.name,
        title: page.title,
        layout: page.layout,
        pageData: page.layout, // For compatibility with existing interface
        description: page.description,
        socialImage: page.socialImage,
        robotsAllowed: page.robotsAllowed,
      };
    }),

  // Get page by pageId (more explicit)
  publicGetByPageId: publicProcedure
    .use(createDomainRequiredMiddleware())
    .input(
      z.object({
        pageId: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const page = await PageModel.findOne({
        domain: ctx.domainData.domainObj._id,
        pageId: input.pageId,
        deleted: false,
      });

      if (!page) {
        throw new NotFoundException("Page", input.pageId);
      }

      // Return only published data
      return {
        type: page.type,
        name: page.name,
        title: page.title,
        layout: page.layout,
        pageData: page.layout, // For compatibility
        description: page.description,
        socialImage: page.socialImage,
        robotsAllowed: page.robotsAllowed,
      };
    }),

  // Get default page for domain
  publicGetDefault: publicProcedure
    .use(createDomainRequiredMiddleware())
    .query(async ({ ctx }) => {
      const page = await PageModel.findOne({
        domain: ctx.domainData.domainObj._id,
        deleted: false,
      }).sort({ createdAt: 1 });

      if (!page) {
        throw new NotFoundException("Page", "default");
      }

      return {
        type: page.type,
        name: page.name,
        title: page.title,
        layout: page.layout,
        pageData: page.layout, // For compatibility
        description: page.description,
        socialImage: page.socialImage,
        robotsAllowed: page.robotsAllowed,
      };
    }),
});
