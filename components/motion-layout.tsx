"use client";

import { LazyMotion, MotionConfig } from "motion/react";
import * as m from "motion/react-m";
import Link from "next/link";
import type { ReactNode } from "react";
import { MobileNav } from "@/components/mobile-nav";
import { SiteNav } from "@/components/site-nav";
import { ThemeProvider } from "@/components/theme-provider";
import { ThemeToggle } from "@/components/theme-toggle";
import type { NavItem } from "@/content/site-content";
import { hoverScale, springDefault, springSnappy, tapScale } from "@/lib/motion";
import { useScrolled } from "@/lib/use-scrolled";

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
  const isScrolled = useScrolled();

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

          <div className="w-full p-6 flex flex-1 flex-col">
            <m.header
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className={`flex justify-between gap-6 sticky top-4 z-10 lg:z-0 lg:pb-8 rounded-xl lg:rounded-none border border-transparent max-lg:transition-[background-color,border-color,box-shadow,padding,backdrop-filter] max-lg:duration-normal max-lg:ease-default ${
                isScrolled
                  ? "max-lg:border-rule max-lg:bg-card-glass max-lg:px-4 max-lg:py-3 max-lg:backdrop-blur-md max-lg:shadow-sm"
                  : "max-lg:pb-8"
              }`}
            >
              <m.div
                whileHover={hoverScale}
                whileTap={tapScale}
                transition={springSnappy}
                className="self-start"
              >
                <Link
                  href="/"
                  aria-label="Home"
                  className="flex size-10 items-center justify-center text-xs tracking-wide"
                >
                  {shortName}
                </Link>
              </m.div>
              <div className="hidden lg:flex flex-col items-end">
                <ThemeToggle />
                <SiteNav
                  items={navItems}
                  ariaLabel="Primary"
                  className="flex flex-col items-end"
                />
              </div>

              <MobileNav items={navItems} className="lg:hidden" />
            </m.header>

            <main
              id="main-content"
              className="max-w-3xl mx-auto w-full pb-16 flex-1"
            >
              {children}
            </main>

            <m.footer
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.4, ease: "easeOut" }}
              className="mt-auto pt-8 pb-2 flex items-end justify-between lg:fixed lg:inset-x-0 lg:bottom-8 lg:px-6 lg:pointer-events-none"
            >
              <p className="text-xs text-ink-muted lg:pointer-events-auto">
                © 2026
              </p>
            </m.footer>
          </div>
        </MotionConfig>
      </LazyMotion>
    </ThemeProvider>
  );
}
