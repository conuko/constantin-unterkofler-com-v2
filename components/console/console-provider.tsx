"use client";

import {
  createContext,
  type ReactNode,
  type RefObject,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import { returnConsoleFocus } from "@/components/console/console-focus";
import {
  type ConsoleSound,
  consoleSoundPlayer,
  consoleSoundsEnabled,
  persistConsoleSoundsEnabled,
} from "@/lib/console-sound";

/** Where the open window sits: a column in the right corner, or along the bottom edge. */
export type ConsoleDock = "side" | "bottom";

type ConsoleCloseOptions = {
  /** Hand focus back to where it was before the window opened. A caller that
   * places focus itself passes `false`, as a page command does when it hands
   * focus to the title of the page it opened. */
  returnFocus?: boolean;
};

type SiteConsoleState = {
  isOpen: boolean;
  close: (options?: ConsoleCloseOptions) => void;
  /** `invoker` is where focus goes back to on close. The control passes
   * itself, because Safari does not focus a button on click. `K` passes
   * whatever had focus. */
  toggle: (invoker: Element | null) => void;
  /** The reader's preference. Below `lg` the panel ignores it and docks bottom. */
  dock: ConsoleDock;
  setDock: (dock: ConsoleDock) => void;
  soundsEnabled: boolean;
  setSoundsEnabled: (enabled: boolean) => void;
  /** Non-essential interaction feedback; unavailable audio leaves controls intact. */
  playSound: (sound: ConsoleSound) => void;
  /** Feedback a timer schedules after an interaction, such as the banner's
   * keystrokes. It never starts audio itself; an interaction has to have. */
  playTimedSound: (sound: ConsoleSound) => void;
  panelId: string;
  /** The control in the Closing Record. Focus goes back to it when whatever
   * opened the window can no longer take focus. */
  controlRef: RefObject<HTMLButtonElement | null>;
};

const SiteConsoleContext = createContext<SiteConsoleState | null>(null);

function soundStorage() {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

/**
 * Open/closed and dock state for the site console, held above both the panel
 * and its control. The control lives in the Closing Record, the panel mounts
 * once at the root so the session survives navigation; neither is an ancestor
 * of the other, so the state sits in the layout between them.
 */
export function SiteConsoleProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [dock, setDock] = useState<ConsoleDock>("side");
  const [soundsEnabled, setSoundsEnabledState] = useState(true);
  const controlRef = useRef<HTMLButtonElement>(null);
  /* What had focus when the window opened: the control, or whatever the reader
   * was on when they pressed `K`. Nothing, when focus was on the document. */
  const invokerRef = useRef<HTMLElement | null>(null);
  const panelId = useId();

  /* The server and hydrating client agree on the enabled default. A stored
   * preference is read only after hydration, because browser storage is not a
   * rendering input. */
  useEffect(() => {
    setSoundsEnabledState(consoleSoundsEnabled(soundStorage()));
  }, []);

  const sounds = useMemo(
    () => consoleSoundPlayer(soundsEnabled),
    [soundsEnabled],
  );
  const playSound = sounds.play;

  const setSoundsEnabled = useCallback((enabled: boolean) => {
    setSoundsEnabledState(enabled);
    persistConsoleSoundsEnabled(soundStorage(), enabled);
  }, []);

  /* Focus goes back to where it came from. When that is gone (a page the
   * console has since navigated away from, a disclosure that has closed, or
   * the document itself) it goes to the control, which the window folds
   * back into. See `console-focus.ts` for when it moves at all. */
  const close = useCallback(
    ({ returnFocus = true }: ConsoleCloseOptions = {}) => {
      if (!isOpen) return;

      playSound("close");
      setIsOpen(false);

      if (returnFocus) {
        returnConsoleFocus(document, document.getElementById(panelId), [
          invokerRef.current,
          controlRef.current,
        ]);
      }
    },
    [isOpen, panelId, playSound],
  );

  const toggle = useCallback(
    (invoker: Element | null) => {
      if (isOpen) {
        close();
        return;
      }

      invokerRef.current =
        invoker instanceof HTMLElement && invoker !== document.body
          ? invoker
          : null;
      playSound("open");
      setIsOpen(true);
    },
    [close, isOpen, playSound],
  );

  return (
    <SiteConsoleContext
      value={{
        isOpen,
        close,
        toggle,
        dock,
        setDock,
        soundsEnabled,
        setSoundsEnabled,
        playSound,
        playTimedSound: sounds.playTimed,
        panelId,
        controlRef,
      }}
    >
      {children}
    </SiteConsoleContext>
  );
}

export function useSiteConsole(): SiteConsoleState {
  const state = useContext(SiteConsoleContext);

  if (!state) {
    throw new Error("useSiteConsole must be used inside SiteConsoleProvider");
  }

  return state;
}
