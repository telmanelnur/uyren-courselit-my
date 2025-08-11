import React from "react";
import { Course } from "@workspace/common-models";
import {
    DELETE_PRODUCT_POPUP_HEADER,
    DELETE_PRODUCT_POPUP_TEXT,
    PRODUCT_STATUS_DRAFT,
    PRODUCT_STATUS_PUBLISHED,
    PRODUCT_TABLE_CONTEXT_MENU_DELETE_PRODUCT,
} from "@/lib/ui/config/strings";
import { MoreVert } from "@workspace/icons";
import type { AppDispatch } from "@workspace/state-management";
import type { SiteInfo, Address } from "@workspace/common-models";
// import { connect } from "react-redux";
import {
    Chip,
    Menu2,
    MenuItem,
    Link,
    useToast,
} from "@workspace/components-library";
import { deleteProduct } from "./helpers";
import { TableRow } from "@workspace/components-library";

export default function BlogItem({
    details,
    address,
    dispatch,
    position,
    onDelete,
}: {
    details: Course & {
        published: boolean;
    };
    siteinfo: SiteInfo;
    address: Address;
    dispatch?: AppDispatch;
    position: number;
    onDelete: (position: number) => void;
}) {
    const product = details;
    const { toast } = useToast();

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
                            deleteProduct({
                                id: product.courseId,
                                backend: address.backend,
                                dispatch,
                                onDeleteComplete: () => {
                                    onDelete(position);
                                },
                                toast,
                            })
                        }
                    ></MenuItem>
                </Menu2>
            </td>
        </TableRow>
    );
}

// const mapStateToProps = (state: AppState) => ({
//     siteinfo: state.siteinfo,
//     address: state.address,
// });

// const mapDispatchToProps = (dispatch: AppDispatch) => ({ dispatch });

// export default connect(mapStateToProps, mapDispatchToProps)(BlogItem);
