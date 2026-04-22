import type { Metadata } from "next";
import Link from "next/link";
import { homeRoutes, pageCopy } from "@/content/site-content";

export const metadata: Metadata = {
  title: "Home",
  description: pageCopy.home.metaDescription,
};

export default function Home() {
  return (
    <section className="flex flex-col gap-10">
      <div className="flex flex-col gap-3.5 max-w-3xl">
        <p className="label text-ink-muted">{pageCopy.home.eyebrow}</p>
        <h1 className="font-heading text-5xl lg:text-8xl font-semibold leading-none tracking-tight">
          {pageCopy.home.title}
        </h1>
        <p className="text-base text-ink-muted max-w-2xl">
          {pageCopy.home.intro}
        </p>
      </div>

      <div className="border-t border-rule">
        {homeRoutes.map((route) => (
          <article
            key={route.href}
            className="flex items-end justify-between gap-5 border-b border-rule py-5"
          >
            <div>
              <Link
                href={route.href}
                className="inline-block font-heading text-3xl lg:text-5xl leading-none font-semibold"
              >
                {route.label}
              </Link>
              <p className="mt-2 max-w-lg text-ink-muted">
                {route.description}
              </p>
            </div>
            <span
              className="text-xl text-ink-muted max-sm:hidden"
              aria-hidden="true"
            >
              /
            </span>
          </article>
        ))}
      </div>
    </section>
  );
}
