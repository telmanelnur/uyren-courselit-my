import { CourseSchema, createModel } from "@workspace/common-logic";

CourseSchema.virtual("attachedLessons", {
  ref: "Lesson",
  localField: "lessons",
  foreignField: "lessonId",
});

CourseSchema.virtual("attachedPaymentPlans", {
  ref: "PaymentPlan",
  localField: "paymentPlans",
  foreignField: "planId",
});

CourseSchema.virtual("attachedTheme", {
  ref: "Theme",
  localField: "themeId",
  foreignField: "_id",
  justOne: true,
});

const CourseModel = createModel("Course", CourseSchema);

export default CourseModel;
