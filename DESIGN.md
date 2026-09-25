# Design — Engineering Notebook / Technical

The notebook keeps its paper, its ink, its two typefaces, and every entrance and
hover it already had. What changes is the instrumentation: a finer dot pitch,
square corners with crop marks, dimension lines instead of decoration, and a
monospace face carrying every number, code, and index.

The goal is stated as a negative as much as a positive — less bullet journal,
more technical drawing. Nothing below is a new visual language; it is the same
language rendered with drafting tools.

---

## 1. Principles

1. **Measurement over decoration.** A line exists to separate, bound, or
   measure. If it does none of those, it comes out.
2. **Numbers are monospace.** Any glyph a reader might compare against another
   glyph — an index, a year, an aspect ratio, a URL — is set in Space Mono.
   Sentences stay in Space Grotesk.
3. **Square is the default.** Radius is reserved for the console window, which
   is a window rather than a page element.
4. **One annotation colour.** Blue marks measurement. It never carries body
   copy, never fills a surface, and never appears twice in the same role as ink.
5. **Motion keeps its curves.** Every easing curve and duration in
   `app/motion.css` and `app/theme.css` survived this change verbatim. Entrance
   offsets have since moved onto one 40ms beat (ADR-0008). See ADR-0004 for why
   the choreography is CSS.

---

## 2. Ground — the dot field

The old field was a 22px grid of 0.9px dots at 14% ink. Wide and soft; it read
as bullet-journal paper.

The new field is two stacked radial layers:

```css
background-image:
  radial-gradient(circle at 1px 1px, var(--color-dot) 0.5px, transparent 1px),
  radial-gradient(
    circle at 1px 1px,
    var(--color-dot-major) 0.9px,
    transparent 1.4px
  );
background-size:
  var(--grid-pitch) var(--grid-pitch),
  var(--grid-pitch-major) var(--grid-pitch-major);
```

| Token                | Value      | Note                      |
| -------------------- | ---------- | ------------------------- |
| `--grid-pitch`       | `8px`      | Minor. Two base units.    |
| `--grid-pitch-major` | `40px`     | Every fifth dot, heavier. |
| `--color-dot`        | ink / 8.5% | Light. Dark theme: 7%.    |
| `--color-dot-major`  | ink / 20%  | Light. Dark theme: 16%.   |

Every fifth dot is heavier so the eye can count without a printed line. Major
and minor pitch stay in a 1:5 ratio; if the minor pitch is tuned, the major
follows.

---

## 3. Ink

Paper and ink are untouched. One token is new.

### Light

| Token                | Value                  |
| -------------------- | ---------------------- |
| `--color-paper`      | `#f8f7f2`              |
| `--color-ink`        | `#111111`              |
| `--color-ink-muted`  | ink / 72%              |
| `--color-rule`       | ink / 20%              |
| `--color-dot`        | ink / 8.5%             |
| `--color-dot-major`  | ink / 20%              |
| `--color-annotation` | `oklch(0.52 0.13 250)` |
| `--color-card-glass` | white / 52%            |

### Dark

| Token                | Value                  |
| -------------------- | ---------------------- |
| `--color-paper`      | `#1a1917`              |
| `--color-ink`        | `#f8f7f2`              |
| `--color-ink-muted`  | ink / 72%              |
| `--color-rule`       | ink / 20%              |
| `--color-dot`        | ink / 7%               |
| `--color-dot-major`  | ink / 16%              |
| `--color-annotation` | `oklch(0.78 0.11 250)` |
| `--color-card-glass` | ink / 6%               |

`--color-rule` moved from 18% to 20%. The hairline now has to hold its own
against a denser dot field; at 18% it dissolved into it.

The greeting rotation keeps its own lightness and chroma tokens
(`--greeting-lightness`, `--greeting-chroma`) and its random per-language hue.
The annotation colour is separate and never rotates.

---

## 4. Three faces

| Role    | Face          | Change  |
| ------- | ------------- | ------- |
| Display | Bebas Neue    | none    |
| Text    | Space Grotesk | none    |
| Data    | Space Mono    | **new** |

