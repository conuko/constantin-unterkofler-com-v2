"use client";

import { LazyMotion, MotionConfig, type Transition } from "motion/react";
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
  footer: ReactNode;
  header: ReactNode;
};

export function MotionLayout({ children, footer, header }: MotionLayoutProps) {
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

            {footer}
          </div>
        </MotionConfig>
      </LazyMotion>
    </ThemeProvider>
  );
}
