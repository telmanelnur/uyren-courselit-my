import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "@workspace/ui/styles/globals.css";
import { SiteInfoProvider } from "../components/SiteInfoProvider";
import { ThemeProvider } from "../components/ThemeProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Uyren.AI - Design Template",
  description: "Create a future with real skills - Design Template for CourseLit",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <SiteInfoProvider>
          <ThemeProvider>
            {children}
          </ThemeProvider>
        </SiteInfoProvider>
      </body>
    </html>
  );
}
