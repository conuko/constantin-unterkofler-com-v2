import type { Metadata } from "next";
import { MusicCard } from "@/components/music-card";
import { PageShell } from "@/components/page-shell";
import { pageCopy, trackEntries } from "@/content/site-content";

export const metadata: Metadata = {
  title: "Play",
  description: pageCopy.play.metaDescription,
};

export default function PlayPage() {
  return (
    <PageShell title={pageCopy.play.title}>
      <div className="grid w-full grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-10">
        {trackEntries.map((entry, index) => (
          <MusicCard
            key={`${entry.title}-${entry.artist}`}
            entry={entry}
            index={index}
            priority={index < 2}
          />
        ))}
      </div>
    </PageShell>
  );
}
