import { expect, type Locator, type Page, test } from "@playwright/test";

type WorkMotionWindow = Window & {
  __workMotionStarts?: Record<number, number>;
};

type PlayMotionWindow = Window & {
  __playMotionStarts?: Record<number, number>;
};

type PortfolioPageMotionWindow = Window & {
  __portfolioPageMotion?: {
    content: boolean;
    heading: boolean;
  };
};

const portfolioPages = [
  {
    name: "Home",
    path: "/",
    heading: "Constantin Unterkofler",
    representativeContent: "Senior Software Engineer at Jung von Matt",
  },
  {
    name: "About me",
    path: "/about",
    heading: "About me",
    representativeContent: "Italian-German",
  },
  {
    name: "Contact",
    path: "/contact",
    heading: "Contact",
    representativeContent: "mail@constantinunterkofler.com",
  },
  {
    name: "Work",
    path: "/work",
    heading: "Work",
    representativeContent: "Levi's",
    representativeImageDescription:
      "Levi's homepage featuring the A New Shape of Blue denim campaign",
  },
  {
    name: "Play",
    path: "/play",
    heading: "What I currently play",
    representativeContent: "Oh Chérie",
    representativeImageDescription:
      "Oh Chérie cover with three red cherries on a blue background",
  },
] as const;

const primaryWayfinding = ["About me", "Contact", "Work", "Play"];

async function openMobileNavigation(page: Page): Promise<Locator> {
  const menuButton = page.getByRole("button", { name: "Open menu" });
  await expect(menuButton).toBeVisible();
  await menuButton.click();

  const navigation = page.getByRole("navigation", {
    name: "Mobile navigation",
  });
  await expect(navigation).toBeVisible();
  return navigation;
}

async function getPrimaryNavigation(page: Page, isMobile: boolean) {
  return isMobile
    ? openMobileNavigation(page)
    : page.getByRole("navigation", { name: "Primary" });
}

async function expectPrimaryWayfinding(page: Page, isMobile: boolean) {
  const navigation = await getPrimaryNavigation(page, isMobile);

  await expect(navigation).toBeVisible();
  for (const label of primaryWayfinding) {
    await expect(navigation.getByRole("link", { name: label })).toBeVisible();
  }
}

async function visitPortfolioPage(
  page: Page,
  name: string,
  path: string,
  isMobile: boolean,
) {
  await page.goto("/");

  if (path === "/") return;

  const navigation = await getPrimaryNavigation(page, isMobile);
  await navigation.getByRole("link", { name }).click();

  await expect(page).toHaveURL(path);
}

for (const portfolioPage of portfolioPages) {
  test(`${portfolioPage.name} renders with primary wayfinding`, async ({
    page,
  }, testInfo) => {
    const isMobile = Boolean(testInfo.project.use.isMobile);
    const runtimeErrors: string[] = [];
    page.on("pageerror", (error) => runtimeErrors.push(error.message));
    page.on("console", (message) => {
      if (message.type() === "error") runtimeErrors.push(message.text());
    });

    await visitPortfolioPage(
      page,
      portfolioPage.name,
      portfolioPage.path,
      isMobile,
    );

    await expect(
      page.getByRole("heading", {
        level: 1,
        name: portfolioPage.heading,
      }),
    ).toBeVisible();
    await expect(
      page
        .getByText(portfolioPage.representativeContent, { exact: false })
        .first(),
    ).toBeVisible();
    if ("representativeImageDescription" in portfolioPage) {
      await expect(
        page.getByRole("img", {
          name: portfolioPage.representativeImageDescription,
        }),
      ).toBeVisible();
    }
    await expect(page.getByRole("link", { name: "Home" })).toBeVisible();
    await expectPrimaryWayfinding(page, isMobile);

    expect(runtimeErrors, "browser runtime errors").toEqual([]);
  });
}

