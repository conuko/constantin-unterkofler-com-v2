"use client";

import { AnimatePresence } from "motion/react";
import * as m from "motion/react-m";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { BurgerButton } from "@/components/burger-button";
import { ThemeToggle } from "@/components/theme-toggle";
import type { NavItem } from "@/content/site-content";
import { menuItem, menuPanel, menuStagger } from "@/lib/motion";

type MobileNavProps = {
  items: NavItem[];
  className?: string;
};

export function MobileNav({ items, className }: MobileNavProps) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const close = useCallback(() => setIsOpen(false), []);

  // biome-ignore lint/correctness/useExhaustiveDependencies: close menu when route changes
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!isOpen) return;

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") close();
    }

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isOpen, close]);

  return (
    <div className={`relative ${className ?? ""}`}>
      <BurgerButton isOpen={isOpen} onToggle={() => setIsOpen((o) => !o)} />

      <AnimatePresence>
        {isOpen && (
          <>
            <m.div
              key="mobile-nav-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[-1]"
              onClick={close}
              aria-hidden
            />

            <m.nav
              key="mobile-nav-panel"
              id="mobile-nav-panel"
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
                {items.map((item) => {
                  const isActive =
                    pathname === item.href ||
                    (item.href !== "/" && pathname.startsWith(`${item.href}/`));

                  return (
                    <m.li key={item.href} variants={menuItem}>
                      <Link
                        href={item.href}
                        onClick={close}
                        className="relative inline-block py-2 text-xs tracking-wide"
                        data-active={isActive}
                        aria-current={isActive ? "page" : undefined}
                      >
                        {item.label}
                        {isActive && (
                          <m.span
                            layoutId="mobile-nav-underline"
                            className="absolute inset-x-0 bottom-0 h-0.5 bg-current"
                            transition={{
                              type: "spring",
                              visualDuration: 0.4,
                              bounce: 0.2,
                            }}
                          />
                        )}
                      </Link>
                    </m.li>
                  );
                })}
              </m.ul>

              <div className="mt-2 border-t border-rule pt-2">
                <ThemeToggle />
              </div>
            </m.nav>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
