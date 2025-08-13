"use client";

/* eslint-disable react-hooks/rules-of-hooks */
import {
    AnyExtension,
    getTextContentFromSlice,
    RemirrorEventListenerProps,
    Slice,
} from "@remirror/core";
import { RemirrorContentType } from "@remirror/core-types";
import { TableComponents } from "@remirror/extension-react-tables";
import {
    EditorComponent,
    Remirror,
    ThemeProvider,
    useRemirror,
} from "@remirror/react";
import { FC, PropsWithChildren, useCallback, useEffect } from "react";
import { InvalidContentHandler } from "remirror";
import BubbleMenu from "./BubbleMenu";
import emptyDoc from "./empty-doc";
import { getExtensions } from "./extensions";
import Toolbar from "./Toolbar";
import { ReactEditorProps } from "./types";

export interface WysiwygEditorProps {
    onChange: (json: unknown) => void;
    showToolbar?: boolean;
    editable?: boolean;
    refresh?: number;
    fontFamily?: string;
    url: string;
    initialContent?: ReactEditorProps["initialContent"];
    stringHandler?: ReactEditorProps["stringHandler"];
    placeholder?: string;
    autoFocus?: boolean;
    hooks?: ReactEditorProps["hooks"];
}

interface WysiwygEditorType extends FC<PropsWithChildren<WysiwygEditorProps>> {
    getPlainText: (doc: RemirrorContentType) => string;
    emptyDoc: RemirrorContentType;
}

const WysiwygEditor: WysiwygEditorType = Object.assign(
    ({
        initialContent,
        onChange,
        placeholder,
        stringHandler,
        children,
        showToolbar = true,
        editable = true,
        refresh,
        fontFamily,
        url,
        ...rest
    }: WysiwygEditorProps & {
        children: React.ReactNode;
    }) => {
        const theme = {
            fontFamily: {
                default: fontFamily,
            },
        };

        if (typeof window === "undefined") {
            return <></>;
        }

        useEffect(() => {
            manager.view.updateState(
                manager.createState({
                    content: initialContent as RemirrorContentType,
                }),
            );
        }, [refresh]);

        const extensions = useCallback(() => {
            const exts = getExtensions(placeholder!, url)();
            return exts as unknown as AnyExtension[];
        }, [placeholder, url]);

        const onError: InvalidContentHandler = useCallback(
            ({ json, invalidContent, transformers }: any) => {
                // Automatically remove all invalid nodes and marks.
                return transformers.remove(json, invalidContent);
            },
            [],
        );

        const {
            manager,
            state,
            onChange: onChangeRemirror,
        } = useRemirror({
            extensions,
            stringHandler,
            content: (initialContent as RemirrorContentType) || emptyDoc,
            onError,
        });

        const onChangeFunc = (
            data: RemirrorEventListenerProps<AnyExtension>,
        ) => {
            setTimeout(() => onChange(data.helpers.getJSON()), 0);
        };

        return (
            <ThemeProvider theme={theme}>
                <Remirror
                    manager={manager}
                    state={state}
                    onChange={(data: any) => {
                        onChangeRemirror(data);
                        onChangeFunc(data);
                    }}
                    editable={editable}
                    {...rest}
                >
                    {editable && showToolbar && <Toolbar />}
                    <EditorComponent />
                    <BubbleMenu />
                    <TableComponents />
                    {children}
                </Remirror>
            </ThemeProvider>
        );
    },
    {
        getPlainText: (doc: RemirrorContentType) =>
            getTextContentFromSlice(doc as unknown as Slice),
        emptyDoc,
    },
) as WysiwygEditorType;

export default WysiwygEditor;