test("Portfolio Pages preserve their normal heading and content entrance motion", async ({
  page,
}) => {
  await page.addInitScript(() => {
    const motionWindow = window as PortfolioPageMotionWindow;
    const portfolioPageMotion = {
      content: false,
      heading: false,
    };
    motionWindow.__portfolioPageMotion = portfolioPageMotion;

    function observeEntranceStates() {
      for (const element of document.querySelectorAll<HTMLElement>("main *")) {
        const opacity = Number.parseFloat(getComputedStyle(element).opacity);
        if (opacity !== 0) continue;

        if (element.tagName === "H1") {
          portfolioPageMotion.heading = true;
        } else {
          portfolioPageMotion.content = true;
        }
      }

      if (!portfolioPageMotion.heading || !portfolioPageMotion.content) {
        requestAnimationFrame(observeEntranceStates);
      }
    }

    requestAnimationFrame(observeEntranceStates);
  });

  for (const portfolioPage of portfolioPages) {
    await page.goto(portfolioPage.path);

    await expect
      .poll(() =>
        page.evaluate(
          () =>
            (window as PortfolioPageMotionWindow).__portfolioPageMotion
              ?.heading ?? false,
        ),
      )
      .toBe(true);
    await expect(
      page.getByRole("heading", {
        level: 1,
        name: portfolioPage.heading,
      }),
    ).toBeVisible();
    await expect(
      page
        .getByText(portfolioPage.representativeContent, { exact: false })
        .first(),
    ).toBeVisible();
    await expect
      .poll(() =>
        page.evaluate(
          () =>
            (window as PortfolioPageMotionWindow).__portfolioPageMotion
              ?.content ?? false,
        ),
      )
      .toBe(true);
  }
});

test("About Portfolio Page presents the complete ordered CV", async ({
  page,
}) => {
  await page.goto("/about");

  const main = page.getByRole("main");
  const sections = [
    {
      title: "Work",
      entries: [
        {
          organization: "Jung von Matt TECH",
          role: "Senior Software Engineer",
          years: "2026–",
        },
        {
          organization: "Jung von Matt TECH",
          role: "Software Engineer",
          years: "2021–2026",
        },
        {
          organization: "WESOUND",
          role: "Junior Software Engineer",
          years: "2020–21",
        },
        {
          organization: "WESOUND",
          role: "Project & Office Manager",
          years: "2018–20",
        },
      ],
    },
    {
      title: "Education",
      entries: [
        {
          organization: "CODE University of Applied Sciences",
          role: "BSc Software Engineering",
          years: "2021–26",
        },
        {
          organization: "Humboldt University Berlin",
          role: "BA Cultural Studies & Philosophy",
          years: "2017–21",
        },
      ],
    },
  ];

  await expect(main.getByRole("heading", { level: 2 })).toHaveText(
    sections.map((section) => section.title),
  );

  const lists = main.getByRole("list");
  await expect(lists).toHaveCount(sections.length);

  for (const [sectionIndex, section] of sections.entries()) {
    const entries = lists.nth(sectionIndex).getByRole("listitem");
    await expect(entries).toHaveCount(section.entries.length);

    for (const [entryIndex, entry] of section.entries.entries()) {
      const renderedEntry = entries.nth(entryIndex);

      await expect(
        renderedEntry.getByRole("heading", {
          level: 3,
          name: entry.organization,
          exact: true,
        }),
      ).toBeVisible();
      await expect(
        renderedEntry.getByText(entry.role, { exact: true }),
      ).toBeVisible();
      await expect(
        renderedEntry.getByText(entry.years, { exact: true }),
      ).toBeVisible();
    }
  }
});