Space Grotesk was drawn from Space Mono — same foundry, same skeleton, same
terminals. Pairing them is not a contrast decision; it is the proportional face
and the fixed-width face of one design.

Space Mono replaces Space Grotesk inside the `label` utility. Everywhere the
notebook already said "this is a code, an index, or a measurement", it now says
it in the face built for that.

### Scale

| Token        | Spec                     | Use                        |
| ------------ | ------------------------ | -------------------------- |
| `display-lg` | Bebas 72 / 1.0 / -0.02em | Page title (48 below `lg`) |
| `display-sm` | Bebas 24 / 1.0 / -0.01em | Record title               |
| `body`       | Grotesk 14 / 1.625       | Annotation, introduction   |
| `body-sm`    | Grotesk 13 / 1.6         | Supporting copy            |
| `code`       | Mono 11 / 0.14em         | Record index               |
| `label`      | Mono 11 caps / 0.12em    | Metadata, section heading  |
| `micro`      | Mono 10 caps / 0.10em    | Tags, footer               |
| `num`        | Mono 11 tabular          | Years, counts              |

Minimum type size on the site is 10px, and only for uppercase mono at 72% ink.

---

## 5. Rules and ticks

| Element        | Drawing                                                   | Where                                                       |
| -------------- | --------------------------------------------------------- | ----------------------------------------------------------- |
| Hairline       | 1px at `--color-rule`                                     | Between records. Unchanged; still draws open left to right. |
| Ticked rule    | Hairline + 7px end ticks                                  | Above record groups and page sections.                      |
| Dimension line | Annotation-coloured rule, end ticks, centred mono caption | Annotation only. One per page at most.                      |

A ticked rule is a hairline that knows where it stops. Use it wherever the rule
bounds a thing (a record, a section); use a plain hairline wherever it merely
separates two things (rows in a list).

### What is not drawn

Principle 1 read strictly. Each of these bounded nothing a reader could not
already see, so each came out. They are listed because each one is the kind of
line a drafting metaphor invites back.

| Not drawn                                    | Why                                                                                                                                                            |
| -------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Column guides at the reading-column edges    | The column's own content marks its edges. Two full-height hairlines running past every record read as a frame around the page rather than a measurement of it. |
| The closing record's top rule                | The page's bottom edge already ends the sheet. A rule there separated the footer from nothing.                                                                 |
| Frames on the identity mark and the controls | See §7.                                                                                                                                                        |
| An inset highlight on the media field        | See §6.                                                                                                                                                        |

`--color-rule-hair` existed only for the first two and is gone with them. A
future line quiet enough to need it should ask first whether it needs to exist.

---

## 6. Record anatomy

```
  ┌ ticked rule ──────────────────────────────────┐
  W–01                                  levi.svg     index (annotation) / filename
  ┌─┐                                        ┌─┐
  │   ╔═══════════════════════════════════╗   │        crop marks, 5px clear
  │   ║          brand mark               ║   │        square glass field, 16:9
  └─┘ ╚═══════════════════════════════════╝ └─┘
  LEVI'S                                                Bebas 24
  COMMERCE MIGRATION                                    Mono 11 caps
  │ Currently collaborating with the team…              Grotesk 14, left rule
  + VUE 3  + NUXT 4  + TYPESCRIPT                       Mono 10 caps
```

1. **Ticked rule** — the record's hairline gains end ticks, so the card reads as
   a measured span rather than a torn page.
2. **Index and filename** — index left in annotation colour, source filename
   right. Both Space Mono.
3. **Crop marks** — four corner Ls, 7px long, 5px clear of the frame. They
   replace the 12px radius. Implemented as one masked pseudo-element
   (`crop-marks` utility), not four elements.
4. **Square field** — same glass tint, same 1px backdrop blur, same 16:9,
   `border-radius: 0`. One 1px border and nothing else: no bevel, no inset
   highlight (see below). Work records draw that border at `--color-rule`; the
   primitive's own default is the quieter `--color-media-field-rule`.
5. **Title and metadata** — Bebas 24 unchanged; metadata moves from Space
   Grotesk caps to Space Mono caps.
