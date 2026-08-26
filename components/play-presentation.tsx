"use client";

import { stagger, type Variants } from "motion/react";
import Image from "next/image";
import { AppleMusicIcon, SpotifyIcon } from "@/components/icons";
import {
  NotebookAction,
  NotebookActions,
  NotebookAnnotation,
  NotebookCollection,
  NotebookIndex,
  NotebookMedia,
  NotebookMetadata,
  NotebookRecord,
  NotebookTitle,
} from "@/components/notebook-primitives";
import type { TrackEntry } from "@/content/site-content";

type PlayPresentationProps = {
  entries: TrackEntry[];
};

const playGroupSequence: Variants = {
  hidden: {},
  visible: {
    transition: {
      delayChildren: stagger(0.07),
    },
  },
};

const playRecordSequence = {
  delayChildren: 0,
  staggerChildren: 0.04,
};

export function PlayPresentation({ entries }: PlayPresentationProps) {
  return (
    <NotebookCollection variants={playGroupSequence}>
      {entries.map((entry, index) => {
        const loadImmediately = index < 2;

        return (
          <NotebookRecord
            key={`${entry.title}-${entry.artist}`}
            sequence={playRecordSequence}
          >
            <NotebookIndex>{`P–${String(index + 1).padStart(2, "0")}`}</NotebookIndex>
            <NotebookMedia mediaClassName="aspect-square p-0 sm:p-0">
              <Image
                src={entry.cover.src}
                alt={entry.cover.alt}
                placeholder="blur"
                loading={loadImmediately ? "eager" : "lazy"}
                fetchPriority={loadImmediately ? "high" : undefined}
                fill
                sizes="(min-width: 1128px) 516px, (min-width: 1024px) calc((100vw - 96px) / 2), (min-width: 768px) calc((100vw - 80px) / 2), calc(100vw - 48px)"
                quality={85}
                className="object-cover"
              />
            </NotebookMedia>
            <NotebookTitle>{entry.title}</NotebookTitle>
            <NotebookMetadata>{entry.artist}</NotebookMetadata>
            <NotebookAnnotation>
              <dl className="flex flex-col gap-1">
                <div className="flex gap-3">
                  <dt className="label w-8 shrink-0 text-micro">Album</dt>
                  <dd className="min-w-0">{entry.album}</dd>
                </div>
                <div className="flex gap-3">
                  <dt className="label w-8 shrink-0 text-micro">Key</dt>
                  <dd>{entry.musicalKey}</dd>
                </div>
              </dl>
            </NotebookAnnotation>
            <NotebookActions label={`Listen to ${entry.title}`}>
              <NotebookAction
                href={entry.spotifyUrl}
                label={`Listen to ${entry.title} on Spotify`}
                className="hover:text-brand-spotify"
              >
                <SpotifyIcon aria-hidden="true" className="size-4" />
                <span>Spotify</span>
              </NotebookAction>
              <NotebookAction
                href={entry.appleMusicUrl}
                label={`Listen to ${entry.title} on Apple Music`}
                className="hover:text-brand-apple-music"
              >
                <AppleMusicIcon aria-hidden="true" className="size-4" />
                <span>Apple Music</span>
              </NotebookAction>
            </NotebookActions>
          </NotebookRecord>
        );
      })}
    </NotebookCollection>
  );
}