test("Work Portfolio Page presents its ordered responsive project collection", async ({
  page,
}, testInfo) => {
  const projects = [
    {
      client: "Levi's",
      url: "https://www.levi.com/",
      imageDescription:
        "Levi's homepage featuring the A New Shape of Blue denim campaign",
    },
    {
      client: "Harrods",
      url: "https://www.harrods.com/",
      imageDescription:
        "Harrods homepage featuring two fashion models in a summer garden",
    },
    {
      client: "Fielmann",
      url: "https://www.fielmann.de/",
      imageDescription:
        "Fielmann homepage featuring two people wearing sunglasses",
    },
    {
      client: "TenneT",
      url: "https://www.tennet.eu/",
      imageDescription:
        "TenneT Germany homepage with a wind turbine and solar panels in a green landscape",
    },
    {
      client: "fussball.de",
      url: "https://next.fussball.de/",
      imageDescription:
        "FUSSBALL.DE community homepage with an amateur football news feed and league subscriptions",
    },
  ];

  await page.addInitScript(() => {
    const motionWindow = window as WorkMotionWindow;
    const workMotionStarts: Record<number, number> = {};
    motionWindow.__workMotionStarts = workMotionStarts;

    new MutationObserver((mutations) => {
      const motionFrame = performance.now();

      for (const mutation of mutations) {
        const project = mutation.target;
        if (
          !(project instanceof HTMLElement) ||
          project.tagName !== "ARTICLE"
        ) {
          continue;
        }

        const projectIndex = Array.from(
          document.querySelectorAll("article"),
        ).indexOf(project);
        const opacity = Number.parseFloat(getComputedStyle(project).opacity);

        if (
          projectIndex >= 0 &&
          opacity > 0 &&
          opacity < 1 &&
          workMotionStarts[projectIndex] === undefined
        ) {
          workMotionStarts[projectIndex] = motionFrame;
        }
      }
    }).observe(document, {
      attributes: true,
      attributeFilter: ["style"],
      subtree: true,
    });
  });

  await page.goto("/work");

  const projectsInOrder = page.getByRole("main").locator("article");
  await expect(projectsInOrder).toHaveCount(projects.length);
  await expect(projectsInOrder.getByRole("heading", { level: 2 })).toHaveText(
    projects.map(({ client }) => client),
  );

  for (const [index, project] of projects.entries()) {
    const renderedProject = projectsInOrder.nth(index);
    const clientLink = renderedProject.getByRole("link", {
      name: `Visit ${project.client}`,
    });

    await expect(clientLink).toHaveAttribute("href", project.url);
    await expect(clientLink).toHaveAttribute("target", "_blank");
    await expect(clientLink).toHaveAttribute("rel", /noopener/);
    await expect(
      renderedProject.getByRole("img", { name: project.imageDescription }),
    ).toBeVisible();
  }

  const firstProject = projectsInOrder.first();
  await expect(
    firstProject.getByText("Currently collaborating with the team at SCAYLE", {
      exact: false,
    }),
  ).toHaveCount(2);
  for (const technology of ["Vue 3", "Nuxt 4", "TypeScript", "SCAYLE"]) {
    await expect(
      firstProject.getByText(technology, { exact: true }),
    ).toBeVisible();
  }

  const firstProjectBox = await projectsInOrder.first().boundingBox();
  const secondProjectBox = await projectsInOrder.nth(1).boundingBox();
  expect(firstProjectBox).not.toBeNull();
  expect(secondProjectBox).not.toBeNull();
  if (!firstProjectBox || !secondProjectBox) {
    throw new Error("Expected the first two Work projects to be rendered");
  }

  if (testInfo.project.use.isMobile) {
    expect(secondProjectBox.y).toBeGreaterThan(firstProjectBox.y);
    expect(Math.abs(secondProjectBox.x - firstProjectBox.x)).toBeLessThan(2);
  } else {
    expect(Math.abs(secondProjectBox.y - firstProjectBox.y)).toBeLessThan(2);
    expect(secondProjectBox.x).toBeGreaterThan(firstProjectBox.x);
  }

  const imageLoading = await projectsInOrder
    .getByRole("img")
    .evaluateAll((images) =>
      images.map((image) => ({
        fetchPriority: (image as HTMLImageElement).fetchPriority,
        loading: (image as HTMLImageElement).loading,
      })),
    );
  expect(imageLoading).toEqual([
    { fetchPriority: "high", loading: "auto" },
    { fetchPriority: "high", loading: "auto" },
    { fetchPriority: "high", loading: "auto" },
    { fetchPriority: "high", loading: "auto" },
    { fetchPriority: "auto", loading: "lazy" },
  ]);
  await expect(
    page.locator('head link[rel="preload"][as="image"]'),
  ).toHaveCount(4);

  await expect
    .poll(() =>
      page.evaluate(
        () =>
          Object.keys((window as WorkMotionWindow).__workMotionStarts ?? {})
            .length,
      ),
    )
    .toBe(projects.length);
  const motionStarts = await page.evaluate(
    () => (window as WorkMotionWindow).__workMotionStarts ?? {},
  );
  for (let projectIndex = 1; projectIndex < projects.length; projectIndex++) {
    expect(motionStarts[projectIndex]).toBeGreaterThan(
      motionStarts[projectIndex - 1],
    );
  }

  await firstProject.hover();
  await expect
    .poll(() =>
      firstProject.evaluate((element) => getComputedStyle(element).transform),
    )
    .not.toBe("none");
});

