"use client";

import {
  AnimatePresence,
  LazyMotion,
  MotionConfig,
  type Transition,
  useReducedMotion,
} from "motion/react";
import * as m from "motion/react-m";
import { usePathname } from "next/navigation";
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

function RouteTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const prefersReducedMotion = useReducedMotion();
  const routeTransition = prefersReducedMotion
    ? { duration: 0 }
    : { duration: 0.22, ease: "easeOut" as const };

  return (
    <AnimatePresence mode="wait">
      <m.main
        key={pathname}
        id="main-content"
        initial={{ opacity: "var(--motion-initial-opacity)" }}
        animate={{ opacity: 1 }}
        exit={{ opacity: prefersReducedMotion ? 1 : 0 }}
        transition={routeTransition}
        className="mx-auto w-full max-w-270 flex-1 pb-16"
      >
        {children}
      </m.main>
    </AnimatePresence>
  );
}

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

          <div className="w-full p-6 flex flex-1 flex-col">
            {header}
            <RouteTransition>{children}</RouteTransition>

            <m.footer
              initial={{ opacity: "var(--motion-initial-opacity)" }}
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
