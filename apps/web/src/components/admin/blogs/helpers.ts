import { AppDispatch } from "@workspace/state-management";
import { networkAction } from "@workspace/state-management/dist/action-creators";
import { FetchBuilder } from "@workspace/utils";
import {
    APP_MESSAGE_COURSE_DELETED,
    TOAST_TITLE_ERROR,
    TOAST_TITLE_SUCCESS,
} from "@/lib/ui/config/strings";
import { useToast } from "@workspace/components-library";

interface DeleteProductProps {
    id?: string;
    backend: string;
    dispatch?: AppDispatch;
    onDeleteComplete?: (...args: any[]) => void;
    toast: ReturnType<typeof useToast>["toast"];
}

export const deleteProduct = async ({
    id,
    backend,
    dispatch,
    onDeleteComplete,
    toast,
}: DeleteProductProps) => {
    if (!id) return;

    const query = `
    mutation {
      result: deleteCourse(id: "${id}")
    }
    `;

    const fetch = new FetchBuilder()
        .setUrl(`${backend}/api/graph`)
        .setPayload(query)
        .setIsGraphQLEndpoint(true)
        .build();

    try {
        dispatch && dispatch(networkAction(true));
        const response = await fetch.exec();

        if (response.result) {
            onDeleteComplete && onDeleteComplete();
            // onDelete(position);
        }
    } catch (err: any) {
        toast &&
            toast({
                title: TOAST_TITLE_ERROR,
                description: err.message,
                variant: "destructive",
            });
    } finally {
        dispatch && dispatch(networkAction(false));
        toast &&
            toast({
                title: TOAST_TITLE_SUCCESS,
                description: APP_MESSAGE_COURSE_DELETED,
            });
    }
};
