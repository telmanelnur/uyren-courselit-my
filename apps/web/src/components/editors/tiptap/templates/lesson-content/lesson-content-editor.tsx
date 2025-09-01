"use client";

import { Editor } from "@tiptap/react";
import {
  ContentEditor,
  ContentEditorProps,
  EditorToolbarItems,
  ToolbarProvider,
  useToolbar,
} from "@workspace/text-editor/tiptap-sh";
import { Button } from "@workspace/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu";
import { ScrollArea, ScrollBar } from "@workspace/ui/components/scroll-area";
import { Separator } from "@workspace/ui/components/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@workspace/ui/components/tooltip";
import { cn } from "@workspace/ui/lib/utils";
import { FileTextIcon, HelpCircleIcon, Plus } from "lucide-react";
import { AssignmentLinkNodeExtension } from "../../extensions/assignment-link/assignment-link-node-extension";

import "./lesson-content-editor.scss";

export const LessonContentEditor = (props: ContentEditorProps) => {
  return (
    <ContentEditor
      className={cn(
        "lesson-content-editor-wrapper",
        props.className,
        props.editable ? "" : "readonly",
      )}
      extraExtensions={[AssignmentLinkNodeExtension]}
      {...props}
      toolbar={props.toolbar !== undefined ? props.toolbar : EditorToolbar}
    />
  );
};

const EditorToolbar = ({ editor }: { editor: Editor }) => {
  return (
    <div className="sticky top-0 z-20 w-full border-b bg-background hidden sm:block">
      <ToolbarProvider editor={editor as any}>
        <TooltipProvider>
          <ScrollArea className="h-fit py-0.5">
            <div>
              <div className="flex items-center gap-1 px-2">
                {/* History Group */}
                <EditorToolbarItems.UndoToolbar />
                <EditorToolbarItems.RedoToolbar />
                <Separator orientation="vertical" className="mx-1 h-7" />

                {/* Text Structure Group */}
                <EditorToolbarItems.HeadingsToolbar />
                <EditorToolbarItems.BlockquoteToolbar />
                <EditorToolbarItems.CodeToolbar />
                <EditorToolbarItems.CodeBlockToolbar />
                <Separator orientation="vertical" className="mx-1 h-7" />

                {/* Basic Formatting Group */}
                <EditorToolbarItems.BoldToolbar />
                <EditorToolbarItems.ItalicToolbar />
                <EditorToolbarItems.UnderlineToolbar />
                <EditorToolbarItems.StrikeThroughToolbar />
                <EditorToolbarItems.LinkToolbar />
                <Separator orientation="vertical" className="mx-1 h-7" />

                {/* Lists & Structure Group */}
                <EditorToolbarItems.BulletListToolbar />
                <EditorToolbarItems.OrderedListToolbar />
                <EditorToolbarItems.HorizontalRuleToolbar />
                <Separator orientation="vertical" className="mx-1 h-7" />

                {/* Alignment Group */}
                <EditorToolbarItems.AlignmentTooolbar />
                <Separator orientation="vertical" className="mx-1 h-7" />

                {/* Media & Styling Group */}
                <EditorToolbarItems.MediaDropdownToolbar />
                <EditorToolbarItems.ColorHighlightToolbar />
                <Separator orientation="vertical" className="mx-1 h-7" />
                <InsertAssignmentToolbar />

                <div className="flex-1" />

                {/* Utility Group */}
                {/* <EditorToolbarItems.SearchAndReplaceToolbar /> */}
              </div>
            </div>
            <ScrollBar className="hidden" orientation="horizontal" />
          </ScrollArea>
        </TooltipProvider>
      </ToolbarProvider>
    </div>
  );
};

const InsertAssignmentToolbar = () => {
  const { editor } = useToolbar();

  const handleInsertAssingment = (type: "assignment" | "quiz") => {
    if (type === "assignment") {
      editor.commands.insertAssignmentLink({
        label: "Assignment",
        obj: null,
        link: "#",
      });
    } else {
      editor.commands.insertAssignmentLink({
        label: "Quiz",
        obj: null,
        link: "#",
      });
    }
  };

  return (
    <DropdownMenu>
      <Tooltip>
        <TooltipTrigger asChild>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 p-0 sm:h-9 sm:w-9"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
        </TooltipTrigger>
        <TooltipContent>
          <span>Insert Assignment</span>
        </TooltipContent>
      </Tooltip>

      <DropdownMenuContent align="start" className="w-48">
        <DropdownMenuItem onClick={() => handleInsertAssingment("assignment")}>
          <FileTextIcon className="h-4 w-4 mr-2" />
          Assignment
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleInsertAssingment("quiz")}>
          <HelpCircleIcon className="h-4 w-4 mr-2" />
          Quiz
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
