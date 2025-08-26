"use client";

import { TOAST_TITLE_SUCCESS } from "@/lib/ui/config/strings";
import { TextEditorContent } from "@workspace/common-models";
import { useToast } from "@workspace/components-library";
import { Alert, AlertDescription } from "@workspace/ui/components/alert";
import { Button } from "@workspace/ui/components/button";
import { AlertCircle, Check, Loader2, Pencil, X } from "lucide-react";
import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
const DescriptionEditor = dynamic(() =>
  import(
    "@/components/editors/tiptap/templates/description/description-editor"
  ).then((mod) => ({ default: mod.DescriptionEditor })),
);

interface BannerComponentProps {
  canEdit: boolean;
  initialBannerText?: TextEditorContent | null;
  onSaveBanner: (text: TextEditorContent) => Promise<void>;
}

export default function Banner({
  canEdit,
  initialBannerText,
  onSaveBanner,
}: BannerComponentProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedBannerText, setEditedBannerText] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (initialBannerText) {
      setEditedBannerText(initialBannerText.content);
    }
  }, [initialBannerText]);

  const handleSaveBanner = async () => {
    setIsSaving(true);
    try {
      await onSaveBanner({
        type: "doc",
        content: editedBannerText!,
        assets: [],
        widgets: [],
        config: {
          editorType: "tiptap",
        },
      });
      setIsEditing(false);
    } catch (error: any) {
      toast({
        title: TOAST_TITLE_SUCCESS,
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setEditedBannerText(initialBannerText?.content || "");
    setIsEditing(false);
  };
  if (!canEdit) {
    return null;
  }

  return (
    <div className="relative">
      <Alert>
        <AlertDescription>
          {!isEditing ? (
            <>
              <div className="flex items-center space-x-2 text-muted-foreground">
                <AlertCircle className="h-4 w-4" />
                <p>
                  Share important updates, announcements, or news with your
                  community members here.
                </p>
              </div>
              {canEdit && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={() => setIsEditing(true)}
                >
                  <Pencil className="h-4 w-4" />
                  <span className="sr-only">Edit banner</span>
                </Button>
              )}
            </>
          ) : (
            <div className="space-y-2">
              <DescriptionEditor
                editable={true}
                onEditor={(editor, meta) => {
                  if (meta.reason === "create") {
                    console.log("[editor]", editor, editedBannerText);
                    editor!.commands.setContent(editedBannerText);
                  }
                }}
                onChange={(content) => {
                  setEditedBannerText(content);
                }}
                placeholder="Share important updates, announcements, or news with your community members here."
              />
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCancelEdit}
                  disabled={isSaving}
                >
                  <X className="h-4 w-4 mr-1" />
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleSaveBanner}
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4 mr-1" />
                      Save
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </AlertDescription>
      </Alert>
    </div>
  );
}
