import type { Metadata } from "next";
import { CvList } from "@/components/cv-list";
import { FadeIn } from "@/components/fade-in";
import { PageShell } from "@/components/page-shell";
import { aboutParagraphs, cvEntries, pageCopy } from "@/content/site-content";

export const metadata: Metadata = {
  title: "About me",
  description: pageCopy.about.metaDescription,
};

export default function AboutPage() {
  const work = cvEntries.filter((e) => e.kind === "work");
  const education = cvEntries.filter((e) => e.kind === "education");

  return (
    <PageShell title={pageCopy.about.title} isNarrow>
      <FadeIn>
        <p className="text-sm text-ink-muted">{aboutParagraphs.join(" ")}</p>
      </FadeIn>
      <CvList entries={work} title="Work" />
      <CvList entries={education} title="Education" />
    </PageShell>
  );
}
