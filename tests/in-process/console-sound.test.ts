import { describe, expect, test, vi } from "vitest";
import {
  type ConsoleSound,
  type ConsoleSoundContext,
  ConsoleSoundEngine,
  type ConsoleSoundNoise,
  type ConsoleSoundTone,
  consoleSoundCues,
  consoleSoundPreferenceKey,
  consoleSoundsEnabled,
  persistConsoleSoundsEnabled,
} from "@/lib/console-sound";

type MockParam = ReturnType<typeof mockParam>;
type MockSource = ReturnType<typeof mockSource>;

const sounds = Object.keys(consoleSoundCues) as ConsoleSound[];

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

function mockSource() {
  return {
    ...mockNode(),
    frequency: mockParam(),
    start: vi.fn(),
    stop: vi.fn(),
  };
}

function mockContext(
  state: ConsoleSoundContext["state"] = "running",
  { panning = true } = {},
) {
  const oscillators: (MockSource & { type: OscillatorType })[] = [];
  const noises: (MockSource & { buffer: unknown })[] = [];
  const panners: MockParam[] = [];
  const buffers: Float32Array[] = [];
  const convolvers: unknown[] = [];

  const context: ConsoleSoundContext = {
    createBiquadFilter: () => ({
      ...mockNode(),
      frequency: mockParam(),
      Q: mockParam(),
      type: "bandpass",
    }),
    createBuffer: (channels, length) => {
      const data = Array.from({ length: channels }, () => {
        const samples = new Float32Array(length);
        buffers.push(samples);
        return samples;
      });
      return { getChannelData: (channel) => data[channel] };
    },
    createBufferSource: () => {
      const source = { ...mockSource(), buffer: null };
      noises.push(source);
      return source;
    },
    createConvolver: () => {
      const convolver = { ...mockNode(), buffer: null };
      convolvers.push(convolver);
      return convolver;
    },
    createGain: () => ({ ...mockNode(), gain: mockParam() }),
    createOscillator: () => {
      const oscillator = { ...mockSource(), type: "square" as OscillatorType };
      oscillators.push(oscillator);
      return oscillator;
    },
    createStereoPanner: panning
      ? () => {
          const pan = mockParam();
          panners.push(pan);
          return { ...mockNode(), pan };
        }
      : undefined,
    currentTime: 4,
    destination: mockNode(),
    resume: vi.fn(() => Promise.resolve()),
    sampleRate: 8000,
    state,
  };

  return {
    context,
    buffers,
    convolvers,
    noises,
    oscillators,
    panners,
  };
}

const tones = (sound: ConsoleSound) =>
  consoleSoundCues[sound].voices.filter(
    (voice): voice is ConsoleSoundTone => voice.kind === "tone",
  );

const noises = (sound: ConsoleSound) =>
  consoleSoundCues[sound].voices.filter(
    (voice): voice is ConsoleSoundNoise => voice.kind === "noise",
  );

/* A deterministic stand-in for Math.random that still varies, so the noise and
 * the room it fills are not silent. */
function sequence(seed = 1) {
  return () => {
    seed = (seed * 16807) % 2147483647;
    return seed / 2147483647;
  };
}

const firstFrequency = (oscillator: MockSource) =>
  oscillator.frequency.setValueAtTime.mock.calls[0][0] as number;

