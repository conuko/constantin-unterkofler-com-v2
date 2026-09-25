type ConsoleKeyEvent = Pick<
  KeyboardEvent,
  "key" | "repeat" | "isComposing" | "altKey" | "ctrlKey" | "metaKey"
>;

/**
 * Whether a key press in the console's input is the reader typing, and so
 * gets a keystroke: a key that prints a character — space included, since
 * the reader struck it — or erases one.
 *
 * A held key strikes once, however many characters it repeats, so erasing a
 * line never becomes a rattle. Keys that move, recall, or complete (arrows,
 * Tab) are not typing, Enter has the command's own cue, and a shortcut is not
 * a keystroke even when it edits the line. AltGr arrives as Ctrl and Alt
 * together, so a character typed with it still counts, as one typed with
 * Option does. Keys an IME is composing with stay silent: they are choosing a
 * character, not typing one.
 */
export function isTypingKeystroke(event: ConsoleKeyEvent): boolean {
  if (event.repeat || event.isComposing) return false;
  if (event.metaKey || (event.ctrlKey && !event.altKey)) return false;

  return (
    [...event.key].length === 1 ||
    event.key === "Backspace" ||
    event.key === "Delete"
  );
}
