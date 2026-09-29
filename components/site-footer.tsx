import { SiteConsoleControl } from "@/components/console/console-control";
import {
  notebookBeats,
  notebookDelay,
  notebookTiming,
} from "@/lib/notebook-motion";

type SiteFooterProps = {
  closingRecord: {
    copyrightYear: number;
    buildStamp: string;
  };
};

/**
 * The in-flow closing record: a copyright line and, opposite it, the console
 * control stacked over the build stamp — the drafting sheet's revision block.
 * It carries no rule of its own; the page's own bottom edge already bounds it.
 *
 * On desktop this is fixed to the bottom of the viewport, so it is above the
 * fold on load — its entrance is CSS for the same reason the page header's is.
 * The footer itself lets pointer events through to the page beneath; only the
 * control takes them back.
 */
export function SiteFooter({ closingRecord }: SiteFooterProps) {
  return (
    <footer
      data-closing-record
      className="mx-auto mt-auto flex w-full items-end justify-between gap-6 pt-3.5 pb-1 lg:pointer-events-none lg:fixed lg:inset-x-0 lg:bottom-8 lg:px-6"
    >
      <p
        style={notebookDelay(notebookTiming.closingRecord + notebookBeats(1))}
        className="notebook-in-part label text-ink-muted text-micro"
      >
        © {closingRecord.copyrightYear}
      </p>
      <div className="flex flex-col items-end gap-3">
        <SiteConsoleControl
          style={notebookDelay(notebookTiming.closingRecord)}
          className="notebook-in-part"
        />
        <p
          style={notebookDelay(notebookTiming.closingRecord + notebookBeats(2))}
          className="notebook-in-part label text-ink-faint text-micro"
        >
          Build {closingRecord.buildStamp}
        </p>
      </div>
    </footer>
  );
}
