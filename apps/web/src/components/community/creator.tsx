import {
    BUTTON_CANCEL_TEXT,
    COMMUNITY_FIELD_NAME,
    COMMUNITY_NEW_BTN_CAPTION,
    NEW_COMMUNITY_BUTTON,
} from "@/lib/ui/config/strings";
import { trpc } from "@/utils/trpc";
import {
    Button,
    Form,
    FormField,
    useToast,
} from "@workspace/components-library";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

export default function CommunityCreator() {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const createCommunityMutation =
    trpc.communityModule.community.create.useMutation({
      onError: (error) => {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      },
      onSuccess: () => {
        toast({
          title: "Success",
          description: "Community created successfully",
        });
        router.replace(`/dashboard/communities`);
      },
    });

  const createCommunity = async (e: FormEvent) => {
    e.preventDefault();
    createCommunityMutation.mutate({
      data: {
        name,
      },
    });
  };

  return (
    <div>
      <h1 className="text-4xl font-semibold mb-4">{NEW_COMMUNITY_BUTTON}</h1>
      <Form
        method="post"
        onSubmit={createCommunity}
        className="flex flex-col gap-4"
      >
        <FormField
          required
          label={COMMUNITY_FIELD_NAME}
          name="name"
          value={name}
          onChange={(e: any) => setName(e.target.value)}
        />
        <div className="flex gap-2">
          <Button disabled={!name || loading} sx={{ mr: 1 }}>
            {COMMUNITY_NEW_BTN_CAPTION}
          </Button>
          <Link href={`/dashboard/communities`}>
            <Button variant="soft">{BUTTON_CANCEL_TEXT}</Button>
          </Link>
        </div>
      </Form>
    </div>
  );
}
