"use client";

import { Moon, Sun } from "lucide-react";
import { AnimatePresence, stagger, type Variants } from "motion/react";
import * as m from "motion/react-m";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { useCallback, useEffect, useRef, useState } from "react";
import type { NavItem } from "@/content/site-content";
import {
  notebookDelay,
  notebookInteractionTransition,
  notebookTiming,
} from "@/lib/notebook-motion";
import { useScrolled } from "@/lib/use-scrolled";
import { isCurrentRoute } from "@/lib/wayfinding";

const interactionTransition = notebookInteractionTransition;
const notebookEase = [0.16, 1, 0.3, 1] as const;

/* The disclosure panel opens on a tap, long after load, so its choreography
 * stays with Motion — there is no first paint to protect here. The header's
 * own entrance is CSS, like the rest of the notebook. */
const mobileDisclosureIn: Variants = {
  hidden: {
    opacity: "var(--motion-initial-opacity)",
    y: "var(--motion-initial-y)",
    scale: "var(--motion-initial-scale)",
  },
  visible: { opacity: 1, y: 0, scale: 1 },
};

const mobileWayfindingItemIn: Variants = {
  hidden: {
    opacity: "var(--motion-initial-opacity)",
    x: "var(--motion-initial-x)",
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.24, ease: notebookEase },
  },
};

const mobileWayfindingIn: Variants = {
  hidden: {},
  visible: {
    transition: {
      delayChildren: stagger(0.05, { startDelay: 0.05 }),
    },
  },
};

type SiteHeaderProps = {
  identity: {
    shortName: string;
  };
  primaryWayfinding: NavItem[];
};

type WayfindingLinkProps = {
  item: NavItem;
  pathname: string;
  underlineLayoutId: string;
  className: string;
  onSelect?: () => void;
};

function WayfindingLink({
  item,
  pathname,
  underlineLayoutId,
  className,
  onSelect,
}: WayfindingLinkProps) {
  const isCurrent = isCurrentRoute(pathname, item.href);

  return (
    <Link
      href={item.href}
      onClick={onSelect}
      className={className}
      data-active={isCurrent}
      aria-current={isCurrent ? "page" : undefined}
    >
      {item.label}
      {isCurrent && (
        <m.span
          layoutId={underlineLayoutId}
          className="absolute inset-x-0 bottom-0 h-0.5 bg-current"
          transition={{
            type: "spring",
            visualDuration: 0.4,
            bounce: 0.2,
          }}
        />
      )}
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
            <WayfindingLink
              item={item}
              pathname={pathname}
              underlineLayoutId="site-header-desktop-underline"
              className="relative pb-1 text-xs"
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
        <span className="contents motion-reduce:hidden">
          <m.span
            animate={isOpen ? { rotate: 45, y: 0 } : { rotate: 0, y: -6 }}
            transition={interactionTransition}
            className="absolute h-0.5 w-5 rounded-full bg-current"
          />
          <m.span
            data-disclosure-middle-line
            animate={
              isOpen ? { opacity: 0, scale: 0 } : { opacity: 1, scale: 1 }
            }
            transition={interactionTransition}
            className="absolute h-0.5 w-5 rounded-full bg-current"
          />
          <m.span
            animate={isOpen ? { rotate: -45, y: 0 } : { rotate: 0, y: 6 }}
            transition={interactionTransition}
            className="absolute h-0.5 w-5 rounded-full bg-current"
          />
        </span>
        <span className="hidden motion-reduce:contents">
          <span
            className={`absolute h-0.5 w-5 rounded-full bg-current ${isOpen ? "rotate-45" : "-translate-y-1.5"}`}
          />
          <span
            data-disclosure-middle-line
            className={`absolute h-0.5 w-5 rounded-full bg-current ${isOpen ? "scale-0 opacity-0" : "scale-100 opacity-100"}`}
          />
          <span
            className={`absolute h-0.5 w-5 rounded-full bg-current ${isOpen ? "-rotate-45" : "translate-y-1.5"}`}
          />
        </span>
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

      <AnimatePresence initial={false}>
        {isOpen && (
          <>
            <m.div
              key="site-header-mobile-backdrop"
              initial={{ opacity: "var(--motion-initial-opacity)" }}
              animate={{ opacity: 1 }}
              exit={{ opacity: "var(--motion-initial-opacity)" }}
              className="fixed inset-0 -z-1"
              onClick={close}
              aria-hidden
            />

            <m.nav
              key="site-header-mobile-wayfinding"
              id="site-header-mobile-wayfinding"
              aria-label="Mobile navigation"
              variants={mobileDisclosureIn}
              initial="hidden"
              animate="visible"
              exit="hidden"
              transition={{
                type: "spring",
                visualDuration: 0.3,
                bounce: 0.2,
              }}
              style={{ transformOrigin: "top right" }}
              className="absolute top-full right-0 mt-2 min-w-40 rounded-xl border border-rule bg-paper/85 p-4 shadow-lg backdrop-blur-md"
            >
              <m.ul
                variants={mobileWayfindingIn}
                initial="hidden"
                animate="visible"
              >
                {items.map((item) => (
                  <m.li key={item.href} variants={mobileWayfindingItemIn}>
                    <WayfindingLink
                      item={item}
                      pathname={pathname}
                      underlineLayoutId="site-header-mobile-underline"
                      className={`relative inline-block py-2 text-xs`}
                      onSelect={close}
                    />
                  </m.li>
                ))}
              </m.ul>

              <div className="mt-2 border-rule border-t pt-2">
                <AppearanceControl />
              </div>
            </m.nav>
          </>
        )}
      </AnimatePresence>
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

        <div
          style={notebookDelay(notebookTiming.siteHeaderIdentity)}
          className="notebook-in-part self-start"
        >
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
