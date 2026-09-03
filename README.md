# constantin-unterkofler.com

Personal portfolio of Constantin Unterkofler — Software Engineer based in Berlin, building thoughtful digital products and scalable web experiences.

## Stack

- **Framework** — [Next.js 16](https://nextjs.org) (App Router)
- **Styling** — [Tailwind CSS 4](https://tailwindcss.com)
- **Linting & Formatting** — [Biome](https://biomejs.dev)
- **Language** — TypeScript, React 19

## Getting Started

```bash
pnpm install
pnpm dev
```

Open [localhost:3000](http://localhost:3000) to view the site.

## Scripts

| Command                | Description                             |
| ---------------------- | --------------------------------------- |
| `pnpm dev`             | Start the development server            |
| `pnpm build`           | Production build                        |
| `pnpm start`           | Serve the production build              |
| `pnpm test`            | Run the fast in-process test suite      |
| `pnpm test:unit`       | Run fast in-process tests once          |
| `pnpm test:unit:watch` | Run fast in-process tests in watch mode |
| `pnpm lint`            | Run Biome checks                        |
| `pnpm format`          | Auto-format with Biome                  |
| `pnpm typecheck`       | Type-check without emitting             |

## Testing approach

This personal portfolio deliberately has no browser-automation suite. Playwright,
its browser download, configuration, and acceptance tests were removed because
their runtime and maintenance cost outweighed their value for this project.

`pnpm test` runs the remaining fast in-process checks. Use the development
server for focused visual and interaction checks when changing the UI.

## Structure

```
app/          Pages (home, about, play, read, contact)
components/   Shared UI components
content/      Site copy, CV, and content data
```
