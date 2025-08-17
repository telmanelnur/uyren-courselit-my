export abstract class BaseQuestionProvider {
  abstract readonly type: string;
  abstract readonly displayName: string;
  abstract readonly description: string;

  // Common validation logic
  validateQuestion(question: any): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!question.text || question.text.trim().length === 0) {
      errors.push("Question text is required");
    }

    if (!question.points || question.points < 1) {
      errors.push("Points must be at least 1");
    }

    if (!question.courseId) {
      errors.push("Course ID is required");
    }

    if (!question.teacherId) {
      errors.push("Teacher ID is required");
    }

    // Call specific validation
    const specificErrors = this.validateSpecificFields(question);
    errors.push(...specificErrors);

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Abstract method for specific validation
  protected abstract validateSpecificFields(question: any): string[];

  // Common scoring logic
  calculateScore(answer: any, question: any): number {
    if (!answer || !question) return 0;
    
    const isCorrect = this.isAnswerCorrect(answer, question);
    return isCorrect ? question.points : 0;
  }

  // Abstract method for answer validation
  protected abstract isAnswerCorrect(answer: any, question: any): boolean;

  // Common display processing
  processQuestionForDisplay(question: any, hideAnswers: boolean = true): any {
    const processed = { ...question.toObject() };
    
    if (hideAnswers) {
      delete processed.correctAnswer;
      delete processed.explanation;
    }
    
    return processed;
  }

  // Get default settings for question type
  getDefaultSettings(): any {
    return {
      points: 1,
      shuffleOptions: true
    };
  }
}
