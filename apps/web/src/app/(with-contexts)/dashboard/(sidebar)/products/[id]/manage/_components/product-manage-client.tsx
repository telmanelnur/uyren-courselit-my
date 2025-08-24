"use client"

import DashboardContent from "@/components/admin/dashboard-content";
import {
    APP_MESSAGE_COURSE_SAVED,
    BTN_DELETE_COURSE,
    BUTTON_CANCEL_TEXT,
    DANGER_ZONE_HEADER,
    TOAST_TITLE_ERROR,
    TOAST_TITLE_SUCCESS,
} from "@/lib/ui/config/strings";
import { trpc } from "@/utils/trpc";
import { zodResolver } from "@hookform/resolvers/zod";
import { MIMETYPE_IMAGE } from "@/lib/ui/config/constants";
import { useAddress } from "@/components/contexts/address-context";
import { useProfile } from "@/components/contexts/profile-context";
import { Media, Profile } from "@workspace/common-models";
import {
    MediaSelector,
    useToast,
} from "@workspace/components-library";
import { Button } from "@workspace/ui/components/button";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@workspace/ui/components/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@workspace/ui/components/form";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import { Separator } from "@workspace/ui/components/separator";
import { Switch } from "@workspace/ui/components/switch";
import { Trash2 } from "lucide-react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm, } from "react-hook-form";
import z from "zod";

const DescriptionEditor = dynamic(() =>
    import("@/components/editors/tiptap/templates/description/description-editor").then((mod) => ({ default: mod.DescriptionEditor })),
);

const ProductSchema = z.object({
    title: z.string().min(1, "Title is required").max(255, "Title must be less than 255 characters"),
    description: z.any().optional(),
});

type ProductFormDataType = z.infer<typeof ProductSchema>;

interface ProductManageClientProps {
    product: any;
}

