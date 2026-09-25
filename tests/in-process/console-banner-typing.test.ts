import { describe, expect, test } from "vitest";
import {
  type BannerKeystroke,
  bannerArt,
  bannerColumns,
  bannerGreeting,
  bannerKeystrokes,
  bannerTyping,
  isStruckKey,
  nextBannerIntro,
  typeBanner,
} from "@/components/console/console-banner-typing";

const frameLength = 1000 / 60;

type TypingEvent = {
  kind: "reveal" | "strike";
  index: number;
  character: string;
  columns: number;
  frame: number;
  time: number;
};

/* Animation frames on a fake display, run one at a time, so a test can watch
 * every frame the typing asks for and stall the clock when it needs to. */
function display() {
  const pending = new Map<number, (time: number) => void>();
  let handle = 0;
  let frame = 0;
  let time = 0;

  return {
    requestFrame: (callback: (time: number) => void) => {
      handle += 1;
      pending.set(handle, callback);
      return handle;
    },
    cancelFrame: (id: number) => {
      pending.delete(id);
    },
    get pending() {
      return pending.size;
    },
    get frame() {
      return frame;
    },
    get time() {
      return time;
    },
    /** Paints the next frame, `gap` milliseconds after the last one. */
    paint(gap = frameLength) {
      time += gap;
      frame += 1;
      const callbacks = [...pending.values()];
      pending.clear();
      for (const callback of callbacks) callback(time);
    },
  };
}

function typing(from = 0) {
  const screen = display();
  const events: TypingEvent[] = [];
  let done = 0;

  const record =
    (kind: TypingEvent["kind"]) =>
    ({ character, columns }: BannerKeystroke, index: number) =>
      events.push({
        kind,
        index,
        character,
        columns,
        frame: screen.frame,
        time: screen.time,
      });

  const cancel = typeBanner({
    requestFrame: screen.requestFrame,
    cancelFrame: screen.cancelFrame,
    from,
    onReveal: record("reveal"),
    onStrike: record("strike"),
    onDone: () => {
      done += 1;
    },
  });

  return {
    screen,
    events,
    cancel,
    get done() {
      return done;
    },
    reveals: () => events.filter((event) => event.kind === "reveal"),
    strikes: () => events.filter((event) => event.kind === "strike"),
    /** Paints until the banner is typed, or gives up after five seconds. */
    finish() {
      for (let step = 0; step < 300 && done === 0; step++) screen.paint();
    },
  };
}

const struck = [...bannerGreeting].filter((character) => character.trim());

describe("console banner art", () => {
  test("is the greeting set glyph by glyph, one run of columns each", () => {
    const rows = bannerArt.split("\n");

    expect(rows).toHaveLength(6);
    expect(rows.every((row) => row.length === bannerColumns)).toBe(true);
    expect(bannerColumns).toBe(89);
    expect(bannerKeystrokes.map((key) => key.character).join("")).toBe(
      bannerGreeting,
    );

    const columns = bannerKeystrokes.map((key) => key.columns);
    expect(columns).toEqual([...columns].sort((a, b) => a - b));
    expect(new Set(columns).size).toBe(columns.length);
    expect(columns.at(-1)).toBe(bannerColumns);
  });

  test("strikes every character the reader can see, and no whitespace", () => {
    expect(
      bannerKeystrokes.filter(isStruckKey).map((key) => key.character),
    ).toEqual(struck);
    expect(struck).toContain("!");
    expect(bannerKeystrokes.filter((key) => !isStruckKey(key))).toEqual([
      expect.objectContaining({ character: " " }),
    ]);
  });
});

