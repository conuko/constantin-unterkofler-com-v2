"use client";

import { ThemeProvider as NextThemesProvider, useTheme } from "next-themes";
import type * as React from "react";
import { useEffect, useRef } from "react";
import { isThemeSetting, type ThemeSetting } from "@/lib/theme-setting";

/**
 * Keeps `data-theme-setting` on `<html>` in step with the stored setting after
 * first paint (`themeSettingScript` writes it before), whichever way it
 * changed: the theme control, the console's `theme`, or another tab. A change
 * also leaves the setting it came from as `data-theme-previous`, which is what
 * lets the control's glyphs swap (see the theme control notes in
 * `app/motion.css`). The first sync has nothing to swap from and sets none.
 */
function ThemeSettingSync() {
  const { theme } = useTheme();
  const previousRef = useRef<ThemeSetting | null>(null);

  useEffect(() => {
    if (!isThemeSetting(theme)) return;

    const root = document.documentElement;
    const previous = previousRef.current;
    previousRef.current = theme;

    if (previous !== null && previous !== theme) {
      root.dataset.themePrevious = previous;
    }
    root.dataset.themeSetting = theme;
  }, [theme]);

  return null;
}

export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  return (
    <NextThemesProvider {...props}>
      <ThemeSettingSync />
      {children}
    </NextThemesProvider>
  );
}
