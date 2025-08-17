import { MultipleChoiceProvider } from "./MultipleChoiceProvider";
import { ShortAnswerProvider } from "./ShortAnswerProvider";

export class QuestionProviderFactory {
  private static providers = new Map<string, any>([
    ["multiple_choice", new MultipleChoiceProvider()],
    ["short_answer", new ShortAnswerProvider()],
  ]);

  static getProvider(type: string) {
    return this.providers.get(type);
  }

  static getSupportedTypes(): string[] {
    return Array.from(this.providers.keys());
  }

  static validateQuestion(question: any): { isValid: boolean; errors: string[] } {
    const provider = this.getProvider(question.type);
    if (!provider) {
      return { isValid: false, errors: [`Unsupported question type: ${question.type}`] };
    }
    
    return provider.validateQuestion(question);
  }

  static calculateScore(type: string, answer: any, question: any): number {
    const provider = this.getProvider(type);
    if (!provider) return 0;
    
    return provider.calculateScore(answer, question);
  }

  static processQuestionForDisplay(type: string, question: any, hideAnswers: boolean = true): any {
    const provider = this.getProvider(type);
    if (!provider) return question;
    
    return provider.processQuestionForDisplay(question, hideAnswers);
  }

  static getDefaultSettings(type: string): any {
    const provider = this.getProvider(type);
    if (!provider) return {};
    
    return provider.getDefaultSettings();
  }

  static getQuestionMetadata(type: string): any {
    const provider = this.getProvider(type);
    if (!provider) return null;
    
    return {
      type: provider.type,
      displayName: provider.displayName,
      description: provider.description,
    };
  }
}
