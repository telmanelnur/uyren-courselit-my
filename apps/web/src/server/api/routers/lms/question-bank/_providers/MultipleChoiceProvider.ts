import { BaseQuestionProvider, baseQuestionSchema } from "./BaseQuestionProvider";
import { IQuestion, MultipleChoiceQuestion } from "@/models/lms/Question";
import { QuestionAnswer } from "./BaseQuestionProvider";
import { MainContextType } from "@/server/api/core/procedures";
import { z } from "zod";

// Multiple choice specific schema
const multipleChoiceSchema = z.object({
  options: z.array(z.object({
    text: z.string().min(1, "Option text is required"),
    isCorrect: z.boolean(),
    order: z.number().optional(),
  })).min(2, "Multiple choice questions must have at least 2 options"),
  correctAnswers: z.array(z.string()).min(1, "Correct answer is required").optional(),
  settings: z.object({
    // allowMultipleAnswers: z.boolean().optional(),
    // shuffleOptions: z.boolean().optional(),
    // minOptions: z.number().min(2).optional(),
    // maxOptions: z.number().max(6).optional(),
  }).optional(),
});

export class MultipleChoiceProvider extends BaseQuestionProvider<MultipleChoiceQuestion> {
  readonly type = "multiple_choice";
  readonly displayName = "Multiple Choice";
  readonly description = "Single correct answer from multiple options";

  protected getSpecificValidationSchema(): z.ZodObject<z.ZodRawShape> {
    return multipleChoiceSchema;
  }

  protected validateAnswerSpecific(answer: QuestionAnswer, question: MultipleChoiceQuestion): string[] {
    const errors: string[] = [];
    if (!Array.isArray(answer)) {
      errors.push("Answer must be an array of strings");
      return errors;
    }
    if (answer.length === 0) {
      errors.push("Answer cannot be empty");
      return errors;
    }
    answer.forEach((ans, index) => {
      if (typeof ans !== "string") {
        errors.push(`Answer ${index + 1} must be a string`);
      }
    });
    return errors;
  }

  protected normalizeAnswer(answer: QuestionAnswer, _question: MultipleChoiceQuestion) {
    return answer;
  }

  isAnswerCorrect(answer: QuestionAnswer, question: MultipleChoiceQuestion): boolean {
    if (!Array.isArray(answer) || answer.length === 0 || !question.correctAnswers) return false;
    
    const correctAnswers = question.correctAnswers;

    const sortedA = [...answer].sort();
    const sortedB = [...correctAnswers].sort();
    return sortedA.length === sortedB.length && sortedA.every((v, i) => v === sortedB[i]);
  }

  getDefaultSettings(): Record<string, unknown> {
    return {
      ...super.getDefaultSettings(),
      // shuffleOptions: true,
      // allowMultipleAnswers: false,
      // minOptions: 2,
      // maxOptions: 6
    };
  }

  // Override to add multiple choice specific validation
  getValidatedData(questionData: Partial<MultipleChoiceQuestion>, ctx: MainContextType): Partial<MultipleChoiceQuestion> {
    console.log("questionData", questionData);
    // Ensure options are properly formatted
    if (questionData.options) {
      questionData.options = questionData.options
        .filter((opt) => opt.text && opt.text.trim().length > 0)
        .map((opt) => ({
          text: opt.text.trim(),
          isCorrect: Boolean(opt.isCorrect),
          order: opt.order || 0
        }));
    }

    // Extract correct answers from options if not provided
    if (!questionData.correctAnswers && questionData.options) {
      questionData.correctAnswers = questionData.options
        .filter((opt) => opt.isCorrect)
        .map((opt) => opt.text);
    }

    return super.getValidatedData(questionData, ctx);
  }

  // Hide correctness flags for students
  processQuestionForDisplay(question: MultipleChoiceQuestion, hideAnswers: boolean = true): Partial<MultipleChoiceQuestion> {
    const processed = super.processQuestionForDisplay(question, hideAnswers);
    
    // if (hideAnswers && processed.options) {
    //   processed.options = processed.options.map((opt) => {
    //     const { isCorrect, ...rest } = opt;
    //     return rest as { _id?: string; text: string; order?: number };
    //   });
    // }
    
    return processed;
  }
}
