import { describe, expect, test } from "vitest";
import { portfolioContent } from "@/content/site-content";
import {
  notebookSectionSequence,
  notebookSectionSequenceStarts,
} from "@/lib/notebook-motion";

function readingOrder(
  starts: ReturnType<typeof notebookSectionSequenceStarts>,
) {
  return starts.flatMap((section) => [section.heading, ...section.entries]);
}

describe("Engineering Notebook sectioned record sequence", () => {
  test("registers the CV as Work heading → Work entries → Education heading → Education entries", () => {
    const entryCounts = portfolioContent.pages.about.content.cvSections.map(
      (section) => section.entries.length,
    );
    const starts = notebookSectionSequenceStarts(entryCounts);

    expect(starts).toHaveLength(2);
    expect(starts[0]?.entries).toHaveLength(4);
    expect(starts[1]?.entries).toHaveLength(2);

    const order = readingOrder(starts);
    for (let index = 1; index < order.length; index += 1) {
      expect(order[index]).toBeGreaterThan(order[index - 1] ?? Number.NaN);
    }
  });

  test("starts every section heading before its own entries", () => {
    const starts = notebookSectionSequenceStarts([3, 1, 5]);

    for (const section of starts) {
      for (const entryStart of section.entries) {
        expect(entryStart).toBeGreaterThan(section.heading);
      }
    }
  });

  test("keeps the next section heading after the previous section's last entry for CV-sized sections", () => {
    const longestSection = Math.max(
      ...portfolioContent.pages.about.content.cvSections.map(
        (section) => section.entries.length,
      ),
    );
    const lastEntryOffset =
      notebookSectionSequence.headingLead +
      (longestSection - 1) * notebookSectionSequence.entryStagger;

    expect(notebookSectionSequence.sectionStagger).toBeGreaterThan(
      lastEntryOffset,
    );
  });
});
