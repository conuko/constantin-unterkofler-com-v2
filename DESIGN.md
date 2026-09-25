---
name: Constantin Unterkofler — Engineering Notebook
description: Warm paper, black ink, one annotation blue, and drafting marks instead of decoration.
colors:
  paper: "#f8f7f2"
  ink: "#111111"
  ink-muted: "rgba(17, 17, 17, 0.72)"
  rule: "rgba(17, 17, 17, 0.2)"
  dot: "rgba(17, 17, 17, 0.085)"
  dot-major: "rgba(17, 17, 17, 0.2)"
  annotation: "oklch(0.52 0.13 250)"
  card-glass: "rgba(255, 255, 255, 0.52)"
  media-field: "rgba(255, 255, 255, 0.72)"
  media-field-rule: "rgba(17, 17, 17, 0.14)"
  paper-dark: "#1a1917"
  ink-dark: "#f8f7f2"
  ink-muted-dark: "rgba(248, 247, 242, 0.72)"
  rule-dark: "rgba(248, 247, 242, 0.2)"
  dot-dark: "rgba(248, 247, 242, 0.07)"
  dot-major-dark: "rgba(248, 247, 242, 0.16)"
  annotation-dark: "oklch(0.78 0.11 250)"
  card-glass-dark: "rgba(248, 247, 242, 0.06)"
  media-field-dark: "rgba(248, 247, 242, 0.92)"
  media-field-rule-dark: "rgba(248, 247, 242, 0.28)"
  console-surface: "#15141a"
  console-chrome: "rgba(248, 247, 242, 0.05)"
  console-rule: "rgba(248, 247, 242, 0.14)"
  console-ink: "rgba(248, 247, 242, 0.82)"
  console-ink-muted: "rgba(248, 247, 242, 0.45)"
  console-output: "rgba(248, 247, 242, 0.55)"
  console-accent: "oklch(0.78 0.11 250)"
  console-command: "oklch(0.86 0.14 150)"
  console-error: "#ff7b72"
  console-light-close: "#ff5f57"
  console-light-minimize: "#febc2e"
  console-light-zoom: "#28c840"
typography:
  display:
    fontFamily: "Bebas Neue, serif"
    fontSize: "3rem"
    fontWeight: 400
    lineHeight: 1
    letterSpacing: "-0.025em"
  headline:
    fontFamily: "Bebas Neue, serif"
    fontSize: "1.875rem"
    fontWeight: 400
    lineHeight: 1.25
    letterSpacing: "-0.025em"
  title:
    fontFamily: "Bebas Neue, serif"
    fontSize: "1.5rem"
    fontWeight: 400
    lineHeight: 1
    letterSpacing: "-0.025em"
  body:
    fontFamily: "Space Grotesk, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.625
  data:
    fontFamily: "Space Mono, ui-monospace, monospace"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.625
  label:
    fontFamily: "Space Mono, ui-monospace, monospace"
    fontSize: "0.6875rem"
    fontWeight: 400
    lineHeight: 1.4
    letterSpacing: "0.12em"
  code:
    fontFamily: "Space Mono, ui-monospace, monospace"
    fontSize: "0.6875rem"
    fontWeight: 400
    lineHeight: 1.4
    letterSpacing: "0.14em"
  num:
    fontFamily: "Space Mono, ui-monospace, monospace"
    fontSize: "0.6875rem"
    fontWeight: 400
    letterSpacing: "0.06em"
    fontFeature: "tnum"
  micro:
    fontFamily: "Space Mono, ui-monospace, monospace"
    fontSize: "0.625rem"
    fontWeight: 400
    lineHeight: 1.4
    letterSpacing: "0.12em"
  console:
    fontFamily: "Space Mono, ui-monospace, monospace"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.8
rounded:
  none: "0px"
  console: "10px"
spacing:
  grid: "8px"
  grid-major: "40px"
  gutter: "24px"
  section: "44px"
  reading: "720px"
  collection: "1080px"
