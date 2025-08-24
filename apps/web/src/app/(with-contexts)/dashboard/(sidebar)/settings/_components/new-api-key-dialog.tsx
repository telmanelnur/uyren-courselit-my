"use client";

import { useState } from "react";
import { Button } from "@workspace/ui/components/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@workspace/ui/components/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@workspace/ui/components/form";
import { Input } from "@workspace/ui/components/input";
import { useToast } from "@workspace/components-library";
import { trpc } from "@/utils/trpc";
import {
  APIKEY_NEW_BTN_CAPTION,
  APIKEY_NEW_GENERATED_KEY_COPIED,
  APIKEY_NEW_GENERATED_KEY_DESC,
  APIKEY_NEW_GENERATED_KEY_HEADER,
  APIKEY_NEW_HEADER,
  APIKEY_NEW_LABEL,
  BUTTON_CANCEL_TEXT,
  BUTTON_DONE_TEXT,
  TOAST_TITLE_ERROR,
  TOAST_TITLE_SUCCESS,
} from "@/lib/ui/config/strings";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Copy } from "lucide-react";

const newApiKeySchema = z.object({
  name: z.string().min(1, "API key name is required"),
});

type NewApiKeyFormData = z.infer<typeof newApiKeySchema>;

interface NewApiKeyDialogProps {
  children: React.ReactNode;
  onSuccess?: () => void;
}

export default function NewApiKeyDialog({ children, onSuccess }: NewApiKeyDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [generatedKey, setGeneratedKey] = useState("");
  const { toast } = useToast();

  const addApiKeyMutation = trpc.siteModule.siteInfo.addApiKey.useMutation({
    onSuccess: (response) => {
      if (response?.key) {
        setGeneratedKey(response.key);
        toast({
          title: TOAST_TITLE_SUCCESS,
          description: "API key created successfully",
        });
      }
    },
    onError: (error: any) => {
      toast({
        title: TOAST_TITLE_ERROR,
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const form = useForm<NewApiKeyFormData>({
    resolver: zodResolver(newApiKeySchema),
    defaultValues: {
      name: "",
    },
  });

  const onSubmit = async (data: NewApiKeyFormData) => {
    try {
      await addApiKeyMutation.mutateAsync({
        data: {
          name: data.name,
        },
      });
    } catch (error) {
      // Error handling is done in the mutation
    }
  };

  const copyToClipboard = async () => {
    if (navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(generatedKey);
        toast({
          title: TOAST_TITLE_SUCCESS,
          description: APIKEY_NEW_GENERATED_KEY_COPIED,
        });
      } catch (error) {
        toast({
          title: TOAST_TITLE_ERROR,
          description: "Failed to copy to clipboard",
          variant: "destructive",
        });
      }
    }
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
  };

  const handleDone = () => {
    setIsOpen(false);
  };

  const isSubmitting = addApiKeyMutation.isPending;

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{APIKEY_NEW_HEADER}</DialogTitle>
          <DialogDescription>
            Create a new API key for external integrations and services.
          </DialogDescription>
        </DialogHeader>

        {!generatedKey ? (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{APIKEY_NEW_LABEL}</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Enter API key name..."
                        disabled={isSubmitting}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsOpen(false)}
                  disabled={isSubmitting}
                >
                  {BUTTON_CANCEL_TEXT}
                </Button>
                <Button
                  type="submit"
                  disabled={!form.watch("name") || isSubmitting}
                >
                  {isSubmitting ? "Creating..." : APIKEY_NEW_BTN_CAPTION}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <h3 className="text-lg font-medium">
                {APIKEY_NEW_GENERATED_KEY_HEADER}
              </h3>
              <p className="text-sm text-muted-foreground">
                {APIKEY_NEW_GENERATED_KEY_DESC}
              </p>
            </div>

            <div className="space-y-2">
              <FormLabel>API Key</FormLabel>
              <div className="flex gap-2">
                <Input
                  value={generatedKey}
                  readOnly
                  className="font-mono text-sm"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={copyToClipboard}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <DialogFooter>
              <Button onClick={handleDone}>
                {BUTTON_DONE_TEXT}
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
