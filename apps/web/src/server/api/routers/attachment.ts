import cloudinary from "@/lib/cloudinary";
import z from "zod";
import { AuthorizationException, NotFoundException } from "../core/exceptions";
import { teacherProcedure } from "../core/procedures";
import { isAdmin } from "../core/roles";
import { ListInputSchema } from "../core/schema";
import { router } from "../core/trpc";
import { like, orderBy, paginate } from "../core/utils";
import { documentIdValidator } from "../core/validators";

async function assertOwnerOrAdmin(ctx: any, ownerId?: number | null) {
  if (isAdmin(ctx.user)) return;
  if (!ownerId || ctx.user!.id !== ownerId)
    throw new AuthorizationException(
      "You are not the owner of this attachment",
    );
}

export const attachmentRouter = router({
  list: teacherProcedure
    .input(
      ListInputSchema.extend({
        filter: z.object({
          ownerId: z.number().int().positive().optional(),
          filename: z.string().optional(),
          mimetype: z.string().optional(),
          // objectType: z.nativeEnum(ContentTypeGeneric).optional(),
          // objectId: documentIdValidator().optional(),
        }),
      }),
    )
    .query(async ({ ctx, input }) => {
      const q = input?.search?.q;
      const where: any = {
        ...(input.filter.ownerId ? { ownerId: input.filter.ownerId } : {}),
        // ...(input.filter.objectType
        //   ? { objectType: input.filter.objectType }
        //   : {}),
        // ...(input.filter.objectId ? { objectId: input.filter.objectId } : {}),
        ...(input.filter.filename
          ? { filename: like(input.filter.filename) }
          : {}),
        ...(input.filter.mimetype
          ? { mimetype: like(input.filter.mimetype) }
          : {}),
        ...(q
          ? {
              OR: [
                { filename: like(q) },
                { originalName: like(q) },
                { mimetype: like(q) },
              ],
            }
          : {}),
      };
      if (
        input.filter.ownerId &&
        !isAdmin(ctx.user) &&
        ctx.user!.id !== input.filter.ownerId
      )
        throw new AuthorizationException(
          "You do not have permission to access this user's attachments",
        );

      const { skip, take } = paginate(input.pagination);
      const ob = orderBy(input.orderBy?.field, input.orderBy?.direction);
      const [items, total] = await Promise.all([
        ctx.prisma.attachment.findMany({ where, skip, take, orderBy: ob }),
        ctx.prisma.attachment.count({ where }),
      ]);
      return { items, total, meta: { skip, take } };
    }),

  getById: teacherProcedure
    .input(documentIdValidator())
    .query(async ({ ctx, input }) => {
      const row = await ctx.prisma.attachment.findUnique({
        where: { id: input },
      });
      if (!row) throw new NotFoundException("Attachment", String(input));
      await assertOwnerOrAdmin(ctx, row.ownerId ?? undefined);
      return row;
    }),

  delete: teacherProcedure
    .input(documentIdValidator())
    .mutation(async ({ input, ctx }) => {
      const row = await ctx.prisma.attachment.findUnique({
        where: { id: input },
        select: { ownerId: true, path: true },
      });
      if (!row) throw new NotFoundException("Attachment", String(input));
      await assertOwnerOrAdmin(ctx, row.ownerId ?? undefined);
      if (row.path) {
        try {
          await cloudinary.uploader.destroy(row.path);
        } catch (err) {
          console.error("Cloudinary destroy error:", err);
        }
      }
      return await ctx.prisma.attachment.delete({
        where: { id: input },
      });
    }),
});
