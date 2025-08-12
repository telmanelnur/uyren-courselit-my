import {
    DELETE_PRODUCT_POPUP_HEADER,
    DELETE_PRODUCT_POPUP_TEXT,
    MENU_BLOG_VISIT,
    PRODUCT_TABLE_CONTEXT_MENU_DELETE_PRODUCT,
} from "@/lib/ui/config/strings";
import { truncate } from "@/lib/ui/lib/utils";
import {
    Breadcrumbs,
    Link,
    Menu2,
    MenuItem,
    useToast,
} from "@workspace/components-library";
import { MoreVert } from "@workspace/icons";
import { useRouter } from "next/navigation";
import { useDeleteProduct } from "../../helpers";
import useCourse from "../course-hook";

// const AppLoader = dynamic(() => import("@/components/app-loader"));

interface Breadcrumb {
    text: string;
    url: string;
}

interface BlogHeaderProps {
    breadcrumbs?: Breadcrumb[];
    id: string;
}

export default function BlogHeader({
    id,
    breadcrumbs,
}: BlogHeaderProps) {
    const course = useCourse(id);
    const router = useRouter();
    const { toast } = useToast();

    const { deleteProduct } = useDeleteProduct();

    if (!course) {
        return <></>;
    }

    return (
        <div className="flex flex-col">
            {breadcrumbs && (
                <div className="mb-4">
                    <Breadcrumbs aria-label="product-breadcrumbs">
                        {breadcrumbs.map((crumb: Breadcrumb) =>
                            crumb.url ? (
                                <Link href={crumb.url} key={crumb.url}>
                                    {crumb.text}
                                </Link>
                            ) : (
                                <span key={crumb.text}>{crumb.text}</span>
                            ),
                        )}
                    </Breadcrumbs>
                </div>
            )}
            <div className="flex justify-between items-center">
                <h1 className="text-4xl font-semibold mb-4">
                    {truncate(course.title || "", 50)}
                </h1>
                <div>
                    <Menu2 icon={<MoreVert />} variant="soft">
                        <MenuItem>
                            <Link
                                href={`/blog/${course.slug}/${course.courseId}`}
                                className="flex w-full"
                            >
                                {MENU_BLOG_VISIT}
                            </Link>
                        </MenuItem>
                        <MenuItem
                            component="dialog"
                            title={DELETE_PRODUCT_POPUP_HEADER}
                            triggerChildren={
                                PRODUCT_TABLE_CONTEXT_MENU_DELETE_PRODUCT
                            }
                            description={DELETE_PRODUCT_POPUP_TEXT}
                            onClick={() =>
                                deleteProduct({
                                    courseId: course.courseId!,
                                    onDeleteComplete: () => {
                                        router.replace(`/dashboard/blogs`);
                                    },
                                    toast,
                                })
                            }
                        ></MenuItem>
                    </Menu2>
                </div>
            </div>
        </div>
    );
}
