import { QuizModel } from "@/models/lms"
import { connectToDatabase } from "@workspace/common-logic"
import QuizClientWrapper from "./_components/quiz-client-wrapper"

async function getQuizData(id: string) {
    if (id === "new") {
        return null
    }

    try {
        await connectToDatabase()
        const quiz = await QuizModel.findById(id).lean()
        return quiz ? JSON.parse(JSON.stringify(quiz)) : null
    } catch (error) {
        console.error("Error fetching quiz:", error)
        return null
    }
}

export default async function EditQuizPage(props: {
    params: Promise<
        { id: string }
    >
}) {
    const params = await props.params;
    const quizId = params.id !== "new" ? params.id : null
    const initialMode = quizId !== null ? "edit" : "create"
    const initialQuizData = quizId ? await getQuizData(params.id) : null
    return (
        <QuizClientWrapper
            initialMode={initialMode}
            quizId={quizId}
            initialQuizData={initialQuizData}
        />
    )
}