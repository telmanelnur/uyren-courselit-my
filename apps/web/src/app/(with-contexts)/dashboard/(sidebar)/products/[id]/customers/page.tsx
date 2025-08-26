"use client";

import DashboardContent from "@/components/admin/dashboard-content";
import HeaderTopbar from "@/components/admin/layout/header-topbar";
import { DataTable } from "@/components/data-table/data-table";
import { DataTableToolbar } from "@/components/data-table/data-table-toolbar";
import { useDataTable } from "@/components/data-table/use-data-table";
import {
  BTN_INVITE,
  TOAST_TITLE_ERROR,
  TOAST_TITLE_SUCCESS,
  USER_TAGS_SUBHEADER,
} from "@/lib/ui/config/strings";
import { GeneralRouterOutputs } from "@/server/api/types";
import { trpc } from "@/utils/trpc";
import { ColumnDef } from "@tanstack/react-table";
import { ComboBox, useToast } from "@workspace/components-library";
import { TooltipTrigger } from "@workspace/text-editor/tiptap";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@workspace/ui/components/avatar";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@workspace/ui/components/dialog";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import { Skeleton } from "@workspace/ui/components/skeleton";
import { Tooltip, TooltipContent } from "@workspace/ui/components/tooltip";
import { useDebounce } from "@workspace/ui/hooks/use-debounce";
import { capitalize, truncate } from "@workspace/utils";
import { ArrowLeft, Copy, UserPlus } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

interface CustomerFormData {
  email: string;
  tags: string[];
}

type ItemType =
  GeneralRouterOutputs["lmsModule"]["courseModule"]["course"]["getMembers"][number];
type QueryParams = Parameters<
  typeof trpc.lmsModule.courseModule.course.getMembers.useQuery
>[0];

