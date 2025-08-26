"use client";
import DashboardContent from "@/components/admin/dashboard-content";
import { useSiteInfo } from "@/components/contexts/site-info-context";
import { PaginationControls } from "@/components/public/pagination";
import Resources from "@/components/resources";
import { SkeletonCard } from "@/components/skeleton-card";
import { useDialogControl } from "@/hooks/use-dialog-control";
import { useProducts } from "@/hooks/use-products";
import {
  BTN_NEW_PRODUCT,
  MANAGE_COURSES_PAGE_HEADING,
} from "@/lib/ui/config/strings";
import { trpc } from "@/utils/trpc";
import { zodResolver } from "@hookform/resolvers/zod";
import { InternalCourse } from "@workspace/common-logic";
import { Constants, CourseType, UIConstants } from "@workspace/common-models";
import {
  ContentCard,
  ContentCardContent,
  ContentCardHeader,
  ContentCardImage,
  getSymbolFromCurrency,
  useToast,
} from "@workspace/components-library";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@workspace/ui/components/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@workspace/ui/components/form";
import { Input } from "@workspace/ui/components/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@workspace/ui/components/tooltip";
import { capitalize } from "@workspace/utils";
import {
  BookOpen,
  CheckCircle,
  CircleDashed,
  Download,
  Eye,
  EyeOff,
  Plus,
  Users,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo } from "react";
import { useForm } from "react-hook-form";
import z from "zod";

import { EmptyState } from "@/app/(with-contexts)/(with-layout)/courses/_components/empty-state";

const ITEMS_PER_PAGE = 9;

const { permissions } = UIConstants;

const breadcrumbs = [{ label: MANAGE_COURSES_PAGE_HEADING, href: "#" }];

const ProductSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(255, "Title must be less than 255 characters"),
  type: z.enum([Constants.CourseType.COURSE, Constants.CourseType.DOWNLOAD]),
});

type ProductFormDataType = z.infer<typeof ProductSchema>;

function ProductCard({ product }: { product: InternalCourse }) {
  const { siteInfo } = useSiteInfo();
  return (
    <ContentCard href={`/dashboard/products/${product.courseId}`}>
      <ContentCardImage
        src={product.featuredImage?.url || "/courselit_backdrop_square.webp"}
        alt={product.title}
      />
      <ContentCardContent>
        <ContentCardHeader>{product.title}</ContentCardHeader>
        <div className="flex items-center justify-between gap-2 mb-4">
          <Badge variant="outline">
            {product.type.toLowerCase() === Constants.CourseType.COURSE ? (
              <BookOpen className="h-4 w-4 mr-1" />
            ) : (
              <Download className="h-4 w-4 mr-1" />
            )}
            {capitalize(product.type)}
          </Badge>
          <div className="flex items-center gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  {product.privacy?.toLowerCase() ===
                  Constants.ProductAccessType.PUBLIC ? (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  )}
                </TooltipTrigger>
                <TooltipContent>
                  {product.privacy?.toLowerCase() ===
                  Constants.ProductAccessType.PUBLIC
                    ? "Public"
                    : "Hidden"}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  {product.published ? (
                    <CheckCircle className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <CircleDashed className="h-4 w-4 text-muted-foreground" />
                  )}
                </TooltipTrigger>
                <TooltipContent>
                  {product.published ? "Published" : "Draft"}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
        <div className="flex items-center justify-between gap-2 text-sm">
          <div className="flex items-center text-muted-foreground">
            <span>
              <span className="text-base">
                {getSymbolFromCurrency(siteInfo.currencyISOCode || "USD")}{" "}
              </span>
              {product.sales.toLocaleString()} sales
            </span>
          </div>
          <div className="flex items-center text-muted-foreground">
            <Users className="h-4 w-4 mr-2" />
            <span>{product.customers.toLocaleString()} customers</span>
          </div>
        </div>
      </ContentCardContent>
    </ContentCard>
  );
}

function SkeletonGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(6)].map((_, index) => (
        <SkeletonCard key={index} />
      ))}
    </div>
  );
}

