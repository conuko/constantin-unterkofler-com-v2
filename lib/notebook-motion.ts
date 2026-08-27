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

export const notebookPageIdentityReveal: Variants = {
  hidden: {
    opacity: "var(--motion-initial-opacity)",
    y: "var(--motion-initial-y)",
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.42,
      ease: notebookEase,
    },
  },
};

export const notebookPageHeadingClipHidden = "inset(0 100% 0 0)";
export const notebookPageHeadingClipVisible = "inset(0 0% 0 0)";

export const notebookPageHeadingRevealTransition = {
  duration: 0.9,
  ease: notebookEase,
  delay: 0.08,
} as const;
