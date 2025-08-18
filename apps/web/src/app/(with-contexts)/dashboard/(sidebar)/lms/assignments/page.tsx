"use client";

import DashboardContent from "@/components/admin/dashboard-content";
import { CreateButton } from "@/components/admin/layout/create-button";
import HeaderTopbar from "@/components/admin/layout/header-topbar";
import { DataTable } from "@/components/data-table/data-table";
import { DataTableToolbar } from "@/components/data-table/data-table-toolbar";
import { useDataTable } from "@/components/data-table/use-data-table";
import { GeneralRouterOutputs } from "@/server/api/types";
import { trpc } from "@/utils/trpc";
import { ColumnDef } from "@tanstack/react-table";
import { useDebounce } from "@workspace/components-library";
import { Card } from "@workspace/text-editor/tiptap";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import { CardContent } from "@workspace/ui/components/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@workspace/ui/components/dropdown-menu";
import { Input } from "@workspace/ui/components/input";
import { Edit, Eye, FileText, MoreHorizontal, Trash2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";


// function AssignmentCard({ assignment }: { assignment: any }) {
//     return (
//         <ContentCard href={`/dashboard/lms/assignments/${assignment.id}`}>
//             <ContentCardImage
//                 src={assignment.featuredImage?.url || "/courselit_backdrop_square.webp"}
//                 alt={assignment.title}
//             />
//             <ContentCardContent>
//                 <ContentCardHeader>{assignment.title || "Untitled Assignment"}</ContentCardHeader>
//                 <div className="flex items-center justify-between gap-2 mb-4">
//                     <Badge variant="outline">
//                         <FileText className="h-4 w-4 mr-1" />
//                         Assignment
//                     </Badge>
//                 </div>
//                 <div className="space-y-2 text-sm text-muted-foreground">
//                     <div className="flex items-center gap-2">
//                         <Calendar className="h-4 w-4" />
//                         <span>Due: {assignment.dueDate || "No due date"}</span>
//                     </div>
//                     <div className="flex items-center gap-2">
//                         <Users className="h-4 w-4" />
//                         <span>{assignment.submissionsCount || 0} submissions</span>
//                     </div>
//                 </div>
//             </ContentCardContent>
//         </ContentCard>
//     );
// }

// function SkeletonGrid() {
//     return (
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//             {[...Array(6)].map((_, index) => (
//                 <SkeletonCard key={index} />
//             ))}
//         </div>
//     );
// }


const breadcrumbs = [{ label: "LMS", href: "#" }, { label: "Assignments", href: "#" }];

type ItemType = GeneralRouterOutputs["lmsModule"]["assignment"]["list"]["items"][number];
type QueryParams = Parameters<typeof trpc.lmsModule.assignment.list.useQuery>[0];

const columns: ColumnDef<ItemType>[] = [
    {
        accessorKey: "title",
        header: "Assignment Title",
        cell: ({ row }) => {
            const obj = row.original;
            return (
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/20 rounded flex items-center justify-center">
                        <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                        <div className="font-medium">{obj.title}</div>
                        <div className="text-sm text-muted-foreground">{obj.description}</div>
                    </div>
                </div>
            );
        },
    },
    {
        accessorKey: "courseId",
        header: "Course",
        cell: ({ row }) => {
            const assignment = row.original;
            const course = (assignment as any).course;
            return (
                <Badge variant="outline">
                    {course?.title || assignment.courseId || "No Course"}
                </Badge>
            );
        },
    },
    {
        accessorKey: "ownerId",
        header: "Owner",
        cell: ({ row }) => {
            const assignment = row.original;
            const owner = (assignment as any).owner;
            return (
                <div className="text-sm text-muted-foreground">
                    {owner?.name || owner?.email || assignment.ownerId || "Unknown"}
                </div>
            );
        },
    },
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
            const status = row.original.status;
            return (
                <Badge variant={status === "published" ? "default" : "secondary"}>
                    {status === "published" ? "Published" : "Draft"}
                </Badge>
            );
        },
        meta: {
            label: "Status",
            variant: "select",
            options: [
                { label: "Published", value: "published" },
                { label: "Draft", value: "draft" },
            ],
        },
        enableColumnFilter: true,
    },
    {
        accessorKey: "createdAt",
        header: "Created",
        cell: ({ row }) => {
            const date = row.getValue("createdAt") as string;
            return (
                <div className="text-sm text-muted-foreground">
                    {new Date(date).toLocaleDateString()}
                </div>
            );
        },
        meta: {
            label: "Created Date",
            variant: "date",
        },
    },
    {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => {
            const obj = row.original;
            return (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Open menu</span>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                            <Link href={`/dashboard/lms/assignments/${obj._id}`}>
                                <Eye className="h-4 w-4 mr-2" />
                                View Details
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                            <Link href={`/dashboard/lms/assignments/${obj._id}/edit`}>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit Assignment
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete Assignment
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            );
        },
    },
];

export default function Page() {
    const [searchQuery, setSearchQuery] = useState("");
    const debouncedSearchQuery = useDebounce(searchQuery, 500);
    const [parsedData, setParsedData] = useState<Array<ItemType>>([]);
    const [parsedPageination, setParsedPagination] = useState({
        pageCount: 1,
    });
    const { table } = useDataTable({
        columns,
        data: parsedData,
        pageCount: parsedPageination.pageCount,
        enableGlobalFilter: true,
        initialState: {
            sorting: [{ id: "createdAt", desc: true }],
        },
    });
    const tableState = table.getState();
    const queryParams = useMemo(() => {
        const parsed: QueryParams = {
            pagination: {
                skip: tableState.pagination.pageIndex * tableState.pagination.pageSize,
                take: tableState.pagination.pageSize,
            },
            filter: {
                status: Array.isArray(
                    tableState.columnFilters.find((filter) => filter.id === "status")?.value
                )
                    ? (tableState.columnFilters.find((filter) => filter.id === "status")?.value as string[])[0] as "published" | "draft"
                    : undefined,
            }
        };
        if (tableState.sorting[0]) {
            parsed.orderBy = {
                field: tableState.sorting[0].id as any,
                direction: tableState.sorting[0].desc ? "desc" : "asc",
            };
        }
        if (debouncedSearchQuery) {
            parsed.search = {
                q: debouncedSearchQuery,
            };
        }
        return parsed;
    }, [tableState.sorting, tableState.pagination, tableState.columnFilters, tableState.globalFilter, debouncedSearchQuery]);
    const loadListQuery = trpc.lmsModule.assignment.list.useQuery(queryParams);
    useEffect(() => {
        if (!loadListQuery.data) return;
        const parsed = loadListQuery.data.items || [];
        setParsedData(parsed);
        setParsedPagination({
            pageCount: Math.ceil(loadListQuery.data.total / loadListQuery.data.meta.take),
        });
    }, [loadListQuery.data]);
    return (
        <DashboardContent breadcrumbs={breadcrumbs}>
            <div className="flex flex-col gap-4">
                <HeaderTopbar
                    header={{
                        title: "Assignments",
                        subtitle: "Manage assignments and submissions"
                    }}
                    rightAction={
                        <CreateButton href="/dashboard/lms/assignments/new" />
                    }
                />
                <Card>
                    <CardContent>
                        <div className="flex flex-col gap-2">
                            <Input
                                placeholder={"Search"}
                                value={searchQuery}
                                onChange={(event) => setSearchQuery(event.target.value)}
                                className="h-8 w-40 lg:w-56"
                            />
                            <DataTable table={table} >
                                <DataTableToolbar table={table} />
                            </DataTable>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </DashboardContent>
    );
}
