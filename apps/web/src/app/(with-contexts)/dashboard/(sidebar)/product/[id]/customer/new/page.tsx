"use client";

import DashboardContent from "@/components/admin/dashboard-content";
import NewCustomer from "@/components/admin/products/new-customer";
import useProduct from "@/hooks/use-product";
import {
    MANAGE_COURSES_PAGE_HEADING,
    PRODUCT_TABLE_CONTEXT_MENU_INVITE_A_CUSTOMER,
} from "@/lib/ui/config/strings";
import { truncate } from "@workspace/utils";
import { useParams } from "next/navigation";
import { useMemo } from "react";

export default function Page() {
    const params = useParams<{ id: string }>();
    const productId = params.id;
    const { product } = useProduct(productId);
    const breadcrumbs = useMemo(() => {
        return [
            { label: MANAGE_COURSES_PAGE_HEADING, href: "/dashboard/products" },
            {
                label: product ? truncate(product.title || "", 20) || "..." : "...",
                href: `/dashboard/product/${product?.courseId}`,
            },
            { label: PRODUCT_TABLE_CONTEXT_MENU_INVITE_A_CUSTOMER, href: "#" },
        ]
    }, [product]);



    if (!product) {
        return null;
    }

    return (
        <DashboardContent breadcrumbs={breadcrumbs}>
            <NewCustomer
                courseId={product.courseId}
            />
        </DashboardContent>
    );
}
