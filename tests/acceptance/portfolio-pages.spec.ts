import { expect, type Locator, type Page, test } from "@playwright/test";

type WorkMotionWindow = Window & {
  __workMotionStarts?: Record<number, number>;
  __workMotionAfterSettle?: number;
  __workPartMotionStarts?: Record<string, number>;
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

type CvMotionWindow = Window & {
  __cvMotionStarts?: Record<string, number>;
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
    representativeImageDescription: "Levi's red Batwing mark",
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

async function sampleMobileDisclosureControlOpacity(
  page: Page,
): Promise<number[]> {
  return page.getByRole("button", { name: "Open menu" }).evaluate((button) => {
    if (!(button instanceof HTMLButtonElement)) {
      throw new Error("Expected the mobile disclosure control");
    }

    const middleLine = [
      ...button.querySelectorAll<HTMLElement>("[data-disclosure-middle-line]"),
    ].find((line) => line.getClientRects().length > 0);
    if (!middleLine) throw new Error("Expected the middle disclosure line");
    const disclosureLine = middleLine;

    return new Promise<number[]>((resolve) => {
      const samples: number[] = [];

      function sampleFrame() {
        samples.push(
          Number.parseFloat(getComputedStyle(disclosureLine).opacity),
        );
        if (samples.length === 120) {
          resolve(samples);
          return;
        }

        requestAnimationFrame(sampleFrame);
      }

      button.click();
      requestAnimationFrame(sampleFrame);
    });
  });
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

test("normal motion preserves the mobile disclosure control transition", async ({
  page,
}, testInfo) => {
  test.skip(!testInfo.project.use.isMobile, "Mobile Site Header behavior");

  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/");

  const opacitySamples = await sampleMobileDisclosureControlOpacity(page);

  expect(opacitySamples.some((opacity) => opacity > 0 && opacity < 1)).toBe(
    true,
  );
});

test("normal Site Header interaction motion covers tap, exit, and active underline", async ({
  page,
}, testInfo) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });

  if (testInfo.project.use.isMobile) {
    await page.goto("/");
    const disclosureControl = page.getByRole("button", { name: "Open menu" });

    await disclosureControl.click();

    const navigation = page.getByRole("navigation", {
      name: "Mobile navigation",
    });
    await expect(navigation).toBeVisible();
    await page.getByRole("button", { name: "Close menu" }).click();
    await expect(navigation).toBeAttached();
    await expect(navigation).toBeHidden();
    return;
  }

  await page.goto("/about");
  const appearanceControl = page.getByRole("button", { name: "Toggle theme" });
  await appearanceControl.hover();
  await page.waitForTimeout(350);
  const hoveredTransform = await appearanceControl.evaluate(
    (button) => getComputedStyle(button).transform,
  );
  await page.mouse.down();
  await expect
    .poll(() =>
      appearanceControl.evaluate(
        (button) => getComputedStyle(button).transform,
      ),
    )
    .not.toBe(hoveredTransform);
  await page.mouse.up();

  await page.evaluate(() => {
    let observedMovingUnderline = false;

    function observeUnderline() {
      const underline = document.querySelector<HTMLElement>(
        'nav[aria-label="Primary"] a[data-active="true"] span',
      );
      if (underline && getComputedStyle(underline).transform !== "none") {
        observedMovingUnderline = true;
      }

      (
        window as Window & { __observedMovingUnderline?: boolean }
      ).__observedMovingUnderline = observedMovingUnderline;
      if (!observedMovingUnderline) requestAnimationFrame(observeUnderline);
    }

    requestAnimationFrame(observeUnderline);
  });

  await page
    .getByRole("navigation", { name: "Primary" })
    .getByRole("link", { name: "Contact" })
    .click();
  await expect
    .poll(
      () =>
        page.evaluate(
          () =>
            (window as Window & { __observedMovingUnderline?: boolean })
              .__observedMovingUnderline ?? false,
        ),
      { timeout: 15_000 },
    )
    .toBe(true);
});

