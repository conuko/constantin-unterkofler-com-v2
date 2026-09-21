"use client";

import { useSyncExternalStore } from "react";

const reducedMotionQuery = "(prefers-reduced-motion: reduce)";

function subscribe(onChange: () => void) {
  const media = window.matchMedia(reducedMotionQuery);
  media.addEventListener("change", onChange);

  return () => media.removeEventListener("change", onChange);
}

function getSnapshot() {
  return window.matchMedia(reducedMotionQuery).matches;
}

/* The server cannot know the preference, and the hydrating render has to match
 * the server's markup either way. Both hold still; React re-renders with the
 * real answer once hydration is done. */
function getServerSnapshot() {
  return true;
}

/**
 * Whether the reader has asked for reduced motion, kept live as the preference
 * changes. Reads as `true` on the server and during hydration, so anything
 * gated on it starts at rest and only moves once the client has confirmed it
 * may.
 */
export function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