test("Play Portfolio Page presents its ordered responsive track collection", async ({
  page,
}, testInfo) => {
  const tracks = [
    {
      title: "Oh Chérie",
      artist: "DAS MAER",
      album: "Oh Chérie",
      musicalKey: "Am",
      spotifyUrl:
        "https://open.spotify.com/search/Oh%20Ch%C3%A9rie%20DAS%20MAER",
      appleMusicUrl:
        "https://music.apple.com/us/search?term=Oh%20Ch%C3%A9rie%20DAS%20MAER",
      imageDescription:
        "Oh Chérie cover with three red cherries on a blue background",
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
      imageDescription:
        "Cory Wong playing guitar on the Elevator Music for an Elevated Mood cover",
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
      imageDescription:
        "Songs in the Key of Life cover with warm concentric circles around Stevie Wonder",
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
      imageDescription:
        "Undercurrent album cover showing a woman floating underwater",
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
      imageDescription:
        "The Fearless Flyers cover collage of the band playing guitar and drums",
    },
    {
      title: "Stratus",
      artist: "Jeff Beck",
      album: "Live at Ronnie Scott's",
      musicalKey: "Em",
      spotifyUrl: "https://open.spotify.com/search/Stratus%20Jeff%20Beck",
      appleMusicUrl:
        "https://music.apple.com/us/search?term=Stratus%20Jeff%20Beck",
      imageDescription:
        "Jeff Beck playing guitar on the Live at Ronnie Scott's cover",
    },
  ];

  await page.addInitScript(() => {
    const motionWindow = window as PlayMotionWindow;
    const playMotionStarts: Record<number, number> = {};
    motionWindow.__playMotionStarts = playMotionStarts;

    new MutationObserver((mutations) => {
      const motionFrame = performance.now();

      for (const mutation of mutations) {
        const track = mutation.target;
        if (!(track instanceof HTMLElement) || track.tagName !== "ARTICLE") {
          continue;
        }

        const trackIndex = Array.from(
          document.querySelectorAll("main article"),
        ).indexOf(track);
        const opacity = Number.parseFloat(getComputedStyle(track).opacity);

        if (
          trackIndex >= 0 &&
          opacity > 0 &&
          opacity < 1 &&
          playMotionStarts[trackIndex] === undefined
        ) {
          playMotionStarts[trackIndex] = motionFrame;
        }
      }
    }).observe(document, {
      attributes: true,
      attributeFilter: ["style"],
      subtree: true,
    });
  });

  await page.goto("/play");

  const tracksInOrder = page.getByRole("main").locator("article");
  await expect(tracksInOrder).toHaveCount(tracks.length);
  await expect(tracksInOrder.getByRole("heading", { level: 2 })).toHaveText(
    tracks.map(({ title }) => title),
  );

  for (const [index, track] of tracks.entries()) {
    const renderedTrack = tracksInOrder.nth(index);

    await expect(renderedTrack.locator("p")).toHaveText([
      track.artist,
      track.album,
    ]);
    await expect(
      renderedTrack.getByText(track.musicalKey, { exact: true }),
    ).toBeVisible();
    await expect(
      renderedTrack.getByRole("img", { name: track.imageDescription }),
    ).toBeVisible();

    const listeningLinks = [
      { service: "Spotify", url: track.spotifyUrl },
      { service: "Apple Music", url: track.appleMusicUrl },
    ];
    for (const listeningLink of listeningLinks) {
      const link = renderedTrack.getByRole("link", {
        name: `Listen to ${track.title} on ${listeningLink.service}`,
      });
      await expect(link).toHaveAttribute("href", listeningLink.url);
      await expect(link).toHaveAttribute("target", "_blank");
      await expect(link).toHaveAttribute("rel", /noopener/);
    }
  }

  const renderedColumnCount = await tracksInOrder
    .first()
    .locator("..")
    .evaluate(
      (collection) =>
        getComputedStyle(collection).gridTemplateColumns.split(" ").length,
    );
  expect(renderedColumnCount).toBe(testInfo.project.use.isMobile ? 1 : 2);

  const imageLoading = await tracksInOrder
    .locator("img")
    .evaluateAll((images) =>
      images.map((image) => ({
        fetchPriority: (image as HTMLImageElement).fetchPriority,
        loading: (image as HTMLImageElement).loading,
      })),
    );
  expect(imageLoading).toEqual([
    { fetchPriority: "high", loading: "lazy" },
    { fetchPriority: "high", loading: "lazy" },
    { fetchPriority: "auto", loading: "lazy" },
    { fetchPriority: "auto", loading: "lazy" },
    { fetchPriority: "auto", loading: "lazy" },
    { fetchPriority: "auto", loading: "lazy" },
  ]);
  await expect(
    page.locator('head link[rel="preload"][as="image"]'),
  ).toHaveCount(0);

  await expect
    .poll(() =>
      page.evaluate(
        () =>
          Object.keys((window as PlayMotionWindow).__playMotionStarts ?? {})
            .length,
      ),
    )
    .toBe(tracks.length);
  const motionStarts = await page.evaluate(
    () => (window as PlayMotionWindow).__playMotionStarts ?? {},
  );
  for (let trackIndex = 1; trackIndex < tracks.length; trackIndex++) {
    expect(motionStarts[trackIndex]).toBeGreaterThan(
      motionStarts[trackIndex - 1],
    );
  }

  const firstTrack = tracksInOrder.first();
  await firstTrack.hover();
  await expect
    .poll(() =>
      firstTrack.evaluate((element) => getComputedStyle(element).transform),
    )
    .not.toBe("none");
});

