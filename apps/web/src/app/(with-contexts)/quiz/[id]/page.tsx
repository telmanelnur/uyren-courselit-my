import { trpcCaller } from "@/server/api/caller"
import { notFound } from "next/navigation"
import QuizInterface from "./_components/quiz-interface"

interface QuizPageProps {
    params: Promise<{
        id: string
    }>
}

export default async function Page({ params }: QuizPageProps) {
    try {
        const { id } = await params

        const quiz = await trpcCaller.lmsModule.quizModule.quiz.publicGetByQuizId({
            quizId: id,
        })

        return (
            <QuizInterface initialQuiz={{
                _id: `${quiz._id}`,
                title: quiz.title,
            }} />
        )
    } catch (error) {
        notFound()
    }
}
