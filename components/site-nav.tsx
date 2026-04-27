"use client";

import * as m from "motion/react-m";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { NavItem } from "@/content/site-content";
import { fadeInUp, staggerContainer } from "@/lib/motion";

type SiteNavProps = {
  items: NavItem[];
  ariaLabel: string;
  className?: string;
};

export function SiteNav({ items, ariaLabel, className }: SiteNavProps) {
  const pathname = usePathname();

  return (
    <nav aria-label={ariaLabel}>
      <m.ul
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className={className}
      >
        {items.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/" && pathname.startsWith(`${item.href}/`));

          return (
            <m.li key={item.href} variants={fadeInUp}>
              <Link
                href={item.href}
                className="relative text-xs tracking-wide pb-1"
                data-active={isActive}
              >
                {item.label}
                {isActive && (
                  <m.span
                    layoutId="nav-underline"
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
    </nav>
  );
}
