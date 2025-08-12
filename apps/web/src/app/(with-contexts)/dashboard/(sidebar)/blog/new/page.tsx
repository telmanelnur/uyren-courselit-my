import NewBlog from "@/components/admin/blogs/new-blog";
import DashboardContent from "@/components/admin/dashboard-content";
import {
  BTN_NEW_BLOG,
  MANAGE_BLOG_PAGE_HEADING,
} from "@/lib/ui/config/strings";
import { UIConstants } from "@workspace/common-models";

const breadcrumbs = [
  { label: MANAGE_BLOG_PAGE_HEADING, href: "/dashboard/blogs" },
  { label: BTN_NEW_BLOG, href: "#" },
];

export default async function Page() {
  return (
    <DashboardContent
      breadcrumbs={breadcrumbs}
      permissions={[
        UIConstants.permissions.manageAnyCourse,
        UIConstants.permissions.manageCourse,
      ]}
    >
      <NewBlog />
    </DashboardContent>
  );
}