const lastStop = (sources: MockSource[]) =>
  Math.max(...sources.map((source) => source.stop.mock.calls[0][0] as number));

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

  test("builds the room and the noise once per audio context", () => {
    const { context, buffers, convolvers, noises } = mockContext();
    const engine = new ConsoleSoundEngine(() => context, sequence());

    engine.play("open");
    engine.play("command");
    engine.play("dock-side");

    expect(convolvers).toHaveLength(1);
    // One mono noise buffer and a stereo room impulse.
    expect(buffers).toHaveLength(3);
    expect(
      buffers.every((samples) => samples.some((value) => value !== 0)),
    ).toBe(true);
    expect(new Set(noises.map((noise) => noise.buffer)).size).toBe(1);
  });

  test("schedules every sine partial and noise burst just ahead of the audio clock", () => {
    const { context, noises: bursts, oscillators } = mockContext();
    const engine = new ConsoleSoundEngine(
      () => context,
      () => 0.5,
    );

    engine.play("open");

    const partials = tones("open").flatMap((tone) => tone.partials);
    expect(oscillators).toHaveLength(partials.length);
    expect(bursts).toHaveLength(noises("open").length);
    expect(oscillators.every((oscillator) => oscillator.type === "sine")).toBe(
      true,
    );

    const starts = [...oscillators, ...bursts].map(
      (source) => source.start.mock.calls[0][0] as number,
    );
    expect(Math.min(...starts)).toBeGreaterThan(4);
    expect(Math.min(...starts)).toBeLessThan(4.01);
  });

  test("keeps a command short enough to repeat while typing", () => {
    const { context, noises: bursts, oscillators } = mockContext();
    new ConsoleSoundEngine(
      () => context,
      () => 1,
    ).play("command");

    expect(lastStop([...oscillators, ...bursts]) - 4).toBeLessThanOrEqual(0.15);
  });

  test("lets no cue ring on for longer than a second", () => {
    for (const sound of sounds) {
      const { context, noises: bursts, oscillators } = mockContext();
      new ConsoleSoundEngine(
        () => context,
        () => 1,
      ).play(sound);

      expect(lastStop([...oscillators, ...bursts]) - 4).toBeLessThanOrEqual(1);
    }
  });

  test("opens on its highest note and closes on its lowest", () => {
    const landing = (sound: ConsoleSound) =>
      tones(sound).reduce((last, tone) => (tone.at > last.at ? tone : last));
    const pitches = (sound: ConsoleSound) =>
      tones(sound).map((tone) => tone.frequency);

    expect(landing("open").frequency).toBe(Math.max(...pitches("open")));
    expect(landing("close").frequency).toBe(Math.min(...pitches("close")));
  });

  test("gives dock changes opposite directions and landings", () => {
    const [sideAir] = noises("dock-side");
    const [bottomAir] = noises("dock-bottom");
    const [sideLanding] = tones("dock-side");
    const [bottomLanding] = tones("dock-bottom");

    expect(sideAir.endFrequency).toBeGreaterThan(sideAir.startFrequency);
    expect(bottomAir.endFrequency).toBeLessThan(bottomAir.startFrequency);
    expect(sideLanding.frequency).toBeGreaterThan(bottomLanding.frequency);
    // The side dock sits in the right corner, so its air travels right.
    expect(sideAir.panTo).toBeGreaterThan(sideAir.pan ?? 0);
  });

  test("varies each play within the cue's narrow range", () => {
    const frequencyAt = (random: number) => {
      const { context, oscillators } = mockContext();
      new ConsoleSoundEngine(
        () => context,
        () => random,
      ).play("command");
      return firstFrequency(oscillators[0]);
    };

    const { cents } = consoleSoundCues.command.variation;
    const low = frequencyAt(0);
    const centre = frequencyAt(0.5);
    const high = frequencyAt(1);

    expect(low).toBeLessThan(centre);
    expect(high).toBeGreaterThan(centre);
    expect(1200 * Math.log2(high / centre)).toBeCloseTo(cents);
    expect(1200 * Math.log2(centre / low)).toBeCloseTo(cents);
  });

  test("plays centred where the browser has no stereo panner", () => {
    const { context, oscillators, panners } = mockContext("running", {
      panning: false,
    });
    const engine = new ConsoleSoundEngine(() => context);

    expect(engine.play("dock-side")).toBe(true);
    expect(oscillators.length).toBeGreaterThan(0);
    expect(panners).toHaveLength(0);
  });

  test("moves panned voices across the stereo field", () => {
    const { context, panners } = mockContext();
    new ConsoleSoundEngine(
      () => context,
      () => 0.5,
    ).play("dock-side");

    const [air] = noises("dock-side");
    const sweep = panners.find(
      (pan) => pan.linearRampToValueAtTime.mock.calls.length > 0,
    );
    expect(sweep?.setValueAtTime.mock.calls[0][0]).toBe(air.pan);
    expect(sweep?.linearRampToValueAtTime.mock.calls[0][0]).toBe(air.panTo);
  });

  test("resumes a suspended context without making the cue essential", () => {
    const { context } = mockContext("suspended");
    const engine = new ConsoleSoundEngine(() => context);

    expect(engine.play("command")).toBe(true);
    expect(context.resume).toHaveBeenCalledOnce();
  });

  test("rebuilds the room for a new context once the old one has closed", () => {
    const first = mockContext();
    const second = mockContext();
    const contexts = [first.context, second.context];
    const engine = new ConsoleSoundEngine(() => contexts.shift() ?? null);

    engine.play("open");
    first.context.state = "closed";
    engine.play("open");

    expect(first.convolvers).toHaveLength(1);
    expect(second.convolvers).toHaveLength(1);
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
