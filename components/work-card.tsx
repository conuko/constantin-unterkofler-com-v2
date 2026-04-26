import type { WorkEntry } from "@/content/site-content";

type WorkCardProps = {
  entry: WorkEntry;
};

export function WorkCard({ entry }: WorkCardProps) {
  return (
    <article className="group flex flex-col gap-3">
      <a
        href={entry.url}
        target="_blank"
        rel="noreferrer noopener"
        aria-label={`Visit ${entry.client}`}
      >
        <div className="relative aspect-3/2 overflow-hidden rounded-sm border border-rule bg-card-glass">
          <div className="flex h-full items-center justify-center">
            <span className="font-heading text-3xl font-semibold tracking-tight">
              {entry.client}
            </span>
          </div>

          <div
            className="absolute inset-0 flex items-end bg-linear-to-t from-ink/90 via-ink/60 to-ink/10 p-5 opacity-0 backdrop-blur-sm transition-opacity duration-normal ease-default group-hover:opacity-100"
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

      <span className="sr-only">{entry.description}</span>
    </article>
  );
}
