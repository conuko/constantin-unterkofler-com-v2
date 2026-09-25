"use client";

import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import {
  type ReactNode,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { flushSync } from "react-dom";
import {
  ConsoleBanner,
  type ConsoleBannerIntro,
} from "@/components/console/console-banner";
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
  type ConsoleDock,
  useSiteConsole,
} from "@/components/console/console-provider";
import {
  bootLines,
  type ConsoleContext,
  type ConsoleLine,
  completeCommand,
  consoleRoutes,
  displayPath,
  promptLine,
  runCommand,
} from "@/components/console/console-session";
import {
  consoleViewportVariableNames,
  consoleViewportVariables,
} from "@/components/console/console-viewport";
import type { NavItem, SiteConsoleContent } from "@/content/site-content";
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

/* Keep the newest line — and the prompt below it — in view. */
function followSession(scroller: HTMLDivElement | null) {
  if (scroller) scroller.scrollTop = scroller.scrollHeight;
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

/* An 11px light inside a 20px hit box, opened to 24px on touch so the target
 * clears the minimum. Hovering any light reveals the glyphs on all three, as
 * the platform does. */
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
      className="flex size-6 cursor-pointer items-center justify-center disabled:cursor-default disabled:border disabled:border-console-rule disabled:border-dashed disabled:opacity-40 lg:size-5"
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
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [history, setHistory] = useState<string[]>([]);
  const [historyCursor, setHistoryCursor] = useState<number | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const sessionOpenedAtRef = useRef<Date | null>(null);
  const redockRef = useRef<ViewTransition | null>(null);
  /* The drag never goes through React state: a render per pointer move would
   * drop frames, so the offset is written straight onto the window. */
  const dragRef = useRef<ConsoleDragState>({
    offset: consoleDockedOffset,
    gesture: null,
  });

  const router = useRouter();
  const pathname = usePathname();
  const { resolvedTheme, setTheme } = useTheme();

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
      if (event.key === "Escape") {
        if (isOpen) close();
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
      toggle();
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

      followSession(scrollRef.current);
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
    if (isOpen) inputRef.current?.focus();
  }, [isOpen]);

  /* A reload remounts this component, intentionally starting a new session.
   * Within one mount, reopening keeps the original login timestamp and output. */
  useEffect(() => {
    if (!isOpen || sessionOpenedAtRef.current) return;

    const openedAt = new Date();
    sessionOpenedAtRef.current = openedAt;
    setLines(bootLines(openedAt));
  }, [isOpen]);

  /* The intro runs on the first open and only there. It cannot run at load —
   * the window is hidden then, and the banner would have finished typing
   * before anyone had seen it start. */
  useEffect(() => {
    if (!isOpen) return;

    const opening = prefersReducedMotion ? "done" : "typing";
    setIntro((current) => (current === "pending" ? opening : current));
  }, [isOpen, prefersReducedMotion]);

  /* Follow the session to its newest line, and once more on open, since a
   * hidden scroller cannot be scrolled.
   *
   * The banner is the exception: while it types, the top of the session is
   * the thing to look at, so the prompt waits its turn and the session
   * settles onto it the moment the last word lands. */
  useEffect(() => {
    if (!isOpen || intro === "typing" || lines.length === 0) return;
    followSession(scrollRef.current);
  }, [lines, isOpen, intro]);

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
      repositoryUrl: content.repositoryUrl,
      records: content.records,
    };
    const result = runCommand(entered, context);

    /* Typing outranks the intro. Whatever the banner has printed by now is
     * what it keeps, and the session goes back to following its prompt. */
    setIntro("done");
    setHistory((current) => [...current, entered]);
    setHistoryCursor(null);
    setInput("");
    setCaretIndex(0);

    let cleared = false;

    for (const effect of result.effects) {
      if (effect.type === "clear") cleared = true;
      if (effect.type === "navigate") router.push(effect.href);
      if (effect.type === "open")
        window.open(effect.href, "_blank", "noopener");
      if (effect.type === "theme") {
        setTheme(resolvedTheme === "dark" ? "light" : "dark");
      }
      if (effect.type === "sound") setSoundsEnabled(effect.enabled);
      if (effect.type === "close") {
        window.setTimeout(close, 220);
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
    if (event.key === "Tab" && !event.shiftKey) {
      event.preventDefault();
      recall(completeCommand(input));
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
    inputRef.current?.focus();
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
      inputRef.current?.focus();
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

    inputRef.current?.focus();
  }

  /* The block caret is drawn, not native: `caret-transparent` hides the
   * browser's bar and a span sits where the selection start is, measured by
   * mirroring the text before it in the same face. */
  function syncCaret(event: React.SyntheticEvent<HTMLInputElement>) {
    const field = event.currentTarget;
    setCaretIndex(field.selectionStart ?? field.value.length);
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
        <div className="console-lights group/lights -ml-1 flex">
          <TrafficLight tone="close" label="Close console" onClick={close} />
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
        <p className="console-title mx-auto truncate font-mono text-console-ink-muted text-xs">
          cu@portfolio — ~/constantin-unterkofler.com
        </p>
        <button
          type="button"
          onClick={() => setSoundsEnabled(!soundsEnabled)}
          aria-label={
            soundsEnabled ? "Turn console sounds off" : "Turn console sounds on"
          }
          aria-pressed={soundsEnabled}
          className="console-sound label -my-2.5 cursor-pointer px-1.5 py-2.5 text-console-ink-muted text-micro"
        >
          Sound {soundsEnabled ? "on" : "off"}
        </button>
        <button
          type="button"
          onClick={close}
          className="console-esc label -my-2.5 -mr-1.5 cursor-pointer px-1.5 py-2.5 text-console-ink-muted text-micro"
        >
          Esc
        </button>
      </div>

      <div
        ref={scrollRef}
        className={cn(
          "console-scroll console-session overflow-y-auto overscroll-contain px-5.5 py-4.5 font-mono text-console-ink text-sm leading-console lg:overscroll-auto",
          dock === "side"
            ? "min-h-0 flex-1"
            : "max-h-console-body min-h-console-body",
        )}
      >
        <div role="log" aria-live="polite" aria-relevant="additions text">
          {hasBanner ? (
            <ConsoleBanner intro={intro} onIntroEnd={() => setIntro("done")} />
          ) : null}

          {lines.map((entry) =>
            entry.kind === "prompt" ? (
              <p key={entry.id} className="mt-2.5">
                <span className="text-console-accent">{entry.path ?? "~"}</span>{" "}
                <span className="text-console-ink-muted">❯</span> {entry.text}
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
          <span aria-hidden className="text-console-accent">
            {displayPath(pathname)}
          </span>
          <span aria-hidden className="text-console-ink-muted">
            ❯
          </span>
          <div className="relative min-w-0 flex-1">
            <input
              ref={inputRef}
              value={input}
              onChange={(event) => {
                setInput(event.target.value);
                syncCaret(event);
              }}
              onSelect={syncCaret}
              onFocus={() => setIsInputFocused(true)}
              onBlur={() => setIsInputFocused(false)}
              onKeyDown={onInputKeyDown}
              spellCheck={false}
              autoComplete="off"
              autoCapitalize="none"
              aria-label="Console input"
              className="w-full bg-transparent p-0 font-mono text-base text-console-ink caret-transparent outline-none lg:text-sm"
            />
            <span
              aria-hidden
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
