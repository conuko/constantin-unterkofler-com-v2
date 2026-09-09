import type { CSSProperties, ReactNode } from "react";
import { notebookDelay, notebookTiming } from "@/lib/notebook-motion";
import { cn } from "@/lib/utils/cn";

/**
 * The Engineering Notebook's record anatomy.
 *
 * These are server components on purpose. Their entrance is CSS (see
 * `app/motion.css`), their hover and press states are CSS, and none of them
 * hold state — so none of them need to ship, hydrate, or run. What used to be
 * sixty Motion components on the Work page is now zero.
 */

type NotebookPageHeaderProps = {
  /** Takes the section code's slot on a Portfolio Page that greets instead. */
  greeting?: ReactNode;
  introduction?: ReactNode;
  sectionCode: string;
  showRule?: boolean;
  title: string;
};

export function NotebookPageHeader({
  greeting,
  introduction,
  sectionCode,
  showRule = true,
  title,
}: NotebookPageHeaderProps) {
  return (
    <header data-notebook-header className="flex w-full flex-col items-start">
      {(greeting || sectionCode) && (
        <p
          style={notebookDelay(notebookTiming.pageIdentity)}
          className={cn(
            "notebook-in-identity mb-4 text-ink-muted",
            greeting ? "text-sm" : "label text-label",
          )}
        >
          {greeting ?? sectionCode}
        </p>
      )}
      <h1
        style={notebookDelay(notebookTiming.pageHeading)}
        data-notebook-title
        className="notebook-in-heading w-fit pr-2 font-heading font-semibold text-5xl leading-none tracking-tight lg:text-7xl"
      >
        {title}
      </h1>
      {introduction && (
        <div
          style={notebookDelay(notebookTiming.pageIntroduction)}
          data-notebook-introduction
          className="notebook-in-introduction mt-6 w-full max-w-180 text-ink-muted text-sm"
        >
          {introduction}
        </div>
      )}
      {showRule && (
        <div
          style={notebookDelay(notebookTiming.pageHeaderRule)}
          data-notebook-header-rule
          className="notebook-in-rule mt-7 h-px w-full origin-left bg-rule"
        />
      )}
    </header>
  );
}

const recordGroupElements = ["div", "ol", "ul"] as const;

type NotebookRecordGroupProps = {
  as?: (typeof recordGroupElements)[number];
  children: ReactNode;
  className?: string;
  label?: string;
  /** Seconds from first paint before the first record registers. */
  base?: number;
  /** Seconds between one record and the next. */
  step?: number;
};

/**
 * A group of records that registers in reading order. The group names its own
 * base offset and step once; each child derives its delay from its DOM
 * position (see the stagger block in `app/motion.css`).
 */
export function NotebookRecordGroup({
  as: Group = "div",
  children,
  className,
  label,
  base = notebookTiming.content,
  step = 0.06,
}: NotebookRecordGroupProps) {
  return (
    <Group
      aria-label={label}
      data-notebook-record-group
      data-notebook-stagger
      style={
        {
          "--notebook-stagger-base": `${base}s`,
          "--notebook-stagger-step": `${step}s`,
        } as CSSProperties
      }
      className={className}
    >
      {children}
    </Group>
  );
}

type NotebookCollectionProps = {
  children: ReactNode;
  className?: string;
  base?: number;
  step?: number;
};

export function NotebookCollection({
  children,
  className,
  base,
  step,
}: NotebookCollectionProps) {
  return (
    <NotebookRecordGroup
      base={base}
      step={step}
      className={cn(
        "grid w-full grid-cols-1 gap-x-8 gap-y-14 md:grid-cols-2 lg:gap-x-12 lg:gap-y-18",
        className,
      )}
    >
      {children}
    </NotebookRecordGroup>
  );
}

type NotebookRecordProps = {
  children: ReactNode;
  className?: string;
  /** Seconds between one part of this record and the next. */
  partStep?: number;
};

export function NotebookRecord({
  children,
  className,
  partStep = 0.045,
}: NotebookRecordProps) {
  return (
    <article
      data-notebook-record
      style={{ "--notebook-part-step": `${partStep}s` } as CSSProperties}
      className={cn(
        "notebook-in-record notebook-lift group relative flex min-w-0 flex-col pt-3",
        className,
      )}
    >
      <span
        aria-hidden="true"
        data-notebook-record-rule
        className="notebook-in-rule absolute inset-x-0 top-0 h-px origin-left bg-rule transition-colors duration-fast group-focus-within:bg-ink"
      />
      {children}
    </article>
  );
}

