"use client";

import type { Variants } from "motion/react";
import * as m from "motion/react-m";
import { createContext, type ReactNode, useContext, useRef } from "react";
import {
  createNotebookRecordReveal,
  notebookInteractionTransition,
  notebookPageHeadingReveal,
  notebookPageIdentityReveal,
  notebookPartReveal,
  notebookRuleReveal,
} from "@/lib/notebook-motion";
import { cn } from "@/lib/utils/cn";

type NotebookCollectionProps = {
  children: ReactNode;
  variants: Variants;
  className?: string;
};

const NotebookPageIdentityContext = createContext(true);

export function NotebookPageIdentityProvider({
  children,
  settled,
}: {
  children: ReactNode;
  settled: boolean;
}) {
  return (
    <NotebookPageIdentityContext.Provider value={settled}>
      {children}
    </NotebookPageIdentityContext.Provider>
  );
}

type NotebookPageHeaderProps = {
  introduction?: ReactNode;
  sectionCode: string;
  sequence: Variants;
  showRule?: boolean;
  title: string;
  onIdentitySettled?: () => void;
};

const identitySettlementOpacity = 0.95;

function NotebookPageHeading({
  title,
  onSettled,
}: {
  title: string;
  onSettled?: () => void;
}) {
  return (
    <m.h1
      variants={notebookPageHeadingReveal}
      onUpdate={({ opacity }) => {
        if (
          typeof opacity === "number" &&
          opacity >= identitySettlementOpacity
        ) {
          onSettled?.();
        }
      }}
      onAnimationComplete={onSettled}
      data-notebook-title
      className="w-fit pr-2 font-heading font-semibold text-5xl leading-none tracking-tight lg:text-7xl"
    >
      {title}
    </m.h1>
  );
}

export function NotebookPageHeader({
  introduction,
  sectionCode,
  sequence,
  showRule = true,
  title,
  onIdentitySettled,
}: NotebookPageHeaderProps) {
  const identityProgress = useRef({
    settledParts: new Set<"introduction" | "title">(),
    notified: false,
  });

  function markIdentityPartSettled(part: "introduction" | "title") {
    identityProgress.current.settledParts.add(part);
    const requiredPartCount = introduction ? 2 : 1;

    if (
      !identityProgress.current.notified &&
      identityProgress.current.settledParts.size === requiredPartCount
    ) {
      identityProgress.current.notified = true;
      onIdentitySettled?.();
    }
  }

  function markIdentityPartVisible(
    part: "introduction" | "title",
    opacity: unknown,
  ) {
    if (typeof opacity === "number" && opacity >= identitySettlementOpacity) {
      markIdentityPartSettled(part);
    }
  }

  return (
    <m.header
      variants={sequence}
      data-notebook-header
      className="flex w-full flex-col items-start"
    >
      {sectionCode && (
        <m.p
          variants={notebookPageIdentityReveal}
          className="label mb-4 text-ink-muted text-label"
        >
          {sectionCode}
        </m.p>
      )}
      <NotebookPageHeading
        key={title}
        title={title}
        onSettled={() => markIdentityPartSettled("title")}
      />
      {introduction && (
        <m.div
          variants={notebookPageIdentityReveal}
          onUpdate={({ opacity }) =>
            markIdentityPartVisible("introduction", opacity)
          }
          onAnimationComplete={() => markIdentityPartSettled("introduction")}
          data-notebook-introduction
          className="mt-6 w-full max-w-180 text-ink-muted text-sm"
        >
          {introduction}
        </m.div>
      )}
      {showRule && (
        <m.div
          variants={notebookRuleReveal}
          data-notebook-header-rule
          className="mt-7 h-px w-full origin-left bg-rule"
        />
      )}
    </m.header>
  );
}

export function NotebookCollection({
  children,
  variants,
  className,
}: NotebookCollectionProps) {
  const pageIdentitySettled = useContext(NotebookPageIdentityContext);

  return (
    <m.div
      initial="hidden"
      animate={pageIdentitySettled ? "visible" : "hidden"}
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
      className="label mb-3 text-ink-muted text-label"
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
  mediaClassName?: string;
  link?: NotebookMediaLink;
};

export function NotebookMedia({
  children,
  mediaClassName,
  link,
}: NotebookMediaProps) {
  const field = (
    <m.div
      data-notebook-media-field
      whileHover={{ scale: "var(--notebook-media-hover-scale)" }}
      transition={notebookInteractionTransition}
      className={cn(
        "relative flex aspect-video items-center justify-center overflow-hidden border border-media-field-rule bg-media-field p-7 shadow-media-field sm:p-10",
        mediaClassName,
      )}
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
      className="font-heading font-semibold text-2xl leading-none tracking-tight"
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
      className="label mt-2 text-ink-muted text-label"
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
      className="mt-4 border-rule border-l pl-3 text-ink-muted text-sm leading-relaxed"
    >
      {children}
    </m.div>
  );
}

type NotebookActionsProps = {
  children: ReactNode;
  label: string;
};

export function NotebookActions({ children, label }: NotebookActionsProps) {
  return (
    <m.ul
      variants={notebookPartReveal}
      data-entry-part="actions"
      aria-label={label}
      className="mt-5 flex flex-wrap gap-3"
    >
      {children}
    </m.ul>
  );
}

type NotebookActionProps = {
  children: ReactNode;
  className?: string;
  href: string;
  label: string;
};

export function NotebookAction({
  children,
  className,
  href,
  label,
}: NotebookActionProps) {
  return (
    <li>
      <m.a
        href={href}
        target="_blank"
        rel="noreferrer noopener"
        aria-label={label}
        whileTap={{ scale: "var(--notebook-press-scale)" }}
        transition={notebookInteractionTransition}
        className={cn(
          "label inline-flex min-h-9 items-center gap-2 border border-rule bg-card-glass px-3 py-2 text-ink-muted text-micro backdrop-blur-sm transition-colors duration-fast hover:border-ink hover:text-ink",
          className,
        )}
      >
        {children}
      </m.a>
    </li>
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
    <li className="label notebook-tag-marker text-ink-muted text-micro">
      {children}
    </li>
  );
}
