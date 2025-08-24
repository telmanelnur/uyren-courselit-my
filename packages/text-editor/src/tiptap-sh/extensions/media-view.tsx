"use client";

import { Node, mergeAttributes } from "@tiptap/core";
import { ReactNodeViewRenderer } from "@tiptap/react";
import { MediaViewComponent } from "../components/media-view-component";

export interface MediaViewOptions {
  HTMLAttributes: Record<string, any>;
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    mediaView: {
      setMediaView: (options: any) => ReturnType;
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
      attrs: {
        default: {
          src: null,
          alt: null,
          title: null,
          width: "100%",
          height: null,
          align: "center",
          controls: true,
          autoplay: false,
          loop: false,
          muted: false,
          poster: null,
        }
      },
      obj: {
        default: null,
      }
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="media-view"]',
        getAttrs: (node) => {
          if (typeof node === "string") return {};
          return {
            attrs: {
              src: node.getAttribute("data-src"),
              alt: node.getAttribute("data-alt"),
              title: node.getAttribute("data-title"),
              width: node.getAttribute("data-width"),
              height: node.getAttribute("data-height"),
              align: node.getAttribute("data-align"),
              controls: node.getAttribute("data-controls") === "true",
              autoplay: node.getAttribute("data-autoplay") === "true",
              loop: node.getAttribute("data-loop") === "true",
              muted: node.getAttribute("data-muted") === "true",
              poster: node.getAttribute("data-poster"),
            },
            obj: {
              type: node.getAttribute("data-media-type"),
              caption: node.getAttribute("data-caption"),
              aspectRatio: node.getAttribute("data-aspect-ratio"),
              assetId: node.getAttribute("data-asset-id"),
              originalFileName: node.getAttribute("data-original-filename"),
              mimeType: node.getAttribute("data-mime-type"),
              fileSize: node.getAttribute("data-file-size"),
              uploadDate: node.getAttribute("data-upload-date"),
              embedCode: node.getAttribute("data-embed-code"),
              embedType: node.getAttribute("data-embed-type"),
            }
          };
        },
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    const { attrs, obj } = HTMLAttributes;
    
    return [
      "div",
      mergeAttributes(HTMLAttributes, {
        "data-type": "media-view",
        "data-src": attrs?.src,
        "data-alt": attrs?.alt,
        "data-title": attrs?.title,
        "data-width": attrs?.width,
        "data-height": attrs?.height,
        "data-align": attrs?.align,
        "data-controls": attrs?.controls,
        "data-autoplay": attrs?.autoplay,
        "data-loop": attrs?.loop,
        "data-muted": attrs?.muted,
        "data-poster": attrs?.poster,
        "data-media-type": obj?.type,
        "data-caption": obj?.caption,
        "data-aspect-ratio": obj?.aspectRatio,
        "data-asset-id": obj?.assetId,
        "data-original-filename": obj?.originalFileName,
        "data-mime-type": obj?.mimeType,
        "data-file-size": obj?.fileSize,
        "data-upload-date": obj?.uploadDate,
        "data-embed-code": obj?.embedCode,
        "data-embed-type": obj?.embedType,
      }),
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(MediaViewComponent);
  },

  addCommands() {
    return {
      setMediaView:
        (options) =>
        ({ commands }) => {
          // Transform the options to match the new structure
          const transformedOptions = {
            attrs: {
              src: options.src,
              alt: options.alt,
              title: options.title,
              width: options.width || "100%",
              height: options.height,
              align: options.align || "center",
              controls: options.controls !== undefined ? options.controls : true,
              autoplay: options.autoplay || false,
              loop: options.loop || false,
              muted: options.muted || false,
              poster: options.poster,
            },
            obj: {
              type: options.type || "image",
              caption: options.caption || "",
              aspectRatio: options.aspectRatio,
              assetId: options.assetId,
              originalFileName: options.originalFileName,
              mimeType: options.mimeType,
              fileSize: options.fileSize,
              uploadDate: options.uploadDate,
              embedCode: options.embedCode,
              embedType: options.embedType,
            }
          };

          return commands.insertContent({
            type: this.name,
            attrs: transformedOptions,
          });
        },
    };
  },
});
