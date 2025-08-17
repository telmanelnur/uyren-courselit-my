import { createModel } from "@workspace/common-logic";
import mongoose, { Document, Schema } from "mongoose";

export interface IQuiz extends Document {
  title: string;
  description?: string;
  courseId: string;
  ownerId: string;
  domain: mongoose.Types.ObjectId;
  timeLimit?: number;
  maxAttempts: number;
  passingScore: number;
  shuffleQuestions: boolean;
  showResults: boolean;
  isPublished: boolean;
  questionIds: string[];
  totalPoints: number;
  createdAt: Date;
  updatedAt: Date;
}

const QuizSchema = new Schema<IQuiz>({
  domain: { type: mongoose.Schema.Types.ObjectId, required: true },
  title: { type: String, required: true, trim: true, maxlength: 255 },
  description: { type: String, trim: true },
  courseId: { type: String, required: true, index: true },
  ownerId: { type: String, required: true, index: true },
  timeLimit: { type: Number, min: 1 },
  maxAttempts: { type: Number, min: 1, max: 10, default: 1 },
  passingScore: { type: Number, min: 0, max: 100, default: 60 },
  shuffleQuestions: { type: Boolean, default: true },
  showResults: { type: Boolean, default: false },
  isPublished: { type: Boolean, default: false },
  questionIds: [{ type: String }],
  totalPoints: { type: Number, min: 0, default: 0 },
}, {
  timestamps: true,
});

QuizSchema.index({ ownerId: 1, isPublished: 1 });
QuizSchema.index({ courseId: 1, isPublished: 1 });

export default createModel("Quiz", QuizSchema);
