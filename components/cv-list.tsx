import type { CvEntry } from "@/content/site-content";

type CvListProps = {
  entries: CvEntry[];
};

export function CvList({ entries }: CvListProps) {
  return (
    <ol className="border-t border-rule">
      {entries.map((entry) => (
        <li
          key={`${entry.organization}-${entry.years}`}
          className="flex flex-col gap-1 border-b border-rule py-4 lg:flex-row lg:items-start lg:justify-between lg:gap-4"
        >
          <h2 className="text-lg font-semibold">{entry.organization}</h2>
          <div className="flex flex-col gap-0.5 lg:text-right">
            <p className="text-ink-muted">{entry.role}</p>
            <p className="text-ink-muted">{entry.years}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}
