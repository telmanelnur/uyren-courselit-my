import DashboardContent from "@/components/admin/dashboard-content";
import { NewProduct } from "@/components/admin/products/new-product";
import {
    BTN_NEW_PRODUCT,
    MANAGE_COURSES_PAGE_HEADING,
} from "@/lib/ui/config/strings";

const breadcrumbs = [
    { label: MANAGE_COURSES_PAGE_HEADING, href: "/dashboard/products" },
    { label: BTN_NEW_PRODUCT, href: "#" },
];

export default async function Page() {

    return (
        <DashboardContent breadcrumbs={breadcrumbs}>
            <NewProduct />
        </DashboardContent>
    );
}
