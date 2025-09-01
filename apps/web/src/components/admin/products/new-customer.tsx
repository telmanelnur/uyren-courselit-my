"use client";

import {
  BTN_GO_BACK,
  BTN_INVITE,
  PRODUCT_TABLE_CONTEXT_MENU_INVITE_A_CUSTOMER,
  TOAST_TITLE_ERROR,
  TOAST_TITLE_SUCCESS,
  USER_TAGS_SUBHEADER,
} from "@/lib/ui/config/strings";
import { trpc } from "@/utils/trpc";
import {
  Button,
  ComboBox,
  Form,
  FormField,
  Link,
  useToast,
} from "@workspace/components-library";
import React, { useMemo, useState } from "react";
import useCourse from "./editor/course-hook";

interface NewCustomerProps {
  courseId: string;
}

export default function NewCustomer({ courseId }: NewCustomerProps) {
  const [email, setEmail] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const course = useCourse(courseId);
  const { toast } = useToast();

  const loadTagsQuery = trpc.userModule.tag.list.useQuery();
  const systemTags = useMemo(
    () => loadTagsQuery.data || [],
    [loadTagsQuery.data],
  );

  const inviteCustomerMutation =
    trpc.userModule.user.inviteCustomer.useMutation();

  const inviteCustomer = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    //     const query = `
    //     query InviteCustomer($email: String!, $tags: [String]!, $courseId: ID!) {
    //       user: inviteCustomer(email: $email, tags: $tags, id: $courseId) {
    //             name,
    //             email,
    //             id,
    //             subscribedToUpdates,
    //             active,
    //             permissions,
    //             userId,
    //             tags,
    //             invited
    //         }
    //     }
    // `;
    try {
      const response = await inviteCustomerMutation.mutateAsync({
        data: {
          email,
          tags,
          courseId,
        },
      });
      if (response) {
        setEmail("");
        setTags([]);
        const message = `${response.email} has been invited.`;
        toast({
          title: TOAST_TITLE_SUCCESS,
          description: message,
        });
      }
    } catch (err: any) {
      toast({
        title: TOAST_TITLE_ERROR,
        description: err.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <>
        <div className="flex flex-col">
          <h1 className="text-4xl font-semibold mb-4">
            {PRODUCT_TABLE_CONTEXT_MENU_INVITE_A_CUSTOMER}
          </h1>
          <Form onSubmit={inviteCustomer} className="flex flex-col gap-4">
            <FormField
              required
              label="Email"
              name="email"
              value={email}
              onChange={(e: any) => setEmail(e.target.value)}
            />
            <div className="flex flex-col gap-2">
              <h2>{USER_TAGS_SUBHEADER}</h2>
              <ComboBox
                key={JSON.stringify(systemTags) + JSON.stringify(tags)}
                side="bottom"
                options={systemTags}
                selectedOptions={new Set(tags)}
                onChange={(values: string[]) => setTags(values)}
              />
            </div>
            <div className="flex gap-2">
              <Button disabled={!email} onClick={inviteCustomer} sx={{ mr: 1 }}>
                {BTN_INVITE}
              </Button>
              <Link href={`/dashboard/products/${courseId}`}>
                <Button variant="soft">{BTN_GO_BACK}</Button>
              </Link>
            </div>
          </Form>
        </div>
      </>
    </div>
  );
}
