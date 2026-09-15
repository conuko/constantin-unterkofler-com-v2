"use client";

import {
  createContext,
  type ReactNode,
  type RefObject,
  useCallback,
  useContext,
  useId,
  useRef,
  useState,
} from "react";

/** Where the open window sits: a column in the right corner, or along the bottom edge. */
export type ConsoleDock = "side" | "bottom";

type SiteConsoleState = {
  isOpen: boolean;
  close: () => void;
  toggle: () => void;
  /** The reader's preference. Below `lg` the panel ignores it and docks bottom. */
  dock: ConsoleDock;
  setDock: (dock: ConsoleDock) => void;
  panelId: string;
  /** The control that opened the window; focus returns here on close. */
  controlRef: RefObject<HTMLButtonElement | null>;
};

const SiteConsoleContext = createContext<SiteConsoleState | null>(null);

/**
 * Open/closed and dock state for the site console, held above both the panel
 * and its control. The control lives in the Closing Record, the panel mounts
 * once at the root so the session survives navigation; neither is an ancestor
 * of the other, so the state sits in the layout between them.
 */
export function SiteConsoleProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [dock, setDock] = useState<ConsoleDock>("side");
  const controlRef = useRef<HTMLButtonElement>(null);
  const panelId = useId();

  const close = useCallback(() => {
    setIsOpen(false);
    controlRef.current?.focus();
  }, []);

  const toggle = useCallback(() => {
    setIsOpen((current) => !current);
  }, []);

  return (
    <SiteConsoleContext
      value={{ isOpen, close, toggle, dock, setDock, panelId, controlRef }}
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
