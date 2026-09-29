/**
 * Timing and state contract for the Greeting: every language holds one
 * fixed-length slot, entered by writing left to right and left by erasing
 * right to left, so the rotation reads as one hand rewriting the same line.
 */
export const greetingCycle = {
  /** One language per slot, measured from first keystroke to first keystroke. */
  slotDuration: 5_000,
  /** The pace writing and erasing prefer when the greeting is short enough. */
  preferredWriteStep: 110,
  preferredEraseStep: 55,
  /**
   * Ceilings on how much of a slot writing and erasing may spend. Longer
   * scripts write faster than the preferred pace rather than overrunning their
   * slot. What is left is the resting hold, which is therefore never shorter than
   * `slotDuration - writeBudget - eraseBudget`.
   */
  writeBudget: 2_250,
  eraseBudget: 1_000,
  /** Lead-in that keeps the server-rendered greeting legible on arrival. */
  entranceHold: 1_200,
  /** Keeps consecutive random colors far enough apart to read as a change. */
  minimumHueShift: 40,
  /**
   * Hues the Greeting never lands on: 30° either side of Annotation Blue
   * (oklch hue 250). At the Greeting's lightness and chroma a hue in this band
   * reads as the measuring pen, and the pen never rotates (DESIGN.md, the
   * Separate Greeting Rule).
   */
  annotationHueBand: [220, 280],
  /** Hue of the server-rendered greeting, fixed so hydration stays stable. */
  entranceHue: 24,
} as const;

/**
 * `settling` is the arrival-only phase: the greeting rendered on the server is
 * already whole, so the rotation starts by erasing rather than writing.
 */
export type GreetingPhase = "settling" | "writing" | "holding" | "erasing";

export type GreetingCycleState = {
  greetingIndex: number;
  hue: number;
  phase: GreetingPhase;
  /** Graphemes currently written, counted from the start of the greeting. */
  revealed: number;
};

const graphemeSegmenter =
  typeof Intl.Segmenter === "function"
    ? new Intl.Segmenter(undefined, { granularity: "grapheme" })
    : undefined;

/**
 * Splits a greeting into graphemes rather than code points, so scripts that
 * build a glyph from several code points — Devanagari, Tamil, Thai — are never
 * written or erased through a broken half-character.
 */
export function greetingGraphemes(text: string): string[] {
  if (!graphemeSegmenter) return [...text];

  return [...graphemeSegmenter.segment(text)].map((segment) => segment.segment);
}

export function settledGreetingCycle(
  graphemeCount: number,
): GreetingCycleState {
  return {
    greetingIndex: 0,
    hue: greetingCycle.entranceHue,
    phase: "settling",
    revealed: graphemeCount,
  };
}

/** Per-grapheme pace, held to the preferred one until the budget binds. */
export function greetingWriteStep(graphemeCount: number): number {
  if (graphemeCount <= 0) return greetingCycle.preferredWriteStep;

  return Math.min(
    greetingCycle.preferredWriteStep,
    greetingCycle.writeBudget / graphemeCount,
  );
}

export function greetingEraseStep(graphemeCount: number): number {
  if (graphemeCount <= 0) return greetingCycle.preferredEraseStep;

  return Math.min(
    greetingCycle.preferredEraseStep,
    greetingCycle.eraseBudget / graphemeCount,
  );
}

/** The rest a written greeting takes so its whole slot lasts `slotDuration`. */
export function greetingHoldDuration(graphemeCount: number): number {
  const writtenAndErased =
    graphemeCount *
    (greetingWriteStep(graphemeCount) + greetingEraseStep(graphemeCount));

  return Math.max(0, greetingCycle.slotDuration - writtenAndErased);
}

/** How long the current state stands before `advanceGreetingCycle` applies. */
export function greetingStepDelay(
  state: GreetingCycleState,
  graphemeCount: number,
): number {
  switch (state.phase) {
    case "settling":
      return greetingCycle.entranceHold;
    case "writing":
      return greetingWriteStep(graphemeCount);
    case "holding":
      return greetingHoldDuration(graphemeCount);
    case "erasing":
      return greetingEraseStep(graphemeCount);
  }
}

type HueArc = readonly [start: number, end: number];

/** An arc of the hue circle as plain intervals inside [0, 360). */
function unwrapHueArc(start: number, end: number): HueArc[] {
  const from = ((start % 360) + 360) % 360;
  const to = from + (end - start);

  return to <= 360
    ? [[from, to]]
    : [
        [from, 360],
        [0, to - 360],
      ];
}

function subtractHueArc(arcs: HueArc[], [cutStart, cutEnd]: HueArc): HueArc[] {
  return arcs.flatMap(([start, end]): HueArc[] => {
    if (cutEnd <= start || cutStart >= end) return [[start, end]];

    return [
      ...(cutStart > start ? [[start, cutStart] as const] : []),
      ...(cutEnd < end ? [[cutEnd, end] as const] : []),
    ];
  });
}

/**
 * The next random hue: at least `minimumHueShift` from the current one and
 * outside `annotationHueBand`, drawn evenly from every hue that is left.
 */
export function nextGreetingHue(hue: number, random: () => number): number {
  const { annotationHueBand, minimumHueShift } = greetingCycle;
  const excluded = [
    ...unwrapHueArc(annotationHueBand[0], annotationHueBand[1]),
    ...unwrapHueArc(hue - minimumHueShift, hue + minimumHueShift),
  ];
  const allowed = excluded.reduce(subtractHueArc, [[0, 360]]);
  const total = allowed.reduce((sum, [start, end]) => sum + end - start, 0);

  let offset = random() * total;
  for (const [start, end] of allowed) {
    if (offset < end - start) return start + offset;
    offset -= end - start;
  }

  return allowed[0][0];
}

export function nextGreetingIndex(
  greetingIndex: number,
  greetingCount: number,
  random: () => number,
): number {
  if (greetingCount <= 1) return greetingIndex;

  const offset = 1 + Math.floor(random() * (greetingCount - 1));

  return (greetingIndex + offset) % greetingCount;
}

type GreetingAdvance = {
  graphemeCount: number;
  greetingCount: number;
  random: () => number;
};

/**
 * One step of the rotation. Writing and erasing move a single grapheme; the
 * language and its color change only once the line is empty, so a greeting is
 * never seen in another greeting's color.
 */
export function advanceGreetingCycle(
  state: GreetingCycleState,
  { graphemeCount, greetingCount, random }: GreetingAdvance,
): GreetingCycleState {
  switch (state.phase) {
    case "settling":
      return { ...state, phase: "erasing", revealed: graphemeCount };

    case "writing": {
      const revealed = state.revealed + 1;

      return revealed >= graphemeCount
        ? { ...state, phase: "holding", revealed: graphemeCount }
        : { ...state, phase: "writing", revealed };
    }

    case "holding":
      return { ...state, phase: "erasing", revealed: graphemeCount };

    case "erasing": {
      const revealed = state.revealed - 1;

      if (revealed > 0) return { ...state, phase: "erasing", revealed };

      return {
        greetingIndex: nextGreetingIndex(
          state.greetingIndex,
          greetingCount,
          random,
        ),
        hue: nextGreetingHue(state.hue, random),
        phase: "writing",
        revealed: 0,
      };
    }
  }
}
