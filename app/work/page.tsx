import type { Metadata } from "next";
import { FadeIn } from "@/components/fade-in";
import { PageShell } from "@/components/page-shell";
import { WorkCard } from "@/components/work-card";
import { pageCopy, workEntries } from "@/content/site-content";

export const metadata: Metadata = {
  title: "Work",
  description: pageCopy.work.metaDescription,
};

export default function WorkPage() {
  return (
    <PageShell title={pageCopy.work.title}>
      <FadeIn>
        <p className="max-w-xl text-sm text-ink-muted">{pageCopy.work.intro}</p>
      </FadeIn>
      <div className="grid grid-cols-1 gap-x-6 gap-y-10 md:grid-cols-2">
        {workEntries.map((entry, index) => (
          <WorkCard
            key={entry.client}
            entry={entry}
            index={index}
            priority={index < 4}
          />
        ))}
      </div>
    </PageShell>
  );
}
