# Mobile Burger Menu & Glass-morph Header Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a responsive burger menu for mobile and a glass-morph frosted header on scroll.

**Architecture:** Three new files (`useScrolled` hook, `BurgerButton`, `MobileNav`) integrated into the existing `MotionLayout` header. Glass-morph is CSS-driven via scroll state. All animations use the existing motion.dev setup with `LazyMotion` and `m` components.

**Tech Stack:** Next.js 16, React 19, motion.dev v12 (`motion/react-m`), Tailwind CSS v4 (CSS-native `@theme`), `next-themes`

**Note on testing:** This project has no test framework configured. Verification uses `pnpm typecheck`, `pnpm lint`, `pnpm build`, and manual browser checks.

**Spec:** `docs/superpowers/specs/2026-04-27-mobile-nav-glass-header-design.md`

---

### Task 1: Add motion variants for the menu

**Files:**
- Modify: `lib/motion.ts`

- [ ] **Step 1: Add menu animation variants**

Add these three variant exports to the end of `lib/motion.ts`:

```ts
export const menuPanel: Variants = {
  hidden: { opacity: 0, y: -8, scale: 0.95 },
  visible: { opacity: 1, y: 0, scale: 1 },
};

export const menuItem: Variants = {
  hidden: { opacity: 0, x: 8 },
  visible: { opacity: 1, x: 0 },
};

export const menuStagger: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.05,
    },
  },
};
```

- [ ] **Step 2: Verify**

Run: `pnpm typecheck`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add lib/motion.ts
git commit -m "feat: add menu animation variants for mobile nav"
```

---

### Task 2: Create `useScrolled` hook

**Files:**
- Create: `lib/use-scrolled.ts`

- [ ] **Step 1: Create the hook file**

Create `lib/use-scrolled.ts`:

```ts
"use client";

import { useEffect, useState } from "react";

export function useScrolled(threshold = 10): boolean {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    let ticking = false;

    function onScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        setScrolled(window.scrollY > threshold);
        ticking = false;
      });
    }

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [threshold]);

  return scrolled;
}
```

Key details:
- `requestAnimationFrame` throttles updates to once per frame
- `{ passive: true }` avoids blocking scroll
- `onScroll()` called once on mount to handle page-refresh-while-scrolled
- SSR-safe: `useState(false)` is the server default; `useEffect` runs only on client

- [ ] **Step 2: Verify**

Run: `pnpm typecheck`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add lib/use-scrolled.ts
git commit -m "feat: add useScrolled hook for scroll-aware header"
```

---

### Task 3: Create `BurgerButton` component

**Files:**
- Create: `components/burger-button.tsx`

- [ ] **Step 1: Create the burger button component**

Create `components/burger-button.tsx`:

```tsx
"use client";

import * as m from "motion/react-m";
import { springSnappy } from "@/lib/motion";

type BurgerButtonProps = {
  isOpen: boolean;
  onToggle: () => void;
};

export function BurgerButton({ isOpen, onToggle }: BurgerButtonProps) {
  return (
    <m.button
      type="button"
      onClick={onToggle}
      whileHover={{ scale: 1.15 }}
      whileTap={{ scale: 0.9 }}
      transition={springSnappy}
      aria-expanded={isOpen}
      aria-controls="mobile-nav-panel"
      aria-label={isOpen ? "Close menu" : "Open menu"}
      className="relative flex size-10 items-center justify-center cursor-pointer"
    >
      <div className="flex flex-col items-center justify-center w-5 h-5">
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
```

Key details:
- Three `m.span` bars are absolutely positioned inside a flex container
- In closed state: top at `y: -6`, middle at `y: 0`, bottom at `y: 6` (6px spacing)
- In open state: top rotates 45deg to center, bottom rotates -45deg to center, middle fades
- `springSnappy` matches the existing interactive elements (ThemeToggle, logo)
- ARIA attributes: `aria-expanded`, `aria-controls`, dynamic `aria-label`

- [ ] **Step 2: Verify**