export default function ProductCustomersPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params.id as string;
  const [customerDialogOpen, setCustomerDialogOpen] = useState(false);
  const [customerFormData, setCustomerFormData] = useState<CustomerFormData>({
    email: "",
    tags: [],
  });
  const [savingCustomer, setSavingCustomer] = useState(false);
  const { toast } = useToast();

  const { data: product, isLoading: productLoading } =
    trpc.lmsModule.courseModule.course.getByCourseDetailed.useQuery({
      courseId: productId,
    });

  const loadTagsQuery = trpc.userModule.tag.list.useQuery();
  const systemTags = useMemo(
    () => loadTagsQuery.data || [],
    [loadTagsQuery.data],
  );

  const inviteCustomerMutation =
    trpc.userModule.user.inviteCustomer.useMutation();

  const handleCustomerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!customerFormData.email.trim()) {
      toast({
        title: TOAST_TITLE_ERROR,
        description: "Email is required",
        variant: "destructive",
      });
      return;
    }

    try {
      setSavingCustomer(true);
      const response = await inviteCustomerMutation.mutateAsync({
        data: {
          email: customerFormData.email,
          tags: customerFormData.tags,
          courseId: productId,
        },
      });

      if (response) {
        setCustomerFormData({ email: "", tags: [] });
        setCustomerDialogOpen(false);
        const message = `${response.email} has been invited.`;
        toast({
          title: TOAST_TITLE_SUCCESS,
          description: message,
        });
      }
    } catch (err: any) {
      toast({
        title: TOAST_TITLE_ERROR,
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setSavingCustomer(false);
    }
  };

  if (productLoading) {
    return (
      <DashboardContent
        breadcrumbs={[
          { label: "Products", href: "/dashboard/products" },
          { label: "...", href: "#" },
          { label: "Customers", href: "#" },
        ]}
      >
        <div className="flex flex-col gap-6">
          <div className="space-y-4">
            <Skeleton className="h-9 w-64" />
            <Skeleton className="h-5 w-48" />
          </div>
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-32 w-full" />
            </CardContent>
          </Card>
        </div>
      </DashboardContent>
    );
  }

  if (!product) {
    return (
      <DashboardContent
        breadcrumbs={[
          { label: "Products", href: "/dashboard/products" },
          { label: "Product", href: "#" },
          { label: "Customers", href: "#" },
        ]}
      >
        <div className="text-center py-8">
          <p className="text-muted-foreground">Product not found</p>
        </div>
      </DashboardContent>
    );
  }

  const breadcrumbs = [
    { label: "Products", href: "/dashboard/products" },
    {
      label: product.title || "Product",
      href: `/dashboard/products/${product.courseId}`,
    },
    { label: "Customers", href: "#" },
  ];

  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 500);
  const [parsedData, setParsedData] = useState<Array<ItemType>>([]);
  const [parsedPageination, setParsedPagination] = useState({
    pageCount: 1,
  });
  const handleCopyToClipboard = useCallback((text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: TOAST_TITLE_SUCCESS,
      description: "Copied to clipboard",
    });
  }, []);
  const columns: ColumnDef<ItemType>[] = useMemo(() => {
    return [
      {
        accessorKey: "username",
        header: "Customer Name",
        cell: ({ row }) => {
          const member = row.original;
          return (
            <Link href={`/dashboard/users/${member.user?.userId}`}>
              <div className="flex items-center space-x-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage
                    src={
                      member.user?.avatar?.thumbnail ||
                      "/courselit_backdrop_square.webp"
                    }
                    alt={member.user?.name || member.user?.email}
                  />
                  <AvatarFallback>
                    {(member.user?.name || member.user?.email || " ").charAt(0)}
                  </AvatarFallback>
                </Avatar>
                {/* <Avatar className="h-8 w-8">
                                                  <AvatarImage
                                                      src={
                                                          member.user?.avatar
                                                              ?.thumbnail
                                                      }
                                                      alt={member.user?.name}
                                                  />
                                                  <AvatarFallback>
                                                      {(
                                                          member.user?.name ||
                                                          member.user?.email
                                                      )
                                                          .split(" ")
                                                          .map((n) => n[0])
                                                          .join("")}
                                                  </AvatarFallback>
                                              </Avatar> */}
                <span>{member.user?.name || member.user?.email}</span>
              </div>
            </Link>
          );
        },
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
          const member = row.original;
          return (
            <Badge
              variant={
                member.status.toLowerCase() === "pending"
                  ? "secondary"
                  : member.status.toLowerCase() === "active"
                    ? "default"
                    : "destructive"
              }
            >
              {member.status.charAt(0).toUpperCase() + member.status.slice(1)}
            </Badge>
          );
        },
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
      },
      {
        accessorKey: "updatedAt",
        header: "Updated",
        cell: ({ row }) => {
          const date = row.getValue("updatedAt") as string;
          return (
            <div className="text-sm text-muted-foreground">
              {new Date(date).toLocaleDateString()}
            </div>
          );
        },
      },
      {
        accessorKey: "subscription",
        header: "Subscription",
        cell: ({ row }) => {
          const member = row.original;
          return (
            <div className="flex items-center gap-2">
              <Tooltip>
                <TooltipTrigger>
                  {member.subscriptionId
                    ? truncate(member.subscriptionId, 10)
                    : "-"}
                </TooltipTrigger>
                <TooltipContent>
                  {`Method: ${capitalize(member.subscriptionMethod || "")}`}
                </TooltipContent>
              </Tooltip>
              {member.subscriptionId && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        handleCopyToClipboard(member.subscriptionId || "")
                      }
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Copy Subscription ID</TooltipContent>
                </Tooltip>
              )}
            </div>
          );
        },
      },
      // {
      //     id: "actions",
      //     header: "Actions",
      //     cell: ({ row }) => {
      //         const quiz = row.original;
      //         return (
      //             <DropdownMenu>
      //                 <DropdownMenuTrigger asChild>
      //                     <Button variant="ghost" size="icon">
      //                         <MoreHorizontal className="h-4 w-4" />
      //                         <span className="sr-only">Open menu</span>
      //                     </Button>
      //                 </DropdownMenuTrigger>
      //                 <DropdownMenuContent align="end">
      //                     <DropdownMenuItem asChild>
      //                         <Link href={`/dashboard/lms/quizzes/${quiz._id}`}>
      //                             <Edit className="h-4 w-4 mr-2" />
      //                             Edit Quiz
      //                         </Link>
      //                     </DropdownMenuItem>
      //                     {quiz.status !== "archived" && (
      //                         <DropdownMenuItem
      //                             onClick={() => handleArchive(quiz)}
      //                             className="text-orange-600"
      //                         >
      //                             <Archive className="h-4 w-4 mr-2" />
      //                             Archive Quiz
      //                         </DropdownMenuItem>
      //                     )}
      //                 </DropdownMenuContent>
      //             </DropdownMenu>
      //         );
      //     },
      // },
    ];
  }, []);
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
        courseId: productId,
        // status: Array.isArray(
        //     tableState.columnFilters.find((filter) => filter.id === "status")?.value
        // )
        //     ? (tableState.columnFilters.find((filter) => filter.id === "status")?.value as string[])[0] as any;
        //     : undefined,
      },
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
  }, [
    tableState.sorting,
    tableState.pagination,
    tableState.columnFilters,
    tableState.globalFilter,
    debouncedSearchQuery,
  ]);
  const loadListQuery =
    trpc.lmsModule.courseModule.course.getMembers.useQuery(queryParams);
  useEffect(() => {
    if (!loadListQuery.data) return;
    const parsed = loadListQuery.data || [];
    setParsedData(parsed);
    // setParsedPagination({
    //     pageCount: Math.ceil(loadListQuery.data.total / loadListQuery.data.meta.take),
    // });
  }, [loadListQuery.data]);

  return (
    <DashboardContent breadcrumbs={breadcrumbs}>
      <div className="flex flex-col gap-6">
        <HeaderTopbar
          backLink={true}
          header={{
            title: "Product Customers",
            subtitle: `Manage customers for ${product.title}`,
          }}
          rightAction={
            <div className="flex items-center gap-2">
              <Dialog
                open={customerDialogOpen}
                onOpenChange={setCustomerDialogOpen}
              >
                <DialogTrigger asChild>
                  <Button variant="outline" className="flex items-center gap-2">
                    <UserPlus className="h-4 w-4" />
                    Add Customer
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Customer</DialogTitle>
                    <DialogDescription>
                      Invite a new customer to this product by entering their
                      email address and optional tags.
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleCustomerSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="customer@example.com"
                        value={customerFormData.email}
                        onChange={(e) =>
                          setCustomerFormData((prev) => ({
                            ...prev,
                            email: e.target.value,
                          }))
                        }
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>{USER_TAGS_SUBHEADER}</Label>
                      <ComboBox
                        key={
                          JSON.stringify(systemTags) +
                          JSON.stringify(customerFormData.tags)
                        }
                        side="bottom"
                        options={systemTags}
                        selectedOptions={new Set(customerFormData.tags)}
                        onChange={(values: string[]) =>
                          setCustomerFormData((prev) => ({
                            ...prev,
                            tags: values,
                          }))
                        }
                      />
                    </div>
                    <DialogFooter>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setCustomerDialogOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        disabled={
                          savingCustomer || !customerFormData.email.trim()
                        }
                      >
                        {savingCustomer ? "Inviting..." : BTN_INVITE}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
              <Button
                variant="outline"
                onClick={() =>
                  router.push(`/dashboard/products/${product.courseId}`)
                }
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Product
              </Button>
            </div>
          }
        />

        <Card>
          <CardHeader>
            <CardTitle>Customer Management</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-2">
              <Input
                placeholder={"Search"}
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                className="h-8 w-40 lg:w-56"
              />
              <DataTable table={table}>
                <DataTableToolbar table={table} />
              </DataTable>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardContent>
  );
}
