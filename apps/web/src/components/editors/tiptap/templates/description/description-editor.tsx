import { ContentEditor, ContentEditorProps } from "@workspace/text-editor/tiptap";

import "@workspace/text-editor/tiptap/styles/_variables.scss";
import "@workspace/text-editor/tiptap/styles/_keyframe-animations.scss";
import "./description-editor.scss";

export function DescriptionEditor(props: ContentEditorProps) {
    return (
        <ContentEditor className="description-editor-wrapper" {...props} />
    )
}


