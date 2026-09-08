import { notebookDelay, notebookTiming } from "@/lib/notebook-motion";

type SiteFooterProps = {
  closingRecord: {
    copyrightYear: number;
  };
};

/**
 * The in-flow closing record: one hairline rule and a copyright line that sits
 * at the end of short and long pages alike.
 *
 * On desktop this is fixed to the bottom of the viewport, so it is above the
 * fold on load — its entrance is CSS for the same reason the page header's is.
 */
export function SiteFooter({ closingRecord }: SiteFooterProps) {
  return (
    <footer
      data-closing-record
      className="relative mx-auto mt-auto flex w-full pt-4 pb-2 lg:pointer-events-none lg:fixed lg:inset-x-0 lg:bottom-8 lg:px-6"
    >
      <span
        aria-hidden="true"
        style={notebookDelay(notebookTiming.closingRecord)}
        className="notebook-in-rule absolute inset-x-0 top-0 h-px origin-left"
      />
      <p
        style={notebookDelay(notebookTiming.closingRecord + 0.08)}
        className="notebook-in-part label text-ink-muted text-label"
      >
        © {closingRecord.copyrightYear}
      </p>
    </footer>
  );
}