export default function ProductManageClient({ product }: ProductManageClientProps) {
    const router = useRouter();
    const { toast } = useToast();
    const { address } = useAddress();
    const { profile } = useProfile();

    const [editorContent, setEditorContent] = useState({
        type: "doc" as const,
        content: "",
        assets: [] as any[],
        widgets: [] as any[],
        config: {
            editorType: "tiptap" as const,
        },
    });

    const [featuredImage, setFeaturedImage] = useState(product.featuredImage || {});
    const [published, setPublished] = useState(product.published || false);
    const [isPrivate, setPrivate] = useState(product.privacy === "unlisted" || false);

    const form = useForm<ProductFormDataType>({
        resolver: zodResolver(ProductSchema),
        defaultValues: {
            title: product.title || "",
            description: product.description || "",
        }
    });

    const updateCourseMutation = trpc.lmsModule.courseModule.course.update.useMutation({
        onSuccess: () => {
            toast({
                title: TOAST_TITLE_SUCCESS,
                description: APP_MESSAGE_COURSE_SAVED,
            });
        },
        onError: (err: any) => {
            toast({
                title: TOAST_TITLE_ERROR,
                description: err.message,
                variant: "destructive",
            });
        },
    });

    const deleteProductMutation = trpc.lmsModule.courseModule.course.delete.useMutation({
        onSuccess: () => {
            toast({
                title: TOAST_TITLE_SUCCESS,
                description: "Product deleted successfully",
            });
            router.push("/dashboard/products");
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
            await updateCourseMutation.mutateAsync({
                courseId: product.courseId,
                data: {
                    title: data.title,
                    description: editorContent,
                },
            });
        } catch (error) {
            // Error handling is done in the mutation
        }
    };

    const saveFeaturedImage = async (media?: Media) => {
        if (!product?.courseId) return;
        try {
            await updateCourseMutation.mutateAsync({
                courseId: product.courseId,
                data: {
                    featuredImage: media || null,
                },
            });
        } catch (error) {
            console.error("Error updating featured image:", error);
        }
    };

    const updatePublishedStatus = async (published: boolean) => {
        try {
            await updateCourseMutation.mutateAsync({
                courseId: product.courseId,
                data: { published },
            });
        } catch (error) {
            console.error("Error updating published status:", error);
        }
    };

    const updatePrivacy = async (isPrivate: boolean) => {
        try {
            await updateCourseMutation.mutateAsync({
                courseId: product.courseId,
                data: {
                    privacy: isPrivate ? "unlisted" : "public",
                },
            });
        } catch (error) {
            console.error("Error updating privacy:", error);
        }
    };

    const isSubmitting = form.formState.isSubmitting;
    const isSaving = updateCourseMutation.isPending;

    // Initialize editor content with product description
    useEffect(() => {
        if (product.description) {
            try {
                const parsedDesc = typeof product.description === 'string'
                    ? JSON.parse(product.description)
                    : product.description;
                if (parsedDesc.content) {
                    setEditorContent(parsedDesc);
                }
            } catch (error) {
                // If parsing fails, use as plain text
                setEditorContent({
                    ...editorContent,
                    content: product.description,
                });
            }
        }
    }, [product.description]);

    const breadcrumbs = [
        { label: "Products", href: "/dashboard/products" },
        {
            label: product.title || "Product",
            href: `/dashboard/products/${product.courseId}`
        },
        { label: "Manage", href: "#" }
    ];

    return (
        <DashboardContent breadcrumbs={breadcrumbs}>
            <div className="space-y-8">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-4xl font-semibold">Manage</h1>
                        <p className="text-muted-foreground mt-2">
                            Manage your product settings
                        </p>
                    </div>
                </div>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
                        <FormField
                            control={form.control}
                            name="title"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-base font-semibold">
                                        Title
                                    </FormLabel>
                                    <FormControl>
                                        <Input {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormItem>
                            <FormLabel className="text-base font-semibold">
                                Description
                            </FormLabel>
                            <FormControl>
                                <DescriptionEditor
                                    placeholder="Enter a description for your product..."
                                    // onEditor={(editor, meta) => {
                                    //     if (meta.reason === "create") {
                                    //         editor!.commands.setContent(editorContent.content);
                                    //     }
                                    // }}
                                    // onChange={(content) => {
                                    //     setEditorContent({
                                    //         ...editorContent,
                                    //         content: content,
                                    //     });
                                    // }}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>

                        <Button type="submit" disabled={isSaving || isSubmitting}>
                            Save Changes
                        </Button>
                    </form>
                </Form>

                <Separator />

                <div className="space-y-4">
                    <h2 className="text-lg font-semibold">Featured image</h2>
                    <p className="text-sm text-muted-foreground">
                        The hero image for your product
                    </p>
                    <MediaSelector
                        title=""
                        src={
                            (featuredImage &&
                                featuredImage.thumbnail) ||
                            ""
                        }
                        srcTitle={
                            (featuredImage &&
                                featuredImage.originalFileName) ||
                            ""
                        }
                        onSelection={(media?: Media) => {
                            if (media) {
                                setFeaturedImage(media);
                                saveFeaturedImage(media);
                            }
                        }}
                        mimeTypesToShow={[...MIMETYPE_IMAGE]}
                        access="public"
                        strings={{}}
                        profile={profile as Profile}
                        address={address}
                        mediaId={
                            (featuredImage &&
                                featuredImage.mediaId) ||
                            ""
                        }
                        onRemove={() => {
                            setFeaturedImage({});
                            saveFeaturedImage();
                        }}
                        type="course"
                    />
                </div>

                <Separator />

                <div className="space-y-6" id="publish">
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label className="text-base font-semibold">
                                Published
                            </Label>
                            <p className="text-sm text-muted-foreground">
                                Make this product available to customers
                            </p>
                        </div>
                        <Switch
                            checked={published}
                            onCheckedChange={(checked) => {
                                setPublished(checked);
                                updatePublishedStatus(checked);
                            }}
                        />
                    </div>
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label
                                className={`${!published ? "text-muted-foreground" : ""} text-base font-semibold`}
                            >
                                Visibility
                            </Label>
                            <p className="text-sm text-muted-foreground">
                                Only accessible via direct link
                            </p>
                        </div>
                        <Switch
                            checked={isPrivate}
                            onCheckedChange={(checked) => {
                                setPrivate(checked);
                                updatePrivacy(checked);
                            }}
                            disabled={!published}
                        />
                    </div>
                </div>

                <Separator />

                <div className="space-y-4">
                    <h2 className="text-destructive font-semibold">
                        {DANGER_ZONE_HEADER}
                    </h2>
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button
                                type="button"
                                variant="destructive"
                                disabled={isSaving}
                            >
                                <Trash2 className="mr-2 h-4 w-4" />
                                {BTN_DELETE_COURSE}
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>
                                    Are you sure you want to delete this
                                    product?
                                </DialogTitle>
                                <DialogDescription>
                                    This action cannot be undone. This will
                                    permanently delete the product and remove
                                    all associated data from our servers.
                                </DialogDescription>
                            </DialogHeader>
                            <DialogFooter>
                                <DialogClose asChild>
                                    <Button variant="outline">
                                        {BUTTON_CANCEL_TEXT}
                                    </Button>
                                </DialogClose>
                                <Button
                                    variant="destructive"
                                    onClick={() => deleteProductMutation.mutateAsync({ courseId: product.courseId })}
                                    disabled={isSaving}
                                >
                                    {BTN_DELETE_COURSE}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>
        </DashboardContent>
    );
}
