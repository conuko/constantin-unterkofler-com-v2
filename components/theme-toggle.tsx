"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      className="group relative flex size-10 items-center justify-center text-ink cursor-pointer"
    >
      <Sun className="size-4 scale-100 rotate-0 transition-all group-hover:text-amber-500 dark:scale-0 dark:-rotate-90" />
      <Moon className="absolute size-4 scale-0 rotate-90 transition-all group-hover:text-indigo-400 dark:scale-100 dark:rotate-0" />
      <span className="sr-only">Toggle theme</span>
    </button>
  );
}
