import { useToast } from "@workspace/components-library";
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
import { MoreVertical, Plus } from "lucide-react";
import { GeneralRouterOutputs } from "@/server/api/types";
import { Button } from "@workspace/ui/components/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@workspace/ui/components/alert-dialog";
import { useRouter } from "next/navigation";

type TagWithDetailType =
  GeneralRouterOutputs["userModule"]["tag"]["withDetails"][number];

export default function Tags() {
  const [tags, setTags] = useState<TagWithDetailType[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [untagDialogOpen, setUntagDialogOpen] = useState(false);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const { toast } = useToast();
  const router = useRouter();

  // tRPC queries/mutations
  const tagsQuery = trpc.userModule.tag.withDetails.useQuery();
  const deleteTagMutation = trpc.userModule.tag.delete.useMutation();
  const untagUsersMutation = trpc.userModule.tag.untagUsers.useMutation();

  useEffect(() => {
    if (tagsQuery.data) setTags(tagsQuery.data);
  }, [tagsQuery.data]);

  const handleDeleteTag = async () => {
    if (!selectedTag) return;
    
    try {
      const response = await deleteTagMutation.mutateAsync({ data: { tag: selectedTag } });
      setTags(response);
      setDeleteDialogOpen(false);
      setSelectedTag(null);
    } catch (err: any) {
      toast({
        title: TOAST_TITLE_ERROR,
        description: err.message,
        variant: "destructive",
      });
    }
  };

  const handleUntagUsers = async () => {
    if (!selectedTag) return;
    
    try {
      const response = await untagUsersMutation.mutateAsync({ data: { tag: selectedTag } });
      setTags(response);
      setUntagDialogOpen(false);
      setSelectedTag(null);
    } catch (err: any) {
      toast({
        title: TOAST_TITLE_ERROR,
        description: err.message,
        variant: "destructive",
      });
    }
  };

  const openDeleteDialog = (tag: string) => {
    setSelectedTag(tag);
    setDeleteDialogOpen(true);
  };

  const openUntagDialog = (tag: string) => {
    setSelectedTag(tag);
    setUntagDialogOpen(true);
  };

  return (
    <div className="flex flex-col">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-semibold mb-4">{USERS_TAG_HEADER}</h1>
        <Button onClick={() => router.push("/dashboard/users/tags/new")}>
          <Plus className="h-4 w-4 mr-2" />
          {BTN_NEW_TAG}
        </Button>
      </div>
      
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{TAG_TABLE_HEADER_NAME}</TableHead>
              <TableHead className="text-right">{TAG_TABLE_HEADER_SUBS_COUNT}</TableHead>
              <TableHead className="text-right">{PRODUCTS_TABLE_HEADER_ACTIONS}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tags.map((tag) => (
              <TableRow key={tag.tag}>
                <TableCell className="py-2 max-w-[200px] overflow-y-auto">{tag.tag}</TableCell>
                <TableCell className="text-right">{tag.count}</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => openUntagDialog(tag.tag)}>
                        {TAGS_TABLE_CONTEXT_MENU_UNTAG}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => openDeleteDialog(tag.tag)}>
                        {TAGS_TABLE_CONTEXT_MENU_DELETE_PRODUCT}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Untag Users Dialog */}
      <AlertDialog open={untagDialogOpen} onOpenChange={setUntagDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {UNTAG_POPUP_HEADER} "{selectedTag}"
            </AlertDialogTitle>
            <AlertDialogDescription>
              {UNTAG_POPUP_DESC}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleUntagUsers}>
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Tag Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {DELETE_TAG_POPUP_HEADER} "{selectedTag}"
            </AlertDialogTitle>
            <AlertDialogDescription>
              {DELETE_TAG_POPUP_DESC}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteTag}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
