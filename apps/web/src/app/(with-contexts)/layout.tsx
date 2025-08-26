import { AddressProvider } from "@/components/contexts/address-context";
import { defaultState } from "@/components/contexts/default-state";
import { ProfileProvider } from "@/components/contexts/profile-context";
import { ServerConfigProvider } from "@/components/contexts/server-config-context";
import { SiteInfoProvider } from "@/components/contexts/site-info-context";
import { ThemeProvider } from "@/components/contexts/theme-context";
import { ThemeProvider as NextThemesProvider } from "@/components/next-theme-provider";
import SessionWrapper from "@/components/providers/session-wrapper";
import { authOptions } from "@/lib/auth/options";
import { getAddressFromHeaders } from "@/lib/ui/lib/utils";
import { getSiteInfo as getServerSiteInfo } from "@/server/lib/site-info";
import { SiteInfo } from "@workspace/common-models";
import { Provider as NiceModalProvider } from "@workspace/components-library";
import { getServerSession } from "next-auth";
import { headers } from "next/headers";
import React from "react";
import { Toaster } from "sonner";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  const address = await getAddressFromHeaders(headers);
  const siteInfo = await getServerSiteInfo();
  return (
    <SessionWrapper session={session}>
      <AddressProvider
        initialAddress={{
          frontend: address,
          backend: address,
        }}
      >
        <SiteInfoProvider initialSiteInfo={formatInitialSiteInfo(siteInfo)}>
          <ThemeProvider>
            <ServerConfigProvider initialConfig={defaultState.config}>
              <NextThemesProvider
                attribute="class"
                defaultTheme="system"
                enableSystem
                disableTransitionOnChange
              >
                <ProfileProvider>
                  <NiceModalProvider>{children}</NiceModalProvider>
                </ProfileProvider>
              </NextThemesProvider>
            </ServerConfigProvider>
          </ThemeProvider>
        </SiteInfoProvider>
        <Toaster />
      </AddressProvider>
    </SessionWrapper>
  );
}

const formatInitialSiteInfo = (siteInfo?: SiteInfo) => {
  return {
    title: siteInfo?.title || defaultState.siteinfo.title,
    subtitle: siteInfo?.subtitle || defaultState.siteinfo.subtitle,
  };
};

// const formatSiteInfo = (siteinfo?: SiteInfo) => ({
//   title: siteinfo?.title || defaultState.siteinfo.title,
//   subtitle: siteinfo?.subtitle || defaultState.siteinfo.subtitle,
//   logo: siteinfo?.logo || defaultState.siteinfo.logo,
//   currencyISOCode:
//     siteinfo?.currencyISOCode || defaultState.siteinfo.currencyISOCode,
//   paymentMethod: siteinfo?.paymentMethod || defaultState.siteinfo.paymentMethod,
//   stripeKey: siteinfo?.stripeKey || defaultState.siteinfo.stripeKey,
//   // codeInjectionHead: siteinfo?.codeInjectionHead
//   //   ? decode(siteinfo.codeInjectionHead)
//   //   : defaultState.siteinfo.codeInjectionHead,
//   // codeInjectionBody: siteinfo?.codeInjectionBody
//   //   ? decode(siteinfo.codeInjectionBody)
//   //   : defaultState.siteinfo.codeInjectionBody,
//   mailingAddress:
//     siteinfo?.mailingAddress || defaultState.siteinfo.mailingAddress,
//   hideCourseLitBranding:
//     siteinfo?.hideCourseLitBranding ||
//     defaultState.siteinfo.hideCourseLitBranding,
//   razorpayKey: siteinfo?.razorpayKey || defaultState.siteinfo.razorpayKey,
//   lemonsqueezyKey:
//     siteinfo?.lemonsqueezyKey || defaultState.siteinfo.lemonsqueezyKey,
// });
