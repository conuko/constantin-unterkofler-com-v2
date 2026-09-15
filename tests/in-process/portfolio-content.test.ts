import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, test } from "vitest";
import { portfolioContent } from "@/content/site-content";
import { expectedRecentReading } from "@/tests/fixtures/recent-reading";

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
        route: "/read",
        title: "What I recently read",
        metadataTitle: "Read",
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
      { pageName: "read", label: "Read", order: 4 },
      { pageName: "play", label: "Play", order: 5 },
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
    // The stamp is dated per release, so this holds its shape, not its value.
    expect(portfolioContent.closingRecord.buildStamp).toMatch(
      /^\d{4}\.\d{2}\.\d{2}$/,
    );
    expect(portfolioContent.identity.name).toBe("Constantin Unterkofler");
  });

  test("keeps unpublished Portfolio Content out of public wayfinding", () => {
    expect(portfolioContent.pages.read.publicationStatus).toBe("unpublished");
    expect(portfolioContent.pages.play.publicationStatus).toBe("unpublished");
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
      { pageName: "read", sectionCode: "R", width: "collection" },
      { pageName: "play", sectionCode: "P", width: "collection" },
    ]);
  });

  test("states the home Specification Block fields in reading order", () => {
    expect(portfolioContent.pages.home.content.specification).toEqual([
      { label: "Role", value: "Software Engineer, Jung von Matt TECH" },
      { label: "Based", value: "Berlin · 52.5200° N, 13.4050° E" },
      { label: "Focus", value: "Commerce platforms, modern web, AI" },
      { label: "Stack", value: "TypeScript · React / Next · Vue / Nuxt" },
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
    const { home, about, contact, play } = portfolioContent.pages;

    expect(home.content.introduction).toEqual({
      role: "Software Engineer",
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
    expect(play.content.entries.map((entry) => entry.title)).toEqual([
      "Oh Chérie",
      "Airplane Mode",
      "Isn't She Lovely",
      "Darn That Dream",
      "Ace of Aces",
      "Stratus",
    ]);
  });

  test("keeps exactly six Recent Reading records newest first with valid Personal Ratings and local covers", () => {
    const entries = portfolioContent.pages.read.content.entries;

    expect(
      entries.map((entry) => ({
        title: entry.title,
        author: entry.author,
        completedAt: entry.completedAt,
        personalRating: entry.personalRating,
        imageDescription: entry.cover.alt,
      })),
    ).toEqual(expectedRecentReading);
    expect(entries).toHaveLength(6);
    expect(
      entries.every(
        (entry) =>
          Number.isInteger(entry.personalRating) &&
          entry.personalRating >= 0 &&
          entry.personalRating <= 5,
      ),
    ).toBe(true);
    expect(entries.map((entry) => entry.completedAt)).toEqual(
      entries
        .map((entry) => entry.completedAt)
        .toSorted((left, right) => right.localeCompare(left)),
    );
    expect(new Set(entries.map((entry) => entry.cover.alt)).size).toBe(
      entries.length,
    );
    expect(
      entries.every(
        (entry) =>
          Boolean(entry.cover.src) && entry.cover.alt.trim().length > 20,
      ),
    ).toBe(true);
  });

  test("keeps exact musical metadata and listening actions with every Play record", () => {
    expect(
      portfolioContent.pages.play.content.entries.map((entry) => ({
        title: entry.title,
        artist: entry.artist,
        album: entry.album,
        musicalKey: entry.musicalKey,
        spotifyUrl: entry.spotifyUrl,
        appleMusicUrl: entry.appleMusicUrl,
      })),
    ).toEqual([
      {
        title: "Oh Chérie",
        artist: "DAS MAER",
        album: "Oh Chérie",
        musicalKey: "Am",
        spotifyUrl:
          "https://open.spotify.com/search/Oh%20Ch%C3%A9rie%20DAS%20MAER",
        appleMusicUrl:
          "https://music.apple.com/us/search?term=Oh%20Ch%C3%A9rie%20DAS%20MAER",
      },
      {
        title: "Airplane Mode",
        artist: "Cory Wong",
        album: "Elevator Music for an Elevated Mood",
        musicalKey: "Db",
        spotifyUrl:
          "https://open.spotify.com/search/Airplane%20Mode%20Cory%20Wong",
        appleMusicUrl:
          "https://music.apple.com/us/search?term=Airplane%20Mode%20Cory%20Wong",
      },
      {
        title: "Isn't She Lovely",
        artist: "Stevie Wonder",
        album: "Songs in the Key of Life",
        musicalKey: "E",
        spotifyUrl:
          "https://open.spotify.com/search/Isn't%20She%20Lovely%20Stevie%20Wonder",
        appleMusicUrl:
          "https://music.apple.com/us/search?term=Isn't%20She%20Lovely%20Stevie%20Wonder",
      },
      {
        title: "Darn That Dream",
        artist: "Bill Evans / Jim Hall",
        album: "Undercurrent",
        musicalKey: "G",
        spotifyUrl:
          "https://open.spotify.com/search/Darn%20That%20Dream%20Bill%20Evans%20Jim%20Hall",
        appleMusicUrl:
          "https://music.apple.com/us/search?term=Darn%20That%20Dream%20Bill%20Evans%20Jim%20Hall",
      },
      {
        title: "Ace of Aces",
        artist: "The Fearless Flyers",
        album: "The Fearless Flyers",
        musicalKey: "E",
        spotifyUrl:
          "https://open.spotify.com/search/Ace%20of%20Aces%20Fearless%20Flyers",
        appleMusicUrl:
          "https://music.apple.com/us/search?term=Ace%20of%20Aces%20Fearless%20Flyers",
      },
      {
        title: "Stratus",
        artist: "Jeff Beck",
        album: "Live at Ronnie Scott's",
        musicalKey: "Em",
        spotifyUrl: "https://open.spotify.com/search/Stratus%20Jeff%20Beck",
        appleMusicUrl:
          "https://music.apple.com/us/search?term=Stratus%20Jeff%20Beck",
      },
    ]);
  });

  test("keeps Work records in the specified order", () => {
    expect(
      portfolioContent.pages.work.content.entries.map((entry) => entry.client),
    ).toEqual([
      "Levi's",
      "Harrods",
      "Fielmann",
      "SCAYLE / ABOUT YOU",
      "FIFA",
      "TenneT",
      "fussball.de",
    ]);
  });

  test("keeps factual primary metadata with every Work record", () => {
    expect(
      portfolioContent.pages.work.content.entries.map(
        (entry) => entry.primaryMetadata,
      ),
    ).toEqual([
      "Commerce migration",
      "Commerce delivery",
      "Commerce platform",
      "Commerce platform",
      "Web platform",
      "Web platform",
      "Platform migration",
    ]);
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
        client: "Levi's",
        url: "https://www.scayle.com/customers/levi-strauss/",
        descriptionReview: undefined,
      },
      {
        client: "Harrods",
        url: "https://www.scayle.com/customers/harrods/",
        descriptionReview: undefined,
      },
      {
        client: "Fielmann",
        url: "https://www.scayle.com/case-studies/fielmann/",
        descriptionReview: undefined,
      },
      {
        client: "SCAYLE / ABOUT YOU",
        url: "https://www.scayle.com/",
        descriptionReview: undefined,
      },
      {
        client: "FIFA",
        url: "https://publications.fifa.com/en/talent-development/",
        descriptionReview: undefined,
      },
      {
        client: "TenneT",
        url: "https://www.tennet.eu/",
        descriptionReview: undefined,
      },
      {
        client: "fussball.de",
        url: "https://next.fussball.de/",
        descriptionReview: undefined,
      },
    ]);
  });

  test("references official local Work marks with unique meaningful descriptions", () => {
    const marks = portfolioContent.pages.work.content.entries.flatMap(
      (entry) => entry.marks,
    );

    expect(marks.map((mark) => ({ src: mark.src, alt: mark.alt }))).toEqual([
      { src: "/marks/levi.svg", alt: "Levi's red Batwing mark" },
      { src: "/marks/harrods.svg", alt: "Harrods green wordmark" },
      { src: "/marks/fielmann.svg", alt: "Fielmann black wordmark" },
      {
        src: "/marks/scayle.svg",
        alt: "SCAYLE wordmark with green directional accents",
      },
      {
        src: "/marks/about-you.svg",
        alt: "ABOUT YOU black-and-white wordmark",
      },
      { src: "/marks/fifa.svg", alt: "FIFA blue wordmark" },
      {
        src: "/marks/tennet.svg",
        alt: "TenneT blue-and-green wordmark",
      },
      {
        src: "/marks/fussball-de.svg",
        alt: "fussball.de green field mark",
      },
    ]);
    expect(new Set(marks.map((mark) => mark.alt)).size).toBe(marks.length);
    expect(
      marks.every((mark) =>
        existsSync(join(process.cwd(), "public", mark.src)),
      ),
    ).toBe(true);
  });

  test("keeps required image sources and descriptions with Portfolio Content", () => {
    const images = [
      ...portfolioContent.pages.work.content.entries.flatMap(
        (entry) => entry.marks,
      ),
      ...portfolioContent.pages.play.content.entries.map(
        (entry) => entry.cover,
      ),
    ];

    expect(images).toHaveLength(14);
    expect(
      images.every(
        (image) => Boolean(image.src) && image.alt.trim().length > 0,
      ),
    ).toBe(true);
    expect(new Set(images.map((image) => image.alt)).size).toBe(images.length);
  });
});
