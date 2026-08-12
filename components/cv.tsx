"use client";

import type { Variants } from "motion/react";
import * as m from "motion/react-m";
import type { CvSection } from "@/content/site-content";

type CvProps = {
  sections: CvSection[];
};

const easeOutExpo = [0.16, 1, 0.3, 1] as const;

const cvIn: Variants = {
  hidden: {},
  visible: {
    transition: {
      delayChildren: 0.72,
      staggerChildren: 0.12,
    },
  },
};

const sectionIn: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.12,
    },
  },
};

const sectionHeadingIn: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.5, ease: easeOutExpo },
  },
};

const entryStagger: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.06,
    },
  },
};

const entryIn: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.5, ease: easeOutExpo },
  },
};

export function Cv({ sections }: CvProps) {
  return (
    <m.div
      initial="hidden"
      animate="visible"
      variants={cvIn}
      className="flex w-full flex-col gap-10"
    >
      {sections.map((section) => (
        <m.section key={section.title} variants={sectionIn} className="w-full">
          <m.h2
            variants={sectionHeadingIn}
            className="text-xs font-medium uppercase tracking-widest text-ink-muted"
          >
            {section.title}
          </m.h2>
          <m.ol variants={entryStagger}>
            {section.entries.map((entry) => (
              <m.li
                key={`${entry.organization}-${entry.years}`}
                variants={entryIn}
                className="flex flex-col gap-1 border-b border-rule py-4 lg:flex-row lg:items-start lg:justify-between lg:gap-4"
              >
                <div className="flex flex-col gap-0.5">
                  <h3 className="text-sm font-semibold">
                    {entry.organization}
                  </h3>
                  <p className="text-sm text-ink-muted">{entry.role}</p>
                </div>
                <div className="lg:text-right">
                  <p className="text-sm text-ink-muted">{entry.years}</p>
                </div>
              </m.li>
            ))}
          </m.ol>
        </m.section>
      ))}
    </m.div>
  );
}
