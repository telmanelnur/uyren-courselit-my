// src/extensions/myTextEditorContent.ts
import { Extension } from "@tiptap/core";
import { TextEditorContent } from "@workspace/common-models";

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    myTextEditorContent: {
      /**
       * Set the entire custom content, including metadata.
       * NOTE: Only the 'content' field is applied to the editor's document.
       * The other fields should be handled by the parent component.
       */
      setMyEditorContent: (payload: TextEditorContent) => ReturnType;
    };
  }
}

export const MyEditorContentNodeExtension = Extension.create({
  name: "myEditorContentNode",

  addCommands() {
    return {
      setMyEditorContent:
        (payload) =>
        ({ editor }) => {
          // Here, we're using the built-in setContent command
          // to handle the actual editor content.
          // This is the core logic.
          return editor.commands.setContent(payload.content);
        },
    };
  },
});
