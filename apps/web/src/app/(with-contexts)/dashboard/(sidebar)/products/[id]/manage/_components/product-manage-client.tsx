"use client"

import DashboardContent from "@/components/admin/dashboard-content";
import HeaderTopbar from "@/components/admin/layout/header-topbar";
import PaymentPlanList from "@/components/admin/payments/payment-plan-list";
import { useAddress } from "@/components/contexts/address-context";
import { useProfile } from "@/components/contexts/profile-context";
import { useSiteInfo } from "@/components/contexts/site-info-context";
import { usePaymentPlanOperations } from "@/hooks/use-payment-plan-operations";
import { MIMETYPE_IMAGE } from "@/lib/ui/config/constants";
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
import { Constants, Media, Profile } from "@workspace/common-models";
import {
    ComboBox2,
    getSymbolFromCurrency,
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
import { useCallback, useEffect, useState } from "react";
import { useForm, } from "react-hook-form";
import z from "zod";

const DescriptionEditor = dynamic(() =>
    import("@/components/editors/tiptap/templates/description/description-editor").then((mod) => ({ default: mod.DescriptionEditor })),
);

const { PaymentPlanType: paymentPlanType, MembershipEntityType } = Constants;

const ProductSchema = z.object({
    title: z.string().min(1, "Title is required").max(255, "Title must be less than 255 characters"),
    description: z.any().optional(),
    themeId: z.string().optional(),
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
    const { siteInfo } = useSiteInfo();

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
    const [selectedTheme, setSelectedTheme] = useState<{ key: string; title: string } | null>(
        product.themeId ? { key: product.themeId, title: "" } : null
    );

    const {
        paymentPlans,
        setPaymentPlans,
        defaultPaymentPlan,
        setDefaultPaymentPlan,
        onPlanSubmitted,
        onPlanArchived,
        onDefaultPlanChanged,
    } = usePaymentPlanOperations({
        id: product.courseId,
        entityType: MembershipEntityType.COURSE,
    });

    const form = useForm<ProductFormDataType>({
        resolver: zodResolver(ProductSchema),
        defaultValues: {
            title: product.title || "",
            description: product.description || "",
            themeId: product.themeId || "",
        },
    });

    const trpcUtils = trpc.useUtils();
    const fetchThemes = useCallback(async (search: string, offset: number, size: number) => {
        try {
            const response = await trpcUtils.lmsModule.themeModule.theme.list.fetch({
                pagination: { skip: offset, take: size },
                search: search ? { q: search } : undefined,
                filter: { status: "published" },
            });
            return response.items.map((theme: any) => ({
                key: theme._id,
                title: theme.name,
            }));
        } catch (error) {
            console.error("Failed to fetch themes:", error);
            return [];
        }
    }, [trpcUtils]);

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

    // Initialize payment plans and default plan
    useEffect(() => {
        if (product) {
            setPaymentPlans(product.attachedPaymentPlans || []);
            setDefaultPaymentPlan(product?.defaultPaymentPlan || "");
        }
    }, [product, setPaymentPlans, setDefaultPaymentPlan]);

    const handleSubmit = async (data: ProductFormDataType) => {
        try {
            await updateCourseMutation.mutateAsync({
                courseId: product.courseId,
                data: {
                    title: data.title,
                    description: editorContent,
                    themeId: data.themeId,
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

    // Initialize themeId in form when product loads
    useEffect(() => {
        if (product.themeId) {
            form.setValue('themeId', product.themeId);
            // Fetch the theme name to display
            fetchThemes("", 0, 100).then(themes => {
                const theme = themes.find(t => t.key === product.themeId);
                if (theme) {
                    setSelectedTheme(theme);
                }
            });
        }
    }, [product.themeId, form, fetchThemes]);

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
                <HeaderTopbar
                    header={{
                        title: "Manage",
                        subtitle: " Manage your product settings"
                    }}
                />

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
                                    onEditor={(editor, meta) => {
                                        if (meta.reason === "create") {
                                            editor!.commands.setMyContent(editorContent);
                                        }
                                    }}
                                    onChange={(content) => {
                                        setEditorContent({
                                            ...editorContent,
                                            content: content,
                                        });
                                    }}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>

                        <FormField
                            control={form.control}
                            name="themeId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-base font-semibold">
                                        Course Theme
                                    </FormLabel>
                                    <FormControl>
                                        <ComboBox2<{ key: string; title: string }>
                                            title="Select a theme"
                                            valueKey="key"
                                            value={selectedTheme || undefined}
                                            searchFn={fetchThemes}
                                            renderText={(item) => item.title}
                                            onChange={(item) => {
                                                setSelectedTheme(item);
                                                field.onChange(item?.key || "");
                                            }}
                                            multiple={false}
                                            showCreateButton={true}
                                            showEditButton={true}
                                            onCreateClick={() => {
                                                router.push('/dashboard/lms/themes/new');
                                            }}
                                            onEditClick={(item) => {
                                                router.push(`/dashboard/lms/themes/${item.key}`);
                                            }}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

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

                <div className="space-y-4 flex flex-col md:flex-row md:items-start md:justify-between w-full">
                    <div className="space-y-2">
                        <Label className="text-lg font-semibold">Pricing</Label>
                        <p className="text-sm text-muted-foreground">
                            Manage your product&apos;s pricing plans
                        </p>
                    </div>
                    <PaymentPlanList
                        paymentPlans={paymentPlans.map((plan) => ({
                            ...plan,
                            type: plan.type,
                        }))}
                        onPlanSubmit={async (values) => {
                            try {
                                await onPlanSubmitted(values);
                            } catch (err: any) {
                                toast({
                                    title: TOAST_TITLE_ERROR,
                                    description: err.message,
                                });
                            }
                        }}
                        onPlanArchived={async (id) => {
                            try {
                                await onPlanArchived(id);
                            } catch (err: any) {
                                toast({
                                    title: TOAST_TITLE_ERROR,
                                    description: err.message,
                                    variant: "destructive",
                                });
                            }
                        }}
                        allowedPlanTypes={[
                            paymentPlanType.SUBSCRIPTION,
                            paymentPlanType.FREE,
                            paymentPlanType.ONE_TIME,
                            paymentPlanType.EMI,
                        ]}
                        currencySymbol={getSymbolFromCurrency(
                            siteInfo.currencyISOCode || "USD",
                        )}
                        currencyISOCode={
                            siteInfo.currencyISOCode?.toUpperCase() || "USD"
                        }
                        onDefaultPlanChanged={async (id) => {
                            try {
                                await onDefaultPlanChanged(id);
                            } catch (err: any) {
                                toast({
                                    title: TOAST_TITLE_ERROR,
                                    description: err.message,
                                });
                            }
                        }}
                        defaultPaymentPlanId={defaultPaymentPlan}
                        paymentMethod={siteInfo.paymentMethod}
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
