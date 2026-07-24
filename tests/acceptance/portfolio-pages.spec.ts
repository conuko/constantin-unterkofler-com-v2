import { expect, type Locator, type Page, test } from "@playwright/test";

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
