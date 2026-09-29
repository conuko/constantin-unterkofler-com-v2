import { type ClassValue, clsx } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

/**
 * Scale names from the `@theme` block in `app/theme.css` that tailwind-merge
 * does not know. Without them it reads `text-label` as a colour and drops the
 * `text-ink-muted` beside it, and reads `shadow-console` as a shadow colour.
 * Keys follow Tailwind's `--{namespace}-*` names; `cn.test.ts` fails when a
 * theme token merges in the wrong group.
 */
const themeScales = {
  animate: ["caret"],
  blur: ["glass"],
  container: ["reading", "collection"],
  ease: ["default", "spring"],
  leading: ["console"],
  radius: ["console"],
  shadow: ["console"],
  text: ["label", "micro"],
  tracking: ["code", "label", "micro"],
};

const twMerge = extendTailwindMerge({ extend: { theme: themeScales } });

/**
 * Combines multiple class values into a single string.
 *
 * Firstly, constructs className strings conditionally
 *
 * Lastly, efficiently merges Tailwind CSS classes without style conflicts.
 * @example
 * // returns 'text-lg'
 * cn('text-sm', true && 'text-lg');
 *
 * @example
 * // returns 'text-lg'
 * cn({ 'text-sm':true, 'text-xs':false, 'text-lg':isTrue() });
 *
 * @example
 * // returns 'foo bar'
 * cn(['foo', 0, false, 'bar']);
 *
 * @param inputs - The class values to be combined.
 * @returns A string representing the combined class values.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
