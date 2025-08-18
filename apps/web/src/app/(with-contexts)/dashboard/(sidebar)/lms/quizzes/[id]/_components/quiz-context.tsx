"use client"

import { FormMode } from "@/components/admin/layout/types"
import { IQuiz } from "@/models/lms"
import { trpc } from "@/utils/trpc"
import { useToast } from "@workspace/components-library"
import { zodResolver } from "@hookform/resolvers/zod"
import { createContext, useContext, useEffect, useState, ReactNode } from "react"
import { useForm, UseFormReturn } from "react-hook-form"
import { z } from "zod"
import { useRouter } from "next/navigation"
import { GeneralRouterOutputs } from "@/server/api/types"

// Zod validation schemas


// const QuestionSchema = z.object({
//     text: z.string().min(1, "Question text is required").max(2000, "Question text must be less than 2000 characters"),
//     type: z.enum(["multiple_choice", "short_answer", "true_false", "essay"]),
//     options: z.array(z.object({
//         text: z.string().min(1, "Option text is required"),
//         isCorrect: z.boolean(),
//     })).optional(),
//     correctAnswers: z.array(z.string()).optional(),
//     points: z.number().min(1, "Points must be at least 1").max(100, "Points cannot exceed 100"),
//     explanation: z.string().optional(),
//     difficulty: z.enum(["Easy", "Medium", "Hard"]).default("Easy"),
// })

type QuizType = GeneralRouterOutputs["lmsModule"]["quizModule"]["quiz"]["getById"]

interface QuizContextType {
    intitalData: any;
    quiz: QuizType | null;
    mode: FormMode
    // loadQuizQuery: ReturnType<typeof trpc.lmsModule.quizModule.quiz.getById.useQuery>
    updateStatusMutation: ReturnType<typeof trpc.lmsModule.quizModule.quiz.update.useMutation>
}

const QuizContext = createContext<QuizContextType>({
    intitalData: undefined,
    quiz: null,
    mode: "create",
    updateStatusMutation: (() => {
        throw new Error("updateStatusMutation is not implemented")
    } as any) as any,
})

interface QuizProviderProps {
    children: ReactNode;
    initialData?: any;
    initialMode: FormMode;
}

export function QuizProvider({ children, initialMode, initialData }: QuizProviderProps) {
    const { toast } = useToast()
    const router = useRouter()
    const [mode] = useState<FormMode>(initialMode)
    const [status, setStatus] = useState<IQuiz["status"]>(initialData?.status || "draft")


    const [questions, setQuestions] = useState<any[]>([]

    const loadQuizQuery = trpc.lmsModule.quizModule.quiz.getById.useQuery(
        {
            id: quizId!,
        },
        {
            enabled: mode === "edit" && !!quizId,
        }
    )

    // Create mutation
    const createMutation = trpc.lmsModule.quizModule.quiz.create.useMutation({
        onSuccess: (response) => {
            toast({
                title: "Success",
                description: "Quiz created successfully",
            })
            router.push(`/dashboard/lms/quizzes/${response._id}`)
        },
        onError: (error) => {
            toast({
                title: "Error",
                description: error.message,
                variant: "destructive",
            })
        },
    })
    const updateMutation = trpc.lmsModule.quizModule.quiz.update.useMutation({
        onSuccess: (response) => {
            toast({
                title: "Success",
                description: "Quiz updated successfully",
            })
        },
        onError: (error) => {
            toast({
                title: "Error",
                description: error.message,
                variant: "destructive",
            })
        },
    })

    const updateStatusMutation = trpc.lmsModule.quizModule.quiz.update.useMutation({
        onSuccess: (response) => {
            setStatus(response.status)
            toast({
                title: "Success",
                description: "Quiz status updated successfully",
            })
        },
        onError: (error) => {
            toast({
                title: "Error",
                description: error.message,
                variant: "destructive",
            })
        },
    })

    useEffect(() => {
        if (loadQuizQuery.data && mode === "edit") {
            quizForm.reset({
                title: loadQuizQuery.data.title || "",
                description: loadQuizQuery.data.description || "",
                courseId: loadQuizQuery.data.courseId || "",
                timeLimit: loadQuizQuery.data.timeLimit || 30,
                passingScore: loadQuizQuery.data.passingScore || 70,
                maxAttempts: loadQuizQuery.data.maxAttempts || 3,
                shuffleQuestions: loadQuizQuery.data.shuffleQuestions ?? true,
                showResults: loadQuizQuery.data.showResults ?? false,
                totalPoints: loadQuizQuery.data.totalPoints || 0,
            })
            setStatus(loadQuizQuery.data.status || "draft")
        }
    }, [loadQuizQuery.data, mode, quizForm])


    const handleQuizSubmit = async (data: QuizSettingsFormData) => {
        try {
            if (mode === "create") {
                await createMutation.mutateAsync({
                    data: data
                })
            } else if (mode === "edit" && quizId) {
                await updateMutation.mutateAsync({
                    id: quizId,
                    data: data
                })
            }
        } catch (error) {
            // Error handling is done in mutation callbacks
        }
    }

    const handleQuestionSubmit = async (data: QuestionFormData) => {
        // This will be implemented in the questions component
        console.log("Question submitted:", data)
    }

    const contextValue: QuizContextType = {
        quiz: quizForm.getValues(),
        setQuiz: (quiz) => quizForm.reset(quiz),
        questions,
        setQuestions,
        mode,
        status,
        setStatus,
        quizId,
        quizForm,
        createMutation,
        updateMutation,
        updateStatusMutation,
    }

    return (
        <QuizContext.Provider value={contextValue}>
            {children}
        </QuizContext.Provider>
    )
}

export function useQuizContext() {
    const context = useContext(QuizContext)
    if (context === undefined) {
        throw new Error('useQuizContext must be used within a QuizProvider')
    }
    return context
}
