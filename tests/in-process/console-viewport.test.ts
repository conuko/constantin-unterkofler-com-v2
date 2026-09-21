import { describe, expect, test } from "vitest";
import { consoleViewportVariables } from "@/components/console/console-viewport";

describe("mobile console visual viewport", () => {
  test("lifts the window over the strip the keyboard hides", () => {
    expect(
      consoleViewportVariables({
        offsetTop: 0,
        height: 410,
        layoutHeight: 844,
      }),
    ).toEqual({
      "--console-keyboard-inset": "434px",
      "--console-visible-height": "410px",
    });
  });

  test("counts a panned visual viewport as part of what is hidden", () => {
    expect(
      consoleViewportVariables({
        offsetTop: 86,
        height: 364,
        layoutHeight: 844,
      }),
    ).toEqual({
      "--console-keyboard-inset": "394px",
      "--console-visible-height": "364px",
    });
  });

  test("leaves the window at its dock offset when nothing is hidden", () => {
    expect(
      consoleViewportVariables({
        offsetTop: 0,
        height: 844,
        layoutHeight: 844,
      }),
    ).toEqual({
      "--console-keyboard-inset": "0px",
      "--console-visible-height": "844px",
    });
  });

  test("never pushes the window off screen when the viewports disagree", () => {
    expect(
      consoleViewportVariables({
        offsetTop: -4,
        height: 900.5,
        layoutHeight: 844,
      }),
    ).toEqual({
      "--console-keyboard-inset": "0px",
      "--console-visible-height": "900.5px",
    });
  });
});
