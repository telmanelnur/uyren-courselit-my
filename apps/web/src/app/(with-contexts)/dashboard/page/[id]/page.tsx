"use client";

import PageEditor from "@/components/admin/page-editor";
import { Profile } from "@workspace/common-models";
import { useSearchParams } from "next/navigation";
import { useContext } from "react";

export default function Page({ params }: { params: { id: string } }) {
    const { id } = params;
    const searchParams = useSearchParams();
    const redirectTo = searchParams?.get("redirectTo");
    const { address } = useAddress();
    const siteInfo = useContext(SiteInfoContext);
    const typefaces = useContext(TypefacesContext);
    const { profile } = useContext(ProfileContext);
    const config = useContext(ServerConfigContext);
    const { theme } = useTheme();

    return (
        <PageEditor
            id={id as string}
            address={address}
            siteInfo={siteInfo}
            typefaces={typefaces}
            profile={profile as Profile}
            redirectTo={
                redirectTo
                    ? typeof redirectTo === "string"
                        ? redirectTo
                        : redirectTo[0]
                    : ""
            }
            state={{
                config: config,
                siteinfo: siteInfo,
                address: address,
                profile: profile as Profile,
                auth: profile.email
                    ? {
                          guest: false,
                          checked: true,
                      }
                    : {
                          guest: true,
                          checked: true,
                      },
                networkAction: false,
                theme,
                typefaces: [
                    {
                        section: "default",
                        typeface: "",
                        fontWeights: [100],
                        fontSize: 0,
                        lineHeight: 0,
                        letterSpacing: 0,
                        case: "captilize",
                    },
                ],
                message: {
                    message: "",
                    open: false,
                    action: null,
                },
            }}
            dispatch={() => {}}
        />
    );
}
