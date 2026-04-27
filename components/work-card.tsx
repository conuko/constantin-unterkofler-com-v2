import Image from "next/image";
import type { WorkEntry } from "@/content/site-content";

type WorkCardProps = {
  entry: WorkEntry;
  priority?: boolean;
};

export function WorkCard({ entry, priority = false }: WorkCardProps) {
  return (
    <article className="group flex flex-col gap-3">
      <a
        href={entry.url}
        target="_blank"
        rel="noreferrer noopener"
        aria-label={`Visit ${entry.client}`}
      >
        <div className="relative overflow-hidden rounded-sm border border-rule">
          <Image
            src={entry.image}
            alt={`${entry.client} project screenshot`}
            placeholder="blur"
            priority={priority}
            fetchPriority={priority ? "high" : undefined}
            sizes="(min-width: 816px) 372px, (min-width: 768px) calc((100vw - 72px) / 2), calc(100vw - 48px)"
            quality={85}
            className="block w-full transition-transform duration-slow ease-default group-hover:scale-[1.02]"
          />

          <div
            className="absolute inset-0 hidden items-center bg-ink/50 p-5 opacity-0 backdrop-blur-md transition-opacity duration-normal ease-default lg:flex lg:group-hover:opacity-100"
            aria-hidden="true"
          >
            <p className="text-sm leading-relaxed text-paper">
              {entry.description}
            </p>
          </div>
        </div>
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
    </article>
  );
}