test("reduced motion renders final content without CSS or Motion animation", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });

  for (const portfolioPage of portfolioPages) {
    await page.goto(portfolioPage.path);

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

    const motionState = await page.evaluate(() => {
      const animatedElements = [
        ...document.querySelectorAll<HTMLElement>("header *, main *"),
      ].filter((element) => {
        const style = getComputedStyle(element);
        return (
          element.getClientRects().length > 0 &&
          style.visibility !== "hidden" &&
          element.closest('[aria-hidden="true"]') === null
        );
      });

      return animatedElements.map((element) => {
        const style = getComputedStyle(element);
        return {
          animationDuration: style.animationDuration,
          animationName: style.animationName,
          transitionDuration: style.transitionDuration,
          transitionProperty: style.transitionProperty,
        };
      });
    });

    expect(
      motionState.every(
        ({ animationDuration, animationName, transitionDuration }) =>
          animationName === "none" &&
          animationDuration.split(",").every((duration) => duration === "0s") &&
          transitionDuration
            .split(",")
            .every((duration) => duration.trim() === "0s"),
      ),
    ).toBe(true);
  }
});

test("reduced motion hydrates every Portfolio Page without runtime errors", async ({
  page,
}) => {
  const runtimeErrors: string[] = [];
  page.on("pageerror", (error) => runtimeErrors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") runtimeErrors.push(message.text());
  });
  await page.emulateMedia({ reducedMotion: "reduce" });

  for (const portfolioPage of portfolioPages) {
    await page.goto(portfolioPage.path);
  }

  expect(runtimeErrors, "reduced-motion browser runtime errors").toEqual([]);
});

test("reduced motion preserves complete mobile disclosure interaction", async ({
  page,
}, testInfo) => {
  test.skip(!testInfo.project.use.isMobile, "Mobile Site Header behavior");

  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");

  const menuButton = page.getByRole("button", { name: "Open menu" });
  await menuButton.click();

  const navigation = page.getByRole("navigation", {
    name: "Mobile navigation",
  });
  await expect(navigation).toBeVisible();
  for (const label of primaryWayfinding) {
    await expect(navigation.getByRole("link", { name: label })).toBeVisible();
  }

  const openMenuMotionState = await navigation.evaluate((element) => {
    return [...element.querySelectorAll<HTMLElement>("*")].map((child) => {
      const style = getComputedStyle(child);
      return {
        animationName: style.animationName,
        animationDuration: style.animationDuration,
        transitionDuration: style.transitionDuration,
      };
    });
  });
  expect(
    openMenuMotionState.every(
      ({ animationName, animationDuration, transitionDuration }) =>
        animationName === "none" &&
        animationDuration.split(",").every((duration) => duration === "0s") &&
        transitionDuration
          .split(",")
          .every((duration) => duration.trim() === "0s"),
    ),
  ).toBe(true);

  const appearanceControl = navigation.getByRole("button", {
    name: "Toggle theme",
  });
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

  await page.keyboard.press("Escape");
  await expect(navigation).toBeHidden();
  await expect(page.getByRole("button", { name: "Open menu" })).toBeFocused();
});

test("reduced motion updates the mobile disclosure control without intermediate frames", async ({
  page,
}, testInfo) => {
  test.skip(!testInfo.project.use.isMobile, "Mobile Site Header behavior");

  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");

  const opacitySamples = await sampleMobileDisclosureControlOpacity(page);

  expect(opacitySamples.at(-1)).toBe(0);
  expect(
    opacitySamples.every((opacity) => opacity === 0 || opacity === 1),
  ).toBe(true);
});

