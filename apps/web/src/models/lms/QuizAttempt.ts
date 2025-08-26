import { createModel } from "@workspace/common-logic";
import mongoose, { Schema, Document } from "mongoose";

export type IQuizAttemptStatus =
  | "in_progress"
  | "completed"
  | "abandoned"
  | "graded";
export type IQuizAttemptAnswer = {
  questionId: string;
  answer: any;
  isCorrect?: boolean;
  score?: number;
  feedback?: string;
  timeSpent?: number;
  gradedAt?: Date;
  gradedBy?: string;
};

export interface IQuizAttempt {
  quizId: string;
  userId: string;
  domain: mongoose.Types.ObjectId;
  status: "in_progress" | "completed" | "abandoned" | "graded";
  startedAt: Date;
  completedAt?: Date;
  expiresAt?: Date;
  answers: Array<{
    questionId: string;
    answer: any;
    isCorrect?: boolean;
    score?: number;
    feedback?: string;
    timeSpent?: number;
    gradedAt?: Date;
    gradedBy?: string;
  }>;
  score?: number;
  percentageScore?: number;
  passed?: boolean;
  timeSpent?: number;
  abandonedAt?: Date;
  gradedAt?: Date;
  gradedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

const QuizAttemptSchema = new Schema<IQuizAttempt>(
  {
    domain: { type: mongoose.Schema.Types.ObjectId, required: true },
    quizId: { type: String, required: true, index: true },
    userId: { type: String, required: true, index: true },
    status: {
      type: String,
      required: true,
      enum: ["in_progress", "completed", "abandoned", "graded"],
      default: "in_progress",
    },
    startedAt: { type: Date, required: true, default: Date.now },
    completedAt: { type: Date },
    expiresAt: { type: Date },
    answers: [
      {
        questionId: { type: String, required: true },
        answer: { type: Schema.Types.Mixed },
        isCorrect: { type: Boolean },
        score: { type: Number, min: 0 },
        feedback: { type: String },
        timeSpent: { type: Number, min: 0 },
        gradedAt: { type: Date },
        gradedBy: { type: String },
      },
    ],
    score: { type: Number, min: 0 },
    percentageScore: { type: Number, min: 0, max: 100 },
    passed: { type: Boolean },
    timeSpent: { type: Number, min: 0 },
    abandonedAt: { type: Date },
    gradedAt: { type: Date },
    gradedBy: { type: String },
  },
  {
    timestamps: true,
  },
);

QuizAttemptSchema.index({ quizId: 1, userId: 1, status: 1 });
QuizAttemptSchema.index({ userId: 1, status: 1 });

QuizAttemptSchema.virtual("user", {
  ref: "User",
  localField: "userId",
  foreignField: "userId",
  justOne: true,
});

QuizAttemptSchema.virtual("quiz", {
  ref: "Quiz",
  localField: "quizId",
  foreignField: "_id",
  justOne: true,
});

export default createModel("QuizAttempt", QuizAttemptSchema);
