"use server";

import { QuizModel, QuizAttemptModel, QuestionModel } from "@/models/lms";
import { QuestionProviderFactory } from "@/server/api/routers/lms/question-bank/_providers";
import { connectToDatabase } from "@workspace/common-logic";

interface AnswerSubmission {
  questionId: string;
  answer: string | string[];
  timeSpent?: number;
}

interface EvaluationResult {
  totalScore: number;
  percentageScore: number;
  passed: boolean;
  questionResults: Array<{
    questionId: string;
    answer: any;
    isCorrect: boolean;
    score: number;
    timeSpent: number;
    feedback?: string;
  }>;
}

export async function evaluateQuizSubmission(
  attemptId: string,
  answers: AnswerSubmission[]
): Promise<EvaluationResult> {
  await connectToDatabase();

  const attempt = await QuizAttemptModel.findById(attemptId);
  if (!attempt) {
    throw new Error("Quiz attempt not found");
  }

  const quiz = await QuizModel.findById(attempt.quizId);
  if (!quiz) {
    throw new Error("Quiz not found");
  }

  const questions = await QuestionModel.find({ 
    _id: { $in: quiz.questionIds },
    domain: attempt.domain
  });

  let totalScore = 0;
  const questionResults: any[] = [];

  for (const answerSubmission of answers) {
    const question = questions.find(
      (q: any) => q._id.toString() === answerSubmission.questionId
    );
    
    if (!question) continue;

    const provider = QuestionProviderFactory.getProvider(question.type);
    if (!provider) continue;

    const score = provider.calculateScore(answerSubmission.answer, question);
    const isCorrect = score > 0;

    questionResults.push({
      questionId: answerSubmission.questionId,
      answer: answerSubmission.answer,
      isCorrect,
      score,
      timeSpent: answerSubmission.timeSpent || 0,
      feedback: isCorrect ? "Correct!" : "Incorrect",
    });

    totalScore += score;
  }

  const totalPossiblePoints = questions.reduce(
    (sum: number, q: any) => sum + (q.points || 1), 
    0
  );
  
  const percentageScore = totalPossiblePoints > 0 
    ? (totalScore / totalPossiblePoints) * 100 
    : 0;
    
  const passed = percentageScore >= (quiz.passingScore || 60);

  return {
    totalScore,
    percentageScore,
    passed,
    questionResults,
  };
}

export async function submitQuizAttempt(
  attemptId: string,
  answers: AnswerSubmission[]
): Promise<any> {
  await connectToDatabase();

  const attempt = await QuizAttemptModel.findById(attemptId);
  if (!attempt) {
    throw new Error("Quiz attempt not found");
  }

  if (attempt.status !== "in_progress") {
    throw new Error("Attempt is not in progress");
  }

  if (attempt.expiresAt && new Date() > attempt.expiresAt) {
    throw new Error("Attempt has expired");
  }

  const evaluation = await evaluateQuizSubmission(attemptId, answers);

  const updatedAttempt = await QuizAttemptModel.findByIdAndUpdate(
    attemptId,
    {
      status: "completed",
      completedAt: new Date(),
      answers: evaluation.questionResults,
      score: evaluation.totalScore,
      percentageScore: evaluation.percentageScore,
      passed: evaluation.passed,
      timeSpent: evaluation.questionResults.reduce(
        (sum: number, q: any) => sum + (q.timeSpent || 0), 
        0
      ),
    },
    { new: true }
  );

  return updatedAttempt;
}

export async function startQuizAttempt(
  quizId: string,
  userId: string
): Promise<any> {
  await connectToDatabase();

  const quiz = await QuizModel.findById(quizId);
  if (!quiz || !quiz.isPublished) {
    throw new Error("Quiz not available");
  }

  // Check for existing in-progress attempt
  const activeAttempt = await QuizAttemptModel.findOne({
    quizId,
    userId,
    status: "in_progress",
  });

  if (activeAttempt) {
    return activeAttempt;
  }

  // Check attempt limits
  if (quiz.maxAttempts && quiz.maxAttempts > 0) {
    const attemptCount = await QuizAttemptModel.countDocuments({
      quizId,
      userId,
      status: { $in: ["completed"] },
    });
    
    if (attemptCount >= quiz.maxAttempts) {
      throw new Error("Maximum attempts reached");
    }
  }

  // Create new attempt
  const attempt = await QuizAttemptModel.create({
    quizId,
    userId,
    status: "in_progress",
    startedAt: new Date(),
    expiresAt: quiz.timeLimit 
      ? new Date(Date.now() + quiz.timeLimit * 60 * 1000) 
      : null,
  });

  return attempt;
}

export async function getQuizForAttempt(quizId: string): Promise<any> {
  await connectToDatabase();

  const quiz = await QuizModel.findById(quizId);
  if (!quiz) {
    throw new Error("Quiz not found");
  }

  const questions = await QuestionModel.find({ 
    _id: { $in: quiz.questionIds },
    domain: quiz.domain
  });

  // Process questions for display (hide answers)
  const processedQuestions = questions.map((question: any) => {
    const provider = QuestionProviderFactory.getProvider(question.type);
    if (provider && typeof provider.processQuestionForDisplay === 'function') {
      return provider.processQuestionForDisplay(question, true);
    }
    // Fallback: remove sensitive fields manually
    const processed = question.toObject();
    delete processed.correctAnswers;
    delete processed.explanation;
    if (processed.options) {
      processed.options = processed.options.map((opt: any) => {
        const { isCorrect, explanation, ...rest } = opt;
        return rest;
      });
    }
    return processed;
  });

  return {
    ...quiz.toObject(),
    questions: processedQuestions,
  };
}
