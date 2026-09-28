/**
 * Where focus goes when the site console closes, kept out of the component so
 * it can be tested without a DOM.
 *
 * The window is not modal: the page stays live around it. Closing it only
 * moves focus that is inside it, or focus that has already fallen back to the
 * document. Focus the reader has moved somewhere else on the page stays there.
 *
 * Nothing is scrolled to meet the focus, which is how a native `<dialog>`
 * hands it back too. Below `lg` the console control sits at the foot of the
 * page, and a close that scrolled to it lost the reader's place.
 */

type FocusDocument = Pick<Document, "activeElement" | "body">;

type FocusWindow = Pick<Node, "contains">;

/** Whether closing the window should move focus: the focus is inside the window, or on nothing. */
export function consoleHoldsFocus(
  document: FocusDocument,
  panel: FocusWindow | null,
): boolean {
  const active = document.activeElement;

  return (
    active === null ||
    active === document.body ||
    (panel?.contains(active) ?? false)
  );
}

/**
 * Hands focus to the first target that takes it. A target has to still be on
 * the page and outside the window, which is about to hide. It also has to
 * actually end up with focus: an element that has been hidden since the
 * window opened quietly refuses it, and the next target gets a turn.
 */
export function returnConsoleFocus(
  document: FocusDocument,
  panel: FocusWindow | null,
  targets: readonly (HTMLElement | null | undefined)[],
): void {
  if (!consoleHoldsFocus(document, panel)) return;

  for (const target of targets) {
    if (!target?.isConnected || panel?.contains(target)) continue;

    target.focus({ preventScroll: true });
    if (document.activeElement === target) return;
  }
}

/**
 * Focuses the page's title after a page command, so the next Tab reads on
 * from the top of the page the command opened. A title is not a control, so
 * it can take focus only while it holds it, and it draws no ring (see
 * `app/globals.css`). A page without a title hands focus to its main content,
 * which is also the skip link's target.
 */
export function focusPageTitle(
  document: Document,
  panel: FocusWindow | null,
): void {
  if (!consoleHoldsFocus(document, panel)) return;

  const main = document.getElementById("main-content");
  const title = main?.querySelector("h1") ?? main;
  if (!title) return;

  if (!title.hasAttribute("tabindex")) {
    title.tabIndex = -1;
    title.addEventListener("blur", () => title.removeAttribute("tabindex"), {
      once: true,
    });
  }

  title.focus({ preventScroll: true });
}

/** A page command after the window has closed: where it goes, and the page it left. */
export type ConsoleArrival = { href: string; from: string };

/**
 * What a page command's hand-off does as the window and the route change.
 * `work`, `about` and the other page commands close the window and open a
 * page, and focus goes to that page's title. The route can land before or
 * after the window closes, so the hand-off waits for both. It is dropped when
 * the reader opens the window again first, or when the route lands on a page
 * other than the one the command opened, because some other navigation got
 * there first.
 */
export function consoleArrivalStep(
  arrival: ConsoleArrival,
  { isOpen, pathname }: { isOpen: boolean; pathname: string },
): "wait" | "arrive" | "drop" {
  if (isOpen) return "drop";
  if (pathname === arrival.href) return "arrive";
  if (pathname === arrival.from) return "wait";
  return "drop";
}
