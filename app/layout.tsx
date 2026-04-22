import type { Metadata } from "next";
import { Cormorant_Garamond, Manrope } from "next/font/google";
import Link from "next/link";
import type { ReactNode } from "react";
import { SiteNav } from "@/components/site-nav";
import { navigationItems, siteMeta } from "@/content/site-content";
import "./globals.css";

const displayFont = Cormorant_Garamond({
  variable: "--font-display",
  subsets: ["latin"],
  display: "swap",
});

const bodyFont = Manrope({
  variable: "--font-body",
  subsets: ["latin"],
  display: "swap",
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
      <body className="min-h-dvh bg-paper text-ink leading-relaxed">
        <div className="mx-auto w-full max-w-5xl px-4 py-6 pb-16">
          <header className="flex flex-col gap-4 border-b border-rule pb-8 lg:flex-row lg:items-start lg:justify-between lg:gap-6">
            <div className="flex flex-col gap-1.5 max-w-md">
              <p className="label text-ink-muted">
                {siteMeta.role} / {siteMeta.location}
              </p>
              <Link
                href="/"
                className="font-heading text-4xl lg:text-5xl leading-none font-semibold"
              >
                {siteMeta.name}
              </Link>
            </div>
            <SiteNav items={navigationItems} />
          </header>

          <main className="pt-8">{children}</main>
        </div>
      </body>
    </html>
  );
}
