import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, test } from "vitest";
import { portfolioContent } from "@/content/site-content";
import packageJson from "../../package.json";

describe("Portfolio Content", () => {
  test("defines every Portfolio Page with a unique route, title, and metadata", () => {
    const pages = Object.values(portfolioContent.pages);

    expect(
      pages.map((page) => ({
        route: page.route,
        title: page.title,
        metadataTitle: page.metadata.title,
        hasMetadataDescription: page.metadata.description.trim().length > 0,
      })),
    ).toEqual([
      {
        route: "/",
        title: "Constantin",
        metadataTitle: "Home",
        hasMetadataDescription: true,
      },
      {
        route: "/about",
        title: "About me",
        metadataTitle: "About me",
        hasMetadataDescription: true,
      },
      {
        route: "/contact",
        title: "Contact",
        metadataTitle: "Contact",
        hasMetadataDescription: true,
      },
      {
        route: "/work",
        title: "Work",
        metadataTitle: "Work",
        hasMetadataDescription: true,
      },
    ]);

    expect(new Set(pages.map((page) => page.route)).size).toBe(pages.length);
  });

  test("projects primary wayfinding from explicitly ordered Portfolio Pages", () => {
    const optedInPages = Object.entries(portfolioContent.pages)
      .flatMap(([pageName, page]) =>
        "primaryWayfinding" in page
          ? [{ pageName, ...page.primaryWayfinding }]
          : [],
      )
      .toSorted((left, right) => left.order - right.order);

    expect(optedInPages).toEqual([
      { pageName: "about", label: "About me", order: 1 },
      { pageName: "contact", label: "Contact", order: 2 },
      { pageName: "work", label: "Work", order: 3 },
    ]);
    expect(portfolioContent.primaryWayfinding).toEqual([
      { href: "/about", label: "About me" },
      { href: "/contact", label: "Contact" },
      { href: "/work", label: "Work" },
    ]);
  });

  test("owns the footer closing record copyright and build stamp", () => {
    expect(Object.keys(portfolioContent.closingRecord)).toEqual([
      "copyrightYear",
      "buildStamp",
    ]);
    expect(portfolioContent.closingRecord.copyrightYear).toBe(2026);
    expect(portfolioContent.closingRecord.buildStamp).toBe(packageJson.version);
    expect(portfolioContent.identity.name).toBe("Constantin Unterkofler");
  });

  test("owns the Engineering Notebook page header records", () => {
    expect(
      Object.entries(portfolioContent.pages).map(([pageName, page]) => ({
        pageName,
        sectionCode: page.sectionCode,
        width: page.width,
      })),
    ).toEqual([
      { pageName: "home", sectionCode: "", width: "reading" },
      { pageName: "about", sectionCode: "A", width: "reading" },
      { pageName: "contact", sectionCode: "C", width: "reading" },
      { pageName: "work", sectionCode: "W", width: "collection" },
    ]);
  });

  test("states the home Specification Block fields in reading order", () => {
    expect(portfolioContent.pages.home.content.specification).toEqual([
      { label: "Role", value: "Senior Software Engineer, Jung von Matt TECH" },
      { label: "Based", value: "Berlin · 52.5200° N, 13.4050° E" },
      {
        label: "Focus",
        value:
          "Building products end to end, from the user problem to production, with a designer's eye for detail: interfaces that are fast, accessible and coherent.",
      },
      {
        label: "Stack",
        value:
          "Frontend and Backend: TypeScript · React · Next.js · Vue · Nuxt · Node.js · NestJS · Tailwind CSS · React Native · Expo · Flutter · Python · DBs: PostgreSQL · Prisma · Redis · Infrastructure: Docker · Turborepo · AWS Services · GitHub Actions · Datadog",
      },
    ]);
  });

  test("groups the CV into stable, ordered sections", () => {
    const sections = portfolioContent.pages.about.content.cvSections;

    expect(
      sections.map((section) => ({
        title: section.title,
        entries: section.entries.map(
          (entry) => `${entry.organization}: ${entry.role}`,
        ),
      })),
    ).toEqual([
      {
        title: "Work",
        entries: [
          "Jung von Matt TECH: Senior Software Engineer",
          "Jung von Matt TECH: Software Engineer",
          "WESOUND: Junior Software Engineer",
          "WESOUND: Project & Office Manager",
        ],
      },
      {
        title: "Education",
        entries: [
          "CODE University of Applied Sciences: BSc Software Engineering",
          "Humboldt University Berlin: BA Cultural Studies & Philosophy",
        ],
      },
    ]);
  });

  test("keeps introductions and page entries in their declared order", () => {
    const { home, about, contact } = portfolioContent.pages;

    expect(home.content.introduction).toEqual({
      role: "Senior Software Engineer",
      organization: {
        name: "Jung von Matt",
        url: "https://www.jvm.com/",
      },
    });
    expect(about.content.introduction).toHaveLength(3);
    for (const paragraph of about.content.introduction) {
      expect(paragraph.trim().length).toBeGreaterThan(0);
    }
    expect(contact.content.entries.map((entry) => entry.label)).toEqual([
      "Email",
      "GitHub",
      "LinkedIn",
    ]);
  });

  test("keeps Work records in the specified order", () => {
    expect(
      portfolioContent.pages.work.content.entries.map((entry) => entry.client),
    ).toEqual([
      "Fielmann",
      "Levi's",
      "SB Migrate",
      "TenneT",
      "Harrods",
      "SCAYLE / ABOUT YOU",
      "Movielingo",
      "FIFA",
    ]);
  });

  test("keeps factual primary metadata with every Work record", () => {
    expect(
      portfolioContent.pages.work.content.entries.map(
        (entry) => entry.primaryMetadata,
      ),
    ).toEqual([
      "Commerce platform",
      "Commerce migration",
      "Open-source CLI",
      "Web platform",
      "Commerce delivery",
      "Commerce platform",
      "Language-learning app",
      "Web platform",
    ]);
  });

  test("derives the console projection from canonical Home and Work content", () => {
    const homeSpecification = portfolioContent.pages.home.content.specification;

    expect(portfolioContent.console.identity).toEqual({
      name: portfolioContent.identity.name,
      role: homeSpecification.find((field) => field.label === "Role")?.value,
      location: homeSpecification.find((field) => field.label === "Based")
        ?.value,
    });
    expect(portfolioContent.console.records).toEqual(
      portfolioContent.pages.work.content.entries.map((entry, index) => ({
        index: `W–${String(index + 1).padStart(2, "0")}`,
        label: entry.client,
        meta: entry.primaryMetadata.toLowerCase(),
      })),
    );
  });

  test("keeps Work destinations optional and marks draft descriptions for owner review", () => {
    expect(
      portfolioContent.pages.work.content.entries.map((entry) => ({
        client: entry.client,
        url: "url" in entry ? entry.url : undefined,
        descriptionReview:
          "descriptionReview" in entry ? entry.descriptionReview : undefined,
      })),
    ).toEqual([
      {
        client: "Fielmann",
        url: "https://www.fielmann.de/",
        descriptionReview: undefined,
      },
      {
        client: "Levi's",
        url: "https://www.scayle.com/customers/levi-strauss/",
        descriptionReview: undefined,
      },
      {
        client: "SB Migrate",
        url: "https://github.com/jungvonmatt/storyblok-migrations",
        descriptionReview: undefined,
      },
      {
        client: "TenneT",
        url: "https://www.tennet.eu/",
        descriptionReview: undefined,
      },
      {
        client: "Harrods",
        url: "https://www.scayle.com/customers/harrods/",
        descriptionReview: undefined,
      },
      {
        client: "SCAYLE / ABOUT YOU",
        url: "https://www.scayle.com/",
        descriptionReview: undefined,
      },
      {
        client: "Movielingo",
        url: "https://github.com/Movielingo",
        descriptionReview: undefined,
      },
      {
        client: "FIFA",
        url: "https://publications.fifa.com/en/talent-development/",
        descriptionReview: undefined,
      },
    ]);
  });

  test("references local Work marks with unique meaningful descriptions", () => {
    const marks = portfolioContent.pages.work.content.entries.flatMap(
      (entry) => entry.marks,
    );

    expect(marks.map((mark) => ({ src: mark.src, alt: mark.alt }))).toEqual([
      { src: "/marks/fielmann.svg", alt: "Fielmann black wordmark" },
      { src: "/marks/levi.svg", alt: "Levi's red Batwing mark" },
      {
        src: "/marks/sb-migrate.svg",
        alt: "SB Migrate terminal prompt mark",
      },
      {
        src: "/marks/tennet.svg",
        alt: "TenneT blue-and-green wordmark",
      },
      { src: "/marks/harrods.svg", alt: "Harrods green wordmark" },
      {
        src: "/marks/scayle.svg",
        alt: "SCAYLE wordmark with green directional accents",
      },
      {
        src: "/marks/about-you.svg",
        alt: "ABOUT YOU black-and-white wordmark",
      },
      {
        src: "/marks/sb-migrate.svg",
        alt: "Terminal prompt icon for Movielingo",
      },
      { src: "/marks/fifa.svg", alt: "FIFA blue wordmark" },
    ]);
    expect(new Set(marks.map((mark) => mark.alt)).size).toBe(marks.length);
    expect(
      marks.every((mark) =>
        existsSync(join(process.cwd(), "public", mark.src)),
      ),
    ).toBe(true);
    expect(marks.every((mark) => mark.src.endsWith(`/${mark.filename}`))).toBe(
      true,
    );
  });
});
