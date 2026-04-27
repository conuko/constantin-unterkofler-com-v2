import type { Metadata } from "next";
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
      <p className="max-w-xl text-sm text-ink-muted">{pageCopy.work.intro}</p>
      <div className="grid grid-cols-1 gap-x-6 gap-y-10 md:grid-cols-2">
        {workEntries.map((entry, index) => (
          <WorkCard key={entry.client} entry={entry} priority={index < 2} />
        ))}
      </div>
    </PageShell>
  );
}
