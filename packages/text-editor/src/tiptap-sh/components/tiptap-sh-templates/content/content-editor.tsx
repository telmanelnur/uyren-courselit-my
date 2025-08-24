"use client"

import { Editor, EditorContent, EditorContext, useEditor } from "@tiptap/react"
import * as React from "react"

// --- Tiptap Core Extensions ---
import { Highlight } from "@tiptap/extension-highlight"
import { Image } from "@tiptap/extension-image"
import { TaskItem, TaskList } from "@tiptap/extension-list"
import { Subscript } from "@tiptap/extension-subscript"
import { Superscript } from "@tiptap/extension-superscript"
import { TextAlign } from "@tiptap/extension-text-align"
import { Typography } from "@tiptap/extension-typography"
import { Selection } from "@tiptap/extensions"
import { StarterKit } from "@tiptap/starter-kit"
import { BubbleMenu } from "@tiptap/extension-bubble-menu"
import { FloatingMenu } from "@tiptap/extension-floating-menu"

// --- UI Primitives ---
import { Button } from "../../../../tiptap/components/tiptap-ui-primitive/button"
import { Spacer } from "../../../../tiptap/components/tiptap-ui-primitive/spacer"
import {
  Toolbar,
  ToolbarGroup,
  ToolbarSeparator,
} from "../../../../tiptap/components/tiptap-ui-primitive/toolbar"

// --- Tiptap Node ---
import { HorizontalRule } from "../../../../tiptap/components/tiptap-node/horizontal-rule-node/horizontal-rule-node-extension"
import "../../../../tiptap/components/tiptap-node/blockquote-node/blockquote-node.scss"
import "../../../../tiptap/components/tiptap-node/code-block-node/code-block-node.scss"
import "../../../../tiptap/components/tiptap-node/horizontal-rule-node/horizontal-rule-node.scss"
import "../../../../tiptap/components/tiptap-node/list-node/list-node.scss"
import "../../../../tiptap/components/tiptap-node/image-node/image-node.scss"
import "../../../../tiptap/components/tiptap-node/heading-node/heading-node.scss"
import "../../../../tiptap/components/tiptap-node/paragraph-node/paragraph-node.scss"
import "../../../../tiptap/components/tiptap-node/table-node/table-node.scss"

// --- Tiptap UI ---
import { MediaDropdown } from "../../../../tiptap/components/custom/media-dropdown"
import { BlockquoteButton } from "../../../../tiptap/components/tiptap-ui/blockquote-button"
import { CodeBlockButton } from "../../../../tiptap/components/tiptap-ui/code-block-button"
import {
  ColorHighlightPopover,
  ColorHighlightPopoverButton,
  ColorHighlightPopoverContent,
} from "../../../../tiptap/components/tiptap-ui/color-highlight-popover"
import { HeadingDropdownMenu } from "../../../../tiptap/components/tiptap-ui/heading-dropdown-menu"
import {
  LinkButton,
  LinkContent,
  LinkPopover,
} from "../../../../tiptap/components/tiptap-ui/link-popover"
import { ListDropdownMenu } from "../../../../tiptap/components/tiptap-ui/list-dropdown-menu"
import { MarkButton } from "../../../../tiptap/components/tiptap-ui/mark-button"
import { TextAlignButton } from "../../../../tiptap/components/tiptap-ui/text-align-button"
import { UndoRedoButton } from "../../../../tiptap/components/tiptap-ui/undo-redo-button"

// --- Icons ---
import { ArrowLeftIcon } from "../../../../tiptap/components/tiptap-icons/arrow-left-icon"
import { HighlighterIcon } from "../../../../tiptap/components/tiptap-icons/highlighter-icon"
import { LinkIcon } from "../../../../tiptap/components/tiptap-icons/link-icon"

// --- Hooks ---
import { useCursorVisibility } from "../../../../tiptap/hooks/use-cursor-visibility"
import { useIsMobile } from "../../../../tiptap/hooks/use-mobile"
import { useWindowSize } from "../../../../tiptap/hooks/use-window-size"

// --- Components ---
import { ThemeToggle } from "../../../../tiptap/components/tiptap-templates/simple/theme-toggle"

// --- Lib ---
import { cn } from "../../../../tiptap/lib/tiptap-utils"

// --- Styles ---
import "../../../../tiptap/components/tiptap-templates/content/content-editor.scss"

import VideoNodeExtension from "../../../../tiptap/components/custom/video/video-node-extension"

const MainToolbarContent = React.memo(({
  onHighlighterClick,
  onLinkClick,
  isMobile,
}: {
  onHighlighterClick: () => void
  onLinkClick: () => void
  isMobile: boolean
}) => {
  return (
    <>
      <Spacer />

      <ToolbarGroup>
        <UndoRedoButton action="undo" />
        <UndoRedoButton action="redo" />
      </ToolbarGroup>

      <ToolbarSeparator />

      <ToolbarGroup>
        <HeadingDropdownMenu levels={[1, 2, 3, 4]} portal={isMobile} />
        <ListDropdownMenu
          types={["bulletList", "orderedList", "taskList"]}
          portal={isMobile}
        />
        <BlockquoteButton />
        <CodeBlockButton />
      </ToolbarGroup>

      <ToolbarSeparator />

      <ToolbarGroup>
        <MarkButton type="bold" />
        <MarkButton type="italic" />
        <MarkButton type="strike" />
        <MarkButton type="code" />
        <MarkButton type="underline" />
        {!isMobile ? (
          <ColorHighlightPopover />
        ) : (
          <ColorHighlightPopoverButton onClick={onHighlighterClick} />
        )}
        {!isMobile ? <LinkPopover /> : <LinkButton onClick={onLinkClick} />}
      </ToolbarGroup>

      <ToolbarSeparator />

      <ToolbarGroup>
        <MarkButton type="superscript" />
        <MarkButton type="subscript" />
      </ToolbarGroup>

      <ToolbarSeparator />

      <ToolbarGroup>
        <TextAlignButton align="left" />
        <TextAlignButton align="center" />
        <TextAlignButton align="right" />
        <TextAlignButton align="justify" />
      </ToolbarGroup>

      <ToolbarSeparator />

      <ToolbarGroup>
        <MediaDropdown
          text="Media"
        />
      </ToolbarGroup>

      <Spacer />

      {isMobile && <ToolbarSeparator />}

      <ToolbarGroup>
        <ThemeToggle />
      </ToolbarGroup>
    </>
  )
})

