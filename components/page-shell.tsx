import type { ReactNode } from "react";

type PageShellProps = {
  eyebrow: string;
  title: string;
  intro: string;
  children: ReactNode;
};

export function PageShell({ eyebrow, title, intro, children }: PageShellProps) {
  return (
    <section className="flex flex-col gap-10">
      <header className="flex flex-col gap-3.5 max-w-3xl">
        <p className="label text-ink-muted">{eyebrow}</p>
        <h1 className="font-heading text-5xl lg:text-8xl font-semibold leading-none tracking-tight">
          {title}
        </h1>
        <p className="text-base text-ink-muted max-w-2xl">{intro}</p>
      </header>
      <div className="flex flex-col gap-10">{children}</div>
    </section>
  );
}
