import type { Metadata } from "next";
import { CvList } from "@/components/cv-list";
import { FadeIn } from "@/components/fade-in";
import { PageShell } from "@/components/page-shell";
import { portfolioContent } from "@/content/site-content";

const about = portfolioContent.pages.about;

export const metadata: Metadata = about.metadata;

export default function AboutPage() {
  return (
    <PageShell title={about.title} isNarrow>
      <FadeIn>
        <p className="text-sm text-ink-muted">{about.content.introduction}</p>
      </FadeIn>
      {about.content.cvSections.map((section) => (
        <CvList
          key={section.title}
          entries={section.entries}
          title={section.title}
        />
      ))}
    </PageShell>
  );
}
