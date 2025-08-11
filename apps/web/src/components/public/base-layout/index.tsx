import Head from "next/head";
import { ReactNode } from "react";
// import Template from "./template";
import type { Media, Typeface, WidgetInstance } from "@workspace/common-models";
import { Theme } from "@workspace/page-models";
import { useSession } from "next-auth/react";

interface BaseLayoutProps {
  title: string;
  siteInfo: any;
  layout: WidgetInstance[];
  pageData?: Record<string, unknown>;
  children?: ReactNode;
  childrenOnTop?: boolean;
  typefaces: Typeface[];
  description?: string;
  socialImage?: Media;
  robotsAllowed?: boolean;
  theme: Theme;
}

export const BaseLayout = ({
  title,
  siteInfo,
  children,
  layout,
  typefaces,
  pageData = {},
  childrenOnTop = false,
  description,
  socialImage,
  robotsAllowed = true,
  theme,
}: BaseLayoutProps) => {
  const { status } = useSession();
  // state.theme = theme;

  // useEffect(() => {
  //     if (status === "authenticated") {
  //         dispatch(actionCreators.signedIn());
  //         dispatch(actionCreators.authChecked());
  //     }
  //     if (status === "unauthenticated") {
  //         dispatch(actionCreators.authChecked());
  //     }
  // }, [status]);

  const siteTitle = title || siteInfo.title;
  const siteDescription = description || siteInfo.subtitle;
  const siteImage = socialImage || siteInfo.logo;

  return (
    <>
      <Head>
        <title>{siteTitle}</title>
        <meta property="og:title" content={siteTitle} />
        <meta name="twitter:title" content={siteTitle} />
        <link
          rel="icon"
          type="image/x-icon"
          href={
            siteInfo.logo && siteInfo.logo.file
              ? siteInfo.logo.file
              : "/favicon.ico"
          }
        />
        <meta
          name="viewport"
          content="initial-scale=1, width=device-width, shrink-to-fit=no"
        />
        {siteDescription && (
          <>
            <meta name="description" content={siteDescription} />
            <meta property="og:description" content={siteDescription} />
            <meta name="twitter:description" content={siteDescription} />
          </>
        )}
        {!robotsAllowed && <meta name="robots" content="noindex" />}
        {siteImage && (
          <>
            <meta property="og:image" content={siteImage.file} />
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:image" content={siteImage.file} />
            {siteImage.caption && (
              <>
                <meta property="og:image:alt" content={siteImage.caption} />
                <meta name="twitter:image:alt" content={siteImage.caption} />
              </>
            )}
          </>
        )}
      </Head>
      {/* <Template
                layout={layout}
                childrenOnTop={childrenOnTop}
                pageData={pageData}
                state={state}
                dispatch={dispatch}
            > */}
      {children}
      {/* </Template> */}
    </>
  );
};

export default BaseLayout;
