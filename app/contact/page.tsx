import type { Metadata } from "next";
import { ContactList } from "@/components/contact-list";
import { PageShell } from "@/components/page-shell";
import { portfolioContent } from "@/content/site-content";

const contact = portfolioContent.pages.contact;

export const metadata: Metadata = contact.metadata;

export default function ContactPage() {
  return (
    <PageShell title={contact.title} isNarrow>
      <ContactList links={contact.content.entries} />
    </PageShell>
  );
}
