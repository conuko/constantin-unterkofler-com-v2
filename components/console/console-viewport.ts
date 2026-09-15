export type ConsoleViewportMeasurements = {
  /** `visualViewport.offsetTop` — how far the visible area has been panned. */
  offsetTop: number;
  /** `visualViewport.height` — the part of the screen the keyboard leaves. */
  height: number;
  /** The layout viewport's height, which `position: fixed` resolves against. */
  layoutHeight: number;
};

export const consoleViewportVariableNames = [
  "--console-keyboard-inset",
  "--console-visible-height",
] as const;

type ConsoleViewportVariable = (typeof consoleViewportVariableNames)[number];

/**
 * How much of the layout viewport the reader cannot see, and how much is left.
 *
 * Mobile browsers keep two viewports. `position: fixed` resolves against the
 * layout one, which the software keyboard does not shrink; it shrinks the
 * visual one. A window docked `bottom: 1.5rem` therefore parks itself behind
 * the keyboard. `--console-keyboard-inset` is the height of that hidden strip,
 * so adding it to the dock offset pins the window's lower edge to the bottom
 * of what is actually on screen; `--console-visible-height` is what remains
 * above it, so the window can be trimmed to fit rather than run off the top.
 */
export function consoleViewportVariables({
  offsetTop,
  height,
  layoutHeight,
}: ConsoleViewportMeasurements): Record<ConsoleViewportVariable, string> {
  const hidden = layoutHeight - (offsetTop + height);

  return {
    "--console-keyboard-inset": `${Math.max(0, hidden)}px`,
    "--console-visible-height": `${Math.max(0, height)}px`,
  };
}
