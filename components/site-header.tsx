"use client";

import { Moon, Sun } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import {
  type CSSProperties,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import type { NavItem } from "@/content/site-content";
import { notebookDelay, notebookTiming } from "@/lib/notebook-motion";
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

  return (
    <Link
      href={item.href}
      onClick={onSelect}
      className={cn("underline-reveal text-xs", className)}
      data-active={isCurrent}
      aria-current={isCurrent ? "page" : undefined}
    >
      {item.label}
    </Link>
  );
}

function AppearanceControl() {
  const { resolvedTheme, setTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      className="notebook-control group relative flex size-10 cursor-pointer items-center justify-center text-ink"
    >
      <Sun className="size-4 rotate-0 scale-100 transition-transform duration-normal ease-spring group-hover:text-amber-500 dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute size-4 rotate-90 scale-0 transition-transform duration-normal ease-spring group-hover:text-indigo-400 dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Toggle theme</span>
    </button>
  );
}

type DesktopWayfindingProps = {
  items: NavItem[];
  pathname: string;
};

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
 * utilities and the spring curve carries the change between them. */
const disclosureLine =
  "absolute h-0.5 w-5 rounded-full bg-current duration-normal ease-spring";

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
      className="notebook-control relative flex size-10 cursor-pointer items-center justify-center"
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

/* The panel's items register in reading order on the same DOM-order stagger
 * the record groups use: the list names its offset and step once, and
 * `app/motion.css` resolves each item's delay from its position. */
const disclosureStagger = {
  "--notebook-stagger-base": "0.05s",
  "--notebook-stagger-step": "0.05s",
} as CSSProperties;

/* The disclosure opens on a tap, long after load, so it never touches first
 * paint. It stays in the DOM and transitions between its closed and open states
 * (see the DISCLOSURE block in `app/motion.css`), which gives the exit the same
 * choreography as the entrance without anything watching for unmount. */
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
        className="notebook-disclosure absolute top-full right-0 mt-2 min-w-40 origin-top-right rounded-xl border border-rule bg-paper/85 p-4 shadow-lg backdrop-blur-md"
      >
        <ul data-notebook-stagger style={disclosureStagger}>
          {items.map((item) => (
            <li key={item.href} className="notebook-disclosure-item">
              <WayfindingLink
                item={item}
                pathname={pathname}
                className="my-1 inline-block pt-1"
                onSelect={close}
              />
            </li>
          ))}
        </ul>

        <div className="mt-2 border-rule border-t pt-2">
          <AppearanceControl />
        </div>
      </nav>
    </div>
  );
}

export function SiteHeader({ identity, primaryWayfinding }: SiteHeaderProps) {
  const pathname = usePathname();
  const isScrolled = useScrolled();

  return (
    <header data-site-header className="sticky top-7 z-10 pb-8 lg:top-4 lg:z-0">
      <div className="relative flex justify-between gap-6">
        {/* The glass surface is its own layer rather than the header's own
         * background, for two reasons. iOS Safari silently drops
         * `position: sticky` from any element that also carries a backdrop
         * filter, so a header that grew its own filter on scroll stopped
         * sticking on real devices. And because this layer holds a constant
         * filter and constant box, crossing the scroll threshold animates
         * opacity alone — no relayout, and no asking WebKit to build a
         * backdrop layer mid-scroll, which is what made the switch flicker.
         * Insets, not padding, keep the header's content still while the
         * surface fades in around it. */}
        <div
          aria-hidden
          className={`pointer-events-none absolute -inset-x-4 -inset-y-3 -z-10 rounded-xl border border-rule bg-card-glass shadow-sm backdrop-blur-md transition-opacity duration-normal ease-default lg:hidden ${
            isScrolled ? "opacity-100" : "opacity-0"
          }`}
        />

        {/* The identity mark has no entrance: it is simply there from the
         * first frame. That makes it the one element above the fold that is
         * opaque at first paint, which is what keeps FCP and LCP reportable
         * while everything else arrives from transparent — see the
         * paint-timing notes in `app/motion.css`. */}
        <div className="self-start">
          <Link
            href="/"
            className="notebook-control flex size-10 items-center justify-center text-ink text-xs"
          >
            {identity.shortName}
            <span className="sr-only">— home</span>
          </Link>
        </div>

        <div
          style={notebookDelay(notebookTiming.siteHeaderControls)}
          className="notebook-in-part hidden flex-col items-end lg:flex"
        >
          <AppearanceControl />
          <DesktopWayfinding items={primaryWayfinding} pathname={pathname} />
        </div>

        <MobileDisclosure items={primaryWayfinding} pathname={pathname} />
      </div>
    </header>
  );
}
