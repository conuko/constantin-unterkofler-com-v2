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
  wayfinding: NavItem[];
  repositoryUrl: string;
  records: { index: string; label: string; meta: string }[];
};

type CommandSpec = {
  name: string;
  description: string;
  run: (args: string[], context: ConsoleContext) => ConsoleResult;
};

let lineSequence = 0;

function line(kind: ConsoleLineKind, text: string, name?: string): ConsoleLine {
  lineSequence += 1;
  return { id: `line-${lineSequence}`, kind, text, name };
}

function output(...lines: ConsoleLine[]): ConsoleResult {
  return { lines, effects: [] };
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
      output(line("output", `${context.identityName} — ${context.identityRole}`)),
  },
  {
    name: "about",
    description: "biography, CV, and where I have worked",
    run: () => ({
      lines: [line("muted", "opening /about")],
      effects: [
        { type: "navigate", href: "/about" },
        { type: "close" },
      ],
    }),
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

      return {
        lines: [line("muted", "opening /work")],
        effects: [{ type: "navigate", href: "/work" }, { type: "close" }],
      };
    },
  },
  {
    name: "contact",
    description: "email, GitHub, LinkedIn",
    run: () => ({
      lines: [line("muted", "opening /contact")],
      effects: [{ type: "navigate", href: "/contact" }, { type: "close" }],
    }),
  },
  {
    name: "ls",
    description: "list the routes this site publishes",
    run: (_args, context) =>
      output(
        ...context.wayfinding.map((item) =>
          line("output", item.label, item.href),
        ),
      ),
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

export function promptLine(input: string): ConsoleLine {
  return line("prompt", input);
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
