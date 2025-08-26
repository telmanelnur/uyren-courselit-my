"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import {
  RadioGroup,
  RadioGroupItem,
} from "@workspace/ui/components/radio-group";
import { Switch } from "@workspace/ui/components/switch";
import {
  File,
  FileImage,
  FileText,
  Headphones,
  HelpCircle,
  Trash2,
  Tv,
  Video,
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";

import DashboardContent from "@/components/admin/dashboard-content";
import { useAddress } from "@/components/contexts/address-context";
import { useProfile } from "@/components/contexts/profile-context";
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
  UIConstants,
} from "@workspace/common-models";
import { useToast } from "@workspace/components-library";
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

const LessonContentEditor = dynamic(() =>
  import(
    "@/components/editors/tiptap/templates/lesson-content/lesson-content-editor"
  ).then((mod) => mod.LessonContentEditor),
);

// Zod validation schema
const lessonFormSchema = z.object({
  title: z.string().min(1, "Please enter a lesson title.").trim(),
  type: z.nativeEnum(Constants.LessonType),
  requiresEnrollment: z.boolean(),
  downloadable: z.boolean(),
  embedUrl: z.string().optional(),
});

type LessonFormData = z.infer<typeof lessonFormSchema>;

const lessonTypes = [
  { value: Constants.LessonType.TEXT, label: "Text", icon: FileText },
  { value: Constants.LessonType.VIDEO, label: "Video", icon: Video },
  { value: Constants.LessonType.QUIZ, label: "Quiz", icon: HelpCircle },
  { value: Constants.LessonType.FILE, label: "File", icon: File },
];

