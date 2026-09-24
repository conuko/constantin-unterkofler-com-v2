export type ConsoleSound =
  | "open"
  | "close"
  | "command"
  | "dock-side"
  | "dock-bottom";

/** One vibrating mode of a struck body: its pitch relative to the note, its
 * level relative to the note's, and how long it takes to fall silent. */
export type ConsoleSoundPartial = {
  ratio: number;
  gain: number;
  decay: number;
};

type ConsoleSoundPlacement = {
  /** Seconds after the cue starts. */
  at: number;
  gain: number;
  attack: number;
  /** Stereo position from -1 (left) to 1 (right); `panTo` moves it over the voice. */
  pan?: number;
  panTo?: number;
};

/** A struck, pitched body: glass, a tuned bar, or a plain sine. */
export type ConsoleSoundTone = ConsoleSoundPlacement & {
  kind: "tone";
  frequency: number;
  partials: ConsoleSoundPartial[];
  /** The note starts at `from` times its frequency and settles within `time`. */
  glide?: { from: number; time: number };
};

/** Filtered air: the touch of a fingertip, or a window moving through the room. */
export type ConsoleSoundNoise = ConsoleSoundPlacement & {
  kind: "noise";
  duration: number;
  filter: BiquadFilterType;
  startFrequency: number;
  endFrequency: number;
  q: number;
};

export type ConsoleSoundVoice = ConsoleSoundTone | ConsoleSoundNoise;

export type ConsoleSoundCue = {
  voices: ConsoleSoundVoice[];
  /** How much of the cue is sent into the small room. */
  room: number;
  /** The widest per-play drift in pitch (cents), level (fraction), and the
   * onset of later voices (seconds), so a repeated cue is never a copy. */
  variation: { cents: number; gain: number; timing: number };
};

type AudioParamLike = {
  setValueAtTime: (value: number, startTime: number) => unknown;
  linearRampToValueAtTime: (value: number, endTime: number) => unknown;
  exponentialRampToValueAtTime: (value: number, endTime: number) => unknown;
};

type AudioNodeLike = {
  connect: (destination: AudioNodeLike) => unknown;
};

type AudioBufferLike = {
  getChannelData: (channel: number) => Float32Array;
};

export type ConsoleSoundContext = {
  state: "closed" | "running" | "suspended";
  currentTime: number;
  sampleRate: number;
  destination: AudioNodeLike;
  resume: () => Promise<void>;
  createGain: () => AudioNodeLike & { gain: AudioParamLike };
  createBiquadFilter: () => AudioNodeLike & {
    type: BiquadFilterType;
    frequency: AudioParamLike;
    Q: AudioParamLike;
  };
  createOscillator: () => AudioNodeLike & {
    type: OscillatorType;
    frequency: AudioParamLike;
    start: (when: number) => unknown;
    stop: (when: number) => unknown;
  };
  createBuffer: (
    channels: number,
    length: number,
    sampleRate: number,
  ) => AudioBufferLike;
  createBufferSource: () => AudioNodeLike & {
    buffer: AudioBufferLike | null;
    start: (when: number, offset?: number) => unknown;
    stop: (when: number) => unknown;
  };
  createConvolver: () => AudioNodeLike & { buffer: AudioBufferLike | null };
  /** Absent from older WebKit; cues then play centred. */
  createStereoPanner?: () => AudioNodeLike & { pan: AudioParamLike };
};

export type ConsoleSoundContextFactory = () => ConsoleSoundContext | null;

export type ConsoleSoundStorage = Pick<Storage, "getItem" | "setItem">;

export const consoleSoundPreferenceKey = "site-console-sounds-v1";

const quietGain = 0.0001;
const masterGain = 0.26;
/* Scheduling a hair ahead of the clock keeps the first milliseconds of an
 * attack from being skipped, which would otherwise click. */
const lookahead = 0.006;
const releaseMargin = 0.02;
const noiseSeconds = 1;
const roomSeconds = 0.75;
const roomDecay = 0.11;
const roomPreDelay = 0.009;
/* The convolver normalises its impulse to roughly -13 dB, so sends are
 * lifted back up; a cue's `room` then reads as the wet level it gets. */
const roomLevel = 4;

/* A pure fundamental, a slightly stretched octave, and an inharmonic ping
 * that is gone almost at once: the ear hears a struck glass, not a beep. */
