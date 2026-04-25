import type { Metadata } from "next";
import { PageShell } from "@/components/page-shell";
import { ReadingSlipCard } from "@/components/reading-slip-card";
import { bookEntries, pageCopy } from "@/content/site-content";

export const metadata: Metadata = {
  title: "Read",
  description: pageCopy.read.metaDescription,
};

export default function ReadPage() {
  return (
    <PageShell title={pageCopy.read.title} isNarrow>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-5">
        {bookEntries.map((entry, index) => (
          <ReadingSlipCard
            key={`${entry.title}-${entry.author}`}
            entry={entry}
            number={index + 1}
          />
        ))}
      </div>
    </PageShell>
  );
}