MainToolbarContent.displayName = "MainToolbarContent"

const MobileToolbarContent = React.memo(({
  type,
  onBack,
}: {
  type: "highlighter" | "link"
  onBack: () => void
}) => (
  <>
    <ToolbarGroup>
      <Button data-style="ghost" onClick={onBack}>
        <ArrowLeftIcon className="tiptap-button-icon" />
        {type === "highlighter" ? (
          <HighlighterIcon className="tiptap-button-icon" />
        ) : (
          <LinkIcon className="tiptap-button-icon" />
        )}
      </Button>
    </ToolbarGroup>

    <ToolbarSeparator />

    {type === "highlighter" ? (
      <ColorHighlightPopoverContent />
    ) : (
      <LinkContent />
    )}
  </>
))

MobileToolbarContent.displayName = "MobileToolbarContent"

export type ContentEditorRef = Editor;

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

export const ContentEditor = React.memo(({
  initialContent,
  onChange,
  onEditor,
  placeholder,
  editable = true,
  className,
  extensions = [],
}: ContentEditorProps) => {
  const isMobile = useIsMobile()
  const { height } = useWindowSize()
  const [mobileView, setMobileView] = React.useState<
    "main" | "highlighter" | "link"
  >("main")
  const toolbarRef = React.useRef<HTMLDivElement>(null)

  const defaultExtensions = React.useMemo(() => [
    StarterKit.configure({
      horizontalRule: false,
      link: {
        openOnClick: false,
        enableClickSelection: true,
      },
    }),
    HorizontalRule,
    TextAlign.configure({ types: ["heading", "paragraph"] }),
    TaskList,
    TaskItem.configure({ nested: true }),
    Highlight.configure({ multicolor: true }),
    Image,
    Typography,
    Superscript,
    Subscript,
    Selection,
    VideoNodeExtension,
    BubbleMenu.configure({
      element: null,
    }),
    FloatingMenu.configure({
      element: null,
    }),
  ], [])

  const allExtensions = React.useMemo(() => 
    [...defaultExtensions, ...extensions], 
    [defaultExtensions, extensions]
  )

  const editorProps = React.useMemo(() => ({
    immediatelyRender: false,
    shouldRerenderOnTransaction: false,
    editorProps: {
      attributes: {
        autocomplete: "off",
        autocorrect: "off",
        autocapitalize: "off",
        class: "content-editor",
        placeholder: placeholder || "Main content area, start typing to enter text.",
        "aria-label": placeholder || "Main content area, start typing to enter text.",
      },
    },
    extensions: allExtensions,
    content: initialContent,
    editable,
    onUpdate: ({ editor }: { editor: Editor }) => {
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
  }), [allExtensions, initialContent, editable, onChange, onEditor, placeholder])

  const editor = useEditor(editorProps)

  const rect = useCursorVisibility({
    editor,
    overlayHeight: toolbarRef.current?.getBoundingClientRect().height ?? 0,
  })

  const handleHighlighterClick = React.useCallback(() => {
    setMobileView("highlighter")
  }, [])

  const handleLinkClick = React.useCallback(() => {
    setMobileView("link")
  }, [])

  const handleBack = React.useCallback(() => {
    setMobileView("main")
  }, [])

  const toolbarStyle = React.useMemo(() => ({
    ...(isMobile
      ? {
        bottom: `calc(100% - ${height - rect.y}px)`,
      }
      : {}),
  }), [isMobile, height, rect.y])

  React.useEffect(() => {
    if (!isMobile && mobileView !== "main") {
      setMobileView("main")
    }
  }, [isMobile, mobileView])

  if (!editor) {
    return null
  }

  return (
    <div className={cn("content-editor-wrapper", className)}>
      <EditorContext.Provider value={{ editor }}>
        {editable && (
          <Toolbar
            ref={toolbarRef}
            style={toolbarStyle}
          >
            {mobileView === "main" ? (
              <MainToolbarContent
                onHighlighterClick={handleHighlighterClick}
                onLinkClick={handleLinkClick}
                isMobile={isMobile}
              />
            ) : (
              <MobileToolbarContent
                type={mobileView === "highlighter" ? "highlighter" : "link"}
                onBack={handleBack}
              />
            )}
          </Toolbar>
        )}

        <EditorContent
          editor={editor}
          role="presentation"
          className="content-editor-content"
        />
      </EditorContext.Provider>
    </div>
  )
})

ContentEditor.displayName = "ContentEditor"
