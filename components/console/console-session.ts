import type { NavItem } from "@/content/site-content";
import {
  describeThemeSetting,
  isThemeSetting,
  nextThemeSetting,
  type ResolvedTheme,
  type ThemeSetting,
  themeSettings,
} from "@/lib/theme-setting";

/**
 * The console's command surface, kept out of the component so it can be
 * unit-tested without a DOM.
 *
 * Rule: the console answers the same routes the navigation does. It is a
 * second way in, never the only way — nothing is reachable through the
 * console alone.
 */

export type ConsoleLineKind = "prompt" | "output" | "muted" | "error";

export type ConsoleLine = {
  id: string;
  kind: ConsoleLineKind;
  text: string;
  /** Rendered as a two-column row: name in the command colour, then text. */
  name?: string;
  /** Prompt lines only: the working directory the command was typed in. */
  path?: string;
};

export type ConsoleEffect =
  | { type: "navigate"; href: string }
  | { type: "open"; href: string }
  | { type: "theme"; setting: ThemeSetting }
  | { type: "sound"; enabled: boolean }
  | { type: "clear" }
  | { type: "close" };

export type ConsoleResult = {
  lines: ConsoleLine[];
  effects: ConsoleEffect[];
};

export type ConsoleContext = {
  identityName: string;
  identityRole: string;
  identityLocation: string;
  /** Every route the console can move to, Home included — see `consoleRoutes`. */
  routes: NavItem[];
  /** The route currently on screen and the one before it, for `cd -`. */
  pathname: string;
  previousPathname: string | null;
  /** Where the shell stands, when not the route: see `workingDirectory`. */
  directory?: string;
  soundsEnabled: boolean;
  /** The stored appearance setting and what the system resolves to. */
  appearance: { setting: ThemeSetting; system: ResolvedTheme };
  repositoryUrl: string;
  records: { index: string; label: string; meta: string }[];
};

type CommandSpec = {
  name: string;
  description: string;
  run: (args: string[], context: ConsoleContext) => ConsoleResult;
};

export const homeRoute: NavItem = { href: "/", label: "Home" };

/**
 * The primary wayfinding leaves Home out because the identity mark carries it.
 * The console has no identity mark, so it lists Home first.
 */
export function consoleRoutes(wayfinding: NavItem[]): NavItem[] {
  return [homeRoute, ...wayfinding.filter((item) => item.href !== "/")];
}

/** The working directory as the prompt shows it: `~` at home, `~/work` elsewhere. */
export function displayPath(pathname: string): string {
  return pathname === "/" ? "~" : `~${pathname}`;
}

/**
 * Where the shell stands. A URL the site does not publish, the 404 sheet, is
 * not a directory a shell could be in: `cd` there would have failed and left
 * it where it was. So the console stands in the nearest published directory
 * above it, `~/work` for `/work/nope` and `~` for `/nope`, and every command
 * (`cd ..`, `cd -`, the prompt) reads from there.
 */
export function workingDirectory(pathname: string, routes: NavItem[]): string {
  const segments = pathname.split("/").filter(Boolean);

  for (; segments.length > 0; segments.pop()) {
    const href = `/${segments.join("/")}`;
    if (routes.some((route) => route.href === href)) return href;
  }

  return "/";
}

/**
 * The failed `cd` a 404 stands for, printed where a shell would print it:
 * above the prompt that stayed in the directory it could not leave.
 */
export function missingDirectoryLine(
  pathname: string,
  routes: NavItem[],
): ConsoleLine | null {
  return workingDirectory(pathname, routes) === pathname
    ? null
    : line("error", `cd: no such directory: ${displayPath(pathname)}`);
}

let lineSequence = 0;

function line(kind: ConsoleLineKind, text: string, name?: string): ConsoleLine {
  lineSequence += 1;
  return { id: `line-${lineSequence}`, kind, text, name };
}

function output(...lines: ConsoleLine[]): ConsoleResult {
  return { lines, effects: [] };
}

function navigate(href: string, close: boolean): ConsoleResult {
  return {
    lines: [line("muted", `opening ${href}`)],
    effects: close
      ? [{ type: "navigate", href }, { type: "close" }]
      : [{ type: "navigate", href }],
  };
}

export type DirectoryResolution = { href: string } | { error: string };

/**
 * Shell path semantics over a flat site. `~`, `/`, and no argument mean home;
 * `-` means the previous route; `.` and `..` walk from the current route; a
 * bare name (`work`, `~/work`, `/work`) is looked up from the root, because the
 * site publishes one level and nobody should have to `cd ../work`.
 */
export function resolveDirectory(
  target: string | undefined,
  context: Pick<
    ConsoleContext,
    "routes" | "pathname" | "previousPathname" | "directory"
  >,
): DirectoryResolution {
  if (target === undefined || target === "~" || target === "/") {
    return { href: "/" };
  }

  if (target === "-") {
    return context.previousPathname
      ? { href: context.previousPathname }
      : { error: "cd: no previous directory" };
  }

  const href = resolvePath(target, context.directory ?? context.pathname);

  return context.routes.some((route) => route.href === href)
    ? { href }
    : { error: `cd: no such directory: ${target}` };
}