Run: `pnpm typecheck`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add components/burger-button.tsx
git commit -m "feat: add animated BurgerButton component"
```

---

### Task 4: Create `MobileNav` component

**Files:**
- Create: `components/mobile-nav.tsx`

- [ ] **Step 1: Create the mobile nav component**

Create `components/mobile-nav.tsx`:

```tsx
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

  useEffect(() => {
    close();
  }, [pathname, close]);

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
              className="absolute right-0 top-full mt-2 min-w-[160px] rounded-xl border border-rule bg-card-glass p-4 shadow-lg backdrop-blur-md"
            >
              <m.ul
                variants={menuStagger}
                initial="hidden"
                animate="visible"
              >
                {items.map((item) => {
                  const isActive =
                    pathname === item.href ||
                    (item.href !== "/" && pathname.startsWith(`${item.href}/`));

                  return (
                    <m.li key={item.href} variants={menuItem}>
                      <Link
                        href={item.href}
                        onClick={close}
                        className="block py-2 text-xs tracking-wide"
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
```

Key details:
- `useState(false)` for open/close state
- `usePathname()` in `useEffect` to close on route change
- `Escape` key listener active only when open
- Click-outside: invisible `fixed inset-0` backdrop behind dropdown (z-index `-1` relative to panel)
- `AnimatePresence` wraps the backdrop + nav panel for enter/exit animations
- Dropdown uses `menuPanel` variants with spring transition, `transformOrigin: "top right"`
- Links use `menuItem` variants inside a `menuStagger` container for staggered entrance
- Active link detection reuses the same logic from `SiteNav`
- Active underline uses a different `layoutId` (`"mobile-nav-underline"`) to avoid conflicts with desktop nav
- `ThemeToggle` at bottom with separator

- [ ] **Step 2: Verify**

Run: `pnpm typecheck`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add components/mobile-nav.tsx
git commit -m "feat: add MobileNav component with glass-morph dropdown"
```

---

### Task 5: Integrate into `MotionLayout`

**Files:**
- Modify: `components/motion-layout.tsx`

- [ ] **Step 1: Add imports**

Add these imports to the top of `components/motion-layout.tsx`:

```ts
import { MobileNav } from "@/components/mobile-nav";
import { useScrolled } from "@/lib/use-scrolled";
```

- [ ] **Step 2: Add scroll detection**

Inside the `MotionLayout` function body, before the `return`, add:

```ts
const isScrolled = useScrolled();
```

- [ ] **Step 3: Update header element**

Replace the current `<m.header>` opening tag:

```tsx
<m.header
  initial={{ opacity: 0, y: -10 }}
  animate={{ opacity: 1, y: 0 }}
  className="flex items-start justify-between gap-6 pb-8 sticky top-4 z-10"
>
```

With:

```tsx
<m.header
  initial={{ opacity: 0, y: -10 }}
  animate={{ opacity: 1, y: 0 }}
  className={`flex items-center justify-between gap-6 pb-8 sticky top-4 z-10 transition-all duration-normal ease-default ${
    isScrolled
      ? "rounded-xl border border-rule bg-card-glass px-4 py-3 backdrop-blur-md shadow-sm"
      : ""
  }`}
>
```

Changes:
- `items-start` -> `items-center` (better vertical alignment with burger button)
- Conditional glass-morph classes when scrolled: `rounded-xl border border-rule bg-card-glass px-4 py-3 backdrop-blur-md shadow-sm`
- `transition-all duration-normal ease-default` for smooth CSS transition
- `px-4 py-3` overrides the parent padding to create a compact floating bar feel when scrolled

- [ ] **Step 4: Hide desktop nav on mobile, show mobile nav**

Replace the current right-side `<div>`:

```tsx
<div className="flex flex-col items-end">
  <ThemeToggle />
  <SiteNav
    items={navItems}
    ariaLabel="Primary"
    className="flex flex-col items-end"
  />
</div>
```

With:

```tsx
<div className="hidden lg:flex flex-col items-end">
  <ThemeToggle />
  <SiteNav
    items={navItems}
    ariaLabel="Primary"
    className="flex flex-col items-end"
  />
</div>

<MobileNav items={navItems} className="lg:hidden" />
```

- [ ] **Step 5: Verify**

Run: `pnpm typecheck && pnpm lint`
Expected: No errors

- [ ] **Step 6: Verify build**

Run: `pnpm build`
Expected: Build succeeds with no errors

- [ ] **Step 7: Commit**

```bash
git add components/motion-layout.tsx
git commit -m "feat: integrate mobile nav and glass-morph header into layout"
```

---

### Task 6: Manual verification & polish

- [ ] **Step 1: Start dev server**

Run: `pnpm dev`

- [ ] **Step 2: Test mobile viewport**

Open browser at `http://localhost:3000`, resize to mobile width (< 1024px):
- Verify burger button is visible, desktop nav is hidden
- Click burger: dropdown should animate in (scale + fade, staggered links)
- Click a link: menu closes, navigates to page
- Click outside: menu closes
- Press Escape: menu closes

- [ ] **Step 3: Test scroll behavior**

Scroll down on any page:
- Header should gain glass-morph (blur, translucent bg, border, rounded corners)
- Transition should be smooth, not jarring
- Scroll back to top: glass-morph fades away

- [ ] **Step 4: Test desktop viewport**

Resize to desktop width (>= 1024px):
- Burger button should be hidden
- Desktop nav + ThemeToggle visible
- Glass-morph on scroll should still work

- [ ] **Step 5: Test dark mode**

Toggle theme in both mobile and desktop:
- Glass-morph should use dark `--color-card-glass` (`rgba(26,25,23,0.52)`)
- Border should use dark `--color-rule`
- All text should be readable

- [ ] **Step 6: Test reduced motion**

Enable `prefers-reduced-motion: reduce` in browser dev tools:
- motion.dev respects `reducedMotion="user"` from `MotionConfig`
- CSS transitions use `--duration-normal: 0ms` (from theme.css media query)

- [ ] **Step 7: Fix any issues found, then commit**

```bash
git add -A
git commit -m "feat: polish mobile nav and glass-morph header"
```
