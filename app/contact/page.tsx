import type { Metadata } from "next";
import { PageShell } from "@/components/page-shell";
import { contactLinks, pageCopy } from "@/content/site-content";

export const metadata: Metadata = {
  title: "Contact",
  description: pageCopy.contact.metaDescription,
};

export default function ContactPage() {
  return (
    <PageShell title={pageCopy.contact.title} isNarrow>
      <div className="border-t border-rule">
        {contactLinks.map((link) => (
          <a
            key={link.label}
            href={link.href}
            target={link.href.startsWith("mailto:") ? undefined : "_blank"}
            rel={
              link.href.startsWith("mailto:")
                ? undefined
                : "noreferrer noopener"
            }
            className="flex flex-col gap-1 border-b border-rule py-4 lg:flex-row lg:items-center lg:gap-4"
          >
            <span className="text-sm font-semibold lg:w-40">{link.label}</span>
            <span className="text-sm text-ink-muted">{link.value}</span>
          </a>
        ))}
      </div>
    </PageShell>
  );
}
