import type { Metadata } from "next";
import { PageShell } from "@/components/page-shell";
import { TuneSheetCard } from "@/components/tune-sheet-card";
import { pageCopy, trackEntries } from "@/content/site-content";

export const metadata: Metadata = {
  title: "Play",
  description: pageCopy.play.metaDescription,
};

export default function PlayPage() {
  return (
    <PageShell title={pageCopy.play.title} intro={pageCopy.play.intro}>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-5">
        {trackEntries.map((entry, index) => (
          <TuneSheetCard
            key={`${entry.title}-${entry.artist}`}
            entry={entry}
            number={index + 1}
          />
        ))}
      </div>
    </PageShell>
  );
}
