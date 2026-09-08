import { Star } from "lucide-react";
import Image from "next/image";
import {
  NotebookAnnotation,
  NotebookCollection,
  NotebookIndex,
  NotebookMedia,
  NotebookMetadata,
  NotebookRecord,
  NotebookTitle,
} from "@/components/notebook-primitives";
import type { BookEntry } from "@/content/site-content";

type ReadPresentationProps = {
  entries: BookEntry[];
};

const readGroupStep = 0.075;
const readRecordPartStep = 0.042;

const ratingPositions = [1, 2, 3, 4, 5] as const;

function formatCompletionMonth(completedAt: BookEntry["completedAt"]) {
  const [year, month] = completedAt.split("-");
  return `${month}/${year}`;
}

export function ReadPresentation({ entries }: ReadPresentationProps) {
  return (
    <NotebookCollection step={readGroupStep} className="mx-auto max-w-4xl">
      {entries.map((entry, index) => {
        const loadImmediately = index < 2;

        return (
          <NotebookRecord key={entry.title} partStep={readRecordPartStep}>
            <NotebookIndex>{`R–${String(index + 1).padStart(2, "0")}`}</NotebookIndex>
            <NotebookMedia mediaClassName="aspect-2/3 p-0 sm:p-0">
              <Image
                src={entry.cover.src}
                alt={entry.cover.alt}
                placeholder="blur"
                loading={loadImmediately ? "eager" : "lazy"}
                fetchPriority={loadImmediately ? "high" : undefined}
                fill
                sizes="(min-width: 1024px) 424px, (min-width: 768px) calc((100vw - 80px) / 2), calc(100vw - 48px)"
                quality={85}
                className="object-cover"
              />
            </NotebookMedia>
            <NotebookTitle>{entry.title}</NotebookTitle>
            <NotebookMetadata>{entry.author}</NotebookMetadata>
            <NotebookAnnotation>
              <dl className="flex flex-col gap-1">
                <div className="flex items-baseline gap-3">
                  <dt className="label w-18 shrink-0 text-micro">Completed</dt>
                  <dd>{formatCompletionMonth(entry.completedAt)}</dd>
                </div>
                <div className="flex items-center gap-3">
                  <dt className="label w-18 shrink-0 text-micro">
                    Personal rating
                  </dt>
                  <dd className="flex items-center">
                    <span
                      aria-hidden="true"
                      className="flex gap-1 text-base leading-none"
                    >
                      {ratingPositions.map((position) => {
                        const filled = position <= entry.personalRating;

                        return (
                          <Star
                            key={position}
                            data-rating-star
                            data-filled={filled}
                            aria-hidden="true"
                            fill={filled ? "currentColor" : "none"}
                            size={16}
                            strokeWidth={1.5}
                            className={filled ? "text-ink" : "text-rule"}
                          />
                        );
                      })}
                    </span>
                    <span className="sr-only">
                      {entry.personalRating} out of 5
                    </span>
                  </dd>
                </div>
              </dl>
            </NotebookAnnotation>
          </NotebookRecord>
        );
      })}
    </NotebookCollection>
  );
}
