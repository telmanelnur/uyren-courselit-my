import CourseModel from "@/models/Course"
import { connectToDatabase } from "@workspace/common-logic"
import ProductContentClient from "./_components/product-content-client"

async function getProductData(id: string) {
    try {
        await connectToDatabase()
        const product = await CourseModel.findOne({ courseId: id }).lean()
        return product ? JSON.parse(JSON.stringify({
            ...product,
        })) : null
    } catch (error) {
        console.error("Error fetching product:", error)
        return null
    }
}

export default async function ProductContentPage(props: {
    params: Promise<{ id: string }>
}) {
    const params = await props.params;
    const product = await getProductData(params.id)
    
    if (!product) {
        return <div>Product not found</div>
    }

    return <ProductContentClient product={product} />
}
