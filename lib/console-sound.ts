export type ConsoleSound =
  | "open"
  | "close"
  | "command"
  | "dock-side"
  | "dock-bottom";

export type ConsoleSoundVoice = {
  waveform: OscillatorType;
  startFrequency: number;
  endFrequency: number;
  gain: number;
  attack: number;
  duration: number;
  filterFrequency: number;
};

type AudioParamLike = {
  setValueAtTime: (value: number, startTime: number) => unknown;
  linearRampToValueAtTime: (value: number, endTime: number) => unknown;
  exponentialRampToValueAtTime: (value: number, endTime: number) => unknown;
};

type AudioNodeLike = {
  connect: (destination: AudioNodeLike) => unknown;
};

export type ConsoleSoundContext = {
  state: "closed" | "running" | "suspended";
  currentTime: number;
  destination: AudioNodeLike;
  resume: () => Promise<void>;
  createGain: () => AudioNodeLike & { gain: AudioParamLike };
  createBiquadFilter: () => AudioNodeLike & {
    type: BiquadFilterType;
    frequency: AudioParamLike;
  };
  createOscillator: () => AudioNodeLike & {
    type: OscillatorType;
    frequency: AudioParamLike;
    start: (when: number) => unknown;
    stop: (when: number) => unknown;
  };
};

export type ConsoleSoundContextFactory = () => ConsoleSoundContext | null;

export type ConsoleSoundStorage = Pick<Storage, "getItem" | "setItem">;

export const consoleSoundPreferenceKey = "site-console-sounds-v1";

const quietGain = 0.0001;
const masterGain = 0.77;

/* Two softly filtered partials make each cue feel like a compact analogue
 * instrument, rather than like a browser beep. All voices stop within 180ms. */
export const consoleSoundCues: Record<ConsoleSound, ConsoleSoundVoice[]> = {
  open: [
    {
      waveform: "sine",
      startFrequency: 196,
      endFrequency: 246.94,
      gain: 0.18,
      attack: 0.012,
      duration: 0.16,
      filterFrequency: 1450,
    },
    {
      waveform: "triangle",
      startFrequency: 293.66,
      endFrequency: 369.99,
      gain: 0.07,
      attack: 0.008,
      duration: 0.13,
      filterFrequency: 1800,
    },
  ],
  close: [
    {
      waveform: "sine",
      startFrequency: 246.94,
      endFrequency: 174.61,
      gain: 0.16,
      attack: 0.006,
      duration: 0.15,
      filterFrequency: 1250,
    },
    {
      waveform: "triangle",
      startFrequency: 185,
      endFrequency: 138.59,
      gain: 0.06,
      attack: 0.006,
      duration: 0.12,
      filterFrequency: 1000,
    },
  ],
  command: [
    {
      waveform: "triangle",
      startFrequency: 220,
      endFrequency: 246.94,
      gain: 0.15,
      attack: 0.004,
      duration: 0.08,
      filterFrequency: 1700,
    },
    {
      waveform: "sine",
      startFrequency: 110,
      endFrequency: 110,
      gain: 0.05,
      attack: 0.004,
      duration: 0.1,
      filterFrequency: 650,
    },
  ],
  "dock-side": [
    {
      waveform: "triangle",
      startFrequency: 174.61,
      endFrequency: 220,
      gain: 0.11,
      attack: 0.006,
      duration: 0.11,
      filterFrequency: 1300,
    },
    {
      waveform: "sine",
      startFrequency: 261.63,
      endFrequency: 329.63,
      gain: 0.04,
      attack: 0.006,
      duration: 0.09,
      filterFrequency: 1600,
    },
  ],
  "dock-bottom": [
    {
      waveform: "triangle",
      startFrequency: 220,
      endFrequency: 174.61,
      gain: 0.11,
      attack: 0.006,
      duration: 0.11,
      filterFrequency: 1300,
    },
    {
      waveform: "sine",
      startFrequency: 329.63,
      endFrequency: 261.63,
      gain: 0.04,
      attack: 0.006,
      duration: 0.09,
      filterFrequency: 1600,
    },
  ],
};

function browserAudioContext(): ConsoleSoundContext | null {
  if (typeof window === "undefined") return null;

  const BrowserWindow = window as typeof window & {
    webkitAudioContext?: typeof AudioContext;
  };
  const AudioContextConstructor =
    BrowserWindow.AudioContext ?? BrowserWindow.webkitAudioContext;

  if (!AudioContextConstructor) return null;

  try {
    return new AudioContextConstructor({
      latencyHint: "interactive",
    }) as unknown as ConsoleSoundContext;
  } catch {
    return null;
  }
}

function scheduleVoice(
  context: ConsoleSoundContext,
  destination: AudioNodeLike,
  voice: ConsoleSoundVoice,
  startTime: number,
) {
  const oscillator = context.createOscillator();
  const filter = context.createBiquadFilter();
  const gain = context.createGain();

  oscillator.type = voice.waveform;
  oscillator.frequency.setValueAtTime(voice.startFrequency, startTime);
  oscillator.frequency.exponentialRampToValueAtTime(
    voice.endFrequency,
    startTime + voice.duration,
  );

  filter.type = "lowpass";
  filter.frequency.setValueAtTime(voice.filterFrequency, startTime);

  gain.gain.setValueAtTime(quietGain, startTime);
  gain.gain.linearRampToValueAtTime(voice.gain, startTime + voice.attack);
  gain.gain.exponentialRampToValueAtTime(quietGain, startTime + voice.duration);

  oscillator.connect(filter);
  filter.connect(gain);
  gain.connect(destination);
  oscillator.start(startTime);
  oscillator.stop(startTime + voice.duration);
}

/**
 * One browser-local engine, constructed without an AudioContext and therefore
 * safe to create during client-module evaluation. The actual context is only
 * allocated from `play`, which callers invoke from direct interactions.
 */
export class ConsoleSoundEngine {
  private context: ConsoleSoundContext | null = null;

  constructor(private readonly createContext: ConsoleSoundContextFactory) {}

  play(sound: ConsoleSound): boolean {
    if (this.context?.state === "closed") this.context = null;
    this.context ??= this.createContext();

    const context = this.context;
    if (!context) return false;

    try {
      if (context.state === "suspended") {
        void context.resume().catch(() => undefined);
      }

      const startTime = context.currentTime;
      const master = context.createGain();
      master.gain.setValueAtTime(masterGain, startTime);
      master.connect(context.destination);

      for (const voice of consoleSoundCues[sound]) {
        scheduleVoice(context, master, voice, startTime);
      }

      return true;
    } catch {
      return false;
    }
  }
}

const browserSoundEngine = new ConsoleSoundEngine(browserAudioContext);

/** Plays a cue when Web Audio is available. Interaction code may ignore failure. */
export function playConsoleSound(sound: ConsoleSound): boolean {
  return browserSoundEngine.play(sound);
}

/** Missing, blocked, or malformed stored values all keep the default enabled. */
export function consoleSoundsEnabled(
  storage: ConsoleSoundStorage | null | undefined,
): boolean {
  try {
    return storage?.getItem(consoleSoundPreferenceKey) !== "false";
  } catch {
    return true;
  }
}

export function persistConsoleSoundsEnabled(
  storage: ConsoleSoundStorage | null | undefined,
  enabled: boolean,
) {
  try {
    storage?.setItem(consoleSoundPreferenceKey, String(enabled));
  } catch {
    // Storage can be blocked by privacy settings; the in-memory preference stays useful.
  }
}
