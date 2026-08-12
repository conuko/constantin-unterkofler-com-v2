"use client";

import type { Variants } from "motion/react";
import * as m from "motion/react-m";
import type { ContactLink } from "@/content/site-content";

type ContactListProps = {
  links: ContactLink[];
};

const easeOutExpo = [0.16, 1, 0.3, 1] as const;

const listIn: Variants = {
  hidden: {},
  visible: {
    transition: {
      delayChildren: 0.6,
      staggerChildren: 0.06,
    },
  },
};

const contactIn: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.5, ease: easeOutExpo },
  },
};

export function ContactList({ links }: ContactListProps) {
  return (
    <m.ul
      initial="hidden"
      animate="visible"
      variants={listIn}
      className="w-full border-rule"
    >
      {links.map((link) => (
        <m.li key={link.label} variants={contactIn}>
          <a
            href={link.href}
            target={link.href.startsWith("mailto:") ? undefined : "_blank"}
            rel={
              link.href.startsWith("mailto:")
                ? undefined
                : "noreferrer noopener"
            }
            className="flex flex-col gap-1 border-b border-rule py-4 lg:flex-row lg:items-center lg:gap-4"
          >
            <span className="text-sm font-semibold lg:w-40">{link.label}</span>
            <span className="text-sm text-ink-muted">{link.value}</span>
          </a>
        </m.li>
      ))}
    </m.ul>
  );
}
