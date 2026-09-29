import type { Metadata } from "next";
import Link from "next/link";
import { PortfolioPage } from "@/components/portfolio-page";
import { notebookDelay, notebookTiming } from "@/lib/notebook-motion";

export const metadata: Metadata = {
  title: "404",
};

/* The way home is a `<Link>`, not a plain anchor: a full reload would end the
 * Site Console's session along with the page. The entrance sits on the link
 * itself so the glass is never inside a revealing ancestor (see the backdrop
 * notes in `app/motion.css`). */
export default function NotFound() {
  return (
    <PortfolioPage
      title="404"
      width="reading"
      introduction={<p>This is not the way.</p>}
    >
      <div>
        <Link
          href="/"
          style={notebookDelay(notebookTiming.content)}
          className="notebook-in-part notebook-press label inline-flex min-h-9 items-center border border-rule bg-card-glass px-3.5 py-2 text-ink-muted text-micro backdrop-blur-glass hover:border-ink hover:text-ink"
        >
          This is the way
        </Link>
      </div>
    </PortfolioPage>
  );
}
