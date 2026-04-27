"use client";

import * as m from "motion/react-m";
import type { ReactNode } from "react";
import { scaleIn, springGentle, staggerContainer } from "@/lib/motion";
import { cn } from "@/lib/utils/cn";

type PageShellProps = {
  title: string;
  children: ReactNode;
  isNarrow?: boolean;
};

export function PageShell({
  title,
  children,
  isNarrow = false,
}: PageShellProps) {
  return (
    <m.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className={cn(
        "flex flex-col gap-10 items-center",
        isNarrow &&
          "[&>*:not(:first-child)]:max-w-xl [&>*:not(:first-child)]:mx-auto [&>*:not(:first-child)]:w-full",
      )}
    >
      <m.h1
        variants={scaleIn}
        transition={springGentle}
        className="font-heading text-4xl lg:text-6xl font-semibold leading-none tracking-tight text-center"
      >
        {title}
      </m.h1>
      {children}
    </m.div>
  );
}
