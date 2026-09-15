"use client";

import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import {
  type ConsoleContext,
  type ConsoleLine,
  promptLine,
  runCommand,
  completeCommand,
} from "@/components/console/console-session";
import { portfolioContent, type NavItem } from "@/content/site-content";

type SiteConsoleProps = {
  identity: { name: string };
  wayfinding: NavItem[];
};

const repositoryUrl = "https://github.com/conuko";

const greetingLines: ConsoleLine[] = [
  {
    id: "boot-0",
    kind: "muted",
    text: "Last login: today. Type help for the list of commands.",
  },
];

/**
 * The site console.
 *
 * One dark window in both themes — a terminal that repaints itself for light
 * mode stops reading as a terminal. It mounts once at the root so the session
 * survives navigation, and it opens on a click or Cmd/Ctrl+K, long after load,
 * so none of it touches first paint.
 *
 * Motion lives in `app/motion.css` (`.notebook-console`): the panel stays in
 * the DOM and transitions between its closed and open states, which gives the
 * exit the same choreography as the entrance without anything watching for
 * unmount.
 */
export function SiteConsole({ identity, wayfinding }: SiteConsoleProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [lines, setLines] = useState<ConsoleLine[]>(greetingLines);
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [historyCursor, setHistoryCursor] = useState<number | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const controlRef = useRef<HTMLButtonElement>(null);
  const panelId = useId();

  const router = useRouter();
  const { resolvedTheme, setTheme } = useTheme();

  const close = useCallback(() => {
    setIsOpen(false);
    controlRef.current?.focus();
  }, []);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setIsOpen((current) => !current);
        return;
      }

      if (event.key === "Escape" && isOpen) close();
    }

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isOpen, close]);

  useEffect(() => {
    if (isOpen) inputRef.current?.focus();
  }, [isOpen]);

  useEffect(() => {
    const scroller = scrollRef.current;
    if (scroller) scroller.scrollTop = scroller.scrollHeight;
  }, [lines]);

  const context: ConsoleContext = {
    identityName: identity.name,
    identityRole: "Software Engineer, Berlin",
    wayfinding,
    repositoryUrl,
    records: portfolioContent.pages.work.content.entries.map((entry, index) => ({
      index: `W–${String(index + 1).padStart(2, "0")}`,
      label: entry.client,
      meta: entry.primaryMetadata.toLowerCase(),
    })),
  };

  function submit(event: React.FormEvent) {
    event.preventDefault();

    const entered = input;
    const result = runCommand(entered, context);

    setHistory((current) => [...current, entered]);
    setHistoryCursor(null);
    setInput("");

    let cleared = false;

    for (const effect of result.effects) {
      if (effect.type === "clear") cleared = true;
      if (effect.type === "navigate") router.push(effect.href);
      if (effect.type === "open") window.open(effect.href, "_blank", "noopener");
      if (effect.type === "theme") {
        setTheme(resolvedTheme === "dark" ? "light" : "dark");
      }
      if (effect.type === "close") {
        window.setTimeout(close, 220);
      }
    }

    setLines((current) =>
      cleared ? [] : [...current, promptLine(entered), ...result.lines],
    );
  }

  function onInputKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Tab") {
      event.preventDefault();
      setInput((current) => completeCommand(current));
      return;
    }

    if (event.key === "ArrowUp" && history.length > 0) {
      event.preventDefault();
      const next = historyCursor === null ? history.length - 1 : Math.max(0, historyCursor - 1);
      setHistoryCursor(next);
      setInput(history[next]);
      return;
    }

    if (event.key === "ArrowDown" && historyCursor !== null) {
      event.preventDefault();
      const next = historyCursor + 1;

      if (next >= history.length) {
        setHistoryCursor(null);
        setInput("");
        return;
      }

      setHistoryCursor(next);
      setInput(history[next]);
    }
  }

  return (
    <>
      <button
        ref={controlRef}
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        aria-expanded={isOpen}
        aria-controls={panelId}
        className="notebook-control label fixed right-6 bottom-6 z-40 inline-flex min-h-9 cursor-pointer items-center gap-2.5 border border-ink bg-ink px-3.5 py-2.5 text-micro text-paper"
      >
        <span aria-hidden className="text-console-accent">
          &gt;_
        </span>
        <span>Console</span>
        <span
          aria-hidden
          className="border border-current/35 px-1.5 py-px opacity-75"
        >
          ⌘K
        </span>
      </button>

      <div
        id={panelId}
        data-open={isOpen}
        aria-label="Site console"
        className="notebook-console fixed inset-x-6 bottom-6 z-50 overflow-hidden rounded-console border border-console-rule bg-console-surface shadow-console"
      >
        <div className="flex items-center gap-3 border-console-rule border-b bg-console-chrome px-3.5 py-2.5">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={close}
              aria-label="Close console"
              className="size-2.75 cursor-pointer rounded-full bg-console-light-close"
            />
            <span aria-hidden className="size-2.75 rounded-full bg-console-light-minimize" />
            <span aria-hidden className="size-2.75 rounded-full bg-console-light-zoom" />
          </div>
          <p className="mx-auto font-mono text-console-ink-muted text-xs">
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
          className="max-h-console-body overflow-y-auto px-5.5 py-4.5 font-mono text-console-ink text-sm leading-console"
        >
          {lines.map((entry) =>
            entry.kind === "prompt" ? (
              <p key={entry.id} className="mt-2.5">
                <span className="text-console-accent">~</span>{" "}
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
                {entry.text}
              </p>
            ),
          )}

          <form onSubmit={submit} className="mt-2.5 flex items-center gap-2">
            <span aria-hidden className="text-console-accent">
              ~
            </span>
            <span aria-hidden className="text-console-ink-muted">
              ❯
            </span>
            <input
              ref={inputRef}
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={onInputKeyDown}
              spellCheck={false}
              autoComplete="off"
              aria-label="Console input"
              className="min-w-0 flex-1 bg-transparent font-mono text-console-ink outline-none"
            />
          </form>

          <p className="label mt-3.5 text-console-ink-muted/70 text-micro">
            Tab completes · ↑ recalls · Esc closes
          </p>
        </div>
      </div>
    </>
  );
}
