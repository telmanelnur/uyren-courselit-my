import { getPublishedThemeAssetsByCourseId } from "@/server/api/routers/lms/theme/get-theme-assets";

export default async function Head({ params }: { params: Promise<{ courseId: string }> }) {
  const { courseId } = await params;
  const assets = await getPublishedThemeAssetsByCourseId(courseId);

  return (
    <>
      {assets.map((a: any, i: number) => {
        if (a.assetType === "stylesheet") {
          return a.content ? (
            <style key={`style-${i}`} dangerouslySetInnerHTML={{ __html: a.content }} />
          ) : a.url ? (
            <link
              key={`link-${i}`}
              rel={a.rel || "stylesheet"}
              href={a.url}
              media={a.media}
              crossOrigin={a.crossorigin as any}
              integrity={a.integrity}
            />
          ) : null;
        }

        if (a.assetType === "font") {
          return (
            <Fragment key={`font-${i}`}>
              {a.preload && a.url && (
                <link
                  rel="preload"
                  as="font"
                  href={a.url}
                  crossOrigin={a.crossorigin || "anonymous"}
                  type={a.mimeType}
                />
              )}
              {a.url && (
                <link
                  rel={a.rel || "stylesheet"}
                  href={a.url}
                  crossOrigin={a.crossorigin as any}
                />
              )}
            </Fragment>
          );
        }

        if (a.assetType === "script") {
          return a.content ? (
            <script key={`script-inline-${i}`} dangerouslySetInnerHTML={{ __html: a.content }} />
          ) : a.url ? (
            <script
              key={`script-${i}`}
              src={a.url}
              async={a.async}
              defer={a.defer}
              crossOrigin={a.crossorigin as any}
              integrity={a.integrity}
            />
          ) : null;
        }

        return null;
      })}
    </>
  );
}

import { Fragment } from "react";
