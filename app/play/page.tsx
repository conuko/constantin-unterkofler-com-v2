import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PlayPresentation } from "@/components/play-presentation";
import { PortfolioPage } from "@/components/portfolio-page";
import { portfolioContent } from "@/content/site-content";

const play = portfolioContent.pages.play;

export const metadata: Metadata = play.metadata;

export default function PlayPage() {
  if (play.publicationStatus === "unpublished") notFound();

  return (
    <PortfolioPage
      title={play.title}
      sectionCode={play.sectionCode}
      width={play.width}
      introduction={<p>{play.content.introduction}</p>}
    >
      <PlayPresentation entries={play.content.entries} />
    </PortfolioPage>
  );
}
