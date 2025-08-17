import { z } from "zod";
import { BaseQuestionProviderClass, ValidationResult, BaseQuestionSettings } from "./base-question";

// Multiple Choice Question specific data structure
export interface MultipleChoiceQuestionData {
  text: string;
  type: "multiple_choice";
  points: number;
  difficulty: "easy" | "medium" | "hard";
  category?: string;
  tags: string[];
  explanation?: string;
  hints: string[];
  timeLimit?: number;
  isActive: boolean;
  metadata?: Record<string, any>;
  
  // MCQ specific fields
  options: MultipleChoiceOption[];
  correctAnswers: string[]; // Array of option IDs that are correct
  allowMultipleAnswers: boolean;
  partialCredit: boolean;
  penaltyForIncorrect: number; // 0-1 scale
  randomizeOptions: boolean;
  showOptionsOrder: boolean;
}

// Multiple Choice Option structure
export interface MultipleChoiceOption {
  id: string;
  text: string;
  isCorrect: boolean;
  explanation?: string;
  points?: number; // For partial credit
  order: number;
}

// MCQ Settings
export interface MCQSettings extends BaseQuestionSettings {
  allowMultipleAnswers: boolean;
  partialCredit: boolean;
  penaltyForIncorrect: number;
  randomizeOptions: boolean;
  showOptionsOrder: boolean;
  minOptions: number;
  maxOptions: number;
}

// MCQ Schema
export const MCQSchema = z.object({
  text: z.string().min(1, "Question text is required").max(2000, "Question text must be less than 2000 characters"),
  type: z.literal("multiple_choice"),
  points: z.number().min(1, "Points must be at least 1").max(100, "Points cannot exceed 100"),
  difficulty: z.enum(["easy", "medium", "hard"]),
  category: z.string().optional(),
  tags: z.array(z.string()).max(10, "Cannot have more than 10 tags"),
  explanation: z.string().optional(),
  hints: z.array(z.string()).default([]),
  timeLimit: z.number().min(1).max(3600).optional(),
  isActive: z.boolean().default(true),
  metadata: z.record(z.any()).optional(),
  
  // MCQ specific validation
  options: z.array(z.object({
    id: z.string(),
    text: z.string().min(1, "Option text is required").max(500, "Option text must be less than 500 characters"),
    isCorrect: z.boolean(),
    explanation: z.string().optional(),
    points: z.number().min(0).optional(),
    order: z.number().min(0),
  })).min(2, "Must have at least 2 options").max(10, "Cannot have more than 10 options"),
  
  correctAnswers: z.array(z.string()).min(1, "Must have at least one correct answer"),
  allowMultipleAnswers: z.boolean().default(false),
  partialCredit: z.boolean().default(false),
  penaltyForIncorrect: z.number().min(0).max(1).default(0),
  randomizeOptions: z.boolean().default(true),
  showOptionsOrder: z.boolean().default(false),
});

export class MultipleChoiceQuestionProvider extends BaseQuestionProviderClass {
  type = "multiple_choice";
  schema = MCQSchema;

  validateContent(data: MultipleChoiceQuestionData): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Validate basic fields
    errors.push(...this.validateBasicFields(data));
    errors.push(...this.validateTags(data.tags));

    // MCQ specific validation
    errors.push(...this.validateOptions(data.options));
    errors.push(...this.validateCorrectAnswers(data.options, data.correctAnswers, data.allowMultipleAnswers));
    errors.push(...this.validatePartialCreditSettings(data));

    // Warnings
    if (data.options.length < 3) {
      warnings.push("Consider having at least 3 options for better question quality");
    }

    if (data.options.length > 6) {
      warnings.push("Too many options may confuse students");
    }

    if (data.penaltyForIncorrect > 0.5) {
      warnings.push("High penalty for incorrect answers may discourage guessing");
    }

