"use client";

import { useDialogControl } from "@/hooks/use-dialog-control";
import { GeneralRouterOutputs } from "@/server/api/types";
import { trpc } from "@/utils/trpc";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog";
import { ScrollArea } from "@workspace/ui/components/scroll-area";
import { Separator } from "@workspace/ui/components/separator";
import { CheckCircle, Clock, FileQuestion, User, XCircle } from "lucide-react";

type QuizAttemptType =
  GeneralRouterOutputs["lmsModule"]["quizModule"]["quizAttempt"]["getById"];

interface SubmissionDetailDialogProps {
  control: ReturnType<typeof useDialogControl<QuizAttemptType>>;
}

export default function SubmissionDetailDialog({
  control,
}: SubmissionDetailDialogProps) {
  const { data: quizData } = trpc.lmsModule.quizModule.quiz.getById.useQuery(
    { id: control.data?.quizId || "" },
    { enabled: !!control.data?.quizId && control.visible },
  );

  const { data: questionsData } =
    trpc.lmsModule.quizModule.quizQuestions.listQuestions.useQuery(
      {
        filter: { quizId: control.data?.quizId || "" },
        pagination: { skip: 0, take: 100 },
      },
      { enabled: !!control.data?.quizId && control.visible },
    );

  if (!control.data) return null;

  const submission = control.data;
  const questions = questionsData?.items || [];
  const totalPoints = quizData?.totalPoints || 0;
  const percentage = submission.percentageScore || 0;
  const passed = percentage >= (quizData?.passingScore || 60);

  return (
    <Dialog open={control.visible} onOpenChange={control.setVisible}>
      <DialogContent
        className="max-w-6xl h-[90vh] flex flex-col"
        style={{ maxWidth: "90vw" }}
      >
        <ScrollArea className="w-full h-full px-3">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle className="flex items-center gap-2">
              <FileQuestion className="h-5 w-5" />
              Submission Details
            </DialogTitle>
            <DialogDescription>
              {submission.user?.name ||
                submission.user?.email ||
                submission.userId ||
                "Unknown Student"}
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
            {/* Simple User Info */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <User className="h-5 w-5 text-muted-foreground" />
                    <span className="font-medium">
                      {submission.user?.name ||
                        submission.user?.email ||
                        submission.userId ||
                        "Unknown"}
                    </span>
                  </div>
                  <Separator orientation="vertical" className="h-6" />
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      Score:
                    </span>
                    <span className="font-bold text-lg">
                      {submission.score || 0}/{totalPoints}
                    </span>
                    <Badge variant={passed ? "default" : "destructive"}>
                      {percentage}%
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Questions and Answers */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Questions & Answers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {quizData?.questionIds?.map((questionId, index) => {
                    const question = questions.find(
                      (q) => q._id?.toString() === questionId?.toString(),
                    );
                    if (!question) return null;

                    const answer = submission.answers?.find(
                      (a) => a.questionId === questionId?.toString(),
                    );
                    const isCorrect = answer?.isCorrect;
                    const score = answer?.score || 0;

                    return (
                      <div
                        key={questionId?.toString()}
                        className="space-y-4 border rounded-lg p-4"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-3">
                              <span className="font-bold text-lg">
                                Q{index + 1}.
                              </span>
                              <Badge variant="outline">
                                {question.type === "multiple_choice"
                                  ? "Multiple Choice"
                                  : "Short Answer"}
                              </Badge>
                              <Badge variant="outline">
                                {question.points || 0} pts
                              </Badge>
                              {isCorrect !== undefined &&
                                (isCorrect ? (
                                  <Badge
                                    variant="default"
                                    className="bg-green-600"
                                  >
                                    Correct
                                  </Badge>
                                ) : (
                                  <Badge variant="destructive">Incorrect</Badge>
                                ))}
                            </div>
                            <p className="text-base font-medium mb-3">
                              {question.text}
                            </p>

                            {/* Question Details */}
                            <div className="space-y-3">
                              {/* Correct Answer(s) */}
                              <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-md border border-green-200 dark:border-green-800">
                                <div className="text-sm font-medium text-green-800 dark:text-green-200 mb-2">
                                  Correct Answer
                                  {question.type === "multiple_choice" &&
                                  question.options?.filter(
                                    (opt) => opt.isCorrect,
                                  ).length > 1
                                    ? "s"
                                    : ""}
                                  :
                                </div>
                                {question.type === "multiple_choice" ? (
                                  <div className="space-y-1">
                                    {question.options
                                      ?.filter((opt) => opt.isCorrect)
                                      .map((option, optIndex) => (
                                        <div
                                          key={optIndex}
                                          className="flex items-center gap-2 text-sm text-green-700 dark:text-green-300"
                                        >
                                          <CheckCircle className="h-4 w-4 text-green-600" />
                                          {option?.text || ""}
                                        </div>
                                      ))}
                                  </div>
                                ) : (
                                  <div className="space-y-1">
                                    {question.correctAnswers?.map(
                                      (correctAns, ansIndex) => (
                                        <div
                                          key={ansIndex}
                                          className="flex items-center gap-2 text-sm text-green-700 dark:text-green-700"
                                        >
                                          <CheckCircle className="h-4 w-4 text-green-600" />
                                          "{correctAns}"
                                        </div>
                                      ),
                                    )}
                                  </div>
                                )}
                              </div>

                              {/* Student's Answer */}
                              {answer && (
                                <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-md border border-blue-200 dark:border-blue-800">
                                  <div className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">
                                    Student's Answer:
                                  </div>
                                  <div className="space-y-2">
                                    {question.type === "multiple_choice" ? (
                                      <div className="space-y-1">
                                        {Array.isArray(answer.answer) ? (
                                          answer.answer.map(
                                            (ans: string, i: number) => {
                                              const isCorrectAnswer =
                                                question.options?.some(
                                                  (opt) =>
                                                    opt?.text === ans &&
                                                    opt?.isCorrect,
                                                );
                                              return (
                                                <div
                                                  key={i}
                                                  className={`flex items-center gap-2 text-sm ${
                                                    isCorrectAnswer
                                                      ? "text-green-700 dark:text-green-300"
                                                      : "text-red-700 dark:text-red-300"
                                                  }`}
                                                >
                                                  {isCorrectAnswer ? (
                                                    <CheckCircle className="h-4 w-4 text-green-600" />
                                                  ) : (
                                                    <XCircle className="h-4 w-4 text-red-600" />
                                                  )}
                                                  {ans}
                                                </div>
                                              );
                                            },
                                          )
                                        ) : (
                                          <div className="text-sm text-blue-700 dark:text-blue-300">
                                            {answer.answer}
                                          </div>
                                        )}
                                      </div>
                                    ) : (
                                      <div className="space-y-1">
                                        {Array.isArray(answer.answer) ? (
                                          answer.answer.map(
                                            (ans: string, i: number) => {
                                              const isCorrectAnswer =
                                                question.correctAnswers?.some(
                                                  (correctAns) =>
                                                    correctAns
                                                      .toLowerCase()
                                                      .trim() ===
                                                    ans.toLowerCase().trim(),
                                                );
                                              return (
                                                <div
                                                  key={i}
                                                  className={`flex items-center gap-2 text-sm ${
                                                    isCorrectAnswer
                                                      ? "text-green-700 dark:text-green-300"
                                                      : "text-red-700 dark:text-red-300"
                                                  }`}
                                                >
                                                  {isCorrectAnswer ? (
                                                    <CheckCircle className="h-4 w-4 text-green-600" />
                                                  ) : (
                                                    <XCircle className="h-4 w-4 text-red-600" />
                                                  )}
                                                  "{ans}"
                                                </div>
                                              );
                                            },
                                          )
                                        ) : (
                                          <div className="text-sm text-blue-700 dark:text-blue-300">
                                            "{answer.answer}"
                                          </div>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}

                              {/* Score and Feedback */}
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                  <div className="text-sm">
                                    <span className="text-muted-foreground">
                                      Score:{" "}
                                    </span>
                                    <span className="font-medium">
                                      {score}/{question.points || 0}
                                    </span>
                                  </div>
                                  {answer?.feedback && (
                                    <div className="text-sm">
                                      <span className="text-muted-foreground">
                                        Feedback:{" "}
                                      </span>
                                      <span className="italic">
                                        {answer.feedback}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-end p-6 border-t">
            <Button onClick={control.close}>Close</Button>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