export default function LessonPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const { id: productId, section: sectionId } = params;
  const lessonId = searchParams.get("id");
  const isEditing = !!lessonId;

  const { profile } = useProfile();
  const { address } = useAddress();
  const { toast } = useToast();

  const { data: product, isLoading: productLoading } =
    trpc.lmsModule.courseModule.course.getByCourseDetailed.useQuery({
      courseId: productId as string,
    });

  const { data: lesson, isLoading: lessonLoading } =
    trpc.lmsModule.courseModule.lesson.getById.useQuery(
      {
        lessonId: lessonId!,
      },
      {
        enabled: !!lessonId,
      },
    );

  // Form setup
  const form = useForm<LessonFormData>({
    resolver: zodResolver(lessonFormSchema),
    defaultValues: {
      title: "",
      type:
        product?.type?.toLowerCase() === UIConstants.COURSE_TYPE_DOWNLOAD
          ? Constants.LessonType.FILE
          : Constants.LessonType.TEXT,
      requiresEnrollment: true,
      downloadable: false,
    },
  });

  const breadcrumbs = useMemo(
    () => [
      { label: MANAGE_COURSES_PAGE_HEADING, href: "/dashboard/products" },
      {
        label: product ? truncate(product.title || "", 20) || "..." : "...",
        href: `/dashboard/products/${productId}`,
      },
      {
        label: COURSE_CONTENT_HEADER,
        href: `/dashboard/products/${productId}/content`,
      },
      {
        label: isEditing ? EDIT_LESSON_TEXT : BUTTON_NEW_LESSON_TEXT,
        href: "#",
      },
    ],
    [product, productId, isEditing],
  );

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
      const defaultType =
        product.type?.toLowerCase() === UIConstants.COURSE_TYPE_DOWNLOAD
          ? Constants.LessonType.FILE
          : Constants.LessonType.TEXT;
      form.setValue("type", defaultType);
    }
  }, [product, form, isEditing]);

  useEffect(() => {
    if (lesson && isEditing) {
      setEditorContent(lesson.content as TextEditorContent);
      form.reset({
        title: lesson.title,
        type: lesson.type,
        requiresEnrollment: lesson.requiresEnrollment,
        downloadable: lesson.downloadable,
      });
      setLessonData(lesson);
    }
  }, [lesson, form, isEditing]);

  const onSubmit = async (data: LessonFormData) => {
    if (isEditing) {
      await updateLessonOnServer(data);
    } else {
      await createLessonOnServer(data);
    }
  };

  const trpcUtils = trpc.useUtils();

  const updateLessonMutation =
    trpc.lmsModule.courseModule.lesson.update.useMutation({
      onSuccess: () => {
        toast({
          title: TOAST_TITLE_SUCCESS,
          description: "Lesson updated successfully",
        });
        router.push(`/dashboard/products/${productId}/content`);
      },
      onError: (error) => {
        toast({
          title: TOAST_TITLE_ERROR,
          description: error.message,
          variant: "destructive",
        });
      },
    });

  const createLessonMutation =
    trpc.lmsModule.courseModule.lesson.create.useMutation({
      onSuccess: () => {
        toast({
          title: TOAST_TITLE_SUCCESS,
          description: "Lesson created successfully",
        });
        router.push(`/dashboard/products/${productId}/content`);
      },
      onError: (error) => {
        toast({
          title: TOAST_TITLE_ERROR,
          description: error.message,
          variant: "destructive",
        });
      },
    });

  const updateLessonOnServer = async (data: LessonFormData) => {
    if (!lessonId) return;

    await updateLessonMutation.mutateAsync({
      id: lessonId!,
      data: {
        title: data.title,
        content: editorContent,
        requiresEnrollment: data.requiresEnrollment,
        downloadable: data.downloadable,
      },
    });
  };

  const createLessonOnServer = async (data: LessonFormData) => {
    if (!product || !sectionId) return;

    await createLessonMutation.mutateAsync({
      data: {
        courseId: product.courseId,
        groupId: sectionId as string,
        title: data.title,
        type: data.type,
        content: editorContent,
        requiresEnrollment: data.requiresEnrollment,
        downloadable: data.downloadable,
      },
    });
  };

  if (productLoading || lessonLoading) {
    return (
      <DashboardContent breadcrumbs={breadcrumbs}>
        <div className="space-y-8">
          <div className="space-y-4">
            <Skeleton className="h-9 w-64" />
            <Skeleton className="h-5 w-48" />
          </div>
          <div className="space-y-6">
            <Skeleton className="h-20" />
            <Skeleton className="h-20" />
            <Skeleton className="h-20" />
          </div>
        </div>
      </DashboardContent>
    );
  }

  if (!product) {
    return (
      <DashboardContent breadcrumbs={breadcrumbs}>
        <div className="text-center py-8">
          <p className="text-muted-foreground">Product not found</p>
        </div>
      </DashboardContent>
    );
  }

  const section = product.groups?.find((group) => group.groupId === sectionId);
  if (!section) {
    return (
      <DashboardContent breadcrumbs={breadcrumbs}>
        <div className="text-center py-8">
          <p className="text-muted-foreground">Section not found</p>
        </div>
      </DashboardContent>
    );
  }

  return (
    <DashboardContent breadcrumbs={breadcrumbs}>
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-semibold">
            {isEditing ? EDIT_LESSON_TEXT : BUTTON_NEW_LESSON_TEXT}
          </h1>
          <p className="text-muted-foreground mt-2">
            {isEditing
              ? "Edit lesson details"
              : "Create a new lesson for this section"}
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Lesson Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter lesson title" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-4">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Lesson Type</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="grid grid-cols-2 gap-4"
                      >
                        {lessonTypes.map((type) => {
                          const Icon = type.icon;
                          return (
                            <div key={type.value}>
                              <RadioGroupItem
                                value={type.value}
                                id={type.value}
                                className="peer sr-only"
                              />
                              <Label
                                htmlFor={type.value}
                                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                              >
                                <Icon className="mb-3 h-6 w-6" />
                                {type.label}
                              </Label>
                            </div>
                          );
                        })}
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {currentFormValues.type === Constants.LessonType.TEXT && (
              <div className="space-y-4">
                <FormLabel>Lesson Content</FormLabel>
                <LessonContentEditor
                  ref={editorRef}
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
              </div>
            )}

            {currentFormValues.type === Constants.LessonType.VIDEO && (
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="embedUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Video URL</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter video URL (YouTube, Vimeo, etc.)"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="requiresEnrollment"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">
                        Requires Enrollment
                      </FormLabel>
                      <p className="text-sm text-muted-foreground">
                        Students must be enrolled to access this lesson
                      </p>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="downloadable"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Downloadable</FormLabel>
                      <p className="text-sm text-muted-foreground">
                        Allow students to download this lesson
                      </p>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <div className="flex items-center justify-end gap-4">
              <Button variant="outline" asChild>
                <Link href={`/dashboard/products/${productId}/content`}>
                  Cancel
                </Link>
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting
                  ? "Saving..."
                  : isEditing
                    ? "Update Lesson"
                    : "Create Lesson"}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </DashboardContent>
  );
}