test("Escape closes the mobile disclosure and restores focus", async ({
  page,
}, testInfo) => {
  test.skip(!testInfo.project.use.isMobile, "Mobile Site Header behavior");

  await page.goto("/");
  const navigation = await openMobileNavigation(page);
  await navigation.getByRole("link", { name: "About me" }).focus();

  await page.keyboard.press("Escape");

  await expect(navigation).toBeHidden();
  await expect(page.getByRole("button", { name: "Open menu" })).toBeFocused();
});

test("Site Header selects responsive wayfinding and marks parent routes current", async ({
  page,
}, testInfo) => {
  const isMobile = Boolean(testInfo.project.use.isMobile);

  await page.goto("/work/example");

  await expect(page.getByRole("banner")).toHaveCount(1);
  const primaryNavigation = page.getByRole("navigation", { name: "Primary" });
  const disclosureControl = page.getByRole("button", { name: "Open menu" });

  if (isMobile) {
    await expect(primaryNavigation).toBeHidden();
    await expect(disclosureControl).toBeVisible();
  } else {
    await expect(primaryNavigation).toBeVisible();
    await expect(disclosureControl).toBeHidden();
  }

  const navigation = isMobile
    ? await openMobileNavigation(page)
    : primaryNavigation;
  await expect(navigation.getByRole("link", { name: "Work" })).toHaveAttribute(
    "aria-current",
    "page",
  );
});

