"use client";

import { NodeViewProps, NodeViewWrapper } from "@tiptap/react";
import { Button } from "@workspace/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@workspace/ui/components/dropdown-menu";
import { Input } from "@workspace/ui/components/input";
import { Separator } from "@workspace/ui/components/separator";
import { cn } from "@workspace/ui/lib/utils";
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Edit,
  FileTextIcon,
  Maximize,
  MoreVertical,
  Pause,
  Play,
  Trash,
  Volume2,
  VolumeX
} from "lucide-react";
import { useRef, useState } from "react";

export function MediaViewComponent(props: NodeViewProps) {
  const { node, editor, selected, deleteNode, updateAttributes } = props;
  const [isEditing, setIsEditing] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const [editingCaption, setEditingCaption] = useState(false);
  const [caption, setCaption] = useState(node.attrs.obj?.caption || "");
  const [openedMore, setOpenedMore] = useState(false);
  const mediaRef = useRef<HTMLDivElement>(null);
  const [mediaState, setMediaState] = useState({
    isPlaying: false,
    isMuted: false,
    volume: 1,
  });

  const handleCaptionUpdate = (newCaption: string) => {
    setCaption(newCaption);
    updateAttributes({ 
      obj: { 
        ...node.attrs.obj, 
        caption: newCaption 
      } 
    });
  };

  const handleDelete = () => {
    deleteNode();
  };

  const handleResize = (newWidth: number, newHeight?: number) => {
    updateAttributes({
      attrs: {
        ...node.attrs.attrs,
        width: `${newWidth}px`,
        height: newHeight ? `${newHeight}px` : undefined,
      }
    });
  };

  const handleMediaControl = (control: string, value?: any) => {
    switch (control) {
      case "play":
        setMediaState(prev => ({ ...prev, isPlaying: true }));
        break;
      case "pause":
        setMediaState(prev => ({ ...prev, isPlaying: false }));
        break;
      case "mute":
        setMediaState(prev => ({ ...prev, isMuted: !prev.isMuted }));
        break;
      case "volume":
        setMediaState(prev => ({ ...prev, volume: value }));
        break;
    }
  };

  const renderMediaContent = () => {
    const { attrs, obj } = node.attrs;
    const { src, alt, title, controls, autoplay, loop, muted, poster } = attrs || {};
    const { type } = obj || {};

    switch (type) {
      case "image":
        return (
          <img
            src={src}
            alt={alt}
            title={title}
            className="w-full h-auto rounded-lg"
            onLoad={(e) => {
              const img = e.currentTarget;
              const aspectRatio = img.naturalWidth / img.naturalHeight;
              updateAttributes({ 
                obj: { 
                  ...node.attrs.obj, 
                  aspectRatio 
                } 
              });
            }}
          />
        );

      case "video":
        return (
          <video
            src={src}
            controls={controls}
            autoPlay={autoplay}
            loop={loop}
            muted={muted}
            poster={poster}
            className="w-full h-auto rounded-lg"
            onLoadStart={() => {
              const video = mediaRef.current?.querySelector("video");
              if (video) {
                video.volume = mediaState.volume;
                video.muted = mediaState.isMuted;
              }
            }}
          />
        );

      case "audio":
        return (
          <audio
            src={src}
            controls={controls}
            autoPlay={autoplay}
            loop={loop}
            muted={muted}
            className="w-full"
          />
        );

      case "pdf":
        return (
          <iframe
            src={src}
            className="w-full h-96 rounded-lg border"
            title={title || "PDF Document"}
          />
        );

      case "embed":
        return (
          <div
            className="w-full h-96 rounded-lg border bg-muted flex items-center justify-center"
            dangerouslySetInnerHTML={{ __html: obj?.embedCode || "" }}
          />
        );

      default:
        return (
          <div className="w-full h-32 rounded-lg border bg-muted flex items-center justify-center text-muted-foreground">
            <FileTextIcon className="h-8 w-8" />
            <span className="ml-2">Unsupported media type</span>
          </div>
        );
    }
  };

  const renderMediaControls = () => {
    const { obj } = node.attrs;
    const { type } = obj || {};
    
    if (type === "video" || type === "audio") {
      return (
        <div className="flex items-center gap-2 p-2 bg-background/80 rounded-md">
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8"
            onClick={() => handleMediaControl(mediaState.isPlaying ? "pause" : "play")}
          >
            {mediaState.isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </Button>
          
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8"
            onClick={() => handleMediaControl("mute")}
          >
            {mediaState.isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
          </Button>
        </div>
      );
    }
    
    return null;
  };

  const { attrs, obj } = node.attrs;
  const { width, align } = attrs || {};

  return (
    <NodeViewWrapper
      ref={mediaRef}
      className={cn(
        "media-view-component relative flex flex-col rounded-md border-2 border-transparent transition-all duration-200",
        selected ? "border-blue-300" : "",
        align === "left" && "left-0 -translate-x-0",
        align === "center" && "left-1/2 -translate-x-1/2",
        align === "right" && "left-full -translate-x-full"
      )}
      style={{ width }}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <div className={cn("group relative flex flex-col rounded-md", isResizing && "")}>
        {/* Media Content */}
        <div className="relative">
          {renderMediaContent()}
          
          {/* Media Controls Overlay */}
          {renderMediaControls()}
        </div>

        {/* Caption */}
        {editingCaption ? (
          <Input
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            onBlur={() => {
              handleCaptionUpdate(caption);
              setEditingCaption(false);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleCaptionUpdate(caption);
                setEditingCaption(false);
              }
            }}
            className="mt-2 text-center text-sm text-muted-foreground focus:ring-0"
            placeholder="Add a caption..."
            autoFocus
          />
        ) : (
          <div
            className="mt-2 cursor-text text-center text-sm text-muted-foreground"
            onClick={() => editor?.isEditable && setEditingCaption(true)}
          >
            {caption || "Add a caption..."}
          </div>
        )}

        {/* Toolbar */}
        {editor?.isEditable && (
          <div
            className={cn(
              "absolute right-4 top-4 flex items-center gap-1 rounded-md border bg-background/80 p-1 opacity-0 backdrop-blur transition-opacity",
              !isResizing && "group-hover:opacity-100",
              openedMore && "opacity-100"
            )}
          >
            {/* Alignment buttons */}
            <Button
              size="icon"
              className={cn("size-7", align === "left" && "bg-accent")}
              variant="ghost"
              onClick={() => updateAttributes({ 
                attrs: { 
                  ...node.attrs.attrs, 
                  align: "left" 
                } 
              })}
            >
              <AlignLeft className="size-4" />
            </Button>
            <Button
              size="icon"
              className={cn("size-7", align === "center" && "bg-accent")}
              variant="ghost"
              onClick={() => updateAttributes({ 
                attrs: { 
                  ...node.attrs.attrs, 
                  align: "center" 
                } 
              })}
            >
              <AlignCenter className="size-4" />
            </Button>
            <Button
              size="icon"
              className={cn("size-7", align === "right" && "bg-accent")}
              variant="ghost"
              onClick={() => updateAttributes({ 
                attrs: { 
                  ...node.attrs.attrs, 
                  align: "right" 
                } 
              })}
            >
              <AlignRight className="size-4" />
            </Button>
            
            <Separator orientation="vertical" className="h-[20px]" />
            
            {/* More options */}
            <DropdownMenu open={openedMore} onOpenChange={setOpenedMore}>
              <DropdownMenuTrigger asChild>
                <Button size="icon" className="size-7" variant="ghost">
                  <MoreVertical className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" alignOffset={-90} className="mt-1 text-sm">
                <DropdownMenuItem onClick={() => setEditingCaption(true)}>
                  <Edit className="mr-2 size-4" /> Edit Caption
                </DropdownMenuItem>
                
                <DropdownMenuItem
                  onClick={() => {
                    const aspectRatio = obj?.aspectRatio;
                    if (aspectRatio) {
                      const parentWidth = mediaRef.current?.parentElement?.offsetWidth ?? 0;
                      updateAttributes({
                        attrs: {
                          ...node.attrs.attrs,
                          width: parentWidth,
                          height: parentWidth / aspectRatio,
                        }
                      });
                    }
                  }}
                >
                  <Maximize className="mr-2 size-4" /> Full Width
                </DropdownMenuItem>
                
                <DropdownMenuSeparator />
                
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onClick={handleDelete}
                >
                  <Trash className="mr-2 size-4" /> Delete Media
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>
    </NodeViewWrapper>
  );
}
