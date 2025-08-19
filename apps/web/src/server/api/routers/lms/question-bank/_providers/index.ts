import { IQuestion } from "@/models/lms/Question";
import { QuestionAnswer } from "./BaseQuestionProvider";
import { MultipleChoiceProvider } from "./MultipleChoiceProvider";
import { ShortAnswerProvider } from "./ShortAnswerProvider";

export class QuestionProviderFactory {
  private static providers = {
    multiple_choice: new MultipleChoiceProvider(),
    short_answer: new ShortAnswerProvider(),
  };

  static getProvider(type: keyof typeof this.providers) {
    return this.providers[type];
  }

  static validateQuestion(question: any): { isValid: boolean; errors: string[] } {
    const provider = this.getProvider(question.type);
    if (!provider) {
      return { isValid: false, errors: [`Unsupported question type: ${question.type}`] };
    }
    return provider.validateQuestion(question);
  }

  static calculateScore(type: keyof typeof this.providers, answer: QuestionAnswer, question: any): number {
    const provider = this.getProvider(type);
    if (!provider) return 0;

    return provider.calculateScore(answer, question);
  }

  static processQuestionForDisplay(type: keyof typeof this.providers, question: any, hideAnswers: boolean = true): Partial<any> {
    const provider = this.getProvider(type);
    if (!provider) return question;

    return provider.processQuestionForDisplay(question, hideAnswers);
  }

  static getDefaultSettings(type: keyof typeof this.providers): Record<string, any> {
    const provider = this.getProvider(type);
    if (!provider) return {};

    return provider.getDefaultSettings();
  }

  static getQuestionMetadata(type: keyof typeof this.providers): { type: string; displayName: string; description: string } | null {
    const provider = this.getProvider(type);
    if (!provider) return null;

    return {
      type: provider.type,
      displayName: provider.displayName,
      description: provider.description,
    };
  }
}