export function NotebookIndex({ children }: { children: ReactNode }) {
  return (
    <p
      data-entry-part="index"
      className="notebook-in-part label mb-3 text-ink-muted text-label"
    >
      {children}
    </p>
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
  /* The entrance rides on the field itself, not on the `[data-entry-part]`
   * wrapper the way every other part does — and that placement is load-bearing
   * for any glass `mediaClassName`. An ancestor whose opacity is under 1
   * becomes a Backdrop Root, and a `backdrop-filter` inside one samples an
   * empty backdrop and renders as flat tint. So while the wrapper faded, the
   * tile's blur was simply absent until the entrance finished. Fading the
   * field itself composites the already-blurred surface, which is what we
   * want; the wrapper keeps `data-entry-part` so the stagger still supplies
   * `--notebook-delay`, and it inherits down to here. */
  const field = (
    <div
      data-notebook-media-field
      className={cn(
        "notebook-in-part notebook-media-field relative flex aspect-video items-center justify-center overflow-hidden border border-media-field-rule bg-media-field p-7 shadow-media-field sm:p-10",
        mediaClassName,
      )}
    >
      {children}
    </div>
  );

  return (
    <div data-entry-part="media" className="mb-5">
      {link ? (
        <a
          href={link.href}
          target="_blank"
          rel="noreferrer noopener"
          aria-label={link.label}
          className="notebook-press block"
        >
          {field}
        </a>
      ) : (
        field
      )}
    </div>
  );
}

export function NotebookTitle({ children }: { children: ReactNode }) {
  return (
    <h2
      data-entry-part="title"
      className="notebook-in-part font-heading font-semibold text-2xl leading-none tracking-tight"
    >
      {children}
    </h2>
  );
}

export function NotebookMetadata({ children }: { children: ReactNode }) {
  return (
    <p
      data-entry-part="metadata"
      className="notebook-in-part label mt-2 text-ink-muted text-label"
    >
      {children}
    </p>
  );
}

export function NotebookAnnotation({ children }: { children: ReactNode }) {
  return (
    <div
      data-entry-part="annotation"
      className="notebook-in-part mt-4 border-rule border-l pl-3 text-ink-muted text-sm leading-relaxed"
    >
      {children}
    </div>
  );
}

type NotebookActionsProps = {
  children: ReactNode;
  label: string;
};

export function NotebookActions({ children, label }: NotebookActionsProps) {
  return (
    <ul
      data-entry-part="actions"
      aria-label={label}
      className="notebook-in-part mt-5 flex flex-wrap gap-3"
    >
      {children}
    </ul>
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
      <a
        href={href}
        target="_blank"
        rel="noreferrer noopener"
        aria-label={label}
        className={cn(
          "notebook-press label inline-flex min-h-9 items-center gap-2 border border-rule bg-card-glass px-3 py-2 text-ink-muted text-micro backdrop-blur-sm transition-colors duration-fast hover:border-ink hover:text-ink",
          className,
        )}
      >
        {children}
      </a>
    </li>
  );
}

type NotebookTagsProps = {
  children?: ReactNode;
  label: string;
};

export function NotebookTags({ children, label }: NotebookTagsProps) {
  return (
    <ul
      data-entry-part="tags"
      aria-label={label}
      className="notebook-in-part mt-5 flex min-h-5 flex-wrap gap-x-3 gap-y-1.5"
    >
      {children}
    </ul>
  );
}

export function NotebookTag({ children }: { children: ReactNode }) {
  return (
    <li className="label notebook-tag-marker text-ink-muted text-micro">
      {children}
    </li>
  );
}

const labelElements = ["h2", "h3", "p", "span"] as const;

type NotebookLabelProps = {
  as?: (typeof labelElements)[number];
  children: ReactNode;
  className?: string;
};

/** The shared uppercase label language used for codes, indices, and metadata. */
export function NotebookLabel({
  as: Label = "p",
  children,
  className,
}: NotebookLabelProps) {
  return (
    <Label className={cn("label text-ink-muted text-label", className)}>
      {children}
    </Label>
  );
}

/** Heading for a named section of record rows, e.g. the CV's Work and Education. */
export function NotebookSectionHeading({
  children,
  delay,
}: {
  children: ReactNode;
  delay?: number;
}) {
  return (
    <h2
      style={delay === undefined ? undefined : notebookDelay(delay)}
      data-notebook-section-heading
      className="notebook-in-part label text-ink-muted text-label"
    >
      {children}
    </h2>
  );
}

type NotebookRecordRowProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
  interactive?: boolean;
};

/**
 * One record row: a drawn hairline rule above row content that settles as a
 * unit. Interactive rows lift their rule to ink on hover and focus.
 */
export function NotebookRecordRow({
  children,
  className,
  delay,
  interactive = false,
}: NotebookRecordRowProps) {
  return (
    <li
      style={delay === undefined ? undefined : notebookDelay(delay)}
      data-notebook-record-row
      className={cn(
        "notebook-in-part group relative flex min-w-0 flex-col",
        className,
      )}
    >
      <span
        aria-hidden="true"
        data-notebook-record-rule
        className={cn(
          "notebook-in-rule absolute inset-x-0 top-0 h-px origin-left bg-rule transition-colors duration-fast",
          interactive && "group-focus-within:bg-ink group-hover:bg-ink",
        )}
      />
      {children}
    </li>
  );
}

const recordRowGeometry =
  "flex w-full flex-wrap items-baseline gap-x-6 gap-y-1 py-4 sm:flex-nowrap";

export function NotebookRecordRowBody({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={cn(recordRowGeometry, className)}>{children}</div>;
}

type NotebookRecordRowLinkProps = {
  children: ReactNode;
  className?: string;
  external?: boolean;
  href: string;
};

/**
 * A record row whose whole body is one action. Hover, focus, and press share
 * the notebook interaction tokens; external destinations open in a new tab.
 */
export function NotebookRecordRowLink({
  children,
  className,
  external = false,
  href,
}: NotebookRecordRowLinkProps) {
  return (
    <a
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noreferrer noopener" : undefined}
      className={cn(
        recordRowGeometry,
        "notebook-lift notebook-press origin-left transition-colors duration-fast hover:text-ink focus-visible:text-ink",
        className,
      )}
    >
      {children}
    </a>
  );
}

/** Real position of a row within its Portfolio Page records, e.g. A–01. */
export function NotebookRowIndex({ children }: { children: ReactNode }) {
  return (
    <NotebookLabel as="span" className="w-14 shrink-0 tabular-nums">
      {children}
    </NotebookLabel>
  );
}
