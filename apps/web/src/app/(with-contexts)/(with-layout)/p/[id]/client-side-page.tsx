"use client";

import { useAddress } from "@/components/contexts/address-context";
import { useProfile } from "@/components/contexts/profile-context";
import { useServerConfig } from "@/components/contexts/server-config-context";
import { useTypefaces } from "@/components/contexts/typefaces-context";
// import { BaseLayout } from "@/components/public/base-layout";

export default function ClientSidePage({
  page,
  siteinfo,
  theme,
}: {
  page: any;
  siteinfo: any;
  theme: any;
}) {
  const { typefaces } = useTypefaces();
  const { config } = useServerConfig();
  const { profile } = useProfile();
  const { address } = useAddress();

  if (!page) {
    return null;
  }

  const layoutWithoutHeaderFooter = page?.layout
    ?.filter((layout: any) => !["header", "footer"].includes(layout.name))
    ?.map((layout: any) => ({
      ...layout,
      settings: layout.settings || {},
    }));

  // TODO: Fix BaseLayout import and uncomment this section
  /*
    return (
        <BaseLayout
            layout={layoutWithoutHeaderFooter}
            title={page.title || page.pageData?.title}
            pageData={page.pageData}
            typefaces={typefaces}
            siteInfo={siteinfo}
            dispatch={() => {}}
            theme={theme}
            state={{
                config: config,
                siteinfo,
                address,
                profile: profile as Profile,
                auth: profile?.email
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
                typefaces,
                message: {
                    message: "",
                    open: false,
                    action: null,
                },
            }}
        />
    );
    */

  return (
    <div>
      <h1>{page.title || page.pageData?.title}</h1>
      <div>Page content would go here - BaseLayout needs to be implemented</div>
      <pre>
        {JSON.stringify(
          {
            hasProfile: !!profile,
            hasConfig: !!config,
            hasAddress: !!address,
            hasTypefaces: !!typefaces,
            themeName: theme?.name || "no theme",
          },
          null,
          2
        )}
      </pre>
    </div>
  );
}
