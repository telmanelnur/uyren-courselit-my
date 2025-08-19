"use server";

import { QuizModel, QuizAttemptModel, QuestionModel } from "@/models/lms";
import { QuestionProviderFactory } from "@/server/api/routers/lms/question-bank/_providers";
import { connectToDatabase } from "@workspace/common-logic";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { getDomainData } from "@/lib/domain";
import { Domain } from "@/models/Domain";
import { BASIC_PUBLICATION_STATUS_TYPE } from "@workspace/common-models";
import { 
  AuthenticationException, 
  NotFoundException, 
  ValidationException, 
  ConflictException,
  AuthorizationException 
} from "@/server/api/core/exceptions";
import { IQuizAttempt } from "@/models/lms/QuizAttempt";
import { IQuestion } from "@/models/lms/Question";

// Types
interface ActionContext {
  user: any; // Using any for now to avoid type conflicts with next-auth
  domainData: {
    domainObj: Domain;
    headers: { type: string; host: string; identifier: string; };
  };
}

// Use types from QuizAttempt model
type AnswerSubmission = Pick<IQuizAttempt['answers'][0], 'questionId' | 'answer'>;
type ProcessedAnswer = IQuizAttempt['answers'][0];

interface QuizSubmissionResult {
  success: boolean;
  attemptId: string;
  status: IQuizAttempt['status'];
  score?: number;
  percentageScore?: number;
  passed?: boolean;
  message: string;
  redirectUrl?: string;
}

// Core functions
async function getActionContext(): Promise<ActionContext> {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    throw new AuthenticationException("User not authenticated");
  }

  const domainData = await getDomainData();
  if (!domainData.domainObj) {
    throw new NotFoundException("Domain");
  }

  return { 
    user: session.user, 
    domainData: {
      domainObj: domainData.domainObj,
      headers: domainData.headers
    }
  };
}

async function validateAndProcessAnswers(
  answers: AnswerSubmission[], 
  questions: IQuestion[]
): Promise<{ isValid: boolean; errors: string[]; processedAnswers: ProcessedAnswer[] }> {
  const errors: string[] = [];
  const processedAnswers: ProcessedAnswer[] = [];
  
  if (!Array.isArray(answers) || answers.length === 0) {
    errors.push("At least one answer is required");
    return { isValid: false, errors, processedAnswers: [] };
  }

  for (const answer of answers) {
    if (!answer.questionId || typeof answer.questionId !== 'string') {
      errors.push("Question ID is required and must be a string");
      continue;
    }
    
    if (answer.answer === undefined || answer.answer === null) {
      errors.push("Answer is required");
      continue;
    }

    const question = questions.find(q => q._id?.toString() === answer.questionId);
    if (!question) {
      errors.push(`Question ${answer.questionId} not found`);
      continue;
    }

    const provider = QuestionProviderFactory.getProvider(question.type);
    if (!provider) {
      errors.push(`Question type ${question.type} not supported`);
      continue;
    }

    try {
      // Validate answer using provider
      const validation = provider.validateAnswer(answer.answer, question as any);
      if (!validation.isValid) {
        errors.push(`Invalid answer for question ${answer.questionId}: ${validation.errors.join(", ")}`);
        continue;
      }

      const processedAnswer: ProcessedAnswer = {
        questionId: answer.questionId,
        answer: validation.normalizedAnswer || answer.answer,
      };
      
      processedAnswers.push(processedAnswer);
    } catch (error: any) {
      errors.push(`Invalid answer for question ${answer.questionId}: ${error.message}`);
    }
  }

  return { isValid: errors.length === 0, errors, processedAnswers };
}

