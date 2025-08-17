import { ContentEditorProps, ContentEditorRef, NotionContentEditor, VideoIcon } from "@workspace/text-editor/tiptap";
import { forwardRef } from "react";

import "@workspace/text-editor/tiptap/styles/_keyframe-animations.scss";
import "@workspace/text-editor/tiptap/styles/_variables.scss";
import { AssignmentLinkNodeExtension } from "../../extensions/assignment-link/assignment-link-node-extension";
import { ImageIcon } from "@workspace/text-editor/tiptap";
import { MediaBrowserNiceDialog, NiceModal } from "@workspace/components-library";
import { MyEditorContentNodeExtension } from "../../extensions/my-editor-content/my-editor-content-node-extension";


export const LessonContentEditor = forwardRef<ContentEditorRef, ContentEditorProps>(
    (props, ref) => {

        return (
            <NotionContentEditor
                onEditor={(editor, meta) => {
                    if (ref && typeof ref === 'function') {
                        ref(editor);
                    } else if (ref && typeof ref === 'object') {
                        (ref as any).current = editor;
                    }
                    if (props.onEditor) {
                        props.onEditor(editor, meta);
                    }
                }}
                className="lesson-content-editor-wrapper"
                extraExtensions={[
                    AssignmentLinkNodeExtension,
                    MyEditorContentNodeExtension,
                ]}
                extraSlashMenuConfig={{
                    customItems: [
                        {
                            title: 'Upload Media',
                            subtext: 'Insert image from media library',
                            badge: ImageIcon,
                            onSelect: ({ editor }: any) => {
                                NiceModal.show(MediaBrowserNiceDialog, {
                                    selectMode: true,
                                    selectedMedia: null,
                                    initialFileType: "image",
                                }).then((result) => {
                                    if (result.reason === "submit") {
                                        editor
                                            .chain()
                                            .focus()
                                            .setImage({
                                                src: result.data.url,
                                                alt: result.data.caption || result.data.originalFileName,
                                                title: result.data.caption || result.data.originalFileName,
                                            })
                                            .run();
                                    }
                                })
                            },
                        },
                        {
                            title: 'Upload Video',
                            subtext: 'Insert video from media library',
                            badge: VideoIcon,
                            onSelect: ({ editor }: any) => {
                                NiceModal.show(MediaBrowserNiceDialog, {
                                    selectedMedia: null,
                                    initialFileType: "video",
                                    selectMode: true,
                                }).then((result) => {
                                    if (result.reason === "submit") {
                                        editor
                                            .chain()
                                            .focus()
                                            .setVideo({
                                                src: result.data.url,
                                                alt: result.data.caption || result.data.originalFileName,
                                                title: result.data.caption || result.data.originalFileName,
                                            })
                                            .run();
                                    }
                                })
                            }
                        },
                        {
                            title: 'Assignment',
                            subtext: 'Insert assignment from media library',
                            // badge: AssignmentLinkNodeExtension,
                            onSelect: ({ editor }: any) => {
                                editor.chain().focus().insertAssignmentLink({ label: "Assignment", entityId: "123" }).run();
                            }
                        }
                    ]
                }}
                {...props}
            />
        );
    }
);

LessonContentEditor.displayName = "LessonContentEditor";
