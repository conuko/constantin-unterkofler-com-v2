import type { Metadata } from "next";
import { FadeIn } from "@/components/fade-in";
import { PageShell } from "@/components/page-shell";
import { WorkPresentation } from "@/components/work-presentation";
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
      <WorkPresentation entries={work.content.entries} />
    </PageShell>
  );
}
