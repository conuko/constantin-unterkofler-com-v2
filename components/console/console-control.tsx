"use client";

import type { CSSProperties } from "react";
import { useSiteConsole } from "@/components/console/console-provider";
import { cn } from "@/lib/utils/cn";

type SiteConsoleControlProps = {
  className?: string;
  style?: CSSProperties;
};

/**
 * The control that opens the console. It renders inside the Closing Record's
 * right column, above the build stamp, so it is placed by the footer and only
 * wired by the console.
 *
 * While the window is open the control is inert. The window opens over it —
 * docked in either corner on desktop, along the bottom edge below `lg` — so
 * Tab would otherwise land on a control nobody can see, and the window
 * carries its own ways to close. It comes back as the window closes, in time
 * to take focus back (see `console-provider.tsx`).
 */
export function SiteConsoleControl({
  className,
  style,
}: SiteConsoleControlProps) {
  const { isOpen, toggle, panelId, controlRef } = useSiteConsole();

  return (
    <button
      ref={controlRef}
      type="button"
      onClick={(event) => toggle(event.currentTarget)}
      aria-expanded={isOpen}
      aria-controls={panelId}
      aria-keyshortcuts="K"
      inert={isOpen}
      style={style}
      className={cn(
        "notebook-control notebook-control-framed label pointer-events-auto inline-flex min-h-9 cursor-pointer items-center gap-2.5 border border-ink bg-ink px-3.5 py-2.5 text-micro text-paper",
        className,
      )}
    >
      <span aria-hidden className="text-annotation-on-ink">
        &gt;_
      </span>
      <span>Console</span>
      <span
        aria-hidden
        className="border border-current/35 px-1.5 py-px leading-none opacity-75"
      >
        K
      </span>
    </button>
  );
}
