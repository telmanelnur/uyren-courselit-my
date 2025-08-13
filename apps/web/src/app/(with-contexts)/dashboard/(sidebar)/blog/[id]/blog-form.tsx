"use client";

import useCourse from "@/components/admin/blogs/editor/course-hook";
import { Details } from "@/components/admin/blogs/editor/details";
import { Publish } from "@/components/admin/blogs/editor/publish";
import { useDeleteProduct } from "@/components/admin/blogs/helpers";
import { useAddress } from "@/components/contexts/address-context";
import { useProfile } from "@/components/contexts/profile-context";
import {
    DELETE_PRODUCT_POPUP_HEADER,
    DELETE_PRODUCT_POPUP_TEXT,
    MENU_BLOG_VISIT,
    PAGE_TITLE_404,
    PRODUCT_TABLE_CONTEXT_MENU_DELETE_PRODUCT
} from "@/lib/ui/config/strings";
import { truncate } from "@/lib/ui/lib/utils";
import {
    Link,
    Menu2,
    MenuItem,
    Tabbs,
    useToast,
} from "@workspace/components-library";
import { MoreVert } from "@workspace/icons";
import { Skeleton } from "@workspace/ui/components/skeleton";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";



export function BlogForm({ id }: { id: string }) {
    const searchParams = useSearchParams();
    const [tab, setTab] = useState(searchParams?.get("tab") || "Details");
    const { address } = useAddress();
    const { profile } = useProfile();
    const course = useCourse(id);
    const router = useRouter();
    const { toast } = useToast();

    const { deleteProduct } = useDeleteProduct()

    return (
        <>
            {course === undefined && (
                <div className="flex flex-col gap-4">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-20 w-full" />
                </div>
            )}
            {course === null && <p>{PAGE_TITLE_404}</p>}
            {course && (
                <>
                    <div className="flex justify-between items-center">
                        <h1 className="text-4xl font-semibold mb-4">
                            {truncate(course?.title || "", 50)}
                        </h1>
                        <div>
                            <Menu2 icon={<MoreVert />} variant="soft">
                                <MenuItem>
                                    <Link
                                        href={`/blog/${course?.slug}/${course?.courseId}`}
                                        className="flex w-full"
                                    >
                                        {MENU_BLOG_VISIT}
                                    </Link>
                                </MenuItem>
                                <MenuItem
                                    component="dialog"
                                    title={DELETE_PRODUCT_POPUP_HEADER}
                                    triggerChildren={PRODUCT_TABLE_CONTEXT_MENU_DELETE_PRODUCT}
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
                    <Tabbs items={["Details", "Publish"]} value={tab} onChange={setTab}>
                        <div className="pt-4">
                            <Details
                                id={id}
                                address={address}
                                profile={profile!}
                            />
                        </div>
                        <div className="pt-4">
                            <Publish id={id} loading={false} />
                        </div>
                    </Tabbs>
                </>
            )}
        </>
    );
}
