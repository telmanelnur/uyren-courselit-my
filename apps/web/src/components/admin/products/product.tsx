import {
  APP_MESSAGE_COURSE_DELETED,
  DELETE_PRODUCT_POPUP_HEADER,
  DELETE_PRODUCT_POPUP_TEXT,
  PRODUCT_STATUS_DRAFT,
  PRODUCT_STATUS_PUBLISHED,
  PRODUCT_TABLE_CONTEXT_MENU_DELETE_PRODUCT,
  PRODUCT_TABLE_CONTEXT_MENU_EDIT_PAGE,
  PRODUCT_TABLE_CONTEXT_MENU_INVITE_A_CUSTOMER,
  TOAST_TITLE_ERROR,
  TOAST_TITLE_SUCCESS,
  VIEW_PAGE_MENU_ITEM,
} from "@/lib/ui/config/strings";
import { trpc } from "@/utils/trpc";
import type { Address, SiteInfo } from "@workspace/common-models";
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
import { capitalize, formatCurrency } from "@workspace/utils";

export type CourseDetails = Course & {
  published: boolean;
  sales: number;
  customers: number;
  pageId: string;
};

export default function Product({
  details,
  siteinfo,
  address,
  position,
  onDelete,
}: {
  details: CourseDetails;
  siteinfo: SiteInfo;
  address: Address;
  position: number;
  onDelete: (position: number) => void;
}) {
  const product = details;
  const { toast } = useToast();

  const deleteCourseMutation =
    trpc.lmsModule.courseModule.course.delete.useMutation({
      onSuccess: () => {
        toast({
          title: TOAST_TITLE_SUCCESS,
          description: APP_MESSAGE_COURSE_DELETED,
        });
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

  const deleteProduct = async () => {
    await deleteCourseMutation.mutateAsync({
      courseId: product.courseId,
    });
  };

  return (
    <TableRow key={product.courseId}>
      <td className="py-4">
        <Link href={`/dashboard/product/${product.courseId}`}>
          <p>{product.title}</p>
        </Link>
      </td>
      <td>
        <p>{capitalize(product.type)}</p>
      </td>
      <td align="right">
        <Chip
          className={
            product.published ? "!bg-black text-white !border-black" : ""
          }
        >
          {product.published ? PRODUCT_STATUS_PUBLISHED : PRODUCT_STATUS_DRAFT}
        </Chip>
      </td>
      <td align="right">{product.customers}</td>
      <td align="right">
        {formatCurrency(product.sales, siteinfo.currencyISOCode)}
      </td>
      <td align="right">
        <Menu2 icon={<MoreVert />} variant="soft">
          <MenuItem>
            <Link href={`/p/${product.pageId}`} className="flex w-full">
              {VIEW_PAGE_MENU_ITEM}
            </Link>
          </MenuItem>
          <MenuItem>
            <Link
              href={`/dashboard/page/${product.pageId}?redirectTo=/dashboard/products`}
              className="flex w-full"
            >
              {PRODUCT_TABLE_CONTEXT_MENU_EDIT_PAGE}
            </Link>
          </MenuItem>
          <div className="flex w-full border-b border-slate-200 my-1"></div>
          <MenuItem>
            <Link href={`/dashboard/product/${product.courseId}/customer/new`}>
              {PRODUCT_TABLE_CONTEXT_MENU_INVITE_A_CUSTOMER}
            </Link>
          </MenuItem>
          <div className="flex w-full border-b border-slate-200 my-1"></div>
          <MenuItem
            component="dialog"
            title={PRODUCT_TABLE_CONTEXT_MENU_DELETE_PRODUCT}
            triggerChildren={DELETE_PRODUCT_POPUP_HEADER}
            description={DELETE_PRODUCT_POPUP_TEXT}
            onClick={deleteProduct}
          ></MenuItem>
        </Menu2>
      </td>
    </TableRow>
  );
}
