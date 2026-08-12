import type { Metadata } from "next";
import { PageShell } from "@/components/page-shell";
import { PlayPresentation } from "@/components/play-presentation";
import { portfolioContent } from "@/content/site-content";

const play = portfolioContent.pages.play;

export const metadata: Metadata = play.metadata;

export default function PlayPage() {
  return (
    <PageShell title={play.title}>
      <PlayPresentation entries={play.content.entries} />
    </PageShell>
  );
}
