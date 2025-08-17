import React from "react";
import { Image, Link } from "@workspace/components-library";
import { SiteInfo } from "@workspace/common-models";

interface BrandingProps {
    siteInfo: SiteInfo;
}

const Branding = ({ siteInfo }: BrandingProps) => {
    return (
        <Link href="/">
            <div className="flex items-center">
                <div className="mr-2">
                    <Image
                        borderRadius={1}
                        src={siteInfo.logo?.file || ""}
                        width="w-[36px]"
                        height="h-[36px]"
                        alt="logo"
                    />
                </div>
                <p className="text-2xl font-bold">{siteInfo.title}</p>
            </div>
        </Link>
    );
};

export default Branding;