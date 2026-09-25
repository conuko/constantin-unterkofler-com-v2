/** How far the intro has got. `pending` is the state before the first open. */
export type ConsoleBannerIntro = "pending" | "typing" | "done";

export const bannerGreeting = "Hello there!";

/* The greeting in ANSI Shadow, the figlet face the banner has been set in
 * since it was exported from https://ascii-motion.app. One glyph per
 * character the greeting uses: every row of a glyph is the same width, and
 * the face sets glyphs edge to edge without kerning, so the art is their rows
 * joined across and each character owns a known run of columns. That run is
 * what the intro reveals when the character is typed. */
// biome-ignore format: each glyph reads as the rows it prints
const shadowGlyphs: Record<string, readonly string[]> = {
  H: [
    "██╗  ██╗",
    "██║  ██║",
    "███████║",
    "██╔══██║",
    "██║  ██║",
    "╚═╝  ╚═╝",
  ],
  E: [
    "███████╗",
    "██╔════╝",
    "█████╗  ",
    "██╔══╝  ",
    "███████╗",
    "╚══════╝",
  ],
  L: [
    "██╗     ",
    "██║     ",
    "██║     ",
    "██║     ",
    "███████╗",
    "╚══════╝",
  ],
  O: [
    " ██████╗ ",
    "██╔═══██╗",
    "██║   ██║",
    "██║   ██║",
    "╚██████╔╝",
    " ╚═════╝ ",
  ],
  " ": [
    "    ",
    "    ",
    "    ",
    "    ",
    "    ",
    "    ",
  ],
  T: [
    "████████╗",
    "╚══██╔══╝",
    "   ██║   ",
    "   ██║   ",
    "   ██║   ",
    "   ╚═╝   ",
  ],
  R: [
    "██████╗ ",
    "██╔══██╗",
    "██████╔╝",
    "██╔══██╗",
    "██║  ██║",
    "╚═╝  ╚═╝",
  ],
  "!": [
    "██╗",
    "██║",
    "██║",
    "╚═╝",
    "██╗",
    "╚═╝",
  ],
};

const bannerGlyphs = [...bannerGreeting.toUpperCase()].map((character) => {
  const glyph = shadowGlyphs[character];
  if (!glyph) throw new Error(`The banner has no glyph for "${character}".`);
  return glyph;
});

export const bannerArt = bannerGlyphs[0]
  .map((_, row) => bannerGlyphs.map((glyph) => glyph[row]).join(""))
  .join("\n");

export type BannerKeystroke = {
  character: string;
  /** Columns of the art visible once this character has been typed. */
  columns: number;
};

export const bannerKeystrokes: readonly BannerKeystroke[] = (() => {
  let columns = 0;
  return [...bannerGreeting].map((character, index) => {
    columns += bannerGlyphs[index][0].length;
    return { character, columns };
  });
})();

export const bannerColumns =
  bannerKeystrokes[bannerKeystrokes.length - 1].columns;

/** Whitespace is typed for its beat but prints nothing, so it has no strike. */
export function isStruckKey({ character }: BannerKeystroke): boolean {
  return character.trim() !== "";
}

export const bannerTyping = {
  /** Before the first key, so the window can settle and its opening chime is
   * heard on its own rather than under the typing. */
  leadIn: 260,
  /** Between keys: a steady machine hand. A space takes a beat of its own
   * without a strike, which is what parts the two words. */
  keyInterval: 80,
} as const;

type BannerTypingOptions = {
  requestFrame: (callback: (time: number) => void) => number;
  cancelFrame: (handle: number) => void;
  /** Keystrokes already typed; a restarted run carries on after them. */
  from?: number;
  onReveal: (keystroke: BannerKeystroke, index: number) => void;
  /** Called with each visible character, in the frame that reveals it. */
  onStrike: (keystroke: BannerKeystroke, index: number) => void;
  onDone: () => void;
};

/**
 * Types the banner one character per beat and returns a cancel.
 *
 * The animation frame is the one clock: the frame that reveals a character is
 * the frame that strikes its key, so what is seen and what is heard cannot
 * drift apart. At most one key lands per frame. Running a little late keeps
 * the beat; stalled for longer — a hidden tab, a long task — the beat starts
 * again from the late key, so the keys that remain never arrive as a burst.
 */
export function typeBanner({
  requestFrame,
  cancelFrame,
  from = 0,
  onReveal,
  onStrike,
  onDone,
}: BannerTypingOptions): () => void {
  let index = from;
  let dueAt: number | null = null;
  let frame: number | null = null;

  const tick = (time: number) => {
    frame = null;

    if (index < bannerKeystrokes.length) {
      dueAt ??=
        time + (index === 0 ? bannerTyping.leadIn : bannerTyping.keyInterval);

      if (time >= dueAt) {
        const keystroke = bannerKeystrokes[index];
        onReveal(keystroke, index);
        if (isStruckKey(keystroke)) onStrike(keystroke, index);

        index += 1;
        const onBeat = time - dueAt < bannerTyping.keyInterval;
        dueAt = (onBeat ? dueAt : time) + bannerTyping.keyInterval;
      }
    }

    if (index >= bannerKeystrokes.length) {
      onDone();
      return;
    }

    frame = requestFrame(tick);
  };

  frame = requestFrame(tick);

  return () => {
    if (frame !== null) cancelFrame(frame);
    frame = null;
  };
}

/**
 * The intro runs on the first open and only there. It cannot run at load —
 * the window is hidden then, and the banner would have finished typing before
 * anyone had seen it start. A reader who has asked for less motion gets the
 * banner already printed, and closing the window, or asking for less motion
 * part-way, prints the rest at once instead of typing on unseen.
 */
export function nextBannerIntro(
  intro: ConsoleBannerIntro,
  {
    isOpen,
    prefersReducedMotion,
  }: { isOpen: boolean; prefersReducedMotion: boolean },
): ConsoleBannerIntro {
  if (intro === "pending" && isOpen) {
    return prefersReducedMotion ? "done" : "typing";
  }
  if (intro === "typing" && (!isOpen || prefersReducedMotion)) return "done";
  return intro;
}
