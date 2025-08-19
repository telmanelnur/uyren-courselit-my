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

    // Validate that correct answers have content
    if (question.correctAnswers) {
      question.correctAnswers.forEach((answer: any, index: number) => {
        if (!answer || answer.toString().trim().length === 0) {
          errors.push(`Correct answer ${index + 1} cannot be empty`);
        }
      });
    }

    return errors;
  }

  protected isAnswerCorrect(answer: any, question: any): boolean {
    if (!answer || !question.correctAnswers) return false;
    return question.correctAnswers.some((correct: any) => correct === answer);
  }

  getDefaultSettings(): any {
    return {
      ...super.getDefaultSettings(),
      shuffleOptions: false, // Short answer doesn't have options to shuffle
      caseSensitive: false,
      partialMatch: true,
      minAnswerLength: 1,
      maxAnswerLength: 500
    };
  }

  // Override to add short answer specific validation
  getValidatedData(questionData: any, courseId: string, teacherId: string): any {
    // Ensure correct answers are properly formatted
    if (questionData.correctAnswers) {
      questionData.correctAnswers = questionData.correctAnswers
        .filter((answer: any) => answer && answer.toString().trim().length > 0)
        .map((answer: any) => answer.toString().trim());
    }

    return super.getValidatedData(questionData, courseId, teacherId);
  }

  // Process short answer for display
  processQuestionForDisplay(question: any, hideAnswers: boolean = true): any {
    const processed = { ...question.toObject?.() ?? question };
    
    if (hideAnswers) {
      delete processed.correctAnswers;
      delete processed.explanation;
    }
    
    return processed;
  }
}
