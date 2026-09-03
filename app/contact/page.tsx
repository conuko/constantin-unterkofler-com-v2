import type { Metadata } from "next";
import { ContactList } from "@/components/contact-list";
import { PortfolioPage } from "@/components/portfolio-page";
import { portfolioContent } from "@/content/site-content";

const contact = portfolioContent.pages.contact;

export const metadata: Metadata = contact.metadata;

export default function ContactPage() {
  return (
    <PortfolioPage
      title={contact.title}
      sectionCode={contact.sectionCode}
      width={contact.width}
      introduction={<p>{contact.content.introduction}</p>}
    >
      <ContactList links={contact.content.entries} />
    </PortfolioPage>
  );
}
