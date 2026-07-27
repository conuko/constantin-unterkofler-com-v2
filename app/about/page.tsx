import type { Metadata } from "next";
import { Cv } from "@/components/cv";
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
      <Cv sections={about.content.cvSections} />
    </PageShell>
  );
}
