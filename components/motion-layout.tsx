"use client";

import { LazyMotion, MotionConfig } from "motion/react";
import * as m from "motion/react-m";
import Link from "next/link";
import type { ReactNode } from "react";
import { SiteNav } from "@/components/site-nav";
import { ThemeProvider } from "@/components/theme-provider";
import { ThemeToggle } from "@/components/theme-toggle";
import type { NavItem } from "@/content/site-content";
import { springDefault, springSnappy } from "@/lib/motion";

const loadFeatures = () =>
  import("@/lib/motion-features").then((res) => res.default);

type MotionLayoutProps = {
  children: ReactNode;
  shortName: string;
  navItems: NavItem[];
};

export function MotionLayout({
  children,
  shortName,
  navItems,
}: MotionLayoutProps) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <LazyMotion features={loadFeatures} strict>
        <MotionConfig transition={springDefault} reducedMotion="user">
          <a href="#main-content" className="skip-link">
            Skip to main content
          </a>

          <div className="w-full p-6">
            <m.header
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-start justify-between gap-6 pb-8 sticky top-4 z-10"
            >
              <m.div
                whileHover={{ scale: 1.15 }}
                whileTap={{ scale: 0.9 }}
                transition={springSnappy}
              >
                <Link
                  href="/"
                  className="flex size-10 items-center justify-center text-xs tracking-wide"
                >
                  {shortName}
                </Link>
              </m.div>
              <div className="flex flex-col items-end">
                <ThemeToggle />
                <SiteNav
                  items={navItems}
                  ariaLabel="Primary"
                  className="flex flex-col items-end"
                />
              </div>
            </m.header>

            <main
              id="main-content"
              tabIndex={-1}
              className="outline-none max-w-3xl mx-auto w-full pb-16"
            >
              {children}
            </main>

            <m.footer
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="fixed inset-x-0 bottom-8 flex items-end justify-between px-6 pointer-events-none"
            >
              <p className="text-xs text-ink-muted pointer-events-auto">
                © 2026
              </p>
            </m.footer>
          </div>
        </MotionConfig>
      </LazyMotion>
    </ThemeProvider>
  );
}
