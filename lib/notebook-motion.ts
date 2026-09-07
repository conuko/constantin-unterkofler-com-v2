import { stagger, type Transition, type Variants } from "motion/react";

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

export const notebookPageHeadingReveal: Variants = {
  hidden: {
    opacity: "var(--motion-initial-opacity)",
    clipPath: "var(--motion-initial-clip)",
  },
  visible: {
    opacity: 1,
    clipPath: "inset(0 0% 0 0)",
    transition: {
      duration: 0.9,
      ease: notebookEase,
      opacity: { duration: 0.42, ease: notebookEase },
    },
  },
};

/**
 * Timing contract for sectioned record groups such as the CV: each section
 * registers its heading first, then its record rows in reading order, and the
 * next section only begins after the previous section's rows have started.
 */
export const notebookSectionSequence = {
  sectionStagger: 0.36,
  headingLead: 0.12,
  entryStagger: 0.06,
} as const;

export function notebookSectionSequenceStarts(entryCounts: number[]) {
  return entryCounts.map((entryCount, sectionIndex) => {
    const heading = sectionIndex * notebookSectionSequence.sectionStagger;

    return {
      heading,
      entries: Array.from(
        { length: entryCount },
        (_, entryIndex) =>
          heading +
          notebookSectionSequence.headingLead +
          entryIndex * notebookSectionSequence.entryStagger,
      ),
    };
  });
}

export const notebookSectionGroupReveal: Variants = {
  hidden: {},
  visible: {
    transition: {
      delayChildren: stagger(notebookSectionSequence.sectionStagger),
    },
  },
};

export const notebookSectionReveal: Variants = {
  hidden: {},
  visible: {
    transition: {
      delayChildren: stagger(notebookSectionSequence.headingLead),
    },
  },
};

export const notebookRecordRowsReveal: Variants = {
  hidden: {},
  visible: {
    transition: {
      delayChildren: stagger(notebookSectionSequence.entryStagger),
    },
  },
};
