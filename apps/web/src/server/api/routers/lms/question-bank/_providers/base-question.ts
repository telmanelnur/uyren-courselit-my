import { z } from "zod";

// Base question interface that all question types must implement
export interface BaseQuestionProvider {
  type: string;
  schema: z.ZodSchema<any>;
  validateContent(data: any): { isValid: boolean; errors: string[] };
  getDefaultSettings(): any;
  getValidationRules(): any;
}

// Base question data structure
export interface BaseQuestionData {
  id?: string;
  text: string;
  type: string;
  points: number;
  difficulty: "easy" | "medium" | "hard";
  category?: string;
  tags: string[];
  explanation?: string;
  hints: string[];
  timeLimit?: number;
  isActive: boolean;
  metadata?: Record<string, any>;
}

// Base question settings
export interface BaseQuestionSettings {
  shuffleOptions: boolean;
  allowPartialCredit: boolean;
  maxAttempts: number;
  showFeedback: boolean;
  showCorrectAnswer: boolean;
}

// Base validation result
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

// Abstract base class for question providers
export abstract class BaseQuestionProviderClass implements BaseQuestionProvider {
  abstract type: string;
  abstract schema: z.ZodSchema<any>;

  abstract validateContent(data: any): ValidationResult;
  abstract getDefaultSettings(): BaseQuestionSettings;
  abstract getValidationRules(): any;

  // Common validation methods
  protected validateBasicFields(data: BaseQuestionData): string[] {
    const errors: string[] = [];

    if (!data.text || data.text.trim().length === 0) {
      errors.push("Question text is required");
    }

    if (data.text && data.text.length > 2000) {
      errors.push("Question text must be less than 2000 characters");
    }

    if (data.points < 1) {
      errors.push("Points must be at least 1");
    }

    if (data.points > 100) {
      errors.push("Points cannot exceed 100");
    }

    if (data.timeLimit && data.timeLimit < 1) {
      errors.push("Time limit must be at least 1 second");
    }

    if (data.timeLimit && data.timeLimit > 3600) {
      errors.push("Time limit cannot exceed 1 hour");
    }

    if (data.maxAttempts && data.maxAttempts < 1) {
      errors.push("Max attempts must be at least 1");
    }

    if (data.maxAttempts && data.maxAttempts > 10) {
      errors.push("Max attempts cannot exceed 10");
    }

    return errors;
  }

  protected validateTags(tags: string[]): string[] {
    const errors: string[] = [];

    if (tags.length > 10) {
      errors.push("Cannot have more than 10 tags");
    }

    for (const tag of tags) {
      if (tag.length > 50) {
        errors.push("Tag length cannot exceed 50 characters");
      }
      if (!/^[a-zA-Z0-9\s\-_]+$/.test(tag)) {
        errors.push("Tags can only contain letters, numbers, spaces, hyphens, and underscores");
      }
    }

    return errors;
  }

  // Common settings getter
  getCommonSettings(): Partial<BaseQuestionSettings> {
    return {
      shuffleOptions: true,
      allowPartialCredit: false,
      maxAttempts: 1,
      showFeedback: true,
      showCorrectAnswer: false,
    };
  }

  // Common validation rules
  getCommonValidationRules(): any {
    return {
      text: {
        minLength: 1,
        maxLength: 2000,
        required: true,
      },
      points: {
        min: 1,
        max: 100,
        required: true,
      },
      difficulty: {
        required: true,
        enum: ["easy", "medium", "hard"],
      },
      tags: {
        maxCount: 10,
        maxLength: 50,
        pattern: /^[a-zA-Z0-9\s\-_]+$/,
      },
      timeLimit: {
        min: 1,
        max: 3600,
      },
      maxAttempts: {
        min: 1,
        max: 10,
      },
    };
  }
}
