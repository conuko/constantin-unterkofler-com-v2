# constantinunterkofler.com

Source code for my portfolio [constantinunterkofler.com](https://constantinunterkofler.com).

The site is designed as an Engineering Notebook: structured records on warm
paper, black ink, one annotation blue, and drafting marks instead of decoration.
Performance, accessibility, and motion are treated as design decisions, and the
reasoning behind them is recorded in [`docs/adr/`](docs/adr/).

## Highlights

- **Site Console.** A terminal window that reaches the same routes as the site
  header through typed commands such as `help`, `ls`, `cd work`, and `theme`.
  Press <kbd>K</kbd> to open it. Every page stays reachable without it.
- **CSS-only motion.** No animation library ships to the browser. Entrances are
  server-rendered CSS on a shared 40 ms beat and respect
  `prefers-reduced-motion`
  ([ADR-0005](docs/adr/0005-remove-motion-entirely.md),
  [ADR-0008](docs/adr/0008-one-beat-one-entrance-per-element.md)).
- **Paint timing as a constraint.** Elements that report First or Largest
  Contentful Paint never start at `opacity: 0`, and links prefetch on intent,
  not on sight
  ([ADR-0006](docs/adr/0006-introduction-fades-identity-mark-carries-paint-timing.md),
  [ADR-0007](docs/adr/0007-paint-eligible-page-title-and-prefetch-on-intent.md)).

## Stack

- [Next.js 16](https://nextjs.org) (App Router) with the React Compiler
- React 19 and TypeScript in strict mode
- [Tailwind CSS 4](https://tailwindcss.com)
- [Biome](https://biomejs.dev) for linting and formatting
- [Vitest](https://vitest.dev) for tests

## Getting started

Prerequisites: Node.js 20.9 or later and [pnpm](https://pnpm.io).

```bash
pnpm install
pnpm dev
```

Open [localhost:3000](http://localhost:3000) to view the site.

## Scripts

| Command                | Description                           |
| ---------------------- | ------------------------------------- |
| `pnpm dev`             | Start the development server          |
| `pnpm build`           | Create a production build             |
| `pnpm start`           | Serve the production build            |
| `pnpm test`            | Run the test suite once               |
| `pnpm test:unit:watch` | Run the test suite in watch mode      |
| `pnpm lint`            | Check linting and formatting          |
| `pnpm lint:fix`        | Apply safe lint and formatting fixes  |
| `pnpm format`          | Format all files                      |
| `pnpm typecheck`       | Type-check the project without output |

## Testing

`pnpm test` runs fast in-process tests with Vitest. The project has no browser
end-to-end tests by design
([ADR-0002](docs/adr/0002-remove-playwright-acceptance-tests.md)), so check UI
changes on the development server.

## Project structure

```
app/          Routes, root layout, and global styles
components/   UI components, including the Site Console in console/
content/      Site copy and content data
lib/          Hooks and framework-independent logic
tests/        Vitest tests
docs/adr/     Architecture decision records
```

## Documentation

| File                       | Contents                                       |
| -------------------------- | ---------------------------------------------- |
| [`CONTEXT.md`](CONTEXT.md) | Domain glossary used in code, issues, and ADRs |
| [`DESIGN.md`](DESIGN.md)   | Design system: color, type, layout, components |
| [`PRODUCT.md`](PRODUCT.md) | Audience, purpose, and product principles      |
| [`docs/adr/`](docs/adr/)   | Architecture decision records                  |
| [`AGENTS.md`](AGENTS.md)   | Instructions for AI coding agents              |

## License

Copyright © Constantin Unterkofler. All rights reserved. The source is public
for reference and is not licensed for reuse.
