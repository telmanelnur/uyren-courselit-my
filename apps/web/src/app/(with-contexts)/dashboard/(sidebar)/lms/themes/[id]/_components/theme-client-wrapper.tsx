"use client";

import DashboardContent from "@/components/admin/dashboard-content";
import HeaderTopbar from "@/components/admin/layout/header-topbar";
import { FormMode } from "@/components/admin/layout/types";
import { Button } from "@workspace/ui/components/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@workspace/ui/components/tabs";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@workspace/ui/components/dropdown-menu";
import { useCallback, useMemo } from "react";
import { ChevronDown } from "lucide-react";
import { ThemeProvider, useThemeContext } from "./theme-context";
import ThemeSettings from "./theme-settings";
import ThemeCodeEditor from "./theme-code-editor";
import { BASIC_PUBLICATION_STATUS_TYPE, type BasicPublicationStatus } from "@workspace/common-models";

interface ThemeClientWrapperProps {
    initialMode: FormMode;
    initialThemeData?: any;
}

function ThemeContent() {
    const {
        mode,
        theme,
        updateMutation,
    } = useThemeContext();

    const breadcrumbs = useMemo(() => [
        {
            label: "LMS",
            href: `/dashboard/lms`,
        },
        {
            label: "Themes",
            href: "/dashboard/lms/themes",
        },
        {
            label: mode === "create" ? "New Theme" : "Edit Theme",
            href: "#",
        }
    ], [mode]);

    const handleStatusChange = useCallback(async (newStatus: BasicPublicationStatus) => {
        if (!theme?._id) return;

        try {
            await updateMutation.mutateAsync({
                id: `${theme._id}`,
                data: { status: newStatus }
            });
        } catch (error) {
            // Error handling is done in the mutation
        }
    }, [theme]);

    return (
        <DashboardContent
            breadcrumbs={breadcrumbs}
        >
            <div className="flex-1 flex flex-col gap-6">
                <HeaderTopbar
                    backLink={true}
                    header={{
                        title: mode === "create" ? "New Theme" : "Edit Theme",
                        subtitle: mode === "create"
                            ? "Build a new theme with custom styling and assets"
                            : "Edit theme settings and custom CSS code"
                    }}
                    rightAction={
                        <div className="flex items-center gap-2">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        variant="outline"
                                        disabled={!theme || updateMutation.isPending || mode === "create"}
                                        className="flex items-center gap-2"
                                    >
                                        {theme?.status === BASIC_PUBLICATION_STATUS_TYPE.DRAFT && "Draft"}
                                        {theme?.status === BASIC_PUBLICATION_STATUS_TYPE.PUBLISHED && "Published"}
                                        {theme?.status === BASIC_PUBLICATION_STATUS_TYPE.ARCHIVED && "Archived"}
                                        {!theme && "Draft"}
                                        <ChevronDown className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem
                                        onClick={() => handleStatusChange(BASIC_PUBLICATION_STATUS_TYPE.DRAFT as BasicPublicationStatus)}
                                        disabled={theme?.status === BASIC_PUBLICATION_STATUS_TYPE.DRAFT}
                                    >
                                        Draft
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        onClick={() => handleStatusChange(BASIC_PUBLICATION_STATUS_TYPE.PUBLISHED as BasicPublicationStatus)}
                                        disabled={theme?.status === BASIC_PUBLICATION_STATUS_TYPE.PUBLISHED}
                                    >
                                        Published
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        onClick={() => handleStatusChange(BASIC_PUBLICATION_STATUS_TYPE.ARCHIVED as BasicPublicationStatus)}
                                        disabled={theme?.status === BASIC_PUBLICATION_STATUS_TYPE.ARCHIVED}
                                    >
                                        Archived
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    }
                />

                <Tabs defaultValue="settings" className="flex-1">
                    <TabsList >
                        <TabsTrigger value="settings">Theme Settings</TabsTrigger>
                        <TabsTrigger
                            value="code"
                            disabled={mode === "create"}
                        >
                            Code Editor
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="settings" className="space-y-6">
                        <ThemeSettings />
                    </TabsContent>

                    <TabsContent value="code" className="space-y-6">
                        {mode === "edit" ? (
                            <ThemeCodeEditor />
                        ) : (
                            <div className="text-center py-8 text-muted-foreground">
                                Save the theme first to edit CSS code and manage assets.
                            </div>
                        )}
                    </TabsContent>
                </Tabs>
            </div>
        </DashboardContent>
    );
}

export default function ThemeClientWrapper(props: ThemeClientWrapperProps) {
    return (
        <ThemeProvider
            initialMode={props.initialMode}
            initialThemeData={props.initialThemeData}
        >
            <ThemeContent />
        </ThemeProvider>
    );
}
