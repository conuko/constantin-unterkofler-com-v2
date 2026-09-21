import type { Metadata } from "next";
import { NotebookGreeting } from "@/components/notebook-greeting";
import { PortfolioPage } from "@/components/portfolio-page";
import { SpecificationBlock } from "@/components/specification-block";
import { portfolioContent } from "@/content/site-content";

const home = portfolioContent.pages.home;

export const metadata: Metadata = home.metadata;

export default function Home() {
  return (
    <PortfolioPage
      title={home.title}
      sheetMeta={home.sheetMeta}
      greeting={
        <NotebookGreeting
          greetings={home.content.greetings}
          name={home.title}
        />
      }
      width={home.width}
      introduction={
        <div className="space-y-2">
          <p>
            I build things for the www at{" "}
            <a
              href={home.content.introduction.organization.url}
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-3 hover:text-ink"
            >
              {home.content.introduction.organization.name}
            </a>
            .
          </p>
        </div>
      }
    >
      <SpecificationBlock fields={home.content.specification} />
    </PortfolioPage>
  );
}
