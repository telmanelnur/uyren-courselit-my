"use client";

import DashboardContent from "@/components/admin/dashboard-content";
import LoadingScreen from "@/components/admin/loading-screen";
import Mails from "@/components/admin/mails";
import { useProfile } from "@/components/contexts/profile-context";
import { UIConstants } from "@workspace/common-models";
import { checkPermission } from "@workspace/utils";
import { useSearchParams } from "next/navigation";

const { permissions } = UIConstants;

export default function MailHub() {
    const { profile } = useProfile();
    const searchParams = useSearchParams();

    const tab = searchParams?.get("tab") || "Broadcasts";

    const breadcrumbs = [{ label: tab, href: "#" }];

    if (!checkPermission(profile?.permissions!, [permissions.manageSite])) {
        return <LoadingScreen />;
    }

    return (
        <DashboardContent breadcrumbs={breadcrumbs}>
            <Mails selectedTab={tab} loading={false} />
        </DashboardContent>
    );
}