components:
  action-link:
    backgroundColor: "{colors.card-glass}"
    textColor: "{colors.ink-muted}"
    typography: "{typography.micro}"
    rounded: "{rounded.none}"
    padding: "8px 14px"
    height: "36px"
  action-link-hover:
    textColor: "{colors.ink}"
  console-control:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
    typography: "{typography.micro}"
    rounded: "{rounded.none}"
    padding: "10px 14px"
    height: "36px"
  media-field:
    backgroundColor: "{colors.card-glass}"
    rounded: "{rounded.none}"
    padding: "40px"
  record-row:
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    padding: "16px 0"
  record-index:
    textColor: "{colors.annotation}"
    typography: "{typography.code}"
  tag:
    textColor: "{colors.ink-muted}"
    typography: "{typography.micro}"
  wayfinding-link:
    textColor: "{colors.ink}"
    typography: "{typography.body}"
  console-window:
    backgroundColor: "{colors.console-surface}"
    textColor: "{colors.console-ink}"
    typography: "{typography.console}"
    rounded: "{rounded.console}"
---

# Design System: Constantin Unterkofler

## Overview

**Creative North Star: "The Engineering Notebook"**

The portfolio is a sheet of technical dot paper, not a page layout. Portfolio
Content is set down as records: indexed, ruled, measured and annotated in ink,
with one blue pen for the marks that measure. The model is a technical drawing,
not a bullet journal. Every line on the sheet separates, bounds or measures
something, and a line that does none of those is not drawn. Drafting tools do
the work that decoration does elsewhere: ticked rules, crop marks, dimension
lines and a monospace face for anything a reader might compare.

The notebook is dense but quiet. The paper is warm off-white in the light theme
and warm near-black in the dark, never pure white or pure black. Type does the
hierarchy work. A condensed display face names each sheet, a grotesk carries
the sentences, and its fixed-width sibling carries every index, year, filename
and measurement. Surfaces are flat and square. The Site Console is the one
exception: it is a window, not a page element, so it keeps a window's radius,
shadow and traffic lights.

Motion is part of the drawing, not an effect on top of it. The sheet registers
itself on a single 40ms beat from first paint, top to bottom, all of it in CSS.
Rules draw where they stay, parts settle 8px once, and a spring carries every
state change. Reduced motion puts everything in place from the start.

**Key Characteristics:**

- Two-layer technical dot field (8px minor, 40px major) on warm paper.
- Square by default. Crop marks replace corner radius.
- Three faces from two families: Bebas Neue, Space Grotesk and Space Mono.
- One annotation blue, used only for measurement and indices.
- Ticked rules bound things, plain hairlines separate them.
- CSS-only entrance choreography on one 40ms beat, spring-driven state changes.
- A dark, unthemed terminal window as the one rounded, shadowed object.

## Colors

The palette is paper, ink and one pen: a warm neutral pair with a single cool
annotation blue, plus a separate, unthemed console palette.

### Primary

- **Annotation Blue** (`annotation`; `annotation-dark` in the dark theme): the
  measuring pen. Record indices (`W–01`, `A–03`), section codes, dimension
  lines, stack group labels in the Specification Block, and the console prompt
  path. It never carries body copy, never fills a surface, and never stands in
  for ink.

### Neutral

