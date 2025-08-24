"use client";

import React, { useState, useCallback } from "react";
import { Button } from "@workspace/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@workspace/ui/components/tooltip";
import {
  ImageIcon,
  VideoIcon,
  FileTextIcon,
  Plus,
} from "lucide-react";
import { useToolbar } from "./toolbar-provider";
import { cn } from "@workspace/ui/lib/utils";
import { MediaBrowserNiceDialog, NiceModal } from "@workspace/components-library";

export function MediaDropdownToolbar({ 
  className
}: {
  className?: string;
}) {
  const { editor } = useToolbar();
  const [isOpen, setIsOpen] = useState(false);

  const openMediaDialog = useCallback(async (fileType: string) => {
    try {
      const result = await NiceModal.show(MediaBrowserNiceDialog, {
        selectMode: true,
        selectedMedia: null,
        initialFileType: fileType,
      });
      
      if (result.reason === "submit" && editor) {
        const mediaOptions = {
          attrs: {
            src: result.data.url,
            alt: result.data.caption || result.data.originalFileName,
            title: result.data.caption || result.data.originalFileName,
            width: "100%",
            height: null,
            align: "center",
            controls: true,
            autoplay: false,
            loop: false,
            muted: false,
            poster: null,
          },
          obj: {
            type: fileType === "image/" ? "image" : 
                  fileType === "video/" ? "video" : 
                  fileType === "audio/" ? "audio" : 
                  fileType === "application/pdf" ? "pdf" : "file",
            caption: result.data.caption || "",
            aspectRatio: null,
            assetId: generateUniqueId(),
            originalFileName: result.data.originalFileName,
            mimeType: result.data.mimeType,
            fileSize: result.data.size,
            uploadDate: new Date().toISOString(),
            embedCode: null,
            embedType: null,
          }
        };

        editor.chain().focus().setMediaView(mediaOptions).run();
      }
      
      setIsOpen(false);
      return result;
    } catch (error) {
      console.error("Failed to open media dialog:", error);
      setIsOpen(false);
      return null;
    }
  }, [editor]);

  const generateUniqueId = () => {
    return Math.random().toString(36).substr(2, 9);
  };

  if (!editor) return null;

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <Tooltip>
        <TooltipTrigger asChild>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "h-8 w-8 p-0 sm:h-9 sm:w-9",
                editor?.isActive("mediaView") && "bg-accent",
                className
              )}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
        </TooltipTrigger>
        <TooltipContent>
          <span>Insert Media</span>
        </TooltipContent>
      </Tooltip>

      <DropdownMenuContent align="start" className="w-48">
        <DropdownMenuItem onClick={() => openMediaDialog("image/")}>
          <ImageIcon className="h-4 w-4 mr-2" />
          Image
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => openMediaDialog("video/")}>
          <VideoIcon className="h-4 w-4 mr-2" />
          Video
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => openMediaDialog("audio/")}>
          <FileTextIcon className="h-4 w-4 mr-2" />
          Audio
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => openMediaDialog("application/pdf")}>
          <FileTextIcon className="h-4 w-4 mr-2" />
          PDF
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