describe("console banner typing", () => {
  test("reveals the greeting in order, one character per frame at most", () => {
    const run = typing();
    run.finish();

    const reveals = run.reveals();
    expect(reveals.map((event) => event.character).join("")).toBe(
      bannerGreeting,
    );
    expect(reveals.map((event) => event.index)).toEqual(
      bannerKeystrokes.map((_, index) => index),
    );
    expect(new Set(reveals.map((event) => event.frame)).size).toBe(
      reveals.length,
    );
    expect(run.done).toBe(1);
    expect(run.screen.pending).toBe(0);
  });

  test("strikes once for each visible character, in the frame that shows it", () => {
    const run = typing();
    run.finish();

    const strikes = run.strikes();
    expect(strikes.map((event) => event.character)).toEqual(struck);
    expect(new Set(strikes.map((event) => event.index)).size).toBe(
      strikes.length,
    );

    for (const strike of strikes) {
      const at = run.events.indexOf(strike);
      expect(run.events[at - 1]).toMatchObject({
        kind: "reveal",
        index: strike.index,
        frame: strike.frame,
      });
    }
  });

  test("lets the window settle, then types on a steady beat", () => {
    const run = typing();
    run.finish();

    const times = run.reveals().map((event) => event.time);
    expect(times[0]).toBeGreaterThanOrEqual(bannerTyping.leadIn);
    expect(times[0]).toBeLessThan(bannerTyping.leadIn + 2 * frameLength);

    for (let index = 1; index < times.length; index++) {
      const gap = times[index] - times[index - 1];
      expect(gap).toBeGreaterThan(bannerTyping.keyInterval - frameLength);
      expect(gap).toBeLessThan(bannerTyping.keyInterval + frameLength);
    }
  });

  test("picks the beat up again after a stall instead of catching up in a burst", () => {
    const run = typing();
    while (run.reveals().length < 3) run.screen.paint();

    run.screen.paint(4000);
    const afterStall = run.reveals().length;
    run.screen.paint();
    run.screen.paint();

    expect(afterStall).toBe(4);
    expect(run.reveals()).toHaveLength(4);

    run.finish();
    const times = run.reveals().map((event) => event.time);
    for (let index = 4; index < times.length; index++) {
      expect(times[index] - times[index - 1]).toBeGreaterThan(
        bannerTyping.keyInterval - frameLength,
      );
    }
  });

  test("reveals and strikes nothing more once cancelled", () => {
    const run = typing();
    while (run.reveals().length < 4) run.screen.paint();
    const typed = run.events.length;

    run.cancel();
    for (let step = 0; step < 120; step++) run.screen.paint();

    expect(run.screen.pending).toBe(0);
    expect(run.events).toHaveLength(typed);
    expect(run.done).toBe(0);
  });

  test("cancelled before its first frame, as Strict Mode does, it strikes nothing", () => {
    const run = typing();
    run.cancel();
    run.screen.paint();

    expect(run.events).toHaveLength(0);
    expect(run.screen.pending).toBe(0);
  });

  test("a restarted run carries on after the keys already typed", () => {
    const first = typing();
    while (first.reveals().length < 5) first.screen.paint();
    first.cancel();

    const second = typing(first.reveals().length);
    second.finish();

    const strikes = [...first.strikes(), ...second.strikes()];
    expect(strikes.map((event) => event.character)).toEqual(struck);
    expect(second.reveals()[0].index).toBe(5);
    expect(second.reveals()[0].time).toBeLessThan(bannerTyping.leadIn);
  });
});

describe("console banner intro", () => {
  const open = { isOpen: true, prefersReducedMotion: false };

  test("types on the first open, and never at load", () => {
    expect(nextBannerIntro("pending", open)).toBe("typing");
    expect(nextBannerIntro("pending", { ...open, isOpen: false })).toBe(
      "pending",
    );
  });

  test("is already printed, with no typing to strike, under reduced motion", () => {
    expect(
      nextBannerIntro("pending", { ...open, prefersReducedMotion: true }),
    ).toBe("done");
  });

  test("prints the rest at once when interrupted, rather than typing on", () => {
    expect(nextBannerIntro("typing", { ...open, isOpen: false })).toBe("done");
    expect(
      nextBannerIntro("typing", { ...open, prefersReducedMotion: true }),
    ).toBe("done");
    expect(nextBannerIntro("typing", open)).toBe("typing");
  });

  test("runs once: a printed banner stays printed", () => {
    expect(nextBannerIntro("done", open)).toBe("done");
    expect(nextBannerIntro("done", { ...open, isOpen: false })).toBe("done");
  });
});
