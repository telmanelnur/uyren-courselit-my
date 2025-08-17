import { z } from "zod";
import { BaseQuestionProviderClass, ValidationResult, BaseQuestionSettings } from "./base-question";

// Short Answer Question specific data structure
export interface ShortAnswerQuestionData {
  text: string;
  type: "short_answer";
  points: number;
  difficulty: "easy" | "medium" | "hard";
  category?: string;
  tags: string[];
  explanation?: string;
  hints: string[];
  timeLimit?: number;
  isActive: boolean;
  metadata?: Record<string, any>;
  
  // Short Answer specific fields
  answerOptions: ShortAnswerOption[];
  caseSensitive: boolean;
  exactMatch: boolean;
  partialCredit: boolean;
  minWords: number;
  maxWords: number;
  minCharacters: number;
  maxCharacters: number;
  allowMultipleAnswers: boolean;
  showWordCount: boolean;
  showCharacterCount: boolean;
}

// Short Answer Option structure
export interface ShortAnswerOption {
  id: string;
  text: string;
  isCorrect: boolean;
  points: number;
  explanation?: string;
  synonyms: string[]; // Alternative acceptable answers
  order: number;
}

// Short Answer Settings
export interface ShortAnswerSettings extends BaseQuestionSettings {
  caseSensitive: boolean;
  exactMatch: boolean;
  partialCredit: boolean;
  minWords: number;
  maxWords: number;
  minCharacters: number;
  maxCharacters: number;
  allowMultipleAnswers: boolean;
  showWordCount: boolean;
  showCharacterCount: boolean;
}

// Short Answer Schema
export const ShortAnswerSchema = z.object({
  text: z.string().min(1, "Question text is required").max(2000, "Question text must be less than 2000 characters"),
  type: z.literal("short_answer"),
  points: z.number().min(1, "Points must be at least 1").max(100, "Points cannot exceed 100"),
  difficulty: z.enum(["easy", "medium", "hard"]),
  category: z.string().optional(),
  tags: z.array(z.string()).max(10, "Cannot have more than 10 tags"),
  explanation: z.string().optional(),
  hints: z.array(z.string()).default([]),
  timeLimit: z.number().min(1).max(3600).optional(),
  isActive: z.boolean().default(true),
  metadata: z.record(z.any()).optional(),
  
  // Short Answer specific validation
  answerOptions: z.array(z.object({
    id: z.string(),
    text: z.string().min(1, "Answer text is required").max(500, "Answer text must be less than 500 characters"),
    isCorrect: z.boolean(),
    points: z.number().min(0, "Points cannot be negative").max(100, "Points cannot exceed 100"),
    explanation: z.string().optional(),
    synonyms: z.array(z.string()).default([]),
    order: z.number().min(0),
  })).min(1, "Must have at least one answer option").max(20, "Cannot have more than 20 answer options"),
  
  caseSensitive: z.boolean().default(false),
  exactMatch: z.boolean().default(true),
  partialCredit: z.boolean().default(false),
  minWords: z.number().min(0).default(0),
  maxWords: z.number().min(1).default(100),
  minCharacters: z.number().min(0).default(0),
  maxCharacters: z.number().min(1).default(1000),
  allowMultipleAnswers: z.boolean().default(false),
  showWordCount: z.boolean().default(false),
  showCharacterCount: z.boolean().default(false),
});

export class ShortAnswerQuestionProvider extends BaseQuestionProviderClass {
  type = "short_answer";
  schema = ShortAnswerSchema;

  validateContent(data: ShortAnswerQuestionData): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Validate basic fields
    errors.push(...this.validateBasicFields(data));
    errors.push(...this.validateTags(data.tags));

    // Short Answer specific validation
    errors.push(...this.validateAnswerOptions(data.answerOptions));
    errors.push(...this.validateAnswerConstraints(data));
    errors.push(...this.validatePartialCreditSettings(data));

    // Warnings
    if (data.answerOptions.length < 2) {
      warnings.push("Consider having at least 2 answer options for better question quality");
    }

    if (data.maxWords > 50) {
      warnings.push("Very long answers may be difficult to grade consistently");
    }

    if (data.caseSensitive && !data.exactMatch) {
      warnings.push("Case sensitivity without exact match may lead to inconsistent grading");
    }

