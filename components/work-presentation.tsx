"use client";

import type { Variants } from "motion/react";
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

const workGroupSequence: Variants = {
  hidden: {},
  visible: {
    transition: {
      delayChildren: 0.08,
      staggerChildren: 0.08,
    },
  },
};

const workRecordSequence = {
  delayChildren: 0.04,
  staggerChildren: 0.045,
};

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
            sizes="(min-width: 1152px) 456px, (min-width: 768px) calc((100vw - 96px) / 2), calc(100vw - 48px)"
            unoptimized
            className={`h-auto object-contain ${markSizeClasses[mark.src]}`}
          />
        </div>
      ))}
    </div>
  );
}

export function WorkPresentation({ entries }: WorkPresentationProps) {
  return (
    <NotebookCollection variants={workGroupSequence}>
      {entries.map((entry, index) => {
        const loadImmediately = index < 2;

        return (
          <NotebookRecord key={entry.client} sequence={workRecordSequence}>
            <NotebookIndex>{`W–${String(index + 1).padStart(2, "0")}`}</NotebookIndex>
            <NotebookMedia
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
                <p className="label mt-3 inline-flex border border-rule bg-card-glass px-2 py-1 text-micro text-ink backdrop-blur-sm">
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
