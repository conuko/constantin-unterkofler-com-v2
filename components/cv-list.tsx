import type { CvEntry } from "@/content/site-content";

type CvListProps = {
  entries: CvEntry[];
};

export function CvList({ entries }: CvListProps) {
  return (
    <ol>
      {entries.map((entry) => (
        <li
          key={`${entry.organization}-${entry.years}`}
          className="flex flex-col gap-1 border-b border-rule py-4 lg:flex-row lg:items-start lg:justify-between lg:gap-4"
        >
          <div className="flex flex-col gap-0.5">
            <h2 className="text-sm font-semibold">{entry.organization}</h2>
            <p className="text-sm text-ink-muted">{entry.role}</p>
          </div>
          <div className="lg:text-right">
            <p className="text-sm text-ink-muted">{entry.years}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}
