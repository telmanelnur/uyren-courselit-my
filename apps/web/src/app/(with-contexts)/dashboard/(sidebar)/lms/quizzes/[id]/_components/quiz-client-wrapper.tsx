"use client"

import DashboardContent from "@/components/admin/dashboard-content"
import HeaderTopbar from "@/components/admin/layout/header-topbar"
import { Button } from "@workspace/ui/components/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@workspace/ui/components/tabs"
import QuizPreview from "./quiz-preview"
import QuizQuestions from "./quiz-questions"
import QuizSettings from "./quiz-settings"
import { QuizProvider, useQuizContext } from "./quiz-context"
import { useMemo } from "react"

interface QuizClientWrapperProps {
    initialMode: "create" | "edit"
    quizId: string | null
    initialQuizData?: any
}

function QuizContent() {
    const { 
        mode, 
        status, 
        questions, 
        quiz,
        handleStatusToggle, 
        updateStatusMutation 
    } = useQuizContext()

    const breadcrumbs = useMemo(() => [
        {
            label: "LMS",
            href: `/dashboard/lms`,
        },
        {
            label: "Quizzes",
            href: "/dashboard/lms/quizzes",
        },
        {
            label: mode === "create" ? "New Quiz" : "Edit Quiz",
            href: "#",
        }
    ], [mode])

    return (
        <DashboardContent
            breadcrumbs={breadcrumbs}
        >
            <div className="flex flex-col gap-6">
                <HeaderTopbar
                    backLink={true}
                    header={{
                        title: mode === "create" ? "New Quiz" : "Edit Quiz",
                        subtitle: mode === "create" 
                            ? "Build a new quiz with questions and settings" 
                            : "Edit quiz settings and questions"
                    }}
                    rightAction={
                        <div className="flex items-center gap-2">
                            <Button
                                variant={status === "draft" ? "default" : "outline"}
                                onClick={handleStatusToggle}
                                disabled={updateStatusMutation.isPending || mode === "create"}
                            >
                                {status === "draft" ? "Publish" : "Unpublish"}
                            </Button>
                        </div>
                    }
                />

                <Tabs defaultValue="settings" className="space-y-6">
                    <TabsList>
                        <TabsTrigger value="settings">Quiz Settings</TabsTrigger>
                        <TabsTrigger 
                            value="questions" 
                            disabled={mode === "create"}
                        >
                            Questions ({questions.length})
                        </TabsTrigger>
                        <TabsTrigger 
                            value="preview"
                            disabled={mode === "create"}
                        >
                            Preview
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="settings" className="space-y-6">
                        <QuizSettings />
                    </TabsContent>

                    <TabsContent value="questions" className="space-y-6">
                        {mode === "edit" ? (
                            <QuizQuestions />
                        ) : (
                            <div className="text-center py-8 text-muted-foreground">
                                Save the quiz first to add questions.
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="preview" className="space-y-6">
                        {mode === "edit" ? (
                            <QuizPreview />
                        ) : (
                            <div className="text-center py-8 text-muted-foreground">
                                Save the quiz first to see the preview.
                            </div>
                        )}
                    </TabsContent>
                </Tabs>
            </div>
        </DashboardContent>
    )
}

export default function QuizClientWrapper({ initialMode, quizId, initialQuizData }: QuizClientWrapperProps) {
    return (
        <QuizProvider 
            initialMode={initialMode} 
            quizId={quizId} 
            initialQuizData={initialQuizData}
        >
            <QuizContent />
        </QuizProvider>
    )
}
