import type { Metadata } from "next";
import { PlayPresentation } from "@/components/play-presentation";
import { PortfolioPage } from "@/components/portfolio-page";
import { portfolioContent } from "@/content/site-content";

const play = portfolioContent.pages.play;

export const metadata: Metadata = play.metadata;

export default function PlayPage() {
  return (
    <PortfolioPage title={play.title}>
      <PlayPresentation entries={play.content.entries} />
    </PortfolioPage>
  );
}
