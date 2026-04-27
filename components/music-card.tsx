"use client";

import * as m from "motion/react-m";
import Image from "next/image";
import { AppleMusicIcon, SpotifyIcon } from "@/components/icons";
import type { TrackEntry } from "@/content/site-content";
import { fadeInUpStaggered, springSnappy, viewportOnce } from "@/lib/motion";

type MusicCardProps = {
  entry: TrackEntry;
  index?: number;
  priority?: boolean;
};

export function MusicCard({
  entry,
  index = 0,
  priority = false,
}: MusicCardProps) {
  return (
    <m.article
      custom={index}
      variants={fadeInUpStaggered}
      initial="hidden"
      whileInView="visible"
      viewport={viewportOnce}
      whileHover={{ y: -3 }}
      transition={springSnappy}
      className="flex flex-col gap-3"
    >
      <m.div
        className="relative aspect-square overflow-hidden rounded-sm"
        whileHover={{ scale: 1.03 }}
        transition={springSnappy}
      >
        <Image
          src={entry.cover}
          alt={`${entry.album} by ${entry.artist}`}
          placeholder="blur"
          priority={priority}
          fetchPriority={priority ? "high" : undefined}
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
}
