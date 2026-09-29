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
  name: string;
};

/**
 * The home Portfolio Page's compact introduction: the localized greeting is
 * written above one stable name, erased, then rewritten in another language
 * and color. The writing field stays anchored above the name; only the text
 * run changes direction for right-to-left scripts.
 *
 * Reduced motion keeps the first greeting standing: no writing, no erasing, no
 * rotation, so the line never changes under a reader who asked it not to.
 */
export function NotebookGreeting({ greetings, name }: NotebookGreetingProps) {
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

  const revealed = rotating ? cycle.revealed : graphemes.length;
  const written = graphemes.slice(0, revealed).join("");
  const displayed = rotating ? greeting : leadGreeting;
  const caret = rotating && <span className="greeting-caret animate-caret" />;

  return (
    <>
      <p
        aria-hidden="true"
        className="greeting-stage greeting-ink flex w-full items-end font-heading font-semibold text-3xl leading-tight tracking-tight md:text-4xl"
        style={{ "--greeting-hue": cycle.hue } as CSSProperties}
      >
        <span dir="auto" lang={displayed.lang} className="inline-block">
          {written}
          {caret}
        </span>
      </p>
      <p className="sr-only">{leadGreeting.text}</p>
      <h1 className="w-fit font-heading font-semibold text-5xl leading-none tracking-tight md:text-7xl">
        <span translate="no">{name}</span>
      </h1>
    </>
  );
}
