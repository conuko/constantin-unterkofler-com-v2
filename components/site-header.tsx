"use client";

import { Moon, Sun } from "lucide-react";
import { AnimatePresence } from "motion/react";
import * as m from "motion/react-m";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { useCallback, useEffect, useRef, useState } from "react";
import type { NavItem } from "@/content/site-content";
import {
  fadeInUp,
  hoverScale,
  menuItem,
  menuPanel,
  menuStagger,
  navStagger,
  springSnappy,
  tapScale,
} from "@/lib/motion";
import { useScrolled } from "@/lib/use-scrolled";

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
  const isCurrent =
    pathname === item.href ||
    (item.href !== "/" && pathname.startsWith(`${item.href}/`));

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
    <m.button
      type="button"
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      whileHover={hoverScale}
      whileTap={tapScale}
      transition={springSnappy}
      className="group relative flex size-10 cursor-pointer items-center justify-center text-ink"
    >
      <Sun className="size-4 scale-100 rotate-0 transition-transform duration-normal ease-spring group-hover:text-amber-500 dark:scale-0 dark:-rotate-90" />
      <Moon className="absolute size-4 scale-0 rotate-90 transition-transform duration-normal ease-spring group-hover:text-indigo-400 dark:scale-100 dark:rotate-0" />
      <span className="sr-only">Toggle theme</span>
    </m.button>
  );
}

type DesktopWayfindingProps = {
  items: NavItem[];
  pathname: string;
};

function DesktopWayfinding({ items, pathname }: DesktopWayfindingProps) {
  return (
    <nav aria-label="Primary">
      <m.ul
        variants={navStagger}
        initial="hidden"
        animate="visible"
        className="flex flex-col items-end"
      >
        {items.map((item) => (
          <m.li key={item.href} variants={fadeInUp}>
            <WayfindingLink
              item={item}
              pathname={pathname}
              underlineLayoutId="site-header-desktop-underline"
              className="relative pb-1 text-xs tracking-wide"
            />
          </m.li>
        ))}
      </m.ul>
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
    <m.button
      ref={controlRef}
      type="button"
      onClick={onToggle}
      whileHover={hoverScale}
      whileTap={tapScale}
      transition={springSnappy}
      aria-expanded={isOpen}
      aria-controls="site-header-mobile-wayfinding"
      aria-label={isOpen ? "Close menu" : "Open menu"}
      className="relative flex size-10 cursor-pointer items-center justify-center"
    >
      <div className="flex size-5 flex-col items-center justify-center">
        <m.span
          animate={isOpen ? { rotate: 45, y: 0 } : { rotate: 0, y: -6 }}
          transition={springSnappy}
          className="absolute h-0.5 w-5 rounded-full bg-current"
        />
        <m.span
          animate={isOpen ? { opacity: 0, scale: 0 } : { opacity: 1, scale: 1 }}
          transition={springSnappy}
          className="absolute h-0.5 w-5 rounded-full bg-current"
        />
        <m.span
          animate={isOpen ? { rotate: -45, y: 0 } : { rotate: 0, y: 6 }}
          transition={springSnappy}
          className="absolute h-0.5 w-5 rounded-full bg-current"
        />
      </div>
    </m.button>
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
    <div className="relative lg:hidden">
      <DisclosureControl
        controlRef={disclosureControlRef}
        isOpen={isOpen}
        onToggle={() => setIsOpen((currentState) => !currentState)}
      />

      <AnimatePresence>
        {isOpen && (
          <>
            <m.div
              key="site-header-mobile-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[-1]"
              onClick={close}
              aria-hidden
            />

            <m.nav
              key="site-header-mobile-wayfinding"
              id="site-header-mobile-wayfinding"
              aria-label="Mobile navigation"
              variants={menuPanel}
              initial="hidden"
              animate="visible"
              exit="hidden"
              transition={{
                type: "spring",
                visualDuration: 0.3,
                bounce: 0.2,
              }}
              style={{ transformOrigin: "top right" }}
              className="absolute right-0 top-full mt-2 min-w-[160px] rounded-xl border border-rule bg-paper/85 p-4 shadow-lg backdrop-blur-md"
            >
              <m.ul variants={menuStagger} initial="hidden" animate="visible">
                {items.map((item) => (
                  <m.li key={item.href} variants={menuItem}>
                    <WayfindingLink
                      item={item}
                      pathname={pathname}
                      underlineLayoutId="site-header-mobile-underline"
                      className="relative inline-block py-2 text-xs tracking-wide"
                      onSelect={close}
                    />
                  </m.li>
                ))}
              </m.ul>

              <div className="mt-2 border-t border-rule pt-2">
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
    <m.header
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={`sticky top-4 z-10 flex justify-between gap-6 rounded-xl border border-transparent lg:z-0 lg:rounded-none lg:pb-8 max-lg:transition-[background-color,border-color,box-shadow,padding,backdrop-filter] max-lg:duration-normal max-lg:ease-default ${
        isScrolled
          ? "max-lg:border-rule max-lg:bg-card-glass max-lg:px-4 max-lg:py-3 max-lg:backdrop-blur-md max-lg:shadow-sm"
          : "max-lg:pb-8"
      }`}
    >
      <m.div
        whileHover={hoverScale}
        whileTap={tapScale}
        transition={springSnappy}
        className="self-start"
      >
        <Link
          href="/"
          aria-label="Home"
          className="flex size-10 items-center justify-center text-xs tracking-wide"
        >
          {identity.shortName}
        </Link>
      </m.div>

      <div className="hidden flex-col items-end lg:flex">
        <AppearanceControl />
        <DesktopWayfinding items={primaryWayfinding} pathname={pathname} />
      </div>

      <MobileDisclosure items={primaryWayfinding} pathname={pathname} />
    </m.header>
  );
}
