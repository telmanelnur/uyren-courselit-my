"use client";

import DashboardContent from "@/components/admin/dashboard-content";
import { useAddress } from "@/components/contexts/address-context";
import useProduct from "@/hooks/use-product";
import {
    BUTTON_NEW_LESSON_TEXT,
    BUTTON_NEW_LESSON_TEXT_DOWNLOAD,
    COURSE_CONTENT_HEADER,
    EDIT_SECTION_HEADER,
    LESSON_GROUP_DELETED,
    MANAGE_COURSES_PAGE_HEADING,
    TOAST_TITLE_ERROR,
    TOAST_TITLE_SUCCESS
} from "@/lib/ui/config/strings";
import { truncate } from "@workspace/utils";
import { GeneralRouterOutputs } from "@/server/api/types";
import { trpc } from "@/utils/trpc";
import { Constants, Group, LessonType } from "@workspace/common-models";
import { DragAndDrop, useToast } from "@workspace/components-library";
import { Button } from "@workspace/ui/components/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@workspace/ui/components/dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu";
import { ScrollArea } from "@workspace/ui/components/scroll-area";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@workspace/ui/components/tooltip";
import {
    ChevronDown,
    ChevronRight,
    Droplets,
    FileText,
    HelpCircle,
    MoreHorizontal,
    Plus,
    Video,
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useMemo, useState } from "react";



type ProductType = GeneralRouterOutputs["lmsModule"]["courseModule"]["course"]["getByCourseDetailed"];

