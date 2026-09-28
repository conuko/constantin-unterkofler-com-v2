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
        className="border border-current/35 px-1.5 py-px opacity-75"
      >
        K
      </span>
    </button>
  );
}
