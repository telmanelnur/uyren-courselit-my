import React from "react";
import { WidgetProps } from "@workspace/common-models";
import Settings from "./settings";
import { Image, VideoWithPreview } from "@workspace/components-library";
import { isVideo } from "@workspace/utils";
import { Section } from "@workspace/page-primitives";
import { ThemeStyle } from "@workspace/page-models";
import clsx from "clsx";

const twRoundedMap = {
    "0": "rounded-none",
    "1": "rounded-sm",
    "2": "rounded",
    "3": "rounded-md",
    "4": "rounded-lg",
    "5": "rounded-xl",
    "6": "rounded-2xl",
    "7": "rounded-3xl",
    "8": "rounded-full",
};

export default function Widget({
    settings: {
        media,
        youtubeLink,
        mediaRadius = 0,
        cssId,
        playVideoInModal,
        aspectRatio,
        objectFit,
        maxWidth,
        verticalPadding,
    },
    state: { theme },
}: WidgetProps<Settings>) {
    const overiddenTheme: ThemeStyle = JSON.parse(JSON.stringify(theme.theme));
    overiddenTheme.structure.page.width =
        maxWidth || theme.theme.structure.page.width;
    overiddenTheme.structure.section.padding.y =
        verticalPadding || theme.theme.structure.section.padding.y;

    const hasHeroGraphic = youtubeLink || (media && media.mediaId);

    return (
        <Section theme={overiddenTheme} id={cssId}>
            <div className={`flex flex-col gap-4`}>
                {hasHeroGraphic && (
                    <div>
                        <div
                            className={clsx(
                                "w-full text-center overflow-hidden border",
                                twRoundedMap[mediaRadius],
                            )}
                            style={{
                                width: "100%",
                            }}
                        >
                            {isVideo(youtubeLink, media) ? (
                                <VideoWithPreview
                                    videoUrl={youtubeLink || media?.file || ""}
                                    aspectRatio={aspectRatio}
                                    title={media?.caption || ""}
                                    thumbnailUrl={media?.thumbnail || ""}
                                    modal={playVideoInModal}
                                />
                            ) : (
                                <Image
                                    src={media?.file || ""}
                                    alt={media?.caption || ""}
                                    borderRadius={mediaRadius}
                                    objectFit={objectFit}
                                />
                            )}
                        </div>
                    </div>
                )}
                {!hasHeroGraphic && (
                    <div
                        className={clsx(
                            "w-full text-center overflow-hidden border",
                            twRoundedMap[mediaRadius],
                        )}
                        style={{
                            width: "100%",
                        }}
                    >
                        <Image src="" borderRadius={0} />
                    </div>
                )}
            </div>
        </Section>
    );
}
