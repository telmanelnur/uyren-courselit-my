import { BaseQuestionProvider } from "./BaseQuestionProvider";

export class MultipleChoiceProvider extends BaseQuestionProvider {
  readonly type = "multiple_choice";
  readonly displayName = "Multiple Choice";
  readonly description = "Single correct answer from multiple options";

  protected validateSpecificFields(question: any): string[] {
    const errors: string[] = [];

    if (!question.options || question.options.length < 2) {
      errors.push("Multiple choice questions must have at least 2 options");
    }

    if (!question.correctAnswers || question.correctAnswers.length === 0) {
      errors.push("Correct answer is required");
    }

    // Check that at least one option is marked as correct
    const hasCorrectOption = question.options?.some((opt: any) => opt.isCorrect);
    if (!hasCorrectOption) {
      errors.push("At least one option must be marked as correct");
    }

    return errors;
  }

  protected isAnswerCorrect(answer: any, question: any): boolean {
    if (!answer || !question.correctAnswers) return false;
    
    const correctAnswers: string[] = Array.isArray(question.correctAnswers)
      ? question.correctAnswers
      : [question.correctAnswers];

    if (typeof answer === "string") {
      return correctAnswers.includes(answer);
    }
    if (Array.isArray(answer)) {
      // Strict matching of answers when multiple are allowed (settings.allowMultipleAnswers)
      const allowMultiple = Boolean(question.settings?.allowMultipleAnswers);
      if (!allowMultiple) return false;
      const sortedA = [...answer].sort();
      const sortedB = [...correctAnswers].sort();
      return sortedA.length === sortedB.length && sortedA.every((v, i) => v === sortedB[i]);
    }
    return false;
  }

  getDefaultSettings(): any {
    return {
      ...super.getDefaultSettings(),
      shuffleOptions: true
    };
  }

  // Hide correctness flags for students
  processQuestionForDisplay(question: any, hideAnswers: boolean = true): any {
    const processed = { ...question.toObject?.() ?? question };
    if (hideAnswers) {
      delete processed.correctAnswers;
      delete processed.explanation;
      if (processed.options) {
        processed.options = processed.options.map((opt: any) => {
          const { isCorrect, explanation, ...rest } = opt;
          return rest;
        });
      }
    }
    return processed;
  }
}
