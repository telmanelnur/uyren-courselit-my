"use client";

import { Button } from "@workspace/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@workspace/ui/components/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table";
import { useToast } from "@workspace/components-library";
import {
  APIKEY_EXISTING_HEADER,
  APIKEY_EXISTING_TABLE_HEADER_CREATED,
  APIKEY_EXISTING_TABLE_HEADER_NAME,
  APIKEY_NEW_BUTTON,
  APIKEY_REMOVE_BTN,
  APIKEY_REMOVE_DIALOG_HEADER,
  APIKYE_REMOVE_DIALOG_DESC,
  TOAST_TITLE_SUCCESS,
  TOAST_TITLE_ERROR,
  SETTINGS_RESOURCE_API,
} from "@/lib/ui/config/strings";
import { GeneralRouterOutputs } from "@/server/api/types";
import { trpc } from "@/utils/trpc";
import { useState } from "react";
import Resources from "@/components/resources";
import { useSettingsContext } from "./settings-context";
import NewApiKeyDialog from "./new-api-key-dialog";

type ApiKeyType =
  GeneralRouterOutputs["siteModule"]["siteInfo"]["listApiKeys"][number] & {
    createdAt: string;
  };

export default function ApiKeysSettings() {
  const { loadSettingsQuery } = useSettingsContext();
  const { toast } = useToast();
  const [apikeyPage, setApikeyPage] = useState(1);

  const loadApiKeysQuery = trpc.siteModule.siteInfo.listApiKeys.useQuery();
  const removeApiKeyMutation =
    trpc.siteModule.siteInfo.removeApiKey.useMutation({
      onSuccess: () => {
        toast({
          title: TOAST_TITLE_SUCCESS,
          description: "API key removed successfully",
        });
        loadApiKeysQuery.refetch();
      },
      onError: (error: any) => {
        toast({
          title: TOAST_TITLE_ERROR,
          description: error.message,
          variant: "destructive",
        });
      },
    });

  const removeApiKey = async (keyId: string) => {
    try {
      await removeApiKeyMutation.mutateAsync({
        data: {
          keyId,
        },
      });
    } catch (error) {
      // Error handling is done in the mutation
    }
  };

  const handleApiKeyCreated = () => {
    loadApiKeysQuery.refetch();
  };

  const isRemoving = removeApiKeyMutation.isPending;
  const isLoading = loadSettingsQuery.isLoading;
  const isDisabled = isLoading || isRemoving;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">{APIKEY_EXISTING_HEADER}</h2>
        <NewApiKeyDialog onSuccess={handleApiKeyCreated}>
          <Button disabled={isDisabled}>{APIKEY_NEW_BUTTON}</Button>
        </NewApiKeyDialog>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{APIKEY_EXISTING_TABLE_HEADER_NAME}</TableHead>
            <TableHead>{APIKEY_EXISTING_TABLE_HEADER_CREATED}</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loadApiKeysQuery.data?.map((item) => (
            <TableRow key={item.name}>
              <TableCell className="py-4">{item.name}</TableCell>
              <TableCell>
                {new Date(item.createdAt).toLocaleDateString()}
              </TableCell>
              <TableCell className="text-right">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" disabled={isDisabled}>
                      {APIKEY_REMOVE_BTN}
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>{APIKEY_REMOVE_DIALOG_HEADER}</DialogTitle>
                      <DialogDescription>
                        {APIKYE_REMOVE_DIALOG_DESC}
                      </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                      <Button
                        variant="destructive"
                        onClick={() => removeApiKey(item.keyId)}
                        disabled={isDisabled}
                      >
                        {isRemoving ? "Removing..." : APIKEY_REMOVE_BTN}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Resources
        links={[
          {
            href: "https://docs.courselit.app/en/developers/introduction",
            text: SETTINGS_RESOURCE_API,
          },
        ]}
      />
    </div>
  );
}
