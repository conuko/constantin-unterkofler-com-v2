import type { Metadata } from "next";
import { FadeIn } from "@/components/fade-in";
import { PageShell } from "@/components/page-shell";
import { StaggerGrid } from "@/components/stagger-grid";
import { WorkCard } from "@/components/work-card";
import { portfolioContent } from "@/content/site-content";

const work = portfolioContent.pages.work;

export const metadata: Metadata = work.metadata;

export default function WorkPage() {
  return (
    <PageShell title={work.title}>
      <FadeIn>
        <p className="max-w-xl text-sm text-ink-muted">
          {work.content.introduction}
        </p>
      </FadeIn>
      <StaggerGrid className="grid grid-cols-1 gap-x-6 gap-y-10 md:grid-cols-2">
        {work.content.entries.map((entry, index) => (
          <WorkCard key={entry.client} entry={entry} priority={index < 4} />
        ))}
      </StaggerGrid>
    </PageShell>
  );
}
