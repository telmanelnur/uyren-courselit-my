import React from "react";
import { Question } from "@workspace/common-models";
import { ExpandLess, ExpandMore } from "@workspace/icons";
import { useState } from "react";
import {
  LESSON_QUIZ_ADD_OPTION_BTN,
  LESSON_QUIZ_CONTENT_HEADER,
  LESSON_QUIZ_OPTION_PLACEHOLDER,
  LESSON_QUIZ_QUESTION_PLACEHOLDER,
  QUESTION_BUILDER_COLLAPSE_TOOLTIP,
  QUESTION_BUILDER_CORRECT_ANS_TOOLTIP,
  QUESTION_BUILDER_DELETE_TOOLTIP,
  QUESTION_BUILDER_EXPAND_TOOLTIP,
} from "@/lib/ui/config/strings";
import {
  Checkbox,
  IconButton,
  Tooltip,
  FormField,
} from "@workspace/components-library";
import { FormEvent } from "react";
import { Button } from "@workspace/ui/components/button";
import { Trash } from "lucide-react";

interface QuestionProps {
  details: Question;
  index: number;
  removeOption: (index: number) => void;
  setQuestionText: (text: string) => void;
  setOptionText: (index: number, text: string) => void;
  setCorrectOption: (index: number, checked: boolean) => void;
  addNewOption: () => void;
  deleteQuestion: (index: number) => void;
}

export function QuestionBuilder({
  details,
  index,
  setOptionText,
  setQuestionText,
  removeOption,
  addNewOption,
  setCorrectOption,
  deleteQuestion,
}: QuestionProps) {
  const [collapsed, setCollapsed] = useState(false);

  if (collapsed) {
    return (
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-sm text-muted-foreground">
          {`${LESSON_QUIZ_CONTENT_HEADER} #${index + 1}`}
        </h3>
        <div className="flex gap-2">
          {index > 0 && (
            <Tooltip title={QUESTION_BUILDER_DELETE_TOOLTIP}>
              <IconButton onClick={() => deleteQuestion(index)}>
                <Trash className="w-4 h-4 text-red-500" />
              </IconButton>
            </Tooltip>
          )}
          <Tooltip title={QUESTION_BUILDER_EXPAND_TOOLTIP}>
            <IconButton onClick={() => setCollapsed(false)}>
              <ExpandMore />
            </IconButton>
          </Tooltip>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-sm text-muted-foreground">
          {`${LESSON_QUIZ_CONTENT_HEADER} #${index + 1}`}
        </h3>
        <div className="flex gap-2">
          {index > 0 && (
            <Tooltip title={QUESTION_BUILDER_DELETE_TOOLTIP}>
              <IconButton
                onClick={(e: FormEvent<HTMLInputElement>) => {
                  e.preventDefault();
                  deleteQuestion(index);
                }}
              >
                <Trash className="w-4 h-4 text-red-500" />
              </IconButton>
            </Tooltip>
          )}
          <Tooltip title={QUESTION_BUILDER_COLLAPSE_TOOLTIP}>
            <IconButton
              onClick={(e: FormEvent<HTMLInputElement>) => {
                e.preventDefault();
                setCollapsed(true);
              }}
            >
              <ExpandLess />
            </IconButton>
          </Tooltip>
        </div>
      </div>
      <FormField
        name="questionText"
        value={details.text}
        onChange={(e: any) => setQuestionText(e.target.value)}
        placeholder={LESSON_QUIZ_QUESTION_PLACEHOLDER}
      />
      {/* <h4 className="font-medium text-slate-500">
                {LESSON_QUIZ_OPTIONS_HEADER}
            </h4> */}
      {details.options.map((option, index) => (
        <div className="flex items-center gap-2" key={index}>
          <Tooltip title={QUESTION_BUILDER_CORRECT_ANS_TOOLTIP}>
            <Checkbox
              checked={option.correctAnswer}
              onChange={(value: boolean) => setCorrectOption(index, value)}
            />
          </Tooltip>
          <FormField
            name="optionText"
            value={option.text}
            onChange={(e: any) => setOptionText(index, e.target.value)}
            placeholder={LESSON_QUIZ_OPTION_PLACEHOLDER}
            className="w-full"
          />
          <IconButton
            onClick={(e: FormEvent<HTMLInputElement>) => {
              e.preventDefault();
              removeOption(index);
            }}
          >
            <Trash className="w-4 h-4 text-red-500" />
          </IconButton>
        </div>
      ))}
      <div>
        <Button
          type="button"
          onClick={(e: any) => {
            e.preventDefault();
            addNewOption();
          }}
          size="sm"
          variant="outline"
          tabIndex={0}
        >
          {LESSON_QUIZ_ADD_OPTION_BTN}
        </Button>
      </div>
    </div>
  );
}
