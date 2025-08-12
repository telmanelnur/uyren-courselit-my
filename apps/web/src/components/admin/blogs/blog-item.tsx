import {
    DELETE_PRODUCT_POPUP_HEADER,
    DELETE_PRODUCT_POPUP_TEXT,
    PRODUCT_STATUS_DRAFT,
    PRODUCT_STATUS_PUBLISHED,
    PRODUCT_TABLE_CONTEXT_MENU_DELETE_PRODUCT,
    TOAST_TITLE_ERROR,
} from "@/lib/ui/config/strings";
import { trpc } from "@/utils/trpc";
import { Course } from "@workspace/common-models";
import {
    Chip,
    Link,
    Menu2,
    MenuItem,
    TableRow,
    useToast,
} from "@workspace/components-library";
import { MoreVert } from "@workspace/icons";

export default function BlogItem({
    details,
    position,
    onDelete,
}: {
    details: Course & {
        published: boolean;
    };
    position: number;
    onDelete: (position: number) => void;
}) {
    const product = details;
    const { toast } = useToast();

    const deleteCourseMutation =
        trpc.lmsModule.courseModule.course.delete.useMutation({
            onSuccess: () => {
                onDelete(position);
            },
            onError: (error) => {
                toast({
                    title: TOAST_TITLE_ERROR,
                    description: error.message,
                    variant: "destructive",
                });
            },
        });

    return (
        <TableRow key={product.courseId}>
            <td className="py-4">
                <Link href={`/dashboard/blog/${product.courseId}`}>
                    <p>{product.title}</p>
                </Link>
            </td>
            <td align="right">
                <Chip
                    className={
                        product.published
                            ? "!bg-black text-white !border-black"
                            : ""
                    }
                >
                    {product.published
                        ? PRODUCT_STATUS_PUBLISHED
                        : PRODUCT_STATUS_DRAFT}
                </Chip>
            </td>
            <td align="right">
                <Menu2 icon={<MoreVert />} variant="soft">
                    <MenuItem
                        component="dialog"
                        title={DELETE_PRODUCT_POPUP_HEADER}
                        triggerChildren={
                            PRODUCT_TABLE_CONTEXT_MENU_DELETE_PRODUCT
                        }
                        description={DELETE_PRODUCT_POPUP_TEXT}
                        onClick={() =>
                            deleteCourseMutation.mutate({
                                courseId: product.courseId,
                            })
                        }
                    ></MenuItem>
                </Menu2>
            </td>
        </TableRow>
    );
}
