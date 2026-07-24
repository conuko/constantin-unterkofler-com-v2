import type { Metadata } from "next";
import { FadeIn } from "@/components/fade-in";
import { PageShell } from "@/components/page-shell";
import { portfolioContent } from "@/content/site-content";

const home = portfolioContent.pages.home;

export const metadata: Metadata = home.metadata;

export default function Home() {
  return (
    <PageShell title={home.title}>
      <FadeIn>
        <p className="text-sm text-ink-muted text-center">
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
      </FadeIn>
    </PageShell>
  );
}
