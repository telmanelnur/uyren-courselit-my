import { BaseQuestionProvider } from "./BaseQuestionProvider";

export class ShortAnswerProvider extends BaseQuestionProvider {
  readonly type = "short_answer";
  readonly displayName = "Short Answer";
  readonly description = "Text-based answer with flexible matching";

  protected validateSpecificFields(question: any): string[] {
    const errors: string[] = [];

    if (!question.correctAnswers || question.correctAnswers.length === 0) {
      errors.push("Correct answer is required");
    }

    return errors;
  }

  protected isAnswerCorrect(answer: any, question: any): boolean {
    if (!answer || !question.correctAnswers) return false;
    
    // For short answer, we can have multiple acceptable answers
    const correctAnswers = Array.isArray(question.correctAnswers) 
      ? question.correctAnswers 
      : [question.correctAnswers];
    
    // Case sensitivity from settings (default false)
    const caseSensitive = Boolean(question.settings?.caseSensitive);
    const normalize = (val: any) => caseSensitive ? val.toString().trim() : val.toString().toLowerCase().trim();
    const normalizedAnswer = normalize(answer);
    return correctAnswers.some(correct => 
      normalize(correct) === normalizedAnswer
    );
  }

  getDefaultSettings(): any {
    return {
      ...super.getDefaultSettings(),
      shuffleOptions: false // Short answer doesn't have options to shuffle
    };
  }
}
