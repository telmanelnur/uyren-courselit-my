import { BaseQuestionProvider } from "./BaseQuestionProvider";

export class TrueFalseProvider extends BaseQuestionProvider {
  readonly type = "true_false";
  readonly displayName = "True/False";
  readonly description = "Simple true or false answer";

  protected validateSpecificFields(question: any): string[] {
    const errors: string[] = [];

    if (!question.correctAnswers || question.correctAnswers.length === 0) {
      errors.push("Correct answer is required");
    }

    // Validate that correctAnswers contains only "true" or "false"
    const validAnswers = ["true", "false"];
    const hasValidAnswer = question.correctAnswers?.some((answer: any) => 
      validAnswers.includes(answer.toString().toLowerCase())
    );
    
    if (!hasValidAnswer) {
      errors.push("Correct answer must be either 'true' or 'false'");
    }

    // Ensure only one correct answer for true/false
    if (question.correctAnswers && question.correctAnswers.length > 1) {
      errors.push("True/False questions can only have one correct answer");
    }

    return errors;
  }

  protected isAnswerCorrect(answer: any, question: any): boolean {
    if (!answer || !question.correctAnswers) return false;
    
    const correctAnswers = Array.isArray(question.correctAnswers) 
      ? question.correctAnswers 
      : [question.correctAnswers];
    
    // Normalize answers to handle string/boolean variations
    const normalizeAnswer = (val: any) => {
      if (typeof val === "boolean") return val.toString();
      if (typeof val === "string") return val.toLowerCase();
      return val.toString().toLowerCase();
    };
    
    const normalizedAnswer = normalizeAnswer(answer);
    return correctAnswers.some(correct => 
      normalizeAnswer(correct) === normalizedAnswer
    );
  }

  getDefaultSettings(): any {
    return {
      ...super.getDefaultSettings(),
      shuffleOptions: false, // True/false doesn't need shuffling
      points: 1,
      allowPartialCredit: false
    };
  }

  // Override to add true/false specific validation
  getValidatedData(questionData: any, courseId: string, teacherId: string): any {
    // Ensure correct answer is properly formatted
    if (questionData.correctAnswers) {
      questionData.correctAnswers = questionData.correctAnswers
        .filter((answer: any) => answer !== null && answer !== undefined)
        .map((answer: any) => answer.toString().toLowerCase())
        .filter((answer: string) => ["true", "false"].includes(answer));
      
      // Take only the first valid answer for true/false
      if (questionData.correctAnswers.length > 0) {
        questionData.correctAnswers = [questionData.correctAnswers[0]];
      }
    }

    return super.getValidatedData(questionData, courseId, teacherId);
  }

  // Hide correctness flags for students
  processQuestionForDisplay(question: any, hideAnswers: boolean = true): any {
    const processed = { ...question.toObject?.() ?? question };
    if (hideAnswers) {
      delete processed.correctAnswers;
      delete processed.explanation;
    }
    return processed;
  }
}
