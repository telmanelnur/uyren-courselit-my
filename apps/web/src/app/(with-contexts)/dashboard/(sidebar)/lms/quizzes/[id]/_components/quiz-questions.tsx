"use client"

import { trpc } from "@/utils/trpc"
import { useToast } from "@workspace/components-library"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@workspace/ui/components/dropdown-menu"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@workspace/ui/components/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@workspace/ui/components/table"
import { Textarea } from "@workspace/ui/components/textarea"
import { Edit, MoreHorizontal, Plus, Save, Trash2 } from "lucide-react"
import { useEffect, useState } from "react"
import { useQuizContext } from "./quiz-context"
import { useFieldArray } from "react-hook-form"

export default function QuizQuestions() {
    const { toast } = useToast()
    const { 
        quiz, 
        questions, 
        setQuestions, 
        quizId, 
        mode,
        questionForm,
        handleQuestionsChange 
    } = useQuizContext()
    
    // Local state for editing index
    const [editingIndex, setEditingIndex] = useState<number | null>(null)

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        watch,
        setValue,
        control,
        reset,
    } = questionForm

    // Use field array for options
    const { fields: options, append, remove } = useFieldArray({
        control,
        name: "options"
    })

    // Fetch questions for the course (question bank)
    const { data: courseQuestions, isLoading: loadingQuestions } = trpc.lmsModule.questionBankModule.question.list.useQuery(
        {
            courseId: quiz.courseId,
            pagination: { skip: 0, take: 100 }
        },
        {
            enabled: !!quiz.courseId && mode === "edit",
        }
    )

    // Create question mutation
    const createQuestionMutation = trpc.lmsModule.questionBankModule.question.create.useMutation({
        onSuccess: (response) => {
            if (response) {
                const newQuestion = { ...response, id: response._id }
                setQuestions(prev => [...prev, newQuestion])
                handleQuestionsChange([...questions, newQuestion])
            }
            reset()
            setEditingIndex(null)
            toast({
                title: "Success",
                description: "Question created successfully",
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

    // Update question mutation
    const updateQuestionMutation = trpc.lmsModule.questionBankModule.question.update.useMutation({
        onSuccess: (response) => {
            if (editingIndex !== null && response) {
                const updatedQuestions = [...questions]
                updatedQuestions[editingIndex] = { ...response, id: response._id }
                setQuestions(updatedQuestions)
                setEditingIndex(null)
                reset()
                toast({
                    title: "Success",
                    description: "Question updated successfully",
                })
                handleQuestionsChange(updatedQuestions)
            }
        },
        onError: (error) => {
            toast({
                title: "Error",
                description: error.message,
                variant: "destructive",
            })
        },
    })

    // Delete question mutation
    const deleteQuestionMutation = trpc.lmsModule.questionBankModule.question.delete.useMutation({
        onSuccess: () => {
            toast({
                title: "Success",
                description: "Question deleted successfully",
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

    // Load questions when course questions are fetched
    useEffect(() => {
        if (courseQuestions?.data) {
            setQuestions(courseQuestions.data.map((q: any) => ({ ...q, id: q._id })))
        }
    }, [courseQuestions, setQuestions])

    const resetCurrentQuestion = () => {
        reset({
            text: "",
            type: "multiple_choice",
            options: [
                { text: "", isCorrect: false },
                { text: "", isCorrect: false },
                { text: "", isCorrect: false },
                { text: "", isCorrect: false }
            ],
            correctAnswers: [""],
            points: 5,
            explanation: "",
            difficulty: "Easy",
        })
    }

    const handleSaveQuestion = async (data: any) => {
        try {
            // Prepare question data based on type
            let questionData: any = {
                text: data.text,
                type: data.type,
                points: data.points,
                explanation: data.explanation,
                courseId: quiz.courseId,
            }

            if (data.type === "multiple_choice") {
                questionData.options = data.options.filter((opt: any) => opt.text.trim() !== "")
                questionData.correctAnswers = data.options
                    .filter((opt: any) => opt.isCorrect)
                    .map((opt: any) => opt.text)
            } else if (data.type === "short_answer") {
                questionData.correctAnswers = data.correctAnswers
            }

            if (editingIndex !== null) {
                const questionToUpdate = questions[editingIndex]
                await updateQuestionMutation.mutateAsync({
                    id: questionToUpdate._id,
                    data: questionData
                })
            } else {
                await createQuestionMutation.mutateAsync(questionData)
            }
        } catch (error) {
            // Error handling is done in mutation callbacks
        }
    }

    const handleEditQuestion = (index: number) => {
        const question = questions[index]
        reset({
            text: question.text || "",
            type: question.type || "multiple_choice",
            options: question.options && question.options.length > 0 ? question.options.map((opt: any) => ({
                text: typeof opt === 'string' ? opt : (opt?.text || ""),
                isCorrect: typeof opt === 'object' ? (opt?.isCorrect || false) : false
            } as { text: string; isCorrect: boolean })) : [
                { text: "", isCorrect: false },
                { text: "", isCorrect: false },
                { text: "", isCorrect: false },
                { text: "", isCorrect: false }
            ],
            correctAnswers: question.correctAnswers || [""],
            points: question.points || 5,
            explanation: question.explanation || "",
            difficulty: question.difficulty || "Easy",
        })
        setEditingIndex(index)
    }

    const handleDeleteQuestion = async (index: number) => {
        const question = questions[index]
        try {
            await deleteQuestionMutation.mutateAsync(question._id)
            const updatedQuestions = questions.filter((_, i) => i !== index)
            setQuestions(updatedQuestions)
            handleQuestionsChange(updatedQuestions)
        } catch (error) {
            // Error handling is done in mutation callbacks
        }
    }

    const addOption = () => {
        append({ text: "", isCorrect: false })
    }

    const removeOption = (index: number) => {
        if (options.length > 2) {
            remove(index)
        }
    }

    const updateOption = (index: number, field: 'text' | 'isCorrect', value: string | boolean) => {
        setValue(`options.${index}.${field}`, value)
    }

    const isLoading = createQuestionMutation.isPending || updateQuestionMutation.isPending || deleteQuestionMutation.isPending

    return (
        <div className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
                {/* Question Editor */}
                <Card>
                    <CardHeader>
                        <CardTitle>{editingIndex !== null ? "Edit Question" : "Add Question"}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <form onSubmit={handleSubmit(handleSaveQuestion)}>
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="text">Question Text</Label>
                                    <Textarea
                                        id="text"
                                        {...register("text")}
                                        placeholder="Enter your question..."
                                        rows={3}
                                        className={errors.text ? "border-red-500" : ""}
                                    />
                                    {errors.text && (
                                        <p className="text-sm text-red-500">{errors.text.message}</p>
                                    )}
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="type">Question Type</Label>
                                        <Select
                                            value={watch("type")}
                                            onValueChange={(value) => setValue("type", value as any)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="multiple_choice">Multiple Choice</SelectItem>
                                                <SelectItem value="short_answer">Short Answer</SelectItem>
                                                <SelectItem value="true_false">True/False</SelectItem>
                                                <SelectItem value="essay">Essay</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="points">Points</Label>
                                        <Input
                                            id="points"
                                            type="number"
                                            min="1"
                                            max="100"
                                            {...register("points", { valueAsNumber: true })}
                                            className={errors.points ? "border-red-500" : ""}
                                        />
                                        {errors.points && (
                                            <p className="text-sm text-red-500">{errors.points.message}</p>
                                        )}
                                    </div>
                                </div>

                                <div className="border-t pt-4">
                                    <h4 className="font-medium mb-3">Question Details</h4>

                                    {watch("type") === "multiple_choice" && (
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between">
                                                <Label>Answer Options</Label>
                                                <Button type="button" variant="outline" size="sm" onClick={addOption}>
                                                    <Plus className="h-4 w-4 mr-2" />
                                                    Add Option
                                                </Button>
                                            </div>

                                            <div className="space-y-2">
                                                {options.map((option, index) => (
                                                    <div key={option.id} className="flex items-center gap-2">
                                                        <input
                                                            type="checkbox"
                                                            checked={option.isCorrect || false}
                                                            onChange={(e) => updateOption(index, "isCorrect", e.target.checked)}
                                                            className="rounded"
                                                        />
                                                        <Input
                                                            {...register(`options.${index}.text`)}
                                                            placeholder={`Option ${index + 1}`}
                                                            className="flex-1"
                                                        />
                                                        {options.length > 2 && (
                                                            <Button type="button" variant="ghost" size="icon" onClick={() => removeOption(index)}>
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {watch("type") === "short_answer" && (
                                        <div className="space-y-2">
                                            <Label htmlFor="correctAnswers">Expected Answer</Label>
                                            <Input
                                                id="correctAnswers"
                                                {...register("correctAnswers.0")}
                                                placeholder="Enter the expected answer..."
                                            />
                                        </div>
                                    )}

                                    {watch("type") === "true_false" && (
                                        <div className="space-y-2">
                                            <Label>Correct Answer</Label>
                                            <div className="flex gap-4">
                                                <div className="flex items-center space-x-2">
                                                    <input
                                                        type="radio"
                                                        value="true"
                                                        {...register("correctAnswers.0")}
                                                    />
                                                    <Label>True</Label>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <input
                                                        type="radio"
                                                        value="false"
                                                        {...register("correctAnswers.0")}
                                                    />
                                                    <Label>False</Label>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {watch("type") === "essay" && (
                                        <div className="space-y-2">
                                            <Label htmlFor="explanation">Grading Rubric</Label>
                                            <Textarea
                                                id="explanation"
                                                {...register("explanation")}
                                                placeholder="Enter grading criteria and expectations..."
                                                rows={3}
                                            />
                                        </div>
                                    )}

                                    <div className="space-y-2">
                                        <Label htmlFor="explanation">Explanation (Optional)</Label>
                                        <Textarea
                                            id="explanation"
                                            {...register("explanation")}
                                            placeholder="Provide an explanation for the answer..."
                                            rows={2}
                                        />
                                    </div>
                                </div>

                                <Button type="submit" className="w-full" disabled={isLoading || isSubmitting}>
                                    <Save className="h-4 w-4 mr-2" />
                                    {editingIndex !== null ? "Update Question" : "Add Question"}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>

                {/* Questions List */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle>Questions ({questions.length})</CardTitle>
                            <Badge variant="outline">
                                Total Points: {questions.reduce((sum, q) => sum + (q.points || 0), 0)}
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Question</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Points</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {questions.map((question, index) => (
                                    <TableRow key={question.id || question._id}>
                                        <TableCell>
                                            <div className="space-y-1">
                                                <div className="font-medium">
                                                    {index + 1}. {question.text?.substring(0, 50)}...
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline">
                                                {question.type === "multiple_choice"
                                                    ? "Multiple Choice"
                                                    : question.type === "short_answer"
                                                        ? "Short Answer"
                                                        : question.type === "true_false"
                                                            ? "True/False"
                                                            : "Essay"}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>{question.points || 0}</TableCell>
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem onClick={() => handleEditQuestion(index)}>
                                                        <Edit className="h-4 w-4 mr-2" />
                                                        Edit Question
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        className="text-destructive"
                                                        onClick={() => handleDeleteQuestion(index)}
                                                    >
                                                        <Trash2 className="h-4 w-4 mr-2" />
                                                        Delete Question
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
