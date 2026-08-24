"use client";

import type { Variants } from "motion/react";
import * as m from "motion/react-m";
import type { ReactNode } from "react";
import { NotebookPageHeader } from "@/components/notebook-primitives";
import { notebookEase } from "@/lib/notebook-motion";
import { cn } from "@/lib/utils/cn";

type PortfolioPageProps = {
  title: string;
  sectionCode?: string;
  introduction?: ReactNode;
  children?: ReactNode;
  width?: "collection" | "standard" | "narrow";
};

const headingIn: Variants = {
  hidden: {
    opacity: "var(--motion-initial-opacity)",
    clipPath: "var(--motion-initial-clip)",
  },
  visible: {
    opacity: 1,
    clipPath: "inset(-10% -10% -10% 0)",
    transition: {
      duration: 0.9,
      ease: notebookEase,
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
  hidden: {
    opacity: "var(--motion-initial-opacity)",
    filter: "var(--motion-initial-filter)",
  },
  visible: {
    opacity: 1,
    filter: "blur(0px)",
    transition: {
      duration: 0.7,
      ease: notebookEase,
    },
  },
};

export function PortfolioPage({
  title,
  sectionCode,
  introduction,
  children,
  width = "standard",
}: PortfolioPageProps) {
  return (
    <m.div
      initial="hidden"
      animate="visible"
      className="flex w-full flex-col gap-10"
    >
      {sectionCode ? (
        <NotebookPageHeader
          sectionCode={sectionCode}
          sequence={contentStagger}
          title={title}
          introduction={introduction}
        />
      ) : (
        <m.h1
          variants={headingIn}
          className="font-heading text-center text-4xl leading-none font-semibold tracking-tight lg:text-6xl"
        >
          {title}
        </m.h1>
      )}
      <m.div
        variants={contentStagger}
        className={cn(
          "flex w-full flex-col gap-10",
          width === "collection" && "max-w-[67.5rem]",
          width === "standard" && "mx-auto max-w-3xl items-center",
          width === "narrow" && "mx-auto max-w-xl",
        )}
      >
        {!sectionCode && introduction && (
          <m.div variants={introductionIn}>{introduction}</m.div>
        )}
        {children}
      </m.div>
    </m.div>
  );
}
