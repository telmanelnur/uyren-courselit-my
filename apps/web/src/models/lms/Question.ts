import { createModel } from "@workspace/common-logic"; 
import mongoose, { Document, Schema } from "mongoose";

export type QuestionType = "multiple_choice" | "short_answer";

export interface BaseQuestion {
  _id?: string;
  text: string;
  type: QuestionType;
  points: number;
  explanation?: string;
  teacherId: string;
  domain: mongoose.Types.ObjectId;
  settings?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface MultipleChoiceQuestion extends BaseQuestion {
  type: "multiple_choice";
  options?: Array<{ _id?: string; text: string; isCorrect: boolean; order?: number }>;
  correctAnswers?: string[];
}

export interface ShortAnswerQuestion extends BaseQuestion {
  type: "short_answer";
  correctAnswers?: string[];
}

export type IQuestion = MultipleChoiceQuestion | ShortAnswerQuestion;

const OptionSchema = new Schema({
  text: { type: String, required: true, trim: true, maxlength: 500 },
  isCorrect: { type: Boolean, default: false },
  order: { type: Number, default: 0 }
});

const QuestionSchema = new Schema<IQuestion>({
  domain: { type: mongoose.Schema.Types.ObjectId, required: true },
  text: { type: String, required: true, trim: true, maxlength: 2000 },
  type: { type: String, required: true, enum: ["multiple_choice", "short_answer"] },
  points: { type: Number, required: true, min: 1, max: 100, default: 1 },
  explanation: { type: String, trim: true, maxlength: 2000 },
  teacherId: { type: String, required: true, index: true },
  settings: { type: Schema.Types.Mixed },

  // Multiple choice
  options: { type: [OptionSchema], default: [] },
  correctAnswers: [{ type: String, trim: true }],

}, {
  timestamps: true
});


const QuestionModel = createModel("Question", QuestionSchema);

export default QuestionModel;