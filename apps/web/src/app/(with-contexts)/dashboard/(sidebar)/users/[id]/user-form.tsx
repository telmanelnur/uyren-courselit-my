"use client";

import PermissionsEditor from "@/components/admin/users/permissions-editor";
import { useProfile } from "@/components/contexts/profile-context";
import {
    SWITCH_ACCOUNT_ACTIVE,
    TOAST_TITLE_ERROR,
    USER_BASIC_DETAILS_HEADER,
    USER_EMAIL_SUBHEADER,
    USER_NAME_SUBHEADER,
    USER_TAGS_SUBHEADER
} from "@/lib/ui/config/strings";
import { trpc } from "@/utils/trpc";
import {
    ComboBox,
    Link,
    Section,
    Switch,
    useToast,
} from "@workspace/components-library";
import { useEffect } from "react";



export default function UserForm({ id }: { id: string }) {
    const { toast } = useToast();
    const { profile } = useProfile();

    // Use tRPC queries instead of GraphQL
    const { data: userData, isLoading: userLoading, error: userError } = trpc.userModule.user.getByUserId.useQuery({
        userId: id
    });

    const { data: tagsData, isLoading: tagsLoading } = trpc.userModule.tag.list.useQuery();

    // Mutations
    const updateUserMutation = trpc.userModule.user.update.useMutation({
        onSuccess: () => {
            toast({
                title: "Success",
                description: "User updated successfully",
            });
        },
        onError: (error) => {
            toast({
                title: TOAST_TITLE_ERROR,
                description: error.message,
                variant: "destructive",
            });
        },
    });

    // Handle errors
    useEffect(() => {
        if (userError) {
            toast({
                title: TOAST_TITLE_ERROR,
                description: userError.message,
                variant: "destructive",
            });
        }
    }, [userError, toast]);



    const toggleActiveState = async (value: boolean) => {
        if (userData?.userId) {
            updateUserMutation.mutate({
                userId: userData.userId,
                data: {
                    active: value,
                },
            });
        }
    };

    const updateTags = async (tags: string[]) => {
        if (userData?.userId) {
            updateUserMutation.mutate({
                userId: userData.userId,
                data: {
                    tags,
                },
            });
        }
    };

    if (!userData) {
        return null;
    }

    return (
        <>
            <h1 className="text-4xl font-semibold mb-4">
                {userData.name ? userData.name : userData.email}
            </h1>
            <div className="flex gap-2">
                <Section
                    className="md:w-1/2"
                    header={USER_BASIC_DETAILS_HEADER}
                >
                    <div className="flex items-center justify-between">
                        <p>{USER_NAME_SUBHEADER}</p>
                        <p>{userData.name || "--"}</p>
                    </div>
                    <div className="flex items-center justify-between">
                        <p>{USER_EMAIL_SUBHEADER}</p>
                        <p>
                            <Link href={`mailto:${userData.email}`}>
                                {userData.email}
                            </Link>
                        </p>
                    </div>
                    <div className="flex items-center justify-between">
                        {SWITCH_ACCOUNT_ACTIVE}
                        <Switch
                            checked={userData.active}
                            onChange={(value) => toggleActiveState(value)}
                        />
                    </div>
                    <div className="flex flex-col gap-2">
                        <p>{USER_TAGS_SUBHEADER}</p>
                        <ComboBox
                            options={tagsData || []}
                            selectedOptions={new Set(userData.tags || [])}
                            onChange={updateTags}
                        />
                    </div>
                </Section>
                <PermissionsEditor user={userData as any} />
            </div>
        </>
    );
}
