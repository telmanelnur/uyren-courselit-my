"use client"

import { Badge } from "@workspace/ui/components/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card"
import { Clock, FileQuestion, Target } from "lucide-react"
import { useQuizContext } from "./quiz-context"

export default function QuizPreview() {
    const { quiz, questions } = useQuizContext()
    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>{quiz.title || "Untitled Quiz"}</CardTitle>
                    <p className="text-muted-foreground">{quiz.description}</p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        {quiz.timeLimit && (
                            <div className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                {quiz.timeLimit} minutes
                            </div>
                        )}
                        <div className="flex items-center gap-1">
                            <FileQuestion className="h-4 w-4" />
                            {questions.length} questions
                        </div>
                        <div className="flex items-center gap-1">
                            <Target className="h-4 w-4" />
                            {quiz.passingScore}% to pass
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    {questions.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            No questions added yet. Add questions in the Questions tab to see the preview.
                        </div>
                    ) : (
                        questions.map((question, index) => (
                            <div key={question.id || question._id || index} className="space-y-3 p-4 border rounded-lg">
                                <div className="flex items-start justify-between">
                                    <div className="font-medium flex-1">
                                        {index + 1}. {question.text || question.question}
                                    </div>
                                    <Badge variant="secondary" className="ml-2">
                                        {question.points || 0} pts
                                    </Badge>
                                </div>
                                
                                {question.type === "multiple_choice" && question.options && (
                                    <div className="space-y-2 ml-4">
                                        {question.options.map((option: any, optIndex: number) => (
                                            <div key={optIndex} className="flex items-center gap-2">
                                                <div className="w-4 h-4 border rounded-full flex-shrink-0" />
                                                <span className="text-sm">{option.text || option}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                
                                {question.type === "short_answer" && (
                                    <div className="ml-4">
                                        <div className="w-full h-10 border rounded-md bg-muted/50 flex items-center px-3 text-sm text-muted-foreground">
                                            Answer will be typed here...
                                        </div>
                                    </div>
                                )}
                                
                                {question.type === "true_false" && (
                                    <div className="flex gap-4 ml-4">
                                        <div className="flex items-center gap-2">
                                            <div className="w-4 h-4 border rounded-full flex-shrink-0" />
                                            <span className="text-sm">True</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="w-4 h-4 border rounded-full flex-shrink-0" />
                                            <span className="text-sm">False</span>
                                        </div>
                                    </div>
                                )}
                                
                                {question.type === "essay" && (
                                    <div className="ml-4">
                                        <div className="w-full h-20 border rounded-md bg-muted/50 flex items-center px-3 text-sm text-muted-foreground">
                                            Essay answer will be written here...
                                        </div>
                                    </div>
                                )}
                                
                                {question.explanation && (
                                    <div className="ml-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
                                        <div className="text-sm font-medium text-blue-900 mb-1">Explanation:</div>
                                        <div className="text-sm text-blue-800">{question.explanation}</div>
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
