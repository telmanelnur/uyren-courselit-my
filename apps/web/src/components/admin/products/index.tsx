import {
    BTN_NEW_PRODUCT,
    MANAGE_COURSES_PAGE_HEADING,
    PRODUCTS_TABLE_HEADER_ACTIONS,
    PRODUCTS_TABLE_HEADER_NAME,
    PRODUCTS_TABLE_HEADER_SALES,
    PRODUCTS_TABLE_HEADER_STATUS,
    PRODUCTS_TABLE_HEADER_STUDENTS,
    PRODUCTS_TABLE_HEADER_TYPE,
    TOAST_TITLE_ERROR,
} from "@/lib/ui/config/strings";
import { GeneralRouterOutputs } from "@/server/api/types";
import { trpc } from "@/utils/trpc";
import type { Address, SiteInfo } from "@workspace/common-models";
import {
    Button,
    Link,
    Table,
    TableBody,
    TableHead,
    useToast,
} from "@workspace/components-library";
import { useEffect, useState } from "react";
import Product from "./product";

interface IndexProps {
  address: Address;
  loading: boolean;
  siteinfo: SiteInfo;
}

type CourseType =
  GeneralRouterOutputs["lmsModule"]["courseModule"]["course"]["list"]["items"][number];

const Index = ({ loading, address, siteinfo }: IndexProps) => {
  const [coursesPaginationOffset, setCoursesPaginationOffset] = useState(1);
  const [creatorCourses, setCreatorCourses] = useState<CourseType[]>([]);
  const [searchText] = useState("");
  const [endReached, setEndReached] = useState(false);
  const { toast } = useToast();

  const loadCoursesQuery = trpc.lmsModule.courseModule.course.list.useQuery({
    pagination: {
      take: 10,
      skip: (coursesPaginationOffset - 1) * 10,
    },
    search: {
      q: searchText,
    },
  });

  useEffect(() => {
    if (loadCoursesQuery.data?.items) {
      setCreatorCourses(loadCoursesQuery.data.items);
      if (loadCoursesQuery.data.items.length === 0) {
        setEndReached(true);
      }
    }
    if (loadCoursesQuery.error) {
      toast({
        title: TOAST_TITLE_ERROR,
        description: loadCoursesQuery.error.message,
        variant: "destructive",
      });
    }
  }, [loadCoursesQuery.data, loadCoursesQuery.error]);
  useEffect(() => {
    if (loadCoursesQuery.isLoading) {
      setEndReached(false);
    }
  }, [loadCoursesQuery.isLoading]);

  const onDelete = (index: number) => {
    creatorCourses.splice(index, 1);
    setCreatorCourses([...creatorCourses]);
  };

  return (
    <div className="flex flex-col">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-semibold mb-4">
          {MANAGE_COURSES_PAGE_HEADING}
        </h1>
        <div>
          <Link href={`/dashboard/products/new`}>
            <Button>{BTN_NEW_PRODUCT}</Button>
          </Link>
        </div>
      </div>
      <Table aria-label="Products">
        <TableHead>
          <td>{PRODUCTS_TABLE_HEADER_NAME}</td>
          <td>{PRODUCTS_TABLE_HEADER_TYPE}</td>
          <td align="right">{PRODUCTS_TABLE_HEADER_STATUS}</td>
          <td align="right">{PRODUCTS_TABLE_HEADER_STUDENTS}</td>
          <td align="right">{PRODUCTS_TABLE_HEADER_SALES}</td>
          <td align="right">{PRODUCTS_TABLE_HEADER_ACTIONS}</td>
        </TableHead>
        <TableBody
          loading={loading}
          endReached={endReached}
          page={coursesPaginationOffset}
          onPageChange={(value: number) => {
            setCoursesPaginationOffset(value);
          }}
        >
          {creatorCourses.map((product, index) => (
            <Product
              key={product.courseId}
              details={product}
              position={index}
              onDelete={onDelete}
              siteinfo={siteinfo}
              address={address}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default Index;
