"use client";

import { type CSSProperties, useEffect, useEffectEvent, useRef } from "react";
import {
  bannerArt,
  bannerColumns,
  bannerGreeting,
  type ConsoleBannerIntro,
  typeBanner,
} from "@/components/console/console-banner-typing";

type ConsoleBannerProps = {
  intro: ConsoleBannerIntro;
  /** Called once the banner has finished typing. */
  onIntroEnd: () => void;
  /** Called once for every visible character, as it appears. */
  onKeystroke: () => void;
};

/**
 * The console's login banner.
 *
 * A shell prints its motd before the first prompt; this one says hello. It
 * types itself a character at a time the first time the window opens — after
 * that the session already has it and it stays as it landed.
 *
 * Each character arrives with a keystroke, in the same animation frame, so the
 * reveal is written straight onto the element rather than through state: a
 * render would land a frame after the sound. `typedRef` remembers how far the
 * run got, so an effect that runs again — Strict Mode, a fast refresh —
 * carries on from there instead of typing, and striking, the start twice.
 *
 * It is `role="img"` rather than `aria-hidden`: the greeting is the one thing
 * the boot text under it does not also say, so it is announced as its own two
 * words instead of as ninety columns of box-drawing characters.
 *
 * Motion lives in `app/motion.css` (`.console-banner-word`); the timing lives
 * with the typing, in `console-banner-typing.ts`.
 */
export function ConsoleBanner({
  intro,
  onIntroEnd,
  onKeystroke,
}: ConsoleBannerProps) {
  const wordRef = useRef<HTMLPreElement>(null);
  const typedRef = useRef(0);
  const strike = useEffectEvent(onKeystroke);
  const finish = useEffectEvent(onIntroEnd);

  useEffect(() => {
    if (intro !== "typing") return;

    return typeBanner({
      requestFrame: requestAnimationFrame,
      cancelFrame: cancelAnimationFrame,
      from: typedRef.current,
      onReveal: (keystroke, index) => {
        typedRef.current = index + 1;
        wordRef.current?.style.setProperty(
          "--console-banner-typed",
          String(keystroke.columns),
        );
      },
      onStrike: () => strike(),
      onDone: () => finish(),
    });
  }, [intro]);

  return (
    <div className="console-banner" data-intro={intro}>
      <pre
        ref={wordRef}
        role="img"
        aria-label={bannerGreeting}
        className="console-banner-word"
        style={{ "--console-banner-columns": bannerColumns } as CSSProperties}
      >
        {bannerArt}
      </pre>
    </div>
  );
}
