"use client"

import DashboardContent from "@/components/admin/dashboard-content"
import HeaderTopbar from "@/components/admin/layout/header-topbar"
import { FormMode } from "@/components/admin/layout/types"
import { trpc } from "@/utils/trpc"
import { useToast } from "@workspace/components-library"
import { Button } from "@workspace/ui/components/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@workspace/ui/components/tabs"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@workspace/ui/components/dropdown-menu"
import { useCallback, useMemo } from "react"
import { ChevronDown } from "lucide-react"
import { QuizProvider, useQuizContext } from "./quiz-context"
import QuizQuestions from "./quiz-questions"
import QuizSettings from "./quiz-settings"
import QuizSubmissions from "./quiz-submissions"

interface QuizClientWrapperProps {
    initialMode: FormMode;
    initialQuizData?: any
}

function QuizContent() {
    const {
        mode,
        quiz,
        updateMutation,
    } = useQuizContext()

    const { toast } = useToast()
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

    const handleStatusChange = useCallback(async (newStatus: "draft" | "published" | "archived") => {
        if (!quiz?._id) return;

        try {
            await updateMutation.mutateAsync({
                id: `${quiz._id}`,
                data: { status: newStatus }
            });
        } catch (error) {
            // Error handling is done in the mutation
        }
    }, [quiz])

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
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        variant="outline"
                                        disabled={!quiz || updateMutation.isPending || mode === "create"}
                                        className="flex items-center gap-2"
                                    >
                                        {quiz?.status === "draft" && "Draft"}
                                        {quiz?.status === "published" && "Published"}
                                        {quiz?.status === "archived" && "Archived"}
                                        {!quiz && "Draft"}
                                        <ChevronDown className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem
                                        onClick={() => handleStatusChange("draft")}
                                        disabled={quiz?.status === "draft"}
                                    >
                                        Draft
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        onClick={() => handleStatusChange("published")}
                                        disabled={quiz?.status === "published"}
                                    >
                                        Published
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        onClick={() => handleStatusChange("archived")}
                                        disabled={quiz?.status === "archived"}
                                    >
                                        Archived
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
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
                            Questions
                            {/* ({questions.length}) */}
                        </TabsTrigger>
                        <TabsTrigger
                            value="submissions"
                            disabled={mode === "create"}
                        >
                            Submissions
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

                    <TabsContent value="submissions" className="space-y-6">
                        {mode === "edit" ? (
                            <QuizSubmissions />
                        ) : (
                            <div className="text-center py-8 text-muted-foreground">
                                Save the quiz first to view submissions.
                            </div>
                        )}
                    </TabsContent>
                </Tabs>
            </div>
        </DashboardContent>
    )
}

export default function QuizClientWrapper({ initialMode, initialQuizData }: QuizClientWrapperProps) {
    return (
        <QuizProvider
            initialMode={initialMode}
            initialData={initialQuizData}
        >
            <QuizContent />
        </QuizProvider>
    )
}
