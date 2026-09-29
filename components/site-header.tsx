"use client";

import { Moon, Sun, SunMoon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { useCallback, useEffect, useRef, useState } from "react";
import { useSiteConsole } from "@/components/console/console-provider";
import type { NavItem } from "@/content/site-content";
import { notebookDelay, notebookTiming } from "@/lib/notebook-motion";
import {
  defaultThemeSetting,
  isThemeSetting,
  nextThemeSetting,
  type ThemeSetting,
  themeSettings,
} from "@/lib/theme-setting";
import { useScrolled } from "@/lib/use-scrolled";
import { cn } from "@/lib/utils/cn";
import { isCurrentRoute } from "@/lib/wayfinding";

type SiteHeaderProps = {
  identity: {
    shortName: string;
  };
  primaryWayfinding: NavItem[];
};

type WayfindingLinkProps = {
  item: NavItem;
  pathname: string;
  className?: string;
  onSelect?: () => void;
};

/* Wayfinding prefetches on intent, not on sight.
 *
 * `<Link>`'s default prefetches every route in the viewport as soon as it is
 * there. The notebook's wayfinding is above the fold on every sheet and every
 * route is static, so that default fired the full payload for the whole site
 * during the first load — 15 extra requests, measured, all of them inside the
 * window Lighthouse charges against Largest Contentful Paint. The notebook is
 * five sheets; a reader opens one of them.
 *
 * `prefetch={false}` suppresses prefetching on hover as well as on sight, so
 * intent has to turn it back on: `null` restores the default the moment the
 * reader points at a link, and the prefetch runs then. Pointer, focus, and
 * touch all count as intent, which keeps keyboard and touch readers on the
 * same instant navigation a mouse gets. See ADR-0007. */
function useIntentPrefetch() {
  const [intended, setIntended] = useState(false);
  const declareIntent = useCallback(() => setIntended(true), []);

  return {
    prefetch: intended ? null : false,
    onMouseEnter: declareIntent,
    onFocus: declareIntent,
    onTouchStart: declareIntent,
  } as const;
}

/* The current route is marked by the link's own rule, drawn open by the
 * `underline-reveal` utility. On a route change the old rule retracts and the
 * new one draws — the same move every other rule in the notebook makes. */
function WayfindingLink({
  item,
  pathname,
  className,
  onSelect,
}: WayfindingLinkProps) {
  const isCurrent = isCurrentRoute(pathname, item.href);
  const intentPrefetch = useIntentPrefetch();

  return (
    <Link
      href={item.href}
      {...intentPrefetch}
      onClick={onSelect}
      className={cn("underline-reveal text-xs", className)}
      data-active={isCurrent}
      aria-current={isCurrent ? "page" : undefined}
    >
      {item.label}
    </Link>
  );
}

/* The identity mark is a link home, and takes the same intent rule. */
function IdentityMark({ shortName }: { shortName: string }) {
  const intentPrefetch = useIntentPrefetch();

  return (
    <Link
      href="/"
      {...intentPrefetch}
      className="notebook-control code flex size-9 items-center justify-center text-ink"
    >
      {shortName}
      <span className="sr-only">— home</span>
    </Link>
  );
}

/* Controls are unframed: the glyph is the control. The 36px box stays as the
 * hit target, and the spring scale-on-hover is unchanged. */
const controlBox =
  "notebook-control group relative flex size-9 cursor-pointer items-center justify-center text-ink";

const themeGlyphs: Record<ThemeSetting, typeof Sun> = {
  system: SunMoon,
  light: Sun,
  dark: Moon,
};

/* Three settings, one glyph each, and a press moves to the next
 * (`nextThemeSetting`). Which glyph shows, and which label names the button,
 * is CSS reading `data-theme-setting` on `<html>`, not React state: the setting
 * lives in storage the server cannot read, and the attribute is written before
 * first paint, so the control is right from the first frame and hydrates
 * without a mismatch. The glyphs are ink at rest and on hover; the hover is
 * the spring scale every glyph control shares. */
function AppearanceControl() {
  const { theme, systemTheme, setTheme } = useTheme();

  function cycle() {
    const setting = isThemeSetting(theme) ? theme : defaultThemeSetting;
    setTheme(nextThemeSetting(setting, systemTheme ?? "light"));
  }

  return (
    <button type="button" onClick={cycle} className={controlBox}>
      {themeSettings.map((setting) => {
        const Glyph = themeGlyphs[setting];
        return (
          <Glyph
            key={setting}
            aria-hidden
            data-setting={setting}
            className="theme-glyph absolute size-4"
          />
        );
      })}
      {themeSettings.map((setting) => (
        <span key={setting} data-setting={setting} className="theme-label">
          Theme: {setting}
        </span>
      ))}
    </button>
  );
}

type DesktopWayfindingProps = {
  items: NavItem[];
  pathname: string;
};

/* The links land in step with the page header on the first load: the first
 * with the page title, the next with the introduction, the last with the
 * header rule. */
function DesktopWayfinding({ items, pathname }: DesktopWayfindingProps) {
  return (
    <nav aria-label="Primary">
      <ul className="flex flex-col items-end">
        {items.map((item, index) => (
          <li
            key={item.href}
            style={notebookDelay(
              notebookTiming.siteHeaderWayfindingLead +
                index * notebookTiming.siteHeaderWayfindingStagger,
            )}
            className="notebook-in-part"
          >
            {/* The link's box is the size of its text, set on the foot of
             * the 26px row it stands on, where the text sat as an inline
             * box. Its hit area grows to the whole row, so the stacked links
             * meet edge to edge without overlapping. */}
            <WayfindingLink
              item={item}
              pathname={pathname}
              className="inline-block align-bottom before:absolute before:-inset-x-2 before:-inset-y-0.75"
            />
          </li>
        ))}
      </ul>
    </nav>
  );
}

type DisclosureControlProps = {
  controlRef: React.Ref<HTMLButtonElement>;
  isOpen: boolean;
  onToggle: () => void;
};

/* Three lines that fold into a cross. Each line moves on the independent
 * `rotate`, `translate`, and `scale` properties, so the two states are plain
 * utilities and the spring curve carries the change between them.
 *
 * Square ends, not rounded — the only rounded shapes left in the system are
 * the console window and its traffic lights. */
const disclosureLine =
  "absolute h-0.5 w-5 bg-current duration-normal ease-spring";

function DisclosureControl({
  controlRef,
  isOpen,
  onToggle,
}: DisclosureControlProps) {
  return (
    <button
      ref={controlRef}
      type="button"
      onClick={onToggle}
      aria-expanded={isOpen}
      aria-controls="site-header-mobile-wayfinding"
      aria-label="Menu"
      className={controlBox}
    >
      <div className="flex size-5 flex-col items-center justify-center">
        <span
          className={cn(
            disclosureLine,
            "transition-transform",
            isOpen ? "translate-y-0 rotate-45" : "-translate-y-1.5 rotate-0",
          )}
        />
        <span
          data-disclosure-middle-line
          className={cn(
            disclosureLine,
            "transition",
            isOpen ? "scale-0 opacity-0" : "scale-100 opacity-100",
          )}
        />
        <span
          className={cn(
            disclosureLine,
            "transition-transform",
            isOpen ? "translate-y-0 -rotate-45" : "translate-y-1.5 rotate-0",
          )}
        />
      </div>
    </button>
  );
}

type MobileDisclosureProps = {
  items: NavItem[];
  pathname: string;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
};

/* Esc closes one layer at a time (see `site-console.tsx`). With focus inside
 * the disclosure, its own listener closes it first and marks the key
 * handled, so an open console stays open. With focus anywhere else, the
 * console is the top layer: while it is open, it takes Esc, and the next Esc
 * reaches the disclosure. Focus comes back to the control only from inside
 * the panel or from nowhere, never away from where the reader has moved it,
 * and without scrolling to it. */
function MobileDisclosure({
  items,
  pathname,
  isOpen,
  onOpenChange,
}: MobileDisclosureProps) {
  const previousPathnameRef = useRef(pathname);
  const disclosureRef = useRef<HTMLDivElement>(null);
  const disclosureControlRef = useRef<HTMLButtonElement>(null);
  const { isOpen: isConsoleOpen } = useSiteConsole();
  const close = useCallback(() => onOpenChange(false), [onOpenChange]);

  useEffect(() => {
    if (previousPathnameRef.current === pathname) return;

    previousPathnameRef.current = pathname;
    close();
  }, [pathname, close]);

  useEffect(() => {
    const disclosure = disclosureRef.current;
    if (!isOpen || !disclosure) return;

    function closeFrom(event: KeyboardEvent) {
      event.preventDefault();
      close();

      const active = document.activeElement;
      if (active === document.body || disclosure?.contains(active)) {
        disclosureControlRef.current?.focus({ preventScroll: true });
      }
    }

    function onOwnKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !event.defaultPrevented) closeFrom(event);
    }

    function onDocumentKeyDown(event: KeyboardEvent) {
      if (event.key !== "Escape" || event.defaultPrevented) return;
      if (isConsoleOpen) return;
      closeFrom(event);
    }

    disclosure.addEventListener("keydown", onOwnKeyDown);
    document.addEventListener("keydown", onDocumentKeyDown);
    return () => {
      disclosure.removeEventListener("keydown", onOwnKeyDown);
      document.removeEventListener("keydown", onDocumentKeyDown);
    };
  }, [isOpen, isConsoleOpen, close]);

  return (
    <div
      ref={disclosureRef}
      style={notebookDelay(notebookTiming.siteHeaderControls)}
      className="notebook-in-part relative lg:hidden"
    >
      <DisclosureControl
        controlRef={disclosureControlRef}
        isOpen={isOpen}
        onToggle={() => onOpenChange(!isOpen)}
      />

      {isOpen && (
        <div aria-hidden className="fixed inset-0 -z-1" onClick={close} />
      )}

      {/* The panel hangs from the header's glass bar, which shows while it
       * is open: its right edge on the bar's, and one 8px step below the
       * bar's lower edge, which runs 12px past the row the control sits in. */}
      <nav
        id="site-header-mobile-wayfinding"
        aria-label="Mobile navigation"
        data-open={isOpen}
        className="notebook-disclosure absolute top-full -right-4 mt-5 min-w-40 origin-top-right border border-rule bg-paper/85 p-4 shadow-lg backdrop-blur-md"
      >
        {/* One link per 40px row, the major pitch of the dot field. The
         * link's own box stays the size of its text, so its rule still
         * draws under the word; the hit area around it fills the row. */}
        <ul>
          {items.map((item) => (
            <li key={item.href} className="flex h-10 items-center">
              <WayfindingLink
                item={item}
                pathname={pathname}
                className="before:absolute before:-inset-x-4 before:-inset-y-2.5"
                onSelect={close}
              />
            </li>
          ))}
        </ul>

        <div className="mt-3 border-rule border-t pt-3">
          <AppearanceControl />
        </div>
      </nav>
    </div>
  );
}

