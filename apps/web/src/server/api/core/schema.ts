import z from "zod";

export const PaginationSchema = z.object({
  skip: z.number().int().min(0).default(0),
  take: z.number().int().min(1).max(100).default(20),
  includePaginationCount: z.boolean().optional().default(true),
});

export const OrderBySchema = z.object({
  field: z.string().default("createdAt"),
  direction: z.enum(["asc", "desc"]).default("desc"),
});

export const ListInputSchema = z.object({
  filter: z.record(z.string(), z.any()).optional(),
  pagination: PaginationSchema.optional(),
  orderBy: OrderBySchema.optional(),
  search: z.object({ q: z.string().trim().optional() }).optional(),
});

// Define function getFormDataSchema({ title, ...}) so that generate {data:{title, ...}} with zod
export const getFormDataSchema = <T extends Record<string, z.ZodTypeAny>>(
  fields: T
) => {
  return z.object({
    data: z.object(fields),
  });
};
