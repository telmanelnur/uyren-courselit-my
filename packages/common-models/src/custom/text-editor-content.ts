import { Media } from "../media";

type Asset = {
    url: string;
    caption?: string;
    media?: Media;
}

export type TextEditorContentWidget<TData = Record<string, unknown>,> = {
    type: string;
    objectId: string;
    title: string;
    data: TData;
}

export interface TextEditorContent {
    type: "doc";
    assets: Asset[];
    widgets: TextEditorContentWidget[];
    content: string;
    config: {
        editorType: "tiptap";
    },
}
