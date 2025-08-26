"use client";

import React, { useState, ChangeEvent, useContext } from "react";
import {
  Button,
  Form,
  FormField,
  useToast,
} from "@workspace/components-library";
import {
  BTN_CONTINUE,
  BTN_NEW_TAG,
  BUTTON_CANCEL_TEXT,
  TOAST_TITLE_ERROR,
  USERS_MANAGER_PAGE_HEADING,
  USERS_TAG_HEADER,
  USERS_TAG_NEW_HEADER,
} from "@/lib/ui/config/strings";
import { trpc } from "@/utils/trpc";
import { FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useProfile } from "@/components/contexts/profile-context";
import DashboardContent from "@/components/admin/dashboard-content";
import { UIConstants } from "@workspace/common-models";
import { checkPermission } from "@workspace/utils";
import LoadingScreen from "@/components/admin/loading-screen";

const { permissions } = UIConstants;

const breadcrumbs = [
  {
    label: USERS_MANAGER_PAGE_HEADING,
    href: "/dashboard/users",
  },
  {
    label: USERS_TAG_HEADER,
    href: "/dashboard/users/tags",
  },
  {
    label: USERS_TAG_NEW_HEADER,
    href: "#",
  },
];

export default function Page() {
  const [name, setName] = useState("");
  const router = useRouter();
  const { toast } = useToast();
  const { profile } = useProfile();

  // Use tRPC mutation for creating tags
  const createTagMutation = trpc.userModule.tag.addTags.useMutation({
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Tag created successfully",
      });
      router.replace("/dashboard/users/tags");
    },
    onError: (error) => {
      toast({
        title: TOAST_TITLE_ERROR,
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const createTag = async (e: FormEvent) => {
    e.preventDefault();
    createTagMutation.mutate({
      tags: [name],
    });
  };

  if (!checkPermission(profile.permissions!, [permissions.manageUsers])) {
    return <LoadingScreen />;
  }

  return (
    <DashboardContent breadcrumbs={breadcrumbs}>
      <h1 className="text-4xl font-semibold mb-4">{BTN_NEW_TAG}</h1>
      <Form onSubmit={createTag} className="flex flex-col gap-4">
        <FormField
          required
          label="Tag name"
          name="name"
          value={name}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            setName(e.target.value)
          }
        />
        <div className="flex gap-2">
          <Button
            disabled={!name || createTagMutation.isPending}
            onClick={createTag}
          >
            {BTN_CONTINUE}
          </Button>
          <Button component="link" href="/dashboard/users/tags" variant="soft">
            {BUTTON_CANCEL_TEXT}
          </Button>
        </div>
      </Form>
    </DashboardContent>
  );
}
