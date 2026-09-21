import { describe, expect, test, vi } from "vitest";
import {
  type ConsoleSoundContext,
  ConsoleSoundEngine,
  consoleSoundCues,
  consoleSoundPreferenceKey,
  consoleSoundsEnabled,
  persistConsoleSoundsEnabled,
} from "@/lib/console-sound";

type MockParam = ReturnType<typeof mockParam>;
type MockOscillator = ReturnType<typeof mockOscillator>;

function mockParam() {
  return {
    exponentialRampToValueAtTime: vi.fn(),
    linearRampToValueAtTime: vi.fn(),
    setValueAtTime: vi.fn(),
  };
}

function mockNode() {
  return { connect: vi.fn() };
}

function mockOscillator() {
  return {
    ...mockNode(),
    frequency: mockParam(),
    start: vi.fn(),
    stop: vi.fn(),
    type: "sine" as OscillatorType,
  };
}

function mockContext(state: ConsoleSoundContext["state"] = "running") {
  const oscillators: MockOscillator[] = [];
  const gains: MockParam[] = [];
  const filters: MockParam[] = [];
  const destination = mockNode();

  const context: ConsoleSoundContext = {
    createBiquadFilter: () => {
      const frequency = mockParam();
      filters.push(frequency);
      return { ...mockNode(), frequency, type: "lowpass" };
    },
    createGain: () => {
      const gain = mockParam();
      gains.push(gain);
      return { ...mockNode(), gain };
    },
    createOscillator: () => {
      const oscillator = mockOscillator();
      oscillators.push(oscillator);
      return oscillator;
    },
    currentTime: 4,
    destination,
    resume: vi.fn(() => Promise.resolve()),
    state,
  };

  return { context, filters, gains, oscillators };
}

describe("Console sound", () => {
  test("does not allocate an AudioContext until an enabled interaction plays", () => {
    const { context } = mockContext();
    const createContext = vi.fn(() => context);
    const engine = new ConsoleSoundEngine(createContext);

    expect(createContext).not.toHaveBeenCalled();
    expect(engine.play("open")).toBe(true);
    expect(createContext).toHaveBeenCalledOnce();

    engine.play("close");
    expect(createContext).toHaveBeenCalledOnce();
  });

  test("leaves console interactions intact when Web Audio is unavailable", () => {
    const engine = new ConsoleSoundEngine(() => null);

    expect(engine.play("open")).toBe(false);
  });

  test("schedules every warm analogue voice against the audio clock", () => {
    const { context, filters, gains, oscillators } = mockContext();
    const engine = new ConsoleSoundEngine(() => context);

    engine.play("open");

    expect(oscillators).toHaveLength(consoleSoundCues.open.length);
    expect(filters).toHaveLength(consoleSoundCues.open.length);
    expect(gains).toHaveLength(consoleSoundCues.open.length + 1);
    expect(
      oscillators.every(
        (oscillator) => oscillator.start.mock.calls[0][0] === 4,
      ),
    ).toBe(true);
    expect(
      oscillators.every(
        (oscillator) =>
          oscillator.stop.mock.calls[0][0] > 4 &&
          oscillator.stop.mock.calls[0][0] <= 4.18,
      ),
    ).toBe(true);
  });

  test("resumes a suspended context without making the cue essential", () => {
    const { context } = mockContext("suspended");
    const engine = new ConsoleSoundEngine(() => context);

    expect(engine.play("command")).toBe(true);
    expect(context.resume).toHaveBeenCalledOnce();
  });

  test("gives dock changes opposite pitch directions", () => {
    expect(consoleSoundCues["dock-side"][0].endFrequency).toBeGreaterThan(
      consoleSoundCues["dock-side"][0].startFrequency,
    );
    expect(consoleSoundCues["dock-bottom"][0].endFrequency).toBeLessThan(
      consoleSoundCues["dock-bottom"][0].startFrequency,
    );
  });

  test("keeps every cue below the intended 180ms ceiling", () => {
    expect(
      Object.values(consoleSoundCues)
        .flat()
        .every((voice) => voice.duration <= 0.18),
    ).toBe(true);
  });

  test("defaults sound to enabled and persists an explicit reader preference", () => {
    const values = new Map<string, string>();
    const storage = {
      getItem: (key: string) => values.get(key) ?? null,
      setItem: (key: string, value: string) => values.set(key, value),
    };

    expect(consoleSoundsEnabled(storage)).toBe(true);
    persistConsoleSoundsEnabled(storage, false);
    expect(values.get(consoleSoundPreferenceKey)).toBe("false");
    expect(consoleSoundsEnabled(storage)).toBe(false);
  });

  test("keeps the default when storage is unavailable", () => {
    const blockedStorage = {
      getItem: () => {
        throw new Error("blocked");
      },
      setItem: () => {
        throw new Error("blocked");
      },
    };

    expect(consoleSoundsEnabled(blockedStorage)).toBe(true);
    expect(() =>
      persistConsoleSoundsEnabled(blockedStorage, false),
    ).not.toThrow();
  });
});
