"use client";

import React from "react";

type ThemeAsset = {
  assetType: "stylesheet" | "font" | "script" | "image";
  url?: string;
  content?: string;
  preload?: boolean;
  async?: boolean;
  defer?: boolean;
  media?: string;
  crossorigin?: string;
  integrity?: string;
  rel?: string;
  sizes?: string;
  mimeType?: string;
};

export function ThemeHeadLinks({ assets }: { assets?: ThemeAsset[] | null }) {
  if (!assets?.length) return null;

  return (
    <>
      {assets.map((a, i) => {
        if (a.assetType === "stylesheet") {
          if (a.content?.trim() && !a.url) {
            return (
              <style
                key={`inline-style-${i}`}
                dangerouslySetInnerHTML={{ __html: a.content }}
              />
            );
          }
          if (a.url) {
            return (
              <link
                key={`style-${i}`}
                rel={a.rel || "stylesheet"}
                href={a.url}
                media={a.media}
                crossOrigin={a.crossorigin as any}
                integrity={a.integrity}
              />
            );
          }
        }

        if (a.assetType === "script") {
          if (a.content?.trim() && !a.url) {
            return (
              <script
                key={`inline-script-${i}`}
                dangerouslySetInnerHTML={{ __html: a.content }}
              />
            );
          }
          if (a.url) {
            return (
              <script
                key={`script-${i}`}
                src={a.url}
                async={a.async}
                defer={a.defer}
                crossOrigin={a.crossorigin as any}
                integrity={a.integrity}
              />
            );
          }
        }
        return null;
      })}
    </>
  );
}
