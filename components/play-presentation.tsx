"use client";

import type { Variants } from "motion/react";
import * as m from "motion/react-m";
import Image from "next/image";
import { AppleMusicIcon, SpotifyIcon } from "@/components/icons";
import type { TrackEntry } from "@/content/site-content";

type PlayPresentationProps = {
  entries: TrackEntry[];
};

const easeOutExpo = [0.16, 1, 0.3, 1] as const;

const collectionIn: Variants = {
  hidden: {},
  visible: {
    transition: {
      delayChildren: 0.6,
      staggerChildren: 0.07,
    },
  },
};

const trackIn: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.6,
      ease: easeOutExpo,
    },
  },
};

const trackInteraction = {
  type: "spring",
  visualDuration: 0.3,
  bounce: 0.25,
} as const;

export function PlayPresentation({ entries }: PlayPresentationProps) {
  return (
    <m.div
      initial="hidden"
      animate="visible"
      variants={collectionIn}
      className="grid w-full grid-cols-1 gap-x-6 gap-y-10 md:grid-cols-2"
    >
      {entries.map((entry, index) => {
        const hasHighFetchPriority = index < 2;

        return (
          <m.article
            key={`${entry.title}-${entry.artist}`}
            variants={trackIn}
            whileHover={{ y: -3 }}
            transition={trackInteraction}
            className="flex flex-col gap-3"
          >
            <m.div
              className="relative aspect-square overflow-hidden rounded-sm"
              whileHover={{ scale: 1.03 }}
              transition={trackInteraction}
            >
              <Image
                src={entry.cover.src}
                alt={entry.cover.alt}
                placeholder="blur"
                fetchPriority={hasHighFetchPriority ? "high" : undefined}
                fill
                sizes="(min-width: 816px) 372px, (min-width: 768px) calc((100vw - 72px) / 2), calc(100vw - 48px)"
                quality={85}
                className="object-cover"
              />
            </m.div>

            <div className="flex flex-col gap-1.5">
              <div className="flex items-baseline justify-between gap-2">
                <h2 className="font-heading text-xl leading-tight font-semibold">
                  {entry.title}
                </h2>
                <span className="shrink-0 text-xs tracking-wide text-ink-muted">
                  {entry.musicalKey}
                </span>
              </div>

              <p className="text-sm text-ink-muted">{entry.artist}</p>
              <p className="text-xs text-ink-muted">{entry.album}</p>
            </div>

            <div className="flex gap-3">
              <a
                href={entry.spotifyUrl}
                target="_blank"
                rel="noreferrer noopener"
                aria-label={`Listen to ${entry.title} on Spotify`}
                className="text-ink-muted transition-colors duration-fast hover:text-brand-spotify"
              >
                <SpotifyIcon className="size-6" />
              </a>
              <a
                href={entry.appleMusicUrl}
                target="_blank"
                rel="noreferrer noopener"
                aria-label={`Listen to ${entry.title} on Apple Music`}
                className="text-ink-muted transition-colors duration-fast hover:text-brand-apple-music"
              >
                <AppleMusicIcon className="size-6" />
              </a>
            </div>
          </m.article>
        );
      })}
    </m.div>
  );
}
