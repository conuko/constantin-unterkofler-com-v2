"use client";

import { type CSSProperties, useEffect, useState } from "react";
import type { Greeting } from "@/content/greetings";
import {
  advanceGreetingCycle,
  greetingGraphemes,
  greetingStepDelay,
  settledGreetingCycle,
} from "@/lib/notebook-greeting";
import { usePrefersReducedMotion } from "@/lib/use-prefers-reduced-motion";

type NotebookGreetingProps = {
  greetings: readonly Greeting[];
};

/**
 * The home Portfolio Page's Greeting: one hello at a time, written left to
 * right, erased right to left, then rewritten in another language and another
 * random color. The first greeting is server-rendered whole, so the line is
 * never blank before the rotation takes over.
 *
 * Reduced motion keeps the first greeting standing: no writing, no erasing, no
 * rotation, so the line never changes under a reader who asked it not to.
 */
export function NotebookGreeting({ greetings }: NotebookGreetingProps) {
  const [leadGreeting] = greetings;
  const [cycle, setCycle] = useState(() =>
    settledGreetingCycle(greetingGraphemes(leadGreeting.text).length),
  );

  // Reads as "reduced" on the server and while hydrating, so the first render
  // matches the server's whole greeting and the rotation begins only on the
  // client, once the preference is actually known.
  const rotating = !usePrefersReducedMotion();

  const greeting = greetings[cycle.greetingIndex] ?? leadGreeting;
  const graphemes = greetingGraphemes(greeting.text);

  useEffect(() => {
    if (!rotating) return;

    const step = setTimeout(
      () =>
        setCycle((current) =>
          advanceGreetingCycle(current, {
            graphemeCount: graphemes.length,
            greetingCount: greetings.length,
            random: Math.random,
          }),
        ),
      greetingStepDelay(cycle, graphemes.length),
    );

    return () => clearTimeout(step);
  }, [cycle, graphemes.length, greetings.length, rotating]);

  const written = rotating
    ? graphemes.slice(0, cycle.revealed).join("")
    : leadGreeting.text;
  const displayed = rotating ? greeting : leadGreeting;

  return (
    <>
      <span
        aria-hidden="true"
        className="greeting-ink normal-case"
        dir="auto"
        lang={displayed.lang}
        style={{ "--greeting-hue": cycle.hue } as CSSProperties}
      >
        {written}
        {rotating && (
          <span className="ml-0.5 inline-block h-3 w-0.5 animate-caret bg-current align-middle" />
        )}
      </span>
      {/* One stable greeting for assistive technology, in place of a line that rewrites itself. */}
      <span className="sr-only">{leadGreeting.text}</span>
    </>
  );
}
