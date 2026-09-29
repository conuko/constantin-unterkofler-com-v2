# Reveal record parts by clip, not fade

ADR-0007 found that Chrome records a fully clipped element at first paint and a transparent one only frames later, and kept the page title's wipe for that reason. It left the record parts fading from `opacity: 0` and recorded the cost: on About, Work and Contact the largest element was a fading part, so LCP landed when its fade finished. It assumed Home was the exception, carried by its title.

It was not. The Home title is 19,835px² at 1440×900. The Focus value is 26,927px² and the Stack value 47,137px², both in the Specification Block, both fading. Measured on the production build, the observed LCP was the Stack value at ~780ms, against a First Contentful Paint of 52ms. The one sheet the paint-timing records called settled was the one with the widest gap.

Every part now enters on `clip-path` instead of `opacity`. It is written in from its top edge down while it settles the same 8px, on the same beat, durations and curve, and it is fully clipped rather than transparent until its turn. Nothing on the sheet is painted at `opacity: 0` any more, so the largest element reports LCP at first paint whichever element it is. Measured on the production build, observed LCP equals FCP on every sheet:

| Sheet | 1440×900 before | after | 390×844 after |
| --- | --- | --- | --- |
| Home | ~780ms (Stack value) | 68ms | 40ms |
| About | fade end (introduction) | 48ms | 56ms |
| Work | fade end (introduction) | 56–60ms | 52ms |
| Contact | fade end (record row) | 48ms | 56ms |

This does not reverse ADR-0006. What ADR-0006 rejected was an introduction that stood on the page before the page arrived: opaque from the first frame, settling only. A clipped part is still absent until its turn and still arrives. What goes is the fade, and a fade was never the notebook's move. Rules draw open, the title wipes, and now parts are written in: every entrance on the sheet is a drawing stroke. The title wipes left to right and parts are written top down, so the title keeps its signature.

The clip runs 8px wide of the part on both sides and below, so glyph overhang and a wayfinding link's underline, which sit just outside their part's box, are written in with it instead of appearing when the clip comes off.

## Consequences

- `clip-path` on an ancestor makes it a Backdrop Root, as `opacity` under 1 did, so glass must still carry its own entrance and never sit inside a part that is revealing. `NotebookMedia` already puts the entrance on the glass field itself. The 404 sheet's action link now does the same.
- Under reduced motion nothing changes: every entrance is `animation: none`, and content is in place from the first frame.
- The two paint-timing roles ADR-0006 and ADR-0007 assigned stay true but are no longer load-bearing on their own. The identity mark still reports FCP, and the title still wipes on `clip-path` alone. LCP no longer depends on which element happens to be largest.

## Considered

- **Settle only, no reveal** (ADR-0004's original introduction). It reports at first paint too, but it is what ADR-0006 rejected: the part stands on the sheet before its turn.
- **Clip reveal on the Specification Block only.** It fixes Home and leaves the other three sheets on their recorded fade, with two entrance styles on one site.
- **Starting the fade at a near-zero opacity.** Rejected in ADR-0006 as gaming the measurement, and still rejected.
