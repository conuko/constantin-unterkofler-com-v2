"use client";

import * as m from "motion/react-m";
import type { ContactLink } from "@/content/site-content";
import { listStagger, slideInLeft } from "@/lib/motion";

type ContactListProps = {
  links: ContactLink[];
};

export function ContactList({ links }: ContactListProps) {
  return (
    <m.ul variants={listStagger} className="border-rule w-full">
      {links.map((link) => (
        <m.li key={link.label} variants={slideInLeft}>
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
