import { readdirSync, readFileSync } from "node:fs";
import { extname, join, relative } from "node:path";
import { expect, test } from "vitest";

const sourceDirectories = ["app", "components", "content", "lib"];
const sourceExtensions = new Set([".js", ".jsx", ".mdx", ".ts", ".tsx"]);
const arbitraryUtilityPattern =
  /(?:^|[\s"'`])((?:[\w-]+:)*-?[\w-]+-\[[^\]\s]+])(?=$|[\s"'`])/g;

function sourceFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);

    if (entry.isDirectory()) return sourceFiles(path);
    return sourceExtensions.has(extname(entry.name)) ? [path] : [];
  });
}

test("application code uses named Tailwind v4 utilities", () => {
  const arbitraryUtilities = sourceDirectories.flatMap((directory) =>
    sourceFiles(directory).flatMap((path) =>
      [...readFileSync(path, "utf8").matchAll(arbitraryUtilityPattern)].map(
        (match) => `${relative(process.cwd(), path)}: ${match[1]}`,
      ),
    ),
  );

  expect(arbitraryUtilities).toEqual([]);
});
