"use client";

import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import {
  type ReactNode,
  useEffect,
  useEffectEvent,
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { flushSync } from "react-dom";
import { ConsoleBanner } from "@/components/console/console-banner";
import {
  type ConsoleBannerIntro,
  nextBannerIntro,
} from "@/components/console/console-banner-typing";
import {
  type ConsoleDragBounds,
  type ConsoleDragOffset,
  clampConsoleOffset,
  consoleDockedOffset,
  consoleDragBounds,
  isConsoleDocked,
  trackConsoleOffset,
} from "@/components/console/console-drag";
import {
  type ConsoleArrival,
  consoleArrivalStep,
  focusPageTitle,
} from "@/components/console/console-focus";
import { isTypingKeystroke } from "@/components/console/console-keystroke";
import {
  type ConsoleDock,
  useSiteConsole,
} from "@/components/console/console-provider";
import {
  bootLines,
  type ConsoleContext,
  type ConsoleLine,
  candidateLine,
  completeInput,
  consoleRoutes,
  displayPath,
  interruptLine,
  promptLine,
  runCommand,
} from "@/components/console/console-session";
import {
  consoleViewportVariableNames,
  consoleViewportVariables,
} from "@/components/console/console-viewport";
import type { NavItem, SiteConsoleContent } from "@/content/site-content";
import { defaultThemeSetting, isThemeSetting } from "@/lib/theme-setting";
import { useMediaQuery } from "@/lib/use-media-query";
import { cn } from "@/lib/utils/cn";

type SiteConsoleProps = {
  content: SiteConsoleContent;
  wayfinding: NavItem[];
};

/* Tailwind's `lg`. Below it the window always docks to the bottom edge — a
 * column in the right corner has no room on a phone. */
const desktopQuery = "(min-width: 64rem)";

/* The banner types itself on the first open. A reader who has asked for less
 * motion gets it already printed, and the prompt straight away. */
const reducedMotionQuery = "(prefers-reduced-motion: reduce)";

/* `K` opens the console from anywhere on the page, but never from inside a
 * field where the reader is typing — that includes the console's own input. */
function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;

  return (
    target.isContentEditable ||
    target instanceof HTMLInputElement ||
    target instanceof HTMLTextAreaElement ||
    target instanceof HTMLSelectElement
  );
}

/* No focus the console places scrolls anything. The page stays where the
 * reader left it, and the session stays where it was read to: the first open
 * rests on the greeting, and a reader who has scrolled back through the output
 * keeps their place when a drag or a light gives the prompt its focus back. */
function focusPrompt(input: HTMLInputElement | null) {
  input?.focus({ preventScroll: true });
}

/* Keep the newest line — and the prompt below it — in view. */
function followSession(
  scroller: HTMLDivElement | null,
  behavior: ScrollBehavior = "instant",
) {
  scroller?.scrollTo({ top: scroller.scrollHeight, behavior });
}

/* Where the session sits: on its newest line, or on its top while the first
 * open still rests on the greeting. */
function settleSession(
  scroller: HTMLDivElement | null,
  restsOnGreeting: boolean,
) {
  if (!scroller) return;
  if (restsOnGreeting) scroller.scrollTop = 0;
  else followSession(scroller);
}

/* Which edge the session's text sits against: a short session starts at the
 * top of the window, a long one is scrolled down to its prompt. A dock move
 * pins each photograph of the session to its own edge, so the text holds
 * still in the window while the window changes size around it. */
function sessionAnchor(scroller: HTMLDivElement | null): "top" | "bottom" {
  return scroller && scroller.scrollHeight > scroller.clientHeight
    ? "bottom"
    : "top";
}

/* How the dragged window is moving right now, mirrored onto `data-drag` for
 * the stylesheet. Absent while it rests. */
type ConsoleDragPhase = "tracking" | "release" | "home";

type ConsoleDragGesture = {
  pointerId: number;
  startX: number;
  startY: number;
  origin: ConsoleDragOffset;
  bounds: ConsoleDragBounds;
};

type ConsoleDragState = {
  /** Where the window is headed: under the pointer, or where it will settle. */
  offset: ConsoleDragOffset;
  /** The pointer that holds the title bar, while one does. */
  gesture: ConsoleDragGesture | null;
};

/* The drag offset rides `transform`, which the open and close transitions
 * leave alone — they move the window with the individual `translate` and
 * `scale` properties, and the two compose. */
function writeDragOffset(panel: HTMLElement, offset: ConsoleDragOffset) {
  panel.style.transform = isConsoleDocked(offset)
    ? ""
    : `translate3d(${offset.x}px, ${offset.y}px, 0)`;
}

