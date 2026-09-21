"use client";

import { useCallback, useSyncExternalStore } from "react";

/**
 * Whether a media query matches, kept live as the viewport changes. The
 * server cannot know, so it answers `serverSnapshot` there and during
 * hydration, and React re-renders with the real answer once hydrated.
 */
export function useMediaQuery(query: string, serverSnapshot = false): boolean {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const media = window.matchMedia(query);
      media.addEventListener("change", onChange);

      return () => media.removeEventListener("change", onChange);
    },
    [query],
  );

  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => serverSnapshot,
  );
}