const glass = (decay: number): ConsoleSoundPartial[] => [
  { ratio: 1, gain: 1, decay },
  { ratio: 2.005, gain: 0.16, decay: decay * 0.45 },
  { ratio: 5.43, gain: 0.05, decay: decay * 0.1 },
];

/* A tuned bar, like a marimba key: the fourth and tenth overtones are the
 * knock of the mallet, and they die first. */
const wood = (decay: number): ConsoleSoundPartial[] => [
  { ratio: 1, gain: 1, decay },
  { ratio: 3.98, gain: 0.22, decay: decay * 0.35 },
  { ratio: 9.85, gain: 0.05, decay: decay * 0.12 },
];

/* A soft mallet on a tuned bar, voiced like a notification chime: every
 * overtone is a whole-number harmonic, so nothing rings like a bell, and the
 * upper ones are gone within a few tens of milliseconds. Each note is crisp
 * as it starts and a clean, round tone by the time it rings. */
const mallet = (decay: number): ConsoleSoundPartial[] => [
  { ratio: 1, gain: 1, decay },
  { ratio: 2, gain: 0.3, decay: decay * 0.22 },
  { ratio: 3, gain: 0.1, decay: decay * 0.12 },
  { ratio: 4, gain: 0.08, decay: decay * 0.07 },
];

/* Every pitch comes from one A major pentatonic set, so cues that overlap,
 * like a command that closes the window, still land in the same chord. */
const pitch = {
  e5: 659.25,
  fSharp5: 739.99,
  a5: 880,
  cSharp6: 1108.73,
  e6: 1318.51,
};

/* Each cue is built from tuned sine partials (the material), with filtered
 * noise wherever a touch or moving air belongs, and sends a little of itself
 * into a small room. Opening is a quick rising arpeggio of mallet notes, the
 * shape of a notification arriving; closing is its outer notes falling,
 * shorter and quieter. A command is a single short knock, and a dock change is
 * air moving towards where the window lands, ending in a soft snap at the new
 * position. */
export const consoleSoundCues: Record<ConsoleSound, ConsoleSoundCue> = {
  open: {
    room: 0.14,
    variation: { cents: 6, gain: 0.06, timing: 0.003 },
    voices: [
      {
        kind: "tone",
        at: 0,
        frequency: pitch.a5,
        gain: 0.12,
        attack: 0.002,
        partials: mallet(0.2),
        glide: { from: 1.012, time: 0.015 },
      },
      {
        kind: "tone",
        at: 0.06,
        frequency: pitch.cSharp6,
        gain: 0.11,
        attack: 0.002,
        partials: mallet(0.22),
        glide: { from: 1.012, time: 0.015 },
      },
      {
        kind: "tone",
        at: 0.12,
        frequency: pitch.e6,
        gain: 0.12,
        attack: 0.002,
        partials: mallet(0.4),
        glide: { from: 1.012, time: 0.015 },
      },
    ],
  },
  close: {
    room: 0.12,
    variation: { cents: 6, gain: 0.06, timing: 0.003 },
    voices: [
      {
        kind: "tone",
        at: 0,
        frequency: pitch.e6,
        gain: 0.09,
        attack: 0.002,
        partials: mallet(0.16),
        glide: { from: 1.012, time: 0.015 },
      },
      {
        kind: "tone",
        at: 0.07,
        frequency: pitch.a5,
        gain: 0.105,
        attack: 0.002,
        partials: mallet(0.3),
        glide: { from: 1.012, time: 0.015 },
      },
    ],
  },
  command: {
    room: 0.08,
    variation: { cents: 30, gain: 0.14, timing: 0 },
    voices: [
      {
        kind: "noise",
        at: 0,
        duration: 0.008,
        attack: 0.0008,
        gain: 0.07,
        filter: "bandpass",
        startFrequency: 3000,
        endFrequency: 2200,
        q: 1.4,
      },
      {
        kind: "tone",
        at: 0,
        frequency: pitch.e5,
        gain: 0.13,
        attack: 0.0015,
        partials: wood(0.085),
        glide: { from: 1.06, time: 0.014 },
      },
    ],
  },
  "dock-side": {
    room: 0.16,
    variation: { cents: 12, gain: 0.1, timing: 0.006 },
    voices: [
      {
        kind: "noise",
        at: 0,
        duration: 0.19,
        attack: 0.085,
        gain: 0.12,
        filter: "bandpass",
        startFrequency: 650,
        endFrequency: 2400,
        q: 2.6,
        pan: -0.05,
        panTo: 0.4,
      },
      {
        kind: "tone",
        at: 0.15,
        frequency: pitch.cSharp6,
        gain: 0.085,
        attack: 0.003,
        partials: glass(0.26),
        pan: 0.4,
      },
    ],
  },
  "dock-bottom": {
    room: 0.16,
    variation: { cents: 12, gain: 0.1, timing: 0.006 },
    voices: [
      {
        kind: "noise",
        at: 0,
        duration: 0.19,
        attack: 0.085,
        gain: 0.12,
        filter: "bandpass",
        startFrequency: 2400,
        endFrequency: 650,
        q: 2.6,
        pan: 0.4,
        panTo: 0,
      },
      {
        kind: "tone",
        at: 0.15,
        frequency: pitch.fSharp5,
        gain: 0.1,
        attack: 0.003,
        partials: glass(0.3),
        pan: 0,
      },
    ],
  },
};

