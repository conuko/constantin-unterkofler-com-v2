"use client";

import * as m from "motion/react-m";
import Image from "next/image";
import type { WorkEntry } from "@/content/site-content";
import { gridCardIn, springSnappy } from "@/lib/motion";

type WorkCardProps = {
  entry: WorkEntry;
  priority?: boolean;
};

export function WorkCard({ entry, priority = false }: WorkCardProps) {
  return (
    <m.article
      variants={gridCardIn}
      whileHover={{ y: -4 }}
      transition={springSnappy}
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
          whileHover={{ scale: 1.02 }}
          transition={springSnappy}
        >
          <Image
            src={entry.image.src}
            alt={entry.image.alt}
            placeholder="blur"
            priority={priority}
            fetchPriority={priority ? "high" : undefined}
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
          {entry.techStack.map((tech) => (
            <span
              key={tech}
              className="rounded-full border border-rule px-2 py-0.5 text-xs text-ink-muted"
            >
              {tech}
            </span>
          ))}
        </div>
      </div>

      <p className="text-sm leading-relaxed text-ink-muted lg:hidden">
        {entry.description}
      </p>
    </m.article>
  );
}
