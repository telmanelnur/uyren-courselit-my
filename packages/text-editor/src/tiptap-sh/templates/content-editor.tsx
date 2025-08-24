"use client";

import { Color } from "@tiptap/extension-color";
import Highlight from "@tiptap/extension-highlight";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import Subscript from "@tiptap/extension-subscript";
import Superscript from "@tiptap/extension-superscript";
import TextAlign from "@tiptap/extension-text-align";
import { TextStyleKit } from "@tiptap/extension-text-style";
import Typography from "@tiptap/extension-typography";
import Underline from "@tiptap/extension-underline";
import { Editor, EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { cn } from "@workspace/ui/lib/utils";
import { useMemo } from "react";
import { TipTapFloatingMenu } from "../extensions/floating-menu";
import { FloatingToolbar } from "../extensions/floating-toolbar";
import { ImageExtension } from "../extensions/image";
import { ImagePlaceholder } from "../extensions/image-placeholder";
import { MediaViewExtension } from "../extensions/media-view";
import SearchAndReplace from "../extensions/search-and-replace";
import { EditorToolbar } from "../toolbars/editor-toolbar";

import "../styles/tiptap.css";

export type ContentEditorProps = {
  initialContent?: string;
  onChange?: (content: string) => void;
  onEditor?: (editor: Editor | null, meta: {
    reason: "create" | "destroy"
  }) => void;
  placeholder?: string;
  editable?: boolean;
  className?: ReturnType<typeof cn>;
  extensions?: any[];
}

export function ContentEditor({
  initialContent,
  onChange,
  onEditor,
  placeholder,
  editable = true,
  className,
  extensions = [],
}: ContentEditorProps) {
  const allExtensions = useMemo(() => {
    const defaultExtensions = [
      StarterKit.configure({
        orderedList: {
          HTMLAttributes: {
            class: "list-decimal",
          },
        },
        bulletList: {
          HTMLAttributes: {
            class: "list-disc",
          },
        },
        heading: {
          levels: [1, 2, 3, 4],
        },
      }),
      Placeholder.configure({
        emptyNodeClass: "is-editor-empty",
        placeholder: ({ node }) => {
          switch (node.type.name) {
            case "heading":
              return `Heading ${node.attrs.level}`;
            case "detailsSummary":
              return "Section title";
            case "codeBlock":
              return "";
            default:
              return placeholder || "Write, type '/' for commands";
          }
        },
        includeChildren: false,
      }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      TextStyleKit,
      Subscript,
      Superscript,
      Underline,
      Link,
      Color,
      Highlight.configure({
        multicolor: true,
      }),
      ImageExtension,
      ImagePlaceholder,
      MediaViewExtension,
      SearchAndReplace,
      Typography,
    ];
    return [...defaultExtensions, ...extensions]
  },
    [extensions, placeholder]
  )

  const editor = useEditor({
    immediatelyRender: false,
    extensions: allExtensions,
    content: initialContent,
    editorProps: {
      attributes: {
        class: "content-editor max-w-full focus:outline-none",
      },
    },
    onUpdate: ({ editor }) => {
      if (onChange) {
        const currentContent = editor.getHTML();
        onChange(currentContent);
      }
    },
    onCreate: ({ editor }: { editor: Editor }) => {
      if (onEditor) {
        onEditor(editor, { reason: "create" });
      }
    },
    onDestroy: () => {
      if (onEditor) {
        onEditor(null, { reason: "destroy" });
      }
    },
  });

  if (!editor) return null;

  return (
    <div
      className={cn(
        "content-editor-wrapper",
        "relative max-h-[calc(100dvh-6rem)]  w-full overflow-hidden overflow-y-scroll border bg-card pb-[60px] sm:pb-0",
        className
      )}
    >
      <EditorToolbar editor={editor} />
      <FloatingToolbar editor={editor} />
      <TipTapFloatingMenu editor={editor} />
      <EditorContent
        editor={editor}
        className="content-editor-content w-full min-w-full cursor-text sm:p-6"
      />
    </div>
  );
}
