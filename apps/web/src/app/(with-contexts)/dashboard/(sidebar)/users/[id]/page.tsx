import DashboardContent from "@/components/admin/dashboard-content";
import {
  PAGE_HEADER_ALL_USER,
  PAGE_HEADER_EDIT_USER,
} from "@/lib/ui/config/strings";
import UserForm from "./user-form";

const breadcrumbs = [
  { label: PAGE_HEADER_ALL_USER, href: "/dashboard/users" },
  { label: PAGE_HEADER_EDIT_USER, href: "#" },
];

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <DashboardContent breadcrumbs={breadcrumbs}>
      <UserForm id={id} />
    </DashboardContent>
  );
}
