import type { Metadata } from "next";
import { Bebas_Neue, Space_Grotesk } from "next/font/google";
import type { ReactNode } from "react";
import { MotionLayout } from "@/components/motion-layout";
import { SiteHeader } from "@/components/site-header";
import { portfolioContent } from "@/content/site-content";
import "./globals.css";

const displayFont = Bebas_Neue({
  weight: ["400"],
  variable: "--font-display",
  subsets: ["latin"],
  display: "swap",
});

const bodyFont = Space_Grotesk({
  variable: "--font-body",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: portfolioContent.identity.name,
    template: `%s | ${portfolioContent.identity.name}`,
  },
  description: portfolioContent.identity.description,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${displayFont.variable} ${bodyFont.variable}`}
    >
      <body className="flex min-h-dvh flex-col bg-paper text-ink leading-relaxed">
        <MotionLayout
          header={
            <SiteHeader
              identity={portfolioContent.identity}
              primaryWayfinding={portfolioContent.primaryWayfinding}
            />
          }
        >
          {children}
        </MotionLayout>
      </body>
    </html>
  );
}
