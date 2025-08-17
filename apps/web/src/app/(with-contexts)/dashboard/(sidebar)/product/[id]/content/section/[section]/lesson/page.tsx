"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import { RadioGroup, RadioGroupItem } from "@workspace/ui/components/radio-group";
import { Switch } from "@workspace/ui/components/switch";
import {
    File,
    FileImage,
    FileText,
    Headphones,
    HelpCircle,
    Trash2,
    Tv,
    Video
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@workspace/ui/components/dialog";

import DashboardContent from "@/components/admin/dashboard-content";
import { useAddress } from "@/components/contexts/address-context";
import { useProfile } from "@/components/contexts/profile-context";
import useProduct from "@/hooks/use-product";
import {
    MIMETYPE_AUDIO,
    MIMETYPE_PDF,
    MIMETYPE_VIDEO,
} from "@/lib/ui/config/constants";
import {
    APP_MESSAGE_LESSON_DELETED,
    BUTTON_NEW_LESSON_TEXT,
    COURSE_CONTENT_HEADER,
    EDIT_LESSON_TEXT,
    MANAGE_COURSES_PAGE_HEADING,
    TOAST_TITLE_ERROR,
    TOAST_TITLE_SUCCESS,
} from "@/lib/ui/config/strings";
import { truncate } from "@workspace/utils";
import { trpc } from "@/utils/trpc";
import {
    Constants,
    Lesson,
    LessonType,
    Media,
    Quiz,
    TextEditorContent,
    UIConstants
} from "@workspace/common-models";
import {
    useToast
} from "@workspace/components-library";
import { ContentEditorRef } from "@workspace/text-editor/tiptap";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@workspace/ui/components/form";
import { Skeleton } from "@workspace/ui/components/skeleton";
import dynamic from "next/dynamic";

const LessonContentEditor = dynamic(() => import("@/components/editors/tiptap/templates/lesson-content/lesson-content-editor").then(mod => mod.LessonContentEditor));
// interface Question {
//     id: string;
//     text: string;
//     options: Array<{ id: string; text: string; isCorrect: boolean }>;
// }

// Zod validation schema
const lessonFormSchema = z.object({
    title: z.string().min(1, "Please enter a lesson title.").trim(),
    type: z.nativeEnum(Constants.LessonType),
    content: z.any().optional(),
    requiresEnrollment: z.boolean(),
    downloadable: z.boolean(),
    embedUrl: z.string().optional(),
});

type LessonFormData = z.infer<typeof lessonFormSchema>;

const lessonTypes = [
    { value: Constants.LessonType.TEXT, label: "Text", icon: FileText },
    { value: Constants.LessonType.VIDEO, label: "Video", icon: Video },
    { value: Constants.LessonType.AUDIO, label: "Audio", icon: Headphones },
    { value: Constants.LessonType.PDF, label: "PDF", icon: FileImage },
    { value: Constants.LessonType.FILE, label: "File", icon: File },
    { value: Constants.LessonType.EMBED, label: "Embed", icon: Tv },
    { value: Constants.LessonType.QUIZ, label: "Quiz", icon: HelpCircle },
] as const;

// interface LessonState {
//     type: Lesson;
//     title: string;
//     content: { value: string } | TextEditorContent | Quiz;
//     // embedUrl: string;
//     // isPreviewEnabled: boolean;
//     questions: Question[];
//     requiresPassingGrade: boolean;
//     passingGrade: string;
//     // mediaUrl: string | null;
//     // mediaCaption: string;
//     media?: Media;
// }

export default function LessonPage() {
    const router = useRouter();
    const params = useParams();
    const searchParams = useSearchParams();
    const productId = params.id as string;
    const lessonId = searchParams.get("id");
    const sectionId = params.section as string;
    const isEditing = !!lessonId;
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const { toast } = useToast();
    const [initialLessonType, setInitialLessonType] =
        useState<LessonType | null>(null);
    const { address } = useAddress();
    const { profile } = useProfile();
    const { product, loaded: productLoaded } = useProduct(productId);

    // Form setup
    const form = useForm<LessonFormData>({
        resolver: zodResolver(lessonFormSchema),
        defaultValues: {
            title: "",
            type: product?.type?.toLowerCase() === UIConstants.COURSE_TYPE_DOWNLOAD
                ? Constants.LessonType.FILE
                : Constants.LessonType.TEXT,
            content: "",
            requiresEnrollment: true,
            downloadable: false,
            embedUrl: "",
        },
    });
    const breadcrumbs = useMemo(() => [
        { label: MANAGE_COURSES_PAGE_HEADING, href: "/dashboard/products" },
        {
            label: product ? truncate(product.title || "", 20) || "..." : "...",
            href: `/dashboard/product/${productId}`,
        },
        {
            label: COURSE_CONTENT_HEADER,
            href: `/dashboard/product/${productId}/content`,
        },
        {
            label: isEditing ? EDIT_LESSON_TEXT : BUTTON_NEW_LESSON_TEXT,
            href: "#",
        },
    ], [product]);

    const editorRef = useRef<ContentEditorRef>(null);
    const [editorContent, setEditorContent] = useState<TextEditorContent>({
        type: "doc",
        content: "",
        assets: [],
        widgets: [],
        config: { editorType: "tiptap" },
    });
    const [lessonData, setLessonData] = useState<Lesson | null>(null);
    const currentFormValues = form.watch();

    useEffect(() => {
        if (product && !isEditing) {
            const defaultType = product.type?.toLowerCase() === UIConstants.COURSE_TYPE_DOWNLOAD
                ? Constants.LessonType.FILE
                : Constants.LessonType.TEXT;
            form.setValue("type", defaultType);
        }
    }, [product, form, isEditing]);


    const onSubmit = async (data: LessonFormData) => {
        if (isEditing) {
            await updateLessonOnServer(data);
        } else {
            await createLessonOnServer(data);
        }
    };

    const trpcUtils = trpc.useUtils()

    const updateLessonMutation = trpc.lmsModule.courseModule.lesson.update.useMutation({
        onSuccess: () => {
            trpcUtils.lmsModule.courseModule.lesson.getById.invalidate()
            trpcUtils.lmsModule.courseModule.course.getByCourseDetailed.invalidate()
        },
    });

    const loadLessonQuery = trpc.lmsModule.courseModule.lesson.getById.useQuery({
        id: lessonId!,
    }, {
        enabled: !!lessonId,
    });

    useEffect(() => {
        if (loadLessonQuery.data) {
            const response = loadLessonQuery.data;
            setLessonData(response);
            setInitialLessonType(
                response.type,
            );
            form.reset({
                title: response.title || "",
                type: response.type,
                requiresEnrollment: response.requiresEnrollment ?? true,
                downloadable: response.downloadable ?? false,
                content: "",
                embedUrl: "",
            });

            if (response.type === Constants.LessonType.TEXT) {
                if (typeof response.content !== "object") {
                    throw new Error("Content is not an object");
                }
                const typedContent = response.content as TextEditorContent;
                if (typedContent.type === "doc") {
                    setEditorContent(typedContent);
                } else {
                    throw new Error("Content is not a text editor content");
                }
            }
        }
    }, [loadLessonQuery.data]);
    useEffect(() => {
        if (loadLessonQuery.error) {
            toast({
                title: TOAST_TITLE_ERROR,
                description: loadLessonQuery.error.message,
                variant: "destructive",
            });
        }
    }, [loadLessonQuery.error])


    const updateLessonOnServer = useCallback(async (data: LessonFormData) => {
        try {
            await updateLessonMutation.mutateAsync({
                id: lessonId!,
                data: {
                    title: data.title,
                    downloadable: data.downloadable,
                    content: editorContent,
                    requiresEnrollment: data.requiresEnrollment,
                },
            });
            toast({
                title: TOAST_TITLE_SUCCESS,
                description: "Lesson updated",
            });
            router.push(`/dashboard/product/${productId}/content`);
        } catch (err: any) {
            toast({
                title: TOAST_TITLE_ERROR,
                description: err.message,
                variant: "destructive",
            });
        }
    }, [lessonId, toast, updateLessonMutation, router, productId]);

    const createLessonMutation = trpc.lmsModule.courseModule.lesson.create.useMutation({
        onSuccess: () => {
            trpcUtils.lmsModule.courseModule.lesson.getById.invalidate()
            trpcUtils.lmsModule.courseModule.course.getByCourseDetailed.invalidate()
        },
    });

    const createLessonOnServer = useCallback(async (data: LessonFormData) => {
        try {
            const response = await createLessonMutation.mutateAsync({
                data: {
                    title: data.title,
                    downloadable: data.downloadable,
                    type: data.type,
                    content: editorContent,
                    courseId: productId,
                    requiresEnrollment: data.requiresEnrollment,
                    groupId: sectionId,
                },
            });
            if (response) {
                if (
                    [
                        Constants.LessonType.TEXT,
                        Constants.LessonType.EMBED,
                        Constants.LessonType.QUIZ,
                    ].includes(data.type as any)
                ) {
                    router.replace(`/dashboard/product/${productId}/content`);
                } else {
                    router.replace(
                        `/dashboard/product/${productId}/content/section/${sectionId}/lesson?id=${response.lessonId}`,
                    );
                }
            }
        } catch (err: any) {
            toast({
                title: TOAST_TITLE_ERROR,
                description: err.message,
                variant: "destructive",
            });
        }
    }, [lessonId, toast, updateLessonMutation, router, productId]);

    const deleteLessonMutation = trpc.lmsModule.courseModule.lesson.delete.useMutation({
        onSuccess: () => {
            trpcUtils.lmsModule.courseModule.lesson.getById.invalidate()
            trpcUtils.lmsModule.courseModule.course.getByCourseDetailed.invalidate()
        },
    });

    const onLessonDelete = useCallback(async () => {
        if (lessonData?.lessonId) {
            try {
                await deleteLessonMutation.mutateAsync({
                    id: lessonData!.lessonId!,
                });
                toast({
                    title: TOAST_TITLE_SUCCESS,
                    description: APP_MESSAGE_LESSON_DELETED,
                });
                router.replace(`/dashboard/product/${productId}/content`);
            } catch (err: any) {
                toast({
                    title: TOAST_TITLE_ERROR,
                    description: err.message,
                    variant: "destructive",
                });
            }
        }
    }, [lessonData?.lessonId, toast, deleteLessonMutation, router, productId]);
    const isLoading = (updateLessonMutation?.isPending || createLessonMutation?.isPending || loadLessonQuery?.isLoading) as boolean;

    return (
        <DashboardContent breadcrumbs={breadcrumbs}>
            <header>
                <h1 className="text-4xl font-semibold">
                    {product?.type?.toLowerCase() ===
                        Constants.CourseType.COURSE &&
                        (isEditing ? "Edit Lesson" : "New Lesson")}
                    {product?.type?.toLowerCase() ===
                        Constants.CourseType.DOWNLOAD &&
                        (isEditing ? "Edit File" : "New File")}
                </h1>
                <p className="text-muted-foreground mt-2">
                    {product?.type?.toLowerCase() ===
                        Constants.CourseType.COURSE &&
                        (isEditing
                            ? "Modify the details of your existing lesson"
                            : "Create a new lesson for your product")}
                    {product?.type?.toLowerCase() ===
                        Constants.CourseType.DOWNLOAD &&
                        (isEditing
                            ? "Modify the details of your existing file"
                            : "Create a new file for your product")}
                </p>
            </header>

            {!productLoaded || (isEditing && isLoading) ? (
                <LessonSkeleton />
            ) : (
                <>
                    <Form {...form}>
                        <form className="space-y-8 mb-4" onSubmit={form.handleSubmit(onSubmit)}>
                            {product?.type ===
                                UIConstants.COURSE_TYPE_COURSE && (
                                    <FormField
                                        control={form.control}
                                        name="type"
                                        render={({ field }) => (
                                            <FormItem className="space-y-4">
                                                <FormLabel className="font-semibold">
                                                    Lesson Type
                                                </FormLabel>
                                                <FormControl>
                                                    <RadioGroup
                                                        onValueChange={field.onChange}
                                                        value={field.value}
                                                        className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-4"
                                                        disabled={isEditing}
                                                    >
                                                        {lessonTypes.map(
                                                            ({ value, label, icon: Icon }) => (
                                                                <Label
                                                                    key={value}
                                                                    htmlFor={value}
                                                                    className={`flex flex-col items-center justify-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground [&:has([data-state=checked])]:border-primary ${field.value === value
                                                                        ? "border-primary"
                                                                        : ""
                                                                        } ${isEditing && value !== initialLessonType ? "opacity-50 cursor-not-allowed" : ""}`}
                                                                >
                                                                    <RadioGroupItem
                                                                        value={value}
                                                                        id={value}
                                                                        className="sr-only"
                                                                        disabled={
                                                                            isEditing &&
                                                                            value !==
                                                                            initialLessonType
                                                                        }
                                                                    />
                                                                    <Icon className="mb-2 h-6 w-6" />
                                                                    {label}
                                                                </Label>
                                                            ),
                                                        )}
                                                    </RadioGroup>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                )}

                            <FormField
                                control={form.control}
                                name="title"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="font-semibold">
                                            Title
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="Enter lesson title"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="requiresEnrollment"
                                    render={({ field }) => (
                                        <FormItem className="flex items-center justify-between">
                                            <div className="space-y-0.5">
                                                <FormLabel className="font-semibold">
                                                    Preview
                                                </FormLabel>
                                                <p className="text-sm text-muted-foreground">
                                                    Allow students to preview this lesson
                                                </p>
                                            </div>
                                            <FormControl>
                                                <Switch
                                                    checked={!field.value}
                                                    onCheckedChange={(checked) =>
                                                        field.onChange(!checked)
                                                    }
                                                />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="flex items-center justify-between pt-6">
                                <Dialog
                                    open={isDeleteDialogOpen}
                                    onOpenChange={setIsDeleteDialogOpen}
                                >
                                    <DialogTrigger asChild>
                                        <Button variant="outline">
                                            <Trash2 className="mr-2 h-4 w-4" />
                                            Delete
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle>
                                                Are you sure you want to delete this
                                                lesson?
                                            </DialogTitle>
                                            <DialogDescription>
                                                This action cannot be undone. This
                                                will permanently delete the lesson
                                                {currentFormValues.title &&
                                                    ` "${currentFormValues.title}"`}{" "}
                                                and remove it from our servers.
                                            </DialogDescription>
                                        </DialogHeader>
                                        <DialogFooter>
                                            <Button
                                                variant="outline"
                                                onClick={() =>
                                                    setIsDeleteDialogOpen(false)
                                                }
                                            >
                                                Cancel
                                            </Button>
                                            <Button
                                                variant="destructive"
                                                onClick={() => {
                                                    setIsDeleteDialogOpen(false);
                                                    onLessonDelete();
                                                }}
                                            >
                                                Delete
                                            </Button>
                                        </DialogFooter>
                                    </DialogContent>
                                </Dialog>
                                <div className="space-x-2">
                                    <Button variant="outline" asChild>
                                        <Link
                                            href={`/dashboard/product/${productId}/content`}
                                        >
                                            Cancel
                                        </Link>
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={form.formState.isSubmitting}
                                    >
                                        {form.formState.isSubmitting
                                            ? "Saving..."
                                            : (isEditing ? "Update" : "Save") + " Lesson"}
                                    </Button>
                                </div>
                            </div>
                        </form>
                    </Form>

                    {/* TextContent Editor moved outside of form */}
                    <div className="mt-8">
                        <LessonContentEditor
                            ref={editorRef}
                            onEditor={(editor, meta) => {
                                if (meta.reason === "create") {
                                    editor!.commands.setMyEditorContent(editorContent);
                                }
                            }}
                            onChange={(content) => {
                                setEditorContent({
                                    ...editorContent,
                                    content: content,
                                });
                            }}
                            placeholder="Start writing your lesson content..."
                        />
                    </div>
                </>
            )}
        </DashboardContent>
    );
}


// Add skeleton component
const LessonSkeleton = () => (
    <div className="space-y-8 animate-pulse">
        <div className="space-y-4">
            <Skeleton className="h-8 w-48" />
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-4">
                {[...Array(7)].map((_, i) => (
                    <Skeleton key={i} className="h-24 w-full rounded-md" />
                ))}
            </div>
        </div>

        <div className="space-y-4">
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-10 w-full" />
        </div>

        <div className="space-y-4">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-[200px] w-full" />
        </div>

        <div className="flex items-center justify-between pt-6">
            <Skeleton className="h-10 w-24" />
            <div className="space-x-2">
                <Skeleton className="h-10 w-24 inline-block" />
                <Skeleton className="h-10 w-24 inline-block" />
            </div>
        </div>
    </div>
);