type ConsoleSoundGraph = {
  output: AudioNodeLike;
  room: AudioNodeLike;
  noise: AudioBufferLike;
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

/* Pink rather than white: equal energy per octave is what moving air and
 * skin on glass sound like, where white noise reads as hiss. Paul Kellet's
 * three-pole approximation, peak-normalised. */
function pinkNoise(context: ConsoleSoundContext, random: () => number) {
  const length = Math.round(context.sampleRate * noiseSeconds);
  const noise = context.createBuffer(1, length, context.sampleRate);
  const samples = noise.getChannelData(0);
  let slow = 0;
  let middle = 0;
  let fast = 0;
  let peak = 0;

  for (let index = 0; index < length; index++) {
    const white = random() * 2 - 1;
    slow = 0.99765 * slow + white * 0.099046;
    middle = 0.963 * middle + white * 0.2965164;
    fast = 0.57 * fast + white * 1.0526913;
    samples[index] = slow + middle + fast + white * 0.1848;
    peak = Math.max(peak, Math.abs(samples[index]));
  }

  for (let index = 0; index < length; index++) {
    samples[index] /= peak || 1;
  }

  return noise;
}

/* A small, bright room rather than a hall: a short pre-delay, then a tail
 * that darkens as it decays, the way air takes the highs first. Each channel
 * gets its own noise, which is what makes the room feel wide. */
function roomImpulse(context: ConsoleSoundContext, random: () => number) {
  const rate = context.sampleRate;
  const length = Math.round(rate * roomSeconds);
  const impulse = context.createBuffer(2, length, rate);

  for (let channel = 0; channel < 2; channel++) {
    const samples = impulse.getChannelData(channel);
    let smoothed = 0;

    for (let index = Math.round(rate * roomPreDelay); index < length; index++) {
      const time = index / rate;
      const brightness = 0.12 + 0.88 * Math.exp(-time * 7);
      smoothed += (random() * 2 - 1 - smoothed) * brightness;
      samples[index] = smoothed * Math.exp(-time / roomDecay);
    }
  }

  return impulse;
}

function buildGraph(
  context: ConsoleSoundContext,
  random: () => number,
): ConsoleSoundGraph {
  const output = context.createGain();
  output.gain.setValueAtTime(masterGain, context.currentTime);
  output.connect(context.destination);

  const room = context.createConvolver();
  room.buffer = roomImpulse(context, random);
  room.connect(output);

  return { output, room, noise: pinkNoise(context, random) };
}

function place(
  context: ConsoleSoundContext,
  destination: AudioNodeLike,
  voice: ConsoleSoundPlacement,
  start: number,
  end: number,
): AudioNodeLike {
  if (voice.pan === undefined || !context.createStereoPanner) {
    return destination;
  }

  const panner = context.createStereoPanner();
  panner.pan.setValueAtTime(voice.pan, start);
  if (voice.panTo !== undefined) {
    panner.pan.linearRampToValueAtTime(voice.panTo, end);
  }
  panner.connect(destination);
  return panner;
}

function scheduleTone(
  context: ConsoleSoundContext,
  destination: AudioNodeLike,
  tone: ConsoleSoundTone,
  start: number,
  detune: number,
  level: number,
) {
  const ringing = Math.max(...tone.partials.map((partial) => partial.decay));
  const output = place(
    context,
    destination,
    tone,
    start,
    start + tone.attack + ringing,
  );

  for (const partial of tone.partials) {
    const oscillator = context.createOscillator();
    const envelope = context.createGain();
    const frequency = tone.frequency * partial.ratio * detune;
    const end = start + tone.attack + partial.decay;

    oscillator.type = "sine";
    if (tone.glide) {
      oscillator.frequency.setValueAtTime(frequency * tone.glide.from, start);
      oscillator.frequency.exponentialRampToValueAtTime(
        frequency,
        start + tone.glide.time,
      );
    } else {
      oscillator.frequency.setValueAtTime(frequency, start);
    }

    envelope.gain.setValueAtTime(quietGain, start);
    envelope.gain.linearRampToValueAtTime(
      tone.gain * partial.gain * level,
      start + tone.attack,
    );
    envelope.gain.exponentialRampToValueAtTime(quietGain, end);

    oscillator.connect(envelope);
    envelope.connect(output);
    oscillator.start(start);
    oscillator.stop(end + releaseMargin);
  }
}

function scheduleNoise(
  context: ConsoleSoundContext,
  destination: AudioNodeLike,
  noise: ConsoleSoundNoise,
  buffer: AudioBufferLike,
  start: number,
  detune: number,
  level: number,
  offset: number,
) {
  const source = context.createBufferSource();
  const filter = context.createBiquadFilter();
  const envelope = context.createGain();
  const end = start + noise.duration;

  source.buffer = buffer;

  filter.type = noise.filter;
  filter.Q.setValueAtTime(noise.q, start);
  filter.frequency.setValueAtTime(noise.startFrequency * detune, start);
  filter.frequency.exponentialRampToValueAtTime(
    noise.endFrequency * detune,
    end,
  );

  envelope.gain.setValueAtTime(quietGain, start);
  envelope.gain.linearRampToValueAtTime(
    noise.gain * level,
    start + noise.attack,
  );
  envelope.gain.exponentialRampToValueAtTime(quietGain, end);

  source.connect(filter);
  filter.connect(envelope);
  envelope.connect(place(context, destination, noise, start, end));
  source.start(start, offset);
  source.stop(end + releaseMargin);
}

function scheduleCue(
  context: ConsoleSoundContext,
  graph: ConsoleSoundGraph,
  cue: ConsoleSoundCue,
  random: () => number,
) {
  const spread = () => random() * 2 - 1;
  const now = context.currentTime + lookahead;
  const detune = 2 ** ((spread() * cue.variation.cents) / 1200);
  const level = 1 + spread() * cue.variation.gain;

  const bus = context.createGain();
  const send = context.createGain();
  send.gain.setValueAtTime(cue.room * roomLevel, now);
  bus.connect(graph.output);
  bus.connect(send);
  send.connect(graph.room);

  for (const voice of cue.voices) {
    const drift = voice.at > 0 ? spread() * cue.variation.timing : 0;
    const start = now + Math.max(0, voice.at + drift);

    if (voice.kind === "tone") {
      scheduleTone(context, bus, voice, start, detune, level);
    } else {
      const offset = random() * (noiseSeconds - voice.duration);
      scheduleNoise(
        context,
        bus,
        voice,
        graph.noise,
        start,
        detune,
        level,
        offset,
      );
    }
  }
}

/**
 * One browser-local engine, constructed without an AudioContext and therefore
 * safe to create during client-module evaluation. The actual context, its
 * room and its noise are only allocated from `play`, which callers invoke from
 * direct interactions, and are then reused for every later cue.
 */
export class ConsoleSoundEngine {
  private context: ConsoleSoundContext | null = null;
  private graph: ConsoleSoundGraph | null = null;

  constructor(
    private readonly createContext: ConsoleSoundContextFactory,
    private readonly random: () => number = Math.random,
  ) {}

  play(sound: ConsoleSound): boolean {
    if (this.context?.state === "closed") this.context = null;
    if (!this.context) {
      this.context = this.createContext();
      this.graph = null;
    }

    const context = this.context;
    if (!context) return false;

    try {
      if (context.state === "suspended") {
        void context.resume().catch(() => undefined);
      }

      this.graph ??= buildGraph(context, this.random);
      scheduleCue(context, this.graph, consoleSoundCues[sound], this.random);

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
