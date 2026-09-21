# Keep the page title paint-eligible, and prefetch on intent

A Lighthouse audit of the production build scored the home sheet 94 for performance. Every metric but one was perfect; Largest Contentful Paint alone came back at 3.0s against a First Contentful Paint of 0.8s, and the 25% that metric carries was the whole of the missing six points. Three things were measured and two of them changed.

## The page title settles on `clip-path` alone

ADR-0006 left a standing constraint — at least one paint-eligible, above-the-fold element must be opaque in the server-rendered HTML — and gave the job to the Site Header's identity mark. That is enough to have a First Contentful Paint reported. It is not enough to have Largest Contentful Paint reported *early*, because Chrome keeps taking larger candidates after the first one, and the mark is 280px² against the page title's 17,424px². The title was still the element that reported LCP, and it was reporting it 450ms late: observed FCP 67ms, observed LCP 583ms, the gap being the title's own entrance.

ADR-0004 recorded that Chrome excludes an element that is transparent *or fully clipped* when it paints. The second half of that is wrong, and the measurement is unambiguous. Overriding the title's entrance in the running production build, one property at a time:

| Title entrance | observed FCP | observed LCP |
| --- | --- | --- |
| clip wipe + fade (as shipped) | 67ms | 583ms |
| neither | 136ms | 136ms |
| clip wipe only | 84ms | 84ms |

A fully clipped element is recorded at first paint, at its unclipped size. A transparent one is not. So the fade goes and the wipe — the notebook's signature move, the thing the entrance is actually for — stays untouched. Nothing was traded away: a fade running underneath a wipe only tinted the part the wipe had already revealed.

The constraint at the top of `app/motion.css` is restated to match what was measured: nothing that reports a paint metric may be painted at `opacity: 0`. Two elements carry it now, the identity mark for FCP and the page title for LCP.

## Wayfinding prefetches on intent, not on sight

`<Link>` prefetches every route in the viewport by default, and for static routes it prefetches the whole payload. The notebook's wayfinding is above the fold on every sheet and all five routes are static, so a single first load pulled the entire site down as 15 extra requests — measured — before the reader had pointed at anything.

Lighthouse charges simulated LCP for every request that *finished* before the observed LCP timestamp, at its full simulated download time on a throttled connection. Those 15 requests were all inside that window. Removing them moved the home sheet from 94 to 98, the largest single change of the three.

`prefetch={false}` alone suppresses prefetching on hover as well as on sight, so intent turns it back on: `null` restores the default the moment a reader points at a link. Pointer, focus, and touch all count, which keeps keyboard and touch readers on the same instant navigation a mouse gets. This is the pattern Next.js documents for exactly this case. For a notebook of five sheets, where a reader opens one of them, the prefetch is better spent when there is a reason to spend it.

## Space Mono loads one weight

`next/font` preloads every weight it is handed. The bold cut of the data face was drawn down on every page load, ~9 KB, and the only rule asking for it was `.skip-link` — off-screen until a keyboard reaches it. The skip link sets its own weight to 400 and the cut is no longer loaded.

## Rejected: inlining the stylesheet

`experimental.inlineCss` is the documented fit for an atomic-CSS site, and it measured worse. Next.js emits the stylesheet twice when inlining — once as a `<style>` tag for SSR and once inside the RSC payload — so the document went from 9.3 KB transferred to 41.4 KB against the 11 KB the separate stylesheet cost, and First Contentful Paint went up with it. The round trip it saves is cheaper than the bytes it duplicates. Left off.

## What is left

The home sheet measures 98–99 across repeated runs, from 94. The remainder is not reachable by trimming: Lighthouse charges simulated LCP for everything that lands before the observed LCP timestamp, and on a local server the whole payload lands inside 40ms, so the graph is the full page however early the paint is. React and the App Router client runtime are ~120 KB transferred of the ~238 KB total and are not optional. Stripping the console and a font weight entirely was measured at ~22 KB and disappeared inside the ±300ms run-to-run variance.

The other sheets measure 96–98, held there by the same defect the title had: `notebook-in-part` fades from `opacity: 0`, and on every route but home some element carrying it — the introduction on `/about` and `/work`, a record row on `/contact` — is the largest candidate. Measured with the fade dropped from `notebook-part-in`, observed LCP falls to first paint on all three (715→61ms, 936→73ms, 821→50ms). That is a real improvement for readers and a negligible one for the score, but it would reverse the aesthetic choice ADR-0006 made deliberately, across every record row and introduction in the notebook. The fade stays, and the other sheets keep their 96–98. The measurement is recorded here so the trade is a known one rather than a forgotten one.
