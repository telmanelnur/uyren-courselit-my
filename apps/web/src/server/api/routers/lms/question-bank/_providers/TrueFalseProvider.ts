import { BaseQuestionProvider } from "./BaseQuestionProvider";

export class TrueFalseProvider extends BaseQuestionProvider {
  readonly type = "true_false";
  readonly displayName = "True/False";
  readonly description = "Simple true or false question";

  protected validateSpecificFields(question: any): string[] {
    const errors: string[] = [];

    if (!question.correctAnswer || typeof question.correctAnswer !== "boolean") {
      errors.push("Correct answer must be true or false");
    }

    return errors;
  }

  protected isAnswerCorrect(answer: any, question: any): boolean {
    if (typeof answer !== "boolean" || typeof question.correctAnswer !== "boolean") {
      return false;
    }
    
    return answer === question.correctAnswer;
  }

  getDefaultSettings(): any {
    return {
      ...super.getDefaultSettings(),
      shuffleOptions: false // True/false doesn't need shuffling
    };
  }
}
