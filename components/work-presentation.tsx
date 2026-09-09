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

type WorkPresentationProps = {
  entries: WorkEntry[];
};

const workGroupStep = 0.08;
const workRecordPartStep = 0.045;

const markSizeClasses: Record<WorkMark["src"], string> = {
  "/marks/levi.svg": "w-21/50 max-w-44",
  "/marks/harrods.svg": "w-11/20 max-w-48",
  "/marks/fielmann.svg": "w-12/25 max-w-44",
  "/marks/scayle.svg": "w-41/50 max-w-40",
  "/marks/about-you.svg": "w-41/50 max-w-40",
  "/marks/fifa.svg": "w-2/5 max-w-40",
  "/marks/tennet.svg": "w-29/50 max-w-56",
  "/marks/fussball-de.svg": "w-11/50 max-w-24",
};

const markThemeClasses: Partial<Record<WorkMark["src"], string>> = {
  "/marks/harrods.svg": "dark:brightness-0 dark:invert",
  "/marks/fielmann.svg": "dark:brightness-0 dark:invert",
};

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
            <Image
              src={mark.src}
              alt={mark.alt}
              width={mark.width}
              height={mark.height}
              loading={loadImmediately ? "eager" : "lazy"}
              fetchPriority={loadImmediately ? "high" : undefined}
              sizes="(min-width: 1152px) 516px, (min-width: 1024px) calc((100vw - 96px) / 2), (min-width: 768px) calc((100vw - 80px) / 2), calc(100vw - 48px)"
              unoptimized
              className={`h-auto object-contain ${markSizeClasses[mark.src]} ${mark.src === "/marks/scayle.svg" ? "dark:hidden" : (markThemeClasses[mark.src] ?? "")}`}
            />
            {mark.src === "/marks/scayle.svg" && (
              <Image
                src="/marks/scayle-dark.svg"
                alt=""
                width={mark.width}
                height={mark.height}
                loading={loadImmediately ? "eager" : "lazy"}
                fetchPriority={loadImmediately ? "high" : undefined}
                sizes="(min-width: 1152px) 516px, (min-width: 1024px) calc((100vw - 96px) / 2), (min-width: 768px) calc((100vw - 80px) / 2), calc(100vw - 48px)"
                unoptimized
                className={`hidden h-auto object-contain dark:block ${markSizeClasses[mark.src]}`}
              />
            )}
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
            <NotebookIndex>{`W–${String(index + 1).padStart(2, "0")}`}</NotebookIndex>
            <NotebookMedia
              mediaClassName="rounded-xl border-rule bg-card-glass shadow-sm backdrop-blur-glass"
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
                <p className="label mt-3 inline-flex border border-rule bg-card-glass px-2 py-1 text-ink text-micro backdrop-blur-sm">
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
