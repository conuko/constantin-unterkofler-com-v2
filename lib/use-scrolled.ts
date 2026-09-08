"use client";

import { useEffect, useState } from "react";

type ScrolledThresholds = {
  enterAt?: number;
  exitAt?: number;
};

/**
 * True once the page has scrolled past `enterAt`, and false again only below
 * `exitAt`. The gap between the two thresholds is deliberate: a single
 * threshold flips back and forth while a slow gesture — or iOS rubber-band
 * overscroll, which reports a negative `scrollY` — hovers around it, which the
 * Site Header shows as a flickering glass surface.
 */
export function useScrolled({
  enterAt = 12,
  exitAt = 4,
}: ScrolledThresholds = {}): boolean {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    let frame = 0;

    function read() {
      frame = 0;
      const offset = Math.max(window.scrollY, 0);

      setScrolled((wasScrolled) =>
        wasScrolled ? offset > exitAt : offset > enterAt,
      );
    }

    function onScroll() {
      if (frame) return;
      frame = requestAnimationFrame(read);
    }

    read();
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [enterAt, exitAt]);

  return scrolled;
}
