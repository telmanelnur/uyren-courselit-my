import { WidgetMetadata, Constants } from "@workspace/common-models";
const { PageType } = Constants;

const metadata: WidgetMetadata = {
    name: "grid",
    displayName: "Grid",
    compatibleWith: [PageType.PRODUCT, PageType.SITE, PageType.COMMUNITY],
};

export default metadata;