// Quiz attempt functions
export async function startQuizAttempt(quizId: string): Promise<QuizSubmissionResult> {
  try {
    await connectToDatabase();
    const ctx = await getActionContext();
    
    const quiz = await QuizModel.findOne({
      _id: quizId,
      domain: ctx.domainData.domainObj._id,
      status: BASIC_PUBLICATION_STATUS_TYPE.PUBLISHED,
    });
    
    if (!quiz) {
      throw new NotFoundException("Quiz", quizId);
    }

    const activeAttempt = await QuizAttemptModel.findOne({
      quizId,
      userId: ctx.user.userId,
      domain: ctx.domainData.domainObj._id,
      status: "in_progress",
    });

    if (activeAttempt) {
      return {
        success: true,
        attemptId: activeAttempt._id.toString(),
        status: activeAttempt.status,
        message: "Resuming existing attempt",
      };
    }

    if (quiz.maxAttempts && quiz.maxAttempts > 0) {
      const attemptCount = await QuizAttemptModel.countDocuments({
        quizId,
        userId: ctx.user.userId,
        domain: ctx.domainData.domainObj._id,
        status: { $in: ["completed", "graded"] },
      });
      
      if (attemptCount >= quiz.maxAttempts) {
        throw new ConflictException("Maximum attempts reached for this quiz");
      }
    }

    const attempt = await QuizAttemptModel.create({
      quizId,
      userId: ctx.user.userId,
      domain: ctx.domainData.domainObj._id,
      status: "in_progress",
      startedAt: new Date(),
      expiresAt: null,
      // expiresAt: quiz.timeLimit && quiz.timeLimit > 0
      //   ? new Date(Date.now() + quiz.timeLimit * 60 * 1000) 
      //   : null,
      answers: [],
    });

    return {
      success: true,
      attemptId: attempt._id.toString(),
      status: attempt.status,
      message: "Quiz attempt started successfully",
    };
  } catch (error: any) {
    return {
      success: false,
      attemptId: "",
      status: "abandoned",
      message: error.message || "Failed to start quiz attempt",
    };
  }
}

export async function submitPartialAnswers(
  attemptId: string,
  answers: AnswerSubmission[],
  redirectUrl?: string
): Promise<QuizSubmissionResult> {
  try {
    await connectToDatabase();
    const ctx = await getActionContext();
    
    const attempt = await QuizAttemptModel.findOne({
      _id: attemptId,
      userId: ctx.user.userId,
      domain: ctx.domainData.domainObj._id,
    });

    if (!attempt) {
      throw new NotFoundException("Quiz attempt", attemptId);
    }

    if (attempt.status !== "in_progress") {
      throw new ConflictException("Attempt is not in progress");
    }

    // Only check expiration if expiresAt is set
    if (attempt.expiresAt && new Date() > attempt.expiresAt) {
      throw new ConflictException("Attempt has expired");
    }

    const quiz = await QuizModel.findById(attempt.quizId);
    if (!quiz) {
      throw new NotFoundException("Quiz", attempt.quizId.toString());
    }

    const questions = await QuestionModel.find({ 
      _id: { $in: quiz.questionIds },
      domain: ctx.domainData.domainObj._id,
    });

    const validation = await validateAndProcessAnswers(answers, questions);
    if (!validation.isValid) {
      throw new ValidationException(`Validation failed: ${validation.errors.join(", ")}`);
    }

    const updatedAnswers = [...attempt.answers];
    
    for (const newAnswer of answers) {
      const existingIndex = updatedAnswers.findIndex(
        (a) => a.questionId === newAnswer.questionId
      );
      
      if (existingIndex >= 0) {
        updatedAnswers[existingIndex] = {
          ...updatedAnswers[existingIndex]!,
          answer: newAnswer.answer,
        };
      } else {
        updatedAnswers.push({
          questionId: newAnswer.questionId,
          answer: newAnswer.answer,
        });
      }
    }

    await QuizAttemptModel.findByIdAndUpdate(attemptId, { answers: updatedAnswers });

    return {
      success: true,
      attemptId: attempt._id.toString(),
      status: "in_progress",
      message: "Partial answers saved successfully",
      redirectUrl,
    };
  } catch (error: any) {
    return {
      success: false,
      attemptId: attemptId,
      status: "abandoned",
      message: error.message || "Failed to save partial answers",
    };
  }
}

