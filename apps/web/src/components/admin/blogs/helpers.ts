import {
    APP_MESSAGE_COURSE_DELETED,
    TOAST_TITLE_ERROR,
    TOAST_TITLE_SUCCESS,
} from "@/lib/ui/config/strings";
import { trpc } from "@/utils/trpc";
import { useToast } from "@workspace/components-library";
import { useCallback } from "react";

interface DeleteProductProps {
    courseId: string;
    onDeleteComplete?: (...args: any[]) => void;
    toast: ReturnType<typeof useToast>["toast"];
}

export const useDeleteProduct = () => {
    const deleteCourseMutation = trpc.lmsModule.courseModule.course.delete.useMutation();
    const deleteProduct = useCallback(
        async ({ courseId, onDeleteComplete, toast }: DeleteProductProps) => {
            try {
                await deleteCourseMutation.mutateAsync({
                    courseId,
                });
                toast({
                    title: TOAST_TITLE_SUCCESS,
                    description: APP_MESSAGE_COURSE_DELETED,
                });
                onDeleteComplete && onDeleteComplete();
            } catch (error: any) {
                toast({
                    title: TOAST_TITLE_ERROR,
                    description: error.message,
                    variant: "destructive",
                });
            }
        }, [deleteCourseMutation]);

    return { deleteProduct };
}