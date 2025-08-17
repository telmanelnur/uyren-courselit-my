import * as fonts from "@/lib/fonts";
import { SITE_SETTINGS_DEFAULT_TITLE } from "@/lib/ui/config/strings";
import { getSiteInfo as getServerSiteInfo } from "@/server/lib/site-info";
import { TRPCReactProvider } from "@/server/provider";
import { TRPCError } from "@trpc/server";
// import "@workspace/components-library/styles.css";
// import "@workspace/page-blocks/styles.css";
// import "@workspace/page-primitives/styles.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import NotFound from "./not-found";
// import "remirror/styles/all.css";
import "@/styles/globals.css";

const inter = Inter({ subsets: ["latin"] });

export async function generateMetadata(): Promise<Metadata> {
  const siteInfo = await getServerSiteInfo();

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
  let hasError = false;
  try {
    await getServerSiteInfo();
  } catch (error) {
    if (error instanceof TRPCError) {
      hasError = true;
    }
  }


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
