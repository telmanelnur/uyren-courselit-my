"use client"

import { Button } from "@workspace/ui/components/button"
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@workspace/ui/components/select"
import { Textarea } from "@workspace/ui/components/textarea"
import { Save } from "lucide-react"
import { useQuizContext } from "./quiz-context"

export default function QuizSettings() {
    const {
        quizForm,
        handleQuizSubmit,
        createMutation,
        updateMutation
    } = useQuizContext()

    const quizForm = useForm<QuizSettingsFormData>({
        resolver: zodResolver(QuizSettingsSchema),
        defaultValues: {
            title: initialData?.title || "",
            description: initialData?.description || "",
            courseId: initialData?.courseId || "",
            timeLimit: initialData?.timeLimit || 30,
            passingScore: initialData?.passingScore || 70,
            maxAttempts: initialData?.maxAttempts || 3,
            shuffleQuestions: initialData?.shuffleQuestions || true,
            showResults: initialData?.showResults || false,
            totalPoints: initialData?.totalPoints || 0,
        }
    })

    const onSubmit = (data: any) => {
        handleQuizSubmit(data)
    }

    const isSaving = createMutation.isPending || updateMutation.isPending

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="flex justify-end">
                <Button type="submit" disabled={isSaving || isSubmitting}>
                    <Save className="h-4 w-4 mr-2" />
                    {isSaving || isSubmitting ? "Saving..." : "Save Settings"}
                </Button>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Basic Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="title">Quiz Title</Label>
                            <Input
                                id="title"
                                {...register("title")}
                                placeholder="Enter quiz title"
                                className={errors.title ? "border-red-500" : ""}
                            />
                            {errors.title && (
                                <p className="text-sm text-red-500">{errors.title.message}</p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                {...register("description")}
                                placeholder="Enter quiz description"
                                rows={3}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="courseId">Course</Label>
                            <Select
                                value={watch("courseId")}
                                onValueChange={(value) => setValue("courseId", value)}
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Select a course" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="1">Introduction to React</SelectItem>
                                    <SelectItem value="2">Advanced JavaScript</SelectItem>
                                    <SelectItem value="3">UI/UX Design Principles</SelectItem>
                                </SelectContent>
                            </Select>
                            {errors.courseId && (
                                <p className="text-sm text-red-500">{errors.courseId.message}</p>
                            )}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Quiz Configuration</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="timeLimit">Time Limit (minutes)</Label>
                                <Input
                                    id="timeLimit"
                                    type="number"
                                    {...register("timeLimit", { valueAsNumber: true })}
                                    className={errors.timeLimit ? "border-red-500" : ""}
                                />
                                {errors.timeLimit && (
                                    <p className="text-sm text-red-500">{errors.timeLimit.message}</p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="passingScore">Passing Score (%)</Label>
                                <Input
                                    id="passingScore"
                                    type="number"
                                    {...register("passingScore", { valueAsNumber: true })}
                                    className={errors.passingScore ? "border-red-500" : ""}
                                />
                                {errors.passingScore && (
                                    <p className="text-sm text-red-500">{errors.passingScore.message}</p>
                                )}
                            </div>
                        </div>
                        <div className="grid sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="maxAttempts">Max Attempts</Label>
                                <Select
                                    value={watch("maxAttempts").toString()}
                                    onValueChange={(value) => setValue("maxAttempts", parseInt(value))}
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="1">1 Attempt</SelectItem>
                                        <SelectItem value="2">2 Attempts</SelectItem>
                                        <SelectItem value="3">3 Attempts</SelectItem>
                                        <SelectItem value="-1">Unlimited</SelectItem>
                                    </SelectContent>
                                </Select>
                                {errors.maxAttempts && (
                                    <p className="text-sm text-red-500">{errors.maxAttempts.message}</p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="totalPoints">Total Points</Label>
                                <Input
                                    id="totalPoints"
                                    type="number"
                                    {...register("totalPoints", { valueAsNumber: true })}
                                    readOnly
                                    className="bg-muted"
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </form>
    )
}