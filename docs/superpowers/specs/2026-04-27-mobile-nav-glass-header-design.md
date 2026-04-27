# Mobile Burger Menu & Glass-morph Header

## Summary

Add a responsive burger menu for mobile (below `lg` breakpoint) and a glass-morph frosted-glass header background that activates on scroll. Uses motion.dev for all animations.

## Requirements

- Below `lg`: hide desktop nav (SiteNav + ThemeToggle), show a burger button
- Burger button: three bars morphing to X with spring animation
- Dropdown: right-aligned glass-morph panel with staggered nav links + ThemeToggle
- Header: transparent at top, transitions to glass-morph (blur + translucent bg) on scroll
- Close dropdown on: link click, outside click, Escape key, route change
- Accessible: proper ARIA attributes, keyboard support, focus management

## Architecture

### New Files

- `lib/use-scrolled.ts` -- hook returning `isScrolled` boolean when user scrolls past threshold (10px)
- `components/burger-button.tsx` -- animated three-bar-to-X button
- `components/mobile-nav.tsx` -- client component with burger button + AnimatePresence dropdown

### Modified Files

- `components/motion-layout.tsx` -- integrate glass-morph header + responsive show/hide of desktop vs mobile nav
- `lib/motion.ts` -- add dropdown panel and staggered link animation variants
- `app/theme.css` -- (if needed) no new tokens required; reuses `--color-card-glass`, `--color-rule`

### Component Tree (mobile)

```
<header class="... [glass-morph classes when scrolled]">
  <Link "CU" />
  <div class="hidden lg:flex flex-col items-end">
    <ThemeToggle />
    <SiteNav />
  </div>
  <MobileNav class="relative lg:hidden">
    <BurgerButton isOpen toggle />
    <AnimatePresence>
      {isOpen && <DropdownPanel />}
    </AnimatePresence>
  </MobileNav>
</header>
```

## useScrolled Hook

- Returns `boolean` -- `true` when `window.scrollY > 10`
- Passive scroll event listener
- Throttled with `requestAnimationFrame`
- SSR-safe: defaults to `false`, logic in `useEffect`

## Glass-morph Header

### Default (top of page)

No blur, transparent background -- unchanged from current.

### Scrolled state

- `backdrop-blur-md` (Tailwind)
- `bg-card-glass` (reuses existing `--color-card-glass` token: `rgba(255,255,255,0.52)` light / `rgba(26,25,23,0.52)` dark)
- `border border-rule rounded-xl`
- Smooth CSS transition: `transition-all duration-normal ease-default`
- Existing `sticky top-4` and `p-6` container create a natural floating bar

## Burger Button

### Structure

`<m.button>` wrapping three `<m.span>` bars.

### Bar specs

- Each bar: `h-0.5 w-5 bg-current rounded-full`
- Spacing: top `y: -6`, middle `y: 0`, bottom `y: 6`

### Closed -> Open animation

- Top bar: `{ rotate: 45, y: 0 }` (rotates and moves to center)
- Middle bar: `{ opacity: 0, scale: 0 }` (fades and shrinks)
- Bottom bar: `{ rotate: -45, y: 0 }` (rotates and moves to center)
- Transition: `springSnappy` (`visualDuration: 0.3, bounce: 0.25`)

### Interaction

- `whileHover={{ scale: 1.15 }}`
- `whileTap={{ scale: 0.9 }}`
- Consistent with ThemeToggle and logo

### Accessibility

- `aria-expanded={isOpen}`
- `aria-controls="mobile-nav-panel"`
- `aria-label={isOpen ? "Close menu" : "Open menu"}`
- `<button type="button">`

## Dropdown Panel

### Positioning

- `absolute right-0 top-full mt-2`
- `min-w-[160px] p-4`

### Glass-morph styling

- `backdrop-blur-md bg-card-glass border border-rule rounded-xl`
- Shadow: `shadow-lg` for depth

### Panel animation (AnimatePresence)

- `initial={{ opacity: 0, y: -8, scale: 0.95 }}`
- `animate={{ opacity: 1, y: 0, scale: 1 }}`
- `exit={{ opacity: 0, y: -8, scale: 0.95 }}`
- `transformOrigin: "top right"`
- Transition: spring `visualDuration: 0.3, bounce: 0.2`

### Staggered link animation

- Enter: `opacity: 0, x: 8` -> `opacity: 1, x: 0` (slide from right)
- `staggerChildren: 0.05` on parent `ul`
- Exit: simultaneous fade, no stagger (fast dismiss)

### Link styling

- `block py-2 text-xs tracking-wide`
- Active state: `data-active` + motion `layoutId` underline (reuses `SiteNav` pattern)
- ThemeToggle placed at bottom of dropdown with a `border-t border-rule pt-2 mt-2` separator

### Closing behavior

- Click nav link -> close + navigate
- Click outside -> transparent backdrop `fixed inset-0` behind dropdown
- Press Escape -> close
- Route change -> watch `usePathname()` in `useEffect`

## Responsive Strategy

| Breakpoint | Nav visible | Burger visible | Glass-morph |
|------------|-------------|----------------|-------------|
| `< lg`     | Hidden      | Shown          | On scroll   |
| `>= lg`    | Shown       | Hidden         | On scroll   |

Glass-morph applies at all breakpoints on scroll (it enhances the sticky header at all sizes).

## Motion Variants (additions to lib/motion.ts)

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

## Dependencies

No new dependencies. Uses:
- `motion` (v12, already installed) -- `m`, `AnimatePresence`
- `next/navigation` -- `usePathname` (already used)
- Tailwind v4 responsive classes (`lg:hidden`, `hidden lg:flex`)
- Existing theme tokens (`--color-card-glass`, `--color-rule`)