export async function submitQuizAttempt(
  attemptId: string,
  answers: AnswerSubmission[],
  autoGrade: boolean = true
): Promise<QuizSubmissionResult> {
  try {
    await connectToDatabase();
    const ctx = await getActionContext();

    const attempt = await QuizAttemptModel.findOne({
      _id: attemptId,
      userId: ctx.user.userId,
      domain: ctx.domainData.domainObj._id,
    });

    if (!attempt) {
      throw new NotFoundException("Quiz attempt", attemptId);
    }

    if (attempt.status !== "in_progress") {
      throw new ConflictException("Attempt is not in progress");
    }

    // Only check expiration if expiresAt is set
    if (attempt.expiresAt && new Date() > attempt.expiresAt) {
      throw new ConflictException("Attempt has expired");
    }

    const quiz = await QuizModel.findById(attempt.quizId);
    if (!quiz) {
      throw new NotFoundException("Quiz", attempt.quizId.toString());
    }

    const questions = await QuestionModel.find({ 
      _id: { $in: quiz.questionIds },
      domain: ctx.domainData.domainObj._id,
    });

    const validation = await validateAndProcessAnswers(answers, questions);
    if (!validation.isValid) {
      throw new ValidationException(`Validation failed: ${validation.errors.join(", ")}`);
    }

    let score = 0;
    let percentageScore = 0;
    let passed = false;
    let gradedAnswers = validation.processedAnswers;

    if (autoGrade) {
      gradedAnswers = validation.processedAnswers.map(answer => {
        const question = questions.find(q => q._id?.toString() === answer.questionId);
        
        if (!question) {
          return { ...answer, isCorrect: false, score: 0, feedback: "Question not found" };
        }

        const provider = QuestionProviderFactory.getProvider(question.type);
        if (!provider) {
          return { ...answer, isCorrect: false, score: 0, feedback: "Question type not supported" };
        }

        const questionScore = provider.calculateScore(answer.answer, question as any);
        const isCorrect = questionScore > 0;

        return {
          ...answer,
          isCorrect,
          score: questionScore,
          feedback: isCorrect ? "Correct!" : "Incorrect",
        };
      });

      score = gradedAnswers.reduce((sum, answer) => sum + (answer.score || 0), 0);
      
      const totalPossiblePoints = questions.reduce((sum, q) => sum + (q.points || 1), 0);
      percentageScore = totalPossiblePoints > 0 ? (score / totalPossiblePoints) * 100 : 0;
      passed = percentageScore >= (quiz.passingScore || 60);
    }

    const updatedAttempt = await QuizAttemptModel.findByIdAndUpdate(
      attemptId,
      {
        status: "completed", // Always mark as completed on final submission
        completedAt: new Date(), // Always set completion date on final submission
        answers: gradedAnswers,
        score: autoGrade ? score : undefined,
        percentageScore: autoGrade ? percentageScore : undefined,
        passed: autoGrade ? passed : undefined,
      },
      { new: true }
    );

    if (!updatedAttempt) {
      throw new NotFoundException("Quiz attempt", attemptId);
    }

    return {
      success: true,
      attemptId: updatedAttempt._id.toString(),
      status: updatedAttempt.status,
      score: updatedAttempt.score,
      percentageScore: updatedAttempt.percentageScore,
      passed: updatedAttempt.passed,
      message: autoGrade 
        ? "Quiz completed and graded successfully" 
        : "Quiz completed successfully (pending grading)",
    };
  } catch (error: any) {
    return {
      success: false,
      attemptId: attemptId,
      status: "abandoned",
      message: error.message || "Failed to submit quiz attempt",
    };
  }
}

export async function getQuizAttempt(attemptId: string): Promise<IQuizAttempt> {
  try {
    await connectToDatabase();
    const ctx = await getActionContext();

    const attempt = await QuizAttemptModel.findOne({
      _id: attemptId,
      userId: ctx.user.userId,
      domain: ctx.domainData.domainObj._id,
    }).populate("quizId");

    if (!attempt) {
      throw new NotFoundException("Quiz attempt", attemptId);
    }

    return attempt;
  } catch (error: any) {
    throw new Error(error.message || "Failed to get quiz attempt");
  }
}

export async function resumeQuizAttempt(attemptId: string): Promise<QuizSubmissionResult> {
  try {
    await connectToDatabase();
    const ctx = await getActionContext();

    const attempt = await QuizAttemptModel.findOne({
      _id: attemptId,
      userId: ctx.user.userId,
      domain: ctx.domainData.domainObj._id,
    });

    if (!attempt) {
      throw new NotFoundException("Quiz attempt", attemptId);
    }

    if (attempt.status !== "in_progress") {
      throw new ConflictException("Attempt cannot be resumed");
    }

    if (attempt.expiresAt && new Date() > attempt.expiresAt) {
      throw new ConflictException("Attempt has expired");
    }

    return {
      success: true,
      attemptId: attempt._id.toString(),
      status: attempt.status,
      message: "Quiz attempt resumed successfully",
    };
  } catch (error: any) {
    return {
      success: false,
      attemptId: attemptId,
      status: "abandoned",
      message: error.message || "Failed to resume quiz attempt",
    };
  }
}

