import { BaseQuestionProvider, BaseQuestionProviderClass } from "./base-question";
import { MultipleChoiceQuestionProvider } from "./multiple-choice-question";
import { ShortAnswerQuestionProvider } from "./short-answer-question";

// Question provider registry
export class QuestionProviderFactory {
  private static providers = new Map<string, BaseQuestionProviderClass>();

  static {
    // Register all question providers
    QuestionProviderFactory.registerProvider(new MultipleChoiceQuestionProvider());
    QuestionProviderFactory.registerProvider(new ShortAnswerQuestionProvider());
    // Add more providers here as they are created
  }

  static registerProvider(provider: BaseQuestionProviderClass): void {
    QuestionProviderFactory.providers.set(provider.type, provider);
  }

  static getProvider(questionType: string): BaseQuestionProviderClass | null {
    return QuestionProviderFactory.providers.get(questionType) || null;
  }

  static getAllProviders(): BaseQuestionProviderClass[] {
    return Array.from(QuestionProviderFactory.providers.values());
  }

  static getSupportedTypes(): string[] {
    return Array.from(QuestionProviderFactory.providers.keys());
  }

  static validateQuestion(data: any): { isValid: boolean; errors: string[]; warnings: string[] } {
    const provider = QuestionProviderFactory.getProvider(data.type);
    
    if (!provider) {
      return {
        isValid: false,
        errors: [`Unsupported question type: ${data.type}`],
        warnings: [],
      };
    }

    const result = provider.validateContent(data);
    return {
      isValid: result.isValid,
      errors: result.errors,
      warnings: result.warnings,
    };
  }

  static getQuestionSchema(questionType: string): any {
    const provider = QuestionProviderFactory.getProvider(questionType);
    return provider?.schema || null;
  }

  static getDefaultSettings(questionType: string): any {
    const provider = QuestionProviderFactory.getProvider(questionType);
    return provider?.getDefaultSettings() || null;
  }

  static getValidationRules(questionType: string): any {
    const provider = QuestionProviderFactory.getProvider(questionType);
    return provider?.getValidationRules() || null;
  }

  static calculateScore(questionType: string, studentAnswer: any, questionData: any): number {
    const provider = QuestionProviderFactory.getProvider(questionType);
    
    if (!provider) {
      return 0;
    }

    // Type-specific score calculation
    switch (questionType) {
      case "multiple_choice":
        const mcqProvider = provider as MultipleChoiceQuestionProvider;
        return mcqProvider.calculateScore(
          studentAnswer.selectedAnswers || [],
          questionData.correctAnswers || [],
          questionData.options || [],
          questionData.partialCredit || false
        );
      
      case "short_answer":
        const saProvider = provider as ShortAnswerQuestionProvider;
        return saProvider.calculateScore(
          studentAnswer.text || "",
          questionData.answerOptions || [],
          questionData.caseSensitive || false,
          questionData.exactMatch || true
        );
      
      default:
        return 0;
    }
  }

  static processQuestionForDisplay(questionType: string, questionData: any, forStudent: boolean = true): any {
    const provider = QuestionProviderFactory.getProvider(questionType);
    
    if (!provider) {
      return questionData;
    }

    // Process question based on type and context
    switch (questionType) {
      case "multiple_choice":
        return this.processMCQForDisplay(questionData, forStudent);
      
      case "short_answer":
        return this.processShortAnswerForDisplay(questionData, forStudent);
      
      default:
        return questionData;
    }
  }

  private static processMCQForDisplay(questionData: any, forStudent: boolean): any {
    const processed = { ...questionData };
    
    if (forStudent) {
      // Hide correct answers and explanations for students
      delete processed.correctAnswers;
      delete processed.explanation;
      
      // Shuffle options if enabled
      if (processed.randomizeOptions) {
        const mcqProvider = new MultipleChoiceQuestionProvider();
        processed.options = mcqProvider.shuffleOptions(processed.options);
      }
      
      // Hide option explanations
      processed.options = processed.options.map((opt: any) => {
        const { explanation, ...rest } = opt;
        return rest;
      });
    }
    
    return processed;
  }

