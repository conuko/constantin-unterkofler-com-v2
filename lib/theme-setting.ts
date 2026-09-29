/**
 * The reader's appearance setting: light, dark, or whatever the system says.
 * `next-themes` stores it and resolves `system`; this is the notebook's side of
 * it, kept out of the components so it can be tested without a DOM.
 */

export const themeSettings = ["system", "light", "dark"] as const;

export type ThemeSetting = (typeof themeSettings)[number];

export type ResolvedTheme = "light" | "dark";

/** The key `next-themes` stores the setting under, and the one it reads back. */
export const themeStorageKey = "theme";

export const defaultThemeSetting: ThemeSetting = "system";

export function isThemeSetting(value: unknown): value is ThemeSetting {
  return themeSettings.some((setting) => setting === value);
}

/**
 * One press of the theme control. It goes from `system` to the theme the
 * system is not showing, so the first press always visibly changes the sheet,
 * then to the other one, then back to `system`. Only that last step can leave
 * the sheet as it was, and the glyph still changes to say so.
 */
export function nextThemeSetting(
  setting: ThemeSetting,
  system: ResolvedTheme,
): ThemeSetting {
  const opposite: ResolvedTheme = system === "dark" ? "light" : "dark";

  if (setting === "system") return opposite;
  if (setting === opposite) return system;
  return "system";
}

/** How the console and the control's label name a setting: `system (dark)`. */
export function describeThemeSetting(
  setting: ThemeSetting,
  system: ResolvedTheme,
): string {
  return setting === "system" ? `system (${system})` : setting;
}

/**
 * Runs before first paint and writes the stored setting onto `<html>` as
 * `data-theme-setting`, so the control shows the right glyph from the first
 * frame. `next-themes` only writes the resolved theme, and a stored `system`
 * that resolves to dark would otherwise look the same as a stored `dark`.
 * Storage can throw (private windows, blocked site data); the default stands.
 */
export const themeSettingScript = `try{var s=localStorage.getItem(${JSON.stringify(themeStorageKey)});document.documentElement.dataset.themeSetting=s==="light"||s==="dark"?s:${JSON.stringify(defaultThemeSetting)}}catch(e){document.documentElement.dataset.themeSetting=${JSON.stringify(defaultThemeSetting)}}`;
