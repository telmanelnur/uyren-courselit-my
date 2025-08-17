"use client";

import DashboardContent from "@/components/admin/dashboard-content";
import { DataTable } from "@/components/admin/data-table/data-table";
import { DataTableToolbar } from "@/components/admin/data-table/data-table-toolbar";
import { useDataTable } from "@/components/admin/data-table/use-data-table";
import { GeneralRouterOutputs } from "@/server/api/types";
import { trpc } from "@/utils/trpc";
import { type ColumnDef } from "@tanstack/react-table";
import { useDebounce } from "@workspace/components-library";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import { Card, CardContent, CardHeader } from "@workspace/ui/components/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@workspace/ui/components/dropdown-menu";
import { Input } from "@workspace/ui/components/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@workspace/ui/components/table";
import { Edit, Eye, FileQuestion, MoreHorizontal, Plus, Search, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";


const breadcrumbs = [{ label: "LMS", href: "#" }, { label: "Quizzes", href: "#" }];


type ItemType = GeneralRouterOutputs["lmsModule"]["quizModule"]["quiz"]["list"]["items"][number];
type QueryParams = Parameters<typeof trpc.lmsModule.quizModule.quiz.list.useQuery>[0];


const columns: ColumnDef<any>[] = [
    {
        accessorKey: "title",
        header: "Quiz Title",
        cell: ({ row }) => {
            const quiz = row.original;
            return (
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/20 rounded flex items-center justify-center">
                        <FileQuestion className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                        <div className="font-medium">{quiz.title}</div>
                        <div className="text-sm text-muted-foreground">{quiz.description}</div>
                    </div>
                </div>
            );
        },
    },
    {
        accessorKey: "courseId",
        header: "Course",
        cell: ({ row }) => {
            const courseId = row.getValue("courseId") as string;
            return (
                <Badge variant="outline">
                    {courseId || "No Course"}
                </Badge>
            );
        },
    },
    {
        accessorKey: "questionIds",
        header: "Questions",
        cell: ({ row }) => {
            const questionIds = row.getValue("questionIds") as string[];
            return (
                <div className="flex items-center gap-1">
                    <FileQuestion className="h-3 w-3 text-muted-foreground" />
                    {questionIds?.length || 0}
                </div>
            );
        },
    },
    {
        accessorKey: "isPublished",
        header: "Status",
        cell: ({ row }) => {
            const isPublished = row.getValue("isPublished") as boolean;
            return (
                <Badge variant={isPublished ? "default" : "secondary"}>
                    {isPublished ? "Published" : "Draft"}
                </Badge>
            );
        },
        meta: {
            label: "Status",
            variant: "select",
            options: [
                { label: "Published", value: "true" },
                { label: "Draft", value: "false" },
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
            const quiz = row.original;
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
                            <Link href={`/dashboard/lms/quizzes/${quiz._id}`}>
                                <Eye className="h-4 w-4 mr-2" />
                                View Details
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                            <Link href={`/dashboard/lms/quizzes/${quiz._id}/edit`}>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit Quiz
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete Quiz
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            );
        },
    },
];

export default function QuizzesPage() {
    const router = useRouter();


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
        };
        // filters skiped
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
    const loadListQuery = trpc.lmsModule.quizModule.quiz.list.useQuery(queryParams);
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
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Quizzes</h1>
                        <p className="text-muted-foreground">Manage quizzes and assessments</p>
                    </div>
                    <Button asChild>
                        <Link href="/dashboard/lms/quizzes/create">
                            <Plus className="h-4 w-4 mr-2" />
                            Create Quiz
                        </Link>
                    </Button>
                </div>

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
