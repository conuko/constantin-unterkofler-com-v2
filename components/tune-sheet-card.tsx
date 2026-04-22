import type { TrackEntry } from "@/content/site-content";

type TuneSheetCardProps = {
  entry: TrackEntry;
  number: number;
};

export function TuneSheetCard({ entry, number }: TuneSheetCardProps) {
  return (
    <article className="flex min-h-full flex-col gap-3.5 border border-card-stroke bg-card-glass p-4 backdrop-blur-sm">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold">
          {String(number).padStart(2, "0")}
        </p>
        <p className="label">Play</p>
      </div>

      <div className="flex flex-col gap-1">
        <h2 className="font-heading text-3xl leading-none font-semibold">
          {entry.title}
        </h2>
        <p className="uppercase tracking-widest">{entry.artist}</p>
      </div>

      <div aria-hidden="true" className="staff-lines" />

      <p className="text-ink-muted">{entry.tag}</p>

      <div className="mt-auto flex flex-wrap gap-2.5 gap-x-4 pt-1.5">
        <a
          href={entry.spotifyUrl}
          target="_blank"
          rel="noreferrer noopener"
          className="label underline-static"
        >
          Spotify
        </a>
        <a
          href={entry.appleMusicUrl}
          target="_blank"
          rel="noreferrer noopener"
          className="label underline-static"
        >
          Apple Music
        </a>
      </div>
    </article>
  );
}