test("CV preserves the section and entry entrance sequence", async ({
  page,
}) => {
  await page.addInitScript(() => {
    const motionWindow = window as CvMotionWindow;
    const starts: Record<string, number> = {};
    motionWindow.__cvMotionStarts = starts;

    function observeMotion() {
      const motionFrame = performance.now();
      const elements = [
        ...document.querySelectorAll("main h2"),
        ...document.querySelectorAll("main ol > li"),
      ];

      for (const [index, element] of elements.entries()) {
        const key = index < 2 ? `heading-${index}` : `entry-${index - 2}`;
        const opacity = Number.parseFloat(getComputedStyle(element).opacity);

        if (opacity > 0 && opacity < 1 && starts[key] === undefined) {
          starts[key] = motionFrame;
        }
      }

      if (Object.keys(starts).length < 8) {
        requestAnimationFrame(observeMotion);
      }
    }

    requestAnimationFrame(observeMotion);
  });

  await page.goto("/about");

  await expect
    .poll(() =>
      page.evaluate(() =>
        Object.keys((window as CvMotionWindow).__cvMotionStarts ?? {}),
      ),
    )
    .toHaveLength(8);

  const starts = await page.evaluate(
    () => (window as CvMotionWindow).__cvMotionStarts ?? {},
  );

  expect(starts["heading-0"]).toBeLessThan(starts["entry-0"]);
  expect(starts["entry-1"]).toBeLessThan(starts["heading-1"]);
  expect(starts["heading-1"]).toBeLessThan(starts["entry-4"]);
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
  await page.emulateMedia({ reducedMotion: "no-preference" });

  const projects = [
    {
      client: "Levi's",
      url: "https://www.scayle.com/customers/levi-strauss/",
      primaryMetadata: "Commerce migration",
      imageDescriptions: ["Levi's red Batwing mark"],
    },
    {
      client: "Harrods",
      url: "https://www.scayle.com/customers/harrods/",
      primaryMetadata: "Commerce delivery",
      imageDescriptions: ["Harrods green wordmark"],
    },
    {
      client: "Fielmann",
      url: "https://www.scayle.com/case-studies/fielmann/",
      primaryMetadata: "Commerce platform",
      imageDescriptions: ["Fielmann black wordmark"],
    },
    {
      client: "SCAYLE / ABOUT YOU",
      primaryMetadata: "Commerce platform",
      imageDescriptions: [
        "SCAYLE wordmark with green directional accents",
        "ABOUT YOU black-and-white wordmark",
      ],
      editorialReview: true,
    },
    {
      client: "FIFA",
      primaryMetadata: "Digital product",
      imageDescriptions: ["FIFA blue wordmark"],
      editorialReview: true,
    },
    {
      client: "TenneT",
      url: "https://www.tennet.eu/",
      primaryMetadata: "Web platform",
      imageDescriptions: ["TenneT blue-and-green wordmark"],
    },
    {
      client: "fussball.de",
      url: "https://next.fussball.de/",
      primaryMetadata: "Platform migration",
      imageDescriptions: ["fussball.de green field mark"],
    },
  ];

  await page.addInitScript(() => {
    const motionWindow = window as WorkMotionWindow;
    const workMotionStarts: Record<number, number> = {};
    const workPartMotionStarts: Record<string, number> = {};
    motionWindow.__workMotionStarts = workMotionStarts;
    motionWindow.__workPartMotionStarts = workPartMotionStarts;

    new MutationObserver((mutations) => {
      const motionFrame = performance.now();

      for (const mutation of mutations) {
        const target = mutation.target;
        if (!(target instanceof HTMLElement)) continue;

        const project = target.closest("article");
        if (!project) continue;

        const projectIndex = Array.from(
          document.querySelectorAll("article"),
        ).indexOf(project);
        const opacity = Number.parseFloat(getComputedStyle(target).opacity);
        const partName = target.hasAttribute("data-notebook-record-rule")
          ? "rule"
          : target.getAttribute("data-entry-part");

        if (
          projectIndex >= 0 &&
          partName === "index" &&
          opacity > 0 &&
          opacity < 1 &&
          workMotionStarts[projectIndex] === undefined
        ) {
          workMotionStarts[projectIndex] = motionFrame;
        }

        if (
          projectIndex === 0 &&
          partName &&
          opacity > 0 &&
          opacity < 1 &&
          workPartMotionStarts[partName] === undefined
        ) {
          workPartMotionStarts[partName] = motionFrame;
        }
      }
    }).observe(document, {
      attributes: true,
      attributeFilter: ["style"],
      subtree: true,
    });
  });

  await page.goto("/work");

  const main = page.getByRole("main");
  await expect(main.getByText("W", { exact: true })).toBeVisible();
  await expect(main.locator("[data-notebook-header-rule]")).toBeVisible();

  const projectsInOrder = main.locator("article");
  await expect(projectsInOrder).toHaveCount(projects.length);
  await expect(projectsInOrder.getByRole("heading", { level: 2 })).toHaveText(
    projects.map(({ client }) => client),
  );

  for (const [index, project] of projects.entries()) {
    const renderedProject = projectsInOrder.nth(index);
    await expect(
      renderedProject.getByText(project.primaryMetadata, { exact: true }),
    ).toBeVisible();
    expect(
      await renderedProject
        .locator(":scope > [data-entry-part]")
        .evaluateAll((parts) =>
          parts.map((part) => part.getAttribute("data-entry-part")),
        ),
    ).toEqual(["index", "media", "title", "metadata", "annotation", "tags"]);

    for (const imageDescription of project.imageDescriptions) {
      const renderedMark = renderedProject.getByRole("img", {
        name: imageDescription,
      });
      await expect(renderedMark).toBeVisible();
      const markBox = await renderedMark.boundingBox();
      const mediaBox = await renderedProject
        .locator("[data-notebook-media-field]")
        .boundingBox();
      expect(markBox).not.toBeNull();
      expect(mediaBox).not.toBeNull();
      if (!markBox || !mediaBox) throw new Error("Expected rendered Work mark");
      expect(markBox.width).toBeGreaterThan(50);
      expect(markBox.height).toBeGreaterThan(12);
      expect(markBox.x).toBeGreaterThanOrEqual(mediaBox.x);
      expect(markBox.y).toBeGreaterThanOrEqual(mediaBox.y);
      expect(markBox.x + markBox.width).toBeLessThanOrEqual(
        mediaBox.x + mediaBox.width,
      );
      expect(markBox.y + markBox.height).toBeLessThanOrEqual(
        mediaBox.y + mediaBox.height,
      );
    }

    await expect(
      renderedProject.locator('[data-entry-part="annotation"]'),
    ).toBeVisible();

    const clientLink = renderedProject.getByRole("link", {
      name: `View ${project.client} project`,
    });
    if (project.url) {
      await expect(clientLink).toHaveAttribute("href", project.url);
      await expect(clientLink).toHaveAttribute("target", "_blank");
      await expect(clientLink).toHaveAttribute("rel", /noopener/);
    } else {
      await expect(clientLink).toHaveCount(0);
    }
  }

  const firstProject = projectsInOrder.first();
  await expect(
    firstProject.getByText("Currently collaborating with the team at SCAYLE", {
      exact: false,
    }),
  ).toBeVisible();
  for (const technology of ["Vue 3", "Nuxt 4", "TypeScript", "SCAYLE"]) {
    await expect(
      firstProject.getByText(technology, { exact: true }),
    ).toBeVisible();
  }

  await expect(
    projectsInOrder.getByText("Draft description · Owner editorial review"),
  ).toHaveCount(2);

  const collectionBox = await main
    .locator("[data-notebook-collection]")
    .boundingBox();
  const introductionBox = await main
    .locator("[data-notebook-introduction]")
    .boundingBox();
  expect(collectionBox).not.toBeNull();
  expect(introductionBox).not.toBeNull();
  if (!collectionBox || !introductionBox) {
    throw new Error("Expected the Work collection and introduction measures");
  }
  expect(collectionBox.width).toBeLessThanOrEqual(1082);
  expect(introductionBox.width).toBeLessThanOrEqual(722);
  if (!testInfo.project.use.isMobile) {
    expect(collectionBox.width).toBeGreaterThan(1000);
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
    { fetchPriority: "high", loading: "eager" },
    { fetchPriority: "high", loading: "eager" },
    { fetchPriority: "auto", loading: "lazy" },
    { fetchPriority: "auto", loading: "lazy" },
    { fetchPriority: "auto", loading: "lazy" },
    { fetchPriority: "auto", loading: "lazy" },
    { fetchPriority: "auto", loading: "lazy" },
    { fetchPriority: "auto", loading: "lazy" },
  ]);

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
  const workPartMotionStarts = await page.evaluate(
    () => (window as WorkMotionWindow).__workPartMotionStarts ?? {},
  );
  const partOrder = [
    "rule",
    "index",
    "media",
    "title",
    "metadata",
    "annotation",
    "tags",
  ];
  expect(Object.keys(workPartMotionStarts)).toHaveLength(partOrder.length);
  for (let partIndex = 1; partIndex < partOrder.length; partIndex++) {
    expect(workPartMotionStarts[partOrder[partIndex]]).toBeGreaterThan(
      workPartMotionStarts[partOrder[partIndex - 1]],
    );
  }

  await page.waitForTimeout(700);
  await page.evaluate(() => {
    const motionWindow = window as WorkMotionWindow;
    motionWindow.__workMotionAfterSettle = 0;
    const workCollection = document.querySelector("[data-notebook-collection]");
    if (!workCollection) throw new Error("Expected the Work collection");

    new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        const target = mutation.target;
        if (!(target instanceof HTMLElement) || !target.closest("article"))
          continue;

        const opacity = Number.parseFloat(getComputedStyle(target).opacity);
        if (opacity > 0 && opacity < 1) {
          motionWindow.__workMotionAfterSettle =
            (motionWindow.__workMotionAfterSettle ?? 0) + 1;
        }
      }
    }).observe(workCollection, {
      attributes: true,
      attributeFilter: ["style"],
      subtree: true,
    });
  });
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(100);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(600);
  expect(
    await page.evaluate(
      () => (window as WorkMotionWindow).__workMotionAfterSettle,
    ),
  ).toBe(0);

  const firstProjectLink = firstProject.getByRole("link", {
    name: "View Levi's project",
  });
  await page.evaluate(() => {
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
  });
  for (let tabIndex = 0; tabIndex < 10; tabIndex++) {
    if (
      await firstProjectLink.evaluate((link) => link === document.activeElement)
    ) {
      break;
    }
    await page.keyboard.press("Tab");
  }
  await expect(firstProjectLink).toBeFocused();
  expect(
    await firstProjectLink.evaluate(
      (element) => getComputedStyle(element).outlineStyle,
    ),
  ).not.toBe("none");

  if (!testInfo.project.use.isMobile) {
    await firstProject.hover();
    await expect
      .poll(() =>
        firstProject.evaluate((element) => getComputedStyle(element).transform),
      )
      .not.toBe("none");
  } else {
    const firstProjectUrl = "https://www.scayle.com/customers/levi-strauss/";
    await page.context().route(firstProjectUrl, async (route) => {
      await route.fulfill({
        body: "Work destination",
        contentType: "text/html",
      });
    });
    const popupPromise = page.waitForEvent("popup");
    await firstProjectLink.tap();
    const popup = await popupPromise;
    await expect(popup).toHaveURL(firstProjectUrl);
    await popup.close();
  }
});

