import { describe, expect, test } from "vitest";
import { portfolioContent } from "@/content/site-content";

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
        title: "Constantin Unterkofler",
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
      {
        route: "/play",
        title: "What I currently play",
        metadataTitle: "Play",
        hasMetadataDescription: true,
      },
    ]);

    expect(new Set(pages.map((page) => page.route)).size).toBe(pages.length);
  });

  test("projects primary wayfinding from explicitly ordered Portfolio Pages", () => {
    const optedInPages = Object.entries(portfolioContent.pages).flatMap(
      ([pageName, page]) =>
        "primaryWayfinding" in page
          ? [{ pageName, ...page.primaryWayfinding }]
          : [],
    );

    expect(optedInPages).toEqual([
      { pageName: "about", label: "About me", order: 1 },
      { pageName: "contact", label: "Contact", order: 2 },
      { pageName: "work", label: "Work", order: 3 },
      { pageName: "play", label: "Play", order: 4 },
    ]);
    expect(portfolioContent.primaryWayfinding).toEqual([
      { href: "/about", label: "About me" },
      { href: "/contact", label: "Contact" },
      { href: "/work", label: "Work" },
      { href: "/play", label: "Play" },
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
    const { home, about, contact, work, play } = portfolioContent.pages;

    expect(home.content.introduction).toEqual({
      role: "Senior Software Engineer",
      organization: {
        name: "Jung von Matt",
        url: "https://www.jvm.com/",
      },
    });
    expect(about.content.introduction.trim().length).toBeGreaterThan(0);
    expect(contact.content.entries.map((entry) => entry.label)).toEqual([
      "Email",
      "GitHub",
      "LinkedIn",
    ]);
    expect(work.content.entries.map((entry) => entry.client)).toEqual([
      "Levi's",
      "Harrods",
      "Fielmann",
      "TenneT",
      "fussball.de",
    ]);
    expect(play.content.entries.map((entry) => entry.title)).toEqual([
      "Oh Chérie",
      "Airplane Mode",
      "Isn't She Lovely",
      "Darn That Dream",
      "Ace of Aces",
      "Stratus",
    ]);
  });

  test("keeps required image sources and descriptions with Portfolio Content", () => {
    const images = [
      ...portfolioContent.pages.work.content.entries.map(
        (entry) => entry.image,
      ),
      ...portfolioContent.pages.play.content.entries.map(
        (entry) => entry.cover,
      ),
    ];

    expect(images).toHaveLength(11);
    expect(
      images.every(
        (image) => Boolean(image.src) && image.alt.trim().length > 0,
      ),
    ).toBe(true);
    expect(new Set(images.map((image) => image.alt)).size).toBe(images.length);
  });
});
