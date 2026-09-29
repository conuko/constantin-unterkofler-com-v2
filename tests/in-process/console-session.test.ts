import { describe, expect, test } from "vitest";
import {
  bootLines,
  type ConsoleContext,
  candidateLine,
  commandNames,
  completeInput,
  consoleRoutes,
  displayPath,
  formatLastLogin,
  resolveDirectory,
  runCommand,
} from "@/components/console/console-session";

const wayfinding = [
  { href: "/about", label: "About me" },
  { href: "/contact", label: "Contact" },
  { href: "/work", label: "Work" },
];

function context(overrides: Partial<ConsoleContext> = {}): ConsoleContext {
  return {
    identityName: "Constantin Unterkofler",
    identityRole: "Senior Software Engineer",
    identityLocation: "Berlin",
    routes: consoleRoutes(wayfinding),
    pathname: "/",
    previousPathname: null,
    soundsEnabled: true,
    appearance: { setting: "system", system: "light" },
    repositoryUrl: "https://github.com/conuko",
    records: [],
    ...overrides,
  };
}

describe("console routes", () => {
  test("whoami prints the supplied identity attributes", () => {
    expect(runCommand("whoami", context()).lines[0]).toMatchObject({
      kind: "output",
      text: "Constantin Unterkofler — Senior Software Engineer · Berlin",
    });
  });

  test("lists Home first, ahead of the primary wayfinding", () => {
    expect(consoleRoutes(wayfinding).map((route) => route.href)).toEqual([
      "/",
      "/about",
      "/contact",
      "/work",
    ]);
  });

  test("does not list Home twice if the wayfinding already carries it", () => {
    const routes = consoleRoutes([{ href: "/", label: "Home" }, ...wayfinding]);
    expect(routes.filter((route) => route.href === "/")).toHaveLength(1);
  });

  test("ls prints Home with the other routes", () => {
    const names = runCommand("ls", context()).lines.map((line) => line.name);
    expect(names).toEqual(["/", "/about", "/contact", "/work"]);
  });

  test("home navigates to the front sheet and closes", () => {
    expect(runCommand("home", context({ pathname: "/work" })).effects).toEqual([
      { type: "navigate", href: "/" },
      { type: "close" },
    ]);
  });

  test("help and completion know home, cd, and sound", () => {
    expect(commandNames).toContain("home");
    expect(commandNames).toContain("cd");
    expect(commandNames).toContain("sound");
  });
});

describe("theme", () => {
  test("bare theme presses the theme control", () => {
    expect(runCommand("theme", context()).effects).toEqual([
      { type: "theme", setting: "dark" },
    ]);
    expect(
      runCommand(
        "theme",
        context({ appearance: { setting: "light", system: "light" } }),
      ).effects,
    ).toEqual([{ type: "theme", setting: "system" }]);
  });

  test("sets the named appearance, system included", () => {
    const result = runCommand(
      "theme system",
      context({ appearance: { setting: "dark", system: "light" } }),
    );

    expect(result.effects).toEqual([{ type: "theme", setting: "system" }]);
    expect(result.lines[0]).toMatchObject({
      kind: "muted",
      text: "appearance: system (light)",
    });
    expect(runCommand("theme DARK", context()).effects).toEqual([
      { type: "theme", setting: "dark" },
    ]);
  });

  test("says so when the appearance is already set", () => {
    const result = runCommand("theme system", context());

    expect(result.effects).toEqual([]);
    expect(result.lines[0]).toMatchObject({
      text: "appearance is already system (light)",
    });
  });

  test("rejects an unknown appearance instead of toggling", () => {
    const result = runCommand("theme sepia", context());

    expect(result.effects).toEqual([]);
    expect(result.lines[0]).toMatchObject({
      kind: "error",
      text: "theme: expected light, dark or system",
    });
  });
});

describe("sound", () => {
  test("reports the reader's persisted sound preference", () => {
    expect(runCommand("sound", context()).lines[0]).toMatchObject({
      kind: "muted",
      text: "console sounds are on",
    });
    expect(
      runCommand("sound", context({ soundsEnabled: false })).lines[0],
    ).toMatchObject({ text: "console sounds are off" });
  });

  test("sets sound on or off", () => {
    expect(runCommand("sound off", context()).effects).toEqual([
      { type: "sound", enabled: false },
    ]);
    expect(
      runCommand("sound on", context({ soundsEnabled: false })).effects,
    ).toEqual([{ type: "sound", enabled: true }]);
  });

  test("rejects an unsupported sound setting", () => {
    expect(runCommand("sound louder", context()).lines[0]).toMatchObject({
      kind: "error",
      text: "sound: expected on or off",
    });
  });
});

