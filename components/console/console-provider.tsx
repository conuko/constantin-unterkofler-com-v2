"use client";

import {
  createContext,
  type ReactNode,
  type RefObject,
  useCallback,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import {
  type ConsoleSound,
  consoleSoundsEnabled,
  persistConsoleSoundsEnabled,
  playConsoleSound,
} from "@/lib/console-sound";

/** Where the open window sits: a column in the right corner, or along the bottom edge. */
export type ConsoleDock = "side" | "bottom";

type SiteConsoleState = {
  isOpen: boolean;
  close: () => void;
  toggle: () => void;
  /** The reader's preference. Below `lg` the panel ignores it and docks bottom. */
  dock: ConsoleDock;
  setDock: (dock: ConsoleDock) => void;
  soundsEnabled: boolean;
  setSoundsEnabled: (enabled: boolean) => void;
  /** Non-essential interaction feedback; unavailable audio leaves controls intact. */
  playSound: (sound: ConsoleSound) => void;
  panelId: string;
  /** The control that opened the window; focus returns here on close. */
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
  const panelId = useId();

  /* The server and hydrating client agree on the enabled default. A stored
   * preference is read only after hydration, because browser storage is not a
   * rendering input. */
  useEffect(() => {
    setSoundsEnabledState(consoleSoundsEnabled(soundStorage()));
  }, []);

  const playSound = useCallback(
    (sound: ConsoleSound) => {
      if (soundsEnabled) playConsoleSound(sound);
    },
    [soundsEnabled],
  );

  const setSoundsEnabled = useCallback((enabled: boolean) => {
    setSoundsEnabledState(enabled);
    persistConsoleSoundsEnabled(soundStorage(), enabled);
  }, []);

  const close = useCallback(() => {
    if (isOpen) playSound("close");
    setIsOpen(false);
    controlRef.current?.focus();
  }, [isOpen, playSound]);

  const toggle = useCallback(() => {
    playSound(isOpen ? "close" : "open");
    setIsOpen(!isOpen);
  }, [isOpen, playSound]);

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