function CreateProductDialog() {
  const { toast } = useToast();
  const router = useRouter();
  const dialogControl = useDialogControl();

  const form = useForm<ProductFormDataType>({
    resolver: zodResolver(ProductSchema),
    defaultValues: {
      title: "",
      type: Constants.CourseType.COURSE,
    },
  });

  const createCourseMutation =
    trpc.lmsModule.courseModule.course.create.useMutation({
      onSuccess: (response) => {
        toast({
          title: "Success",
          description: "Product created successfully",
        });
        dialogControl.close();
        router.push(`/dashboard/products/${response.courseId}`);
      },
      onError: (err: any) => {
        toast({
          title: "Error",
          description: err.message,
          variant: "destructive",
        });
      },
    });

  const handleSubmit = async (data: ProductFormDataType) => {
    try {
      await createCourseMutation.mutateAsync({
        data: {
          title: data.title,
          type: data.type,
        },
      });
    } catch (error) {
      // Error handling is done in the mutation
    }
  };

  const isSubmitting = form.formState.isSubmitting;
  const isSaving = createCourseMutation.isPending;

  return (
    <Dialog
      open={dialogControl.visible}
      onOpenChange={dialogControl.setVisible}
    >
      <DialogTrigger asChild>
        <Button onClick={() => dialogControl.open()}>
          <Plus className="h-4 w-4 mr-2" />
          {BTN_NEW_PRODUCT}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Product</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Enter product title" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl className="w-full">
                      <SelectTrigger>
                        <SelectValue>
                          {field.value === Constants.CourseType.COURSE
                            ? "Course"
                            : "Download"}
                        </SelectValue>
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value={Constants.CourseType.COURSE}>
                        <div>
                          <div className="font-medium">Course</div>
                          <div className="text-sm text-muted-foreground">
                            Interactive learning experience
                          </div>
                        </div>
                      </SelectItem>
                      <SelectItem value={Constants.CourseType.DOWNLOAD}>
                        <div>
                          <div className="font-medium">Download</div>
                          <div className="text-sm text-muted-foreground">
                            Digital file or resource
                          </div>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={dialogControl.close}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSaving || isSubmitting}>
                {isSaving || isSubmitting ? "Creating..." : "Create Product"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export default function Page() {
  const searchParams = useSearchParams();
  const page = parseInt(searchParams?.get("page") || "1");
  const filter: "all" | CourseType =
    (searchParams?.get("filter") as "all" | CourseType) || "all";
  // const [page, setPage] = useState(parseInt(searchParams?.get("page") || "1") || 1);
  // const [filter, setFilter] = useState<"all" | CourseType>(searchParams?.get("filter") as "all" | CourseType || "all");
  const router = useRouter();

  const filterArray = useMemo(
    () => (filter === "all" ? undefined : [filter]),
    [filter],
  );

  const { products, loading, totalPages } = useProducts(
    page,
    ITEMS_PER_PAGE,
    filterArray,
  );

  const handleFilterChange = useCallback((value: "all" | CourseType) => {
    router.push(
      `/dashboard/products?${value !== "all" ? `filter=${value}` : ""}`,
    );
  }, []);

  const handlePageChange = useCallback(
    (value: number) => {
      router.push(
        `/dashboard/products?page=${value}${filter !== "all" ? `&filter=${filter}` : ""}`,
      );
    },
    [filter],
  );

  // if (
  //     !checkPermission(profile.permissions!, [
  //         permissions.manageAnyCourse,
  //         permissions.manageCourse,
  //     ])
  // ) {
  //     return <LoadingScreen />;
  // }

  return (
    <DashboardContent
      breadcrumbs={breadcrumbs}
      permissions={[permissions.manageAnyCourse, permissions.manageCourse]}
    >
      {/* <Products address={address} loading={false} siteinfo={siteinfo} /> */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-semibold mb-4">
          {MANAGE_COURSES_PAGE_HEADING}
        </h1>
        <div>
          <CreateProductDialog />
        </div>
      </div>
      {totalPages > 0 && (
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <Select value={filter} onValueChange={handleFilterChange}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              {[Constants.CourseType.COURSE, Constants.CourseType.DOWNLOAD].map(
                (status) => (
                  <SelectItem value={status} key={status}>
                    {capitalize(status)}
                  </SelectItem>
                ),
              )}
            </SelectContent>
          </Select>
        </div>
      )}
      {loading ? (
        <SkeletonGrid />
      ) : (
        <>
          {totalPages > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <ProductCard key={product.courseId} product={product as any} />
              ))}
            </div>
          )}
          {totalPages === 0 && <EmptyState />}
        </>
      )}
      {totalPages > 0 && (
        <PaginationControls
          currentPage={page}
          totalPages={Math.ceil(totalPages / ITEMS_PER_PAGE)}
          onPageChange={handlePageChange}
        />
      )}

      <Resources
        links={[
          {
            href: "https://docs.courselit.app/en/courses/introduction/",
            text: "Create a course",
          },
          {
            href: "https://docs.courselit.app/en/downloads/introduction/",
            text: "Create a digital download",
          },
        ]}
      />
    </DashboardContent>
  );
}
