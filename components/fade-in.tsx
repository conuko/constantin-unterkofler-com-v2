"use client";

import * as m from "motion/react-m";
import type { ReactNode } from "react";
import { fadeInUp, viewportOnce } from "@/lib/motion";

type FadeInProps = {
  children: ReactNode;
  className?: string;
};

export function FadeIn({ children, className }: FadeInProps) {
  return (
    <m.div
      variants={fadeInUp}
      initial="hidden"
      whileInView="visible"
      viewport={viewportOnce}
      className={className}
    >
      {children}
    </m.div>
  );
}
