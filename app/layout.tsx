import type { Metadata } from "next";
import { Cormorant_Garamond, IBM_Plex_Mono } from "next/font/google";
import type { ReactNode } from "react";
import { SiteNav } from "@/components/site-nav";
import {
  footerNavItems,
  headerNavItems,
  siteMeta,
} from "@/content/site-content";
import "./globals.css";

const displayFont = Cormorant_Garamond({
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
    <html lang="en" className={`${displayFont.variable} ${bodyFont.variable}`}>
      <body
        className="min-h-dvh bg-paper text-ink leading-relaxed"
        suppressHydrationWarning
      >
        <div className="mx-auto w-full max-w-5xl px-4 py-6 pb-16">
          <header className="flex flex-col gap-4 pb-8 lg:flex-row lg:items-start lg:justify-between lg:gap-6">
            <SiteNav
              items={headerNavItems}
              ariaLabel="Primary"
              className="flex flex-wrap gap-2 gap-x-3.5 pt-0.5 lg:max-w-sm lg:justify-end"
            />
          </header>

          <main className="lg:pt-8">{children}</main>

          <footer className="fixed inset-x-0 bottom-8 mx-auto flex max-w-5xl items-end justify-between px-4">
            <p className="text-xs text-ink-muted">© 2026</p>
            <SiteNav
              items={footerNavItems}
              ariaLabel="Secondary"
              className="flex gap-2 gap-x-3.5 [writing-mode:vertical-rl] lg:[writing-mode:horizontal-tb]"
            />
          </footer>
        </div>
      </body>
    </html>
  );
}
