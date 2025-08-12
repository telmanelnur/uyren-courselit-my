"use client";

import DashboardContent from "@/components/admin/dashboard-content";
import LoadingScreen from "@/components/admin/loading-screen";
import Tags from "@/components/admin/users/tags";
import { useProfile } from "@/components/contexts/profile-context";
import {
    USERS_MANAGER_PAGE_HEADING,
    USERS_TAG_HEADER,
} from "@/lib/ui/config/strings";
import { UIConstants } from "@workspace/common-models";
import { checkPermission } from "@workspace/utils";

const { permissions } = UIConstants;

const breadcrumbs = [
    {
        label: USERS_MANAGER_PAGE_HEADING,
        href: "/dashboard/users",
    },
    {
        label: USERS_TAG_HEADER,
        href: "#",
    },
];

export default function Page() {
    const { profile } = useProfile();

    if (!checkPermission(profile.permissions!, [permissions.manageUsers])) {
        return <LoadingScreen />;
    }

    return (
        <DashboardContent breadcrumbs={breadcrumbs}>
            <Tags />
        </DashboardContent>
    );
}