    if (data.partialCredit && !data.allowMultipleAnswers) {
      warnings.push("Partial credit is enabled but multiple answers are not allowed");
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  private validateOptions(options: MultipleChoiceOption[]): string[] {
    const errors: string[] = [];

    if (options.length < 2) {
      errors.push("Must have at least 2 options");
    }

    if (options.length > 10) {
      errors.push("Cannot have more than 10 options");
    }

    // Check for duplicate option IDs
    const optionIds = options.map(opt => opt.id);
    const uniqueIds = new Set(optionIds);
    if (optionIds.length !== uniqueIds.size) {
      errors.push("Option IDs must be unique");
    }

    // Check for duplicate option text
    const optionTexts = options.map(opt => opt.text.trim().toLowerCase());
    const uniqueTexts = new Set(optionTexts);
    if (optionTexts.length !== uniqueTexts.size) {
      errors.push("Option text must be unique");
    }

    // Validate individual options
    for (const option of options) {
      if (!option.text || option.text.trim().length === 0) {
        errors.push("All options must have text");
      }

      if (option.text && option.text.length > 500) {
        errors.push("Option text must be less than 500 characters");
      }

      if (option.points && option.points < 0) {
        errors.push("Option points cannot be negative");
      }

      if (option.points && option.points > 100) {
        errors.push("Option points cannot exceed 100");
      }

      if (option.order < 0) {
        errors.push("Option order cannot be negative");
      }
    }

    return errors;
  }

  private validateCorrectAnswers(options: MultipleChoiceOption[], correctAnswers: string[], allowMultiple: boolean): string[] {
    const errors: string[] = [];
    const optionIds = options.map(opt => opt.id);

    if (correctAnswers.length === 0) {
      errors.push("Must have at least one correct answer");
    }

    // Check if all correct answer IDs exist in options
    for (const correctId of correctAnswers) {
      if (!optionIds.includes(correctId)) {
        errors.push(`Correct answer ID '${correctId}' does not exist in options`);
      }
    }

    // If multiple answers not allowed, ensure only one correct answer
    if (!allowMultiple && correctAnswers.length > 1) {
      errors.push("Multiple answers not allowed but multiple correct answers specified");
    }

    // Check if correct answers match options marked as correct
    const correctOptions = options.filter(opt => opt.isCorrect);
    const correctOptionIds = correctOptions.map(opt => opt.id);
    
    if (correctOptionIds.length !== correctAnswers.length) {
      errors.push("Number of correct answers must match number of options marked as correct");
    }

    for (const correctId of correctAnswers) {
      if (!correctOptionIds.includes(correctId)) {
        errors.push(`Correct answer '${correctId}' is not marked as correct in options`);
      }
    }

    return errors;
  }

  private validatePartialCreditSettings(data: MultipleChoiceQuestionData): string[] {
    const errors: string[] = [];

    if (data.partialCredit && !data.allowMultipleAnswers) {
      errors.push("Partial credit requires multiple answers to be enabled");
    }

    if (data.partialCredit && data.options.some(opt => opt.points === undefined)) {
      errors.push("Partial credit requires all options to have points defined");
    }

    if (data.partialCredit) {
      const totalPoints = data.options.reduce((sum, opt) => sum + (opt.points || 0), 0);
      if (totalPoints !== data.points) {
        errors.push("Total option points must equal question points when partial credit is enabled");
      }
    }

    if (data.penaltyForIncorrect < 0 || data.penaltyForIncorrect > 1) {
      errors.push("Penalty for incorrect answers must be between 0 and 1");
    }

    return errors;
  }

  getDefaultSettings(): MCQSettings {
    return {
      ...this.getCommonSettings(),
      allowMultipleAnswers: false,
      partialCredit: false,
      penaltyForIncorrect: 0,
      randomizeOptions: true,
      showOptionsOrder: false,
      minOptions: 2,
      maxOptions: 6,
    };
  }

  getValidationRules(): any {
    return {
      ...this.getCommonValidationRules(),
      options: {
        minCount: 2,
        maxCount: 10,
        text: {
          minLength: 1,
          maxLength: 500,
          required: true,
        },
        points: {
          min: 0,
          max: 100,
        },
        order: {
          min: 0,
          required: true,
        },
      },
      correctAnswers: {
        minCount: 1,
        required: true,
      },
      penaltyForIncorrect: {
        min: 0,
        max: 1,
      },
    };
  }

  // MCQ specific methods
  calculateScore(selectedAnswers: string[], correctAnswers: string[], options: MultipleChoiceOption[], partialCredit: boolean): number {
    if (partialCredit) {
      return this.calculatePartialCreditScore(selectedAnswers, correctAnswers, options);
    }
    
    return this.calculateBinaryScore(selectedAnswers, correctAnswers);
  }

  private calculateBinaryScore(selectedAnswers: string[], correctAnswers: string[]): number {
    const isCorrect = JSON.stringify(selectedAnswers.sort()) === JSON.stringify(correctAnswers.sort());
    return isCorrect ? 1 : 0;
  }

  private calculatePartialCreditScore(selectedAnswers: string[], correctAnswers: string[], options: MultipleChoiceOption[]): number {
    let score = 0;
    
    // Add points for correct selections
    for (const selectedId of selectedAnswers) {
      const option = options.find(opt => opt.id === selectedId);
      if (option && option.isCorrect && option.points) {
        score += option.points;
      }
    }

    // Subtract points for incorrect selections
    for (const selectedId of selectedAnswers) {
      const option = options.find(opt => opt.id === selectedId);
      if (option && !option.isCorrect && option.points) {
        score -= option.points;
      }
    }

    return Math.max(0, score);
  }

  shuffleOptions(options: MultipleChoiceOption[]): MultipleChoiceOption[] {
    if (!this.getDefaultSettings().randomizeOptions) {
      return options;
    }

    const shuffled = [...options];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      shuffled[i].order = i;
      shuffled[j].order = j;
    }

    return shuffled;
  }
}
