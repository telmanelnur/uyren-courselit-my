"use client"

import { startQuizAttempt, submitQuizAttempt, submitPartialAnswers } from "@/server/actions/quiz-attempt"
import { GeneralRouterOutputs } from "@/server/api/types"
import { trpc } from "@/utils/trpc"
import { useToast } from "@workspace/components-library"
import { Button } from "@workspace/ui/components/button"
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card"
import { Label } from "@workspace/ui/components/label"
import { Progress } from "@workspace/ui/components/progress"
import { Checkbox } from "@workspace/ui/components/checkbox"
import { Input } from "@workspace/ui/components/input"
import { CheckCircle, XCircle, CheckCircle2, Circle } from "lucide-react"
import { useEffect, useState, useCallback } from "react"
import { Skeleton } from "@workspace/ui/components/skeleton"

type QuizType = GeneralRouterOutputs["lmsModule"]["quizModule"]["quiz"]["publicGetByQuizIdWithQuestions"]

interface QuizInterfaceProps {
  initialQuiz: {
    _id: string;
    title: string;
  };
}

export default function QuizInterface({ initialQuiz }: QuizInterfaceProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({})
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [score, setScore] = useState<number | null>(null)
  const [attemptId, setAttemptId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const { toast } = useToast()

  const loadQuizQuery = trpc.lmsModule.quizModule.quiz.publicGetByQuizIdWithQuestions.useQuery(
    {
      quizId: initialQuiz._id,
    },
    {
      enabled: !!initialQuiz._id,
    }
  )
  const quiz = loadQuizQuery.data;
  const isQuizLoading = loadQuizQuery.isLoading;

  // Get current user's quiz attempt to restore state
  const { data: currentAttempt } = trpc.lmsModule.quizModule.quizAttempt.getCurrentUserAttempt.useQuery(
    {
      quizId: initialQuiz._id,
    },
    {
      enabled: !!initialQuiz._id && !!quiz,
    }
  )

  const questions = quiz?.questions || []
  const currentQuestion = questions[currentQuestionIndex]
  const progress = questions.length > 0 ? ((currentQuestionIndex + 1) / questions.length) * 100 : 0

  // Restore answers from existing attempt
  useEffect(() => {
    if (currentAttempt && currentAttempt.answers && currentAttempt.answers.length > 0) {
      const restoredAnswers: Record<string, string | string[]> = {}
      currentAttempt.answers.forEach((answer: any) => {
        restoredAnswers[answer.questionId] = answer.answer
      })
      setAnswers(restoredAnswers)
      setAttemptId(currentAttempt._id.toString())
    }
  }, [currentAttempt])

  // Start quiz attempt on component mount if no existing attempt
  useEffect(() => {
    const initializeQuiz = async () => {
      if (currentAttempt) return // Already have an attempt

      try {
        const result = await startQuizAttempt(`${quiz?._id}`)
        if (result.success) {
          setAttemptId(result.attemptId)
        } else {
          toast({
            title: "Error",
            description: result.message,
            variant: "destructive"
          })
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to start quiz attempt",
          variant: "destructive"
        })
      }
    }

    if (quiz?._id && !attemptId && !currentAttempt) {
      initializeQuiz()
    }
  }, [quiz?._id, attemptId, currentAttempt])

  const saveCurrentAnswers = useCallback(async () => {
    if (!attemptId || Object.keys(answers).length === 0) return

    setIsSaving(true)
    try {
      const answerSubmissions = Object.entries(answers).map(([questionId, answer]) => ({
        questionId,
        answer
      }))

      const result = await submitPartialAnswers(attemptId, answerSubmissions)
      if (!result.success) {
        console.warn("Failed to save partial answers:", result.message)
      }
    } catch (error) {
      console.error("Error saving partial answers:", error)
    } finally {
      setIsSaving(false)
    }
  }, [attemptId, answers])

  const handleAnswerChange = (questionId: string, answer: string | string[]) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }))
  }

  const handleMultipleChoiceChange = (questionId: string, optionId: string, checked: boolean) => {
    const currentAnswers = answers[questionId] as string[] || []
    
    if (checked) {
      // Add option if not already selected
      if (!currentAnswers.includes(optionId)) {
        handleAnswerChange(questionId, [...currentAnswers, optionId])
      }
    } else {
      // Remove option if selected
      handleAnswerChange(questionId, currentAnswers.filter(id => id !== optionId))
    }
  }

  const handleNext = async () => {
    if (currentQuestionIndex < questions.length - 1) {
      await saveCurrentAnswers()
      setCurrentQuestionIndex(prev => prev + 1)
    }
  }

  const handlePrevious = async () => {
    if (currentQuestionIndex > 0) {
      await saveCurrentAnswers()
      setCurrentQuestionIndex(prev => prev - 1)
    }
  }

  const handleQuestionNavigation = async (questionIndex: number) => {
    if (questionIndex !== currentQuestionIndex) {
      await saveCurrentAnswers()
      setCurrentQuestionIndex(questionIndex)
    }
  }

  const handleSubmit = async () => {
    if (!attemptId) return

    setIsLoading(true)
    try {
      const answerSubmissions = Object.entries(answers).map(([questionId, answer]) => ({
        questionId,
        answer
      }))

      // Submit with auto-grading disabled for final submission
      const result = await submitQuizAttempt(attemptId, answerSubmissions, false)

      if (result.success) {
        setScore(result.percentageScore || 0)
        setIsSubmitted(true)
        toast({
          title: "Quiz Submitted",
          description: result.message
        })
      } else {
        toast({
          title: "Error",
          description: result.message,
          variant: "destructive"
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit quiz",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const renderQuestion = (question: any) => {
    if (question.type === "multiple_choice") {
      const currentAnswers = answers[question._id] as string[] || []
      
      return (
        <div className="space-y-3">
          {question.options?.map((option: any) => (
            <div key={option._id} className="flex items-center space-x-3">
              <Checkbox
                id={option._id}
                checked={currentAnswers.includes(option._id)}
                onCheckedChange={(checked) => 
                  handleMultipleChoiceChange(question._id, option._id, checked as boolean)
                }
              />
              <Label 
                htmlFor={option._id} 
                className="cursor-pointer text-base leading-relaxed"
              >
                {option.text}
              </Label>
            </div>
          ))}
        </div>
      )
    }

    if (question.type === "short_answer") {
      return (
        <div className="space-y-2">
          <Input
            placeholder="Enter your answer..."
            value={answers[question._id] as string || ""}
            onChange={(e) => handleAnswerChange(question._id, e.target.value)}
            className="text-base"
          />
        </div>
      )
    }

    return null
  }

  const QuizWrapper = ({ children }: { children: React.ReactNode }) => (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {children}
        </div>
      </div>
    </div>
  )

  if (isQuizLoading || !quiz) {
    return (
      <QuizWrapper>
        <div className="lg:col-span-2">
          <Card className="w-full">
            <CardHeader className="text-center">
              <Skeleton className="h-8 w-64 mx-auto mb-2" />
              <Skeleton className="h-4 w-96 mx-auto mb-4" />
              <Skeleton className="h-2 w-full mb-2" />
              <Skeleton className="h-4 w-32 mx-auto" />
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <Skeleton className="h-6 w-96" />
                  <Skeleton className="h-4 w-20" />
                </div>
                <div className="space-y-3">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </div>
              <div className="flex justify-between pt-4">
                <Skeleton className="h-10 w-24" />
                <Skeleton className="h-10 w-24" />
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="lg:col-span-1">
          <Card className="w-full">
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </CardContent>
          </Card>
        </div>
      </QuizWrapper>
    )
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="text-center">Quiz Results</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">{score}%</div>
              <div className="text-lg mb-2">
                {score && score >= quiz.passingScore ? (
                  <div className="flex items-center justify-center gap-2 text-green-600">
                    <CheckCircle className="w-6 h-6" />
                    Congratulations! You passed!
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2 text-red-600">
                    <XCircle className="w-6 h-6" />
                    You need to score higher to pass.
                  </div>
                )}
              </div>
              <div className="text-sm text-gray-600">
                Passing score: {quiz.passingScore}%
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="text-center">No Questions Available</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center text-gray-600">
              This quiz doesn't have any questions yet.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <QuizWrapper>
      <div className="lg:col-span-2">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-2xl">{quiz.title}</CardTitle>
                {quiz.description && (
                  <p className="text-gray-600 mt-2">{quiz.description}</p>
                )}
              </div>
            </div>
            <Progress value={progress} className="mt-4" />
            <div className="text-sm text-gray-600 mt-2">
              Question {currentQuestionIndex + 1} of {questions.length}
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {currentQuestion && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">
                    {currentQuestion.text}
                  </h3>
                  <span className="text-sm text-gray-500">
                    {currentQuestion.points} point{currentQuestion.points !== 1 ? 's' : ''}
                  </span>
                </div>
                {renderQuestion(currentQuestion)}
              </div>
            )}

                            <div className="flex justify-between pt-4">
                  <Button
                    variant="outline"
                    onClick={handlePrevious}
                    disabled={currentQuestionIndex === 0}
                  >
                    Previous
                  </Button>

                  <Button 
                    onClick={handleNext}
                    disabled={currentQuestionIndex === questions.length - 1}
                  >
                    Next
                  </Button>
                </div>
          </CardContent>
        </Card>
      </div>

      <div className="lg:col-span-1">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Question Navigator</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {questions.map((question, index) => {
              const hasAnswer = answers[question._id] !== undefined
              const isCurrent = index === currentQuestionIndex
              
              return (
                <Button
                  key={question._id}
                  variant={isCurrent ? "default" : "outline"}
                  className={`w-full justify-start h-auto p-3 ${
                    isCurrent ? "bg-blue-600 text-white" : ""
                  }`}
                  onClick={() => handleQuestionNavigation(index)}
                >
                  <div className="flex items-center gap-2 w-full">
                    <div className="flex-shrink-0">
                      {hasAnswer ? (
                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                      ) : (
                        <Circle className="w-4 h-4 text-gray-400" />
                      )}
                    </div>
                    <div className="flex-1 text-left">
                      <div className="font-medium">Q{index + 1}</div>
                      <div className="text-xs text-gray-500 truncate">
                        {question.text.substring(0, 30)}...
                      </div>
                    </div>
                    {isCurrent && (
                      <div className="flex-shrink-0">
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      </div>
                    )}
                  </div>
                </Button>
              )
            })}
            
            {/* Submit Button */}
            <div className="pt-4 border-t">
              <Button
                onClick={handleSubmit}
                className="w-full bg-green-600 hover:bg-green-700"
                disabled={isLoading || Object.keys(answers).length === 0}
              >
                {isLoading ? "Submitting..." : "Submit Quiz"}
              </Button>
              {Object.keys(answers).length === 0 && (
                <p className="text-xs text-gray-500 text-center mt-2">
                  Answer at least one question to submit
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </QuizWrapper>
  )
}
