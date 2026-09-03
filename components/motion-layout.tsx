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
  header: ReactNode;
};

export function MotionLayout({ children, header }: MotionLayoutProps) {
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

          <div className="flex w-full flex-1 flex-col p-6">
            {header}

            <main
              id="main-content"
              className="mx-auto w-full max-w-270 flex-1 pb-16"
            >
              {children}
            </main>

            <m.footer
              initial={{ opacity: "var(--motion-initial-opacity)" }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.4, ease: "easeOut" }}
              className="mt-auto flex items-end justify-between pt-8 pb-2 lg:pointer-events-none lg:fixed lg:inset-x-0 lg:bottom-8 lg:px-6"
            >
              <p className="text-ink-muted text-xs lg:pointer-events-auto">
                © 2026
              </p>
            </m.footer>
          </div>
        </MotionConfig>
      </LazyMotion>
    </ThemeProvider>
  );
}
