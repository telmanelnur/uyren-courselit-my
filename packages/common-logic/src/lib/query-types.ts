import { Model } from "mongoose";

export type MongooseFindFilterParams<TModel extends Model<any>> = Parameters<
  TModel["find"]
>;
