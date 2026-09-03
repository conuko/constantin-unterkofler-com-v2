import type { Metadata } from "next";
import { PortfolioPage } from "@/components/portfolio-page";
import { portfolioContent } from "@/content/site-content";

const home = portfolioContent.pages.home;

export const metadata: Metadata = home.metadata;

export default function Home() {
  return (
    <PortfolioPage
      title={home.title}
      sectionCode={home.sectionCode}
      showHeaderRule={false}
      width={home.width}
      introduction={
        <div className="space-y-2">
          <p>
            Hi, I'm a {home.content.introduction.role} at{" "}
            <a
              href={home.content.introduction.organization.url}
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-ink"
            >
              {home.content.introduction.organization.name}
            </a>
            .
          </p>
        </div>
      }
    />
  );
}
