import React, { useEffect, useState } from "react";
import { Course } from "@workspace/common-models";
import {
    BLOG_TABLE_HEADER_NAME,
    BTN_NEW_BLOG,
    TOAST_TITLE_ERROR,
    MANAGE_BLOG_PAGE_HEADING,
    PRODUCTS_TABLE_HEADER_ACTIONS,
    PRODUCTS_TABLE_HEADER_STATUS,
    PRODUCT_TABLE_CONTEXT_MENU_EDIT_PAGE,
} from "@/lib/ui/config/strings";
import dynamic from "next/dynamic";
import { MoreVert } from "@workspace/icons";
import {
    MenuItem,
    Menu2,
    Button,
    Link,
    Table,
    TableHead,
    TableBody,
    useToast,
} from "@workspace/components-library";
import { usePathname } from "next/navigation";
import { trpc } from "@/utils/trpc";
import appConstants from "@/config/constants";

const BlogItem = dynamic(() => import("./blog-item"));

export const Index = () => {
    const [coursesPaginationOffset, setCoursesPaginationOffset] = useState(1);
    const [creatorCourses, setCreatorCourses] = useState<
        (Course & { published: boolean })[]
    >([]);
    const [endReached, setEndReached] = useState(false);
    const path = usePathname();
    const { toast } = useToast();

    const loadBlogsQuery = trpc.lmsModule.courseModule.course.list.useQuery({
        pagination: {
            take: 10,
            skip: (coursesPaginationOffset - 1) * 10,
        },
        filter: {
            type: appConstants.blog,
        },
    });

    useEffect(() => {
        if (loadBlogsQuery.data?.items) {
            setCreatorCourses(loadBlogsQuery.data.items as any);
            if (loadBlogsQuery.data.items.length === 0) {
                setEndReached(true);
            }
        }
        if (loadBlogsQuery.error) {
            toast({
                title: TOAST_TITLE_ERROR,
                description: loadBlogsQuery.error.message,
                variant: "destructive",
            });
        }
    }, [loadBlogsQuery.data, loadBlogsQuery.error]);

    useEffect(() => {
        if (loadBlogsQuery.isLoading) {
            setEndReached(false);
        }
    }, [loadBlogsQuery.isLoading]);

    const onDelete = (index: number) => {
        creatorCourses.splice(index, 1);
        setCreatorCourses([...creatorCourses]);
    };

    return (
        <div className="flex flex-col">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-4xl font-semibold mb-4">
                    {MANAGE_BLOG_PAGE_HEADING}
                </h1>
                <div className="flex items-center gap-4">
                    <Link href={`/dashboard/blog/new`}>
                        <Button>{BTN_NEW_BLOG}</Button>
                    </Link>
                    <Menu2 icon={<MoreVert />} variant="soft">
                        <MenuItem>
                            <Link
                                href={`/dashboard/page/blog?redirectTo=/dashboard/blogs`}
                                className="flex w-full"
                            >
                                {PRODUCT_TABLE_CONTEXT_MENU_EDIT_PAGE}
                            </Link>
                        </MenuItem>
                    </Menu2>
                </div>
            </div>
            <Table aria-label="Products">
                <TableHead className="border-0 border-b border-slate-200">
                    <td>{BLOG_TABLE_HEADER_NAME}</td>
                    <td align="right">{PRODUCTS_TABLE_HEADER_STATUS}</td>
                    <td align="right">{PRODUCTS_TABLE_HEADER_ACTIONS}</td>
                </TableHead>
                <TableBody
                    loading={loadBlogsQuery.isLoading}
                    endReached={endReached}
                    page={coursesPaginationOffset}
                    onPageChange={(value: number) => {
                        setCoursesPaginationOffset(value);
                    }}
                >
                    {creatorCourses.map(
                        (
                            product: Course & {
                                published: boolean;
                            },
                            index: number,
                        ) => (
                            <BlogItem
                                key={product.courseId}
                                details={product}
                                position={index}
                                onDelete={onDelete}
                            />
                        ),
                    )}
                </TableBody>
            </Table>
            {/* {creatorCourses.length > 0 && (
                <div className="flex justify-center">
                    <Button
                        variant="soft"
                        onClick={() =>
                            setCoursesPaginationOffset(
                                coursesPaginationOffset + 1,
                            )
                        }
                    >
                        {LOAD_MORE_TEXT}
                    </Button>
                </div>
            )} */}
        </div>
    );
};

export default Index;