export async function abandonQuizAttempt(attemptId: string): Promise<QuizSubmissionResult> {
  try {
    await connectToDatabase();
    const ctx = await getActionContext();

    const attempt = await QuizAttemptModel.findOne({
      _id: attemptId,
      userId: ctx.user.userId,
      domain: ctx.domainData.domainObj._id,
    });

    if (!attempt) {
      throw new NotFoundException("Quiz attempt", attemptId);
    }

    if (attempt.status !== "in_progress") {
      throw new ConflictException("Attempt is not in progress");
    }

    await QuizAttemptModel.findByIdAndUpdate(attemptId, {
      status: "abandoned",
      abandonedAt: new Date(),
    });

    return {
      success: true,
      attemptId: attempt._id.toString(),
      status: "abandoned",
      message: "Quiz attempt abandoned successfully",
    };
  } catch (error: any) {
    return {
      success: false,
      attemptId: attemptId,
      status: "abandoned",
      message: error.message || "Failed to abandon quiz attempt",
    };
  }
}

export async function getUserQuizAttempts(quizId: string): Promise<IQuizAttempt[]> {
  try {
    await connectToDatabase();
    const ctx = await getActionContext();

    const attempts = await QuizAttemptModel.find({
      quizId,
      userId: ctx.user.userId,
      domain: ctx.domainData.domainObj._id,
    }).sort({ createdAt: -1 });

    return attempts;
  } catch (error: any) {
    throw new Error(error.message || "Failed to get quiz attempts");
  }
}

export async function getAttemptStatistics(quizId: string): Promise<{
  totalAttempts: number;
  completedAttempts: number;
  bestScore: number;
  averageScore: number;
  lastAttempt: IQuizAttempt | null;
}> {
  try {
    await connectToDatabase();
    const ctx = await getActionContext();

    const attempts = await QuizAttemptModel.find({
      quizId,
      userId: ctx.user.userId,
      domain: ctx.domainData.domainObj._id,
    });

    const completedAttempts = attempts.filter(a => a.status === "completed" || a.status === "graded");
    const bestScore = completedAttempts.length > 0 
      ? Math.max(...completedAttempts.map(a => a.percentageScore || 0))
      : 0;
    
    const averageScore = completedAttempts.length > 0
      ? completedAttempts.reduce((sum, a) => sum + (a.percentageScore || 0), 0) / completedAttempts.length
      : 0;

    return {
      totalAttempts: attempts.length,
      completedAttempts: completedAttempts.length,
      bestScore,
      averageScore: Math.round(averageScore * 100) / 100,
      lastAttempt: attempts.length > 0 ? attempts[0] as IQuizAttempt : null,
    };
  } catch (error: any) {
    throw new Error(error.message || "Failed to get attempt statistics");
  }
}

export async function getQuizQuestions(quizId: string): Promise<{
  _id: string;
  title: string;
  description?: string;
  questions: Partial<IQuestion>[];
}> {
  try {
    await connectToDatabase();
    const ctx = await getActionContext();

    const quiz = await QuizModel.findOne({
      _id: quizId,
      domain: ctx.domainData.domainObj._id,
      status: "published",
    });

    if (!quiz) {
      throw new NotFoundException("Quiz", quizId);
    }

    const questions = await QuestionModel.find({ 
      _id: { $in: quiz.questionIds },
      domain: ctx.domainData.domainObj._id,
    });

    const processedQuestions = questions.map((question: IQuestion) => {
      const provider = QuestionProviderFactory.getProvider(question.type);
      if (provider && typeof provider.processQuestionForDisplay === 'function') {
        return provider.processQuestionForDisplay(question as any, true);
      }
      
      // Convert to plain object and remove sensitive fields
      const processed = { ...question };
      delete (processed as any).correctAnswers;
      delete (processed as any).explanation;
      if ((processed as any).options) {
        (processed as any).options = (processed as any).options.map((opt: any) => {
          const { isCorrect, ...rest } = opt;
          return rest;
        });
      }
      return processed;
    });

    return {
      _id: quiz._id.toString(),
      title: quiz.title || "Quiz",
      description: quiz.description,
      questions: processedQuestions,
    };
  } catch (error: any) {
    throw new Error(error.message || "Failed to get quiz questions");
  }
}
