# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Primary: **engineering peers**, meaning developers and designers who notice craft. They
arrive from GitHub, LinkedIn or word of mouth, on desktop and on phones, and
they look closely. They open devtools, read the source, press keys to see what
happens, switch themes, and notice how a page paints and moves. Their job on
the site is to decide what kind of engineer Constantin is, and they judge that
from how the site behaves more than from what it says.

Hiring managers, clients and friends still visit, but they are not the audience
future decisions optimise for.

## Product Purpose

The personal portfolio of Constantin Unterkofler, a Senior Software Engineer
in Berlin at Jung von Matt TECH. It presents his identity, work, background and
contact routes as Portfolio Pages (see `CONTEXT.md` for the domain language).

Success means **the visitor remembers the craft**. The site is the main
demonstration of skill: speed, motion, accessibility and coherence are the
evidence. Contact is available but it is not the metric.

## Positioning

The site demonstrates the engineering it describes. The "designer's eye for
detail" claim in the identity is backed by working mechanisms: a Site Console
that answers the same routes as the Site Header, entrances choreographed for
paint timing, keystroke audio in the Console Banner, a rotating multilingual
Greeting, and the architectural decisions recorded in `docs/adr/`. A
neighbouring portfolio can copy the words but not these mechanisms.

## Operating Context

- Portfolio Pages: Home, About me, Work, Contact.
- The Site Console opens with `K` or from the Closing Record. It docks on
  desktop and mobile and can be dragged on desktop.
- The visitor can choose a light, dark or system theme.
- The source is public, and the console links to `github.com/conuko`, so
  the implementation is part of what gets evaluated.

## Capabilities and Constraints

- Stack: Next.js 16 (App Router; this version breaks from older conventions, see
  `AGENTS.md`), React 19 with the React Compiler, Tailwind CSS 4, Biome, Vitest.
- All Portfolio Content lives in `content/site-content.ts` and
  `content/greetings.ts`. Terminology follows `CONTEXT.md`.
- Motion is CSS only. The motion library was removed (ADR-0004, ADR-0005), and
  entrances use one beat per element (ADR-0008).
- Paint timing and page weight are guarded on purpose (ADR-0006, ADR-0007,
  font-weight budget in `app/layout.tsx`).
- There are no browser acceptance tests (ADR-0002). UI is checked on the dev
  server.
- Current title: "Senior Software Engineer" (Jung von Matt TECH, since 2026).
  Every current-role mention uses it. Earlier titles appear only as historical
  CV entries.
- The portfolio names only clients that have a Work entry.
- Work descriptions can be flagged `descriptionReview: "owner"`. The owner
  approves project copy.

## Brand Commitments

- Name: Constantin Unterkofler. Short mark: CU.
- The **Engineering Notebook** is the portfolio's canonical editorial identity:
  precise, structured records with selective human annotation. Visual
  specifics live in `DESIGN.md`.
- Voice: first person, plain and precise. It makes concrete claims about scope
  and outcome and avoids hype adjectives.
- The Greeting ("Hello, I'm" in rotating languages) and the Console Banner
  ("Hello there!") are established signatures.

## Evidence on Hand

- Eight Work entries (Fielmann, Levi's, SB Migrate, TenneT, Harrods, SCAYLE /
  ABOUT YOU, Movielingo, FIFA) with project marks in `public/marks/`.
  Movielingo intentionally reuses the SB Migrate terminal prompt because the
  project has no official logo.
- CV (work and education), the About introduction, and the Specification Block.
- Contact: email, GitHub, LinkedIn.
- Absent, and not to be fabricated: testimonials, client quotes, metrics or
  performance numbers, screenshots of client work, and clients without a Work entry.

## Product Principles

1. **The site is the proof.** Show craft through behaviour. Adjectives do not
   count as evidence.
2. **It holds up under inspection.** Every detail should survive devtools,
   keyboard-only use, reduced motion, slow networks and a read of the source.
3. **Records over self-promotion.** State facts about scope, role and outcome,
   and let the reader draw the conclusion.
4. **Enhancements add a second way in, never the only one.** The console,
   audio and motion enrich the site, but everything stays reachable without
   them.
5. **Performance is a feature.** Paint timing and bytes count as design
   decisions.

## Accessibility & Inclusion

No formal standard has been set. Established practice to preserve: skip link,
pinch zoom never disabled, `prefers-reduced-motion` honoured across motion
and the Greeting, keyboard access to the console, and the Site Console as an
optional route that is never required.
