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
      width={about.width}
      introduction={
        <p className="text-sm text-ink-muted">{about.content.introduction}</p>
      }
    >
      <Cv sections={about.content.cvSections} />
    </PortfolioPage>
  );
}