    if (data.partialCredit && data.answerOptions.length === 1) {
      warnings.push("Partial credit with single answer option may not provide meaningful feedback");
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  private validateAnswerOptions(options: ShortAnswerOption[]): string[] {
    const errors: string[] = [];

    if (options.length === 0) {
      errors.push("Must have at least one answer option");
    }

    if (options.length > 20) {
      errors.push("Cannot have more than 20 answer options");
    }

    // Check for duplicate option IDs
    const optionIds = options.map(opt => opt.id);
    const uniqueIds = new Set(optionIds);
    if (optionIds.length !== uniqueIds.size) {
      errors.push("Answer option IDs must be unique");
    }

    // Check for duplicate answer text
    const answerTexts = options.map(opt => opt.text.trim().toLowerCase());
    const uniqueTexts = new Set(answerTexts);
    if (answerTexts.length !== uniqueTexts.size) {
      errors.push("Answer text must be unique");
    }

    // Validate individual options
    for (const option of options) {
      if (!option.text || option.text.trim().length === 0) {
        errors.push("All answer options must have text");
      }

      if (option.text && option.text.length > 500) {
        errors.push("Answer text must be less than 500 characters");
      }

      if (option.points < 0) {
        errors.push("Answer points cannot be negative");
      }

      if (option.points > 100) {
        errors.push("Answer points cannot exceed 100");
      }

      if (option.order < 0) {
        errors.push("Answer order cannot be negative");
      }

      // Validate synonyms
      for (const synonym of option.synonyms) {
        if (synonym.length > 500) {
          errors.push("Synonym text must be less than 500 characters");
        }
      }
    }

    return errors;
  }

  private validateAnswerConstraints(data: ShortAnswerQuestionData): string[] {
    const errors: string[] = [];

    if (data.minWords < 0) {
      errors.push("Minimum words cannot be negative");
    }

    if (data.maxWords < 1) {
      errors.push("Maximum words must be at least 1");
    }

    if (data.minWords > data.maxWords) {
      errors.push("Minimum words cannot exceed maximum words");
    }

    if (data.minCharacters < 0) {
      errors.push("Minimum characters cannot be negative");
    }

    if (data.maxCharacters < 1) {
      errors.push("Maximum characters must be at least 1");
    }

    if (data.minCharacters > data.maxCharacters) {
      errors.push("Minimum characters cannot exceed maximum characters");
    }

    // Validate that constraints make sense
    if (data.minWords > 0 && data.minCharacters > 0) {
      const avgWordLength = 5; // Estimate
      if (data.minCharacters < data.minWords * avgWordLength) {
        errors.push("Minimum characters should accommodate minimum words");
      }
    }

    if (data.maxWords > 0 && data.maxCharacters > 0) {
      const avgWordLength = 5; // Estimate
      if (data.maxCharacters < data.maxWords * avgWordLength) {
        errors.push("Maximum characters should accommodate maximum words");
      }
    }

    return errors;
  }

  private validatePartialCreditSettings(data: ShortAnswerQuestionData): string[] {
    const errors: string[] = [];

    if (data.partialCredit && data.answerOptions.length === 1) {
      errors.push("Partial credit requires multiple answer options");
    }

    if (data.partialCredit && data.answerOptions.some(opt => opt.points === undefined)) {
      errors.push("Partial credit requires all answer options to have points defined");
    }

    if (data.partialCredit) {
      const totalPoints = data.answerOptions.reduce((sum, opt) => sum + opt.points, 0);
      if (totalPoints !== data.points) {
        errors.push("Total answer option points must equal question points when partial credit is enabled");
      }
    }

    return errors;
  }

  getDefaultSettings(): ShortAnswerSettings {
    return {
      ...this.getCommonSettings(),
      caseSensitive: false,
      exactMatch: true,
      partialCredit: false,
      minWords: 0,
      maxWords: 50,
      minCharacters: 0,
      maxCharacters: 500,
      allowMultipleAnswers: false,
      showWordCount: true,
      showCharacterCount: true,
    };
  }

  getValidationRules(): any {
    return {
      ...this.getCommonValidationRules(),
      answerOptions: {
        minCount: 1,
        maxCount: 20,
        text: {
          minLength: 1,
          maxLength: 500,
          required: true,
        },
        points: {
          min: 0,
          max: 100,
          required: true,
        },
        order: {
          min: 0,
          required: true,
        },
        synonyms: {
          maxCount: 10,
          maxLength: 500,
        },
      },
      constraints: {
        minWords: { min: 0 },
        maxWords: { min: 1 },
        minCharacters: { min: 0 },
        maxCharacters: { min: 1 },
      },
    };
  }

  // Short Answer specific methods
  calculateScore(studentAnswer: string, answerOptions: ShortAnswerOption[], caseSensitive: boolean, exactMatch: boolean): number {
    if (exactMatch) {
      return this.calculateExactMatchScore(studentAnswer, answerOptions, caseSensitive);
    }
    
    return this.calculatePartialMatchScore(studentAnswer, answerOptions, caseSensitive);
  }

  private calculateExactMatchScore(studentAnswer: string, answerOptions: ShortAnswerOption[], caseSensitive: boolean): number {
    const normalizedStudentAnswer = caseSensitive ? studentAnswer.trim() : studentAnswer.trim().toLowerCase();
    
    for (const option of answerOptions) {
      if (option.isCorrect) {
        const normalizedOptionText = caseSensitive ? option.text.trim() : option.text.trim().toLowerCase();
        
        // Check exact match
        if (normalizedStudentAnswer === normalizedOptionText) {
          return option.points;
        }
        
        // Check synonyms
        for (const synonym of option.synonyms) {
          const normalizedSynonym = caseSensitive ? synonym.trim() : synonym.trim().toLowerCase();
          if (normalizedStudentAnswer === normalizedSynonym) {
            return option.points;
          }
        }
      }
    }
    
    return 0;
  }

  private calculatePartialMatchScore(studentAnswer: string, answerOptions: ShortAnswerOption[], caseSensitive: boolean): number {
    const normalizedStudentAnswer = caseSensitive ? studentAnswer.trim() : studentAnswer.trim().toLowerCase();
    let bestScore = 0;
    
    for (const option of answerOptions) {
      if (option.isCorrect) {
        const normalizedOptionText = caseSensitive ? option.text.trim() : option.text.trim().toLowerCase();
        
        // Calculate similarity score
        const similarity = this.calculateSimilarity(normalizedStudentAnswer, normalizedOptionText);
        const score = option.points * similarity;
        
        if (score > bestScore) {
          bestScore = score;
        }
        
        // Check synonyms
        for (const synonym of option.synonyms) {
          const normalizedSynonym = caseSensitive ? synonym.trim() : synonym.trim().toLowerCase();
          const synonymSimilarity = this.calculateSimilarity(normalizedStudentAnswer, normalizedSynonym);
          const synonymScore = option.points * synonymSimilarity;
          
          if (synonymScore > bestScore) {
            bestScore = synonymScore;
          }
        }
      }
    }
    
    return bestScore;
  }

  private calculateSimilarity(str1: string, str2: string): number {
    if (str1 === str2) return 1;
    if (str1.length === 0 || str2.length === 0) return 0;
    
    // Simple Levenshtein distance-based similarity
    const distance = this.levenshteinDistance(str1, str2);
    const maxLength = Math.max(str1.length, str2.length);
    
    return Math.max(0, 1 - (distance / maxLength));
  }

  private levenshteinDistance(str1: string, str2: string): number {
    const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));
    
