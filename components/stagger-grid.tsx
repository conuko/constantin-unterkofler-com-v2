"use client";

import * as m from "motion/react-m";
import type { ReactNode } from "react";
import { gridStagger } from "@/lib/motion";

type StaggerGridProps = {
  children: ReactNode;
  className?: string;
};

export function StaggerGrid({ children, className }: StaggerGridProps) {
  return (
    <m.div variants={gridStagger} className={className}>
      {children}
    </m.div>
  );
}
