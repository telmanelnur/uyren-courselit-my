"use client";

import DashboardContent from "@/components/admin/dashboard-content";
import PaymentPlanList from "@/components/admin/payments/payment-plan-list";
import { useAddress } from "@/components/contexts/address-context";
import { useProfile } from "@/components/contexts/profile-context";
import { useSiteInfo } from "@/components/contexts/site-info-context";
import { usePaymentPlanOperations } from "@/hooks/use-payment-plan-operations";
import useProduct from "@/hooks/use-product";
import { COURSE_TYPE_DOWNLOAD, MIMETYPE_IMAGE } from "@/lib/ui/config/constants";
import {
    APP_MESSAGE_COURSE_DELETED,
    APP_MESSAGE_COURSE_SAVED,
    BTN_DELETE_COURSE,
    BUTTON_CANCEL_TEXT,
    COURSE_SETTINGS_CARD_HEADER,
    DANGER_ZONE_HEADER,
    MANAGE_COURSES_PAGE_HEADING,
    PRICING_FREE,
    PRICING_FREE_LABEL,
    PRICING_FREE_SUBTITLE,
    PRICING_PAID_LABEL,
    PRICING_PAID_NO_PAYMENT_METHOD,
    PRICING_PAID_SUBTITLE,
    TOAST_TITLE_ERROR,
    TOAST_TITLE_SUCCESS
} from "@/lib/ui/config/strings";
import { truncate } from "@workspace/utils";
import { trpc } from "@/utils/trpc";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    Constants,
    Media,
    ProductPriceType,
    Profile,
    TextEditorContent
} from "@workspace/common-models";
import {
    getSymbolFromCurrency,
    MediaSelector,
    useToast,
} from "@workspace/components-library";
import { ContentEditorRef } from "@workspace/text-editor/tiptap";
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
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@workspace/ui/components/tooltip";
import { Trash2 } from "lucide-react";
import dynamic from "next/dynamic";
import { redirect, useParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import z from "zod";

const DescriptionEditor = dynamic(() =>
    import("@/components/editors/tiptap/templates/description/description-editor").then((mod) => ({ default: mod.DescriptionEditor })),
);

const { PaymentPlanType: paymentPlanType, MembershipEntityType } = Constants;


const productFormSchema = z.object({
    title: z.string().min(1, "Name is required").max(255, "Name is too long"),
    published: z.boolean(),
    isPrivate: z.boolean(),
    featuredImage: z.any().optional(),
    costType: z.nativeEnum(Constants.ProductPriceType),
    cost: z.number().min(0, "Cost must be non-negative"),
    leadMagnet: z.boolean(),
});
type ProductFormData = z.infer<typeof productFormSchema>;

export default function Page() {
    const { toast } = useToast();
    const params = useParams<{
        id: string;
    }>();
    const productId = params.id;
    const { address } = useAddress();
    const { product, loaded: productLoaded } = useProduct(productId);
    const { profile } = useProfile();
    const { siteInfo } = useSiteInfo();
    const form = useForm<ProductFormData>({
        resolver: zodResolver(productFormSchema),
        defaultValues: {
            title: "",
            published: false,
            isPrivate: false,
            featuredImage: {},
            costType: PRICING_FREE,
            cost: 0,
            leadMagnet: false,
        },
    });

    const parseDescription = (desc: unknown): string => {
        if (!desc) return "";
        if (typeof desc === "string") {
            try {
                const parsed = JSON.parse(desc);
                return typeof parsed === "string" ? parsed : desc;
            } catch {
                return desc;
            }
        }
        return "";
    };
    const breadcrumbs = useMemo(() => {
        return [
            { label: MANAGE_COURSES_PAGE_HEADING, href: "/dashboard/products" },
            {
                label: product ? truncate(product.title || "", 20) || "..." : "...",
                href: `/dashboard/product/${productId}`,
            },
            { label: COURSE_SETTINGS_CARD_HEADER, href: "#" },
        ]
    }, [product, productId]);



    const updateProductMutation = trpc.lmsModule.courseModule.course.update.useMutation({
        onSuccess: () => {
            toast({
                title: TOAST_TITLE_SUCCESS,
                description: APP_MESSAGE_COURSE_SAVED,
            });
        },
        onError: (error) => {
            toast({
                title: TOAST_TITLE_ERROR,
                description: error.message,
                variant: "destructive",
            });
        },
    });

    const deleteProductMutation = trpc.lmsModule.courseModule.course.delete.useMutation({
        onSuccess: () => {
            toast({
                title: TOAST_TITLE_SUCCESS,
                description: APP_MESSAGE_COURSE_DELETED,
            });
            redirect("/dashboard/products");
        },
        onError: (error) => {
            toast({
                title: TOAST_TITLE_ERROR,
                description: error.message,
                variant: "destructive",
            });
        },
    });

    const {
        paymentPlans,
        setPaymentPlans,
        defaultPaymentPlan,
        setDefaultPaymentPlan,
        onPlanSubmitted,
        onPlanArchived,
        onDefaultPlanChanged,
    } = usePaymentPlanOperations({
        id: productId,
        entityType: MembershipEntityType.COURSE,
    });

    useEffect(() => {
        if (product) {
            form.reset({
                title: product?.title,
                published: product?.published || false,
                isPrivate:
                    product?.privacy === Constants.ProductAccessType.UNLISTED || false,
                featuredImage:
                    product?.featuredImage || (null as string | null),
                costType:
                    product?.costType ||
                    (PRICING_FREE.toUpperCase() as ProductPriceType),
                cost: product?.cost || 0,
                leadMagnet: product?.leadMagnet || false,
            });
            setPaymentPlans(product.attachedPaymentPlans || []);
            setDefaultPaymentPlan(product?.defaultPaymentPlan || "");
        }
    }, [product, form]);

    if (productLoaded && !product) {
        redirect("/dashboard/products");
    }


    const watchedValues = form.watch();
    const handleUpdateField = async (field: keyof ProductFormData, value: any) => {
        if (!product?.courseId) return;

        const data: any = {};
        if (field === "isPrivate") {
            data.privacy = value ? Constants.ProductAccessType.UNLISTED : Constants.ProductAccessType.PUBLIC;
        } else {
            data[field] = value;
        }

        try {
            await updateProductMutation.mutateAsync({
                courseId: product.courseId,
                data,
            });
        } catch (error) {
            console.error(`Error updating ${field}:`, error);
        }
    };
    const handleSwitchChange = async (name: keyof ProductFormData) => {
        const currentValue = watchedValues[name] as boolean;
        const newValue = !currentValue;
        form.setValue(name, newValue);
        await handleUpdateField(name, newValue);
    };

    const [editorContent, setEditorContent] = useState<TextEditorContent>({
        type: "doc",
        content: "",
        assets: [],
        widgets: [],
        config: {
            editorType: "tiptap",
        },
    })
    const onSubmit = async (data: ProductFormData) => {
        if (!product?.courseId) return;

        try {
            await updateProductMutation.mutateAsync({
                courseId: product.courseId,
                data: {
                    title: data.title,
                    description: editorContent,
                },
            });
        } catch (error) {
            console.error("Error updating product:", error);
        }
    };
    const saveFeaturedImage = async (media?: Media) => {
        if (!product?.courseId) return;
        try {
            await updateProductMutation.mutateAsync({
                courseId: product.courseId,
                data: {
                    featuredImage: media || null,
                },
            });
            form.setValue("featuredImage", media || {});
        } catch (error) {
            console.error("Error updating featured image:", error);
        }
    };

    const options: Array<{
        label: string;
        value: string;
        sublabel: string;
        disabled?: boolean;
    }> = [
            {
                label: PRICING_FREE_LABEL,
                value: "FREE",
                sublabel: PRICING_FREE_SUBTITLE,
            },
            {
                label: PRICING_PAID_LABEL,
                value: "PAID",
                sublabel: siteInfo.paymentMethod
                    ? PRICING_PAID_SUBTITLE
                    : PRICING_PAID_NO_PAYMENT_METHOD,
                disabled: !siteInfo.paymentMethod,
            },
        ];

    const deleteProduct = async () => {
        if (!product?.courseId) return;

        try {
            await deleteProductMutation.mutateAsync({ courseId: product.courseId });
        } catch (error) {
            console.error("Error deleting product:", error);
        }
    };
    /* 
// OLD GraphQL delete function - COMMENTED OUT
const deleteProduct = async () => {
    if (!product) return;

    const query = `
        mutation {
            result: deleteCourse(id: "${product?.courseId}")
        }
    `;

    const fetch = new FetchBuilder()
        .setUrl(`${address.backend}/api/graph`)
        .setPayload(query)
        .setIsGraphQLEndpoint(true)
        .build();

    try {
        setLoading(true);
        const response = await fetch.exec();

        if (response.result) {
            redirect("/dashboard/products");
        }
    } catch (err: any) {
        toast({
            title: TOAST_TITLE_ERROR,
            description: err.message,
            variant: "destructive",
        });
    } finally {
        toast({
            title: TOAST_TITLE_SUCCESS,
            description: APP_MESSAGE_COURSE_DELETED,
        });
    }
};
*/

    const loading = updateProductMutation.isPending;
    const isSubmitting = form.formState.isSubmitting;


    if (!product) {
        return null;
    }


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
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                        {/* <div className="space-y-4">
                        <Label
                            htmlFor="name"
                            className="text-base font-semibold"
                        >
                            Name
                        </Label>
                        <Input
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            className={errors.name ? "border-red-500" : ""}
                        />
                        {errors.name && (
                            <p className="text-red-500 text-sm">
                                {errors.name}
                            </p>
                        )}
                    </div>

                    <div className="space-y-4">
                        <Label
                            htmlFor="description"
                            className="text-base font-semibold"
                        >
                            Description
                        </Label>

                        <TextEditor
                            initialContent={formData.description}
                            onChange={(state: any) => {
                                handleInputChange({
                                    target: {
                                        name: "description",
                                        value: state,
                                    },
                                });
                            }}
                            url={address.backend}
                            refresh={refresh}
                        />
                    </div> */}

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
                                    placeholder="Enter a description for your course..."
                                    onEditor={(editor, meta) => {
                                        if (meta.reason === "create") {
                                            editor!.commands.setContent(editorContent.content);
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

                        <Button type="submit" disabled={isSubmitting || loading}>
                            Save Changes
                        </Button>
                    </form>
                </Form>

                <Separator />

                <div className="space-y-4">
                    <h2 className="text-lg font-semibold">Featured image</h2>
                    <p className="text-sm text-muted-foreground">
                        The hero image for your course
                    </p>
                    {/* <MediaUpload
              type="image"
              value={formData.featuredImage}
              recommendedSize="1280x720px"
            /> */}
                    <MediaSelector
                        title=""
                        src={
                            (watchedValues.featuredImage &&
                                watchedValues.featuredImage.thumbnail) ||
                            ""
                        }
                        srcTitle={
                            (watchedValues.featuredImage &&
                                watchedValues.featuredImage.originalFileName) ||
                            ""
                        }
                        onSelection={(media?: Media) => {
                            media && form.setValue("featuredImage", media);
                            saveFeaturedImage(media);
                        }}
                        mimeTypesToShow={[...MIMETYPE_IMAGE]}
                        access="public"
                        strings={{}}
                        profile={profile as Profile}
                        address={address}
                        mediaId={
                            (watchedValues.featuredImage &&
                                watchedValues.featuredImage.mediaId) ||
                            ""
                        }
                        onRemove={() => {
                            form.setValue("featuredImage", {});
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

                {product?.type === COURSE_TYPE_DOWNLOAD && (
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label
                                className={`${paymentPlans.length !== 1 || !paymentPlans.some((plan) => plan.type === paymentPlanType.FREE) ? "text-muted-foreground" : ""} text-base font-semibold`}
                            >
                                Lead Magnet
                            </Label>
                            <p className="text-sm text-muted-foreground">
                                Send the product to user for free in exchange of
                                their email address
                            </p>
                        </div>
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <div>
                                        <Switch
                                            checked={watchedValues.leadMagnet}
                                            disabled={
                                                paymentPlans.length !== 1 ||
                                                !paymentPlans.some(
                                                    (plan) =>
                                                        plan.type ===
                                                        paymentPlanType.FREE,
                                                )
                                            }
                                            onCheckedChange={() =>
                                                handleSwitchChange("leadMagnet")
                                            }
                                        />
                                    </div>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>
                                        Product must have exactly one free
                                        payment plan to enable lead magnet
                                    </p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </div>
                )}

                {/* <div className="space-y-6">
                    <div className="space-y-4">
                        <Label className="text-lg font-semibold">
                            Pricing Model
                        </Label>
                        <Select
                            name="costType"
                            value={formData.costType}
                            title=""
                            onChange={handleCostTypeChange}
                            options={options}
                        />
                    </div>
                    {PRICING_PAID.toUpperCase() ===
                        formData.costType.toUpperCase() && (
                            <div className="space-y-2">
                                <Label className="text-base font-semibold">
                                    Price
                                </Label>
                                <div className="relative w-full sm:w-[200px]">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                                        {getSymbolFromCurrency(
                                            siteinfo.currencyISOCode || "USD",
                                        )}
                                    </span>
                                    <Input
                                        type="number"
                                        name="cost"
                                        placeholder="0.00"
                                        className="pl-8"
                                        value={formData.cost}
                                        onChange={(e) =>
                                            handleCostChange(+e.target.value)
                                        }
                                    />
                                </div>
                            </div>
                        )}
                </div> */}

                <Separator />

                <div className="space-y-6" id="publish">
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label className="text-base font-semibold">
                                Published
                            </Label>
                            <p className="text-sm text-muted-foreground">
                                Make this course available to students
                            </p>
                        </div>
                        <Switch
                            checked={watchedValues.published}
                            onCheckedChange={() =>
                                handleSwitchChange("published")
                            }
                        />
                    </div>
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label
                                className={`${!watchedValues.published ? "text-muted-foreground" : ""} text-base font-semibold`}
                            >
                                Visibility
                            </Label>
                            <p className="text-sm text-muted-foreground">
                                Only accessible via direct link
                            </p>
                        </div>
                        <Switch
                            checked={watchedValues.isPrivate}
                            onCheckedChange={() =>
                                handleSwitchChange("isPrivate")
                            }
                            disabled={!watchedValues.published}
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
                                disabled={loading}
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
                                    onClick={deleteProduct}
                                    disabled={loading}
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
