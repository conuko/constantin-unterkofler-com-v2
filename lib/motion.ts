import type { Transition, Variants } from "motion/react";

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
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export const fadeInUpStaggered: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      visualDuration: 0.4,
      bounce: 0.2,
      delay: i * 0.06,
    },
  }),
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.97, y: 15 },
  visible: { opacity: 1, scale: 1, y: 0 },
};

export const slideInLeft: Variants = {
  hidden: { opacity: 0, x: -16 },
  visible: { opacity: 1, x: 0 },
};

export const staggerContainer: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};
