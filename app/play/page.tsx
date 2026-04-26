import type { Metadata } from "next";
import { PageShell } from "@/components/page-shell";
import { MusicCard } from "@/components/music-card";
import { pageCopy, trackEntries } from "@/content/site-content";

export const metadata: Metadata = {
  title: "Play",
  description: pageCopy.play.metaDescription,
};

export default function PlayPage() {
  return (
    <PageShell title={pageCopy.play.title}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-10">
        {trackEntries.map((entry, index) => (
          <MusicCard
            key={`${entry.title}-${entry.artist}`}
            entry={entry}
            priority={index < 2}
          />
        ))}
      </div>
    </PageShell>
  );
}
