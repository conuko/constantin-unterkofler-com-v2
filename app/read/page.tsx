import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PortfolioPage } from "@/components/portfolio-page";
import { ReadPresentation } from "@/components/read-presentation";
import { portfolioContent } from "@/content/site-content";

const read = portfolioContent.pages.read;

export const metadata: Metadata = read.metadata;

export default function ReadPage() {
  if (read.publicationStatus === "unpublished") notFound();

  return (
    <PortfolioPage
      title={read.title}
      sectionCode={read.sectionCode}
      width={read.width}
      introduction={<p>{read.content.introduction}</p>}
    >
      <ReadPresentation entries={read.content.entries} />
    </PortfolioPage>
  );
}
