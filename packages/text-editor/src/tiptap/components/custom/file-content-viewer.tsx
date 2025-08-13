import { Media } from "@workspace/common-models";

const PdfViewer = (props: {media: Media}) => {
    return <div>PdfViewer</div>;
};

const TextViewer = (props: {media: Media}) => {
    return <div>TextViewer</div>;
};

const UnknownViewer = (props: {media: Media}) => {
    return <div>UnknownViewer</div>;
};

const FileContentViewer = (media: Media) => {
    switch (media.mimeType) {
        case "application/pdf":
            return <PdfViewer media={media} />;
        case "text/plain":
            return <TextViewer media={media} />;
        default:
            return <UnknownViewer media={media} />;
    }
};

export default FileContentViewer;
