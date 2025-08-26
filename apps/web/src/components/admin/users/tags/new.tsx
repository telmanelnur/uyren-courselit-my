import React, { useState, ChangeEvent, FormEvent } from "react";
import {
  Breadcrumbs,
  Button,
  Form,
  FormField,
  Link,
  useToast,
} from "@workspace/components-library";
import {
  BTN_CONTINUE,
  BTN_NEW_TAG,
  BUTTON_CANCEL_TEXT,
  TOAST_TITLE_ERROR,
  USERS_MANAGER_PAGE_HEADING,
  USERS_TAG_HEADER,
} from "@/lib/ui/config/strings";
import { useRouter } from "next/navigation";
import { trpc } from "@/utils/trpc";

export default function NewTag() {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const addTagMutation = trpc.userModule.tag.addTags.useMutation();

  const createTag = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await addTagMutation.mutateAsync({ tags: [name] });
      if (response) {
        router.replace(`/dashboard/users?tab=Tags`);
      }
    } catch (err: any) {
      toast({
        title: TOAST_TITLE_ERROR,
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col">
      <div className="mb-4">
        <Breadcrumbs aria-label="breakcrumb">
          <Link href={`/dashboard/users?tab=All%20users`}>
            {USERS_MANAGER_PAGE_HEADING}
          </Link>

          <Link href={`/dashboard/users?tab=Tags`}>{USERS_TAG_HEADER}</Link>

          <p>{BTN_NEW_TAG}</p>
        </Breadcrumbs>
      </div>
      <div className="flex flex-col">
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
            <Button disabled={!name || loading} onClick={createTag}>
              {BTN_CONTINUE}
            </Button>
            <Button
              component="link"
              href={`/dashboard/users?tab=Tags`}
              variant="soft"
            >
              {BUTTON_CANCEL_TEXT}
            </Button>
          </div>
        </Form>
      </div>
    </div>
  );
}