test("mobile disclosure preserves normal Tab order", async ({
  page,
}, testInfo) => {
  test.skip(!testInfo.project.use.isMobile, "Mobile Site Header behavior");

  await page.goto("/");
  const disclosureControl = page.getByRole("button", { name: /menu/ });
  await disclosureControl.click();
  await expect(disclosureControl).toBeFocused();

  await page.keyboard.press("Shift+Tab");
  await expect(page.getByRole("link", { name: "Home" })).toBeFocused();

  await disclosureControl.focus();
  await page.keyboard.press("Tab");
  await expect(
    page
      .getByRole("navigation", { name: "Mobile navigation" })
      .getByRole("link", { name: "About me" }),
  ).toBeFocused();
});

test("selecting a mobile route closes the disclosure", async ({
  page,
}, testInfo) => {
  test.skip(!testInfo.project.use.isMobile, "Mobile Site Header behavior");

  await page.goto("/");
  const navigation = await openMobileNavigation(page);
  await navigation.getByRole("link", { name: "About me" }).click();

  await expect(page).toHaveURL("/about");
  await expect(navigation).toBeHidden();
  await expect(page.getByRole("button", { name: "Open menu" })).toBeVisible();
});

test("a route change closes the mobile disclosure", async ({
  page,
}, testInfo) => {
  test.skip(!testInfo.project.use.isMobile, "Mobile Site Header behavior");

  await page.goto("/about");
  const navigation = await openMobileNavigation(page);

  await page.evaluate(() => {
    window.history.pushState(null, "", "/contact");
  });

  await expect(page).toHaveURL("/contact");
  await expect(navigation).toBeHidden();

  await page.goBack();

  await expect(page).toHaveURL("/about");
  await expect(navigation).toBeHidden();
});

test("outside interaction closes the mobile disclosure", async ({
  page,
}, testInfo) => {
  test.skip(!testInfo.project.use.isMobile, "Mobile Site Header behavior");

  await page.goto("/");
  const navigation = await openMobileNavigation(page);
  const viewport = page.viewportSize();
  if (!viewport) throw new Error("Expected a mobile viewport");

  await page.mouse.click(viewport.width / 2, viewport.height - 24);

  await expect(navigation).toBeHidden();
});

test("page scrolling remains available with the mobile disclosure open", async ({
  page,
}, testInfo) => {
  test.skip(!testInfo.project.use.isMobile, "Mobile Site Header behavior");

  await page.goto("/work");
  const navigation = await openMobileNavigation(page);

  await page.mouse.wheel(0, 600);

  await expect
    .poll(() => page.evaluate(() => window.scrollY))
    .toBeGreaterThan(0);
  await expect(navigation).toBeVisible();
});

test("appearance control is available in each responsive rendering", async ({
  page,
}, testInfo) => {
  const isMobile = Boolean(testInfo.project.use.isMobile);

  await page.goto("/");
  const navigation = isMobile ? await openMobileNavigation(page) : page;
  const appearanceControl = navigation.getByRole("button", {
    name: "Toggle theme",
  });
  await expect(appearanceControl).toBeVisible();
  const wasDark = await page
    .locator("html")
    .evaluate((element) => element.classList.contains("dark"));

  await appearanceControl.click();

  await expect
    .poll(() =>
      page
        .locator("html")
        .evaluate((element) => element.classList.contains("dark")),
    )
    .toBe(!wasDark);
});

test("mobile Site Header gains its glass treatment after scrolling", async ({
  page,
}, testInfo) => {
  test.skip(!testInfo.project.use.isMobile, "Mobile Site Header behavior");

  await page.goto("/work");
  const siteHeader = page.getByRole("banner");
  const initialBackground = await siteHeader.evaluate(
    (element) => getComputedStyle(element).backgroundColor,
  );

  await page.mouse.wheel(0, 300);

  await expect
    .poll(() =>
      siteHeader.evaluate(
        (element) => getComputedStyle(element).backgroundColor,
      ),
    )
    .not.toBe(initialBackground);
  await expect(siteHeader).toHaveCSS("backdrop-filter", /blur/);
});
