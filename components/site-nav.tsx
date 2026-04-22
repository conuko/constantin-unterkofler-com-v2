"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { NavItem } from "@/content/site-content";

type SiteNavProps = {
  items: NavItem[];
  ariaLabel: string;
  className?: string;
};

export function SiteNav({ items, ariaLabel, className }: SiteNavProps) {
  const pathname = usePathname();

  return (
    <nav aria-label={ariaLabel} className={className}>
      {items.map((item) => {
        const isActive =
          pathname === item.href ||
          (item.href !== "/" && pathname.startsWith(`${item.href}/`));

        return (
          <Link
            key={item.href}
            href={item.href}
            className="text-xs font-semibold tracking-wide underline-reveal"
            data-active={isActive}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
