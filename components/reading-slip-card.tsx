import type { BookEntry } from "@/content/site-content";

type ReadingSlipCardProps = {
  entry: BookEntry;
  number: number;
};

export function ReadingSlipCard({ entry, number }: ReadingSlipCardProps) {
  return (
    <article className="flex min-h-full flex-col gap-3.5 border border-card-stroke bg-card-glass p-4 backdrop-blur-sm">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold">
          {String(number).padStart(2, "0")}
        </p>
        <p className="label">Read</p>
      </div>

      <h2 className="font-heading text-3xl leading-none font-semibold">
        {entry.title}
      </h2>
      <p className="text-ink-muted">{entry.author}</p>
      <p className="text-ink-muted">{entry.tag}</p>

      <div className="mt-auto flex flex-wrap gap-2.5 gap-x-4 pt-1.5">
        <a
          href={entry.goodreadsUrl}
          target="_blank"
          rel="noreferrer noopener"
          className="label underline-static"
        >
          Goodreads
        </a>
      </div>
    </article>
  );
}
