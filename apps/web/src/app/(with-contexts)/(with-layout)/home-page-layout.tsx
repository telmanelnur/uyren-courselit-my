"use client";

import { PropsWithChildren } from "react";
// import { BaseLayout } from "@components/public/base-layout";
// import { CodeInjector } from "@components/public/code-injector";

export default function HomepageLayout({ children }: PropsWithChildren) {
  //   const { address } = useAddress();
  //   const { siteInfo: siteinfo } = useSiteInfo();
  //   const { typefaces } = useTypefaces();
  //   const { config } = useServerConfig();
  //   const { profile } = useProfile();
  //   const { theme } = useTheme();
  return children;
  //   return {
  //     /*
  //             <BaseLayout
  //                 layout={siteInfo!.page.layout}
  //                 title={siteInfo!.page.title || ""}
  //                 typefaces={typefaces}
  //                 siteInfo={siteinfo}
  //                 dispatch={() => {}}
  //                 theme={theme}
  //                 state={{
  //                     config: config,
  //                     siteinfo,
  //                     address: address,
  //                     profile: profile as Profile,
  //                     auth: profile?.email
  //                         ? {
  //                               guest: false,
  //                               checked: true,
  //                           }
  //                         : {
  //                               guest: true,
  //                               checked: true,
  //                           },
  //                     networkAction: false,
  //                     theme,
  //                     typefaces,
  //                     message: {
  //                         message: "",
  //                         open: false,
  //                         action: null,
  //                     },
  //                 }}
  //             >
  //                 {children}
  //                 <CodeInjector
  //                     head={siteinfo?.codeInjectionHead}
  //                     body={siteinfo?.codeInjectionBody}
  //                 />
  //             </BaseLayout>
  //             */
  //   };
}
