import { describe, expect, test } from "vitest";
import { greetings } from "@/content/greetings";
import {
  advanceGreetingCycle,
  type GreetingCycleState,
  greetingCycle,
  greetingEraseStep,
  greetingGraphemes,
  greetingHoldDuration,
  greetingStepDelay,
  greetingWriteStep,
  nextGreetingHue,
  nextGreetingIndex,
  settledGreetingCycle,
} from "@/lib/notebook-greeting";

/** A deterministic stand-in for `Math.random`, cycling the given draws. */
function draws(...values: number[]) {
  let index = 0;

  return () => values[index++ % values.length];
}

function runCycle(
  state: GreetingCycleState,
  steps: number,
  random: () => number,
) {
  const frames: { written: string; hue: number; elapsed: number }[] = [];
  let current = state;
  let elapsed = 0;

  for (let step = 0; step < steps; step += 1) {
    const graphemes = greetingGraphemes(greetings[current.greetingIndex].text);

    frames.push({
      written: graphemes.slice(0, current.revealed).join(""),
      hue: current.hue,
      elapsed,
    });
    elapsed += greetingStepDelay(current, graphemes.length);
    current = advanceGreetingCycle(current, {
      graphemeCount: graphemes.length,
      greetingCount: greetings.length,
      random,
    });
  }

  return { frames, state: current, elapsed };
}

