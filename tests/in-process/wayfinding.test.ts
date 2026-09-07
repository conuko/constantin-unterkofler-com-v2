import { describe, expect, test } from "vitest";
import { isCurrentRoute } from "@/lib/wayfinding";

describe("Site Header current-route semantics", () => {
  test("marks the exact route as current", () => {
    expect(isCurrentRoute("/about", "/about")).toBe(true);
    expect(isCurrentRoute("/", "/")).toBe(true);
  });

  test("marks nested paths under a route prefix as current", () => {
    expect(isCurrentRoute("/work/levis", "/work")).toBe(true);
    expect(isCurrentRoute("/about/cv/2026", "/about")).toBe(true);
  });

  test("does not treat sibling routes sharing a prefix as current", () => {
    expect(isCurrentRoute("/aboutme", "/about")).toBe(false);
    expect(isCurrentRoute("/workshop", "/work")).toBe(false);
  });

  test("never treats Home as a prefix of other routes", () => {
    expect(isCurrentRoute("/about", "/")).toBe(false);
    expect(isCurrentRoute("/contact", "/")).toBe(false);
  });

  test("ignores unrelated routes", () => {
    expect(isCurrentRoute("/work", "/about")).toBe(false);
  });
});
