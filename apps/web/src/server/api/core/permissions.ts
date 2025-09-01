import { Domain } from "@/models/Domain";
import { ObjectId } from "mongodb";
import mongoose from "mongoose";
import { NotFoundException } from "./exceptions";

export const assertDomainExist = async (
  ctx: any,
) => {
  const domainObj = ctx.domainData.domainObj as Domain;
  if (!domainObj) {
    throw new NotFoundException("Domain", "current");
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
