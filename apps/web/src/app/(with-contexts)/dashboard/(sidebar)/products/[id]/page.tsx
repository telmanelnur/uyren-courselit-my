import CourseModel from "@/models/Course"
import { connectToDatabase } from "@workspace/common-logic"
import { notFound } from "next/navigation"
import ProductMainClient from "./_components/product-main-client"

async function getProductData(id: string) {
    try {
        await connectToDatabase()
        const product = await CourseModel.findOne({ courseId: id }).lean()
        return product ? JSON.parse(JSON.stringify({
            ...product,
        })) : null
    } catch (error) {
        return null
    }
}

export default async function ProductPage(props: {
    params: Promise<{ id: string }>
}) {
    const params = await props.params;
    const product = await getProductData(params.id)

    if (!product) {
        return notFound()
    }

    return <ProductMainClient product={product} />
}