6. **Annotation** — left rule and 14px body copy unchanged. This is the one
   place the reader reads sentences.
7. **Stack** — mono, wider tracking, the same `+` marker at 30% ink.

### The field has no bevel

The field carried `inset 0 1px 0` in a near-white highlight, the standard glass
bevel. On light paper it was invisible; in the dark theme, where the field is a
6% ink tint over `#1a1917`, a 32%-white line across its top edge read as a
second, brighter border stacked on the real one. Every work record looked like
it had a rule on top that no other side had.

It was decoration under principle 1, so it is gone in both themes rather than
suppressed in one — `--shadow-media-field` and `--color-media-field-highlight`
are removed. The field is bounded by its border and marked by its crop marks;
that is two statements of its edge already.

### Brand marks and the dark theme

A mark inside the field meets the inversion in one of three ways, and the
mark's entry in `markRendering` (`components/work-presentation.tsx`) names
which:

| Answer       | For                                                                           | How                                                                        |
| ------------ | ----------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| Nothing      | Marks legible on either ground — Levi's, FIFA, TenneT, ABOUT YOU              | One image, no dark handling.                                               |
| A filter     | Single-colour marks — Harrods, Fielmann, SB Migrate                           | `dark:brightness-0 dark:invert` re-inks the whole mark.                    |
| A second cut | Marks with a brand accent — SCAYLE                                            | `darkSrc` names a file whose wordmark is inverted and whose accent is not. |

The third case exists because a filter is all-or-nothing: inverting SCAYLE's
wordmark would take its green with it. The pair is two elements, not one
swapped `src`, because the theme here is a class on `<html>` and an external
SVG loaded through `<img>` can read neither that class nor
`prefers-color-scheme` — so CSS shows one and hides the other, and both cuts
are fetched. At 3.5KB each that is the cheaper half of the trade.

Both cuts carry the mark's real `alt`. The hidden one is `display: none` and so
is never announced twice.

### The 1px blur is still 1px

`--blur-glass: 1px` is measured against the dot field, and the field has
changed. At the new 8px pitch the dots are finer, so the blur radius that
smears them into "glass" without erasing them is, if anything, smaller than
before. Do not raise it. The note in `app/theme.css` explains the measurement;
it still holds.

### The home sheet's specification

The home sheet has no section code — the Greeting takes that slot — so its
header ends on the ticked rule and four standing fields follow it.

```
  ────────────────────────    ────────────────────────    plain hairline
  ROLE                        BASED                       Mono 11 caps, muted
  Software Engineer, …        Berlin · 52.5200° N, …      Mono 14
  ────────────────────────    ────────────────────────
  FOCUS                       STACK
  Commerce platforms, …       TypeScript · Vue / Nuxt …
```

Two columns from `sm` up, one below, 40px between them. Each field caps itself
with a plain hairline rather than a ticked one: the rule separates the field
from what is above it, it does not bound a record (§5). The values are
measurements of a kind — a title, a coordinate, a stack — so they are set in
the data face and left in full ink, with only the labels muted.

---

## 7. Controls

| Control            | Treatment                                                                                                                                                                                                                        |
| ------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Identity mark (CU) | 36px box, unframed, Space Mono 11 / 0.08em. Still has no entrance — it carries FCP/LCP (ADR-0004, ADR-0006).                                                                                                                     |
| Theme toggle       | 36px box, unframed, same spring scale-on-hover.                                                                                                                                                                                  |
| Disclosure control | 36px box, unframed. Three lines folding into a cross.                                                                                                                                                                            |
| Wayfinding link    | Unchanged: `underline-reveal`, 300ms, `--ease-spring`.                                                                                                                                                                           |
| Action link        | Square, 1px `--color-rule`, glass fill, Space Mono 10 caps. Hover lifts border and text to full ink.                                                                                                                             |
| Console control    | Square, ink-filled, 36px tall. Prompt glyph in annotation colour, `K` in a hairline box. Sits in the Closing Record's right column, above the build stamp. Hovers at 2% (`notebook-control-framed`), not the glyph controls' 5%. |
| Disabled           | 1px dashed `--color-rule`, text at 40% ink.                                                                                                                                                                                      |