export default function ContentPage() {
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<Record<
        string,
        string
    > | null>(null);
    const [collapsedSections, setCollapsedSections] = useState<string[]>([]);
    const [hoveredSectionIndex, setHoveredSectionIndex] = useState<
        number | null
    >(null);
    const router = useRouter();
    const params = useParams();
    const productId = params.id as string;
    const { data: product } = trpc.lmsModule.courseModule.course.getByCourseDetailed.useQuery({
      courseId: productId,
    });
    const breadcrumbs = useMemo(() => {
        return [
            { label: MANAGE_COURSES_PAGE_HEADING, href: "/dashboard/products" },
            {
                label: product ? truncate(product.title || "", 20) || "..." : "...",
                href: `/dashboard/product/${productId}`,
            },
            { label: COURSE_CONTENT_HEADER, href: "#" },
        ]
    }, [product]);
    const { toast } = useToast();

    const handleDelete = async () => {
        setDeleteDialogOpen(false);
        setItemToDelete(null);
        await removeGroup(itemToDelete?.id!, product?.courseId!);
    };

    const toggleSectionCollapse = (sectionId: string) => {
        setCollapsedSections((prev) =>
            prev.includes(sectionId)
                ? prev.filter((id) => id !== sectionId)
                : [...prev, sectionId],
        );
    };

    const updateGroupMutation = trpc.lmsModule.courseModule.course.updateGroup.useMutation({
        onError: (error) => {
            toast({
                title: TOAST_TITLE_ERROR,
                description: error.message,
                variant: "destructive",
            });
        },
    });
    const removeGroupMutation = trpc.lmsModule.courseModule.course.removeGroup.useMutation({
        onSuccess: () => {
            toast({
                title: TOAST_TITLE_SUCCESS,
                description: LESSON_GROUP_DELETED,
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

    const updateGroup = async (group: Group, lessonsOrder: string[]) => {
        // const mutation = `
        // mutation UpdateGroup ($id: ID!, $courseId: String!, $lessonsOrder: [String]!) {
        //     updateGroup(
        //         id: $id,
        //         courseId: $courseId,
        //         lessonsOrder: $lessonsOrder
        //     ) {
        //        courseId,
        //        title
        //     }
        // }
        // `;
        const updated = await updateGroupMutation.mutateAsync({
            data: {
                groupId: group.groupId,
                courseId: product!.courseId,
                lessonsOrder,
            },
        });

    };
    const trpcUtils = trpc.useUtils();

    const removeGroup = async (groupId: string, courseId: string) => {
        // const mutation = `
        //     mutation RemoveGroup ($id: String!, $courseId: String!) {
        //         removeGroup(
        //             id: $id,
        //             courseId: $courseId
        //         ) {
        //         courseId 
        //         }
        //     }
        // `;
        await removeGroupMutation.mutateAsync({
            groupId: groupId,
            courseId: courseId,
        });
        trpcUtils.lmsModule.courseModule.course.getByCourseDetailed.invalidate();
    };

    return (
        <DashboardContent breadcrumbs={breadcrumbs}>
            <h1 className="text-4xl font-semibold tracking-tight mb-8">
                Content
            </h1>

            <ScrollArea className="h-[calc(100vh-180px)]">
                {product?.groups!.map((section, index) => (
                    <div
                        key={section.groupId}
                        className="mb-6 relative"
                        onMouseEnter={() => setHoveredSectionIndex(index)}
                        onMouseLeave={() => setHoveredSectionIndex(null)}
                    >
                        <div className="flex items-center justify-between mb-3 border-b border-gray-200 pb-3">
                            <div className="flex items-center space-x-3">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() =>
                                        toggleSectionCollapse(section.groupId)
                                    }
                                    className="p-0 hover:bg-transparent"
                                >
                                    {collapsedSections.includes(section.groupId) ? (
                                        <ChevronRight className="h-5 w-5 text-gray-500" />
                                    ) : (
                                        <ChevronDown className="h-5 w-5 text-gray-500" />
                                    )}
                                </Button>
                                <div className="flex items-center space-x-2">
                                    <h2 className="text-xl font-semibold tracking-tight">
                                        {section.name}
                                    </h2>
                                    {section.drip && (
                                        <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger>
                                                    <Droplets className="h-4 w-4 text-gray-400" />
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <p>
                                                        This section has
                                                        scheduled release
                                                    </p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>
                                    )}
                                </div>
                            </div>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="hover:bg-gray-100"
                                    >
                                        <MoreHorizontal className="h-5 w-5" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem
                                        onClick={() =>
                                            router.push(
                                                `/dashboard/product/${productId}/content/section/${section.groupId}`,
                                            )
                                        }
                                    >
                                        {EDIT_SECTION_HEADER}
                                    </DropdownMenuItem>
                                    {/* <DropdownMenuItem
                                        onClick={() =>
                                            router.push(
                                                `/dashboard/product/${productId}/content/section/new?after=${section.id}`,
                                            )
                                        }
                                    >
                                        Add Section Below
                                    </DropdownMenuItem> */}
                                    {!(
                                        product?.type?.toLowerCase() ===
                                        Constants.CourseType.DOWNLOAD &&
                                        product?.groups?.length === 1
                                    ) && (
                                            <>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem
                                                    onClick={() => {
                                                        setItemToDelete({
                                                            type: "section",
                                                            title: section.name,
                                                            id: section.groupId,
                                                        });
                                                        setDeleteDialogOpen(true);
                                                    }}
                                                    className="text-red-600"
                                                >
                                                    Delete Section
                                                </DropdownMenuItem>
                                            </>
                                        )}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                        {!collapsedSections.includes(section.groupId) && (
                            <CollapsibleSection section={section} product={product!} onUpdateGroup={updateGroup} />
                        )}
                        {hoveredSectionIndex === index && (
                            <div
                                className="absolute left-0 -ml-8 top-1/2 transform -translate-y-1/2"
                                style={{
                                    opacity:
                                        hoveredSectionIndex === index ? 1 : 0,
                                    transition: "opacity 0.2s",
                                }}
                            >
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="rounded-full p-1 hover:bg-gray-100"
                                    asChild
                                >
                                    <Link
                                        href={`/dashboard/product/${productId}/content/section/new`}
                                    >
                                        <Plus className="h-5 w-5 text-gray-500" />
                                    </Link>
                                </Button>
                            </div>
                        )}
                    </div>
                ))}
                {product?.type?.toLowerCase() !==
                    Constants.CourseType.DOWNLOAD && (
                        <div className="mt-8 flex justify-center">
                            <Button
                                variant="outline"
                                className="text-sm font-medium"
                                asChild
                            >
                                <Link
                                    href={`/dashboard/product/${productId}/content/section/new`}
                                >
                                    <Plus className="mr-2 h-4 w-4" />
                                    Add Section
                                </Link>
                            </Button>
                        </div>
                    )}
            </ScrollArea>

            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="text-xl font-semibold">
                            Confirm Deletion
                        </DialogTitle>
                        <DialogDescription className="text-sm text-gray-500 mt-2">
                            Are you sure you want to delete the{" "}
                            {itemToDelete?.type} &quot;{itemToDelete?.title}
                            &quot;? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="mt-6">
                        <Button
                            variant="outline"
                            onClick={() => setDeleteDialogOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={handleDelete}>
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </DashboardContent>
    );
}

const CollapsibleSection = ({ section, product, onUpdateGroup }: {
    section: Group;
    product: ProductType;
    onUpdateGroup: (group: Group, lessonsOrder: string[]) => void;
}) => {
    const router = useRouter();

    const LessonTypeIcon = ({ type }: {
        type: LessonType;
    }) => {
        switch (type) {
            case Constants.LessonType.VIDEO:
                return <Video className="h-4 w-4" />;
            case Constants.LessonType.TEXT:
                return <FileText className="h-4 w-4" />;
            case Constants.LessonType.QUIZ:
                return <HelpCircle className="h-4 w-4" />;
            default:
                return null;
        }
    };

    const dndItems = useMemo(() => {
        return product
            ?.attachedLessons!.filter(
                (lesson) =>
                    lesson.groupId === section.groupId,
            )
            .sort(
                (a, b) =>
                    (
                        section.lessonsOrder
                    )?.indexOf(a.lessonId) -
                    (
                        section.lessonsOrder
                    )?.indexOf(b.lessonId),
            )
            .map((lesson) => ({
                id: lesson.lessonId,
                courseId: product?.courseId,
                groupId: lesson.groupId,
                lesson,
            }));
    }, [product, section]);

    return (
        <div className="space-y-2 ml-8">
            {/* {section.attachedLessons.map((lesson) => (
                <div
                    key={lesson.id}
                    className="flex items-center justify-between py-2 px-3 rounded-md hover:bg-gray-50 transition-colors duration-150 ease-in-out cursor-pointer"
                    onClick={() => router.push(`/dashboard/product/${productId}/content/lesson?id=${lesson.id}`)}
                >
                    <div className="flex items-center space-x-3">
                        <LessonTypeIcon type={lesson.type} />
                        <span className="text-sm font-medium">{lesson.title}</span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-gray-400" />
                </div>
            ))} */}
            <DragAndDrop
                items={dndItems}
                Renderer={({ lesson }) => (
                    <div
                        className="flex items-center justify-between py-2 px-3 rounded-md hover:bg-gray-50 transition-colors duration-150 ease-in-out cursor-pointer w-full"
                        onClick={() =>
                            router.push(
                                `/dashboard/product/${product.courseId}/content/section/${section.groupId}/lesson?id=${lesson.lessonId}`,
                            )
                        }
                    >
                        <div className="flex items-center space-x-3">
                            <LessonTypeIcon
                                type={lesson.type}
                            />
                            <span className="text-sm font-medium">
                                {lesson.title}
                            </span>
                        </div>
                        <ChevronRight className="h-4 w-4 text-gray-400" />
                    </div>
                )}
                onChange={(items: any) => {
                    const newLessonsOrder: any = items.map(
                        (item: {
                            lesson: { lessonId: any };
                        }) => item.lesson.lessonId,
                    );
                    onUpdateGroup(section, newLessonsOrder);
                }}
            />
            <Button
                variant="ghost"
                size="sm"
                className="mt-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                asChild
            >
                <Link
                    href={`/dashboard/product/${product.courseId}/content/section/${section.groupId}/lesson`}
                >
                    <Plus className="mr-2 h-4 w-4" />
                    {product?.type ===
                        Constants.CourseType.DOWNLOAD
                        ? BUTTON_NEW_LESSON_TEXT_DOWNLOAD
                        : BUTTON_NEW_LESSON_TEXT}
                </Link>
            </Button>
        </div>
    );
};
