import type { Transition, Variants } from "motion/react";

export const notebookEase = [0.16, 1, 0.3, 1] as const;

export const notebookInteractionTransition = {
  type: "spring",
  visualDuration: 0.24,
  bounce: 0.1,
} satisfies Transition;

export function createNotebookRecordReveal(sequence: {
  delayChildren: number;
  staggerChildren: number;
}): Variants {
  return {
    hidden: {
      y: "var(--motion-initial-y)",
    },
    visible: {
      y: 0,
      transition: {
        duration: 0.42,
        ease: notebookEase,
        ...sequence,
      },
    },
  };
}

export const notebookPartReveal: Variants = {
  hidden: {
    opacity: "var(--motion-initial-opacity)",
    y: "var(--motion-initial-y)",
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.32,
      ease: notebookEase,
    },
  },
};

export const notebookRuleReveal: Variants = {
  hidden: {
    opacity: "var(--motion-initial-opacity)",
    scaleX: "var(--motion-initial-rule-scale)",
  },
  visible: {
    opacity: 1,
    scaleX: 1,
    transition: {
      duration: 0.36,
      ease: notebookEase,
    },
  },
};

export const notebookPageHeadingReveal: Variants = {
  hidden: {
    opacity: "var(--motion-initial-opacity)",
    clipPath: "var(--motion-initial-clip)",
  },
  visible: {
    opacity: 1,
    clipPath: "inset(-10% -10% -10% 0)",
    transition: {
      duration: 0.9,
      ease: notebookEase,
      opacity: { duration: 0.4, ease: "easeOut" },
    },
  },
};

export const notebookPageIntroductionReveal: Variants = {
  hidden: {
    opacity: "var(--motion-initial-opacity)",
    filter: "var(--motion-initial-filter)",
  },
  visible: {
    opacity: 1,
    filter: "blur(0px)",
    transition: {
      duration: 0.7,
      ease: notebookEase,
    },
  },
};
