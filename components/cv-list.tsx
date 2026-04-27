"use client";

import * as m from "motion/react-m";
import type { CvEntry } from "@/content/site-content";
import { fadeInUp, staggerContainer } from "@/lib/motion";

type CvListProps = {
  entries: CvEntry[];
};

export function CvList({ entries }: CvListProps) {
  return (
    <m.ol
      variants={staggerContainer}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.1 }}
    >
      {entries.map((entry) => (
        <m.li
          key={`${entry.organization}-${entry.years}`}
          variants={fadeInUp}
          className="flex flex-col gap-1 border-b border-rule py-4 lg:flex-row lg:items-start lg:justify-between lg:gap-4"
        >
          <div className="flex flex-col gap-0.5">
            <h2 className="text-sm font-semibold">{entry.organization}</h2>
            <p className="text-sm text-ink-muted">{entry.role}</p>
          </div>
          <div className="lg:text-right">
            <p className="text-sm text-ink-muted">{entry.years}</p>
          </div>
        </m.li>
      ))}
    </m.ol>
  );
}
