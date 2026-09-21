import { PortfolioPage } from "@/components/portfolio-page";
import { notebookDelay, notebookTiming } from "@/lib/notebook-motion";

export default function NotFound() {
  return (
    <PortfolioPage
      title="404"
      width="reading"
      introduction={<p>This is not the way.</p>}
    >
      <div
        style={notebookDelay(notebookTiming.content)}
        className="notebook-in-part"
      >
        <a
          href="/"
          className="notebook-press label inline-flex min-h-9 items-center border border-rule bg-card-glass px-3.5 py-2 text-ink-muted text-micro backdrop-blur-glass transition-colors duration-fast hover:border-ink hover:text-ink"
        >
          This is the way
        </a>
      </div>
    </PortfolioPage>
  );
}
