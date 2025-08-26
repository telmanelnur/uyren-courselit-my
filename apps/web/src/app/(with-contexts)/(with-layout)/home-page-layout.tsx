"use client";

import { PropsWithChildren } from "react";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { ThemeProvider } from "@/components/layout/theme-provider";

export default function HomepageLayout({ children }: PropsWithChildren) {
  return (
    <ThemeProvider>
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </div>
    </ThemeProvider>
  );
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
