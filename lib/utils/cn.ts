import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

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