export function SiteHeader({ identity, primaryWayfinding }: SiteHeaderProps) {
  const pathname = usePathname();
  const isScrolled = useScrolled();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  /* The header stacks above the sheet at every width. On desktop it has no
   * surface and the sheet scrolls beneath it, so the header box lets pointer
   * events through and only its two corners take them back, the same way the
   * Closing Record does. The sheet never reaches those corners: it is capped
   * clear of the corner lanes (`components/portfolio-page.tsx`).
   *
   * The header also sets where the sheet starts, and it starts on a major dot
   * row: 120px down below `lg`, 200px from it. So its footprint is fixed, not
   * whatever its contents measure: a margin under the 36px bar, outside the
   * box so the stuck header takes no clicks below its glass, and a set height
   * on desktop, where the box takes none anyway and the wayfinding column
   * would otherwise move the sheet with every link. */
  return (
    <header
      data-site-header
      className="sticky top-7 z-10 mb-15 lg:pointer-events-none lg:top-4 lg:mb-0 lg:h-44"
    >
      <div className="relative flex justify-between gap-6">
        {/* The glass surface is its own layer rather than the header's own
         * background, for two reasons. iOS Safari silently drops
         * `position: sticky` from any element that also carries a backdrop
         * filter, so a header that grew its own filter on scroll stopped
         * sticking on real devices. And because this layer holds a constant
         * filter and constant box, crossing the scroll threshold animates
         * opacity alone — no relayout, and no asking WebKit to build a
         * backdrop layer mid-scroll, which is what made the switch flicker. */}
        <div
          aria-hidden
          className={`pointer-events-none absolute -inset-x-4 -inset-y-3 -z-10 border border-rule bg-card-glass shadow-sm backdrop-blur-md transition-opacity duration-normal ease-default lg:hidden ${
            isScrolled || isMenuOpen ? "opacity-100" : "opacity-0"
          }`}
        />

        {/* The identity mark has no entrance: it is simply there from the
         * first frame. That makes it the first opaque thing above the fold,
         * which is what has First Contentful Paint reported at all while the
         * rest of the sheet is still arriving. Nothing else on the sheet is
         * ever transparent either — parts are revealed by a clip — so Largest
         * Contentful Paint is reported at first paint too; see the
         * paint-timing notes in `app/motion.css`. Like every other control it
         * is unframed — the two letters alone carry it. */}
        <div className="pointer-events-auto self-start">
          <IdentityMark shortName={identity.shortName} />
        </div>

        {/* The column itself has no entrance; the toggle and each link take
         * their own. When the column settled too, every link inside it rode
         * two entrances at once — twice the travel, faded twice over — and
         * arrived on a different footing from everything else on the sheet. */}
        <div className="pointer-events-auto hidden flex-col items-end gap-2.5 lg:flex">
          <div
            style={notebookDelay(notebookTiming.siteHeaderControls)}
            className="notebook-in-part"
          >
            <AppearanceControl />
          </div>
          <DesktopWayfinding items={primaryWayfinding} pathname={pathname} />
        </div>

        <MobileDisclosure
          items={primaryWayfinding}
          pathname={pathname}
          isOpen={isMenuOpen}
          onOpenChange={setIsMenuOpen}
        />
      </div>
    </header>
  );
}
