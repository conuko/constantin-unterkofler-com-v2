"use client";

import * as m from "motion/react-m";
import type { ReactNode } from "react";
import { contentStagger, headlineIn } from "@/lib/motion";
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
    <m.div initial="hidden" animate="visible" className="flex flex-col gap-10 items-center">
      <m.h1
        variants={headlineIn}
        className="font-heading text-4xl lg:text-6xl font-semibold leading-none tracking-tight text-center"
      >
        {title}
      </m.h1>
      <m.div
        variants={contentStagger}
        className={cn(
          "flex flex-col gap-10 items-center w-full",
          isNarrow && "max-w-xl mx-auto",
        )}
      >
        {children}
      </m.div>
    </m.div>
  );
}
