"use client";

import type { Variants } from "motion/react";
import * as m from "motion/react-m";
import type { ReactNode } from "react";
import {
  createNotebookRecordReveal,
  notebookInteractionTransition,
  notebookPageHeadingReveal,
  notebookPageIntroductionReveal,
  notebookPartReveal,
  notebookRuleReveal,
} from "@/lib/notebook-motion";
import { cn } from "@/lib/utils/cn";

type NotebookCollectionProps = {
  children: ReactNode;
  variants: Variants;
  className?: string;
};

type NotebookPageHeaderProps = {
  introduction?: ReactNode;
  sectionCode: string;
  sequence: Variants;
  title: string;
};

export function NotebookPageHeader({
  introduction,
  sectionCode,
  sequence,
  title,
}: NotebookPageHeaderProps) {
  return (
    <m.header
      variants={sequence}
      data-notebook-header
      className="flex w-full flex-col items-start"
    >
      <m.p
        variants={notebookPageIntroductionReveal}
        className="label mb-4 text-[0.6875rem] text-ink-muted"
      >
        {sectionCode}
      </m.p>
      <m.h1
        variants={notebookPageHeadingReveal}
        className="font-heading text-5xl leading-none font-semibold tracking-tight lg:text-7xl"
      >
        {title}
      </m.h1>
      {introduction && (
        <m.div
          variants={notebookPageIntroductionReveal}
          data-notebook-introduction
          className="mt-6 w-full max-w-[45rem] text-sm text-ink-muted"
        >
          {introduction}
        </m.div>
      )}
      <m.div
        variants={notebookRuleReveal}
        data-notebook-header-rule
        className="mt-7 h-px w-full origin-left bg-rule"
      />
    </m.header>
  );
}

export function NotebookCollection({
  children,
  variants,
  className,
}: NotebookCollectionProps) {
  return (
    <m.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.08 }}
      variants={variants}
      data-notebook-collection
      className={cn(
        "grid w-full grid-cols-1 gap-x-8 gap-y-14 md:grid-cols-2 lg:gap-x-12 lg:gap-y-18",
        className,
      )}
    >
      {children}
    </m.div>
  );
}

type NotebookRecordProps = {
  children: ReactNode;
  className?: string;
  sequence: {
    delayChildren: number;
    staggerChildren: number;
  };
};

export function NotebookRecord({
  children,
  className,
  sequence,
}: NotebookRecordProps) {
  return (
    <m.article
      variants={createNotebookRecordReveal(sequence)}
      whileHover={{ y: "var(--notebook-hover-y)" }}
      transition={notebookInteractionTransition}
      className={cn("group relative flex min-w-0 flex-col pt-3", className)}
    >
      <m.span
        aria-hidden="true"
        data-notebook-record-rule
        variants={notebookRuleReveal}
        className="absolute inset-x-0 top-0 h-px origin-left bg-rule transition-colors duration-fast group-focus-within:bg-ink"
      />
      {children}
    </m.article>
  );
}

export function NotebookIndex({ children }: { children: ReactNode }) {
  return (
    <m.p
      variants={notebookPartReveal}
      data-entry-part="index"
      className="label mb-3 text-[0.6875rem] text-ink-muted"
    >
      {children}
    </m.p>
  );
}

type NotebookMediaLink = {
  href: string;
  label: string;
};

type NotebookMediaProps = {
  children: ReactNode;
  link?: NotebookMediaLink;
};

export function NotebookMedia({ children, link }: NotebookMediaProps) {
  const field = (
    <m.div
      data-notebook-media-field
      whileHover={{ scale: "var(--notebook-media-hover-scale)" }}
      transition={notebookInteractionTransition}
      className="relative flex aspect-[16/9] items-center justify-center overflow-hidden border border-[var(--color-media-field-rule)] bg-[var(--color-media-field)] p-7 shadow-[inset_0_1px_0_var(--color-media-field-highlight)] sm:p-10"
    >
      {children}
    </m.div>
  );

  return (
    <m.div
      variants={notebookPartReveal}
      data-entry-part="media"
      className="mb-5"
    >
      {link ? (
        <m.a
          href={link.href}
          target="_blank"
          rel="noreferrer noopener"
          aria-label={link.label}
          whileTap={{ scale: "var(--notebook-press-scale)" }}
          transition={notebookInteractionTransition}
          className="block"
        >
          {field}
        </m.a>
      ) : (
        field
      )}
    </m.div>
  );
}

export function NotebookTitle({ children }: { children: ReactNode }) {
  return (
    <m.h2
      variants={notebookPartReveal}
      data-entry-part="title"
      className="font-heading text-2xl leading-none font-semibold tracking-tight"
    >
      {children}
    </m.h2>
  );
}

export function NotebookMetadata({ children }: { children: ReactNode }) {
  return (
    <m.p
      variants={notebookPartReveal}
      data-entry-part="metadata"
      className="label mt-2 text-[0.6875rem] text-ink-muted"
    >
      {children}
    </m.p>
  );
}

export function NotebookAnnotation({ children }: { children: ReactNode }) {
  return (
    <m.div
      variants={notebookPartReveal}
      data-entry-part="annotation"
      className="mt-4 border-l border-rule pl-3 text-sm leading-relaxed text-ink-muted"
    >
      {children}
    </m.div>
  );
}

type NotebookTagsProps = {
  children?: ReactNode;
  label: string;
};

export function NotebookTags({ children, label }: NotebookTagsProps) {
  return (
    <m.ul
      variants={notebookPartReveal}
      data-entry-part="tags"
      aria-label={label}
      className="mt-5 flex min-h-5 flex-wrap gap-x-3 gap-y-1.5"
    >
      {children}
    </m.ul>
  );
}

export function NotebookTag({ children }: { children: ReactNode }) {
  return (
    <li className="label text-[0.625rem] text-ink-muted before:mr-1.5 before:text-rule before:content-['+']">
      {children}
    </li>
  );
}
