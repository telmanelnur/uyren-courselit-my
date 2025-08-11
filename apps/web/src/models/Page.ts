import { createModel } from "@workspace/common-logic";
import {
    Media,
    Page as PublicPage,
    WidgetInstance,
} from "@workspace/common-models";
import mongoose from "mongoose";
import constants from "../config/constants";
import MediaSchema from "./Media";
import WidgetSchema from "./Widget";
const { product, site, blogPage, communityPage } = constants;

export interface Page extends PublicPage {
  id: mongoose.Types.ObjectId;
  domain: mongoose.Types.ObjectId;
  draftLayout: WidgetInstance[];
  creatorId: string;
  draftTitle?: string;
  draftDescription?: string;
  draftSocialImage?: Media;
  draftRobotsAllowed?: boolean;
}

const PageSchema = new mongoose.Schema<Page>(
  {
    domain: { type: mongoose.Schema.Types.ObjectId, required: true },
    pageId: { type: String, required: true },
    type: {
      type: String,
      required: true,
      enum: [product, site, blogPage, communityPage],
      default: product,
    },
    creatorId: { type: String, required: true },
    name: { type: String, required: true },
    layout: { type: [WidgetSchema], default: [] },
    draftLayout: { type: [WidgetSchema], default: [] },
    entityId: { type: String },
    deleteable: { type: Boolean, required: true, default: false },
    title: { type: String },
    description: String,
    socialImage: MediaSchema,
    robotsAllowed: { type: Boolean, default: true },
    draftTitle: String,
    draftDescription: String,
    draftSocialImage: MediaSchema,
    draftRobotsAllowed: Boolean,
    deleted: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

PageSchema.index(
  {
    domain: 1,
    pageId: 1,
  },
  { unique: true }
);

const PageModel = createModel("Page", PageSchema);

export default PageModel;
