import type { Metadata } from "next";
import { Cv } from "@/components/cv";
import { PortfolioPage } from "@/components/portfolio-page";
import { portfolioContent } from "@/content/site-content";

const about = portfolioContent.pages.about;

export const metadata: Metadata = about.metadata;

export default function AboutPage() {
  return (
    <PortfolioPage
      title={about.title}
      sectionCode={about.sectionCode}
      sheetMeta={about.sheetMeta}
      width={about.width}
      introduction={<p>{about.content.introduction}</p>}
    >
      <Cv sectionCode={about.sectionCode} sections={about.content.cvSections} />
    </PortfolioPage>
  );
}