describe("cd", () => {
  test("goes home with no argument, ~, or /", () => {
    const at = context({ pathname: "/work" });
    expect(resolveDirectory(undefined, at)).toEqual({ href: "/" });
    expect(resolveDirectory("~", at)).toEqual({ href: "/" });
    expect(resolveDirectory("/", at)).toEqual({ href: "/" });
  });

  test("resolves a bare, absolute, or home-relative route name", () => {
    const at = context({ pathname: "/work" });
    expect(resolveDirectory("about", at)).toEqual({ href: "/about" });
    expect(resolveDirectory("/about", at)).toEqual({ href: "/about" });
    expect(resolveDirectory("~/about", at)).toEqual({ href: "/about" });
    expect(resolveDirectory("about/", at)).toEqual({ href: "/about" });
  });

  test(".. walks up to home and ../name walks across", () => {
    const at = context({ pathname: "/work" });
    expect(resolveDirectory("..", at)).toEqual({ href: "/" });
    expect(resolveDirectory("../about", at)).toEqual({ href: "/about" });
  });

  test("- returns to the previous route, or complains when there is none", () => {
    expect(
      resolveDirectory(
        "-",
        context({ pathname: "/work", previousPathname: "/about" }),
      ),
    ).toEqual({ href: "/about" });
    expect(resolveDirectory("-", context({ pathname: "/work" }))).toEqual({
      error: "cd: no previous directory",
    });
  });

  test("rejects a route the site does not publish", () => {
    expect(resolveDirectory("nowhere", context())).toEqual({
      error: "cd: no such directory: nowhere",
    });
    expect(runCommand("cd nowhere", context()).lines[0]).toMatchObject({
      kind: "error",
      text: "cd: no such directory: nowhere",
    });
  });

  test("navigates without closing the console", () => {
    const result = runCommand("cd work", context());
    expect(result.effects).toEqual([{ type: "navigate", href: "/work" }]);
  });

  test("stays put when already in the target directory", () => {
    const result = runCommand("cd ..", context({ pathname: "/" }));
    expect(result.effects).toEqual([]);
    expect(result.lines[0]).toMatchObject({
      kind: "muted",
      text: "already at ~",
    });
  });
});

describe("prompt", () => {
  test("shows ~ at home and ~/route elsewhere", () => {
    expect(displayPath("/")).toBe("~");
    expect(displayPath("/work")).toBe("~/work");
  });

  test("boots with an introduction that names the starter commands", () => {
    const openedAt = new Date(2026, 8, 16, 10, 53, 47);
    const lines = bootLines(openedAt);
    expect(lines.length).toBeGreaterThanOrEqual(7);
    expect(lines[0]).toMatchObject({
      kind: "muted",
      text: "Last login: Wed Sep 16 10:53:47 on ttys002",
    });
    expect(lines.map((line) => line.name).filter(Boolean)).toEqual([
      "help",
      "ls",
      "cd",
    ]);
    expect(new Set(lines.map((line) => line.id)).size).toBe(lines.length);
  });

  test("formats the browser-local session timestamp in console form", () => {
    expect(formatLastLogin(new Date(2026, 8, 16, 10, 53, 47))).toBe(
      "Last login: Wed Sep 16 10:53:47 on ttys002",
    );
  });
});

describe("tab completion", () => {
  const routes = { routes: consoleRoutes(wayfinding) };

  test("writes out a unique command with the space after a finished word", () => {
    expect(completeInput("wh", routes)).toEqual({
      value: "whoami ",
      candidates: [],
    });
  });

  test("extends an ambiguous command as far as the matches agree", () => {
    expect(completeInput("c", routes)).toEqual({
      value: "c",
      candidates: ["cd", "clear", "contact"],
    });
    expect(completeInput("con", routes)).toEqual({
      value: "contact ",
      candidates: [],
    });
  });

  test("completes cd to a directory, with its trailing slash", () => {
    expect(completeInput("cd w", routes).value).toBe("cd work/");
    expect(completeInput("cd ~/a", routes).value).toBe("cd ~/about/");
    expect(completeInput("cd /c", routes).value).toBe("cd /contact/");
  });

  test("lists every directory for a bare cd", () => {
    expect(completeInput("cd ", routes)).toEqual({
      value: "cd ",
      candidates: ["about/", "contact/", "work/"],
    });
  });

  test("a completed directory is one cd reads", () => {
    expect(
      resolveDirectory("work/", {
        ...routes,
        pathname: "/",
        previousPathname: null,
      }),
    ).toEqual({ href: "/work" });
  });

  test("completes the arguments theme, sound and work read", () => {
    expect(completeInput("theme d", routes).value).toBe("theme dark ");
    expect(completeInput("theme ", routes).candidates).toEqual([
      "dark",
      "light",
      "system",
    ]);
    expect(completeInput("sound o", routes).candidates).toEqual(["off", "on"]);
    expect(completeInput("work --", routes).value).toBe("work --list ");
  });

  test("leaves a word nothing matches, and arguments no command reads", () => {
    expect(completeInput("xyz", routes)).toEqual({
      value: "xyz",
      candidates: [],
    });
    expect(completeInput("cd work/ a", routes)).toEqual({
      value: "cd work/ a",
      candidates: [],
    });
    expect(completeInput("help h", routes)).toEqual({
      value: "help h",
      candidates: [],
    });
  });

  test("lists candidates on one line, two spaces apart", () => {
    expect(candidateLine(["about/", "work/"])).toMatchObject({
      kind: "output",
      text: "about/  work/",
    });
  });
});
