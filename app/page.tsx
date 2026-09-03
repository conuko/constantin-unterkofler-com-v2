import type { Metadata } from "next";
import Link from "next/link";
import { PortfolioPage } from "@/components/portfolio-page";
import { portfolioContent } from "@/content/site-content";

const home = portfolioContent.pages.home;

export const metadata: Metadata = home.metadata;

export default function Home() {
  return (
    <PortfolioPage
      title={home.title}
      sectionCode={home.sectionCode}
      width={home.width}
      introduction={
        <div className="space-y-2">
          <p>
            {home.content.introduction.role} at{" "}
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
          <p>{home.content.positioningStatement}</p>
        </div>
      }
    >
      <nav aria-label="Home contents">
        <ol className="border-t border-rule">
          {home.content.contents.map((pageName, index) => {
            const page = portfolioContent.pages[pageName];

            return (
              <li key={page.route} className="border-b border-rule">
                <Link
                  href={page.route}
                  className="group flex items-center justify-between gap-4 py-4 text-sm"
                >
                  <span className="label text-label text-ink-muted">
                    {`H–${String(index + 1).padStart(2, "0")}`}
                  </span>
                  <span className="font-heading text-2xl leading-none group-hover:underline">
                    {page.primaryWayfinding.label}
                  </span>
                </Link>
              </li>
            );
          })}
        </ol>
      </nav>
    </PortfolioPage>
  );
}
