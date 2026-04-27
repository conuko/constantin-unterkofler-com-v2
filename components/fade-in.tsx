"use client";

import * as m from "motion/react-m";
import type { ReactNode } from "react";
import { contentIn } from "@/lib/motion";

type FadeInProps = {
  children: ReactNode;
  className?: string;
};

export function FadeIn({ children, className }: FadeInProps) {
  return (
    <m.div variants={contentIn} className={className}>
      {children}
    </m.div>
  );
}
