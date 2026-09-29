# Keep page introductions at the reading width

The design critique of 2026-09-26 measured the page introductions against the usual 65–75 characters a line. At the 720px reading width, 14px Space Grotesk sets 104–108 characters on a full line of About's introduction. Phase 2 of the polish capped the introduction at 488px (a `--container-measure` token), about 72 characters a line, while the rules and records below it kept the full sheet. On the built sheets that narrower column was reviewed and rejected by the owner. The introduction stays at the reading width, capped at 720px on every sheet, and the cap and its token were removed.

The long line is a known and accepted trade, not an oversight. Two things stay from the same pass. The introduction's leading is the documented Body leading, 1.625 (22.75px), which it had lost to `text-sm`'s own 20px; on a long line the extra leading is what carries the eye back to the start of the next one. And the measure finding is closed: a later critique that measures the same 104–108 characters is reporting this decision, not a new defect.

## Consequences

- DESIGN.md records it as The Full-Width Introduction Rule. The introduction's width is the sheet's reading width, and no narrower measure token exists.
- Proposing a narrower introduction again means revisiting this record first, not re-adding a measure.

## Considered

- **A 488px measure, about 72 characters** (built and rejected, above).
- **A larger introduction at 16px, capped near 75 characters.** Not built. It changes the header's type scale as well as its width.