function setDragPhase(panel: HTMLElement, phase: ConsoleDragPhase | null) {
  if (phase) panel.dataset.drag = phase;
  else delete panel.dataset.drag;
}

/* Straight back to the dock, with no motion of its own — for when the window
 * is hidden, or when a view transition is carrying the move. */
function dropDrag(panel: HTMLElement | null, drag: ConsoleDragState) {
  drag.gesture = null;
  drag.offset = consoleDockedOffset;
  if (!panel) return;

  setDragPhase(panel, null);
  writeDragOffset(panel, consoleDockedOffset);
}

/* The window's bounds from its dock, measured on screen with the drag offset
 * taken back out. */
function dragBoundsFor(
  panel: HTMLElement,
  offset: ConsoleDragOffset,
): ConsoleDragBounds {
  const rect = panel.getBoundingClientRect();
  const root = document.documentElement;

  return consoleDragBounds(
    {
      left: rect.left - offset.x,
      top: rect.top - offset.y,
      right: rect.right - offset.x,
      bottom: rect.bottom - offset.y,
    },
    { width: root.clientWidth, height: root.clientHeight },
  );
}

type TrafficLightTone = "close" | "minimize" | "zoom";

const lightTone: Record<TrafficLightTone, string> = {
  close: "bg-console-light-close",
  minimize: "bg-console-light-minimize",
  zoom: "bg-console-light-zoom",
};

/* The glyphs macOS draws when the pointer reaches the lights: a cross, a bar,
 * and the two zoom triangles. Ink on the light, not white — they are quoted
 * from the platform like the colours are. */
const lightGlyph: Record<TrafficLightTone, ReactNode> = {
  close: (
    <path
      d="M3 3l4 4m0-4L3 7"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeWidth="1.2"
    />
  ),
  minimize: (
    <path
      d="M2.5 5h5"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeWidth="1.2"
    />
  ),
  zoom: <path d="M2 8V4.4L5.6 8ZM8 2v3.6L4.4 2Z" fill="currentColor" />,
};

type TrafficLightProps = {
  tone: TrafficLightTone;
  label: string;
  onClick: () => void;
  pressed?: boolean;
  disabled?: boolean;
};

/* An 11px light inside a 24px hit box, at every width. The platform sets its
 * lights on a 20px pitch, and 20px boxes that close together leave each
 * target under the 24px minimum with no spacing to make up for it, so the
 * lights sit 4px further apart than the ones they quote. Hovering any light
 * reveals the glyphs on all three, as the platform does. A disabled light is
 * only dimmed: the dashed frame other disabled controls wear would draw a
 * square around a round light. */
function TrafficLight({
  tone,
  label,
  onClick,
  pressed,
  disabled,
}: TrafficLightProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      aria-pressed={pressed}
      disabled={disabled}
      className="flex size-6 cursor-pointer items-center justify-center disabled:cursor-default disabled:opacity-40"
    >
      <span
        className={cn(
          "flex size-2.75 items-center justify-center rounded-full text-black/60",
          lightTone[tone],
        )}
      >
        <svg
          aria-hidden="true"
          viewBox="0 0 10 10"
          className="size-2 opacity-0 transition-opacity duration-fast group-focus-within/lights:opacity-100 group-hover/lights:opacity-100"
        >
          {lightGlyph[tone]}
        </svg>
      </span>
    </button>
  );
}

function hasModifier(event: React.KeyboardEvent) {
  return event.shiftKey || event.altKey || event.ctrlKey || event.metaKey;
}

/* Ctrl and the key alone. Command stays the platform's, so on macOS Cmd+C
 * still copies and Cmd+L still reaches the address bar. */
function isControlKey(event: React.KeyboardEvent, key: string) {
  return (
    event.ctrlKey &&
    !event.metaKey &&
    !event.altKey &&
    !event.shiftKey &&
    event.key.toLowerCase() === key
  );
}

/* Text selected in the prompt, or in the session above it. */
function hasSelection(field: HTMLInputElement) {
  return (
    field.selectionStart !== field.selectionEnd ||
    (window.getSelection()?.toString() ?? "") !== ""
  );
}

/* Hydration is the only thing `isHydrated` waits for; nothing changes after. */
function subscribeToNothing() {
  return () => {};
}

