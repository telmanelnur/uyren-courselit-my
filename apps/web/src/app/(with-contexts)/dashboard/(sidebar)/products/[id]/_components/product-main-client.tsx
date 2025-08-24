"use client"

import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@workspace/ui/components/select"
import { Skeleton } from "@workspace/ui/components/skeleton"
import {
    BookOpen,
    ChevronDown,
    DollarSign,
    Download,
    Eye,
    Globe,
    GraduationCap,
    Settings,
    Share2,
    UserPlus,
    Users,
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"

import DashboardContent from "@/components/admin/dashboard-content"
import { useAddress } from "@/components/contexts/address-context"
import Resources from "@/components/resources"
import { useActivities } from "@/hooks/use-activities"
import { TIME_RANGES } from "@/lib/ui/config/constants"
import {
    EDIT_CONTENT_MENU_ITEM,
    EDIT_PAGE_MENU_ITEM,
    MANAGE_COURSES_PAGE_HEADING,
    PRODUCT_EMPTY_WARNING,
    PRODUCT_TABLE_CONTEXT_MENU_INVITE_A_CUSTOMER,
    PRODUCT_UNPUBLISHED_WARNING,
    TOAST_TITLE_SUCCESS,
    VIEW_PAGE_MENU_ITEM,
} from "@/lib/ui/config/strings"
import { Constants } from "@workspace/common-models"
import { Tooltip as TooltipCL, useToast } from "@workspace/components-library"
import { capitalize, truncate } from "@workspace/utils"
import SalesCard from "../../../overview/sales-card"
import MetricCard from "./metric-card"

const { ActivityType } = Constants

interface ProductMainClientProps {
    product: any
}

export default function ProductMainClient({ product }: ProductMainClientProps) {
    const [timeRange, setTimeRange] = useState("7d")
    const router = useRouter()
    const { address } = useAddress()
    const { toast } = useToast()

    const breadcrumbs = [
        { label: MANAGE_COURSES_PAGE_HEADING, href: "/dashboard/products" },
        {
            label: product ? truncate(product.title || "", 20) || "..." : "...",
            href: "#",
        },
    ]

    const { data: salesData, loading: salesLoading } = useActivities(
        ActivityType.PURCHASED,
        timeRange,
        product.courseId,
        true,
    )

    const handleShareClick = () => {
        navigator.clipboard.writeText(
            `${address.frontend}/p/${product?.pageId}`,
        )
        toast({
            title: TOAST_TITLE_SUCCESS,
            description: "Product URL copied to clipboard!",
        })
    }

    return (
        <DashboardContent breadcrumbs={breadcrumbs}>
            {!product?.published && (
                <div className="bg-red-400 p-2 mb-4 text-sm text-white rounded-md">
                    {PRODUCT_UNPUBLISHED_WARNING}{" "}
                    <Link
                        href={`/dashboard/products/${product.courseId}/manage#publish`}
                        className="underline"
                    >
                        Manage
                    </Link>
                </div>
            )}
            <div className="mb-8 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="space-y-1">
                        <h1 className="text-4xl font-semibold flex items-center gap-2">
                            {product?.title || (
                                <Skeleton className="h-9 w-64" />
                            )}
                            <TooltipCL
                                title="Share product"
                                className="font-normal!"
                            >
                                <Button
                                    variant="ghost"
                                    onClick={handleShareClick}
                                    size="sm"
                                >
                                    <Share2 className="h-5 w-5" />
                                </Button>
                            </TooltipCL>
                        </h1>
                        <div className="flex items-center gap-2">
                            {product ? (
                                <>
                                    <Badge variant="secondary">
                                        {capitalize(product.type!) ===
                                            "Course" ? (
                                            <BookOpen className="h-4 w-4 mr-1" />
                                        ) : (
                                            <Download className="h-4 w-4 mr-1" />
                                        )}
                                        {capitalize(product.type!)}
                                    </Badge>
                                    <Badge variant="outline">
                                        {product.published
                                            ? "Published"
                                            : "Draft"}
                                    </Badge>
                                </>
                            ) : (
                                <Skeleton className="h-5 w-48" />
                            )}
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-2 items-center">
                        <Select value={timeRange} onValueChange={setTimeRange}>
                            <SelectTrigger className="w-[140px]">
                                <SelectValue placeholder="Select time range" />
                            </SelectTrigger>
                            <SelectContent>
                                {TIME_RANGES.map((range) => (
                                    <SelectItem
                                        key={range.value}
                                        value={range.value}
                                    >
                                        {range.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Button variant="outline" size="sm">
                            <Link
                                href={`/dashboard/products/${product.courseId}/content`}
                            >
                                {EDIT_CONTENT_MENU_ITEM}
                            </Link>
                        </Button>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline">
                                    Actions
                                    <ChevronDown className="ml-2 h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuSeparator />
                                <DropdownMenuItem asChild>
                                    <Link
                                        href={`/dashboard/products/${product.courseId}/customers/new`}
                                    >
                                        <UserPlus className="mr-2 h-4 w-4" />
                                        {
                                            PRODUCT_TABLE_CONTEXT_MENU_INVITE_A_CUSTOMER
                                        }
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem asChild>
                                    <Link
                                        href={`/dashboard/products/${product.courseId}/manage`}
                                    >
                                        <Settings className="mr-2 h-4 w-4" />
                                        Manage
                                    </Link>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </div>

            {!product?.lessons?.length && (
                <div className="px-2 py-16 text-center mb-4 text-sm text-muted-foreground rounded-md border-dashed border-2">
                    <p className="mb-4">{PRODUCT_EMPTY_WARNING}</p>
                    <Link href={`/dashboard/products/${product.courseId}/content`}>
                        <Button size="sm">{EDIT_CONTENT_MENU_ITEM}</Button>
                    </Link>
                </div>
            )}

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
                <MetricCard
                    title="Sales"
                    icon={
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    }
                    type={ActivityType.PURCHASED}
                    duration={timeRange}
                    entityId={product.courseId}
                />
                <Link href={`/dashboard/products/${product.courseId}/customers`}>
                    <MetricCard
                        title="Customers"
                        icon={
                            <Users className="h-4 w-4 text-muted-foreground" />
                        }
                        type={ActivityType.ENROLLED}
                        duration={timeRange}
                        entityId={product.courseId}
                    />
                </Link>
                {product?.type?.toLowerCase() === "course" ? (
                    <>
                        <MetricCard
                            title="People who completed the course"
                            icon={
                                <GraduationCap className="h-4 w-4 text-muted-foreground" />
                            }
                            type={ActivityType.COURSE_COMPLETED}
                            duration={timeRange}
                            entityId={product.courseId}
                        />
                    </>
                ) : (
                    <MetricCard
                        title="Downloads"
                        icon={
                            <Download className="h-4 w-4 text-muted-foreground" />
                        }
                        type={ActivityType.DOWNLOADED}
                        duration={timeRange}
                        entityId={product.courseId}
                    />
                )}
            </div>

            <SalesCard data={salesData} loading={salesLoading} />

            <Resources
                links={[
                    {
                        href: `https://docs.courselit.app/en/courses/add-content/`,
                        text: "Add content to a product",
                    },
                    {
                        href: `https://docs.courselit.app/en/courses/add-content/`,
                        text: "Understanding product dashboard",
                    },
                ]}
            />
        </DashboardContent>
    )
}
