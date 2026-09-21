import Image from "next/image";
import {
  NotebookAnnotation,
  NotebookCollection,
  NotebookIndex,
  NotebookMedia,
  NotebookMetadata,
  NotebookRecord,
  NotebookTag,
  NotebookTags,
  NotebookTitle,
} from "@/components/notebook-primitives";
import type { WorkEntry, WorkMark } from "@/content/site-content";
import { cn } from "@/lib/utils/cn";

type WorkPresentationProps = {
  entries: WorkEntry[];
};

const workGroupStep = 0.08;
const workRecordPartStep = 0.045;

/**
 * How one mark is drawn inside the media field.
 *
 * `sizeClassName` is tuned per mark, because wordmarks of different
 * proportions only read at the same optical weight at different widths.
 *
 * The two optional fields are the mark's answer to the dark theme, and a mark
 * names at most one of them:
 *
 * - `darkClassName` re-inks a single-colour mark with a filter.
 * - `darkSrc` names a separate cut, for a mark carrying a brand colour a
 *   filter would destroy — SCAYLE's wordmark has to invert while its green
 *   accent stays green.
 *
 * A mark that survives the inversion as drawn names neither.
 */
type MarkRendering = {
  sizeClassName: string;
  darkClassName?: string;
  darkSrc?: WorkMark["src"];
};

const markRendering: Record<WorkMark["src"], MarkRendering> = {
  "/marks/levi.svg": { sizeClassName: "w-21/50 max-w-44" },
  "/marks/harrods.svg": {
    sizeClassName: "w-11/20 max-w-48",
    darkClassName: "dark:brightness-0 dark:invert",
  },
  "/marks/fielmann.svg": {
    sizeClassName: "w-12/25 max-w-44",
    darkClassName: "dark:brightness-0 dark:invert",
  },
  "/marks/scayle.svg": {
    sizeClassName: "w-41/50 max-w-40",
    darkSrc: "/marks/scayle-dark.svg",
  },
  "/marks/about-you.svg": { sizeClassName: "w-41/50 max-w-40" },
  "/marks/fifa.svg": { sizeClassName: "w-2/5 max-w-40" },
  "/marks/tennet.svg": { sizeClassName: "w-29/50 max-w-56" },
  "/marks/fussball-de.svg": { sizeClassName: "w-11/50 max-w-24" },
};

/* One mark occupies half a record's media field on the two-column grid, and
 * the whole of it below that. */
const markSizes =
  "(min-width: 1152px) 516px, (min-width: 1024px) calc((100vw - 96px) / 2), (min-width: 768px) calc((100vw - 80px) / 2), calc(100vw - 48px)";

type MarkVariant = {
  src: WorkMark["src"];
  className: string | undefined;
};

/**
 * The images one mark renders as: one, or — for a mark with its own dark cut —
 * a light and a dark element of which the theme shows exactly one.
 *
 * The pair has to be two elements rather than one swapped `src`: the theme
 * here is a class on `<html>`, not `prefers-color-scheme`, and an external SVG
 * loaded through `<img>` can read neither. Both cuts are therefore fetched
 * (3.5KB each) and CSS hides one.
 */
function markVariants({ src }: WorkMark): MarkVariant[] {
  const { sizeClassName, darkClassName, darkSrc } = markRendering[src];

  if (!darkSrc) return [{ src, className: cn(sizeClassName, darkClassName) }];

  return [
    { src, className: cn(sizeClassName, "dark:hidden") },
    { src: darkSrc, className: cn(sizeClassName, "hidden dark:block") },
  ];
}

function WorkMarks({
  marks,
  loadImmediately,
}: {
  marks: WorkMark[];
  loadImmediately: boolean;
}) {
  return (
    <div
      className={
        marks.length > 1
          ? "grid h-full w-full grid-cols-2 items-center divide-x divide-rule"
          : "flex h-full w-full items-center justify-center"
      }
    >
      {marks.map((mark) => (
        <div
          key={mark.src}
          className="flex h-full w-full min-w-0 items-center justify-center px-3 sm:px-6"
        >
          {markVariants(mark).map((variant) => (
            <Image
              key={variant.src}
              src={variant.src}
              alt={mark.alt}
              width={mark.width}
              height={mark.height}
              loading={loadImmediately ? "eager" : "lazy"}
              fetchPriority={loadImmediately ? "high" : undefined}
              sizes={markSizes}
              unoptimized
              className={cn("h-auto object-contain", variant.className)}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

export function WorkPresentation({ entries }: WorkPresentationProps) {
  return (
    <NotebookCollection step={workGroupStep}>
      {entries.map((entry, index) => {
        const loadImmediately = index < 2;

        return (
          <NotebookRecord key={entry.client} partStep={workRecordPartStep}>
            <NotebookIndex
              filename={entry.marks.map((mark) => mark.filename).join(" + ")}
            >
              {`W–${String(index + 1).padStart(2, "0")}`}
            </NotebookIndex>
            <NotebookMedia
              mediaClassName="border-rule bg-card-glass backdrop-blur-glass"
              link={
                entry.url
                  ? {
                      href: entry.url,
                      label: `View ${entry.client} project`,
                    }
                  : undefined
              }
            >
              <WorkMarks
                marks={entry.marks}
                loadImmediately={loadImmediately}
              />
            </NotebookMedia>
            <NotebookTitle>{entry.client}</NotebookTitle>
            <NotebookMetadata>{entry.primaryMetadata}</NotebookMetadata>
            <NotebookAnnotation>
              <p>{entry.description}</p>
              {entry.descriptionReview === "owner" && (
                <p className="label mt-3 inline-flex border border-rule bg-card-glass px-2 py-1 text-ink text-micro backdrop-blur-glass">
                  Draft description · Owner editorial review
                </p>
              )}
            </NotebookAnnotation>
            <NotebookTags label={`${entry.client} technologies`}>
              {entry.techStack.map((technology) => (
                <NotebookTag key={technology}>{technology}</NotebookTag>
              ))}
            </NotebookTags>
          </NotebookRecord>
        );
      })}
    </NotebookCollection>
  );
}
