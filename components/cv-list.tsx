"use client";

import * as m from "motion/react-m";
import type { CvEntry } from "@/content/site-content";
import { fadeInUp, listStagger } from "@/lib/motion";

type CvListProps = {
  entries: CvEntry[];
  title?: string;
};

export function CvList({ entries, title }: CvListProps) {
  return (
    <section className="w-full">
      {title && (
        <m.h2
          variants={fadeInUp}
          className="text-xs font-medium uppercase tracking-widest text-ink-muted"
        >
          {title}
        </m.h2>
      )}
      <m.ol variants={listStagger}>
        {entries.map((entry) => (
          <m.li
            key={`${entry.organization}-${entry.years}`}
            variants={fadeInUp}
            className="flex flex-col gap-1 border-b border-rule py-4 lg:flex-row lg:items-start lg:justify-between lg:gap-4"
          >
            <div className="flex flex-col gap-0.5">
              <h3 className="text-sm font-semibold">{entry.organization}</h3>
              <p className="text-sm text-ink-muted">{entry.role}</p>
            </div>
            <div className="lg:text-right">
              <p className="text-sm text-ink-muted">{entry.years}</p>
            </div>
          </m.li>
        ))}
      </m.ol>
    </section>
  );
}
