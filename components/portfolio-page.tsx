import type { ReactNode } from "react";
import { NotebookPageHeader } from "@/components/notebook-primitives";
import { cn } from "@/lib/utils/cn";

type PortfolioPageProps = {
  title: string;
  /** Absent on the home Portfolio Page, whose title begins with a greeting. */
  sectionCode?: string;
  /** Right-aligned sheet stamp, e.g. "Sheet W · 08 records". */
  sheetMeta?: string;
  greeting?: ReactNode;
  introduction?: ReactNode;
  children?: ReactNode;
  showHeaderRule?: boolean;
  width: "collection" | "reading";
};

/**
 * The shell every Portfolio Page composes.
 *
 * The sequence is fixed offsets in CSS (`notebookTiming`), so the shell holds
 * no state and renders on the server.
 *
 * The sheet sets its own width and keeps out of the corner lanes, so from `lg`
 * it is capped at `min(sheet width, 100% − 2 × corner lane)` of the viewport
 * (`--container-*` in `app/theme.css`).
 */
export function PortfolioPage({
  title,
  sectionCode,
  sheetMeta,
  greeting,
  introduction,
  children,
  showHeaderRule,
  width,
}: PortfolioPageProps) {
  return (
    <div className="flex w-full flex-col gap-11">
      <div
        className={cn(
          "mx-auto flex w-full flex-col gap-11",
          width === "collection" && "max-w-collection",
          width === "reading" && "max-w-reading",
        )}
      >
        <NotebookPageHeader
          sectionCode={sectionCode}
          sheetMeta={sheetMeta}
          greeting={greeting}
          title={title}
          introduction={introduction}
          showRule={showHeaderRule}
        />
        <div className="flex w-full flex-col gap-11">{children}</div>
      </div>
    </div>
  );
}
