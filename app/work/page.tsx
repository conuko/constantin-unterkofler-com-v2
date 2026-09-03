import type { Metadata } from "next";
import { PortfolioPage } from "@/components/portfolio-page";
import { WorkPresentation } from "@/components/work-presentation";
import { portfolioContent } from "@/content/site-content";

const work = portfolioContent.pages.work;

export const metadata: Metadata = work.metadata;

export default function WorkPage() {
  return (
    <PortfolioPage
      title={work.title}
      sectionCode={work.sectionCode}
      width={work.width}
      introduction={<p>{work.content.introduction}</p>}
    >
      <WorkPresentation entries={work.content.entries} />
    </PortfolioPage>
  );
}
