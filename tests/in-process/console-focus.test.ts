import { describe, expect, test } from "vitest";
import {
  consoleArrivalStep,
  consoleHoldsFocus,
  returnConsoleFocus,
} from "@/components/console/console-focus";

/* Just enough of a document for the focus rules: what has focus, the body,
 * and elements that are on the page or not and take focus or refuse it. */
function page() {
  const document = {
    body: { name: "body" } as unknown as HTMLElement,
    activeElement: null as Element | null,
  };
  document.activeElement = document.body;

  const focused: string[] = [];

  function element(
    name: string,
    { isConnected = true, focusable = true } = {},
  ): HTMLElement {
    const node = {
      name,
      isConnected,
      focus(options?: FocusOptions) {
        expect(options).toEqual({ preventScroll: true });
        focused.push(name);
        if (focusable) document.activeElement = node as unknown as Element;
      },
    };
    return node as unknown as HTMLElement;
  }

  function panel(...inside: HTMLElement[]) {
    return { contains: (node: Node | null) => inside.includes(node as never) };
  }

  return { document, element, panel, focused };
}

describe("console focus on close", () => {
  test("moves focus that is inside the window, or on nothing", () => {
    const { document, element, panel } = page();
    const prompt = element("prompt");
    const window = panel(prompt);

    document.activeElement = prompt;
    expect(consoleHoldsFocus(document, window)).toBe(true);

    document.activeElement = document.body;
    expect(consoleHoldsFocus(document, window)).toBe(true);

    document.activeElement = null;
    expect(consoleHoldsFocus(document, window)).toBe(true);
  });

  test("leaves focus the reader has moved elsewhere on the page", () => {
    const { document, element, panel, focused } = page();
    const prompt = element("prompt");
    const link = element("link");
    const control = element("control");

    document.activeElement = link;
    returnConsoleFocus(document, panel(prompt), [control]);

    expect(focused).toEqual([]);
    expect(document.activeElement).toBe(link);
  });

  test("goes back to what opened the window", () => {
    const { document, element, panel, focused } = page();
    const prompt = element("prompt");
    const link = element("link");
    const control = element("control");

    document.activeElement = prompt;
    returnConsoleFocus(document, panel(prompt), [link, control]);

    expect(focused).toEqual(["link"]);
    expect(document.activeElement).toBe(link);
  });

  test("goes to the control when nothing opened it", () => {
    const { document, element, panel, focused } = page();
    const prompt = element("prompt");
    const control = element("control");

    document.activeElement = prompt;
    returnConsoleFocus(document, panel(prompt), [null, control]);

    expect(focused).toEqual(["control"]);
  });

  test("passes over an opener that has left the page or stopped taking focus", () => {
    const { document, element, panel, focused } = page();
    const prompt = element("prompt");
    const gone = element("gone", { isConnected: false });
    const hidden = element("hidden", { focusable: false });
    const control = element("control");

    document.activeElement = prompt;
    returnConsoleFocus(document, panel(prompt), [gone, hidden, control]);

    expect(focused).toEqual(["hidden", "control"]);
    expect(document.activeElement).toBe(control);
  });

  test("never hands focus to something inside the window", () => {
    const { document, element, panel, focused } = page();
    const prompt = element("prompt");
    const light = element("light");
    const control = element("control");

    document.activeElement = prompt;
    returnConsoleFocus(document, panel(prompt, light), [light, control]);

    expect(focused).toEqual(["control"]);
  });
});

describe("console focus after a page command", () => {
  const arrival = { href: "/work", from: "/" };

  test("waits while the route is still on its way", () => {
    expect(consoleArrivalStep(arrival, { isOpen: false, pathname: "/" })).toBe(
      "wait",
    );
  });

  test("arrives once the window has closed on the page the command opened", () => {
    expect(
      consoleArrivalStep(arrival, { isOpen: false, pathname: "/work" }),
    ).toBe("arrive");
  });

  test("arrives at once when the command opens the page already on screen", () => {
    expect(
      consoleArrivalStep(
        { href: "/work", from: "/work" },
        { isOpen: false, pathname: "/work" },
      ),
    ).toBe("arrive");
  });

  test("is dropped when the reader opens the window again first", () => {
    expect(consoleArrivalStep(arrival, { isOpen: true, pathname: "/" })).toBe(
      "drop",
    );
    expect(
      consoleArrivalStep(arrival, { isOpen: true, pathname: "/work" }),
    ).toBe("drop");
  });

  test("is dropped when another navigation lands somewhere else first", () => {
    expect(
      consoleArrivalStep(arrival, { isOpen: false, pathname: "/about" }),
    ).toBe("drop");
  });
});