function resolvePath(target: string, pathname: string): string {
  const segments = target.split("/");
  const walksFromCurrent = segments[0] === "." || segments[0] === "..";
  const resolved = walksFromCurrent ? pathname.split("/").filter(Boolean) : [];

  for (const segment of segments) {
    if (segment === "" || segment === "." || segment === "~") continue;
    if (segment === "..") {
      resolved.pop();
      continue;
    }
    resolved.push(segment);
  }

  return `/${resolved.join("/")}`;
}

const commands: CommandSpec[] = [
  {
    name: "help",
    description: "list the available commands",
    run: () =>
      output(
        ...commands.map((command) =>
          line("output", command.description, command.name),
        ),
      ),
  },
  {
    name: "whoami",
    description: "who is typing back",
    run: (_args, context) =>
      output(
        line(
          "output",
          `${context.identityName} — ${context.identityRole} · ${context.identityLocation}`,
        ),
      ),
  },
  {
    name: "home",
    description: "the front sheet",
    run: () => navigate("/", true),
  },
  {
    name: "about",
    description: "biography, CV, and where I have worked",
    run: () => navigate("/about", true),
  },
  {
    name: "work",
    description: "client projects — add --list to print the index",
    run: (args, context) => {
      if (args.includes("--list")) {
        return output(
          ...context.records.map((record) =>
            line("output", `${record.label}  ${record.meta}`, record.index),
          ),
        );
      }

      return navigate("/work", true);
    },
  },
  {
    name: "contact",
    description: "email, GitHub, LinkedIn",
    run: () => navigate("/contact", true),
  },
  {
    name: "ls",
    description: "list the routes this site publishes",
    run: (_args, context) =>
      output(
        ...context.routes.map((item) => line("output", item.label, item.href)),
      ),
  },
  {
    name: "cd",
    description: "change route — cd work, cd .., cd ~, cd -",
    run: (args, context) => {
      const resolution = resolveDirectory(args[0], context);

      if ("error" in resolution) return output(line("error", resolution.error));

      /* Against the route, not the directory: from a 404 in `~/work`,
       * `cd .` is the way back onto the Work sheet. */
      if (resolution.href === context.pathname) {
        return output(
          line("muted", `already at ${displayPath(context.pathname)}`),
        );
      }

      /* Unlike the named shortcuts, `cd` keeps the session open: the sheet
       * changes beside the window and the prompt path confirms the move, so
       * going back and forth costs one command, not a reopen each time. */
      return navigate(resolution.href, false);
    },
  },
  {
    name: "theme",
    description: "cycle appearance or set it — theme dark, theme system",
    run: (args, context) => {
      const requested = args[0]?.toLowerCase();

      if (requested !== undefined && !isThemeSetting(requested)) {
        return output(line("error", "theme: expected light, dark or system"));
      }

      /* Bare `theme` is one press of the Site Header's theme control. */
      const { setting: current, system } = context.appearance;
      const setting = requested ?? nextThemeSetting(current, system);

      if (setting === current) {
        return output(
          line(
            "muted",
            `appearance is already ${describeThemeSetting(setting, system)}`,
          ),
        );
      }

      return {
        lines: [
          line("muted", `appearance: ${describeThemeSetting(setting, system)}`),
        ],
        effects: [{ type: "theme", setting }],
      };
    },
  },
  {
    name: "sound",
    description: "show or set console sound — sound on, sound off",
    run: (args, context) => {
      const setting = args[0]?.toLowerCase();

      if (setting === undefined) {
        return output(
          line(
            "muted",
            `console sounds are ${context.soundsEnabled ? "on" : "off"}`,
          ),
        );
      }

      if (setting !== "on" && setting !== "off") {
        return output(line("error", "sound: expected on or off"));
      }

      const enabled = setting === "on";
      return {
        lines: [
          line("muted", enabled ? "console sounds on" : "console sounds off"),
        ],
        effects: [{ type: "sound", enabled }],
      };
    },
  },
  {
    name: "source",
    description: "open the repository for this site",
    run: (_args, context) => ({
      lines: [line("muted", context.repositoryUrl)],
      effects: [{ type: "open", href: context.repositoryUrl }],
    }),
  },
  {
    name: "clear",
    description: "clear the session",
    run: () => ({ lines: [], effects: [{ type: "clear" }] }),
  },
  {
    name: "exit",
    description: "close the console",
    run: () => ({ lines: [], effects: [{ type: "close" }] }),
  },
];

export const commandNames = commands.map((command) => command.name);

const loginDateFormatter = new Intl.DateTimeFormat("en-US", {
  weekday: "short",
  month: "short",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hourCycle: "h23",
});

type LoginDatePart = "weekday" | "month" | "day" | "hour" | "minute" | "second";

