import type { Metadata } from "next";
import { ContactList } from "@/components/contact-list";
import { PageShell } from "@/components/page-shell";
import { contactLinks, pageCopy } from "@/content/site-content";

export const metadata: Metadata = {
  title: "Contact",
  description: pageCopy.contact.metaDescription,
};

export default function ContactPage() {
  return (
    <PageShell title={pageCopy.contact.title} isNarrow>
      <ContactList links={contactLinks} />
    </PageShell>
  );
}
