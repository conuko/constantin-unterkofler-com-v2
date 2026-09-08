import type { CSSProperties } from "react";

/**
 * The Engineering Notebook's choreography is CSS, all of it.
 *
 * Entrance lives in `app/motion.css` as CSS animations keyed off an absolute
 * `--notebook-delay`, so the notebook registers itself at first paint instead
 * of waiting for hydration. Interaction — hover, press, the Site Header's
 * disclosure — is CSS transitions in the same file. The offsets below are the
 * entrance's single source of truth; see `app/motion.css` for why.
 */

/** Seconds from first paint. Reading order, top of the page downward. The
 * Site Header's identity mark is absent on purpose: it has no entrance. */
export const notebookTiming = {
  siteHeaderControls: 0.06,
  siteHeaderWayfindingLead: 0.1,
  siteHeaderWayfindingStagger: 0.08,

  pageIdentity: 0.04,
  pageHeading: 0.08,
  pageIntroduction: 0.12,
  pageHeaderRule: 0.16,

  /* Record groups begin once the page has named itself. Deliberately short:
   * anything longer reads as a blank page to Speed Index. */
  content: 0.3,
  closingRecord: 0.4,
} as const;

/**
 * Timing contract for sectioned record groups such as the CV: each section
 * registers its heading first, then its record rows in reading order, and the
 * next section only begins after the previous section's rows have started.
 */
export const notebookSectionSequence = {
  sectionStagger: 0.36,
  headingLead: 0.12,
  entryStagger: 0.06,
} as const;

export function notebookSectionSequenceStarts(entryCounts: number[]) {
  return entryCounts.map((entryCount, sectionIndex) => {
    const heading = sectionIndex * notebookSectionSequence.sectionStagger;

    return {
      heading,
      entries: Array.from(
        { length: entryCount },
        (_, entryIndex) =>
          heading +
          notebookSectionSequence.headingLead +
          entryIndex * notebookSectionSequence.entryStagger,
      ),
    };
  });
}

/**
 * The delay an entrance class waits before it runs, as an inline custom
 * property. Server-rendered, so the stagger survives with JavaScript disabled
 * and needs no runtime sequencing.
 */
export function notebookDelay(seconds: number): CSSProperties {
  return {
    "--notebook-delay": `${Number(seconds.toFixed(3))}s`,
  } as CSSProperties;
}
