"use server";

import { AssignmentModel, AssignmentSubmissionModel } from "@/models/lms";
import { connectToDatabase } from "@workspace/common-logic";

interface SubmissionData {
  content: string;
  attachments?: string[];
}

export async function createAssignmentSubmission(
  assignmentId: string,
  userId: string,
  domainId: string,
  data: SubmissionData,
): Promise<any> {
  await connectToDatabase();

  const assignment = await AssignmentModel.findOne({
    _id: assignmentId,
    domain: domainId,
  });
  if (!assignment) {
    throw new Error("Assignment not found");
  }

  if (!assignment.isPublished) {
    throw new Error("Assignment is not published");
  }

  // Check if assignment is overdue
  if (
    assignment.dueDate &&
    new Date() > assignment.dueDate &&
    !assignment.allowLateSubmission
  ) {
    throw new Error(
      "Assignment is overdue and late submissions are not allowed",
    );
  }

  // Check existing submissions
  const existingSubmissions = await AssignmentSubmissionModel.countDocuments({
    assignmentId,
    userId,
    domain: domainId,
    status: { $in: ["submitted", "graded"] },
  });

  if (existingSubmissions >= assignment.maxSubmissions) {
    throw new Error("Maximum submissions reached");
  }

  const submission = await AssignmentSubmissionModel.create({
    assignmentId,
    userId,
    domain: domainId,
    status: "submitted",
    submittedAt: new Date(),
    content: data.content,
    attachments: data.attachments || [],
    resubmissionCount: existingSubmissions,
  });

  return submission;
}

export async function gradeAssignmentSubmission(
  submissionId: string,
  graderId: string,
  gradeData: {
    score: number;
    feedback?: string;
    rubricScores?: Array<{
      criterionId: string;
      score: number;
      feedback?: string;
    }>;
  },
): Promise<any> {
  await connectToDatabase();

  const submission = await AssignmentSubmissionModel.findById(submissionId);
  if (!submission) {
    throw new Error("Submission not found");
  }

  const assignment = await AssignmentModel.findById(submission.assignmentId);
  if (!assignment) {
    throw new Error("Assignment not found");
  }

  // Calculate percentage score
  const percentageScore =
    assignment.totalPoints > 0
      ? (gradeData.score / assignment.totalPoints) * 100
      : 0;

  // Apply late penalty if applicable
  let finalScore = gradeData.score;
  if (assignment.dueDate && submission.submittedAt > assignment.dueDate) {
    const latePenalty = Math.min(
      assignment.latePenalty || 0,
      gradeData.score * (assignment.latePenalty / 100),
    );
    finalScore = Math.max(0, gradeData.score - latePenalty);
  }

  const updatedSubmission = await AssignmentSubmissionModel.findByIdAndUpdate(
    submissionId,
    {
      status: "graded",
      score: finalScore,
      percentageScore: (finalScore / assignment.totalPoints) * 100,
      feedback: gradeData.feedback,
      gradedAt: new Date(),
      gradedBy: graderId,
      latePenaltyApplied:
        finalScore < gradeData.score ? gradeData.score - finalScore : 0,
    },
    { new: true },
  );

  return updatedSubmission;
}

export async function addPeerReview(
  submissionId: string,
  reviewerId: string,
  reviewData: {
    score: number;
    feedback: string;
  },
): Promise<any> {
  await connectToDatabase();

  const submission = await AssignmentSubmissionModel.findById(submissionId);
  if (!submission) {
    throw new Error("Submission not found");
  }

  const assignment = await AssignmentModel.findById(submission.assignmentId);
  if (!assignment || !assignment.peerReviewEnabled) {
    throw new Error("Peer review not enabled for this assignment");
  }

  const peerReview = {
    reviewerId,
    score: reviewData.score,
    feedback: reviewData.feedback,
    reviewedAt: new Date(),
  };

  const updatedSubmission = await AssignmentSubmissionModel.findByIdAndUpdate(
    submissionId,
    { $push: { peerReviews: peerReview } },
    { new: true },
  );

  return updatedSubmission;
}

export async function calculateSubmissionStatistics(
  assignmentId: string,
  domainId: string,
): Promise<{
  totalSubmissions: number;
  averageScore: number;
  submissionRate: number;
  gradeDistribution: Record<string, number>;
}> {
  await connectToDatabase();

  const assignment = await AssignmentModel.findOne({
    _id: assignmentId,
    domain: domainId,
  });
  if (!assignment) {
    throw new Error("Assignment not found");
  }

  const submissions = await AssignmentSubmissionModel.find({
    assignmentId,
    domain: domainId,
    status: "graded",
  });

  const totalSubmissions = submissions.length;
  const averageScore =
    totalSubmissions > 0
      ? submissions.reduce((sum, sub) => sum + (sub.score || 0), 0) /
        totalSubmissions
      : 0;

  // Calculate grade distribution (A, B, C, D, F)
  const gradeDistribution = {
    A: 0, // 90-100%
    B: 0, // 80-89%
    C: 0, // 70-79%
    D: 0, // 60-69%
    F: 0, // Below 60%
  };

  submissions.forEach((sub) => {
    const percentage = sub.percentageScore || 0;
    if (percentage >= 90) gradeDistribution.A++;
    else if (percentage >= 80) gradeDistribution.B++;
    else if (percentage >= 70) gradeDistribution.C++;
    else if (percentage >= 60) gradeDistribution.D++;
    else gradeDistribution.F++;
  });

  return {
    totalSubmissions,
    averageScore,
    submissionRate: 0, // Would need total enrolled students to calculate
    gradeDistribution,
  };
}