Hit targets stay at or above 36px, and every interactive element keeps
`notebook-control` / `notebook-press` / `notebook-lift`.

The site header's own controls are unframed: the glyph is the control. A frame
around two letters or a sun icon bounds a box the reader was not reading, and
three of them in a row turned the header into a toolbar. The 36px box survives
as the hit target — it is sized, not drawn — and hover still springs. Frames
stay where they enclose something a reader treats as a surface: the action
link, the console control, and the mobile disclosure panel.

---

## 8. Console

The console control sits in the Closing Record's right column, above the build
stamp, on every page. It opens a terminal that docks in one of two places: a
column in the right corner (the default on desktop) or along the bottom edge.
The amber light docks it to the bottom, the green light to the right — the
same two lights that minimise and zoom a window on the platform the chrome is
quoted from. Below `lg` it always docks to the bottom and the two lights are
disabled.

- **Surface** — one dark surface in both themes: `#15141a`, 1px border at
  ink / 14%, `border-radius: 10px`, a long soft drop shadow. The traffic lights
  and this radius are the only round shapes in the system.
- **Chrome** — three 11px lights at the left (red `#ff5f57` closes, amber
  `#febc2e` docks bottom, green `#28c840` docks right), each in a 20px hit box.
  Hovering any light shows the macOS glyphs on all three — a cross, a bar, the
  two zoom triangles — in ink at 60%. Centred session title
  `cu@portfolio — ~/constantin-unterkofler.com`, `ESC` at the right.
- **Body** — Space Mono 13 / 1.8. The prompt shows the working directory —
  `~` on the front sheet, `~/work` elsewhere — in annotation colour, then `❯`.
  Command names in green; output at 55% ink. The session opens on a short boot
  text (login line, the three starter commands, the key hints) so the window
  has height before the first command. The login line records the browser-local
  time of the first open in a page session; a reload starts a fresh session.
- **Banner** — `HELLO THERE!` in ANSI Shadow block capitals above the boot
  text, in annotation colour, the way a shell prints an motd before the first
  prompt. One line, 89 columns at leading 1, sized so those 89 columns fill
  the window it is docked in and capped at 12px so the bottom dock does not
  print it at poster size. It is the one thing here not set in Space Mono:
  that face ships no block or box-drawing glyphs, so the browser composed the
  art per character out of two advances — 0.61em for the Latin, 0.97em for
  every `█` beside it — and the columns stopped lining up. The banner names
  the platform's own terminal stack instead, which has the glyphs and sets all
  of them on one advance. It carries `role="img"` and the greeting as its
  label, because the greeting is the one thing the boot text does not also
  say. On the first open it types itself a character at a time, 80ms apart
  after a 260ms lead-in, and every visible character lands with the console's
  keystroke — the command's key strike on a smaller key — in the same
  animation frame. Closing the window or starting to type prints the rest at
  once; reduced motion prints it whole from the start, silently. The reader's
  own typing uses the same keystroke: one per key that prints or erases a
  character, none for a held key's repeats, shortcuts, or navigation keys. `clear`
  takes it with the rest of the session.
- **Size** — bottom dock: the body grows from a 13rem floor to
  `min(52vh, 26rem)`, then scrolls. Side dock: a fixed column, 45rem wide and
  `min(72vh, 40rem)` tall, the body filling it.
- **Caret** — 8 × 16 block in the command green on the existing `caret-blink`
  animation, the same one the greeting uses; steady at 40% while the input is
  unfocused. The native caret is transparent.
- **Scrollbar** — thin, thumb at the console rule colour on a transparent track
  via `scrollbar-color`, with WebKit pseudo-elements only where the standard
  property is missing.
- **Motion** — opacity and `translate: 0 24px` at the bottom dock,
  `translate: 24px 0` at the side dock, over 300ms on the notebook's entrance
  easing. `translate`, not `transform`: a non-`none` transform on an ancestor
  orphans a descendant's `backdrop-filter` (see `app/motion.css`). Switching
  dock while open repositions the window without a transition.
