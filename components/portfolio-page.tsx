"use client";

import { stagger, type Variants } from "motion/react";
import * as m from "motion/react-m";
import { type ReactNode, useCallback, useState } from "react";
import {
  NotebookPageHeader,
  NotebookPageIdentityProvider,
} from "@/components/notebook-primitives";
import { cn } from "@/lib/utils/cn";

type PortfolioPageProps = {
  title: string;
  sectionCode: string;
  greeting?: ReactNode;
  introduction?: ReactNode;
  children?: ReactNode;
  showHeaderRule?: boolean;
  width: "collection" | "reading";
};

const contentStagger: Variants = {
  hidden: {},
  visible: {
    transition: {
      delayChildren: 0.6,
      staggerChildren: 0.12,
    },
  },
};

const pageIdentitySequence: Variants = {
  hidden: {},
  visible: {
    transition: {
      delayChildren: stagger(0.04, { startDelay: 0.04 }),
    },
  },
};

export function PortfolioPage({
  title,
  sectionCode,
  greeting,
  introduction,
  children,
  showHeaderRule,
  width,
}: PortfolioPageProps) {
  const [pageIdentitySettled, setPageIdentitySettled] = useState(false);
  const settlePageIdentity = useCallback(() => {
    setPageIdentitySettled(true);
  }, []);

  return (
    <NotebookPageIdentityProvider settled={pageIdentitySettled}>
      <m.div
        initial="hidden"
        animate="visible"
        data-page-identity-state={
          pageIdentitySettled ? "settled" : "registering"
        }
        className="flex w-full flex-col gap-10"
      >
        <div
          className={cn(
            "mx-auto flex w-full flex-col gap-10",
            width === "collection" && "max-w-270",
            width === "reading" && "max-w-180",
          )}
        >
          <NotebookPageHeader
            sectionCode={sectionCode}
            greeting={greeting}
            sequence={pageIdentitySequence}
            title={title}
            introduction={introduction}
            onIdentitySettled={settlePageIdentity}
            showRule={showHeaderRule}
          />
          <m.div
            variants={contentStagger}
            className="flex w-full flex-col gap-10"
          >
            {children}
          </m.div>
        </div>
      </m.div>
    </NotebookPageIdentityProvider>
  );
}
