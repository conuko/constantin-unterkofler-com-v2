import type { ReactNode } from "react";
import { NotebookPageHeader } from "@/components/notebook-primitives";
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

/**
 * The shell every Portfolio Page composes.
 *
 * Record groups used to wait on a `pageIdentitySettled` flag that only flipped
 * once the title's Motion animation reported back — a JavaScript callback
 * chain standing between the reader and the page. The sequence is now fixed
 * offsets in CSS (`notebookTiming`), so the shell holds no state and renders
 * on the server.
 */
export function PortfolioPage({
  title,
  sectionCode,
  greeting,
  introduction,
  children,
  showHeaderRule,
  width,
}: PortfolioPageProps) {
  return (
    <div className="flex w-full flex-col gap-10">
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
          title={title}
          introduction={introduction}
          showRule={showHeaderRule}
        />
        <div className="flex w-full flex-col gap-10">{children}</div>
      </div>
    </div>
  );
}
