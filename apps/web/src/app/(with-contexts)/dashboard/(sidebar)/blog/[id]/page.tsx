import DashboardContent from "@/components/admin/dashboard-content";
import {
  EDIT_BLOG,
  MANAGE_BLOG_PAGE_HEADING
} from "@/lib/ui/config/strings";
import { UIConstants } from "@workspace/common-models";
import { BlogForm } from "./blog-form";

const breadcrumbs = [
  { label: MANAGE_BLOG_PAGE_HEADING, href: "/dashboard/blogs" },
  { label: EDIT_BLOG, href: "#" },
];

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return (
    <DashboardContent
      breadcrumbs={breadcrumbs}
      permissions={[
        UIConstants.permissions.manageAnyCourse,
        UIConstants.permissions.manageCourse,
      ]}
    >
      <BlogForm id={id} />
    </DashboardContent>
  );
}
