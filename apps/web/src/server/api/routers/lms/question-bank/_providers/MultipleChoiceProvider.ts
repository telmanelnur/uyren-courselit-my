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

    // Validate that options have text
    if (question.options) {
      question.options.forEach((opt: any, index: number) => {
        if (!opt.text || opt.text.trim().length === 0) {
          errors.push(`Option ${index + 1} must have text`);
        }
      });
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
      shuffleOptions: true,
      allowMultipleAnswers: false,
      minOptions: 2,
      maxOptions: 6
    };
  }

  // Override to add multiple choice specific validation
  getValidatedData(questionData: any, courseId: string, teacherId: string): any {
    // Ensure options are properly formatted
    if (questionData.options) {
      questionData.options = questionData.options
        .filter((opt: any) => opt.text && opt.text.trim().length > 0)
        .map((opt: any) => ({
          text: opt.text.trim(),
          isCorrect: Boolean(opt.isCorrect),
          explanation: opt.explanation || ""
        }));
    }

    // Extract correct answers from options if not provided
    if (!questionData.correctAnswers && questionData.options) {
      questionData.correctAnswers = questionData.options
        .filter((opt: any) => opt.isCorrect)
        .map((opt: any) => opt.text);
    }

    return super.getValidatedData(questionData, courseId, teacherId);
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
