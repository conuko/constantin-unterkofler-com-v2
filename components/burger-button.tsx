"use client";

import * as m from "motion/react-m";
import { hoverScale, springSnappy, tapScale } from "@/lib/motion";

type BurgerButtonProps = {
  isOpen: boolean;
  onToggle: () => void;
};

export function BurgerButton({ isOpen, onToggle }: BurgerButtonProps) {
  return (
    <m.button
      type="button"
      onClick={onToggle}
      whileHover={hoverScale}
      whileTap={tapScale}
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
