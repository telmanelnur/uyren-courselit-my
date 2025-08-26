import DomainModel, { Domain } from "@/models/Domain";
import { NotFoundException } from "./exceptions";
import mongoose from "mongoose";
import { ObjectId } from "mongodb";

export const assertDomainExist = async (
  ctx: any,
  options?: {
    loadDatabase?: boolean;
  },
) => {
  const domainObj = ctx.domainData.domainObj as Domain;
  if (!domainObj) {
    throw new NotFoundException("Domain", "current");
  }
  if (options?.loadDatabase) {
    const m = await DomainModel.findOne({
      _id: domainObj._id,
    });
    if (!m) {
      throw new NotFoundException("Domain", "current");
    }
    return m.toObject();
  }
  return domainObj;
};

export const checkOwnershipWithoutModel = <
  T extends { creatorId: mongoose.Types.ObjectId | string },
>(
  item: T | null,
  ctx: {
    user: {
      _id: mongoose.Types.ObjectId | string;
      userId: mongoose.Types.ObjectId | string;
    };
  },
) => {
  if (
    !item ||
    (ObjectId.isValid(item.creatorId)
      ? item.creatorId.toString() !== ctx.user._id.toString()
      : item.creatorId.toString() !== ctx.user.userId.toString())
  ) {
    return false;
  }

  return true;
};
