"use client";

import { LazyMotion, MotionConfig, useReducedMotion } from "motion/react";
import * as m from "motion/react-m";
import type { ReactNode } from "react";
import { ThemeProvider } from "@/components/theme-provider";
import { springDefault } from "@/lib/motion";

const loadFeatures = () =>
  import("@/lib/motion-features").then((res) => res.default);

type MotionLayoutProps = {
  children: ReactNode;
};

export function MotionLayout({ children }: MotionLayoutProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <LazyMotion features={loadFeatures} strict>
        <MotionConfig
          transition={springDefault}
          reducedMotion={prefersReducedMotion ? "always" : "user"}
        >
          <a href="#main-content" className="skip-link">
            Skip to main content
          </a>

          <div className="w-full p-6 flex flex-1 flex-col">
            {children}

            <m.footer
              initial={prefersReducedMotion ? false : { opacity: 0 }}
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