  private static processShortAnswerForDisplay(questionData: any, forStudent: boolean): any {
    const processed = { ...questionData };
    
    if (forStudent) {
      // Hide correct answers and explanations for students
      delete processed.answerOptions;
      delete processed.explanation;
      
      // Show constraints for student guidance
      if (processed.showWordCount) {
        processed.wordCountInfo = {
          min: processed.minWords,
          max: processed.maxWords,
        };
      }
      
      if (processed.showCharacterCount) {
        processed.characterCountInfo = {
          min: processed.minCharacters,
          max: processed.maxCharacters,
        };
      }
    }
    
    return processed;
  }

  static validateAnswerConstraints(questionType: string, studentAnswer: any, questionData: any): string[] {
    const provider = QuestionProviderFactory.getProvider(questionType);
    
    if (!provider) {
      return ["Unsupported question type"];
    }

    switch (questionType) {
      case "short_answer":
        const saProvider = provider as ShortAnswerQuestionProvider;
        return saProvider.validateAnswerConstraints(
          studentAnswer.text || "",
          questionData.minWords || 0,
          questionData.maxWords || 0,
          questionData.minCharacters || 0,
          questionData.maxCharacters || 0
        );
      
      default:
        return [];
    }
  }

  static getQuestionMetadata(questionType: string): {
    name: string;
    description: string;
    features: string[];
    complexity: "low" | "medium" | "high";
  } {
    const metadata: Record<string, any> = {
      multiple_choice: {
        name: "Multiple Choice Question",
        description: "Question with predefined answer options where students select one or more correct answers",
        features: ["Auto-grading", "Partial credit", "Option shuffling", "Multiple correct answers"],
        complexity: "low",
      },
      short_answer: {
        name: "Short Answer Question",
        description: "Open-ended question requiring brief text responses with configurable constraints",
        features: ["Word/character limits", "Case sensitivity", "Exact/partial matching", "Synonyms support"],
        complexity: "medium",
      },
      // Add more question types here
    };

    return metadata[questionType] || {
      name: "Unknown Question Type",
      description: "Question type not recognized",
      features: [],
      complexity: "low",
    };
  }

  static getQuestionTemplates(questionType: string): any[] {
    const templates: Record<string, any[]> = {
      multiple_choice: [
        {
          name: "Basic MCQ",
          description: "Simple multiple choice with 4 options, 1 correct answer",
          template: {
            text: "What is the capital of France?",
            options: [
              { id: "1", text: "London", isCorrect: false, order: 0 },
              { id: "2", text: "Paris", isCorrect: true, order: 1 },
              { id: "3", text: "Berlin", isCorrect: false, order: 2 },
              { id: "4", text: "Madrid", isCorrect: false, order: 3 },
            ],
            correctAnswers: ["2"],
            allowMultipleAnswers: false,
            partialCredit: false,
          },
        },
        {
          name: "Multiple Correct MCQ",
          description: "Multiple choice with multiple correct answers and partial credit",
          template: {
            text: "Which of the following are programming languages?",
            options: [
              { id: "1", text: "Python", isCorrect: true, points: 25, order: 0 },
              { id: "2", text: "Java", isCorrect: true, points: 25, order: 1 },
              { id: "3", text: "HTML", isCorrect: false, points: 0, order: 2 },
              { id: "4", text: "JavaScript", isCorrect: true, points: 25, order: 3 },
              { id: "5", text: "CSS", isCorrect: false, points: 0, order: 4 },
            ],
            correctAnswers: ["1", "2", "4"],
            allowMultipleAnswers: true,
            partialCredit: true,
            points: 75,
          },
        },
      ],
      short_answer: [
        {
          name: "Basic Short Answer",
          description: "Simple short answer with word and character limits",
          template: {
            text: "What is the main purpose of a database?",
            answerOptions: [
              {
                id: "1",
                text: "To store and organize data",
                isCorrect: true,
                points: 100,
                synonyms: ["Store data", "Organize information", "Data storage"],
                order: 0,
              },
            ],
            minWords: 3,
            maxWords: 15,
            minCharacters: 10,
            maxCharacters: 100,
            caseSensitive: false,
            exactMatch: false,
          },
        },
      ],
    };

    return templates[questionType] || [];
  }
}
