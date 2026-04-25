import type { Metadata } from "next";
import { PageShell } from "@/components/page-shell";
import { pageCopy } from "@/content/site-content";

export const metadata: Metadata = {
  title: "Home",
  description: pageCopy.home.metaDescription,
};

export default function Home() {
  return (
    <PageShell title={pageCopy.home.title} isNarrow>
      <p className="text-sm text-ink-muted">{pageCopy.home.intro}</p>
    </PageShell>
  );
}
