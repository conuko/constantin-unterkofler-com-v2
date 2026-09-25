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

/**
 * One beat, in seconds. Every entrance starts a whole number of beats after
 * first paint, and every stagger is one beat or two.
 *
 * The notebook runs two streams side by side on a wide sheet — the Site
 * Header's column on the right, the page header on the left — and they used
 * to keep different time: the page on 40ms steps, the header 20ms out of phase
 * with it on 80ms steps. On one beat they tick together, so the sheet
 * registers as one sweep downward rather than two cascades drifting past each
 * other. Rows, records, and record parts had three more tempos between them
 * (45, 60, 80ms); they now read the same beat at one or two counts.
 *
 * 40ms is under three frames at 60Hz: short enough that a cascade reads as one
 * movement, long enough that each step still registers.
 */
export const notebookBeat = 0.04;

/** A whole number of beats, in seconds. */
export function notebookBeats(count: number) {
  return count * notebookBeat;
}

/** Seconds from first paint. Reading order, top of the page downward. The
 * Site Header's identity mark is absent on purpose: it has no entrance. */
export const notebookTiming = {
  /* The page header registers one row per beat. */
  pageIdentity: notebookBeats(1),
  pageHeading: notebookBeats(2),
  pageIntroduction: notebookBeats(3),
  pageHeaderRule: notebookBeats(4),

  /* The Site Header's column keeps the page header's beat: the theme toggle
   * lands with the section code, then each link with the row beside it. */
  siteHeaderControls: notebookBeats(1),
  siteHeaderWayfindingLead: notebookBeats(2),
  siteHeaderWayfindingStagger: notebookBeats(1),

  /* Record groups begin once the page has named itself, one group pause
   * after the header rule. Deliberately short: anything longer reads as a
   * blank page to Speed Index. */
  content: notebookBeats(7),
  closingRecord: notebookBeats(11),
} as const;

/** Beats between one entrance and the next inside a group. */
export const notebookStagger = {
  /** One row of a list to the next. */
  row: notebookBeats(1),
  /** One part of a record to the next — a part is a row of the record. */
  part: notebookBeats(1),
  /** One record of a collection to the next. A record is several parts
   * tall, so it takes two counts where a row takes one. */
  record: notebookBeats(2),
  /** The silence that opens a new group: the page header's rule to the first
   * record group, the last row of one section to the next heading. Three
   * beats against the one inside a group, so the break is unmistakable. */
  group: notebookBeats(3),
} as const;

/**
 * Timing contract for sectioned record groups such as the CV: each section
 * registers its heading, then its rows one beat apart, and the next heading
 * waits one group pause after the previous section's last row.
 *
 * The pause sits between sections, never inside one. A heading one beat
 * above its first row reads as that section's label; the silence before it
 * says a new group is starting. Each start follows from the section before
 * it, so the order holds however many rows a section grows to.
 */
export function notebookSectionSequenceStarts(entryCounts: number[]) {
  let heading = 0;

  return entryCounts.map((entryCount) => {
    const entries = Array.from(
      { length: entryCount },
      (_, entryIndex) => heading + (entryIndex + 1) * notebookStagger.row,
    );
    const section = { heading, entries };

    heading = (entries.at(-1) ?? heading) + notebookStagger.group;
    return section;
  });
}

/** Seconds as a CSS time. Rounded, because beats multiply in floating point
 * and `0.04 * 3` renders as `0.12000000000000001s`. */
export function notebookSeconds(seconds: number) {
  return `${Number(seconds.toFixed(3))}s`;
}

/**
 * The delay an entrance class waits before it runs, as an inline custom
 * property. Server-rendered, so the stagger survives with JavaScript disabled
 * and needs no runtime sequencing.
 */
export function notebookDelay(seconds: number): CSSProperties {
  return {
    "--notebook-delay": notebookSeconds(seconds),
  } as CSSProperties;
}
