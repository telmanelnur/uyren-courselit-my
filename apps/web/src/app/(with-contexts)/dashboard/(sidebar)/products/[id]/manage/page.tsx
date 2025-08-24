import CourseModel from "@/models/Course"
import { connectToDatabase } from "@workspace/common-logic"
import { notFound } from "next/navigation"
import ProductManageClient from "./_components/product-manage-client"

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

export default async function ProductManagePage(props: {
    params: Promise<{ id: string }>
}) {
    const params = await props.params;
    const product = await getProductData(params.id)

    if (!product) {
        return notFound()
    }

    return (
        <ProductManageClient
            product={product}
        />
    )
}
