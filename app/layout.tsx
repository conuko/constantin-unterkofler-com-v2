import type { Metadata } from "next";
import { Cormorant_Garamond, IBM_Plex_Mono } from "next/font/google";
import Link from "next/link";
import type { ReactNode } from "react";
import { SiteNav } from "@/components/site-nav";
import { ThemeProvider } from "@/components/theme-provider";
import { ThemeToggle } from "@/components/theme-toggle";
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
    <html
      lang="en"
      suppressHydrationWarning
      className={`${displayFont.variable} ${bodyFont.variable}`}
    >
      <body className="min-h-dvh bg-paper text-ink leading-relaxed">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <a href="#main-content" className="skip-link">
            Skip to main content
          </a>

          <div className="w-full p-6">
            <header className="flex items-start justify-between gap-6 pb-8 sticky top-4 z-10">
              <Link
                href="/"
                className="flex size-10 items-center justify-center text-xs tracking-wide"
              >
                <span className="underline-reveal">{siteMeta.shortName}</span>
              </Link>
              <div className="flex flex-col items-end">
                <ThemeToggle />
                <SiteNav
                  items={headerNavItems}
                  ariaLabel="Primary"
                  className="flex flex-col items-end"
                />
              </div>
            </header>

            <main
              id="main-content"
              tabIndex={-1}
              className="outline-none max-w-3xl mx-auto w-full"
            >
              {children}
            </main>
            <footer className="fixed inset-x-0 bottom-8 flex items-end justify-between px-6">
              <p className="text-xs text-ink-muted">© 2026</p>
              <SiteNav
                items={footerNavItems}
                ariaLabel="Secondary"
                className="flex gap-2 [writing-mode:vertical-rl] lg:flex-col lg:[writing-mode:horizontal-tb] lg:gap-0"
              />
            </footer>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
