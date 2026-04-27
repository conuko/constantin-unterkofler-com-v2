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

// ---------------------------------------------------------------------------
// Page-level orchestration
// ---------------------------------------------------------------------------

const easeOutExpo: [number, number, number, number] = [0.16, 1, 0.3, 1];

export const headlineIn: Variants = {
  hidden: { opacity: 0, clipPath: "inset(-10% 100% -10% 0)" },
  visible: {
    opacity: 1,
    clipPath: "inset(-10% -10% -10% 0)",
    transition: {
      duration: 0.9,
      ease: easeOutExpo,
      opacity: { duration: 0.4, ease: "easeOut" },
    },
  },
};

export const contentStagger: Variants = {
  hidden: {},
  visible: {
    transition: {
      delayChildren: 0.6,
      staggerChildren: 0.12,
    },
  },
};

export const contentIn: Variants = {
  hidden: { opacity: 0, filter: "blur(3px)" },
  visible: {
    opacity: 1,
    filter: "blur(0px)",
    transition: {
      duration: 0.7,
      ease: easeOutExpo,
    },
  },
};

// ---------------------------------------------------------------------------
// Grid card cascade (left → right, top → bottom)
// ---------------------------------------------------------------------------

export const gridStagger: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.07,
    },
  },
};

export const gridCardIn: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.6,
      ease: easeOutExpo,
    },
  },
};

// ---------------------------------------------------------------------------
// List stagger (cv entries, contact links)
// ---------------------------------------------------------------------------

export const listStagger: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.06,
    },
  },
};

export const fadeInUp: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.5, ease: easeOutExpo },
  },
};

export const slideInLeft: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.5, ease: easeOutExpo },
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
