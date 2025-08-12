"use client";

import DashboardContent from "@/components/admin/dashboard-content";
import LoadingScreen from "@/components/admin/loading-screen";
import { useProfile } from "@/components/contexts/profile-context";
import { SITE_SETTINGS_PAGE_HEADING } from "@/lib/ui/config/strings";
import { UIConstants } from "@workspace/common-models";
import { checkPermission } from "@workspace/utils";
import dynamic from "next/dynamic";
const { permissions } = UIConstants;

const ApikeyNew = dynamic(
    () => import("@/components/admin/settings/apikey/new"),
);

const breadcrumbs = [{ label: SITE_SETTINGS_PAGE_HEADING, href: "#" }];

export default function Page() {
    const { profile } = useProfile();

    if (!checkPermission(profile.permissions!, [permissions.manageSettings])) {
        return <LoadingScreen />;
    }

    return (
        <DashboardContent breadcrumbs={breadcrumbs}>
            <ApikeyNew />
        </DashboardContent>
    );
}
