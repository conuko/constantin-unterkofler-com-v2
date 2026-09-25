import { describe, expect, test } from "vitest";
import { isTypingKeystroke } from "@/components/console/console-keystroke";

const press = (key: string, modifiers: Partial<KeyboardEvent> = {}) => ({
  key,
  repeat: false,
  isComposing: false,
  altKey: false,
  ctrlKey: false,
  metaKey: false,
  ...modifiers,
});

describe("console keystrokes", () => {
  test("strikes for every key that prints a character, space included", () => {
    for (const key of ["h", "E", "7", "!", "-", "~", " ", "é", "ß"]) {
      expect(isTypingKeystroke(press(key)), key).toBe(true);
    }
  });

  test("strikes for the keys that erase one", () => {
    expect(isTypingKeystroke(press("Backspace"))).toBe(true);
    expect(isTypingKeystroke(press("Delete"))).toBe(true);
  });

  test("strikes once for a held key, not for every character it repeats", () => {
    expect(isTypingKeystroke(press("Backspace", { repeat: true }))).toBe(false);
    expect(isTypingKeystroke(press("a", { repeat: true }))).toBe(false);
  });

  test("stays silent for keys that move, recall, complete, or submit", () => {
    for (const key of [
      "Enter",
      "Tab",
      "ArrowUp",
      "ArrowDown",
      "ArrowLeft",
      "Escape",
      "Home",
      "Shift",
      "Meta",
      "Dead",
      "Unidentified",
    ]) {
      expect(isTypingKeystroke(press(key)), key).toBe(false);
    }
  });

  test("stays silent for shortcuts, even ones that edit the line", () => {
    expect(isTypingKeystroke(press("a", { metaKey: true }))).toBe(false);
    expect(isTypingKeystroke(press("v", { ctrlKey: true }))).toBe(false);
    expect(isTypingKeystroke(press("Backspace", { metaKey: true }))).toBe(
      false,
    );
  });

  test("strikes for characters typed with Option or AltGr", () => {
    expect(isTypingKeystroke(press("@", { altKey: true }))).toBe(true);
    expect(isTypingKeystroke(press("@", { altKey: true, ctrlKey: true }))).toBe(
      true,
    );
  });

  test("stays silent while an IME composes", () => {
    expect(isTypingKeystroke(press("k", { isComposing: true }))).toBe(false);
    expect(isTypingKeystroke(press("Process"))).toBe(false);
  });
});