    for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
    for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;
    
    for (let j = 1; j <= str2.length; j++) {
      for (let i = 1; i <= str1.length; i++) {
        const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1, // deletion
          matrix[j - 1][i] + 1, // insertion
          matrix[j - 1][i - 1] + indicator // substitution
        );
      }
    }
    
    return matrix[str2.length][str1.length];
  }

  validateAnswerConstraints(answer: string, minWords: number, maxWords: number, minChars: number, maxChars: number): string[] {
    const errors: string[] = [];
    
    const wordCount = answer.trim().split(/\s+/).filter(word => word.length > 0).length;
    const charCount = answer.length;
    
    if (minWords > 0 && wordCount < minWords) {
      errors.push(`Answer must have at least ${minWords} words (current: ${wordCount})`);
    }
    
    if (maxWords > 0 && wordCount > maxWords) {
      errors.push(`Answer cannot exceed ${maxWords} words (current: ${wordCount})`);
    }
    
    if (minChars > 0 && charCount < minChars) {
      errors.push(`Answer must have at least ${minChars} characters (current: ${charCount})`);
    }
    
    if (maxChars > 0 && charCount > maxChars) {
      errors.push(`Answer cannot exceed ${maxChars} characters (current: ${charCount})`);
    }
    
    return errors;
  }

  getWordCount(text: string): number {
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
  }

  getCharacterCount(text: string): number {
    return text.length;
  }
}
