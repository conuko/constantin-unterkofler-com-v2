"use client";

import { Moon, Sun, SunMoon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { useCallback, useEffect, useRef, useState } from "react";
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
            <WayfindingLink item={item} pathname={pathname} />
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
      aria-label={isOpen ? "Close menu" : "Open menu"}
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
};

function MobileDisclosure({ items, pathname }: MobileDisclosureProps) {
  const [isOpen, setIsOpen] = useState(false);
  const previousPathnameRef = useRef(pathname);
  const disclosureControlRef = useRef<HTMLButtonElement>(null);
  const close = useCallback(() => setIsOpen(false), []);

  useEffect(() => {
    if (previousPathnameRef.current === pathname) return;

    previousPathnameRef.current = pathname;
    close();
  }, [pathname, close]);

  useEffect(() => {
    if (!isOpen) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        close();
        disclosureControlRef.current?.focus();
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isOpen, close]);

  return (
    <div
      style={notebookDelay(notebookTiming.siteHeaderControls)}
      className="notebook-in-part relative lg:hidden"
    >
      <DisclosureControl
        controlRef={disclosureControlRef}
        isOpen={isOpen}
        onToggle={() => setIsOpen((currentState) => !currentState)}
      />

      {isOpen && (
        <div aria-hidden className="fixed inset-0 -z-1" onClick={close} />
      )}

      <nav
        id="site-header-mobile-wayfinding"
        aria-label="Mobile navigation"
        data-open={isOpen}
        className="notebook-disclosure absolute top-full right-0 mt-2 min-w-40 origin-top-right border border-rule bg-paper/85 p-4 shadow-lg backdrop-blur-md"
      >
        <ul>
          {items.map((item) => (
            <li key={item.href}>
              <WayfindingLink
                item={item}
                pathname={pathname}
                className="my-1 inline-block pt-1"
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

  /* The header stacks above the sheet at every width. On desktop it has no
   * surface and the sheet scrolls beneath it, so the header box lets pointer
   * events through and only its two corners take them back, the same way the
   * Closing Record does. The sheet never reaches those corners: it is capped
   * clear of the corner lanes (`components/portfolio-page.tsx`). */
  return (
    <header
      data-site-header
      className="sticky top-7 z-10 pb-10 lg:pointer-events-none lg:top-4"
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
            isScrolled ? "opacity-100" : "opacity-0"
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

        <MobileDisclosure items={primaryWayfinding} pathname={pathname} />
      </div>
    </header>
  );
}
