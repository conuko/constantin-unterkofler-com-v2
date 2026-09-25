import { describe, expect, test } from "vitest";
import { portfolioContent } from "@/content/site-content";
import {
  notebookBeat,
  notebookSeconds,
  notebookSectionSequenceStarts,
  notebookStagger,
  notebookTiming,
} from "@/lib/notebook-motion";

function readingOrder(
  starts: ReturnType<typeof notebookSectionSequenceStarts>,
) {
  return starts.flatMap((section) => [section.heading, ...section.entries]);
}

function isWholeBeats(seconds: number) {
  const count = seconds / notebookBeat;
  return Math.abs(count - Math.round(count)) < 1e-9;
}

describe("Engineering Notebook beat", () => {
  test("starts every fixed entrance on a whole beat", () => {
    for (const [name, seconds] of Object.entries(notebookTiming)) {
      expect(isWholeBeats(seconds), name).toBe(true);
    }
  });

  test("staggers every group by a whole number of beats", () => {
    for (const [name, seconds] of Object.entries(notebookStagger)) {
      expect(isWholeBeats(seconds), name).toBe(true);
    }
  });

  test("keeps the Site Header column in step with the page header", () => {
    expect(notebookTiming.siteHeaderControls).toBe(notebookTiming.pageIdentity);
    expect(notebookTiming.siteHeaderWayfindingLead).toBe(
      notebookTiming.pageHeading,
    );
    expect(notebookTiming.siteHeaderWayfindingStagger).toBe(notebookBeat);
  });

  test("opens the record groups one group pause after the header rule", () => {
    expect(notebookTiming.content - notebookTiming.pageHeaderRule).toBeCloseTo(
      notebookStagger.group,
    );
  });

  test("renders beats as clean CSS times", () => {
    expect(notebookSeconds(notebookBeat * 3)).toBe("0.12s");
    expect(notebookSeconds(notebookTiming.content)).toBe("0.28s");
  });
});

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

  test("keeps reading order however long a section grows", () => {
    const order = readingOrder(notebookSectionSequenceStarts([9, 0, 12, 1]));

    for (let index = 1; index < order.length; index += 1) {
      expect(order[index]).toBeGreaterThan(order[index - 1] ?? Number.NaN);
    }
  });

  test("lands every heading and row on a whole beat", () => {
    for (const start of readingOrder(notebookSectionSequenceStarts([4, 2]))) {
      expect(isWholeBeats(start)).toBe(true);
    }
  });

  test("pauses between sections, never inside one", () => {
    const [work, education] = notebookSectionSequenceStarts([4, 2]);
    const workRows = work?.entries ?? [];
    const lastWorkRow = workRows.at(-1) ?? Number.NaN;

    // A heading is one row-step above its first row: it labels that section.
    expect((workRows[0] ?? Number.NaN) - (work?.heading ?? Number.NaN)).toBe(
      notebookStagger.row,
    );
    // The next heading waits the group pause, longer than any step inside.
    expect((education?.heading ?? Number.NaN) - lastWorkRow).toBeCloseTo(
      notebookStagger.group,
    );
    expect(notebookStagger.group).toBeGreaterThan(notebookStagger.row);
  });
});
