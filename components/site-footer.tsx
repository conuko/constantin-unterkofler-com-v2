"use client";

import { stagger, type Variants } from "motion/react";
import * as m from "motion/react-m";
import { notebookPartReveal, notebookRuleReveal } from "@/lib/notebook-motion";

const closingRecordReveal: Variants = {
  hidden: {},
  visible: {
    transition: {
      delayChildren: stagger(0.08, { startDelay: 0.6 }),
    },
  },
};

type SiteFooterProps = {
  identity: {
    name: string;
  };
  closingRecord: {
    copyrightYear: number;
  };
};

/**
 * The in-flow closing record: one hairline rule and a copyright line that sits
 * at the end of short and long pages alike.
 */
export function SiteFooter({ identity, closingRecord }: SiteFooterProps) {
  return (
    <m.footer
      initial="hidden"
      animate="visible"
      variants={closingRecordReveal}
      data-closing-record
      className="relative mx-auto mt-auto flex w-full max-w-180 pt-4 pb-2"
    >
      <m.span
        aria-hidden="true"
        variants={notebookRuleReveal}
        className="absolute inset-x-0 top-0 h-px origin-left bg-rule"
      />
      <m.p
        variants={notebookPartReveal}
        className="label text-ink-muted text-label"
      >
        © {closingRecord.copyrightYear} {identity.name}
      </m.p>
    </m.footer>
  );
}
