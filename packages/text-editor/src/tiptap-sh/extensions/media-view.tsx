"use client";

import { Node, mergeAttributes } from "@tiptap/core";
import { ReactNodeViewRenderer } from "@tiptap/react";
import { MediaViewComponent } from "../components/media-view-component";
import { TextEditorContent } from "@workspace/common-models";

export interface MediaViewOptions {
  HTMLAttributes: Record<string, any>;
}

type AssetType = TextEditorContent["assets"][number];

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    mediaView: {
      setMediaView: (asset: AssetType) => ReturnType;
    };
  }
}

export const MediaViewExtension = Node.create<MediaViewOptions>({
  name: "mediaView",
  group: "block",
  atom: true,
  draggable: true,

  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },

  addAttributes() {
    return {
      asset: {
        default: null as AssetType | null,
      },
      display: {
        default: {
          width: "100%",
          height: null,
          align: "center" as "left" | "center" | "right",
          aspectRatio: null as number | null,
        }
      }
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="media-view"]',
        getAttrs: (node) => {
          if (typeof node === "string") return {};

          const element = node as HTMLElement;

          try {
            const assetRaw = element.getAttribute("data-asset");
            const displayRaw = element.getAttribute("data-display");

            let asset: AssetType | null = null;
            let display = {
              width: element.getAttribute("data-width") || "100%",
              height: element.getAttribute("data-height"),
              align:
                (element.getAttribute("data-align") as
                  | "left"
                  | "center"
                  | "right") || "center",
              aspectRatio:
                parseFloat(element.getAttribute("data-aspect-ratio") || "0") ||
                null,
            };

            if (assetRaw && assetRaw !== "null") {
              try {
                asset = JSON.parse(assetRaw);
              } catch (err) {
                console.warn("Invalid asset JSON:", assetRaw, err);
              }
            }

            if (displayRaw && displayRaw !== "null") {
              try {
                const parsedDisplay = JSON.parse(displayRaw);
                display = { ...display, ...parsedDisplay };
              } catch (err) {
                console.warn("Invalid display JSON:", displayRaw, err);
              }
            }

            return { asset, display };
          } catch (err) {
            console.error("Failed to parse media-view attributes:", err);
            return {};
          }
        },
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    const { asset, display } = HTMLAttributes;

    const safeAsset =
      asset && typeof asset === "object" ? JSON.stringify(asset) : "null";
    const safeDisplay =
      display && typeof display === "object" ? JSON.stringify(display) : "null";

    return [
      "div",
      mergeAttributes(this.options.HTMLAttributes, {
        "data-type": "media-view",
        "data-asset": safeAsset,
        "data-display": safeDisplay,
        "data-width": display?.width || "100%",
        "data-height": display?.height ?? "",
        "data-align": display?.align || "center",
        "data-aspect-ratio": display?.aspectRatio ?? "",
      }),
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(MediaViewComponent);
  },

  addCommands() {
    return {
      setMediaView:
        (asset: AssetType) =>
          ({ commands }) => {
            return commands.insertContent({
              type: "mediaView",
              attrs: {
                asset: asset,
                display: {
                  width: "100%",
                  height: null,
                  align: "center" as "left" | "center" | "right",
                  aspectRatio: null as number | null,
                }
              },
            });
          },
    };
  },
});
