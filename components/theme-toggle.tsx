"use client";

import { Moon, Sun } from "lucide-react";
import * as m from "motion/react-m";
import { useTheme } from "next-themes";
import { hoverScale, springSnappy, tapScale } from "@/lib/motion";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();

  return (
    <m.button
      type="button"
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      whileHover={hoverScale}
      whileTap={tapScale}
      transition={springSnappy}
      className="group relative flex size-10 items-center justify-center text-ink cursor-pointer"
    >
      <Sun className="size-4 scale-100 rotate-0 transition-transform duration-normal ease-spring group-hover:text-amber-500 dark:scale-0 dark:-rotate-90" />
      <Moon className="absolute size-4 scale-0 rotate-90 transition-transform duration-normal ease-spring group-hover:text-indigo-400 dark:scale-100 dark:rotate-0" />
      <span className="sr-only">Toggle theme</span>
    </m.button>
  );
}
