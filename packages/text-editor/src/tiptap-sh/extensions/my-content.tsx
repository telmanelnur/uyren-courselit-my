"use client";

import { Extension } from "@tiptap/core";
import { TextEditorContent } from "@workspace/common-models";

declare module "@tiptap/core" {
    interface Commands<ReturnType> {
        myContent: {
            setMyContent: (content: TextEditorContent) => ReturnType;
        };
    }
}

export const MyContentExtension = Extension.create<{}, any>({
    name: "myContent",

    addCommands() {
        return {
            setMyContent: (textEditorContent: TextEditorContent) => ({ editor, commands }) => {
                commands.setContent(textEditorContent.content);
                return true;
            },
        }
    },
});
