"use client";

import { useReducedMotion, type Variants } from "motion/react";
import * as m from "motion/react-m";
import Image from "next/image";
import type { WorkEntry } from "@/content/site-content";

type WorkPresentationProps = {
  entries: WorkEntry[];
};

const easeOutExpo = [0.16, 1, 0.3, 1] as const;

const collectionIn: Variants = {
  hidden: {},
  visible: {
    transition: {
      delayChildren: 0.72,
      staggerChildren: 0.07,
    },
  },
};

const projectIn: Variants = {
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

const projectInteraction = {
  type: "spring",
  visualDuration: 0.3,
  bounce: 0.25,
} as const;

export function WorkPresentation({ entries }: WorkPresentationProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <m.div
      initial={prefersReducedMotion ? false : "hidden"}
      animate="visible"
      variants={collectionIn}
      className="grid grid-cols-1 gap-x-6 gap-y-10 md:grid-cols-2"
    >
      {entries.map((entry, index) => {
        const loadImmediately = index < 4;

        return (
          <m.article
            initial={prefersReducedMotion ? false : undefined}
            key={entry.client}
            variants={projectIn}
            whileHover={prefersReducedMotion ? undefined : { y: -4 }}
            transition={projectInteraction}
            className="group flex flex-col gap-3"
          >
            <a
              href={entry.url}
              target="_blank"
              rel="noreferrer noopener"
              aria-label={`Visit ${entry.client}`}
            >
              <m.div
                className="relative overflow-hidden rounded-sm border border-rule"
                whileHover={prefersReducedMotion ? undefined : { scale: 1.02 }}
                transition={projectInteraction}
              >
                <Image
                  src={entry.image.src}
                  alt={entry.image.alt}
                  placeholder="blur"
                  preload={loadImmediately}
                  fetchPriority={loadImmediately ? "high" : undefined}
                  sizes="(min-width: 816px) 372px, (min-width: 768px) calc((100vw - 72px) / 2), calc(100vw - 48px)"
                  quality={85}
                  className="block w-full"
                />

                <div
                  className="absolute inset-0 hidden items-center bg-ink/50 p-5 opacity-0 backdrop-blur-md transition-opacity duration-normal ease-default lg:flex lg:group-hover:opacity-100"
                  aria-hidden="true"
                >
                  <p className="text-sm leading-relaxed text-paper">
                    {entry.description}
                  </p>
                </div>
              </m.div>
            </a>

            <div className="flex flex-col gap-1.5">
              <h2 className="font-heading text-xl leading-tight font-semibold">
                {entry.client}
              </h2>
              <div className="flex flex-wrap gap-1.5">
                {entry.techStack.map((technology) => (
                  <span
                    key={technology}
                    className="rounded-full border border-rule px-2 py-0.5 text-xs text-ink-muted"
                  >
                    {technology}
                  </span>
                ))}
              </div>
            </div>

            <p className="text-sm leading-relaxed text-ink-muted lg:hidden">
              {entry.description}
            </p>
          </m.article>
        );
      })}
    </m.div>
  );
}
