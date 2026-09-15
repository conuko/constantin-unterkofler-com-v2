import { notebookDelay, notebookTiming } from "@/lib/notebook-motion";

type SiteFooterProps = {
  closingRecord: {
    copyrightYear: number;
    buildStamp: string;
  };
};

/**
 * The in-flow closing record: a copyright line and the build stamp opposite it
 * — the drafting sheet's revision block. It carries no rule of its own; the
 * page's own bottom edge already bounds it.
 *
 * On desktop this is fixed to the bottom of the viewport, so it is above the
 * fold on load — its entrance is CSS for the same reason the page header's is.
 */
export function SiteFooter({ closingRecord }: SiteFooterProps) {
  return (
    <footer
      data-closing-record
      className="mx-auto mt-auto flex w-full items-baseline justify-between gap-6 pt-3.5 pb-1 lg:pointer-events-none lg:fixed lg:inset-x-0 lg:bottom-8 lg:px-6"
    >
      <p
        style={notebookDelay(notebookTiming.closingRecord + 0.08)}
        className="notebook-in-part label text-ink-muted text-micro"
      >
        © {closingRecord.copyrightYear}
      </p>
      <p
        style={notebookDelay(notebookTiming.closingRecord + 0.12)}
        className="notebook-in-part label text-ink-muted/60 text-micro"
      >
        Build {closingRecord.buildStamp}
      </p>
    </footer>
  );
}