describe("Greeting", () => {
  test("greets in its own script, tagged with a valid language", () => {
    expect(greetings.length).toBeGreaterThan(0);
    expect(greetings[0]).toEqual({
      text: "Good to see you",
      language: "English",
      lang: "en",
    });
    expect(
      greetings.find((greeting) => greeting.language === "German")?.text,
    ).toBe("Schön, dass du da bist");
    expect(new Set(greetings.map((greeting) => greeting.language)).size).toBe(
      greetings.length,
    );
    expect(new Set(greetings.map((greeting) => greeting.lang)).size).toBe(
      greetings.length,
    );
    expect(
      greetings.every(
        (greeting) =>
          greeting.text.trim() === greeting.text &&
          greeting.text.length > 0 &&
          !greeting.text.includes("�"),
      ),
    ).toBe(true);
    expect(() =>
      greetings.map((greeting) => new Intl.Locale(greeting.lang)),
    ).not.toThrow();
  });

  test("carries the scripts that only their own letters can write", () => {
    const byLanguage = new Map(
      greetings.map((greeting) => [greeting.language, greeting.text]),
    );

    expect(byLanguage.get("Japanese")).toBe("会えてうれしいです");
    expect(byLanguage.get("Chinese (Simplified)")).toBe("很高兴见到你");
    expect(byLanguage.get("Chinese (Traditional)")).toBe("很高興見到你");
    expect(byLanguage.get("Korean")).toBe("만나서 반갑습니다");
    expect(byLanguage.get("Hindi")).toBe("आपको देखकर अच्छा लगा");
    expect(byLanguage.get("Arabic")).toBe("سعيد برؤيتك");
    expect(byLanguage.get("Hebrew")).toBe("טוב לראות אותך");
    expect(byLanguage.get("Greek")).toBe("Χαίρομαι που σε βλέπω");
    expect(byLanguage.get("Georgian")).toBe("მიხარია, რომ გხედავ");
  });

  test("writes whole graphemes, never half a composed glyph", () => {
    // Devanagari स्ते is one glyph built from four code points.
    expect(greetingGraphemes("नमस्ते")).toEqual(["न", "म", "स्ते"]);
    expect(greetingGraphemes("สวัสดี")).toEqual(["ส", "วั", "ส", "ดี"]);
    expect(greetingGraphemes("Hello")).toEqual(["H", "e", "l", "l", "o"]);
    // Every greeting stays within the state machine's reach.
    expect(
      greetings.every(
        (greeting) => greetingGraphemes(greeting.text).length > 0,
      ),
    ).toBe(true);
    expect(
      greetings.every(
        (greeting) =>
          greetingGraphemes(greeting.text).join("") === greeting.text,
      ),
    ).toBe(true);
  });

  test("arrives with the first greeting already whole, then erases it", () => {
    const settled = settledGreetingCycle(5);

    expect(settled).toEqual({
      greetingIndex: 0,
      hue: greetingCycle.entranceHue,
      phase: "settling",
      revealed: 5,
    });
    expect(greetingStepDelay(settled, 5)).toBe(greetingCycle.entranceHold);
    expect(
      advanceGreetingCycle(settled, {
        graphemeCount: 5,
        greetingCount: greetings.length,
        random: draws(0.5),
      }),
    ).toEqual({
      greetingIndex: 0,
      hue: greetingCycle.entranceHue,
      phase: "erasing",
      revealed: 5,
    });
  });

  test("writes left to right, rests, then erases right to left", () => {
    const written = runCycle(
      { greetingIndex: 0, hue: 24, phase: "writing", revealed: 0 },
      32,
      draws(0.5),
    );
    const frames = written.frames.map((frame) => frame.written);

    // Written one grapheme at a time, left to right.
    expect(frames.slice(0, 16)).toEqual([
      "",
      "G",
      "Go",
      "Goo",
      "Good",
      "Good ",
      "Good t",
      "Good to",
      "Good to ",
      "Good to s",
      "Good to se",
      "Good to see",
      "Good to see ",
      "Good to see y",
      "Good to see yo",
      // Written whole, then held for the rest of the slot.
      "Good to see you",
    ]);
    // Erased right to left, back to an empty line.
    expect(frames.slice(16)).toEqual([
      "Good to see you",
      "Good to see yo",
      "Good to see y",
      "Good to see ",
      "Good to see",
      "Good to se",
      "Good to s",
      "Good to ",
      "Good to",
      "Good t",
      "Good ",
      "Good",
      "Goo",
      "Go",
      "G",
      "",
    ]);
  });

  test("changes language and color only once the line is empty", () => {
    const start: GreetingCycleState = {
      greetingIndex: 0,
      hue: 24,
      phase: "writing",
      revealed: 0,
    };
    const { frames, state } = runCycle(start, 31, draws(0.5));

    // Every frame of the first greeting keeps the colour it was written in.
    expect(new Set(frames.map((frame) => frame.hue))).toEqual(new Set([24]));
    expect(state.greetingIndex).not.toBe(start.greetingIndex);
    expect(state.hue).not.toBe(start.hue);
    expect(state).toMatchObject({ phase: "writing", revealed: 0 });
  });

  test("gives every language a five-second slot", () => {
    greetings.forEach((greeting, greetingIndex) => {
      const graphemeCount = greetingGraphemes(greeting.text).length;
      const { elapsed, state } = runCycle(
        { greetingIndex, hue: 24, phase: "writing", revealed: 0 },
        // n writing steps, one hold, n erasing steps.
        2 * graphemeCount + 1,
        draws(0.5),
      );

      // One full slot: first keystroke through to the next greeting's first.
      expect(elapsed).toBeCloseTo(greetingCycle.slotDuration, 6);
      expect(state.phase).toBe("writing");
      expect(state.revealed).toBe(0);
    });
  });

  test("keeps the preferred pace until the slot budget binds", () => {
    // Short greetings write at the preferred pace and rest for the remainder.
    expect(greetingWriteStep(6)).toBe(greetingCycle.preferredWriteStep);
    expect(greetingEraseStep(6)).toBe(greetingCycle.preferredEraseStep);
    expect(greetingHoldDuration(6)).toBe(
      greetingCycle.slotDuration -
        6 *
          (greetingCycle.preferredWriteStep + greetingCycle.preferredEraseStep),
    );

    // Long ones compress instead of overrunning their slot.
    expect(greetingWriteStep(34)).toBeCloseTo(
      greetingCycle.writeBudget / 34,
      6,
    );
    expect(greetingEraseStep(34)).toBeCloseTo(
      greetingCycle.eraseBudget / 34,
      6,
    );
  });

  test("always leaves the written greeting a legible rest", () => {
    const guaranteedHold =
      greetingCycle.slotDuration -
      greetingCycle.writeBudget -
      greetingCycle.eraseBudget;

    expect(guaranteedHold).toBeGreaterThan(0);

    for (const greeting of greetings) {
      const graphemeCount = greetingGraphemes(greeting.text).length;

      // Structurally guaranteed, up to floating-point rounding on the pace.
      expect(greetingHoldDuration(graphemeCount)).toBeGreaterThan(
        guaranteedHold - 1e-6,
      );
    }

    // Even a greeting far longer than any in the content keeps its rest.
    expect(greetingHoldDuration(10_000)).toBeCloseTo(guaranteedHold, 6);
  });

  test("moves the color far enough each time to read as a new one", () => {
    const hues = [0, 0.001, 0.25, 0.5, 0.75, 0.999].map((draw) =>
      nextGreetingHue(200, draws(draw)),
    );

    for (const hue of hues) {
      const distance = Math.min(Math.abs(hue - 200), 360 - Math.abs(hue - 200));

      expect(hue).toBeGreaterThanOrEqual(0);
      expect(hue).toBeLessThan(360);
      expect(distance).toBeGreaterThanOrEqual(greetingCycle.minimumHueShift);
    }
  });

  test("never repeats the language it is replacing", () => {
    for (const draw of [0, 0.25, 0.5, 0.75, 0.999]) {
      for (const greetingIndex of [0, 1, greetings.length - 1]) {
        const next = nextGreetingIndex(
          greetingIndex,
          greetings.length,
          draws(draw),
        );

        expect(next).not.toBe(greetingIndex);
        expect(next).toBeGreaterThanOrEqual(0);
        expect(next).toBeLessThan(greetings.length);
      }
    }

    expect(nextGreetingIndex(0, 1, draws(0.5))).toBe(0);
  });
});
