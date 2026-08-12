"use client";

import { LazyMotion, MotionConfig, type Transition } from "motion/react";
import * as m from "motion/react-m";
import type { ReactNode } from "react";
import { ThemeProvider } from "@/components/theme-provider";

const loadFeatures = () =>
  import("motion/react").then((motion) => motion.domMax);

const defaultTransition = {
  type: "spring",
  visualDuration: 0.5,
  bounce: 0.15,
} satisfies Transition;

type MotionLayoutProps = {
  children: ReactNode;
};

export function MotionLayout({ children }: MotionLayoutProps) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <LazyMotion features={loadFeatures} strict>
        <MotionConfig transition={defaultTransition} reducedMotion="user">
          <a href="#main-content" className="skip-link">
            Skip to main content
          </a>

          <div className="w-full p-6 flex flex-1 flex-col">
            {children}

            <m.footer
              initial={{ opacity: "var(--footer-initial-opacity)" }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.4, ease: "easeOut" }}
              className="mt-auto pt-8 pb-2 flex items-end justify-between lg:fixed lg:inset-x-0 lg:bottom-8 lg:px-6 lg:pointer-events-none [--footer-initial-opacity:0] motion-reduce:[--footer-initial-opacity:1]"
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
