"use client"

import DashboardContent from "@/components/admin/dashboard-content"
import HeaderTopbar from "@/components/admin/layout/header-topbar"
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card"
import { Button } from "@workspace/ui/components/button"
import { ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"

interface ProductContentClientProps {
    product: any
}

export default function ProductContentClient({ product }: ProductContentClientProps) {
    const router = useRouter()
    
    const breadcrumbs = [
        { label: "Products", href: "/dashboard/products" },
        { label: product.title || "Product", href: `/dashboard/products/${product.courseId}` },
        { label: "Content", href: "#" }
    ]

    return (
        <DashboardContent breadcrumbs={breadcrumbs}>
            <div className="flex flex-col gap-6">
                <HeaderTopbar
                    backLink={true}
                    header={{
                        title: "Product Content",
                        subtitle: `Manage content for ${product.title}`
                    }}
                    rightAction={
                        <Button
                            variant="outline"
                            onClick={() => router.push(`/dashboard/products/${product.courseId}`)}
                            className="flex items-center gap-2"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Back to Product
                        </Button>
                    }
                />

                <Card>
                    <CardHeader>
                        <CardTitle>Content Management</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-center py-8 text-muted-foreground">
                            Content management coming soon...
                        </div>
                    </CardContent>
                </Card>
            </div>
        </DashboardContent>
    )
}
