export type BasicPublicationStatus = "draft" | "published" | "archived";

export const BASIC_PUBLICATION_STATUS_TYPE: Record<
  "DRAFT" | "PUBLISHED" | "ARCHIVED",
  BasicPublicationStatus
> = {
  DRAFT: "draft",
  PUBLISHED: "published",
  ARCHIVED: "archived",
};
