import type { Transition, Variants } from "motion/react";

export const tapScale = { scale: 0.95 };
export const hoverScale = { scale: 1.05 };

export const springDefault: Transition = {
  type: "spring",
  visualDuration: 0.5,
  bounce: 0.15,
};

export const springSnappy: Transition = {
  type: "spring",
  visualDuration: 0.3,
  bounce: 0.25,
};

export const springGentle: Transition = {
  type: "spring",
  visualDuration: 0.7,
  bounce: 0.1,
};

export const viewportOnce = {
  once: true,
  margin: "0px 0px -80px 0px" as const,
};

export const fadeInUp: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
  },
};

// ---------------------------------------------------------------------------
// Desktop nav stagger
// ---------------------------------------------------------------------------

export const navStagger: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

// ---------------------------------------------------------------------------
// Mobile menu
// ---------------------------------------------------------------------------

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
