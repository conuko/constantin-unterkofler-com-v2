import type { Metadata } from "next";
import { pageCopy } from "@/content/site-content";

export const metadata: Metadata = {
  title: "Home",
  description: pageCopy.home.metaDescription,
};

export default function Home() {
  return (
    <section className="flex flex-col items-center justify-center text-center gap-10">
      <div className="flex flex-col gap-8 max-w-3xl">
        <h1 className="font-heading text-4xl lg:text-6xl font-semibold leading-none tracking-tight">
          {pageCopy.home.title}
        </h1>
        <p className="text-base text-ink-muted max-w-2xl">
          {pageCopy.home.intro}
        </p>
      </div>
    </section>
  );
}
