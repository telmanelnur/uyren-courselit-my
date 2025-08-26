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

const CourseModel = createModel("Course", CourseSchema);

export default CourseModel;