- **Intro** — the banner types itself the first time the window opens, and
  only then: one sweep left to right over 1.1s. It is a clip wipe stepped once
  per column — eased, the edge slides through the middle of a glyph and leaves
  half a block standing; on `steps()` it only ever lands on a character cell,
  which is what reads as typing rather than as a wipe. The session holds at
  the top of the window while it runs and settles onto the prompt when the
  greeting lands; typing a command ends it early. Reduced motion prints the
  banner and skips straight to the prompt.
- **Open** — click the control, or press `K` anywhere outside a text field.
  **Close** — `Esc`, the red light, the `ESC` label, or the control again.

### Commands

| Command   | Result                                                                                                                                       |
| --------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| `help`    | List commands                                                                                                                                |
| `whoami`  | Identity line                                                                                                                                |
| `home`    | Navigate to `/` and close                                                                                                                    |
| `about`   | Navigate to `/about` and close                                                                                                               |
| `work`    | Navigate to `/work` and close; `work --list` prints the record index                                                                         |
| `contact` | Navigate to `/contact` and close                                                                                                             |
| `ls`      | List the routes, Home first                                                                                                                  |
| `cd`      | Change route like a shell and stay open: `cd work`, `cd /about`, `cd ~/about`, `cd ..`, `cd ~` (or bare `cd`), `cd -` for the previous route |
| `theme`   | Toggle light / dark                                                                                                                          |
| `source`  | Open the repository                                                                                                                          |
| `clear`   | Clear the session                                                                                                                            |
| `exit`    | Close the console                                                                                                                            |

The console answers the same routes the navigation does. It is a second way in,
never the only way: nothing is reachable through the console alone. `cd` keeps
the window open where the named shortcuts close it: the sheet changes beside
the window and the prompt path confirms the move, so going back and forth costs
one command rather than a reopen each time.

---

## 9. Motion

Restated so it is not lost in the migration:

- Entrance is CSS, keyed off an absolute `--notebook-delay`, rendered into the
  server HTML. No hydration in the critical path.
- Every offset is a whole number of 40ms beats (`notebookBeat`). The page
  header takes one row per beat and the Site Header's column ticks with it;
  rows and record parts stagger one beat, records two, and a new group waits
  three (ADR-0008).
- Each element has one entrance. Rules draw where they stay and never travel;
  parts settle 8px and nothing around them settles too. A media field's crop
  marks arrive with the field.
- The identity mark has no entrance and stays opaque at first paint, so FCP and
  LCP remain reportable.
- `animation-fill-mode: backwards`, never `both`.
- Entrances animate `translate`, not `transform`.
- `--ease-spring` carries every state change; `--notebook-ease` carries every
  entrance.
- Reduced motion zeroes all of it, and the console opens without a transition.

---

## 10. Migration checklist

- [ ] `app/theme.css` — new dot tokens, `--color-annotation`, `--font-mono`, grid pitch, `--radius: 0`; no `--color-rule-hair`, `--shadow-media-field`, `--color-media-field-highlight`
- [ ] `app/globals.css` — two-layer dot field on `body`
- [ ] `app/utilities.css` — `label` → mono; new `code`, `num`, `crop-marks`, `rule-ticked`
- [ ] `app/layout.tsx` — load Space Mono as `--font-mono-face`; mount the console; no column guides
- [ ] `components/notebook-primitives.tsx` — ticked rules, square media field with no inset highlight, crop marks, mono index/metadata/tags, record filename label
- [ ] `components/site-header.tsx` — unframed identity mark and controls
- [ ] `components/site-footer.tsx` — build stamp opposite the copyright, no top rule
- [ ] `components/work-presentation.tsx` — index/format row, square tiles, one `markRendering` table carrying each mark's width and dark-theme answer
- [ ] `components/cv.tsx`, `components/contact-list.tsx` — mono indices and values
- [ ] `components/specification-block.tsx` — new: the home sheet's four standing fields
- [ ] `components/console/` — new
- [ ] Verify: FCP/LCP still reported on every page; glass tiles still blur (not flat tint); reduced motion still lands content in place; no work tile shows a bright line along its top edge in the dark theme
