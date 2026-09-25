/** How far the window has been dragged from its dock, in CSS pixels. */
export type ConsoleDragOffset = { x: number; y: number };

/** The offsets that keep the whole window on screen. */
export type ConsoleDragBounds = {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
};

/** Where the window sits in its dock, as `getBoundingClientRect` reports it. */
export type ConsoleDockRect = {
  left: number;
  top: number;
  right: number;
  bottom: number;
};

export const consoleDockedOffset: ConsoleDragOffset = { x: 0, y: 0 };

/* The docks sit 1.5rem in from the edges. A dragged window may come closer
 * than that, but never flush — its rule and shadow need somewhere to land. */
const edgeMargin = 8;

/* Past an edge the window follows a fifth of the pointer's travel, so it
 * gives rather than stopping dead, and says there is nothing further. */
const edgeElasticity = 0.2;

/**
 * The offsets the window may be dragged to from its dock without any of it
 * leaving the viewport. The dock itself is always inside them, even on a
 * screen too small to hold the margin around it.
 */
export function consoleDragBounds(
  dock: ConsoleDockRect,
  viewport: { width: number; height: number },
): ConsoleDragBounds {
  return {
    minX: Math.min(0, edgeMargin - dock.left),
    maxX: Math.max(0, viewport.width - edgeMargin - dock.right),
    minY: Math.min(0, edgeMargin - dock.top),
    maxY: Math.max(0, viewport.height - edgeMargin - dock.bottom),
  };
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function band(value: number, min: number, max: number): number {
  if (value < min) return min + (value - min) * edgeElasticity;
  if (value > max) return max + (value - max) * edgeElasticity;
  return value;
}

/** Where the window rests once the pointer lets go. */
export function clampConsoleOffset(
  offset: ConsoleDragOffset,
  bounds: ConsoleDragBounds,
): ConsoleDragOffset {
  return {
    x: clamp(offset.x, bounds.minX, bounds.maxX),
    y: clamp(offset.y, bounds.minY, bounds.maxY),
  };
}

/** Where the window sits under the pointer: 1:1 inside the bounds, elastic past them. */
export function trackConsoleOffset(
  offset: ConsoleDragOffset,
  bounds: ConsoleDragBounds,
): ConsoleDragOffset {
  return {
    x: band(offset.x, bounds.minX, bounds.maxX),
    y: band(offset.y, bounds.minY, bounds.maxY),
  };
}

export function isConsoleDocked(offset: ConsoleDragOffset): boolean {
  return offset.x === 0 && offset.y === 0;
}
