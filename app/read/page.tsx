import type { Metadata } from "next";
import { PortfolioPage } from "@/components/portfolio-page";
import { ReadPresentation } from "@/components/read-presentation";
import { portfolioContent } from "@/content/site-content";

const read = portfolioContent.pages.read;

export const metadata: Metadata = read.metadata;

export default function ReadPage() {
  return (
    <PortfolioPage
      title={read.title}
      sectionCode="R"
      width="collection"
      introduction={<p>{read.content.introduction}</p>}
    >
      <ReadPresentation entries={read.content.entries} />
    </PortfolioPage>
  );
}
