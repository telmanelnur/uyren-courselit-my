import { Media, WidgetDefaultSettings } from "@workspace/common-models";
import { AspectRatio, ImageObjectFit } from "@workspace/components-library";
export default interface Settings extends WidgetDefaultSettings {
    media?: Media;
    youtubeLink?: string;
    mediaRadius?: number;
    cssId?: string;
    playVideoInModal?: boolean;
    aspectRatio?: AspectRatio;
    objectFit?: ImageObjectFit;
}