/**
 * The site console.
 *
 * One dark window in both themes — a terminal that repaints itself for light
 * mode stops reading as a terminal. It mounts once at the root so the session
 * survives navigation, and it opens on a click or `K`, long after load, so
 * none of it touches first paint.
 *
 * It docks in one of two places: a column in the right corner (the default on
 * desktop) or along the bottom edge. The amber light moves it to the bottom,
 * the green light to the right — the same two lights that minimise and zoom a
 * window on the platform the chrome is quoted from.
 *
 * On desktop the title bar also drags the window anywhere on screen. It stays
 * where it was put until it closes, or until the amber or green light sends
 * it back to a dock.
 *
 * Motion lives in `app/motion.css` (`.notebook-console`): the panel stays in
 * the DOM and transitions between its closed and open states, which gives the
 * exit the same choreography as the entrance without anything watching for
 * unmount.
 */
export function SiteConsole({ content, wayfinding }: SiteConsoleProps) {
  const {
    isOpen,
    close,
    toggle,
    dock: preferredDock,
    setDock,
    soundsEnabled,
    setSoundsEnabled,
    playSound,
    playTimedSound,
    panelId,
  } = useSiteConsole();
  const isDesktop = useMediaQuery(desktopQuery);
  const prefersReducedMotion = useMediaQuery(reducedMotionQuery);
  const dock = isDesktop ? preferredDock : "bottom";

  const [lines, setLines] = useState<ConsoleLine[]>([]);
  /* The banner is boot output like the lines under it, so `clear` takes it
   * with the rest of the session. */
  const [hasBanner, setHasBanner] = useState(true);
  const [intro, setIntro] = useState<ConsoleBannerIntro>("pending");
  const [input, setInput] = useState("");
  const [caretIndex, setCaretIndex] = useState(0);
  /* How far a line longer than the prompt has scrolled the field. */
  const [inputScroll, setInputScroll] = useState(0);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [history, setHistory] = useState<string[]>([]);
  const [historyCursor, setHistoryCursor] = useState<number | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const sessionOpenedAtRef = useRef<Date | null>(null);
  const redockRef = useRef<ViewTransition | null>(null);
  /* A command that closes the window lets its last line show first. */
  const closeTimerRef = useRef<number | null>(null);
  /* A page command whose page title is waiting for focus. */
  const arrivalRef = useRef<ConsoleArrival | null>(null);
  /* The first open rests on the greeting: the session stays on its top, where
   * the banner types, until the reader takes it over — a key or a command at
   * the prompt, a touch or a wheel on the session, a move to the other dock —
   * and follows the prompt from then on.
   *
   * On a phone the software keyboard rises as the window opens, and on its way
   * up both this component and the browser would carry the session down to
   * the focused prompt, so the greeting was heard typing out of sight. While
   * the session rests, a scroll the reader did not make is put back.
   *
   * It rests only while the greeting types. Once it has been typed the
   * session glides down to the prompt, so on a window too short for the whole
   * boot text (a phone, with the keyboard up) the prompt comes into view
   * without the reader having to find it. A banner printed whole, for a
   * reader who has asked for less motion, gives the session nothing to wait
   * for. */
  const restsOnGreetingRef = useRef(true);
  /* The drag never goes through React state: a render per pointer move would
   * drop frames, so the offset is written straight onto the window. */
  const dragRef = useRef<ConsoleDragState>({
    offset: consoleDockedOffset,
    gesture: null,
  });

  const router = useRouter();
  const pathname = usePathname();
  const isHydrated = useSyncExternalStore(
    subscribeToNothing,
    () => true,
    () => false,
  );
  const { theme, systemTheme, setTheme } = useTheme();
  const isRestingOnGreeting = useEffectEvent(
    () => restsOnGreetingRef.current && intro !== "done",
  );

  /* Where the reader was before this route, for `cd -`. */
  const previousPathnameRef = useRef<string | null>(null);
  const lastPathnameRef = useRef(pathname);

  useEffect(() => {
    if (lastPathnameRef.current === pathname) return;

    previousPathnameRef.current = lastPathnameRef.current;
    lastPathnameRef.current = pathname;
  }, [pathname]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      /* Esc closes one layer at a time. A layer that holds focus handles
       * its own Esc first and marks it handled, as the Site Header's
       * disclosure does. With focus in neither, the window is the top layer
       * and goes first. */
      if (event.key === "Escape") {
        if (!isOpen || event.defaultPrevented) return;
        event.preventDefault();
        close();
        return;
      }

      if (
        event.key.toLowerCase() !== "k" ||
        event.metaKey ||
        event.ctrlKey ||
        event.altKey ||
        event.repeat ||
        isEditableTarget(event.target)
      ) {
        return;
      }

      event.preventDefault();
      toggle(document.activeElement);
    }

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isOpen, close, toggle]);

  /* Below `lg` the window docks to the bottom edge, where the software
   * keyboard would otherwise sit on top of the prompt. Measure the two
   * viewports against each other while the window is open and hand the
   * difference to the stylesheet, which lifts the window clear of the
   * keyboard and trims it to the screen that is left. */
  useEffect(() => {
    const panel = panelRef.current;

    if (!isOpen || isDesktop || !panel) return;

    const viewport = window.visualViewport;

    const syncViewport = () => {
      const variables = consoleViewportVariables({
        offsetTop: viewport?.offsetTop ?? 0,
        height: viewport?.height ?? window.innerHeight,
        layoutHeight: document.documentElement.clientHeight,
      });

      for (const [name, value] of Object.entries(variables)) {
        panel.style.setProperty(name, value);
      }

      settleSession(scrollRef.current, isRestingOnGreeting());
    };

    syncViewport();
    viewport?.addEventListener("resize", syncViewport);
    viewport?.addEventListener("scroll", syncViewport, { passive: true });
    window.addEventListener("resize", syncViewport);

    return () => {
      viewport?.removeEventListener("resize", syncViewport);
      viewport?.removeEventListener("scroll", syncViewport);
      window.removeEventListener("resize", syncViewport);

      for (const name of consoleViewportVariableNames) {
        panel.style.removeProperty(name);
      }
    };
  }, [isDesktop, isOpen]);

  /* A window dragged away comes back to its dock the next time it opens.
   * Resetting as it opens rather than as it closes lets the exit play where
   * the window was, and it lands before paint, so the entrance starts home. */
  useLayoutEffect(() => {
    if (isOpen) dropDrag(panelRef.current, dragRef.current);
  }, [isOpen]);

  /* Keep a dragged window on screen as the viewport changes under it. Below
   * `lg` there is no dragging, so the window goes home. */
  useEffect(() => {
    const panel = panelRef.current;
    const drag = dragRef.current;

    if (!isOpen || !panel) return;

    if (!isDesktop) {
      dropDrag(panel, drag);
      return;
    }

    const keepOnScreen = () => {
      if (isConsoleDocked(drag.offset) || drag.gesture) return;

      const settled = clampConsoleOffset(
        drag.offset,
        dragBoundsFor(panel, drag.offset),
      );
      drag.offset = settled;
      setDragPhase(panel, null);
      writeDragOffset(panel, settled);
    };

    window.addEventListener("resize", keepOnScreen);
    return () => window.removeEventListener("resize", keepOnScreen);
  }, [isDesktop, isOpen]);

  useEffect(() => {
    if (isOpen) focusPrompt(inputRef.current);
  }, [isOpen]);

  /* A close that gets there first, from Esc or the red light, cancels the one
   * a command has scheduled. */
  useEffect(() => {
    if (!isOpen) return;

    return () => {
      if (closeTimerRef.current !== null) {
        window.clearTimeout(closeTimerRef.current);
        closeTimerRef.current = null;
      }
    };
  }, [isOpen]);

  /* A page command hands focus to the title of the page it opened, once the
   * window has closed and the route has landed, in whichever order those
   * happen. */
  useEffect(() => {
    const arrival = arrivalRef.current;
    if (!arrival) return;

    const step = consoleArrivalStep(arrival, { isOpen, pathname });
    if (step === "wait") return;

    arrivalRef.current = null;
    if (step === "arrive") focusPageTitle(document, panelRef.current);
  }, [isOpen, pathname]);

  /* A reload remounts this component, intentionally starting a new session.
   * Within one mount, reopening keeps the original login timestamp and output. */
  useEffect(() => {
    if (!isOpen || sessionOpenedAtRef.current) return;

    const openedAt = new Date();
    sessionOpenedAtRef.current = openedAt;
    setLines(bootLines(openedAt));
  }, [isOpen]);

  useEffect(() => {
    setIntro((current) =>
      nextBannerIntro(current, { isOpen, prefersReducedMotion }),
    );
  }, [isOpen, prefersReducedMotion]);

  /* The greeting has been typed, or printed whole, and the session goes on to
   * the prompt: gliding after typing, and simply there under reduced motion,
   * where nothing on the window moves. */
  const leaveGreeting = useEffectEvent(() => {
    releaseGreeting({
      follow: true,
      behavior: prefersReducedMotion ? "instant" : "smooth",
    });
  });

  useEffect(() => {
    if (isOpen && intro === "done") leaveGreeting();
  }, [intro, isOpen]);

  /* Follow the session to its newest line, and once more on open, since a
   * hidden scroller cannot be scrolled. A session resting on the greeting
   * holds its top instead, through the banner's typing and after it, so on a
   * window too short for the whole boot text the prompt waits below until
   * the reader reaches for it. */
  useEffect(() => {
    if (!isOpen || lines.length === 0) return;
    settleSession(scrollRef.current, isRestingOnGreeting());
  }, [lines, isOpen]);

  /* The reader has taken the session over. At the prompt it follows them
   * there; a touch or a wheel on the session is theirs to scroll. */
  function releaseGreeting({
    follow,
    behavior,
  }: {
    follow: boolean;
    behavior?: ScrollBehavior;
  }) {
    if (!restsOnGreetingRef.current) return;

    restsOnGreetingRef.current = false;
    if (follow) followSession(scrollRef.current, behavior);
  }

  function holdGreeting(event: React.UIEvent<HTMLDivElement>) {
    if (restsOnGreetingRef.current && intro !== "done") {
      event.currentTarget.scrollTop = 0;
    }
  }

  function submit(event: React.FormEvent) {
    event.preventDefault();

    const entered = input;
    if (entered.trim()) playSound("command");
    const context: ConsoleContext = {
      identityName: content.identity.name,
      identityRole: content.identity.role,
      identityLocation: content.identity.location,
      routes: consoleRoutes(wayfinding),
      pathname,
      previousPathname: previousPathnameRef.current,
      soundsEnabled,
      appearance: {
        setting: isThemeSetting(theme) ? theme : defaultThemeSetting,
        system: systemTheme ?? "light",
      },
      repositoryUrl: content.repositoryUrl,
      records: content.records,
    };
    const result = runCommand(entered, context);

    /* Typing outranks the intro. The banner prints the rest at once, its
     * keystrokes stop, and the session goes back to following its prompt. */
    setIntro("done");
    releaseGreeting({ follow: false });
    setHistory((current) => [...current, entered]);
    setHistoryCursor(null);
    setInput("");
    setCaretIndex(0);

    let cleared = false;
    let destination: string | null = null;

    for (const effect of result.effects) {
      if (effect.type === "clear") cleared = true;
      if (effect.type === "navigate") {
        router.push(effect.href);
        destination = effect.href;
      }
      if (effect.type === "open")
        window.open(effect.href, "_blank", "noopener");
      if (effect.type === "theme") setTheme(effect.setting);
      if (effect.type === "sound") setSoundsEnabled(effect.enabled);
      if (effect.type === "close") {
        /* `exit` gives focus back to where it was before the window
         * opened. A page command gives it to the page it opened instead. */
        const from = pathname;
        closeTimerRef.current = window.setTimeout(() => {
          closeTimerRef.current = null;
          if (destination) arrivalRef.current = { href: destination, from };
          close({ returnFocus: destination === null });
        }, 220);
      }
    }

    if (cleared) setHasBanner(false);

    setLines((current) =>
      cleared
        ? []
        : [
            ...current,
            promptLine(entered, displayPath(pathname)),
            ...result.lines,
          ],
    );
  }

  function recall(value: string) {
    setInput(value);
    setCaretIndex(value.length);
  }

  function onInputKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    releaseGreeting({ follow: true });

    /* A key press is a gesture, so the reader's own keystrokes may start the
     * audio. The reader has the keyboard from the first one: the banner
     * prints the rest at once rather than typing over them. */
    if (isTypingKeystroke(event.nativeEvent)) {
      playSound("keystroke");
      setIntro("done");
    }

    /* Tab completes what is on the line. On an empty prompt there is
     * nothing to complete, and Tab moves focus on, as it does from any
     * field: the window is not modal, so it never keeps focus in. */
    if (event.key === "Tab" && !hasModifier(event) && input.trim() !== "") {
      event.preventDefault();

      const completion = completeInput(input, {
        routes: consoleRoutes(wayfinding),
      });
      if (completion.candidates.length > 0) {
        setLines((current) => [
          ...current,
          promptLine(input, displayPath(pathname)),
          candidateLine(completion.candidates),
        ]);
      }
      recall(completion.value);
      return;
    }

    /* Ctrl+C abandons the line, as in a shell, and leaves it in the session
     * marked `^C`. A selection is still the reader's to copy: where Ctrl+C is
     * the copy key, it copies. */
    if (isControlKey(event, "c") && !hasSelection(event.currentTarget)) {
      event.preventDefault();
      setIntro("done");
      setLines((current) => [
        ...current,
        interruptLine(input, displayPath(pathname)),
      ]);
      setHistoryCursor(null);
      recall("");
      return;
    }

    /* Ctrl+L clears the session as `clear` does, and keeps the line. */
    if (isControlKey(event, "l")) {
      event.preventDefault();
      setIntro("done");
      setHasBanner(false);
      setLines([]);
      return;
    }

    if (event.key === "ArrowUp" && history.length > 0) {
      event.preventDefault();
      const next =
        historyCursor === null
          ? history.length - 1
          : Math.max(0, historyCursor - 1);
      setHistoryCursor(next);
      recall(history[next]);
      return;
    }

    if (event.key === "ArrowDown" && historyCursor !== null) {
      event.preventDefault();
      const next = historyCursor + 1;

      if (next >= history.length) {
        setHistoryCursor(null);
        recall("");
        return;
      }

      setHistoryCursor(next);
      recall(history[next]);
    }
  }

  /* Where the window is on screen right now. Mid-settle that is somewhere
   * along the transition, not where it is headed, so a window caught in
   * flight is picked up from where it was caught. */
  function currentDragOffset(panel: HTMLElement): ConsoleDragOffset {
    if (panel.dataset.drag !== "release" && panel.dataset.drag !== "home") {
      return dragRef.current.offset;
    }

    const transform = getComputedStyle(panel).transform;
    if (transform === "none") return consoleDockedOffset;

    const matrix = new DOMMatrixReadOnly(transform);
    return { x: matrix.m41, y: matrix.m42 };
  }

  /* The title bar is the handle, as on the platform the chrome is quoted
   * from. The lights and controls inside it stay buttons. */
  function onChromePointerDown(event: React.PointerEvent<HTMLDivElement>) {
    const panel = panelRef.current;

    if (!panel || !isDesktop || !event.isPrimary || event.button !== 0) return;
    if (event.target instanceof Element && event.target.closest("button")) {
      return;
    }

    /* No text selection in the title, and the prompt keeps focus. */
    event.preventDefault();

    const drag = dragRef.current;
    const origin = currentDragOffset(panel);
    drag.offset = origin;
    setDragPhase(panel, "tracking");
    writeDragOffset(panel, origin);

    drag.gesture = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      origin,
      bounds: dragBoundsFor(panel, origin),
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  /* While the pointer is down the window is the pointer: no easing, no
   * transition, one write per move. */
  function onChromePointerMove(event: React.PointerEvent<HTMLDivElement>) {
    const panel = panelRef.current;
    const drag = dragRef.current;
    const gesture = drag.gesture;

    if (!panel || gesture?.pointerId !== event.pointerId) return;

    const offset = trackConsoleOffset(
      {
        x: gesture.origin.x + event.clientX - gesture.startX,
        y: gesture.origin.y + event.clientY - gesture.startY,
      },
      gesture.bounds,
    );
    drag.offset = offset;
    writeDragOffset(panel, offset);
  }

  /* On release the window stays where it was let go. Only a window pulled
   * past an edge moves again, settling back inside on the spring — the one
   * console motion with a bounce, because only a drag applied any force. */
  function onChromePointerUp(event: React.PointerEvent<HTMLDivElement>) {
    const panel = panelRef.current;
    const drag = dragRef.current;
    const gesture = drag.gesture;

    if (!panel || gesture?.pointerId !== event.pointerId) return;

    const offset = drag.offset;
    const settled = clampConsoleOffset(offset, gesture.bounds);
    const overshot = settled.x !== offset.x || settled.y !== offset.y;

    drag.gesture = null;
    drag.offset = settled;
    setDragPhase(panel, overshot ? "release" : null);
    writeDragOffset(panel, settled);
    focusPrompt(inputRef.current);
  }

  function onPanelTransitionEnd(event: React.TransitionEvent<HTMLElement>) {
    if (event.target !== event.currentTarget) return;
    if (event.propertyName !== "transform") return;

    const phase = event.currentTarget.dataset.drag;
    if (phase === "release" || phase === "home") {
      setDragPhase(event.currentTarget, null);
    }
  }

  /* Clicking a light moves focus onto it; a docked window should still be
   * ready to type into, with the prompt in view once the new width has
   * reflowed the session.
   *
   * The move itself is a view transition: the browser photographs the window
   * in both docks and morphs one into the other, so the size change never
   * animates layout. The new dock is committed synchronously inside the
   * update, and the session is scrolled before the second photograph is
   * taken, so the morph lands on the prompt instead of jumping to it after.
   * `data-console-redock` scopes the transition to the console — see
   * `app/motion.css`. */
  function moveTo(target: ConsoleDock) {
    const panel = panelRef.current;
    const drag = dragRef.current;
    const isAway = !isConsoleDocked(drag.offset);

    if (target === dock && !isAway) return;

    releaseGreeting({ follow: false });
    playSound(target === "side" ? "dock-side" : "dock-bottom");

    /* The light for the dock the window already belongs to brings a dragged
     * window home. Pressed, not thrown, so it glides back without a bounce;
     * the stylesheet drops the glide for a reader who asks for less motion. */
    if (target === dock) {
      if (panel) {
        drag.offset = consoleDockedOffset;
        setDragPhase(panel, "home");
        writeDragOffset(panel, consoleDockedOffset);
      }
      focusPrompt(inputRef.current);
      return;
    }

    /* A dragged window leaves for the other dock from where it was dragged
     * to: the offset is dropped inside the update, so the old photograph is
     * taken where the window is and the morph starts there. */
    const redock = () => {
      flushSync(() => setDock(target));
      dropDrag(panelRef.current, drag);
      followSession(scrollRef.current);
    };

    if (prefersReducedMotion || !document.startViewTransition) {
      redock();
    } else {
      const root = document.documentElement;
      root.dataset.consoleRedock = "";
      root.style.setProperty(
        "--console-dock-old-anchor",
        sessionAnchor(scrollRef.current),
      );

      const transition = document.startViewTransition(() => {
        redock();
        root.style.setProperty(
          "--console-dock-new-anchor",
          sessionAnchor(scrollRef.current),
        );
      });
      redockRef.current = transition;

      /* A second move skips the first transition, which settles its promise
       * while the second still needs the names in place. */
      transition.finished.finally(() => {
        if (redockRef.current !== transition) return;
        redockRef.current = null;
        delete root.dataset.consoleRedock;
        root.style.removeProperty("--console-dock-old-anchor");
        root.style.removeProperty("--console-dock-new-anchor");
      });
    }

    focusPrompt(inputRef.current);
  }

  /* The block caret is drawn, not native: `caret-transparent` hides the
   * browser's bar and a span sits where the selection start is, measured by
   * mirroring the text before it in the same face. */
  function syncCaret(event: React.SyntheticEvent<HTMLInputElement>) {
    const field = event.currentTarget;
    setCaretIndex(field.selectionStart ?? field.value.length);
    setInputScroll(field.scrollLeft);
  }

  return (
    <section
      ref={panelRef}
      id={panelId}
      data-open={isOpen}
      data-dock={dock}
      data-mobile={!isDesktop}
      aria-label="Site console"
      onTransitionEnd={onPanelTransitionEnd}
      className={cn(
        "notebook-console fixed z-50 flex flex-col overflow-hidden rounded-console border border-console-rule bg-console-surface shadow-console",
        dock === "side"
          ? "right-6 bottom-6 h-console-side w-console-side"
          : "inset-x-6 bottom-6",
      )}
    >
      <div
        onPointerDown={onChromePointerDown}
        onPointerMove={onChromePointerMove}
        onPointerUp={onChromePointerUp}
        onPointerCancel={onChromePointerUp}
        className="console-chrome flex shrink-0 select-none items-center gap-3 border-console-rule border-b bg-console-chrome px-3.5 py-2.5 lg:cursor-grab lg:in-data-[drag=tracking]:cursor-grabbing lg:touch-none"
      >
        <div className="console-lights group/lights -ml-1.5 flex">
          <TrafficLight
            tone="close"
            label="Close console"
            onClick={() => close()}
          />
          <TrafficLight
            tone="minimize"
            label="Dock the console to the bottom edge"
            pressed={dock === "bottom"}
            disabled={!isDesktop}
            onClick={() => moveTo("bottom")}
          />
          <TrafficLight
            tone="zoom"
            label="Dock the console to the right corner"
            pressed={dock === "side"}
            disabled={!isDesktop}
            onClick={() => moveTo("side")}
          />
        </div>
        {/* A phone's title bar has room for the user and host, not the
         * path as well, and a title cut off mid-word reads as broken. */}
        <p className="console-title mx-auto truncate font-mono text-console-ink-muted text-xs">
          cu@portfolio
          <span className="max-sm:hidden"> — ~/constantin-unterkofler.com</span>
        </p>
        {/* A toggle keeps one name and says its state as pressed or not.
         * The caption's "on" or "off" is that state written out, so it is
         * left out of the name: "Sound", pressed. The name still starts
         * with the caption, so speaking what is on screen presses it. */}
        <button
          type="button"
          onClick={() => setSoundsEnabled(!soundsEnabled)}
          aria-pressed={soundsEnabled}
          className="console-sound label -my-2.5 flex cursor-pointer items-center self-stretch px-1.5 text-console-ink-muted text-micro"
        >
          <span className="console-caption">
            Sound<span aria-hidden> {soundsEnabled ? "on" : "off"}</span>
          </span>
        </button>
        <button
          type="button"
          onClick={() => close()}
          aria-label="Esc, close console"
          aria-keyshortcuts="Escape"
          className="console-esc label -my-2.5 -mr-1.5 flex cursor-pointer items-center self-stretch px-1.5 text-console-ink-muted text-micro"
        >
          <span className="console-caption">Esc</span>
        </button>
      </div>

      <div
        ref={scrollRef}
        onScroll={holdGreeting}
        onPointerDown={() => releaseGreeting({ follow: false })}
        onWheel={() => releaseGreeting({ follow: false })}
        className={cn(
          "console-scroll console-session overflow-y-auto overscroll-contain px-5.5 py-4.5 font-mono text-console-ink text-sm leading-console lg:overscroll-auto",
          dock === "side"
            ? "min-h-0 flex-1"
            : "max-h-console-body min-h-console-body",
        )}
      >
        <div role="log" aria-live="polite" aria-relevant="additions text">
          {hasBanner ? (
            <ConsoleBanner
              intro={intro}
              onIntroEnd={() => setIntro("done")}
              onKeystroke={() => playTimedSound("keystroke")}
            />
          ) : null}

          {lines.map((entry) =>
            entry.kind === "prompt" ? (
              <p key={entry.id} className="mt-2.5">
                <span className="text-console-accent">{entry.path ?? "~"}</span>{" "}
                <span aria-hidden className="text-console-ink-muted">
                  ❯
                </span>{" "}
                {entry.text}
              </p>
            ) : entry.name ? (
              <p key={entry.id} className="grid grid-cols-console-help gap-x-5">
                <span className="text-console-command">{entry.name}</span>
                <span className="text-console-output">{entry.text}</span>
              </p>
            ) : (
              <p
                key={entry.id}
                className={
                  entry.kind === "error"
                    ? "text-console-error"
                    : entry.kind === "muted"
                      ? "text-console-ink-muted"
                      : entry.kind === "output"
                        ? "text-console-output"
                        : undefined
                }
              >
                {/* An empty line still takes its line-height. */}
                {entry.text === "" ? " " : entry.text}
              </p>
            ),
          )}
        </div>

        <form onSubmit={submit} className="mt-2.5 flex items-center gap-2">
          {/* The path is written once the page has hydrated. The 404 sheet is
           * prerendered once, as `/_not-found`, and served for every unknown
           * URL, so a path written on the server named `~/_not-found` and
           * failed hydration against the URL the reader typed. The window is
           * closed at load, so nobody sees the path arrive. */}
          <span aria-hidden className="text-console-accent">
            {isHydrated ? displayPath(pathname) : null}
          </span>
          <span aria-hidden className="text-console-ink-muted">
            ❯
          </span>
          {/* A line longer than the prompt scrolls inside the field, and the
           * drawn caret scrolls with it; the field's end padding keeps room
           * for the block after the last character. */}
          <div className="relative min-w-0 flex-1 overflow-hidden">
            <input
              ref={inputRef}
              name="command"
              value={input}
              onChange={(event) => {
                /* A software keyboard's keys can arrive without a keydown to
                 * name them, but every one still changes the line. */
                releaseGreeting({ follow: true });
                setInput(event.target.value);
                syncCaret(event);
              }}
              onSelect={syncCaret}
              onScroll={syncCaret}
              onFocus={() => setIsInputFocused(true)}
              onBlur={() => setIsInputFocused(false)}
              onKeyDown={onInputKeyDown}
              spellCheck={false}
              autoComplete="off"
              autoCapitalize="none"
              aria-label="Console input"
              className="w-full bg-transparent p-0 pe-2 font-mono text-base text-console-ink caret-transparent outline-none lg:text-sm"
            />
            <span
              aria-hidden
              style={{ translate: `${-inputScroll}px 0` }}
              className="pointer-events-none absolute inset-y-0 left-0 flex items-center whitespace-pre text-base lg:text-sm"
            >
              <span className="invisible">{input.slice(0, caretIndex)}</span>
              <span
                className={cn(
                  "h-4 w-2 bg-console-command",
                  isInputFocused ? "animate-caret" : "opacity-40",
                )}
              />
            </span>
          </div>
        </form>
      </div>
    </section>
  );
}
