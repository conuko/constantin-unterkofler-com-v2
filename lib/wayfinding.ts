/**
 * Decides whether a primary wayfinding route is current for the given pathname.
 *
 * A route is current for its exact path and for nested paths beneath it.
 * Home is only current for "/" so it never claims every other route.
 */
export function isCurrentRoute(pathname: string, href: string): boolean {
  if (pathname === href) return true;
  if (href === "/") return false;

  return pathname.startsWith(`${href}/`);
}
