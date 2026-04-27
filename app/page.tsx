import type { Metadata } from "next";
import { FadeIn } from "@/components/fade-in";
import { PageShell } from "@/components/page-shell";
import { pageCopy } from "@/content/site-content";

export const metadata: Metadata = {
  title: "Home",
  description: pageCopy.home.metaDescription,
};

export default function Home() {
  return (
    <PageShell title={pageCopy.home.title}>
      <FadeIn>
        <p className="text-sm text-ink-muted text-center">
          Senior Software Engineer at{" "}
          <a
            href="https://www.jvm.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-ink"
          >
            Jung von Matt
          </a>
          .
        </p>
      </FadeIn>
    </PageShell>
  );
}
