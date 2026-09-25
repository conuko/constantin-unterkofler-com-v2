import { describe, expect, test } from "vitest";
import {
  clampConsoleOffset,
  consoleDragBounds,
  isConsoleDocked,
  trackConsoleOffset,
} from "@/components/console/console-drag";

/* The side dock on a 1440×900 screen: 720×640, 24px in from the corner. */
const sideDock = { left: 696, top: 236, right: 1416, bottom: 876 };
const viewport = { width: 1440, height: 900 };

describe("console drag bounds", () => {
  test("keeps the whole window on screen, 8px in from every edge", () => {
    expect(consoleDragBounds(sideDock, viewport)).toEqual({
      minX: -688,
      maxX: 16,
      minY: -228,
      maxY: 16,
    });
  });

  test("always leaves the dock itself reachable", () => {
    const bounds = consoleDragBounds(
      { left: 4, top: 2, right: 1438, bottom: 899 },
      viewport,
    );

    expect(bounds).toEqual({ minX: 0, maxX: 0, minY: 0, maxY: 0 });
  });
});

describe("console drag offsets", () => {
  const bounds = consoleDragBounds(sideDock, viewport);

  test("follows the pointer 1:1 inside the bounds", () => {
    expect(trackConsoleOffset({ x: -300, y: -120 }, bounds)).toEqual({
      x: -300,
      y: -120,
    });
  });

  test("gives a fifth of the travel past an edge", () => {
    expect(trackConsoleOffset({ x: 66, y: -328 }, bounds)).toEqual({
      x: 26,
      y: -248,
    });
  });

  test("rests inside the bounds on release", () => {
    expect(clampConsoleOffset({ x: 26, y: -248 }, bounds)).toEqual({
      x: 16,
      y: -228,
    });
  });

  test("knows when the window is back in its dock", () => {
    expect(isConsoleDocked({ x: 0, y: 0 })).toBe(true);
    expect(isConsoleDocked({ x: 0, y: -1 })).toBe(false);
  });
});
