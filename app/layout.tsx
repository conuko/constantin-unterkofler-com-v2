import type { Metadata } from "next";
import { Cormorant_Garamond, IBM_Plex_Mono } from "next/font/google";
import Link from "next/link";
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
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>

        <div className="mx-auto w-full max-w-5xl px-4 py-6 pb-16">
          <header className="flex items-start justify-between gap-6 pb-8">
            <Link href="/" className="text-xs tracking-wide underline-reveal">
              {siteMeta.shortName}
            </Link>
            <SiteNav
              items={headerNavItems}
              ariaLabel="Primary"
              className="flex flex-col items-end"
            />
          </header>

          <main id="main-content" tabIndex={-1} className="lg:pt-8 outline-none">
            {children}
          </main>
        </div>

        <footer className="fixed inset-x-0 bottom-8 mx-auto flex max-w-5xl items-end justify-between px-4">
          <p className="text-xs text-ink-muted">© 2026</p>
          <SiteNav
            items={footerNavItems}
            ariaLabel="Secondary"
            className="flex gap-2 [writing-mode:vertical-rl] lg:flex-col lg:[writing-mode:horizontal-tb] lg:gap-0"
          />
        </footer>
      </body>
    </html>
  );
}
