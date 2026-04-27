import type { Metadata } from "next";
import {
  Cormorant_Garamond,
  IBM_Plex_Mono,
  Bebas_Neue,
} from "next/font/google";
import type { ReactNode } from "react";
import { MotionLayout } from "@/components/motion-layout";
import { headerNavItems, siteMeta } from "@/content/site-content";
import "./globals.css";

const displayFont = Bebas_Neue({
  weight: ["400"],
  variable: "--font-display",
  subsets: ["latin"],
  display: "swap",
});

const bodyFont = IBM_Plex_Mono({
  variable: "--font-body",
  subsets: ["latin"],
  display: "swap",
  weight: ["100", "200", "300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: {
    default: siteMeta.name,
    template: `%s | ${siteMeta.name}`,
  },
  description: siteMeta.description,
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
      <body className="min-h-dvh bg-paper text-ink leading-relaxed">
        <MotionLayout shortName={siteMeta.shortName} navItems={headerNavItems}>
          {children}
        </MotionLayout>
      </body>
    </html>
  );
}
