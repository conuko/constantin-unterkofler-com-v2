import type { Metadata } from "next";
import { MusicCard } from "@/components/music-card";
import { PageShell } from "@/components/page-shell";
import { StaggerGrid } from "@/components/stagger-grid";
import { portfolioContent } from "@/content/site-content";

const play = portfolioContent.pages.play;

export const metadata: Metadata = play.metadata;

export default function PlayPage() {
  return (
    <PageShell title={play.title}>
      <StaggerGrid className="grid w-full grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-10">
        {play.content.entries.map((entry, index) => (
          <MusicCard
            key={`${entry.title}-${entry.artist}`}
            entry={entry}
            priority={index < 2}
          />
        ))}
      </StaggerGrid>
    </PageShell>
  );
}
