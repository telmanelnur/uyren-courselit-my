import * as fonts from "@/lib/fonts";
import { SITE_SETTINGS_DEFAULT_TITLE } from "@/lib/ui/config/strings";
import { getAddressFromHeaders, getSiteInfo } from "@/lib/ui/lib/utils";
import { TRPCReactProvider } from "@/server/provider";
import { TRPCError } from "@trpc/server";
// import "@workspace/components-library/styles.css";
// import "@workspace/page-blocks/styles.css";
// import "@workspace/page-primitives/styles.css";
import "@workspace/ui/styles/globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { headers } from "next/headers";
import NotFound from "./not-found";
// import "remirror/styles/all.css";
// import "../styles/globals.css";

const inter = Inter({ subsets: ["latin"] });

export async function generateMetadata(): Promise<Metadata> {
  const address = await getAddressFromHeaders(headers);
  const siteInfo = await getSiteInfo(address);

  return {
    title: `${siteInfo?.title || SITE_SETTINGS_DEFAULT_TITLE}`,
    description: siteInfo?.subtitle || "",
    openGraph: {
      title: `${siteInfo?.title || SITE_SETTINGS_DEFAULT_TITLE}`,
      description: siteInfo?.subtitle || "",
      images: [
        {
          url: siteInfo?.logo?.file as any,
          alt: siteInfo?.logo?.caption || "",
        },
      ],
    },
    twitter: {
      title: `${siteInfo?.title || SITE_SETTINGS_DEFAULT_TITLE}`,
      description: siteInfo?.subtitle || "",
      images: [
        {
          url: siteInfo?.logo?.file as any,
          alt: siteInfo?.logo?.caption || "",
        },
      ],
    },
    generator: "CourseLit",
    applicationName: "CourseLit",
  };
}

interface RootLayoutProps {
  children: React.ReactNode;
}

export default async function RootLayout({ children }: RootLayoutProps) {
  let siteSetup;
  let hasError = false;
  const address = await getAddressFromHeaders(headers);
  try {
    const siteInfo = await getSiteInfo(address);
    // siteSetup = await trpcCaller.siteModule.siteInfo.publicGetFullSiteSetup({});
  } catch (error) {
    console.log("Errors", error);
    if (error instanceof TRPCError) {
      hasError = true;
    }
  }
  // const themeStyles = siteSetup?.theme
  //   ? generateThemeStyles((siteSetup as any).theme)
  //   : "";

  if (hasError) {
    return (
      <html lang="en">
        <body
          className={`${fonts.openSans.variable} ${fonts.montserrat.variable} ${fonts.lato.variable} ${fonts.poppins.variable} ${fonts.sourceSans3.variable} ${fonts.raleway.variable} ${fonts.notoSans.variable} ${fonts.merriweather.variable} ${fonts.inter.variable} ${fonts.alegreya.variable} ${fonts.roboto.variable} ${fonts.mulish.variable} ${fonts.nunito.variable} ${fonts.rubik.variable} ${fonts.playfairDisplay.variable} ${fonts.oswald.variable} ${fonts.ptSans.variable} ${fonts.workSans.variable} ${fonts.robotoSlab.variable} ${fonts.sourceSerif4.variable} ${fonts.bebasNeue.variable} ${fonts.quicksand.variable} font-sans ${inter.className}`}
        >
          <NotFound />
        </body>
      </html>
    );
  }

  return (
    <html lang="en" suppressHydrationWarning>
      <head>{/* <style>{themeStyles}</style> */}</head>
      <body
        className={`${fonts.openSans.variable} ${fonts.montserrat.variable} ${fonts.lato.variable} ${fonts.poppins.variable} ${fonts.sourceSans3.variable} ${fonts.raleway.variable} ${fonts.notoSans.variable} ${fonts.merriweather.variable} ${fonts.inter.variable} ${fonts.alegreya.variable} ${fonts.roboto.variable} ${fonts.mulish.variable} ${fonts.nunito.variable} ${fonts.rubik.variable} ${fonts.playfairDisplay.variable} ${fonts.oswald.variable} ${fonts.ptSans.variable} ${fonts.workSans.variable} ${fonts.robotoSlab.variable} ${fonts.sourceSerif4.variable} ${fonts.bebasNeue.variable} ${fonts.quicksand.variable} font-sans ${inter.className}`}
      >
        <TRPCReactProvider>{children}</TRPCReactProvider>
      </body>
    </html>
  );
}
