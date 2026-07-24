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
