"use client"

import DashboardContent from "@/components/admin/dashboard-content"
import HeaderTopbar from "@/components/admin/layout/header-topbar"
import { IQuiz } from "@/models/lms"
import { trpc } from "@/utils/trpc"
import { useToast } from "@workspace/components-library"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@workspace/ui/components/dropdown-menu"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import { RadioGroup, RadioGroupItem } from "@workspace/ui/components/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@workspace/ui/components/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@workspace/ui/components/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@workspace/ui/components/tabs"
import { Textarea } from "@workspace/ui/components/textarea"
import {
    Clock,
    Edit,
    FileQuestion,
    MoreHorizontal,
    Plus,
    Save,
    Target,
    Trash2
} from "lucide-react"
import { useState } from "react"



export default function EditAssignmentPage({ params }: { params: { id: string } }) {
    const [quiz, setQuiz] = useState({
        title: "",
        description: "",
        courseId: "",
        duration: 30,
        passingScore: 70,
        maxAttempts: 3,
        status: "Draft",
    })

    const { toast } = useToast();
    const [mode, setMode] = useState<"create" | "edit">("create");
    const [status, setStatus] = useState<IQuiz["status"]>("draft");
    const updateStatusMutation = trpc.lmsModule.quizModule.quiz.update.useMutation({
        onSuccess: (response) => {
            setStatus(response.status);
            toast({
                title: "Success",
                description: "Quiz status updated successfully",
            });
        },
        onError: (error) => {
            toast({
                title: "Error",
                description: error.message,
                variant: "destructive",
            });
        },
    });

    const [questions, setQuestions] = useState<any[]>([])
    const [currentQuestion, setCurrentQuestion] = useState({
        question: "",
        type: "multiple_choice",
        options: ["", "", "", ""],
        correctAnswer: "",
        points: 5,
        difficulty: "Easy",
        explanation: "",
    })
    const [editingIndex, setEditingIndex] = useState<number | null>(null)

    const handleSaveQuiz = () => {
        console.log("Saving quiz:", quiz, questions)
    }

    const handleAddQuestion = () => {
        if (editingIndex !== null) {
            const updatedQuestions = [...questions]
            updatedQuestions[editingIndex] = { ...currentQuestion, id: Date.now().toString() }
            setQuestions(updatedQuestions)
            setEditingIndex(null)
        } else {
            setQuestions([...questions, { ...currentQuestion, id: Date.now().toString() }])
        }

        setCurrentQuestion({
            question: "",
            type: "multiple_choice",
            options: ["", "", "", ""],
            correctAnswer: "",
            points: 5,
            difficulty: "Easy",
            explanation: "",
        })
    }

    const handleEditQuestion = (index: number) => {
        setCurrentQuestion(questions[index])
        setEditingIndex(index)
    }

    const handleDeleteQuestion = (index: number) => {
        setQuestions(questions.filter((_, i) => i !== index))
    }

    const addOption = () => {
        setCurrentQuestion({
            ...currentQuestion,
            options: [...currentQuestion.options, ""],
        })
    }

    const removeOption = (index: number) => {
        const newOptions = currentQuestion.options.filter((_, i) => i !== index)
        setCurrentQuestion({
            ...currentQuestion,
            options: newOptions,
        })
    }

    const updateOption = (index: number, value: string) => {
        const newOptions = [...currentQuestion.options]
        newOptions[index] = value
        setCurrentQuestion({
            ...currentQuestion,
            options: newOptions,
        })
    }

    const breadcrumbs = [
        {
            label: "LMS",
            href: `/dashboard/lms`,
        },
        {
            label: "Quizzes",
            href: "/dashboard/lms/quizzes",
        },
        {
            label: "New Quiz",
            href: "#",
        }
    ];

    return (
        <DashboardContent
            breadcrumbs={breadcrumbs}
        >
            <div className="flex flex-col gap-6">
                <HeaderTopbar
                    backLink={true}
                    header={{
                        title: "New Quiz",
                        subtitle: "Build a new quiz with questions and settings"
                    }}
                    rightAction={
                        <div className="flex items-center gap-2">
                            <Button
                                variant={status === "draft" ? "default" : "outline"}
                                onClick={console.log}
                                disabled={updateStatusMutation.isPending || mode === "create"}
                            >
                                {
                                    status === "draft" ? "Publish" : "Unpublish"
                                }
                            </Button>
                            <Button onClick={handleSaveQuiz}>
                                <Save className="h-4 w-4 mr-2" />
                                Save
                            </Button>
                        </div>
                    }
                />

                <Tabs defaultValue="settings" className="space-y-6">
                    <TabsList>
                        <TabsTrigger value="settings">Quiz Settings</TabsTrigger>
                        <TabsTrigger value="questions">Questions ({questions.length})</TabsTrigger>
                        <TabsTrigger value="preview">Preview</TabsTrigger>
                    </TabsList>

                    <TabsContent value="settings" className="space-y-6">
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
                                            value={quiz.title}
                                            onChange={(e) => setQuiz({ ...quiz, title: e.target.value })}
                                            placeholder="Enter quiz title"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="description">Description</Label>
                                        <Textarea
                                            id="description"
                                            value={quiz.description}
                                            onChange={(e) => setQuiz({ ...quiz, description: e.target.value })}
                                            placeholder="Enter quiz description"
                                            rows={3}
                                        />
                                    </div>
                                    <div className="grid sm:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="course">Course</Label>
                                            <Select value={quiz.courseId} onValueChange={(value) => setQuiz({ ...quiz, courseId: value })}>
                                                <SelectTrigger className="w-full">
                                                    <SelectValue placeholder="Select a course" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="1">Introduction to React</SelectItem>
                                                    <SelectItem value="2">Advanced JavaScript</SelectItem>
                                                    <SelectItem value="3">UI/UX Design Principles</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
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
                                            <Label htmlFor="duration">Duration (minutes)</Label>
                                            <Input
                                                id="duration"
                                                type="number"
                                                value={quiz.duration}
                                                onChange={(e) => setQuiz({ ...quiz, duration: Number.parseInt(e.target.value) })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="passingScore">Passing Score (%)</Label>
                                            <Input
                                                id="passingScore"
                                                type="number"
                                                value={quiz.passingScore}
                                                onChange={(e) => setQuiz({ ...quiz, passingScore: Number.parseInt(e.target.value) })}
                                            />
                                        </div>
                                    </div>
                                    <div className="grid sm:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="attempts">Max Attempts</Label>
                                            <Select
                                                value={quiz.maxAttempts.toString()}
                                                onValueChange={(value) => setQuiz({ ...quiz, maxAttempts: Number.parseInt(value) })}

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
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    <TabsContent value="questions" className="space-y-6">
                        <div className="grid gap-6 lg:grid-cols-2">
                            {/* Question Editor */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>{editingIndex !== null ? "Edit Question" : "Add Question"}</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="question">Question Title</Label>
                                        <Textarea
                                            id="question"
                                            value={currentQuestion.question}
                                            onChange={(e) => setCurrentQuestion({ ...currentQuestion, question: e.target.value })}
                                            placeholder="Enter your question..."
                                            rows={3}
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="type">Question Type</Label>
                                            <Select
                                                value={currentQuestion.type}
                                                onValueChange={(value) => setCurrentQuestion({ ...currentQuestion, type: value })}
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
                                            <Label htmlFor="difficulty">Difficulty</Label>
                                            <Select
                                                value={currentQuestion.difficulty}
                                                onValueChange={(value) => setCurrentQuestion({ ...currentQuestion, difficulty: value })}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="Easy">Easy</SelectItem>
                                                    <SelectItem value="Medium">Medium</SelectItem>
                                                    <SelectItem value="Hard">Hard</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    <div className="border-t pt-4">
                                        <h4 className="font-medium mb-3">Question Details</h4>

                                        {currentQuestion.type === "multiple_choice" && (
                                            <div className="space-y-4">
                                                <div className="flex items-center justify-between">
                                                    <Label>Answer Options</Label>
                                                    <Button type="button" variant="outline" size="sm" onClick={addOption}>
                                                        <Plus className="h-4 w-4 mr-2" />
                                                        Add Option
                                                    </Button>
                                                </div>

                                                <RadioGroup
                                                    value={currentQuestion.correctAnswer}
                                                    onValueChange={(value) => setCurrentQuestion({ ...currentQuestion, correctAnswer: value })}
                                                >
                                                    {currentQuestion.options.map((option, index) => (
                                                        <div key={index} className="flex items-center gap-2">
                                                            <RadioGroupItem value={option} id={`option-${index}`} />
                                                            <Input
                                                                value={option}
                                                                onChange={(e) => updateOption(index, e.target.value)}
                                                                placeholder={`Option ${index + 1}`}
                                                                className="flex-1"
                                                            />
                                                            {currentQuestion.options.length > 2 && (
                                                                <Button type="button" variant="ghost" size="icon" onClick={() => removeOption(index)}>
                                                                    <Trash2 className="h-4 w-4" />
                                                                </Button>
                                                            )}
                                                        </div>
                                                    ))}
                                                </RadioGroup>
                                            </div>
                                        )}

                                        {currentQuestion.type === "short_answer" && (
                                            <div className="space-y-2">
                                                <Label htmlFor="correctAnswer">Expected Answer</Label>
                                                <Input
                                                    id="correctAnswer"
                                                    value={currentQuestion.correctAnswer}
                                                    onChange={(e) => setCurrentQuestion({ ...currentQuestion, correctAnswer: e.target.value })}
                                                    placeholder="Enter the expected answer..."
                                                />
                                            </div>
                                        )}

                                        {currentQuestion.type === "true_false" && (
                                            <div className="space-y-2">
                                                <Label>Correct Answer</Label>
                                                <RadioGroup
                                                    value={currentQuestion.correctAnswer}
                                                    onValueChange={(value) => setCurrentQuestion({ ...currentQuestion, correctAnswer: value })}
                                                >
                                                    <div className="flex items-center space-x-2">
                                                        <RadioGroupItem value="true" id="true" />
                                                        <Label htmlFor="true">True</Label>
                                                    </div>
                                                    <div className="flex items-center space-x-2">
                                                        <RadioGroupItem value="false" id="false" />
                                                        <Label htmlFor="false">False</Label>
                                                    </div>
                                                </RadioGroup>
                                            </div>
                                        )}

                                        {currentQuestion.type === "essay" && (
                                            <div className="space-y-2">
                                                <Label htmlFor="rubric">Grading Rubric</Label>
                                                <Textarea
                                                    id="rubric"
                                                    value={currentQuestion.explanation}
                                                    onChange={(e) => setCurrentQuestion({ ...currentQuestion, explanation: e.target.value })}
                                                    placeholder="Enter grading criteria and expectations..."
                                                    rows={3}
                                                />
                                            </div>
                                        )}

                                        <div className="space-y-2">
                                            <Label htmlFor="points">Points</Label>
                                            <Input
                                                id="points"
                                                type="number"
                                                min="1"
                                                max="100"
                                                value={currentQuestion.points}
                                                onChange={(e) =>
                                                    setCurrentQuestion({ ...currentQuestion, points: Number.parseInt(e.target.value) })
                                                }
                                            />
                                        </div>
                                    </div>

                                    <Button onClick={handleAddQuestion} className="w-full">
                                        {editingIndex !== null ? "Update Question" : "Add Question"}
                                    </Button>
                                </CardContent>
                            </Card>

                            {/* Questions List */}
                            <Card>
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <CardTitle>Questions ({questions.length})</CardTitle>
                                        <Badge variant="outline">Total Points: {questions.reduce((sum, q) => sum + q.points, 0)}</Badge>
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
                                                <TableRow key={question.id}>
                                                    <TableCell>
                                                        <div className="space-y-1">
                                                            <div className="font-medium">
                                                                {index + 1}. {question.question.substring(0, 50)}...
                                                            </div>
                                                            <Badge variant="outline" className="text-xs">
                                                                {question.difficulty}
                                                            </Badge>
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
                                                    <TableCell>{question.points}</TableCell>
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
                    </TabsContent>

                    <TabsContent value="preview" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>{quiz.title || "Untitled Quiz"}</CardTitle>
                                <p className="text-muted-foreground">{quiz.description}</p>
                                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                    <div className="flex items-center gap-1">
                                        <Clock className="h-4 w-4" />
                                        {quiz.duration} minutes
                                    </div>
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
                                {questions.map((question, index) => (
                                    <div key={question.id} className="space-y-3 p-4 border rounded-lg">
                                        <div className="font-medium">
                                            {index + 1}. {question.question}
                                        </div>
                                        {question.type === "multiple_choice" && (
                                            <div className="space-y-2">
                                                {question.options?.map((option: string, optIndex: number) => (
                                                    <div key={optIndex} className="flex items-center gap-2">
                                                        <div className="w-4 h-4 border rounded-full" />
                                                        <span>{option}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                        {question.type === "short_answer" && <div className="w-full h-10 border rounded-md bg-muted/50" />}
                                        {question.type === "true_false" && (
                                            <div className="flex gap-4">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-4 h-4 border rounded-full" />
                                                    <span>True</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <div className="w-4 h-4 border rounded-full" />
                                                    <span>False</span>
                                                </div>
                                            </div>
                                        )}
                                        {question.type === "essay" && <div className="w-full h-20 border rounded-md bg-muted/50" />}
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </DashboardContent>
    )
}
