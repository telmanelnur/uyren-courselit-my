"use client";

import {
  COURSE_TYPE_COURSE,
  COURSE_TYPE_DOWNLOAD,
} from "@/lib/ui/config//constants";
import {
  BTN_CONTINUE,
  BTN_NEW_PRODUCT,
  BUTTON_CANCEL_TEXT,
  FORM_NEW_PRODUCT_MENU_COURSE_SUBTITLE,
  FORM_NEW_PRODUCT_MENU_DOWNLOADS_SUBTITLE,
  FORM_NEW_PRODUCT_TITLE_PLC,
  FORM_NEW_PRODUCT_TYPE,
  TOAST_TITLE_ERROR,
} from "@/lib/ui/config/strings";
import { capitalize } from "@/lib/ui/lib/utils";
import { trpc } from "@/utils/trpc";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@workspace/components-library";
import { Button } from "@workspace/ui/components/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
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
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import z from "zod";

const ProductSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(255, "Title must be less than 255 characters"),
  type: z.enum([COURSE_TYPE_COURSE, COURSE_TYPE_DOWNLOAD]),
});

type ProductFormDataType = z.infer<typeof ProductSchema>;

export function NewProduct() {
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<ProductFormDataType>({
    resolver: zodResolver(ProductSchema),
    defaultValues: {
      title: "",
      type: COURSE_TYPE_COURSE,
    },
  });

  const createCourseMutation =
    trpc.lmsModule.courseModule.course.create.useMutation({
      onSuccess: (response) => {
        toast({
          title: "Success",
          description: "Product created successfully",
        });
        router.replace(`/dashboard/products/${response.courseId}`);
      },
      onError: (err: any) => {
        toast({
          title: TOAST_TITLE_ERROR,
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
    <div className="space-y-6">
      <div className="flex flex-col">
        <h1 className="text-4xl font-semibold mb-4">{BTN_NEW_PRODUCT}</h1>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/dashboard/products")}
            >
              {BUTTON_CANCEL_TEXT}
            </Button>
            <Button type="submit" disabled={isSaving || isSubmitting}>
              {isSaving || isSubmitting ? "Creating..." : BTN_CONTINUE}
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Product Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder={FORM_NEW_PRODUCT_TITLE_PLC}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>{FORM_NEW_PRODUCT_TYPE}</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value={COURSE_TYPE_COURSE}>
                          <div>
                            <div className="font-medium">
                              {capitalize(COURSE_TYPE_COURSE)}
                            </div>
                            {/* <div className="text-sm text-muted-foreground">{FORM_NEW_PRODUCT_MENU_COURSE_SUBTITLE}</div> */}
                          </div>
                        </SelectItem>
                        <SelectItem value={COURSE_TYPE_DOWNLOAD}>
                          <div>
                            <div className="font-medium">
                              {capitalize(COURSE_TYPE_DOWNLOAD)}
                            </div>
                            {/* <div className="text-sm text-muted-foreground">{FORM_NEW_PRODUCT_MENU_DOWNLOADS_SUBTITLE}</div> */}
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
        </form>
      </Form>
    </div>
  );
}
