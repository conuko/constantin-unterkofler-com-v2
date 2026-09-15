"use client";

import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { type ReactNode, useEffect, useRef, useState } from "react";
import {
  ConsoleBanner,
  type ConsoleBannerIntro,
} from "@/components/console/console-banner";
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

/* An 11px light inside a 20px hit box. Hovering any light reveals the glyphs
 * on all three, as the platform does. */
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
      className="flex size-5 cursor-pointer items-center justify-center disabled:cursor-default"
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
    panelId,
  } = useSiteConsole();
  const isDesktop = useMediaQuery(desktopQuery);
  const prefersReducedMotion = useMediaQuery(reducedMotionQuery);
  const dock = isDesktop ? preferredDock : "bottom";

  const [lines, setLines] = useState<ConsoleLine[]>(() => bootLines());
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
  const scrollRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    if (isOpen) inputRef.current?.focus();
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
    const context: ConsoleContext = {
      identityName: content.identity.name,
      identityRole: content.identity.role,
      identityLocation: content.identity.location,
      routes: consoleRoutes(wayfinding),
      pathname,
      previousPathname: previousPathnameRef.current,
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
    if (event.key === "Tab") {
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

  /* Clicking a light moves focus onto it; a docked window should still be
   * ready to type into, with the prompt in view once the new width has
   * reflowed the session. */
  function moveTo(target: ConsoleDock) {
    setDock(target);
    inputRef.current?.focus();
    window.requestAnimationFrame(() => followSession(scrollRef.current));
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
      id={panelId}
      data-open={isOpen}
      data-dock={dock}
      aria-label="Site console"
      className={cn(
        "notebook-console fixed z-50 flex flex-col overflow-hidden rounded-console border border-console-rule bg-console-surface shadow-console",
        dock === "side"
          ? "right-6 bottom-6 h-console-side w-console-side"
          : "inset-x-6 bottom-6",
      )}
    >
      <div className="flex items-center gap-3 border-console-rule border-b bg-console-chrome px-3.5 py-2.5">
        <div className="group/lights -ml-1 flex">
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
        <p className="mx-auto truncate font-mono text-console-ink-muted text-xs">
          cu@portfolio — ~/constantin-unterkofler.com
        </p>
        <button
          type="button"
          onClick={close}
          className="label cursor-pointer text-console-ink-muted text-micro"
        >
          Esc
        </button>
      </div>

      <div
        ref={scrollRef}
        className={cn(
          "console-scroll overflow-y-auto px-5.5 py-4.5 font-mono text-console-ink text-sm leading-console",
          dock === "side"
            ? "min-h-0 flex-1"
            : "max-h-console-body min-h-console-body",
        )}
      >
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
              <span className="text-console-ink-muted">{entry.text}</span>
            </p>
          ) : (
            <p
              key={entry.id}
              className={
                entry.kind === "error"
                  ? "text-console-error"
                  : entry.kind === "muted"
                    ? "text-console-ink-muted"
                    : undefined
              }
            >
              {/* An empty line still takes its line-height. */}
              {entry.text === "" ? " " : entry.text}
            </p>
          ),
        )}

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
              aria-label="Console input"
              className="w-full bg-transparent p-0 font-mono text-console-ink caret-transparent outline-none"
            />
            <span
              aria-hidden
              className="pointer-events-none absolute inset-y-0 left-0 flex items-center whitespace-pre"
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