test("Work Engineering Notebook preserves its marks and content across theme and motion states", async ({
  page,
}) => {
  const imageDescriptions = [
    "Levi's red Batwing mark",
    "Harrods green wordmark",
    "Fielmann black wordmark",
    "SCAYLE wordmark with green directional accents",
    "ABOUT YOU black-and-white wordmark",
    "FIFA blue wordmark",
    "TenneT blue-and-green wordmark",
    "fussball.de green field mark",
  ];

  for (const theme of ["light", "dark"] as const) {
    for (const reducedMotion of ["no-preference", "reduce"] as const) {
      await page.emulateMedia({ reducedMotion });
      await page.goto("/work");
      await page.evaluate((nextTheme) => {
        localStorage.setItem("theme", nextTheme);
      }, theme);
      await page.reload();

      await expect(page.locator("html")).toHaveClass(new RegExp(theme));
      await expect(page.locator('[data-entry-part="annotation"]')).toHaveCount(
        7,
      );
      for (const imageDescription of imageDescriptions) {
        await expect(
          page.getByRole("img", { name: imageDescription }),
        ).toBeVisible();
      }

      const mediaFieldBackgrounds = await page
        .locator("[data-notebook-media-field]")
        .evaluateAll((fields) =>
          fields.map((field) => getComputedStyle(field).backgroundColor),
        );
      expect(mediaFieldBackgrounds).toHaveLength(7);
      expect(
        mediaFieldBackgrounds.every(
          (background) => background !== "rgba(0, 0, 0, 0)",
        ),
      ).toBe(true);

      if (reducedMotion === "reduce") {
        const firstRecord = page.getByRole("main").locator("article").first();
        await firstRecord.scrollIntoViewIfNeeded();
        const restingBox = await firstRecord.boundingBox();
        await firstRecord.hover();
        const hoveredBox = await firstRecord.boundingBox();
        expect(hoveredBox).toEqual(restingBox);

        const firstLink = firstRecord.getByRole("link", {
          name: "View Levi's project",
        });
        const restingLinkBox = await firstLink.boundingBox();
        await firstLink.dispatchEvent("pointerdown", {
          button: 0,
          isPrimary: true,
          pointerId: 1,
          pointerType: "mouse",
        });
        const pressedLinkBox = await firstLink.boundingBox();
        expect(pressedLinkBox).toEqual(restingLinkBox);
        await firstLink.dispatchEvent("pointerup", {
          button: 0,
          isPrimary: true,
          pointerId: 1,
          pointerType: "mouse",
        });
      }
    }
  }
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
    { fetchPriority: "high", loading: "eager" },
    { fetchPriority: "high", loading: "eager" },
    { fetchPriority: "auto", loading: "lazy" },
    { fetchPriority: "auto", loading: "lazy" },
    { fetchPriority: "auto", loading: "lazy" },
    { fetchPriority: "auto", loading: "lazy" },
  ]);
  await expect(
    page.locator('head link[rel="preload"][as="image"]'),
  ).toHaveCount(2);

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
