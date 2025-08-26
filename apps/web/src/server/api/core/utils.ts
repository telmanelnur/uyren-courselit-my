import { createModel } from "@workspace/common-logic";
import { RootFilterQuery } from "mongoose";

export function paginate(p?: {
  skip?: number;
  take?: number;
  includePaginationCount?: boolean;
}) {
  return {
    skip: p?.skip ?? 0,
    take: Math.min(Math.max(p?.take ?? 20, 1), 100),
    includePaginationCount:
      p?.includePaginationCount === undefined ? true : p.includePaginationCount,
  };
}
export function orderBy(
  field = "createdAt",
  direction: "asc" | "desc" = "desc",
) {
  return { [field]: direction } as any;
}
export const like = (s?: string) =>
  s?.trim() ? { contains: s.trim(), mode: "insensitive" as const } : undefined;

interface QueryOptions<T> {
  filter?: RootFilterQuery<T>;
  pagination?: {
    page?: number;
    take?: number;
    includePaginationCount?: boolean;
  };
  orderBy?: { field: keyof T | string; direction?: "asc" | "desc" };
  populate?: { path: string; select?: string }[];
  includeCount?: boolean;
}

export async function buildMongooseQuery<T = any>(
  model: ReturnType<typeof createModel<T>>,
  options: QueryOptions<T>,
) {
  const {
    filter = {},
    pagination,
    orderBy: ob,
    populate = [],
    includeCount = false,
  } = options;

  const meta = paginate(pagination);
  const sortObj: Record<string, 1 | -1> = {};

  if (ob?.field) {
    const { field, direction } = orderBy(ob.field as string, ob.direction);
    sortObj[field] = direction === "asc" ? 1 : -1;
  }

  let query = model.find(filter);

  if (populate.length) {
    populate.forEach((pop) => {
      query = query.populate(pop);
    });
  }

  query = query.skip(meta.skip).limit(meta.take).sort(sortObj);

  const [items, total] = await Promise.all([
    query.exec(),
    includeCount || meta.includePaginationCount
      ? model.countDocuments(filter)
      : Promise.resolve(null),
  ]);

  return { items, total, meta };
}
