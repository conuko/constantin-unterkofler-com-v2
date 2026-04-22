import type { Metadata } from "next";
import { CvList } from "@/components/cv-list";
import { PageShell } from "@/components/page-shell";
import { aboutParagraphs, cvEntries, pageCopy } from "@/content/site-content";

export const metadata: Metadata = {
  title: "About me",
  description: pageCopy.about.metaDescription,
};

export default function AboutPage() {
  return (
    <PageShell title={pageCopy.about.title} intro={pageCopy.about.intro}>
      <div className="flex flex-col gap-4 max-w-2xl text-ink-muted">
        {aboutParagraphs.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </div>

      <section className="flex flex-col gap-4">
        <div className="flex flex-col gap-1"></div>
        <CvList entries={cvEntries} />
      </section>
    </PageShell>
  );
}
