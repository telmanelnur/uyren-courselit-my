import { createModel } from "@workspace/common-logic";
import mongoose, { Schema, Document } from "mongoose";

export interface IAssignment extends Document {
  title: string;
  description?: string;
  courseId: string;
  ownerId: string;
  domain: mongoose.Types.ObjectId;
  assignmentType: "essay" | "project" | "presentation" | "file_upload" | "peer_review";
  dueDate?: Date;
  totalPoints: number;
  instructions?: string;
  requirements: string[];
  attachments: string[];
  isPublished: boolean;
  allowLateSubmission: boolean;
  latePenalty: number;
  maxSubmissions: number;
  allowResubmission: boolean;
  peerReviewEnabled: boolean;
  rubric?: Array<{ criterion: string; points: number; description?: string }>;
  tags: string[];
  category?: string;
  difficulty: "easy" | "medium" | "hard";
  createdAt: Date;
  updatedAt: Date;
}

const RubricCriterionSchema = new Schema({
  criterion: { type: String, required: true, trim: true },
  points: { type: Number, required: true, min: 0 },
  description: { type: String, trim: true }
}, { _id: true });

const AssignmentSchema = new Schema({
  domain: { type: mongoose.Schema.Types.ObjectId, required: true },
  title: { 
    type: String, 
    required: true, 
    trim: true, 
    maxlength: 255 
  },
  description: { 
    type: String, 
    trim: true, 
    maxlength: 2000 
  },
  courseId: { 
    type: String, 
    required: true, 
    index: true 
  },
  ownerId: { 
    type: String, 
    required: true, 
    index: true 
  },
  assignmentType: { 
    type: String, 
    required: true, 
    enum: ["essay", "project", "presentation", "file_upload", "peer_review"] 
  },
  dueDate: { 
    type: Date, 
    index: true 
  },
  totalPoints: { 
    type: Number, 
    required: true, 
    min: 1, 
    default: 100 
  },
  instructions: { type: String, trim: true, maxlength: 5000 },
  requirements: [{ 
    type: String, 
    trim: true, 
    maxlength: 500 
  }],
  attachments: [{ 
    type: String, 
    trim: true 
  }],
  isPublished: { 
    type: Boolean, 
    default: false 
  },
  allowLateSubmission: { 
    type: Boolean, 
    default: false 
  },
  latePenalty: { 
    type: Number, 
    min: 0, 
    max: 100, 
    default: 10 
  },
  maxSubmissions: { 
    type: Number, 
    min: 1, 
    default: 1 
  },
  allowResubmission: { type: Boolean, default: false },
  peerReviewEnabled: { type: Boolean, default: false },
  rubric: [RubricCriterionSchema],
  tags: [{ 
    type: String, 
    trim: true, 
    maxlength: 50 
  }],
  category: { 
    type: String, 
    trim: true 
  },
  difficulty: { type: String, enum: ["easy", "medium", "hard"], default: "medium" },
}, {
  timestamps: true
});

AssignmentSchema.index({ courseId: 1, isPublished: 1 });
AssignmentSchema.index({ ownerId: 1, isPublished: 1 });
AssignmentSchema.index({ assignmentType: 1 });

export default createModel("Assignment", AssignmentSchema);
