"use client";

import { Metadata, ResolvingMetadata } from "next";
import React from "react";
import { useToast } from "@workspace/components-library";
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
import { useRouter } from "next/navigation";
import { useProfile } from "@/components/contexts/profile-context";
import DashboardContent from "@/components/admin/dashboard-content";
import { UIConstants } from "@workspace/common-models";
import { checkPermission } from "@workspace/utils";
import LoadingScreen from "@/components/admin/loading-screen";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@workspace/ui/components/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@workspace/ui/components/form";
import { Input } from "@workspace/ui/components/input";
import { Loader2 } from "lucide-react";

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

const tagSchema = z.object({
  name: z.string().min(1, "Tag name is required").max(50, "Tag name too long"),
});

type TagFormData = z.infer<typeof tagSchema>;

export default function Page() {
  const router = useRouter();
  const { toast } = useToast();
  const { profile } = useProfile();

  const form = useForm<TagFormData>({
    resolver: zodResolver(tagSchema),
    defaultValues: {
      name: "",
    },
  });

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

  const onSubmit = (data: TagFormData) => {
    createTagMutation.mutate({
      tags: [data.name],
    });
  };

  if (!checkPermission(profile.permissions!, [permissions.manageUsers])) {
    return <LoadingScreen />;
  }

  return (
    <DashboardContent breadcrumbs={breadcrumbs}>
      <h1 className="text-4xl font-semibold mb-4">{BTN_NEW_TAG}</h1>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tag name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter tag name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex gap-2">
            <Button
              type="submit"
              disabled={!form.watch("name") || createTagMutation.isPending}
            >
              {createTagMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {BTN_CONTINUE}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/dashboard/users/tags")}
            >
              {BUTTON_CANCEL_TEXT}
            </Button>
          </div>
        </form>
      </Form>
    </DashboardContent>
  );
}
