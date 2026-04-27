import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

type PageShellProps = {
  title: string;
  children: ReactNode;
  isNarrow?: boolean;
};

export function PageShell({
  title,
  children,
  isNarrow = false,
}: PageShellProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-10 items-center",
        isNarrow &&
          "[&>*:not(:first-child)]:max-w-xl [&>*:not(:first-child)]:mx-auto [&>*:not(:first-child)]:w-full",
      )}
    >
      <h1 className="font-heading text-4xl lg:text-6xl font-semibold leading-none tracking-tight text-center">
        {title}
      </h1>
      {children}
    </div>
  );
}
