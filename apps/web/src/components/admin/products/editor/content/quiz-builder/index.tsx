import { DEFAULT_PASSING_GRADE } from "@/lib/ui/config//constants";
import {
    LESSON_QUIZ_ADD_QUESTION,
    LESSON_QUIZ_PASSING_GRADE_LABEL,
    LESSON_QUIZ_QUESTION_PLACEHOLDER,
} from "@/lib/ui/config/strings";
import { Question, Quiz } from "@workspace/common-models";
import { Form, FormField, Section } from "@workspace/components-library";
import { Button } from "@workspace/ui/components/button";
import { Label } from "@workspace/ui/components/label";
import { Switch } from "@workspace/ui/components/switch";
import { useEffect, useState } from "react";
import { QuestionBuilder } from "./question-builder";

interface QuizBuilderProps {
    content: Partial<Quiz>;
    onChange: (...args: any[]) => void;
}

export function QuizBuilder({ content, onChange }: QuizBuilderProps) {
    const [questions, setQuestions] = useState<Question[]>(
        (content && content.questions) || [
            {
                text: `${LESSON_QUIZ_QUESTION_PLACEHOLDER} #1`,
                options: [{ text: "", correctAnswer: false }],
            },
        ],
    );
    const [passingGradeRequired, setPassingGradeRequired] = useState(
        (content && content.requiresPassingGrade) || false,
    );
    const [passingGradePercentage, setPassingGradePercentage] = useState(
        (content && content.passingGrade) || DEFAULT_PASSING_GRADE,
    );

    useEffect(() => {
        content.questions && setQuestions(content.questions);
        content.passingGrade && setPassingGradePercentage(content.passingGrade);
        content.requiresPassingGrade &&
            setPassingGradeRequired(content.requiresPassingGrade);
    }, [content]);

    useEffect(() => {
        onChange({
            questions,
            requiresPassingGrade: passingGradeRequired,
            passingGrade: passingGradePercentage,
        });
    }, [questions, passingGradeRequired, passingGradePercentage]);

    const addNewOption = (index: number) => {
        const question = questions[index];
        question && (question.options = [
            ...question.options,
            { text: "", correctAnswer: false },
        ]);
        setQuestions([...questions]);
    };

    const setCorrectAnswer =
        (questionIndex: number) => (index: number, checked: boolean) => {
            const question = questions[questionIndex];
            if (!question) {
                throw new Error("Question not found");
            };
            const option = question.options[index];
            if (!option) {
                throw new Error("Option not found");
            };
            option.correctAnswer = checked;
            setQuestions([...questions]);
        };

    const setOptionText =
        (questionIndex: number) => (index: number, text: string) => {
            const question = questions[questionIndex];
            if (!question) {
                throw new Error("Question not found");
            };
            const option = question.options[index];
            if (!option) {
                throw new Error("Option not found");
            };
            option.text = text;
            setQuestions([...questions]);
        };

    const setQuestionText = (index: number) => (text: string) => {
        const question = questions[index];
        if (!question) {
            throw new Error("Question not found");
        };
        question.text = text;
        setQuestions([...questions]);
    };

    const removeOption = (questionIndex: number) => (index: number) => {
        const question = questions[questionIndex];
        if (!question) {
            throw new Error("Question not found");
        };
        question.options.splice(index, 1);
        setQuestions([...questions]);
    };

    const deleteQuestion = (questionIndex: number) => {
        questions.splice(questionIndex, 1);
        setQuestions([...questions]);
    };

    const addNewQuestion = () =>
        setQuestions([
            ...questions,
            {
                text: `${LESSON_QUIZ_QUESTION_PLACEHOLDER} #${questions.length + 1
                    }`,
                options: [{ text: "", correctAnswer: false }],
            },
        ]);

    return (
        <div className="flex flex-col gap-8 mb-8">
            <Form className="flex flex-col gap-4">
                {questions.map((question: Question, index: number) => (
                    <Section key={index}>
                        <QuestionBuilder
                            details={question}
                            index={index}
                            removeOption={removeOption(index)}
                            setQuestionText={setQuestionText(index)}
                            setOptionText={setOptionText(index)}
                            setCorrectOption={setCorrectAnswer(index)}
                            addNewOption={() => addNewOption(index)}
                            deleteQuestion={deleteQuestion}
                        />
                    </Section>
                ))}
            </Form>
            <div>
                <Button
                    variant="outline"
                    onClick={(e) => {
                        e.preventDefault();
                        addNewQuestion();
                    }}
                >
                    {LESSON_QUIZ_ADD_QUESTION}
                </Button>
            </div>
            <Form className="flex flex-col gap-8">
                <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                        <Label htmlFor="preview" className="font-semibold">
                            Graded Quiz
                        </Label>
                        <p className="text-sm text-muted-foreground">
                            Allow students to preview this lesson
                        </p>
                    </div>
                    <Switch
                        id="preview"
                        checked={passingGradeRequired}
                        onCheckedChange={(checked) =>
                            setPassingGradeRequired(checked)
                        }
                    />
                </div>
                <FormField
                    name="passingGradePercentage"
                    type="number"
                    label={LESSON_QUIZ_PASSING_GRADE_LABEL}
                    value={passingGradePercentage}
                    onChange={(e: any) =>
                        setPassingGradePercentage(parseInt(e.target.value))
                    }
                    disabled={!passingGradeRequired}
                    min={0}
                    max={100}
                />
                {/* <div className="flex items-center gap-2">
                    <Checkbox
                        checked={passingGradeRequired}
                        onChange={(value: boolean) =>
                            setPassingGradeRequired(value)
                        }
                    />
                    <p>{LESSON_QUIZ_GRADED_TEXT}</p>
                </div>
                <FormField
                    type="number"
                    label={LESSON_QUIZ_PASSING_GRADE_LABEL}
                    value={passingGradePercentage}
                    onChange={(e) =>
                        setPassingGradePercentage(parseInt(e.target.value))
                    }
                    disabled={!passingGradeRequired}
                    min={0}
                    max={100}
                /> */}
            </Form>
        </div>
    );
}
