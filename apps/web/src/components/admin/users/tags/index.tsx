import {
  Button,
  Menu2,
  MenuItem,
  Table,
  TableBody,
  TableHead,
  TableRow,
  useToast,
} from "@workspace/components-library";
import {
  BTN_NEW_TAG,
  DELETE_TAG_POPUP_DESC,
  DELETE_TAG_POPUP_HEADER,
  TOAST_TITLE_ERROR,
  PRODUCTS_TABLE_HEADER_ACTIONS,
  TAGS_TABLE_CONTEXT_MENU_DELETE_PRODUCT,
  TAGS_TABLE_CONTEXT_MENU_UNTAG,
  TAG_TABLE_HEADER_NAME,
  TAG_TABLE_HEADER_SUBS_COUNT,
  UNTAG_POPUP_DESC,
  UNTAG_POPUP_HEADER,
  USERS_TAG_HEADER,
} from "@/lib/ui/config/strings";
import { useEffect, useState } from "react";
import { trpc } from "@/utils/trpc";
import { MoreVert } from "@workspace/icons";
import { GeneralRouterOutputs } from "@/server/api/types";

type TagWithDetailType =
  GeneralRouterOutputs["userModule"]["tag"]["withDetails"][number];

export default function Tags() {
  const [tags, setTags] = useState<TagWithDetailType[]>([]);
  const { toast } = useToast();

  // tRPC queries/mutations
  const tagsQuery = trpc.userModule.tag.withDetails.useQuery();
  const deleteTagMutation = trpc.userModule.tag.delete.useMutation();
  const untagUsersMutation = trpc.userModule.tag.untagUsers.useMutation();

  useEffect(() => {
    if (tagsQuery.data) setTags(tagsQuery.data);
  }, [tagsQuery.data]);

  const deleteTag = async (tag: string) => {
    try {
      const response = await deleteTagMutation.mutateAsync({ data: { tag } });
      setTags(response);
    } catch (err: any) {
      toast({
        title: TOAST_TITLE_ERROR,
        description: err.message,
        variant: "destructive",
      });
    }
  };

  const untagUsers = async (tag: string) => {
    try {
      const response = await untagUsersMutation.mutateAsync({ data: { tag } });
      setTags(response);
    } catch (err: any) {
      toast({
        title: TOAST_TITLE_ERROR,
        description: err.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex flex-col">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-semibold mb-4">{USERS_TAG_HEADER}</h1>
        <div>
          <Button
            component="link"
            variant="soft"
            href="/dashboard/users/tags/new"
          >
            {BTN_NEW_TAG}
          </Button>
        </div>
      </div>
      <Table aria-label="Tags">
        <TableHead>
          <td>{TAG_TABLE_HEADER_NAME}</td>
          <td align="right">{TAG_TABLE_HEADER_SUBS_COUNT}</td>
          <td align="right">{PRODUCTS_TABLE_HEADER_ACTIONS}</td>
        </TableHead>
        <TableBody>
          {tags.map((tag) => (
            <TableRow key={tag.tag}>
              <td className="py-2 max-w-[200px] overflow-y-auto">{tag.tag}</td>
              <td align="right">{tag.count}</td>
              <td align="right">
                <Menu2 icon={<MoreVert />} variant="soft">
                  <MenuItem
                    component="dialog"
                    title={`${UNTAG_POPUP_HEADER} "${tag.tag}"`}
                    triggerChildren={TAGS_TABLE_CONTEXT_MENU_UNTAG}
                    description={UNTAG_POPUP_DESC}
                    onClick={() => untagUsers(tag.tag)}
                  />
                  <MenuItem
                    component="dialog"
                    title={`${DELETE_TAG_POPUP_HEADER} "${tag.tag}"`}
                    triggerChildren={TAGS_TABLE_CONTEXT_MENU_DELETE_PRODUCT}
                    description={DELETE_TAG_POPUP_DESC}
                    onClick={() => deleteTag(tag.tag)}
                  />
                </Menu2>
              </td>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