- **Notebook Paper** (`paper`): the sheet. Warm off-white (#f8f7f2) in light,
  inverted to warm near-black (#1a1917) in dark. It is the body background and
  the text colour of ink-filled controls.
- **Drafting Ink** (`ink`): full-strength text, titles, focus rings, and
  anything that has become active. Rules and record rules lift to ink on hover
  and focus.
- **Faded Ink** (`ink-muted`, 72% ink): introductions, annotations, labels,
  metadata and tags. Stamps go quieter still with opacity (60% for filenames
  and the build stamp, 55% for counts).
- **Hairline** (`rule`, 20% ink): every rule, border and crop mark. It went
  from 18% to 20% so the hairline holds its own against the dot field.
- **Minor Dot / Major Dot** (`dot` 8.5% and `dot-major` 20% of ink; 7% and 16%
  in dark): the two dot layers. `dot-major` is also the text-selection
  background.
- **Glass** (`card-glass`: white 52% in light, ink 6% in dark): the tint behind
  action links, Work media fields and the mobile Site Header surface, always
  paired with the 1px glass blur.
- **Media Field** (`media-field`, `media-field-rule`): the default fill and
  border of a media field when a record does not ask for glass.

### Console

The console is one dark window in both themes. A terminal that repaints itself
for light mode stops reading as a terminal.

- **Terminal Night** (`console-surface`, #15141a): the window.
- **Terminal Ink** (`console-ink` 82%, `console-output` 55%,
  `console-ink-muted` 45% of paper): typed input, command output, chrome
  labels.
- **Prompt Blue** (`console-accent`): the working-directory path, the banner,
  and the `>_` glyph on the console control. It is the dark theme's
  annotation value.
- **Command Green** (`console-command`): command names and the block caret.
- **Error Coral** (`console-error`): error output.
- **Traffic Lights** (`console-light-close`, `-minimize`, `-zoom`): quoted from
  the macOS terminal and named for what each light does. They are raw hex
  among oklch because they are quoted, not derived.

### Greeting

The Greeting's colour is composed on the element as
`oklch(var(--greeting-lightness) var(--greeting-chroma) var(--greeting-hue))`.
The hue is random for each language and arrives inline. Lightness and chroma
belong to the theme (0.48 / 0.15 light, 0.78 / 0.13 dark), so every hue keeps
its contrast against paper.

### Named Rules

**The One Pen Rule.** Annotation Blue marks measurement and nothing else. If a
blue element is not an index, a code, a dimension or a prompt path, it should
be ink.

**The Separate Greeting Rule.** The Greeting's rotating colour is its own
system. The annotation colour never rotates, and the Greeting never borrows
Annotation Blue.

## Typography

**Display Font:** Bebas Neue (fallback: serif), regular only
**Body Font:** Space Grotesk (fallback: sans-serif)
**Data Font:** Space Mono (fallback: ui-monospace, monospace), regular only
**Console Banner Font:** the platform terminal stack (`ui-monospace`, SF Mono,
Menlo, Consolas, DejaVu Sans Mono), for block art only

**Character:** a condensed poster face for names over a pairing that is really
one design. Space Grotesk was drawn from Space Mono, with the same skeleton and
terminals, so the text face and the data face are the proportional and
fixed-width cuts of one voice, not a contrast.

### Hierarchy

- **Display** (Bebas Neue, 48px, 72px from `lg`, leading 1, -0.025em): page
  titles and Constantin's name on Home. It carries the sheet's LCP.
- **Headline** (Bebas Neue, 30px, 36px from `lg`, leading 1.25, -0.025em): the
  Greeting, written above the name inside a two-line stage so the rewrites
  never shift the layout.
- **Title** (Bebas Neue, 24px, leading 1, -0.025em): record titles, such as
  Work clients.
- **Body** (Space Grotesk, 14px, leading 1.625): introductions, annotations and
  CV entries. The page introduction's measure is capped at 720px. Wayfinding
  links run at 12px.
- **Data** (Space Mono, 14px): values a reader compares, such as Specification
  fields and contact addresses.
- **Label** (Space Mono, 11px, 0.12em, uppercase, leading 1.4): metadata, field
  labels and section headings.
- **Code** (Space Mono, 11px, 0.14em, uppercase): record indices and section
  codes, usually in Annotation Blue.
- **Num** (Space Mono, 11px, tabular figures, 0.06em): years and counts, such
  as `[04]` after a section heading.
- **Micro** (Space Mono, 10px, uppercase, label tracking): tags, sheet stamps,
  filenames, the Closing Record and control captions. 10px is the floor, and
  only for uppercase mono.
- **Console** (Space Mono, 14px, leading 1.8): terminal output, loose enough
  that a wall of mono stays scannable line by line.

### Named Rules

**The Numbers Are Monospace Rule.** Any glyph a reader might compare against
another glyph, such as an index, a year, a coordinate, a filename or a URL, is
set in Space Mono. Sentences stay in Space Grotesk.

**The Regular Cut Rule.** Only one weight of Bebas Neue and Space Mono is
loaded. `next/font` preloads every weight it is given, so a second cut is
bytes on every visit. Hierarchy comes from face, size, case and tracking, not
weight.

**The Block Art Exception.** The console banner is the only thing not set in
Space Mono. That face ships no block or box-drawing glyphs, and the browser's
per-glyph fallback breaks the column grid, so the banner uses the platform's
terminal stack instead.

## Layout

The sheet sits in a 24px gutter on every side. Content lives in one of two
centred columns under a 1080px main container. **Reading** sheets (Home, About
me, Contact) cap at 720px, and **collection** sheets (Work) take the full
1080px. The Site Header sticks to the top (28px from the top, 16px from `lg`),
and its wayfinding sits in a right-hand column on desktop. Below `lg` that
column folds into a disclosure panel. On desktop the Closing Record is fixed to
the bottom of the viewport, 32px up, and lets pointer events through except on
the console control.

Vertical rhythm is set by one section gap (44px) between the page header, each
record group and the Closing Record. Collections are one column, and two from
`md`, with 32px column and 60px row gaps (52px / 76px from `lg`). The
Specification Block is one column, and two from `sm`, with 40px between
columns. Record rows use 16px vertical padding with 24px between their inline
parts, and wrap below `sm` so the value takes its own line.

The dot field is the grid everything sits on. The minor pitch is 8px (two 4px
base units) and every fifth dot, at 40px, is heavier, so the eye can count
intervals without a printed line.

```css
background-image:
  radial-gradient(circle at 1px 1px, var(--color-dot) 0.5px, transparent 1px),
  radial-gradient(circle at 1px 1px, var(--color-dot-major) 0.9px, transparent 1.4px);
background-size:
  var(--grid-pitch) var(--grid-pitch),
  var(--grid-pitch-major) var(--grid-pitch-major);
```

### Named Rules

**The 1:5 Rule.** The minor and major dot pitch stay in a 1:5 ratio. If the
minor pitch is tuned, the major follows.

## Elevation & Depth

The notebook is flat. Depth on the sheet comes from tone and one very small
blur, not shadows. Glass surfaces are a translucent tint over the dot field
with a **1px backdrop blur** (`--blur-glass`). That radius is measured, not a
placeholder. Sampled against the dot field, 1px softens the dots to about a
third of their contrast, and the smeared dots are what reads as glass. At 3px
they are nearly gone, and from 5px up the surface collapses into flat tint. The
Site Header's mobile surface and the disclosure panel use `backdrop-blur-md`
instead, because they sit over running text, which has much coarser structure.

### Shadow Vocabulary

- **Console** (`box-shadow: 0 30px 70px -24px rgba(0, 0, 0, 0.6)`): the
  terminal window only. A long, soft drop that lifts the one window above the
  sheet.
- **Floating header** (`shadow-sm`) and **disclosure panel** (`shadow-lg`):
  Tailwind defaults, on the mobile Site Header surface and its open panel,
  which float over scrolling content.

### Named Rules

**The 1px Glass Rule.** `--blur-glass` stays at 1px. More blur on this backdrop
means less visible glass. Never raise it toward the conventional 8–12px frost.

**The No Bevel Rule.** Glass has no inset highlight. In the dark theme a
near-white top edge read as a second border stacked on the real one. A media
field is bounded by its border and marked by its crop marks, and that is
already two statements of its edge.

**The Backdrop Root Rule.** Never put `opacity` below 1, or a non-`none`
`transform`, on an ancestor of a glass surface. Either one turns it into a
Backdrop Root, and the blur renders as flat tint. Entrances ride on the glass
element itself and animate `translate`, not `transform`.

## Shapes

Square is the default (`--radius: 0`). Corners are marked, not rounded: a media
field wears **crop marks**, four corner Ls 7px long and 5px clear of the
frame, drawn as one masked pseudo-element rather than four spans. The console
window has a 10px radius, and its three traffic lights are the only other round
shapes in the system.

Lines come in three kinds, and the kind says what the line does:

- **Hairline**: 1px at Hairline colour. It separates, for example rows in a
  list or Specification fields.
- **Ticked rule**: a hairline with 7px end ticks. It bounds a record or a page
  section. It is a hairline that knows where it stops.
- **Dimension line**: an Annotation Blue rule with 9px end ticks. Annotation
  only, never structure, and at most one per page.

### Named Rules

**The Measurement Rule.** A line exists to separate, bound or measure. If it
does none of those, it comes out. Deliberately not drawn: column guides at the
reading-column edges, a rule above the Closing Record, frames on the identity
mark and header controls, and an inset highlight on media fields. A future
line quiet enough to need a fainter hairline should first ask whether it needs
to exist.

## Components

Every component composes the same small set of notebook primitives, and they
are server components with CSS-only states.

### Shared motion and interaction

- **Entrance:** CSS animations keyed off an absolute `--notebook-delay` that is
  rendered into the server HTML, so nothing waits for hydration. Every offset
  is a whole number of 40ms beats. The page header takes one row per beat and
  the Site Header's column ticks with it. Rows and record parts stagger one
  beat, records two, and a new group waits three.
- **Kinds of entrance:** parts fade and settle 8px over 320ms, introductions
  over 500ms, rules draw in place over 360ms, and titles wipe open with a clip
  over 900ms, with no fade so LCP stays reportable. All of them use
  `--notebook-ease` (`cubic-bezier(0.16, 1, 0.3, 1)`) and
  `animation-fill-mode: backwards`.
- **One entrance per element:** a record has no entrance of its own. Its rule
  draws and its parts settle, so nothing travels twice.
- **No entrance:** the identity mark (CU) is opaque at first paint and carries
  FCP.
- **State changes:** `--ease-spring`, a linear() spring that overshoots about
  6.6%, over 300ms. Records lift 2px on hover, media fields scale 1.008,
  glyph controls 1.05, framed controls 1.02, and a press scales to 0.995.
  Hover is gated behind `(hover: hover)`. Press is not, because a tap is a
  press.
- **Reduced motion:** every entrance, hover and press is zeroed, and content
  starts in place.

### Record

The unit of Portfolio Content. From top to bottom:

1. **Ticked rule**, which lifts to ink when the record has focus inside it.
2. **Index row**: the record index in Annotation Blue on the left, and the
   source filename (`levi.svg`) in Micro at 60% on the right.
3. **Media field**: square, 16:9, 40px padding (28px below `sm`), a 1px border
   and crop marks. Work records use Glass with a Hairline border. The
   primitive's default is Media Field fill with its quieter border.
4. **Title** (Display title) and **metadata** (Label, Faded Ink).
5. **Annotation**: Body in Faded Ink behind a 1px left Hairline with 14px
   inset. This is the one place the reader reads sentences.
6. **Tags**: Micro in Faded Ink, each prefixed with a `+` marker in Hairline
   colour.

**Brand marks in the dark theme.** Each Work mark takes one of three answers,
set in `markRendering` in `components/work-presentation.tsx`. Marks legible on
either ground (Levi's, FIFA, TenneT, ABOUT YOU) get nothing. Single-colour
marks (Harrods, Fielmann, SB Migrate) are re-inked with
`dark:brightness-0 dark:invert`. Marks with a brand accent (SCAYLE) get a
second cut, `darkSrc`, because a filter would invert the accent too. Both cuts
carry the real `alt`, and the hidden one is `display: none`.

### Record row

The single-line anatomy shared by CV entries and Contact routes: a plain
hairline above, then index, title, metadata and a trailing value or action.
The index is Code in Annotation Blue in a 62px column. CV years are Num,
right-aligned in a 104px column. Interactive rows lift their hairline and text
to ink on hover and focus, and external rows carry an arrow icon with
"(opens in a new tab)" for screen readers.

### Specification Block

The Home sheet's four standing fields: Role, Based, Focus and Stack. Each field
is capped with a plain hairline (it separates and does not bound), a Label in
Faded Ink, and the value in Data at full ink. Short facts are balanced so a
wrapped Role breaks at its comma. Prose fields only avoid a stranded last
word. Stack groups start on a new line with their label in Annotation Blue.
The block carries no record indices, because these are facts about
Constantin, not entries in a collection.

### Buttons and controls

- **Glyph controls** (identity mark, theme toggle, disclosure): a 36px hit box
  with no frame, because the glyph is the control. The identity mark is Code
  at 11px. The disclosure's three lines fold into a cross.
- **Action link:** square, 1px Hairline border, Glass fill with the 1px blur,
  Micro caps in Faded Ink, at least 36px tall. On hover the border and text
  lift to ink.
- **Console control:** square, ink-filled, Paper text, at least 36px tall. It
  shows the `>_` glyph in Prompt Blue, "Console", and `K` in a 35%-opacity
  hairline box. It sits in the Closing Record's right column above the build
  stamp, and its hover scale is 1.02.
- **Disabled:** a 1px dashed Hairline border with text at 40% ink.
- **Focus:** a 2px solid ink outline, offset 2px, on every focusable element.
  The console prompt is the exception and shows its own caret instead.

### Navigation

- **Wayfinding link:** Space Grotesk 12px with `underline-reveal`, a 2px
  current-colour rule that draws from the left on hover (300ms spring) and
  stays drawn on the current route. It retracts faster on the entrance curve,
  because the spring's overshoot would mirror the rule past zero.
- **Desktop:** the identity mark on the left, with the theme toggle and
  wayfinding stacked in a right-hand column.
- **Below `lg`:** the header floats on a Glass surface (Hairline border,
  `backdrop-blur-md`, `shadow-sm`). The disclosure opens a square panel,
  minimum 160px wide, in 85% Paper with a Hairline border, the same blur and
  `shadow-lg`. It stays in the DOM, and transitions carry both open and close.

### Site Console (signature component)

A terminal window mounted once at the root. It answers the same routes as the
Site Header and is a second way in, never the only one.

- **Window:** Terminal Night, a 1px Console rule border, 10px radius and the
  console shadow. On desktop it docks in the right corner (a column 45rem wide
  and `min(72vh, 40rem)` tall) or along the bottom edge. The session grows
  from a 13rem floor to `min(52vh, 26rem)` and then scrolls. On desktop the
  title bar drags the window anywhere, with a 20% elastic give past the edges,
  until it closes or a light docks it. Below `lg` it always docks to the
  bottom, measures `visualViewport` to stay clear of the software keyboard,
  and disables the dock lights (dimmed to 40%, with no dashed frame, because a
  square around a round light reads as a glitch).
- **Chrome:** three 11px lights in 20px hit boxes: red closes, amber docks to
  the bottom, green docks to the right. Hovering any light shows the macOS
  glyphs on all three. In the centre, `cu@portfolio — ~/constantin-unterkofler.com`
  in 12px mono. On the right, a "Sound on/off" toggle and `Esc`, both Micro in
  Console muted ink.
- **Body:** Console type. The prompt shows the working directory (`~` on Home,
  `~/work` elsewhere) in Prompt Blue, then `❯`. Command names are Command
  Green and output is Console output ink. The session opens on a short boot
  text: the login line with the local time of the first open, starter
  commands and key hints.
- **Banner:** "HELLO THERE!" in ANSI Shadow block capitals, in Prompt Blue.
  It is 89 columns at leading 1, sized with container units to fill the dock
  it sits in, and capped at 12px. It types itself once per page session, one
  character every 80ms after a 260ms lead-in, with a keystroke sound on every
  visible character. Typing or closing prints the rest at once, and reduced
  motion prints it whole and silently. It carries `role="img"` with the
  greeting as its label.
- **Caret:** an 8 × 16 block in Command Green on the shared `caret-blink`
  animation (1.05s, step-end), steady at 40% when unfocused. The native caret
  is transparent.
- **Scrollbar:** thin, with the thumb in Console rule colour on a transparent
  track.
- **Motion:** it opens over 380ms (`cubic-bezier(0.32, 0.72, 0, 1)`) and
  closes over 180ms, animating `translate` and opacity, never `transform`.
  Moving between docks takes 400ms.
- **Commands:** `help`, `whoami`, `home`, `about`, `work` (`--list` prints
  the record index), `contact`, `ls`, `cd` (shell-style, stays open), `theme`,
  `sound` (`on` or `off`), `source`, `clear`, `exit`. It opens with `K`
  outside a text field or with the control, and closes with `Esc`, the red
  light, the `Esc` label or the control.

### Greeting

"Hello, I'm" in one language at a time and in its own script. It is written
left to right, erased right to left, and rewritten every five seconds in a new
language and a new random hue, with a 2px caret in the current colour. It
sits in a two-line stage above the name, so the rewrites never move the name
or anything below it. A screen-reader-only paragraph carries the lead
greeting.

## Do's and Don'ts

### Do:

- **Do** keep every surface square (`--radius: 0`). Mark corners with crop
  marks when a field needs its edge stated.
- **Do** use a ticked rule where a line bounds a record or section, and a plain
  hairline where it only separates.
- **Do** set every index, year, coordinate, filename and URL in Space Mono.
- **Do** keep Annotation Blue for indices, codes, dimension lines, stack
  labels and prompt paths.
- **Do** put every entrance offset on a whole number of 40ms beats, with
  `--notebook-ease` and `animation-fill-mode: backwards`.
- **Do** animate `translate` and opacity on the element itself, and keep glass
  surfaces free of transformed or translucent ancestors.
- **Do** gate hover behind `(hover: hover)` and keep hit targets at 36px or
  more.
- **Do** give every motion a reduced-motion state in which content starts in
  place.
- **Do** keep the console dark and unthemed in both themes.

### Don't:

- **Don't** add corner radius to page elements. The console window is the only
  rounded object.
- **Don't** raise `--blur-glass` above 1px, and don't add an inset highlight
  or bevel to glass.
- **Don't** draw column guides, a rule above the Closing Record, or frames
  around the identity mark and header glyph controls.
- **Don't** use Annotation Blue for body copy, fills or emphasis, and don't
  put more than one dimension line on a page.
- **Don't** load a second weight of Bebas Neue or Space Mono.
- **Don't** give the identity mark an entrance, or fade a page title. Both
  carry paint timing.
- **Don't** use `animation-fill-mode: both`, or animate `transform` on an
  ancestor of glass.
- **Don't** set type below 10px, or use 10px for anything but uppercase mono.
- **Don't** make the console the only way to reach anything.
