import {
  NotebookLabel,
  NotebookRecordRow,
  NotebookRecordRowBody,
  NotebookRowIndex,
  NotebookSectionHeading,
} from "@/components/notebook-primitives";
import type { CvSection } from "@/content/site-content";
import {
  notebookSectionSequenceStarts,
  notebookTiming,
} from "@/lib/notebook-motion";

type CvProps = {
  sectionCode: string;
  sections: CvSection[];
};

function formatRecordIndex(sectionCode: string, position: number) {
  return `${sectionCode}–${String(position).padStart(2, "0")}`;
}

/**
 * The CV registers section by section: Work heading, Work entries, Education
 * heading, Education entries. Rows are indexed continuously across sections.
 *
 * The sequence is irregular — headings and rows interleave across sections —
 * so it resolves to absolute offsets here rather than riding the DOM-order
 * stagger the record collections use.
 */
export function Cv({ sectionCode, sections }: CvProps) {
  const starts = notebookSectionSequenceStarts(
    sections.map((section) => section.entries.length),
  );
  let position = 0;

  return (
    <div className="flex w-full flex-col gap-11">
      {sections.map((section, sectionIndex) => {
        const sectionStarts = starts[sectionIndex];

        return (
          <section key={section.title} className="w-full">
            <NotebookSectionHeading
              count={section.entries.length}
              delay={notebookTiming.content + (sectionStarts?.heading ?? 0)}
            >
              {section.title}
            </NotebookSectionHeading>
            <ol className="mt-3.5">
              {section.entries.map((entry, entryIndex) => {
                position += 1;

                return (
                  <NotebookRecordRow
                    key={`${entry.organization}-${entry.years}`}
                    delay={
                      notebookTiming.content +
                      (sectionStarts?.entries[entryIndex] ?? 0)
                    }
                  >
                    <NotebookRecordRowBody>
                      <NotebookRowIndex>
                        {formatRecordIndex(sectionCode, position)}
                      </NotebookRowIndex>
                      <div className="order-last min-w-0 basis-full sm:order-0 sm:flex-1 sm:basis-auto">
                        <h3 className="font-semibold text-sm">
                          {entry.organization}
                        </h3>
                        <p className="text-ink-muted text-sm">{entry.role}</p>
                      </div>
                      <NotebookLabel className="num ml-auto sm:ml-0 sm:w-26 sm:text-right">
                        {entry.years}
                      </NotebookLabel>
                    </NotebookRecordRowBody>
                  </NotebookRecordRow>
                );
              })}
            </ol>
          </section>
        );
      })}
    </div>
  );
}
