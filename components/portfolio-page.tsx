"use client";

import type { Variants } from "motion/react";
import * as m from "motion/react-m";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

type PortfolioPageProps = {
  title: string;
  introduction?: ReactNode;
  children?: ReactNode;
  width?: "standard" | "narrow";
};

const easeOutExpo = [0.16, 1, 0.3, 1] as const;

const headingIn: Variants = {
  hidden: { opacity: 0, clipPath: "inset(-10% 100% -10% 0)" },
  visible: {
    opacity: 1,
    clipPath: "inset(-10% -10% -10% 0)",
    transition: {
      duration: 0.9,
      ease: easeOutExpo,
      opacity: { duration: 0.4, ease: "easeOut" },
    },
  },
};

const contentStagger: Variants = {
  hidden: {},
  visible: {
    transition: {
      delayChildren: 0.6,
      staggerChildren: 0.12,
    },
  },
};

const introductionIn: Variants = {
  hidden: { opacity: 0, filter: "blur(3px)" },
  visible: {
    opacity: 1,
    filter: "blur(0px)",
    transition: {
      duration: 0.7,
      ease: easeOutExpo,
    },
  },
};

export function PortfolioPage({
  title,
  introduction,
  children,
  width = "standard",
}: PortfolioPageProps) {
  return (
    <m.div
      initial="hidden"
      animate="visible"
      className="flex flex-col items-center gap-10"
    >
      <m.h1
        variants={headingIn}
        className="font-heading text-center text-4xl font-semibold leading-none tracking-tight lg:text-6xl"
      >
        {title}
      </m.h1>
      <m.div
        variants={contentStagger}
        className={cn(
          "flex w-full flex-col items-center gap-10",
          width === "narrow" && "mx-auto max-w-xl",
        )}
      >
        {introduction && (
          <m.div variants={introductionIn}>{introduction}</m.div>
        )}
        {children}
      </m.div>
    </m.div>
  );
}
