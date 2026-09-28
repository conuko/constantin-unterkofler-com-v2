import type { CSSProperties, ReactNode } from "react";
import {
  notebookDelay,
  notebookSeconds,
  notebookStagger,
  notebookTiming,
} from "@/lib/notebook-motion";
import { cn } from "@/lib/utils/cn";

/**
 * The Engineering Notebook's record anatomy.
 *
 * These are server components on purpose. Their entrance is CSS (see
 * `app/motion.css`), their hover and press states are CSS, and none of them
 * hold state — so none of them need to ship, hydrate, or run.
 *
 * Technical revision (see Design.md): rules that bound a thing gain end ticks,
 * media fields are square with crop marks, and every code, index, and figure
 * moves from Space Grotesk caps to Space Mono.
 */

type NotebookPageHeaderProps = {
  /** Replaces the default title presentation on the home Portfolio Page. */
  greeting?: ReactNode;
  introduction?: ReactNode;
  /** Absent on the home Portfolio Page, where the Greeting takes this slot. */
  sectionCode?: string;
  /** Right-aligned sheet stamp, e.g. "Sheet W · 08 records". */
  sheetMeta?: string;
  showRule?: boolean;
  title: string;
};

export function NotebookPageHeader({
  greeting,
  introduction,
  sectionCode,
  sheetMeta,
  showRule = true,
  title,
}: NotebookPageHeaderProps) {
  return (
    <header data-notebook-header className="flex w-full flex-col items-stretch">
      {(sectionCode || sheetMeta) && (
        <div
          style={notebookDelay(notebookTiming.pageIdentity)}
          className="notebook-in-identity mb-4 flex items-baseline gap-6"
        >
          {sectionCode && <p className="code text-annotation">{sectionCode}</p>}
          {/* `ml-auto`, not `justify-between`: the stamp keeps the right edge
           * on the home sheet, which has no section code. */}
          {sheetMeta && (
            <p className="label ml-auto text-ink-muted/75 text-micro">
              {sheetMeta}
            </p>
          )}
        </div>
      )}
      {greeting ? (
        <div
          style={notebookDelay(notebookTiming.pageHeading)}
          data-notebook-title
          className="notebook-in-heading w-full pr-2"
        >
          {greeting}
        </div>
      ) : (
        <h1
          style={notebookDelay(notebookTiming.pageHeading)}
          data-notebook-title
          className="notebook-in-heading w-fit pr-2 font-heading font-semibold text-5xl leading-none tracking-tight lg:text-7xl"
        >
          {title}
        </h1>
      )}
      {introduction && (
        <div
          style={notebookDelay(notebookTiming.pageIntroduction)}
          data-notebook-introduction
          className="notebook-in-introduction mt-5.5 w-full max-w-180 text-ink-muted text-sm"
        >
          {introduction}
        </div>
      )}
      {showRule && (
        <div
          style={notebookDelay(notebookTiming.pageHeaderRule)}
          data-notebook-header-rule
          className="notebook-in-rule rule-ticked relative mt-7.5 h-px w-full origin-left bg-rule"
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
  step = notebookStagger.row,
}: NotebookRecordGroupProps) {
  return (
    <Group
      aria-label={label}
      data-notebook-record-group
      data-notebook-stagger
      style={
        {
          "--notebook-stagger-base": notebookSeconds(base),
          "--notebook-stagger-step": notebookSeconds(step),
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

/** A grid of records. Records are several parts tall, so they stagger on the
 * record step rather than a list's row step. */
export function NotebookCollection({
  children,
  className,
  base,
  step = notebookStagger.record,
}: NotebookCollectionProps) {
  return (
    <NotebookRecordGroup
      base={base}
      step={step}
      className={cn(
        "grid w-full grid-cols-1 gap-x-8 gap-y-15 md:grid-cols-records lg:gap-x-13 lg:gap-y-19",
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

/**
 * The record itself has no entrance. Its rule draws in place and each part
 * settles on its own, so every part travels the same 8px once — a record that
 * also moved would carry its first parts twice as far as its last.
 */
export function NotebookRecord({
  children,
  className,
  partStep = notebookStagger.part,
}: NotebookRecordProps) {
  return (
    <article
      data-notebook-record
      style={
        { "--notebook-part-step": notebookSeconds(partStep) } as CSSProperties
      }
      className={cn(
        "notebook-lift group relative flex min-w-0 flex-col pt-3",
        className,
      )}
    >
      {/* A record is a bounded span, not a separation — so the rule is ticked. */}
      <span
        aria-hidden="true"
        data-notebook-record-rule
        className="notebook-in-rule rule-ticked absolute inset-x-0 top-0 h-px origin-left bg-rule transition-colors duration-fast group-focus-within:bg-ink"
      />
      {children}
    </article>
  );
}

type NotebookIndexProps = {
  children: ReactNode;
  /** Right-hand filename stamp on the same baseline. */
  filename?: string;
};

export function NotebookIndex({ children, filename }: NotebookIndexProps) {
  return (
    <div
      data-entry-part="index"
      className="notebook-in-part mb-3.5 flex items-baseline justify-between gap-4"
    >
      <p className="code text-annotation">{children}</p>
      {filename && (
        <p className="label text-ink-muted/60 text-micro">{filename}</p>
      )}
    </div>
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
   * empty backdrop and renders as flat tint. Fading the field itself
   * composites the already-blurred surface, which is what we want; the wrapper
   * keeps `data-entry-part` so the stagger still supplies `--notebook-delay`,
   * and it inherits down to here. */
  const field = (
    <div
      data-notebook-media-field
      className={cn(
        "notebook-in-part notebook-media-field relative flex aspect-video items-center justify-center overflow-hidden border border-media-field-rule bg-media-field p-7 sm:p-10",
        mediaClassName,
      )}
    >
      {children}
    </div>
  );

  /* Crop marks sit on the wrapper, not the field: they are drawn 5px outside
   * the frame, and the field clips its own overflow. Being outside the field
   * puts them outside its entrance too, so they take their own on the same
   * delay (`notebook-in-marks`) rather than printing before the field. */
  return (
    <div
      data-entry-part="media"
      className="notebook-in-marks crop-marks mb-5.5"
    >
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
      className="notebook-in-part label mt-2.5 text-ink-muted text-label"
    >
      {children}
    </p>
  );
}

export function NotebookAnnotation({ children }: { children: ReactNode }) {
  return (
    <div
      data-entry-part="annotation"
      className="notebook-in-part mt-4 border-rule border-l pl-3.5 text-ink-muted text-sm leading-relaxed"
    >
      {children}
    </div>
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
      className="notebook-in-part mt-5 flex min-h-5 flex-wrap gap-x-3.5 gap-y-1.5"
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
  count,
  delay,
}: {
  children: ReactNode;
  /** Record count, stamped after the heading as [04]. */
  count?: number;
  delay?: number;
}) {
  return (
    <div
      style={delay === undefined ? undefined : notebookDelay(delay)}
      data-notebook-section-heading
      className="notebook-in-part flex items-baseline gap-3.5"
    >
      <h2 className="label text-ink-muted text-label">{children}</h2>
      {count !== undefined && (
        <span className="num text-ink-muted/55 text-micro">
          [{String(count).padStart(2, "0")}]
        </span>
      )}
    </div>
  );
}

type NotebookRecordRowProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
  interactive?: boolean;
};

/**
 * One record row: a hairline rule drawn above row content that settles
 * beneath it. Interactive rows lift their rule to ink on hover and focus.
 *
 * The rule draws in place and only the content settles, the way the page
 * header's rule and every record's rule do. When the whole row settled, its
 * rule dropped 8px while it drew and faded twice over — once on its own and
 * once with the row around it.
 *
 * A row separates rather than bounds, so this rule stays unticked — the ticks
 * belong to the record and the section.
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
      className={cn("group relative flex min-w-0 flex-col", className)}
    >
      <span
        aria-hidden="true"
        data-notebook-record-rule
        className={cn(
          "notebook-in-rule absolute inset-x-0 top-0 h-px origin-left bg-rule transition-colors duration-fast",
          interactive && "group-focus-within:bg-ink group-hover:bg-ink",
        )}
      />
      <div className="notebook-in-part flex min-w-0 flex-col">{children}</div>
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
        "notebook-lift notebook-press origin-left hover:text-ink focus-visible:text-ink",
        className,
      )}
    >
      {children}
    </a>
  );
}

/** Real position of a row within its Portfolio Page records, e.g. A-01. */
export function NotebookRowIndex({ children }: { children: ReactNode }) {
  return (
    <span className="code w-15.5 shrink-0 text-annotation tabular-nums">
      {children}
    </span>
  );
}
