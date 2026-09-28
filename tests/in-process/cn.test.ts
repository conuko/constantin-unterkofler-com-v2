import { readFileSync } from "node:fs";
import { describe, expect, test } from "vitest";
import { cn } from "@/lib/utils/cn";

const themeBlock =
  readFileSync("app/theme.css", "utf8").match(/@theme\s*{([\s\S]*?)\n}/)?.[1] ??
  "";

/** One utility per theme namespace, plus a default-scale sibling it replaces. */
const namespaceUtilities: Record<string, { prefix: string; sibling: string }> =
  {
    animate: { prefix: "animate", sibling: "animate-spin" },
    blur: { prefix: "backdrop-blur", sibling: "backdrop-blur-md" },
    container: { prefix: "max-w", sibling: "max-w-xl" },
    ease: { prefix: "ease", sibling: "ease-linear" },
    leading: { prefix: "leading", sibling: "leading-tight" },
    radius: { prefix: "rounded", sibling: "rounded-md" },
    shadow: { prefix: "shadow", sibling: "shadow-lg" },
    text: { prefix: "text", sibling: "text-sm" },
    tracking: { prefix: "tracking", sibling: "tracking-wide" },
  };

// Colours and font families already merge by any name. The remaining
// namespaces fall outside tailwind-merge's theme keys, so an unknown name passes
// through unmerged rather than being misread. `grid-pitch` is a plain variable.
const passThroughNamespaces = [
  "color",
  "font",
  "grid-pitch",
  "grid-template-columns",
  "height",
  "max-height",
  "min-height",
  "transition-duration",
  "width",
];

const themeVariables = [...themeBlock.matchAll(/^\s*--([a-z0-9-]+):/gm)].map(
  ([, variable]) => variable,
);

function namespaceOf(variable: string, namespaces: string[]) {
  return namespaces.find(
    (namespace) =>
      variable === namespace || variable.startsWith(`${namespace}-`),
  );
}

const themeTokens = themeVariables
  .filter((variable) => !namespaceOf(variable, passThroughNamespaces))
  .map((variable) => {
    const namespace = namespaceOf(variable, Object.keys(namespaceUtilities));
    return {
      variable,
      namespace,
      name: namespace && variable.slice(namespace.length + 1),
    };
  })
  // The bare `--radius` sets Tailwind's default radius, not a named scale step.
  .filter(({ name }) => name !== "");

describe("cn() merges the portfolio's theme scales", () => {
  test("reads the theme tokens", () => {
    expect(themeTokens.length).toBeGreaterThan(0);
  });

  test.each(themeTokens)("--$variable", ({ variable, namespace, name }) => {
    expect(namespace, `no merge check for --${variable}`).toBeDefined();
    if (!namespace) return;

    const { prefix, sibling } = namespaceUtilities[namespace];
    expect(cn(sibling, `${prefix}-${name}`)).toBe(`${prefix}-${name}`);
  });

  test("keeps colours beside the label and micro sizes", () => {
    expect(cn("label text-ink-muted text-label")).toBe(
      "label text-ink-muted text-label",
    );
    expect(cn("text-micro text-paper")).toBe("text-micro text-paper");
  });

  test("keeps a shadow colour beside the console shadow", () => {
    expect(cn("shadow-console shadow-black/20")).toBe(
      "shadow-console shadow-black/20",
    );
  });

  test("still lets a later size or colour override an earlier one", () => {
    expect(cn("text-label", "text-micro")).toBe("text-micro");
    expect(cn("text-ink-muted text-label", "text-ink")).toBe(
      "text-label text-ink",
    );
  });
});
