import type { NavItem } from "@/content/site-content";

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
  | { type: "theme" }
  | { type: "clear" }
  | { type: "close" };

export type ConsoleResult = {
  lines: ConsoleLine[];
  effects: ConsoleEffect[];
};

export type ConsoleContext = {
  identityName: string;
  identityRole: string;
  /** Every route the console can move to, Home included — see `consoleRoutes`. */
  routes: NavItem[];
  /** The route currently on screen and the one before it, for `cd -`. */
  pathname: string;
  previousPathname: string | null;
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
  context: Pick<ConsoleContext, "routes" | "pathname" | "previousPathname">,
): DirectoryResolution {
  if (target === undefined || target === "~" || target === "/") {
    return { href: "/" };
  }

  if (target === "-") {
    return context.previousPathname
      ? { href: context.previousPathname }
      : { error: "cd: no previous directory" };
  }

  const href = resolvePath(target, context.pathname);

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
        line("output", `${context.identityName} — ${context.identityRole}`),
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
    description: "toggle light / dark",
    run: () => ({
      lines: [line("muted", "toggling appearance")],
      effects: [{ type: "theme" }],
    }),
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

/**
 * What the session opens on. A terminal that opens onto a bare prompt is a
 * few lines tall and reads as broken; this gives the window a height and the
 * reader a way in before the first command.
 */
export function bootLines(): ConsoleLine[] {
  const lines: [ConsoleLineKind, string, string?][] = [
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

/** Longest common prefix completion for the Tab key. */
export function completeCommand(input: string): string {
  const matches = commandNames.filter((name) => name.startsWith(input));

  if (matches.length === 0) return input;
  if (matches.length === 1) return matches[0];

  let prefix = matches[0];
  for (const match of matches) {
    while (!match.startsWith(prefix)) prefix = prefix.slice(0, -1);
  }

  return prefix;
}
