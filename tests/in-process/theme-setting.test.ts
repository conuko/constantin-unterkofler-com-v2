import { describe, expect, test } from "vitest";
import {
  describeThemeSetting,
  isThemeSetting,
  nextThemeSetting,
  type ResolvedTheme,
  type ThemeSetting,
  themeSettingScript,
} from "@/lib/theme-setting";

function pressesFrom(system: ResolvedTheme, presses: number) {
  const settings: ThemeSetting[] = ["system"];

  for (let press = 0; press < presses; press += 1) {
    settings.push(nextThemeSetting(settings.at(-1) ?? "system", system));
  }

  return settings;
}

describe("theme control", () => {
  test("cycles through all three settings and returns to system", () => {
    expect(pressesFrom("light", 3)).toEqual([
      "system",
      "dark",
      "light",
      "system",
    ]);
    expect(pressesFrom("dark", 3)).toEqual([
      "system",
      "light",
      "dark",
      "system",
    ]);
  });

  test("changes the sheet on the first press from system", () => {
    expect(nextThemeSetting("system", "light")).toBe("dark");
    expect(nextThemeSetting("system", "dark")).toBe("light");
  });

  test("names system with what it resolves to", () => {
    expect(describeThemeSetting("system", "dark")).toBe("system (dark)");
    expect(describeThemeSetting("light", "dark")).toBe("light");
  });

  test("accepts only the three settings", () => {
    expect(["system", "light", "dark"].every(isThemeSetting)).toBe(true);
    expect(isThemeSetting("sepia")).toBe(false);
    expect(isThemeSetting(undefined)).toBe(false);
  });
});

describe("pre-paint theme setting", () => {
  function run(stored: string | null | Error) {
    const root = { dataset: {} as Record<string, string> };
    const storage = {
      getItem: () => {
        if (stored instanceof Error) throw stored;
        return stored;
      },
    };

    new Function("localStorage", "document", themeSettingScript)(storage, {
      documentElement: root,
    });

    return root.dataset.themeSetting;
  }

  test("writes the stored setting onto the root before paint", () => {
    expect(run("dark")).toBe("dark");
    expect(run("light")).toBe("light");
    expect(run("system")).toBe("system");
  });

  test("falls back to system when nothing usable is stored", () => {
    expect(run(null)).toBe("system");
    expect(run("sepia")).toBe("system");
    expect(run(new Error("storage blocked"))).toBe("system");
  });
});
