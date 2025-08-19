import { createModel } from "@workspace/common-logic";
import mongoose, { Schema, Document } from "mongoose";

export interface IAssignmentSubmission {
  assignmentId: string;
  userId: string;
  domain: mongoose.Types.ObjectId;
  status: "draft" | "submitted" | "graded" | "late";
  submittedAt: Date;
  content: string;
  attachments: string[];
  score?: number;
  percentageScore?: number;
  feedback?: string;
  gradedAt?: Date;
  gradedBy?: string;
  latePenaltyApplied?: number;
  resubmissionCount: number;
  peerReviews?: Array<{ reviewerId: string; score: number; feedback: string; reviewedAt: Date }>;
  createdAt: Date;
  updatedAt: Date;
}

const PeerReviewSchema = new Schema({
  reviewerId: { type: String, required: true },
  score: { type: Number, required: true, min: 0 },
  feedback: { type: String, trim: true, maxlength: 2000 },
  reviewedAt: { type: Date, default: Date.now }
}, { _id: true });

const AssignmentSubmissionSchema = new Schema({
  domain: { type: mongoose.Schema.Types.ObjectId, required: true },
  assignmentId: { type: String, required: true, index: true },
  userId: { type: String, required: true, index: true },
  status: { type: String, required: true, enum: ["draft", "submitted", "graded", "late"], default: "draft" },
  submittedAt: { type: Date, default: Date.now },
  content: { type: String, trim: true, maxlength: 10000 },
  attachments: [{ type: String, trim: true }],
  score: { type: Number, min: 0 },
  percentageScore: { type: Number, min: 0, max: 100 },
  feedback: { type: String, trim: true, maxlength: 2000 },
  gradedAt: { type: Date },
  gradedBy: { type: String },
  latePenaltyApplied: { type: Number, min: 0 },
  resubmissionCount: { type: Number, default: 0 },
  peerReviews: [PeerReviewSchema]
}, {
  timestamps: true
});

AssignmentSubmissionSchema.index({ assignmentId: 1, userId: 1 });
AssignmentSubmissionSchema.index({ userId: 1, status: 1 });
AssignmentSubmissionSchema.index({ assignmentId: 1, status: 1 });

export default createModel<IAssignmentSubmission>("AssignmentSubmission", AssignmentSubmissionSchema);
