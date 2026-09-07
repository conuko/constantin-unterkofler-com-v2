"use client";

import { ArrowRight, ArrowUpRight } from "lucide-react";
import {
  NotebookRecordGroup,
  NotebookRecordRow,
  NotebookRecordRowLink,
  NotebookRowIndex,
} from "@/components/notebook-primitives";
import type { ContactLink } from "@/content/site-content";
import { notebookRecordRowsReveal } from "@/lib/notebook-motion";

type ContactListProps = {
  links: ContactLink[];
  sectionCode: string;
};

function isSameTabAction(href: string) {
  return href.startsWith("mailto:");
}

/**
 * Contact routes as indexed record rows. Email stays a same-tab action while
 * GitHub and LinkedIn open externally, and each row reads as one action.
 */
export function ContactList({ links, sectionCode }: ContactListProps) {
  return (
    <NotebookRecordGroup
      as="ul"
      variants={notebookRecordRowsReveal}
      className="w-full"
    >
      {links.map((link, index) => {
        const external = !isSameTabAction(link.href);
        const ActionMark = external ? ArrowUpRight : ArrowRight;

        return (
          <NotebookRecordRow key={link.label} interactive>
            <NotebookRecordRowLink href={link.href} external={external}>
              <NotebookRowIndex>
                {`${sectionCode}–${String(index + 1).padStart(2, "0")}`}
              </NotebookRowIndex>
              <span className="font-semibold text-sm sm:w-24 sm:shrink-0">
                {link.label}
              </span>
              <span className="order-last min-w-0 basis-full break-words text-ink-muted text-sm transition-colors duration-fast group-focus-within:text-ink group-hover:text-ink sm:order-none sm:flex-1 sm:basis-auto">
                {link.value}
              </span>
              <span className="ml-auto flex shrink-0 self-center text-ink-muted transition-colors duration-fast group-focus-within:text-ink group-hover:text-ink">
                <ActionMark aria-hidden="true" className="size-4" />
                {external && (
                  <span className="sr-only">(opens in a new tab)</span>
                )}
              </span>
            </NotebookRecordRowLink>
          </NotebookRecordRow>
        );
      })}
    </NotebookRecordGroup>
  );
}
