import { IQuestion } from "@/models/lms/Question";
import { MainContextType } from "@/server/api/core/procedures";
import { z } from "zod";

// Base question schema
export const baseQuestionSchema = z.object({
  text: z.string().min(1, "Question text is required"),
  points: z.number().min(1, "Points must be at least 1"),
  explanation: z.string().optional(),
});

// Answer types - only string array
export type QuestionAnswer = string[];

// Answer validation result
export interface AnswerValidationResult {
  isValid: boolean;
  errors: string[];
  normalizedAnswer?: QuestionAnswer;
}

// Answer scoring result
export interface AnswerScoringResult {
  isCorrect: boolean;
  score: number;
  feedback: string;
  partialCredit?: number;
}

export abstract class BaseQuestionProvider<T extends IQuestion = IQuestion> {
  abstract readonly type: T['type'];
  abstract readonly description: string;
  abstract readonly displayName: string;

  // Abstract method for specific validation schema
  protected abstract getSpecificValidationSchema(): z.ZodObject<z.ZodRawShape>;

  // Abstract method for answer-specific validation
  protected abstract validateAnswerSpecific(answer: QuestionAnswer, question: T): string[];

  // Abstract method for answer normalization
  protected abstract normalizeAnswer(answer: QuestionAnswer, question: T): QuestionAnswer;

  // Abstract method for answer validation - must be public to implement interface
  abstract isAnswerCorrect(answer: QuestionAnswer, question: T): boolean;

  // Common validation logic using Zod
  validateQuestion(question: Partial<T>): { isValid: boolean; errors: string[] } {
    try {
      const baseSchema = baseQuestionSchema.partial();
      const specificSchema = this.getSpecificValidationSchema();
      const fullSchema = baseSchema.merge(specificSchema);

      fullSchema.parse(question);
      return { isValid: true, errors: [] };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return {
          isValid: false,
          errors: error.errors.map(e => e.message)
        };
      }
      return {
        isValid: false,
        errors: ["Validation failed"]
      };
    }
  }

  // Default answer validation - can be overridden
  validateAnswer(answer: QuestionAnswer, question: T): AnswerValidationResult {
    const errors: string[] = [];

    if (answer === undefined || answer === null) {
      errors.push("Answer is required");
      return { isValid: false, errors };
    }

    // Call specific validation
    const specificErrors = this.validateAnswerSpecific(answer, question);
    errors.push(...specificErrors);

    return {
      isValid: errors.length === 0,
      errors,
      normalizedAnswer: errors.length === 0 ? this.normalizeAnswer(answer, question) : undefined
    };
  }

  // Get validated and prepared data for model operations
  getValidatedData(questionData: Partial<T>, ctx: MainContextType): Partial<T> {
    try {
      const baseSchema = baseQuestionSchema.partial();
      const specificSchema = this.getSpecificValidationSchema();
      const fullSchema = baseSchema.merge(specificSchema);

      // Add required fields from context
      const dataWithRequired = {
        ...questionData,
        courseId: ctx.domainData.domainObj._id.toString(),
        teacherId: ctx.user._id.toString(),
      };

      // Validate the data
      const validatedData = fullSchema.parse(dataWithRequired);

      // Get default settings and merge with validated data
      const defaultSettings = this.getDefaultSettings();

      return {
        ...defaultSettings,
        ...validatedData,
      } as Partial<T>;
    } catch (error) {
      console.log("error", error);
      if (error instanceof z.ZodError) {
        throw new Error(`Validation failed: ${error.errors.map(e => e.message).join(", ")}`);
      }
      throw new Error("Validation failed");
    }
  }

  // Validate and prepare data for updates
  getValidatedUpdateData(existingQuestion: T, updateData: Partial<T>): Partial<T> {
    try {
      const baseSchema = baseQuestionSchema.partial();
      const specificSchema = this.getSpecificValidationSchema();
      const fullSchema = baseSchema.merge(specificSchema.partial());

      // Merge existing data with update data
      const mergedData = { ...existingQuestion, ...updateData };

      // Validate the merged data
      const validatedData = fullSchema.parse(mergedData);

      return validatedData as Partial<T>;
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new Error(`Validation failed: ${error.errors.map(e => e.message).join(", ")}`);
      }
      throw new Error("Validation failed");
    }
  }

  // Common scoring logic
  calculateScore(answer: QuestionAnswer, question: T): number {
    if (!answer || !question) return 0;

    const isCorrect = this.isAnswerCorrect(answer, question);
    return isCorrect ? question.points : 0;
  }

  // Get scoring result with feedback
  getScoringResult(answer: QuestionAnswer, question: T): AnswerScoringResult {
    const isCorrect = this.isAnswerCorrect(answer, question);
    const score = this.calculateScore(answer, question);

    return {
      isCorrect,
      score,
      feedback: isCorrect ? "Correct!" : "Incorrect",
    };
  }

  // Common display processing
  processQuestionForDisplay(question: T, hideAnswers: boolean = true): Partial<T> {
    const processed = { ...question };

    if (hideAnswers) {
      delete (processed).correctAnswers;
      delete (processed).explanation;
    }

    return processed;
  }

  // Get default settings for question type
  getDefaultSettings(): Record<string, unknown> {
    return {
      points: 1,
      shuffleOptions: true
    };
  }
}