/** Formats the browser-local timestamp captured when a console session starts. */
export function formatLastLogin(openedAt: Date): string {
  const parts = loginDateFormatter.formatToParts(openedAt);
  const part = (type: LoginDatePart) => {
    const value = parts.find((candidate) => candidate.type === type)?.value;

    if (!value) throw new Error(`Missing ${type} in login timestamp`);

    return value;
  };

  return `Last login: ${part("weekday")} ${part("month")} ${part("day")} ${part("hour")}:${part("minute")}:${part("second")} on ttys002`;
}

/**
 * What the session opens on. A terminal that opens onto a bare prompt is a
 * few lines tall and reads as broken; this gives the window a height and the
 * reader a way in before the first command.
 */
export function bootLines(openedAt: Date): ConsoleLine[] {
  const lines: [ConsoleLineKind, string, string?][] = [
    ["muted", formatLastLogin(openedAt)],
    [
      "muted",
      "Welcome to the portfolio console. Every route this site publishes is a directory; move between them like a shell.",
    ],
    ["muted", ""],
    ["output", "list the available commands", "help"],
    ["output", "list the routes", "ls"],
    ["output", "change route — cd work, cd .., cd ~, cd -", "cd"],
    ["muted", ""],
    ["muted", "Tab completes · ↑ recalls · Esc closes"],
  ];

  return lines.map(([kind, text, name], index) => ({
    id: `boot-${index}`,
    kind,
    text,
    name,
  }));
}

export function promptLine(input: string, path: string): ConsoleLine {
  return { ...line("prompt", input), path };
}

export function runCommand(
  input: string,
  context: ConsoleContext,
): ConsoleResult {
  const [name, ...args] = input.trim().split(/\s+/);

  if (!name) return { lines: [], effects: [] };

  const command = commands.find((candidate) => candidate.name === name);

  if (!command) {
    return output(
      line("error", `command not found: ${name}`),
      line("muted", "type help for the list"),
    );
  }

  return command.run(args, context);
}

export type Completion = {
  /** The line after the Tab key. */
  value: string;
  /** Every way the word can still go, when Tab could not extend it and there
   * is more than one. Empty otherwise. */
  candidates: string[];
};

/* A directory is written with its trailing slash, as a shell completes one.
 * `cd` reads `work/` as `work`. Home has no name to complete: it is `~`. */
function directoryNames(routes: NavItem[]): string[] {
  return routes
    .filter((route) => route.href !== "/")
    .map((route) => `${route.href.slice(1)}/`);
}

/* What the word under the caret can become, from the command and the place
 * of the word after it. Only the arguments a command reads are offered. */
function wordsFor(
  command: string | undefined,
  position: number,
  routes: NavItem[],
): string[] {
  if (command === undefined) return commandNames;
  if (command === "work") return ["--list"];
  if (position !== 1) return [];
  if (command === "cd") return directoryNames(routes);
  if (command === "theme") return [...themeSettings];
  if (command === "sound") return ["on", "off"];
  return [];
}

function commonPrefix(words: string[]): string {
  let prefix = words[0];
  for (const word of words) {
    while (!word.startsWith(prefix)) prefix = prefix.slice(0, -1);
  }
  return prefix;
}

/**
 * The Tab key, completing the last word on the line: a command name first,
 * then that command's arguments, so `cd w` becomes `cd work/` and `theme d`
 * becomes `theme dark `. A single match is written out in full, with the
 * space a shell leaves after a finished word. Several matches are completed
 * as far as they agree, and when they agree no further than what is already
 * typed, they are listed instead, which is what a shell's second Tab does.
 *
 * `cd` completes a path from the root too: `cd ~/w` and `cd /w` keep the
 * prefix the reader typed.
 */
export function completeInput(
  input: string,
  context: Pick<ConsoleContext, "routes">,
): Completion {
  const wordStart = input.search(/\S*$/);
  const head = input.slice(0, wordStart);
  const word = input.slice(wordStart);
  const [command, ...args] = head.trim().split(/\s+/).filter(Boolean);

  const root =
    command === "cd" && args.length === 0
      ? (/^~?\//.exec(word)?.[0] ?? "")
      : "";
  const partial = word.slice(root.length);
  const matches = wordsFor(command, args.length + 1, context.routes)
    .filter((candidate) => candidate.startsWith(partial))
    .sort();

  if (matches.length === 0) return { value: input, candidates: [] };

  if (matches.length === 1) {
    const [match] = matches;
    const end = match.endsWith("/") ? "" : " ";
    return { value: `${head}${root}${match}${end}`, candidates: [] };
  }

  const prefix = commonPrefix(matches);
  return prefix.length > partial.length
    ? { value: `${head}${root}${prefix}`, candidates: [] }
    : { value: input, candidates: matches };
}

/** The candidates a Tab listed, on one line, as a shell lays them out. */
export function candidateLine(candidates: string[]): ConsoleLine {
  return line("output", candidates.join("  "));
}

/** A line abandoned with Ctrl+C: written out as it stood, then `^C`. */
export function interruptLine(input: string, path: string): ConsoleLine {
  return promptLine(`${input}^C`, path);
}
